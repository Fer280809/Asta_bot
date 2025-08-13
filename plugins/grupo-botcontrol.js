let handler = async (m, { conn, usedPrefix, command, args, isAdmin, isROwner }) => {
  // Verificar si el chat está registrado en la base de datos
  if (!(m.chat in global.db.data.chats)) {
    global.db.data.chats[m.chat] = {
      isBanned: false,
      sAutoresponder: '',
      welcome: true,
      autolevelup: false,
      autoAceptar: false,
      autosticker: false,
      autoRechazar: false,
      autoresponder: false,
      detect: true,
      antiBot: false,
      antiBot2: false,
      modoadmin: false,   
      antiLink: true,
      reaction: false,
      nsfw: false,
      antifake: false,
      delete: false,
      expired: 0, 
      antiLag: false,
      per: [],
    }
  }

  let chat = global.db.data.chats[m.chat]

  if (command === 'bot') {
    // Si no hay argumentos, mostrar estado actual
    if (args.length === 0) {
      const estado = chat.isBanned ? '❌ *Desactivado*' : '✅ *Activado*'
      const info = `
╭━━━〔 🤖 Control del Bot 〕━━━╮
┃ 💬 Un *administrador* puede:
┃ ➡️ *${usedPrefix}bot on*  → Activar
┃ ➡️ *${usedPrefix}bot off* → Desactivar
┃ 
┃ 📌 Estado actual: ${estado}
╰━━━━━━━━━━━━━━━━━━━━╯
`
      return conn.reply(m.chat, info.trim(), m)
    }

    // Verificar que sea administrador o owner
    if (!isAdmin && !isROwner) {
      return conn.reply(m.chat, `⚠️ *Solo los administradores pueden usar este comando.*`, m)
    }

    if (args[0].toLowerCase() === 'off') {
      if (chat.isBanned) {
        return conn.reply(m.chat, `⚠️ *El bot ya estaba desactivado en este grupo.*`, m)
      }
      chat.isBanned = true
      return conn.reply(m.chat, `🚫 *Bot desactivado.*\n\nEl bot ya no responderá a comandos en este grupo.\n\n💡 *Para reactivar usa:* \`${usedPrefix}bot on\``, m)
    } 
    else if (args[0].toLowerCase() === 'on') {
      if (!chat.isBanned) {
        return conn.reply(m.chat, `⚠️ *El bot ya estaba activado en este grupo.*`, m)
      }
      chat.isBanned = false
      return conn.reply(m.chat, `✅ *Bot activado.*\n\nEl bot ahora responderá a todos los comandos en este grupo.`, m)
    }
    else {
      return conn.reply(m.chat, `❌ *Argumento inválido.*\n\n*Uso correcto:*\n• \`${usedPrefix}bot on\` - Activar bot\n• \`${usedPrefix}bot off\` - Desactivar bot\n• \`${usedPrefix}bot\` - Ver estado`, m)
    }
  }
}

handler.help = ['bot', 'bot on', 'bot off']
handler.tags = ['grupo']
handler.command = ['bot']
handler.group = true

export default handler
