// mute-checker.js - Middleware para verificar mutes en cada mensaje
export async function all(m, { conn }) {
  // Solo para grupos
  if (!m.chat.endsWith('@g.us')) return
  // Ignorar mensajes del bot
  if (m.isBaileys) return
  // Ignorar si no hay remitente
  if (!m.sender) return
  
  try {
    // Verificar estructura de datos
    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    if (!global.db.data.chats[m.chat].mutes) global.db.data.chats[m.chat].mutes = {}
    
    const chatMutes = global.db.data.chats[m.chat].mutes
    const muteData = chatMutes[m.sender]
    
    // Si el usuario está en la lista de muteados
    if (muteData) {
      const now = Date.now()
      
      // Verificar si el mute ha expirado
      if (muteData.expiresAt && muteData.expiresAt < now) {
        // Eliminar mute expirado
        delete chatMutes[m.sender]
        return
      }
      
      // Bloquear el mensaje del usuario muteado
      try {
        // Eliminar el mensaje
        await conn.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.key.id,
            participant: m.sender
          }
        }).catch(() => null)
        
        // Notificar al usuario que está muteado (solo una vez cada 30 segundos para evitar spam)
        const lastNotification = global.muteNotif = global.muteNotif || {}
        const key = `${m.chat}_${m.sender}`
        
        if (!lastNotification[key] || (now - lastNotification[key] > 30000)) {
          let timeLeft = ''
          if (muteData.expiresAt) {
            const remaining = muteData.expiresAt - now
            timeLeft = `\nTiempo restante: ${formatTime(remaining)}`
          }
          
          await conn.sendMessage(m.chat, {
            text: `@${m.sender.split('@')[0]} está silenciado y no puede enviar mensajes.${timeLeft}`,
            mentions: [m.sender]
          }, { quoted: null }).catch(() => null)
          
          lastNotification[key] = now
        }
      } catch (e) {
        console.error('Error al bloquear mensaje de usuario muteado:', e)
      }
      
      // Detener el procesamiento del mensaje
      return true
    }
  } catch (e) {
    console.error('Error en mute-checker:', e)
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