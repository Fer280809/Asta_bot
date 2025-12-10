var handler = async (m, { conn, usedPrefix, command }) => {
  let mentionedJid = await m.mentionedJid
  let user = mentionedJid && mentionedJid.length ? mentionedJid[0] : m.quoted && await m.quoted.sender ? await m.quoted.sender : null
  
  if (!user) return conn.reply(m.chat, `❀ Debes mencionar a un usuario para quitarle el silencio.`, m)
  
  try {
    // Verificar si el usuario está muteado
    if (!global.db.data.chats[m.chat]?.mutes?.[user]) {
      return conn.reply(m.chat, `ꕥ Este usuario no está silenciado.`, m)
    }
    
    // Remover el mute
    delete global.db.data.chats[m.chat].mutes[user]
    
    // Mensaje de confirmación
    await conn.reply(m.chat, `✓ @${user.split('@')[0]} ya puede enviar mensajes nuevamente.`, m, {
      mentions: [user]
    })
    
  } catch (e) {
    conn.reply(m.chat, `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}`, m)
  }
}

handler.help = ['unmute <@user>']
handler.tags = ['grupo']
handler.command = ['unmute', 'desmutear', 'dessilenciar']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler