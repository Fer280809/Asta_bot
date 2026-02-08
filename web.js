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
import { performance } from 'perf_hooks'

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
const webUsers = new Map()
const systemLogs = []
const botStats = {
  messages: 0,
  commands: 0,
  users: new Set(),
  groups: new Set(),
  startTime: Date.now()
}

// Middleware
app.use(cors())
app.use(bodyParser.json({ limit: '100mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }))
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

// ========== RUTAS NUEVAS MEJORADAS ==========

// Información del sistema extendida
app.get('/api/system/info', requireAuth, (req, res) => {
  try {
    const pluginsCount = global.plugins ? Object.keys(global.plugins).length : 0
    const sessionsCount = activeSessions.size
    const chatsCount = global.conn?.chats ? Object.keys(global.conn.chats).length : 0
    
    res.json({
      success: true,
      plugins: pluginsCount,
      sessions: sessionsCount,
      chats: chatsCount,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cpuCount: os.cpus().length,
      totalMemory: formatBytes(os.totalmem()),
      freeMemory: formatBytes(os.freemem())
    })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

// Logs del sistema
app.get('/api/system/logs', requireAuth, (req, res) => {
  try {
    res.json({
      success: true,
      logs: systemLogs.slice(-100) // Últimos 100 logs
    })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

// Iniciar bot
app.post('/api/bot/start', requireAuth, (req, res) => {
  try {
    if (global.conn?.user) {
      return res.json({ 
        success: false, 
        error: 'El bot ya está en funcionamiento' 
      })
    }
    
    systemLogs.push({
      message: 'Bot iniciado manualmente desde el panel web',
      type: 'info',
      timestamp: new Date()
    })
    
    res.json({ 
      success: true, 
      message: 'Bot iniciado exitosamente',
      timestamp: new Date()
    })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

// Estadísticas del bot
app.get('/api/bot/stats', requireAuth, (req, res) => {
  try {
    res.json({
      success: true,
      stats: {
        ...botStats,
        uniqueUsers: botStats.users.size,
        activeGroups: botStats.groups.size
      }
    })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

// Información de almacenamiento detallada
app.get('/api/system/storage', requireAuth, (req, res) => {
  try {
    const cwd = process.cwd()
    const diskInfo = getDiskUsage(cwd)
    
    res.json({
      success: true,
      current: diskInfo,
      partitions: getPartitionsInfo()
    })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

// ========== FUNCIONES AUXILIARES MEJORADAS ==========

function getDiskUsage(dir) {
  try {
    let totalSize = 0
    let fileCount = 0
    let dirCount = 0
    
    function scan(currentPath) {
      const items = fs.readdirSync(currentPath, { withFileTypes: true })
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item.name)
        
        try {
          if (item.isDirectory()) {
            dirCount++
            scan(fullPath)
          } else {
            fileCount++
            const stats = fs.statSync(fullPath)
            totalSize += stats.size
          }
        } catch (err) {
          // Ignorar errores de permisos
        }
      }
    }
    
    scan(dir)
    
    return {
      total: totalSize,
      files: fileCount,
      directories: dirCount,
      readable: formatBytes(totalSize)
    }
  } catch (error) {
    return { total: 0, files: 0, directories: 0, readable: '0 B' }
  }
}

function getPartitionsInfo() {
  try {
    const partitions = []
    
    if (process.platform === 'win32') {
      const drives = execSync('wmic logicaldisk get size,freespace,caption', { encoding: 'utf-8' })
      const lines = drives.split('\n').filter(line => line.trim())
      
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(/\s+/).filter(p => p)
        if (parts.length >= 3) {
          const total = parseInt(parts[1]) || 0
          const free = parseInt(parts[2]) || 0
          const used = total - free
          
          partitions.push({
            drive: parts[0],
            total: formatBytes(total),
            used: formatBytes(used),
            free: formatBytes(free),
            percentage: total > 0 ? ((used / total) * 100).toFixed(1) : 0
          })
        }
      }
    } else {
      const df = execSync('df -h', { encoding: 'utf-8' })
      const lines = df.split('\n').filter(line => line.trim())
      
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(/\s+/).filter(p => p)
        if (parts.length >= 6) {
          partitions.push({
            filesystem: parts[0],
            size: parts[1],
            used: parts[2],
            available: parts[3],
            percentage: parts[4],
            mount: parts[5]
          })
        }
      }
    }
    
    return partitions
  } catch (error) {
    return []
  }
}

function formatBytes(bytes) {
  if (typeof bytes !== 'number') return '0 B'
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Actualizar stats del bot en tiempo real
global.updateBotStats = (data) => {
  if (data.message) botStats.messages++
  if (data.command) botStats.commands++
  if (data.userId) botStats.users.add(data.userId)
  if (data.groupId) botStats.groups.add(data.groupId)
  
  // Emitir actualización a todos los clientes conectados
  io.emit('stats', {
    messages: botStats.messages,
    commands: botStats.commands,
    uniqueUsers: botStats.users.size,
    activeGroups: botStats.groups.size
  })
}

// ========== SOCKET.IO MEJORADO ==========

const activeTerminals = new Map()
const commandHistory = {}

io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado a WebSocket')
  
  // Autenticar socket
  socket.on('auth', (token) => {
    if (!activeSessions.has(token)) {
      socket.emit('error', 'No autorizado')
      socket.disconnect()
      return
    }
    socket.authenticated = true
    socket.user = activeSessions.get(token)
    socket.emit('ready')
    
    // Enviar logs iniciales
    socket.emit('log', {
      type: 'info',
      message: `Bienvenido ${socket.user.username}!`
    })
  })
  
  // Ejecutar comando con mejor manejo
  socket.on('execute', (command) => {
    if (!socket.authenticated) return
    
    const startTime = performance.now()
    
    const execProcess = exec(command, { 
      cwd: process.cwd(),
      maxBuffer: 10 * 1024 * 1024 // 10MB
    }, (error, stdout, stderr) => {
      const endTime = performance.now()
      const duration = (endTime - startTime).toFixed(2)
      
      if (error) {
        socket.emit('output', { 
          type: 'error', 
          data: `Error (${duration}ms): ${error.message}` 
        })
        return
      }
      
      if (stdout) {
        socket.emit('output', { 
          type: 'stdout', 
          data: `✓ Completado (${duration}ms)\n${stdout}` 
        })
      }
      
      if (stderr) {
        socket.emit('output', { 
          type: 'stderr', 
          data: `⚠ Advertencia:\n${stderr}` 
        })
      }
      
      socket.emit('done')
    })
    
    activeTerminals.set(socket.id, execProcess)
    
    // Guardar en historial
    if (!commandHistory[socket.user.username]) {
      commandHistory[socket.user.username] = []
    }
    commandHistory[socket.user.username].push({
      command,
      timestamp: new Date(),
      user: socket.user.username
    })
  })
  
  // Consola interactiva mejorada
  socket.on('spawn', (shell = process.platform === 'win32' ? 'cmd' : 'bash') => {
    if (!socket.authenticated) return
    
    const shellProcess = spawn(shell, [], {
      cwd: process.cwd(),
      env: { ...process.env, TERM: 'xterm-256color' },
      stdio: ['pipe', 'pipe', 'pipe']
    })
    
    shellProcess.stdout.on('data', (data) => {
      socket.emit('output', { 
        type: 'stdout', 
        data: data.toString() 
      })
    })
    
    shellProcess.stderr.on('data', (data) => {
      socket.emit('output', { 
        type: 'stderr', 
        data: data.toString() 
      })
    })
    
    shellProcess.on('close', (code) => {
      socket.emit('closed', { code })
    })
    
    shellProcess.on('error', (err) => {
      socket.emit('output', { 
        type: 'error', 
        data: `Error del shell: ${err.message}` 
      })
    })
    
    socket.on('input', (input) => {
      shellProcess.stdin.write(input + '\n')
    })
    
    activeTerminals.set(socket.id, shellProcess)
    
    socket.emit('output', { 
      type: 'info', 
      data: `Shell ${shell} iniciado. Escribe 'exit' para salir.` 
    })
  })
  
  // Comandos especiales del bot
  socket.on('bot:command', (data) => {
    if (!socket.authenticated) return
    
    const { command, args } = data
    
    switch(command) {
      case 'reload':
        if (global.reloadHandler) {
          global.reloadHandler()
          socket.emit('output', { 
            type: 'success', 
            data: 'Bot recargado exitosamente' 
          })
        }
        break
        
      case 'broadcast':
        // Aquí iría la lógica para enviar mensajes a todos los chats
        socket.emit('output', { 
          type: 'info', 
          data: 'Función de broadcast no implementada' 
        })
        break
        
      default:
        socket.emit('output', { 
          type: 'error', 
          data: `Comando no reconocido: ${command}` 
        })
    }
  })
  
  socket.on('disconnect', () => {
    const process = activeTerminals.get(socket.id)
    if (process) {
      process.kill()
      activeTerminals.delete(socket.id)
    }
  })
})

// ========== RUTAS DE ARCHIVOS MEJORADAS ==========

// Explorador de archivos con paginación
app.post('/api/files/explore', requireAuth, (req, res) => {
  try {
    const { path: dirPath = '.', page = 1, limit = 50 } = req.body
    const fullPath = path.resolve(dirPath)
    
    // Seguridad
    if (!fullPath.startsWith(process.cwd())) {
      return res.status(403).json({ error: 'Acceso denegado' })
    }
    
    if (!fs.existsSync(fullPath)) {
      return res.json({ success: false, error: 'Directorio no existe' })
    }
    
    const items = fs.readdirSync(fullPath, { withFileTypes: true })
    const total = items.length
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedItems = items.slice(start, end)
    
    const files = paginatedItems.map(item => {
      const itemPath = path.join(fullPath, item.name)
      try {
        const stats = fs.statSync(itemPath)
        return {
          name: item.name,
          type: item.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          modified: stats.mtime,
          created: stats.birthtime,
          permissions: stats.mode.toString(8),
          path: itemPath,
          extension: path.extname(item.name).toLowerCase()
        }
      } catch (error) {
        return {
          name: item.name,
          type: 'unknown',
          size: 0,
          modified: new Date(),
          error: error.message
        }
      }
    })
    
    res.json({
      success: true,
      path: fullPath,
      files: files.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name)
        return a.type === 'directory' ? -1 : 1
      }),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

// Buscar archivos
app.post('/api/files/search', requireAuth, (req, res) => {
  try {
    const { query, path: searchPath = '.' } = req.body
    const fullPath = path.resolve(searchPath)
    
    if (!query || query.length < 2) {
      return res.json({ success: false, error: 'Query muy corta' })
    }
    
    const results = []
    
    function searchRecursive(currentPath) {
      try {
        const items = fs.readdirSync(currentPath, { withFileTypes: true })
        
        for (const item of items) {
          const itemPath = path.join(currentPath, item.name)
          
          if (item.name.toLowerCase().includes(query.toLowerCase())) {
            try {
              const stats = fs.statSync(itemPath)
              results.push({
                name: item.name,
                type: item.isDirectory() ? 'directory' : 'file',
                size: stats.size,
                modified: stats.mtime,
                path: itemPath,
                relativePath: path.relative(fullPath, itemPath)
              })
            } catch (error) {
              // Ignorar errores
            }
          }
          
          if (item.isDirectory()) {
            searchRecursive(itemPath)
          }
        }
      } catch (error) {
        // Ignorar errores de permisos
      }
    }
    
    searchRecursive(fullPath)
    
    res.json({
      success: true,
      query,
      results: results.slice(0, 100), // Limitar resultados
      count: results.length
    })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

// Obtener información detallada de un archivo
app.post('/api/files/info', requireAuth, (req, res) => {
  try {
    const { path: filePath } = req.body
    const fullPath = path.resolve(filePath)
    
    if (!fs.existsSync(fullPath)) {
      return res.json({ success: false, error: 'Archivo no existe' })
    }
    
    const stats = fs.statSync(fullPath)
    const isBinary = checkIfBinary(fullPath)
    
    let preview = null
    if (stats.size < 1024 * 100) { // Solo archivos menores a 100KB
      try {
        const content = fs.readFileSync(fullPath, 'utf-8')
        if (!isBinary) {
          preview = content.split('\n').slice(0, 20).join('\n')
        }
      } catch (error) {
        preview = '[Contenido binario o no legible]'
      }
    }
    
    res.json({
      success: true,
      info: {
        name: path.basename(fullPath),
        path: fullPath,
        size: stats.size,
        sizeReadable: formatBytes(stats.size),
        type: stats.isDirectory() ? 'directory' : 'file',
        isBinary,
        modified: stats.mtime,
        created: stats.birthtime,
        accessed: stats.atime,
        permissions: stats.mode.toString(8),
        inode: stats.ino,
        uid: stats.uid,
        gid: stats.gid,
        preview
      }
    })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

function checkIfBinary(filePath) {
  try {
    const buffer = fs.readFileSync(filePath)
    // Verificar si contiene caracteres no imprimibles
    for (let i = 0; i < Math.min(buffer.length, 1000); i++) {
      if (buffer[i] === 0) return true // Null byte = binario
      if (buffer[i] < 32 && buffer[i] !== 9 && buffer[i] !== 10 && buffer[i] !== 13) {
        return true // Carácter de control no común en texto
      }
    }
    return false
  } catch (error) {
    return true
  }
}

// ========== INICIALIZACIÓN ==========

// Función para agregar logs del sistema
global.addSystemLog = (message, type = 'info') => {
  const logEntry = {
    message,
    type,
    timestamp: new Date(),
    source: 'system'
  }
  
  systemLogs.push(logEntry)
  
  // Limitar logs a 1000 entradas
  if (systemLogs.length > 1000) {
    systemLogs.splice(0, systemLogs.length - 1000)
  }
  
  // Emitir a todos los clientes conectados
  io.emit('log', logEntry)
}

// Cargar usuarios al inicio
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
  console.log(`🚀 AstaFile Pro corriendo en puerto ${PORT}`)
  console.log(`🔗 http://localhost:${PORT}`)
  
  // Agregar log inicial
  global.addSystemLog('Servidor AstaFile iniciado', 'success')
})

export { app, io }