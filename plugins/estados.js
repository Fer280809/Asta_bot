let { downloadContentFromMessage } = (await import('@whiskeysockets/baileys'))

let handler = async (m, { conn, usedPrefix, text, args }) => {
  try {
    await m.react('🕒')
    
    // Obtener el número del usuario mencionado o del argumento
    let who = m.mentionedJid && m.mentionedJid[0] 
      ? m.mentionedJid[0] 
      : m.quoted 
        ? m.quoted.sender 
        : text 
          ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
          : null

    if (!who) {
      return conn.reply(m.chat, `❀ Por favor, menciona a un usuario, responde a su mensaje o escribe su número.\n\n*Ejemplo:*\n• ${usedPrefix}estado @usuario\n• ${usedPrefix}estado 52xxxxxxxxxx\n• Responde a un mensaje del usuario`, m)
    }

    // Obtener los estados del usuario desde el objeto de conexión
    let statuses = []
    
    try {
      // Intentar obtener estados de diferentes maneras
      if (conn.fetchStatus) {
        statuses = await conn.fetchStatus(who).catch(() => [])
      }
      
      // Método alternativo: buscar en el store de estados
      if ((!statuses || statuses.length === 0) && conn.store) {
        const statusStore = conn.store.messages['status@broadcast']
        if (statusStore) {
          const userStatuses = Object.values(statusStore)
            .filter(msg => msg.key?.participant === who)
            .filter(msg => msg.messageTimestamp && (Date.now() - msg.messageTimestamp * 1000) < 86400000) // Estados de últimas 24h
          statuses = userStatuses
        }
      }

      // Método alternativo 2: buscar directamente en mensajes
      if ((!statuses || statuses.length === 0) && conn.chats) {
        const statusChat = conn.chats['status@broadcast']
        if (statusChat && statusChat.messages) {
          const userStatuses = Object.values(statusChat.messages)
            .filter(msg => msg.key?.participant === who)
            .filter(msg => msg.messageTimestamp && (Date.now() - msg.messageTimestamp * 1000) < 86400000)
          statuses = userStatuses
        }
      }
      
    } catch (error) {
      console.error('Error obteniendo estados:', error)
    }
    
    if (!statuses || statuses.length === 0) {
      await m.react('⚠️')
      return conn.reply(m.chat, `⚠️ No se encontraron estados de @${who.split('@')[0]}.\n\n*Posibles razones:*\n• El usuario no tiene estados activos\n• Los estados expiraron (duran 24h)\n• No tienes permiso para ver sus estados\n• El bot no está suscrito a sus estados`, m, { mentions: [who] })
    }

    let downloaded = 0
    
    // Descargar cada estado
    for (let status of statuses) {
      try {
        // Obtener el mensaje del estado
        let msg = status.message || status
        let messageType = Object.keys(msg)[0]
        let content = msg[messageType]
        
        if (!content) continue
        
        // Descargar contenido según el tipo
        let stream
        if (messageType === 'imageMessage') {
          stream = await downloadContentFromMessage(content, 'image')
        } else if (messageType === 'videoMessage') {
          stream = await downloadContentFromMessage(content, 'video')
        } else if (messageType === 'audioMessage') {
          stream = await downloadContentFromMessage(content, 'audio')
        } else {
          continue
        }
        
        if (!stream) continue
        
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk])
        }

        // Enviar según el tipo de contenido
        if (messageType === 'videoMessage') {
          await conn.sendMessage(m.chat, { 
            video: buffer, 
            caption: content.caption || `📹 *Estado de @${who.split('@')[0]}*`,
            mentions: [who],
            mimetype: 'video/mp4' 
          }, { quoted: m })
        } else if (messageType === 'imageMessage') {
          await conn.sendMessage(m.chat, { 
            image: buffer, 
            caption: content.caption || `📸 *Estado de @${who.split('@')[0]}*`,
            mentions: [who]
          }, { quoted: m })
        } else if (messageType === 'audioMessage') {
          await conn.sendMessage(m.chat, { 
            audio: buffer, 
            mimetype: 'audio/ogg; codecs=opus', 
            ptt: content.ptt || false 
          }, { quoted: m })
        }
        
        downloaded++
        
        // Pequeña pausa entre envíos para evitar spam
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (err) {
        console.error(`Error descargando estado individual:`, err)
        continue
      }
    }

    if (downloaded === 0) {
      await m.react('⚠️')
      return conn.reply(m.chat, `⚠️ No se pudo descargar ningún estado de @${who.split('@')[0]}.\n\n*Nota:* Los estados deben ser visibles para el bot y estar activos (menos de 24h).`, m, { mentions: [who] })
    }

    await m.react('✔️')
    conn.reply(m.chat, `✅ Se descargaron *${downloaded}* estado(s) de @${who.split('@')[0]}`, m, { mentions: [who] })

  } catch (e) {
    await m.react('✖️')
    console.error('Error en comando de estados:', e)
    conn.reply(m.chat, `⚠️ Se ha producido un problema al descargar los estados.\n> Usa *${usedPrefix}report* para informarlo.\n\n*Error:* ${e.message}`, m)
  }
}

handler.help = ['estado @user', 'estado <número>']
handler.tags = ['tools']
handler.command = ['estado', 'estados', 'status2', 'estadowp', 'getstatus']
handler.premium = false

export default handler
