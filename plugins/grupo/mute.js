var handler = async (m, { conn, participants, usedPrefix, command, text }) => {
  let mentionedJid = m.mentionedJid || []
  let user = mentionedJid[0] || (m.quoted && m.quoted.sender) || null

  if (!user) return conn.reply(m.chat, `❀ Debes mencionar a un usuario para silenciarlo.`, m)

  // Extraer tiempo del comando
  let time = text.match(/(\d+)([smhd])/i)
  let duration = 0
  let durationText = 'indefinidamente'

  if (time) {
    let value = parseInt(time[1])
    let unit = time[2].toLowerCase()

    switch(unit) {
      case 's':
        duration = value * 1000
        durationText = `${value} segundo${value > 1 ? 's' : ''}`
        break
      case 'm':
        duration = value * 60 * 1000
        durationText = `${value} minuto${value > 1 ? 's' : ''}`
        break
      case 'h':
        duration = value * 60 * 60 * 1000
        durationText = `${value} hora${value > 1 ? 's' : ''}`
        break
      case 'd':
        duration = value * 24 * 60 * 60 * 1000
        durationText = `${value} día${value > 1 ? 's' : ''}`
        break
    }
  }

  try {
    const groupInfo = await conn.groupMetadata(m.chat)
    const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
    const ownerBot = global.owner[0][0] + '@s.whatsapp.net'

    // Verificaciones de seguridad
    if (user === conn.user.jid) return conn.reply(m.chat, `ꕥ No puedo silenciar al bot.`, m)
    if (user === ownerGroup) return conn.reply(m.chat, `ꕥ No puedo silenciar al propietario del grupo.`, m)
    if (user === ownerBot) return conn.reply(m.chat, `ꕥ No puedo silenciar al propietario del bot.`, m)

    // Verificar si el usuario es admin
    const isAdmin = participants.find(p => p.id === user)?.admin
    if (isAdmin) return conn.reply(m.chat, `ꕥ No puedo silenciar a un administrador del grupo.`, m)

    // Inicializar estructura de datos si no existe
    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    if (!global.db.data.chats[m.chat].mutes) global.db.data.chats[m.chat].mutes = {}

    // Verificar si ya está muteado
    if (global.db.data.chats[m.chat].mutes[user]) {
      const muteData = global.db.data.chats[m.chat].mutes[user]
      const remainingTime = muteData.expiresAt ? Math.max(0, muteData.expiresAt - Date.now()) : null
      
      if (remainingTime === null) {
        return conn.reply(m.chat, `ꕥ Este usuario ya está silenciado indefinidamente.`, m)
      } else if (remainingTime > 0) {
        const timeLeft = formatTime(remainingTime)
        return conn.reply(m.chat, `ꕥ Este usuario ya está silenciado. Tiempo restante: ${timeLeft}`, m)
      }
    }

    // Registrar el mute
    global.db.data.chats[m.chat].mutes[user] = {
      mutedAt: Date.now(),
      mutedBy: m.sender,
      duration: duration,
      expiresAt: duration > 0 ? Date.now() + duration : null,
      name: await conn.getName(user).catch(() => user.split('@')[0])
    }

    // Mensaje de confirmación
    await conn.reply(m.chat, `✓ Usuario @${user.split('@')[0]} ha sido silenciado ${durationText}.\n\n_No podrá enviar mensajes en este grupo._`, m, {
      mentions: [user]
    })

    // Si hay duración, programar unmute automático
    if (duration > 0) {
      setTimeout(() => {
        if (global.db.data.chats[m.chat]?.mutes?.[user]) {
          delete global.db.data.chats[m.chat].mutes[user]
          conn.reply(m.chat, `✓ El silencio de @${user.split('@')[0]} ha expirado.`, m, {
            mentions: [user]
          }).catch(() => null)
        }
      }, duration)
    }

  } catch (e) {
    console.error('Error en mute:', e)
    conn.reply(m.chat, `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}`, m)
  }
}

// Función auxiliar para formatear tiempo
function formatTime(ms) {
  if (ms < 1000) return '0 segundos'
  
  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor((ms / (1000 * 60)) % 60)
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  
  const parts = []
  if (days > 0) parts.push(`${days} día${days > 1 ? 's' : ''}`)
  if (hours > 0) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`)
  if (minutes > 0) parts.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`)
  if (seconds > 0) parts.push(`${seconds} segundo${seconds > 1 ? 's' : ''}`)
  
  return parts.join(', ')
}

handler.help = ['mute <@user> [tiempo]']
handler.tags = ['grupo']
handler.command = ['mute', 'silenciar', 'callar']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler