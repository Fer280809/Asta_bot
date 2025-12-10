var handler = async (m, { conn }) => {
  const chatMutes = global.db.data.chats[m.chat]?.mutes || {}
  const mutedUsers = Object.keys(chatMutes)
  
  if (mutedUsers.length === 0) {
    return conn.reply(m.chat, '✓ No hay usuarios silenciados en este grupo.', m)
  }
  
  let list = '*📋 Usuarios Silenciados:*\n\n'
  for (let user of mutedUsers) {
    const data = chatMutes[user]
    const timeLeft = data.expiresAt ? `Expira: ${new Date(data.expiresAt).toLocaleString()}` : 'Indefinido'
    list += `• @${user.split('@')[0]}\n  └ ${timeLeft}\n\n`
  }
  
  conn.reply(m.chat, list, m, { mentions: mutedUsers })
}

handler.help = ['mutelist']
handler.tags = ['grupo']
handler.command = ['mutelist', 'listamute', 'muteados']
handler.admin = true
handler.group = true

export default handler