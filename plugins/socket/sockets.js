import { jidDecode } from '@whiskeysockets/baileys'
import path from 'path'
import fs from 'fs'

const linkRegex = /https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i

const handler = async (m, { conn, command, usedPrefix, text, isFernando }) => {
  // VERIFICACIÓN DE PERMISOS
  const isSocket = conn.user.jid === m.sender
  const isFernandoUser = global.fernando
    .map(v => v.replace(/\D/g, "") + "@s.whatsapp.net")
    .includes(m.sender)
  
  if (!isSocket && !isFernandoUser) {
    return m.reply(`❌ Comando *${command}* solo para Socket/Fernando.`)
  }
  
  try {
    switch (command) {
      // ============= CONFIGURACIÓN =============
      case 'self': case 'public': 
      case 'antiprivado': case 'antiprivate': 
      case 'gponly': case 'sologp': {
        const config = global.db.data.settings[conn.user.jid] || {}
        const type = command === 'self' || command === 'public' ? 'self' :
                    command.includes('antipriv') ? 'antiPrivate' : 'gponly'
        
        const action = text?.toLowerCase()
        const isEnable = config[type] || false
        
        if (action === 'on' || action === 'enable') {
          if (isEnable) return m.reply(`⚠️ Ya está activado.`)
          config[type] = true
          return m.reply(`✅ Modo *${type}* activado.`)
        }
        
        if (action === 'off' || action === 'disable') {
          if (!isEnable) return m.reply(`⚠️ Ya está desactivado.`)
          config[type] = false
          return m.reply(`✅ Modo *${type}* desactivado.`)
        }
        
        return m.reply(`⚙️ *${type.toUpperCase()}*\nEstado: ${isEnable ? '✅ ON' : '❌ OFF'}\n\nUso: ${usedPrefix}${command} on/off`)
      }
      
      // ============= GRUPOS =============
      case 'join': {
        if (!text) return m.reply(`🌐 Enlace requerido.`)
        const [, code] = text.match(linkRegex) || []
        if (!code) return m.reply(`❌ Enlace inválido.`)
        
        await m.react('🕒')
        await conn.groupAcceptInvite(code)
        await m.react('✅')
        return m.reply(`✅ Unido al grupo.`)
      }
      
      case 'salir': case 'leave': {
        const chatId = text || m.chat
        await conn.reply(chatId, `👋 Adiós!`, m)
        await conn.groupLeave(chatId)
        return m.reply(`✅ Salí del grupo.`)
      }
      
      // ============= SESIÓN =============
      case 'logout': {
        if (conn.user.jid === global.conn.user.jid) {
          return m.reply(`❌ No puedes cerrar la sesión principal.`)
        }
        
        await m.reply(`👋 Cerrando sesión...`)
        
        // Cerrar conexión
        if (conn.ws) conn.ws.close()
        
        // Eliminar sesión
        const sessionId = conn.user.jid.split('@')[0]
        const sessionPath = path.join(global.jadi, sessionId)
        
        if (fs.existsSync(sessionPath)) {
          fs.rmSync(sessionPath, { recursive: true })
        }
        
        // Remover de conns
        const index = global.conns.indexOf(conn)
        if (index > -1) global.conns.splice(index, 1)
        
        return m.reply(`✅ Sesión cerrada.`)
      }
      
      // ============= RECARGAR =============
      case 'reload': {
        await m.react('🔄')
        
        if (typeof global.reloadHandler === 'function') {
          await global.reloadHandler(true)
          await m.react('✅')
          return m.reply(`✅ Handler recargado.`)
        }
        
        return m.reply(`❌ Error recargando.`)
      }
      
      default:
        return m.reply(`❌ Comando no reconocido.`)
    }
  } catch (error) {
    console.error(error)
    return m.reply(`❌ Error: ${error.message}`)
  }
}

handler.command = [
  'self', 'public', 'antiprivate', 'gponly', 'sologp',
  'join', 'salir', 'leave', 'logout', 'reload'
]

handler.help = [
  'self on/off - Modo privado',
  'antiprivate on/off - Anti privado',
  'gponly on/off - Solo grupos',
  'join <link> - Unirse a grupo',
  'salir - Salir de grupo',
  'logout - Cerrar sesión SubBot',
  'reload - Recargar handler'
]

handler.tags = ['socket']
handler.fernando = true

export default handler