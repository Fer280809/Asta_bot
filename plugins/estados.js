let { downloadContentFromMessage } = (await import('@whiskeysockets/baileys'))

let handler = async (m, { conn, usedPrefix, text }) => {
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

    await conn.reply(m.chat, `🔍 Buscando estados de @${who.split('@')[0]}...\n\n⏳ Por favor espera...`, m, { mentions: [who] })

    let statuses = []
    let downloaded = 0
    
    try {
      // Método 1: Buscar en el store principal
      if (conn.store?.messages) {
        const statusBroadcast = conn.store.messages['status@broadcast']
        if (statusBroadcast) {
          console.log('📱 Buscando en store.messages...')
          const msgs = Array.isArray(statusBroadcast) ? statusBroadcast : Object.values(statusBroadcast)
          statuses = msgs.filter(msg => {
            const participant = msg?.key?.participant || msg?.participant
            const timestamp = msg?.messageTimestamp
            const isRecent = timestamp && (Date.now() / 1000 - timestamp) < 86400 // 24 horas
            return participant === who && isRecent
          })
          console.log(`✅ Encontrados ${statuses.length} estados en store`)
        }
      }

      // Método 2: Buscar en chats
      if (statuses.length === 0 && conn.chats) {
        console.log('📱 Buscando en chats...')
        const statusChat = conn.chats['status@broadcast']
        if (statusChat?.messages) {
          const msgs = Array.isArray(statusChat.messages) ? statusChat.messages : Object.values(statusChat.messages)
          statuses = msgs.filter(msg => {
            const participant = msg?.key?.participant || msg?.participant
            const timestamp = msg?.messageTimestamp
            const isRecent = timestamp && (Date.now() / 1000 - timestamp) < 86400
            return participant === who && isRecent
          })
          console.log(`✅ Encontrados ${statuses.length} estados en chats`)
        }
      }

      // Método 3: Buscar directamente con loadMessages
      if (statuses.length === 0 && conn.loadMessages) {
        console.log('📱 Intentando cargar mensajes...')
        try {
          const messages = await conn.loadMessages('status@broadcast', 50)
          if (messages?.length) {
            statuses = messages.filter(msg => {
              const participant = msg?.key?.participant || msg?.participant
              const timestamp = msg?.messageTimestamp
              const isRecent = timestamp && (Date.now() / 1000 - timestamp) < 86400
              return participant === who && isRecent
            })
            console.log(`✅ Encontrados ${statuses.length} estados con loadMessages`)
          }
        } catch (e) {
          console.log('❌ Error en loadMessages:', e.message)
        }
      }

    } catch (error) {
      console.error('❌ Error obteniendo estados:', error)
    }
    
    if (!statuses || statuses.length === 0) {
      await m.react('⚠️')
      return conn.reply(m.chat, `⚠️ No se encontraron estados de @${who.split('@')[0]}.\n\n*Posibles razones:*\n• El usuario no tiene estados activos (últimas 24h)\n• El bot no puede acceder a sus estados\n• Necesitas ver sus estados primero desde WhatsApp\n• El usuario no te tiene agregado\n\n💡 *Tip:* Abre WhatsApp y revisa si puedes ver los estados de este usuario manualmente.`, m, { mentions: [who] })
    }

    console.log(`🎯 Procesando ${statuses.length} estados...`)
    
    // Descargar cada estado
    for (let i = 0; i < statuses.length; i++) {
      try {
        const status = statuses[i]
        const msg = status.message || status
        
        // Encontrar el tipo de mensaje
        let messageType = null
        let content = null
        
        for (let key of Object.keys(msg)) {
          if (['imageMessage', 'videoMessage', 'audioMessage'].includes(key)) {
            messageType = key
            content = msg[key]
            break
          }
        }
        
        if (!content || !messageType) {
          console.log(`⚠️ Estado ${i + 1}: Sin contenido multimedia`)
          continue
        }
        
        console.log(`📥 Descargando estado ${i + 1}/${statuses.length} - Tipo: ${messageType}`)
        
        // Descargar contenido
        const type = messageType.replace('Message', '')
        let stream = await downloadContentFromMessage(content, type)
        
        if (!stream) {
          console.log(`❌ Estado ${i + 1}: No se pudo crear stream`)
          continue
        }
        
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk])
        }

        if (buffer.length === 0) {
          console.log(`❌ Estado ${i + 1}: Buffer vacío`)
          continue
        }

        console.log(`✅ Estado ${i + 1}: Descargado ${buffer.length} bytes`)

        // Enviar según el tipo
        const caption = content.caption || `${type === 'video' ? '📹' : type === 'image' ? '📸' : '🎵'} *Estado de @${who.split('@')[0]}*`
        
        if (messageType === 'videoMessage') {
          await conn.sendMessage(m.chat, { 
            video: buffer, 
            caption,
            mentions: [who],
            mimetype: content.mimetype || 'video/mp4' 
          }, { quoted: m })
        } else if (messageType === 'imageMessage') {
          await conn.sendMessage(m.chat, { 
            image: buffer, 
            caption,
            mentions: [who],
            mimetype: content.mimetype || 'image/jpeg'
          }, { quoted: m })
        } else if (messageType === 'audioMessage') {
          await conn.sendMessage(m.chat, { 
            audio: buffer, 
            mimetype: content.mimetype || 'audio/ogg; codecs=opus', 
            ptt: content.ptt || false 
          }, { quoted: m })
        }
        
        downloaded++
        console.log(`✅ Estado ${i + 1}: Enviado correctamente`)
        
        // Pausa entre envíos
        await new Promise(resolve => setTimeout(resolve, 1500))
        
      } catch (err) {
        console.error(`❌ Error en estado ${i + 1}:`, err.message)
        continue
      }
    }

    if (downloaded === 0) {
      await m.react('⚠️')
      return conn.reply(m.chat, `⚠️ Se encontraron ${statuses.length} estado(s) pero no se pudieron descargar.\n\n*Esto puede pasar si:*\n• Los estados están cifrados\n• No tienes permiso de descarga\n• Hay problemas de conexión\n\n💡 Intenta de nuevo en unos momentos.`, m)
    }

    await m.react('✔️')
    conn.reply(m.chat, `✅ *Descarga completa*\n\n📊 Encontrados: ${statuses.length}\n✅ Descargados: ${downloaded}\n❌ Fallidos: ${statuses.length - downloaded}\n\n👤 Usuario: @${who.split('@')[0]}`, m, { mentions: [who] })

  } catch (e) {
    await m.react('✖️')
    console.error('❌ Error crítico en comando de estados:', e)
    conn.reply(m.chat, `⚠️ Error crítico al procesar estados.\n\n*Error:* ${e.message}\n\n> Usa *${usedPrefix}report* para reportar este problema.`, m)
  }
}

handler.help = ['estado @user', 'estado <número>']
handler.tags = ['tools']
handler.command = ['estado', 'estados', 'status2', 'estadowp', 'getstatus']
handler.premium = false

export default handler
