import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const USERS_FILE = './subbot-users.json'

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

function generateToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + (7 * 24 * 60 * 60 * 1000) })).toString('base64url')
  const signature = crypto.createHmac('sha256', 'asta-secret-key').update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${signature}`
}

function verifyToken(token) {
  try {
    const [header, body, signature] = token.split('.')
    const expectedSig = crypto.createHmac('sha256', 'asta-secret-key').update(`${header}.${body}`).digest('base64url')
    if (signature !== expectedSig) return null
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString())
    if (payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'))
    }
  } catch (e) {
    console.error('Error cargando usuarios:', e)
  }
  return {}
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

export function createSubBotUser(jid, username, password, phoneNumber) {
  const users = loadUsers()
  const existing = Object.values(users).find(u => u.username === username)
  if (existing) {
    return { success: false, error: 'El nombre de usuario ya existe' }
  }
  
  const userId = jid.split('@')[0]
  users[userId] = {
    jid: jid,
    username: username,
    password: hashPassword(password),
    phoneNumber: phoneNumber,
    createdAt: new Date().toISOString(),
    lastLogin: null
  }
  
  saveUsers(users)
  return { success: true, userId }
}

export function authenticateUser(username, password) {
  const users = loadUsers()
  const user = Object.values(users).find(u => u.username === username)
  
  if (!user) return { success: false, error: 'Usuario no encontrado' }
  if (user.password !== hashPassword(password)) return { success: false, error: 'Contraseña incorrecta' }
  
  user.lastLogin = new Date().toISOString()
  saveUsers(users)
  
  const token = generateToken({ 
    userId: Object.keys(users).find(key => users[key].username === username),
    username: user.username,
    jid: user.jid
  })
  
  return { 
    success: true, 
    token,
    user: {
      username: user.username,
      jid: user.jid,
      phoneNumber: user.phoneNumber
    }
  }
}

export function getUserByJid(jid) {
  const users = loadUsers()
  const userId = jid.split('@')[0]
  return users[userId] || null
}

export function verifyUserToken(token) {
  const payload = verifyToken(token)
  if (!payload) return null
  const users = loadUsers()
  return users[payload.userId] || null
}

export function changePassword(userId, newPassword) {
  const users = loadUsers()
  if (!users[userId]) return { success: false, error: 'Usuario no encontrado' }
  users[userId].password = hashPassword(newPassword)
  saveUsers(users)
  return { success: true }
}
