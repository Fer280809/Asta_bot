var handler = async (m, { conn }) => {
  try {
    // Verificar estructura de datos
    if (!global.db.data.chats?.[m.chat]?.mutes) {
      return conn.reply(m.chat, '✓ No hay usuarios silenciados en este grupo.', m)
    }
    
    const chatMutes = global.db.data.chats[m.chat].mutes
    const mutedUsers = Object.keys(chatMutes)
    
    // Filtrar mutes expirados
    const now = Date.now()
    for (let user of mutedUsers) {
      const muteData = chatMutes[user]
      if (muteData.expiresAt && muteData.expiresAt < now) {
        delete chatMutes[user]
      }
    }
    
    // Obtener lista actualizada
    const currentMuted = Object.keys(chatMutes)
    
    if (currentMuted.length === 0) {
      return conn.reply(m.chat, '✓ No hay usuarios silenciados en este grupo.', m)
    }
    
    let list = '📋 *USUARIOS SILENCIADOS*\n\n'
    for (let user of currentMuted) {
      const data = chatMutes[user]
      const name = data.name || user.split('@')[0]
      const mutedBy = data.mutedBy ? `@${data.mutedBy.split('@')[0]}` : 'Desconocido'
      const mutedAt = new Date(data.mutedAt).toLocaleString()
      
      if (data.expiresAt) {
        const expiresIn = data.expiresAt - now
        const timeLeft = expiresIn > 0 ? `Expira en: ${formatTime(expiresIn)}` : 'Expirado'
        list += `• @${user.split('@')[0]} (${name})\n  └ ${timeLeft}\n  └ Silenciado por: ${mutedBy}\n  └ Fecha: ${mutedAt}\n\n`
      } else {
        list += `• @${user.split('@')[0]} (${name})\n  └ Silenciado indefinidamente\n  └ Silenciado por: ${mutedBy}\n  └ Fecha: ${mutedAt}\n\n`
      }
    }
    
    conn.reply(m.chat, list, m, { mentions: currentMuted })
    
  } catch (e) {
    console.error('Error en mutelist:', e)
    conn.reply(m.chat, '⚠︎ Error al obtener la lista de silenciados.', m)
  }
}

function formatTime(ms) {
  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor((ms / (1000 * 60)) % 60)
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  
  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (seconds > 0) parts.push(`${seconds}s`)
  
  return parts.join(' ') || '0s'
}

handler.help = ['mutelist']
handler.tags = ['grupo']
handler.command = ['mutelist', 'listamute', 'muteados']
handler.admin = true
handler.group = true

export default handler