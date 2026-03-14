let proposals = {}

/**
 * Handler de matrimonio
 * Permite proponer, aceptar y divorciar usuarios
 */
let handler = async (m, { conn, command, args }) => {
  try {
    const sender = m.sender
    const mentionedUser = m.mentionedJid && m.mentionedJid[0] 
      ? m.mentionedJid[0] 
      : m.quoted?.sender

    if (!mentionedUser) {
      return conn.reply(m.chat, 
        `❌ *Debes mencionar a un usuario o responder a su mensaje para proponer o aceptar matrimonio.*
        
Ejemplo » *#marry @usuario* o responde a un mensaje con *#marry*`, 
        m
      )
    }

    if (mentionedUser === sender) {
      return conn.reply(m.chat, '⚠️ No puedes proponerte matrimonio a ti mismo.', m)
    }

    const senderData = global.db.data.users[sender]
    const targetData = global.db.data.users[mentionedUser]

    // Si ya están casados
    if (senderData.marry === mentionedUser) {
      return conn.reply(m.chat, `💖 Ya estás casado/a con *${targetData.name}*`, m)
    }

    // Si el usuario objetivo ya tiene propuesta pendiente del remitente
    if (proposals[mentionedUser] && proposals[mentionedUser] === sender) {
      // Confirmar matrimonio
      delete proposals[mentionedUser]
      senderData.marry = mentionedUser
      targetData.marry = sender

      return conn.reply(m.chat,
        `💍 *¡Felicidades!* 💍
─────────────────
👰 Esposo/a: *${senderData.name}*
🤵 Esposo/a: *${targetData.name}*
─────────────────
🎉 ¡Se han casado! Que disfruten su luna de miel. 🥂
💌 `, m
      )
    } else {
      // Crear propuesta
      proposals[sender] = mentionedUser
      setTimeout(() => {
        if (proposals[sender] === mentionedUser) delete proposals[sender]
      }, 2 * 60 * 1000) // Expira en 2 minutos

      return conn.reply(m.chat, 
        `💌 *Propuesta de Matrimonio* 💌
─────────────────
✨ *${senderData.name}* te ha propuesto matrimonio, *${targetData.name}*.
⚘ Responde con: ● *#marry* para aceptar.
⏳ La propuesta expirará en 2 minutos.
─────────────────
💖 ¡Que viva el amor!`, 
        m
      )
    }

  } catch (error) {
    console.error(error)
    return conn.reply(m.chat, `⚠️ Se ha producido un problema.\n> Usa *#report* para informarlo.\n\n${error.message}`, m)
  }
}

// Configuración del handler
handler.tags = ['fun']
handler.command = ['marry', 'divorce']
handler.help = ['marry', 'divorce']
handler.owner = false
handler.reg = true

export default handler
