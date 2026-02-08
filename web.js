import express from 'express'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import cors from 'cors'
import bodyParser from 'body-parser'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { exec, spawn } from 'child_process'
import os from 'os'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
})

const PORT = process.env.PORT || 3000

// Almacenamiento de sesiones activas
const activeSessions = new Map()
const webUsers = new Map() // Usuarios web creados por owners

// Middleware
app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))
app.use(express.static(path.join(__dirname, 'public')))

// Verificar autenticación
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token
  if (!token || !activeSessions.has(token)) {
    return res.status(401).json({ error: 'No autorizado' })
  }
  req.user = activeSessions.get(token)
  next()
}

// ========== RUTAS DE AUTENTICACIÓN ==========

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  
  if (!username || !password) {
    return res.json({ success: false, error: 'Usuario y contraseña requeridos' })
  }
  
  const user = webUsers.get(username)
  if (!user || user.password !== hashPassword(password)) {
    return res.json({ success: false, error: 'Credenciales inválidas' })
  }
  
  const token = crypto.randomBytes(32).toString('hex')
  activeSessions.set(token, {
    username,
    createdBy: user.createdBy,
    createdAt: new Date(),
    lastActivity: new Date()
  })
  
  res.json({
    success: true,
    token,
    username,
    message: 'Login exitoso'
  })
})

// Verificar sesión
app.get('/api/check-session', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user })
})

// Logout
app.post('/api/logout', requireAuth, (req, res) => {
  const token = req.headers.authorization.replace('Bearer ', '')
  activeSessions.delete(token)
  res.json({ success: true })
})

// ========== RUTAS DE GESTIÓN DE ARCHIVOS ==========

// Listar archivos
app.post('/api/files/list', requireAuth, (req, res) => {
  try {
    const { path: dirPath = '.' } = req.body
    const fullPath = path.resolve(dirPath)
    
    // Prevenir directory traversal
    if (!fullPath.startsWith(process.cwd()) && !fullPath.startsWith('/')) {
      return res.status(403).json({ error: 'Acceso denegado' })
    }
    
    if (!fs.existsSync(fullPath)) {
      return res.json({ success: false, error: 'Directorio no existe' })
    }
    
    const items = fs.readdirSync(fullPath, { withFileTypes: true })
    const files = items.map(item => {
      const itemPath = path.join(fullPath, item.name)
      const stats = fs.statSync(itemPath)
      return {
        name: item.name,
        type: item.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        modified: stats.mtime,
        path: itemPath
      }
    })
    
    res.json({
      success: true,
      path: fullPath,
      files: files.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name)
        return a.type === 'directory' ? -1 : 1
      })
    })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

