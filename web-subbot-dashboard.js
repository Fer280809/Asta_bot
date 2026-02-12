import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cors from 'cors'
import bodyParser from 'body-parser'
import { verifyUserToken, authenticateUser, changePassword } from './lib/subbot-users.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: "*", methods: ["GET", "POST"] } })

app.use(cors())
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public', 'subbot-dashboard')))

const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const user = verifyUserToken(token)
  if (!user) return res.status(401).json({ error: 'No autorizado' })
  req.user = user
  next()
}

// Login
app.post('/api/auth/login', (req, res) => {
  const result = authenticateUser(req.body.username, req.body.password)
  if (result.success) {
    res.json({ success: true, token: result.token, user: result.user })
  } else {
    res.status(401).json({ success: false, error: result.error })
  }
})

// Obtener config
app.get('/api/config', requireAuth, (req, res) => {
  try {
    const configPath = path.join(global.jadi || 'Sessions/SubBot', req.user.jid.split('@')[0], 'config.json')
    if (!fs.existsSync(configPath)) return res.json({ success: false, error: 'No encontrado' })
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    res.json({ success: true, config })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Guardar config - SOLO CAMPOS REALES
app.post('/api/config', requireAuth, (req, res) => {
  try {
    const configPath = path.join(global.jadi || 'Sessions/SubBot', req.user.jid.split('@')[0], 'config.json')
    if (!fs.existsSync(configPath)) return res.status(404).json({ success: false, error: 'No encontrado' })
    
    const current = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    const updates = req.body
    
    // Validar campos reales de serbot.js
    const allowed = {
      name: v => typeof v === 'string' && v.length <= 30,
      prefix: v => typeof v === 'string' && v.length <= 20,
      sinprefix: v => typeof v === 'boolean',
      mode: v => ['public', 'private'].includes(v),
      antiPrivate: v => typeof v === 'boolean',
      gponly: v => typeof v === 'boolean'
    }
    
    const newConfig = { ...current }
    for (const [key, value] of Object.entries(updates)) {
      if (allowed[key] && allowed[key](value)) {
        newConfig[key] = value
      }
    }
    newConfig.updatedAt = new Date().toISOString()
    
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2))
    
    // Actualizar en memoria
    const subBot = global.activeSubBots?.get(req.user.jid)
    if (subBot?.socket) {
      subBot.socket.subConfig = newConfig
      // Aplicar a settings en tiempo real
      const settings = global.db.data.settings[req.user.jid] ||= {}
      settings.self = newConfig.mode === 'private'
      settings.antiPrivate = newConfig.antiPrivate || false
      settings.gponly = newConfig.gponly || false
    }
    
    res.json({ success: true, config: newConfig })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Stats
app.get('/api/stats', requireAuth, (req, res) => {
  const subBot = global.activeSubBots?.get(req.user.jid)
  res.json({
    success: true,
    connected: !!subBot,
    uptime: subBot ? Date.now() - subBot.connectedAt : 0,
    name: subBot?.socket?.user?.name || 'Desconectado'
  })
})

// Cambiar password
app.post('/api/password', requireAuth, (req, res) => {
  if (!req.body.newPassword || req.body.newPassword.length < 6) {
    return res.status(400).json({ success: false, error: 'Mínimo 6 caracteres' })
  }
  const result = changePassword(req.user.jid.split('@')[0], req.body.newPassword)
  res.json(result)
})

// Reiniciar
app.post('/api/restart', requireAuth, (req, res) => {
  const subBot = global.activeSubBots?.get(req.user.jid)
  if (subBot?.socket?.ws) subBot.socket.ws.close()
  res.json({ success: true, message: 'Reiniciando...' })
})

// HTML
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'subbot-dashboard', 'index.html'))
})

// Socket
io.on('connection', (socket) => {
  socket.on('auth', (token) => {
    const user = verifyUserToken(token)
    if (!user) return socket.disconnect()
    socket.join(user.jid)
    const subBot = global.activeSubBots?.get(user.jid)
    socket.emit('status', { connected: !!subBot, uptime: subBot ? Date.now() - subBot.connectedAt : 0 })
  })
})

export function startSubBotDashboard() {
  const port = process.env.DASHBOARD_PORT || 3001
  httpServer.listen(port, () => {
    console.log(`🎛️ SubBot Dashboard: http://localhost:${port}`)
  })
}
