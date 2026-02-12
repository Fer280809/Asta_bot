import { createSubBotUser, getUserByJid, changePassword } from '../../lib/subbot-users.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Solo SubBots
  if (conn.user.jid === global.conn.user.jid) {
    return m.reply('❌ Solo para SubBots')
  }

  const userId = conn.user.jid.split('@')[0]
  const existingUser = getUserByJid(conn.user.jid)

  if (command === 'vincular') {
    if (existingUser) {
      return m.reply(`⚠️ Ya tienes cuenta vinculada: ${existingUser.username}\n\n🌐 ${global.publicURL || 'http://localhost:3001'}\n\n¿Olvidaste contraseña? ${usedPrefix}recuperar <nueva>`)
    }

    if (!text) {
      return m.reply(`📋 *Vincular Cuenta*\n\nUso:\n${usedPrefix}vincular <usuario> <contraseña>\n\nEjemplo:\n${usedPrefix}vincular juan123 miPass456`)
    }

    const args = text.trim().split(/\s+/)
    if (args.length < 2) return m.reply('❌ Debes poner usuario y contraseña')

    const username = args[0]
    const password = args.slice(1).join(' ')

    if (!/^[a-zA-Z0-9_]{4,20}$/.test(username)) return m.reply('❌ Usuario: 4-20 caracteres alfanuméricos')
    if (password.length < 6) return m.reply('❌ Contraseña: mínimo 6 caracteres')

    const result = createSubBotUser(conn.user.jid, username, password, userId)

    if (result.success) {
      const url = global.publicURL || 'http://localhost:3001'
      const msg = `✅ *Cuenta Vinculada*\n\n👤 Usuario: ${username}\n🔐 Contraseña: ${password}\n🌐 ${url}\n\n⚙️ Configura tu SubBot:\n• Prefijo\n• Modo público/privado\n• Anti-privado\n• Solo grupos\n• Sin prefijo\n\n⚠️ Guarda estas credenciales.`
      
      await m.reply(msg)
      await conn.sendMessage(m.sender, { text: msg })
    } else {
      m.reply(`❌ ${result.error}`)
    }
  }

  if (command === 'recuperar') {
    if (!existingUser) return m.reply(`❌ No tienes cuenta. Usa ${usedPrefix}vincular`)
    if (!text) return m.reply(`Uso: ${usedPrefix}recuperar <nueva_contraseña>`)
    
    if (text.length < 6) return m.reply('❌ Mínimo 6 caracteres')
    
    const result = changePassword(userId, text)
    if (result.success) {
      const msg = `✅ *Contraseña Actualizada*\n\n🔐 Nueva: ${text}\n🌐 ${global.publicURL || 'http://localhost:3001'}`
      await m.reply(msg)
      await conn.sendMessage(m.sender, { text: msg })
    }
  }
}

handler.command = ['vincular', 'recuperar']
handler.tags = ['subbot']
handler.help = ['vincular <user> <pass>', 'recuperar <nueva>']
handler.private = true

export default handler
