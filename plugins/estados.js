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

    // Obtener los estados del usuario
    let statuses = await conn.fetchStatus(who).catch(() => null)
    
    if (!statuses || statuses.length === 0) {
      return conn.reply(m.chat, `⚠️ No se encontraron estados de este usuario o no tienes acceso a sus estados.`, m)
    }

    let downloaded = 0
    
    // Descargar cada estado
    for (let status of statuses) {
      try {
        let messageType = status.mimetype || status.type
        let stream = await downloadContentFromMessage(status, messageType?.split('/')[0] || 'image')
        
        if (!stream) continue
        
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk])
        }

        // Enviar según el tipo de contenido
        if (messageType?.includes('video') || status.type === 'video') {
          await conn.sendMessage(m.chat, { 
            video: buffer, 
            caption: status.caption || `📹 *Estado de @${who.split('@')[0]}*`,
            mentions: [who],
            mimetype: 'video/mp4' 
          }, { quoted: m })
        } else if (messageType?.includes('image') || status.type === 'image') {
          await conn.sendMessage(m.chat, { 
            image: buffer, 
            caption: status.caption || `📸 *Estado de @${who.split('@')[0]}*`,
            mentions: [who]
          }, { quoted: m })
        } else if (messageType?.includes('audio') || status.type === 'audio') {
          await conn.sendMessage(m.chat, { 
            audio: buffer, 
            mimetype: 'audio/ogg; codecs=opus', 
            ptt: status.ptt || false 
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
      return conn.reply(m.chat, `⚠️ No se pudo descargar ningún estado. El usuario puede no tener estados activos o no tienes permiso para verlos.`, m)
    }

    await m.react('✔️')
    conn.reply(m.chat, `✅ Se descargaron *${downloaded}* estado(s) de @${who.split('@')[0]}`, m, { mentions: [who] })

  } catch (e) {
    await m.react('✖️')
    console.error('Error en comando de estados:', e)
    conn.reply(m.chat, `⚠️ Se ha producido un problema al descargar los estados.\n> Usa *${usedPrefix}report* para informarlo.\n\n*Error:* ${e.message}`, m)
  }
}

handler.help = ['estados @user', 'estados <número>']
handler.tags = ['tools']
handler.command = ['estados', 'estadowp', 'getstatus', 'status2']
handler.premium = false

export default handler