// Leer archivo
app.post('/api/files/read', requireAuth, (req, res) => {
  try {
    const { path: filePath } = req.body
    const fullPath = path.resolve(filePath)
    
    if (!fs.existsSync(fullPath)) {
      return res.json({ success: false, error: 'Archivo no existe' })
    }
    
    const stats = fs.statSync(fullPath)
    if (stats.size > 10 * 1024 * 1024) { // 10MB límite
      return res.json({ success: false, error: 'Archivo muy grande' })
    }
    
    const content = fs.readFileSync(fullPath, 'utf-8')
    res.json({ success: true, content, path: fullPath })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

// Guardar archivo
app.post('/api/files/save', requireAuth, (req, res) => {
  try {
    const { path: filePath, content } = req.body
    const fullPath = path.resolve(filePath)
    
    fs.writeFileSync(fullPath, content, 'utf-8')
    res.json({ success: true, message: 'Archivo guardado' })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

// Crear archivo
app.post('/api/files/create', requireAuth, (req, res) => {
  try {
    const { path: filePath, name, content = '' } = req.body
    const fullPath = path.join(path.resolve(filePath), name)
    
    if (fs.existsSync(fullPath)) {
      return res.json({ success: false, error: 'El archivo ya existe' })
    }
    
    fs.writeFileSync(fullPath, content, 'utf-8')
    res.json({ success: true, message: 'Archivo creado' })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

// Crear carpeta
app.post('/api/files/mkdir', requireAuth, (req, res) => {
  try {
    const { path: dirPath, name } = req.body
    const fullPath = path.join(path.resolve(dirPath), name)
    
    if (fs.existsSync(fullPath)) {
      return res.json({ success: false, error: 'La carpeta ya existe' })
    }
    
    fs.mkdirSync(fullPath, { recursive: true })
    res.json({ success: true, message: 'Carpeta creada' })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

// Eliminar archivo/carpeta
app.post('/api/files/delete', requireAuth, (req, res) => {
  try {
    const { paths } = req.body // Ahora acepta múltiples rutas
    const itemsToDelete = Array.isArray(paths) ? paths : [paths]
    
    const results = []
    for (const itemPath of itemsToDelete) {
      const fullPath = path.resolve(itemPath)
      
      if (!fs.existsSync(fullPath)) {
        results.push({ path: itemPath, success: false, error: 'No existe' })
        continue
      }
      
      const stats = fs.statSync(fullPath)
      if (stats.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true })
      } else {
        fs.unlinkSync(fullPath)
      }
      results.push({ path: itemPath, success: true })
    }
    
    res.json({ success: true, results })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

// Renombrar
app.post('/api/files/rename', requireAuth, (req, res) => {
  try {
    const { oldPath, newName } = req.body
    const fullOldPath = path.resolve(oldPath)
    const dir = path.dirname(fullOldPath)
    const fullNewPath = path.join(dir, newName)
    
    fs.renameSync(fullOldPath, fullNewPath)
    res.json({ success: true, message: 'Renombrado exitoso' })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

// Mover/Copiar
app.post('/api/files/move', requireAuth, (req, res) => {
  try {
    const { source, destination, copy = false } = req.body
    const fullSource = path.resolve(source)
    const fullDest = path.resolve(destination)
    
    if (copy) {
      const stats = fs.statSync(fullSource)
      if (stats.isDirectory()) {
        copyRecursive(fullSource, fullDest)
      } else {
        fs.copyFileSync(fullSource, fullDest)
      }
    } else {
      fs.renameSync(fullSource, fullDest)
    }
    
    res.json({ success: true, message: copy ? 'Copiado exitoso' : 'Movido exitoso' })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

// Subir archivo
app.post('/api/files/upload', requireAuth, (req, res) => {
  try {
    const { path: dirPath, name, content, base64 } = req.body
    const fullPath = path.join(path.resolve(dirPath), name)
    
    let fileContent
    if (base64) {
      fileContent = Buffer.from(content, 'base64')
      fs.writeFileSync(fullPath, fileContent)
    } else {
      fs.writeFileSync(fullPath, content, 'utf-8')
    }
    
    res.json({ success: true, message: 'Archivo subido' })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

// Descomprimir ZIP
app.post('/api/files/extract', requireAuth, (req, res) => {
  try {
    const { path: zipPath, destination } = req.body
    const fullZipPath = path.resolve(zipPath)
    const fullDestPath = path.resolve(destination || path.dirname(fullZipPath))
    
    // Usar unzip si está disponible, sino adm-zip
    const extract = spawn('unzip', ['-o', fullZipPath, '-d', fullDestPath])
    
    extract.on('close', (code) => {
      if (code === 0) {
        res.json({ success: true, message: 'Archivo descomprimido' })
      } else {
        res.json({ success: false, error: 'Error al descomprimir' })
      }
    })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

// Comprimir a ZIP
app.post('/api/files/compress', requireAuth, (req, res) => {
  try {
    const { paths, outputName } = req.body
    const items = Array.isArray(paths) ? paths : [paths]
    const outputPath = path.resolve(outputName || 'archive.zip')
    
    const args = ['-r', outputPath, ...items.map(p => path.basename(p))]
    const zip = spawn('zip', args, { cwd: path.dirname(items[0]) })
    
    zip.on('close', (code) => {
      if (code === 0) {
        res.json({ success: true, message: 'Archivo comprimido', path: outputPath })
      } else {
        res.json({ success: false, error: 'Error al comprimir' })
      }
    })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

// ========== RUTAS DE SISTEMA ==========

// Información de rendimiento (solo uso actual, no capacidad total)
app.get('/api/system/stats', requireAuth, (req, res) => {
  try {
    const usedMemory = process.memoryUsage()
    const cpuUsage = process.cpuUsage()
    
    // Uso de disco (solo directorio de trabajo)
    let diskUsed = 0
    try {
      const du = execSync(`du -sb "${process.cwd()}"`, { encoding: 'utf-8' })
      diskUsed = parseInt(du.split('\t')[0])
    } catch {}
    
    res.json({
      success: true,
      memory: {
        used: usedMemory.rss,
        heapUsed: usedMemory.heapUsed,
        external: usedMemory.external
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      disk: {
        used: diskUsed
      },
      uptime: process.uptime(),
      nodeVersion: process.version
    })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

// Estado del bot
app.get('/api/bot/status', requireAuth, (req, res) => {
  try {
    const isConnected = global.conn?.user ? true : false
    const subBots = global.activeSubBots ? Array.from(global.activeSubBots.keys()).length : 0
    
    res.json({
      success: true,
      connected: isConnected,
      user: isConnected ? {
        name: global.conn.user.name || global.conn.user.verifiedName,
        id: global.conn.user.id.split(':')[0]
      } : null,
      subBots,
      uptime: global.conn?.uptime ? Date.now() - global.conn.uptime : 0
    })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

// Reiniciar bot
app.post('/api/bot/restart', requireAuth, (req, res) => {
  try {
    res.json({ success: true, message: 'Reiniciando bot...' })
    
    setTimeout(() => {
      if (global.reloadHandler) {
        global.reloadHandler(true)
      }
    }, 1000)
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

// Apagar bot
app.post('/api/bot/stop', requireAuth, (req, res) => {
  try {
    res.json({ success: true, message: 'Apagando bot...' })
    
    setTimeout(() => {
      process.exit(0)
    }, 1000)
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

// ========== SOCKET.IO PARA CONSOLA EN TIEMPO REAL ==========

const activeTerminals = new Map()

io.on('connection', (socket) => {
  console.log('Cliente conectado a consola')
  
  // Autenticar socket
  socket.on('auth', (token) => {
    if (!activeSessions.has(token)) {
      socket.emit('error', 'No autorizado')
      socket.disconnect()
      return
    }
    socket.authenticated = true
    socket.emit('ready')
  })
  
  // Ejecutar comando
  socket.on('execute', (command) => {
    if (!socket.authenticated) return
    
    const execProcess = exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        socket.emit('output', { type: 'error', data: error.message })
        return
      }
      if (stdout) socket.emit('output', { type: 'stdout', data: stdout })
      if (stderr) socket.emit('output', { type: 'stderr', data: stderr })
      socket.emit('done')
    })
    
    activeTerminals.set(socket.id, execProcess)
  })
  
  // Consola interactiva (spawn)
  socket.on('spawn', (shell = 'bash') => {
    if (!socket.authenticated) return
    
    const shellProcess = spawn(shell, [], {
      cwd: process.cwd(),
      env: process.env
    })
    
    shellProcess.stdout.on('data', (data) => {
      socket.emit('output', { type: 'stdout', data: data.toString() })
    })
    
    shellProcess.stderr.on('data', (data) => {
      socket.emit('output', { type: 'stderr', data: data.toString() })
    })
    
    shellProcess.on('close', () => {
      socket.emit('closed')
    })
    
    socket.on('input', (input) => {
      shellProcess.stdin.write(input + '\n')
    })
    
    activeTerminals.set(socket.id, shellProcess)
  })
  
  socket.on('disconnect', () => {
    const process = activeTerminals.get(socket.id)
    if (process) {
      process.kill()
      activeTerminals.delete(socket.id)
    }
  })
})

// ========== FUNCIONES AUXILIARES ==========

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

function copyRecursive(src, dest) {
  const exists = fs.existsSync(src)
  const stats = exists && fs.statSync(src)
  const isDirectory = exists && stats.isDirectory()
  
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true })
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursive(path.join(src, childItemName), path.join(dest, childItemName))
    })
  } else {
    fs.copyFileSync(src, dest)
  }
}

// ========== API PARA CREAR USUARIOS DESDE WHATSAPP ==========

global.createWebUser = (username, password, createdBy) => {
  if (webUsers.has(username)) {
    return { success: false, error: 'El usuario ya existe' }
  }
  
  webUsers.set(username, {
    username,
    password: hashPassword(password),
    createdBy,
    createdAt: new Date()
  })
  
  // Guardar en archivo
  try {
    const usersData = Array.from(webUsers.entries()).map(([name, data]) => ({
      username: name,
      password: data.password,
      createdBy: data.createdBy,
      createdAt: data.createdAt
    }))
    fs.writeFileSync('./webusers.json', JSON.stringify(usersData, null, 2))
  } catch (e) {
    console.error('Error guardando usuarios:', e)
  }
  
  return { success: true, message: 'Usuario creado exitosamente' }
}

global.deleteWebUser = (username) => {
  if (!webUsers.has(username)) {
    return { success: false, error: 'Usuario no encontrado' }
  }
  
  webUsers.delete(username)
  
  // Eliminar sesiones activas de ese usuario
  for (const [token, session] of activeSessions.entries()) {
    if (session.username === username) {
      activeSessions.delete(token)
    }
  }
  
  // Guardar cambios
  try {
    const usersData = Array.from(webUsers.entries()).map(([name, data]) => ({
      username: name,
      password: data.password,
      createdBy: data.createdBy,
      createdAt: data.createdAt
    }))
    fs.writeFileSync('./webusers.json', JSON.stringify(usersData, null, 2))
  } catch (e) {
    console.error('Error guardando usuarios:', e)
  }
  
  return { success: true, message: 'Usuario eliminado' }
}

global.listWebUsers = () => {
  return Array.from(webUsers.entries()).map(([username, data]) => ({
    username,
    createdBy: data.createdBy,
    createdAt: data.createdAt
  }))
}

// Cargar usuarios guardados
try {
  if (fs.existsSync('./webusers.json')) {
    const usersData = JSON.parse(fs.readFileSync('./webusers.json', 'utf-8'))
    usersData.forEach(user => {
      webUsers.set(user.username, {
        username: user.username,
        password: user.password,
        createdBy: user.createdBy,
        createdAt: new Date(user.createdAt)
      })
    })
    console.log(`📁 ${usersData.length} usuarios web cargados`)
  }
} catch (e) {
  console.error('Error cargando usuarios:', e)
}

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// Iniciar servidor
httpServer.listen(PORT, () => {
  console.log(`🚀 AstaFile corriendo en puerto ${PORT}`)
})

export { app, io }
