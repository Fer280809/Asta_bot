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
          : m.sender // Si no hay nada, usa el propio usuario

    await conn.reply(m.chat, `🔍 Buscando estados de @${who.split('@')[0]}...\n\n⏳ Esto puede tardar unos segundos...`, m, { mentions: [who] })

    let downloaded = 0
    let errors = []
    
    // Método DIRECTO: Acceder a todos los mensajes disponibles y buscar estados
    let allStatuses = []
    
    try {
      // Buscar en TODAS las estructuras posibles del bot
      const possiblePaths = [
        conn.store?.messages?.['status@broadcast'],
        conn.chats?.['status@broadcast']?.messages,
        conn.messages?.['status@broadcast'],
        global.store?.messages?.['status@broadcast'],
        global.db?.data?.chats?.['status@broadcast']?.messages
      ]
      
      for (let path of possiblePaths) {
        if (!path) continue
        
        try {
          const messages = Array.isArray(path) ? path : Object.values(path)
          if (messages && messages.length > 0) {
            console.log(`📦 Encontrada estructura con ${messages.length} mensajes`)
            allStatuses.push(...messages)
          }
        } catch (e) {
          continue
        }
      }
      
      // Si aún no hay estados, intentar cargarlos
      if (allStatuses.length === 0) {
        console.log('🔄 Intentando cargar estados manualmente...')
        try {
          if (typeof conn.loadMessages === 'function') {
            const loaded = await conn.loadMessages('status@broadcast', 100)
            if (loaded) allStatuses.push(...loaded)
          }
        } catch (e) {
          console.log('Error cargando mensajes:', e.message)
        }
      }

    } catch (error) {
      console.error('Error buscando estructuras:', error)
    }
    
    console.log(`📊 Total de mensajes encontrados: ${allStatuses.length}`)
    
    // Filtrar por usuario y fecha
    const userStatuses = allStatuses.filter(msg => {
      try {
        const participant = msg?.key?.participant || msg?.participant || msg?.sender
        const timestamp = msg?.messageTimestamp || msg?.timestamp
        
        if (!participant) return false
        
        // Verificar si es del usuario correcto
        const isUser = participant === who || participant.includes(who.split('@')[0])
        
        // Verificar si es reciente (últimas 48 horas para dar más margen)
        const isRecent = !timestamp || (Date.now() / 1000 - timestamp) < 172800
        
        return isUser && isRecent
      } catch (e) {
        return false
      }
    })
    
    console.log(`👤 Estados del usuario ${who}: ${userStatuses.length}`)
    
    if (userStatuses.length === 0) {
      await m.react('ℹ️')
      return conn.reply(m.chat, `ℹ️ *No se encontraron estados recientes*\n\n👤 Usuario: @${who.split('@')[0]}\n\n*Nota:* Este comando funciona mejor si:\n• Ves los estados del usuario primero\n• El bot tiene guardados los estados en caché\n• Los estados tienen menos de 24 horas\n\n💡 *Consejo:* Intenta ver los estados de este usuario desde tu WhatsApp y luego ejecuta el comando nuevamente.`, m, { mentions: [who] })
    }

    // Intentar descargar cada estado
    for (let i = 0; i < userStatuses.length; i++) {
      try {
        const status = userStatuses[i]
        const msg = status.message || status.msg || status
        
        if (!msg || typeof msg !== 'object') {
          errors.push(`Estado ${i + 1}: Estructura de mensaje inválida`)
          continue
        }
        
        // Buscar contenido multimedia
        let mediaMessage = null
        let mediaType = null
        
        const mediaTypes = {
          'imageMessage': 'image',
          'videoMessage': 'video',
          'audioMessage': 'audio'
        }
        
        for (let [msgType, downloadType] of Object.entries(mediaTypes)) {
          if (msg[msgType]) {
            mediaMessage = msg[msgType]
            mediaType = downloadType
            break
          }
        }
        
        if (!mediaMessage) {
          errors.push(`Estado ${i + 1}: Sin contenido multimedia (probablemente solo texto)`)
          continue
        }
        
        console.log(`📥 Descargando estado ${i + 1}: ${mediaType}`)
        
        // Importar baileys dinámicamente por si acaso
        const { downloadContentFromMessage } = await import('@whiskeysockets/baileys')
        
        // Descargar el contenido
        const stream = await downloadContentFromMessage(mediaMessage, mediaType)
        
        if (!stream) {
          errors.push(`Estado ${i + 1}: No se pudo crear stream de descarga`)
          continue
        }
        
        // Convertir stream a buffer
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk])
        }

        if (buffer.length === 0) {
          errors.push(`Estado ${i + 1}: Buffer vacío después de descarga`)
          continue
        }

        console.log(`✅ Descargado: ${buffer.length} bytes`)

        // Preparar caption
        const caption = mediaMessage.caption || `${mediaType === 'video' ? '📹' : mediaType === 'image' ? '📸' : '🎵'} Estado de @${who.split('@')[0]}`
        
        // Enviar según el tipo
        try {
          if (mediaType === 'video') {
            await conn.sendMessage(m.chat, { 
              video: buffer, 
              caption,
              mentions: [who],
              mimetype: mediaMessage.mimetype || 'video/mp4' 
            }, { quoted: m })
          } else if (mediaType === 'image') {
            await conn.sendMessage(m.chat, { 
              image: buffer, 
              caption,
              mentions: [who],
              mimetype: mediaMessage.mimetype || 'image/jpeg'
            }, { quoted: m })
          } else if (mediaType === 'audio') {
            await conn.sendMessage(m.chat, { 
              audio: buffer, 
              mimetype: mediaMessage.mimetype || 'audio/ogg; codecs=opus', 
              ptt: mediaMessage.ptt || false 
            }, { quoted: m })
          }
          
          downloaded++
          console.log(`✅ Enviado estado ${i + 1}`)
          
          // Pausa entre envíos
          await new Promise(resolve => setTimeout(resolve, 2000))
          
        } catch (sendError) {
          errors.push(`Estado ${i + 1}: Error al enviar - ${sendError.message}`)
          console.error('Error enviando:', sendError)
        }
        
      } catch (err) {
        errors.push(`Estado ${i + 1}: ${err.message}`)
        console.error(`Error procesando estado ${i + 1}:`, err)
        continue
      }
    }

    // Respuesta final
    await m.react(downloaded > 0 ? '✔️' : 'ℹ️')
    
    let finalMsg = `📊 *REPORTE DE DESCARGA*\n\n`
    finalMsg += `👤 Usuario: @${who.split('@')[0]}\n`
    finalMsg += `📱 Estados encontrados: ${userStatuses.length}\n`
    finalMsg += `✅ Descargados exitosamente: ${downloaded}\n`
    finalMsg += `❌ No descargados: ${userStatuses.length - downloaded}\n\n`
    
    if (downloaded === 0) {
      finalMsg += `⚠️ *No se pudo descargar ningún estado*\n\n`
      finalMsg += `*Posibles razones:*\n`
      finalMsg += `• Los estados solo contienen texto\n`
      finalMsg += `• Los archivos multimedia están cifrados\n`
      finalMsg += `• Problemas de permisos o conexión\n\n`
    }
    
    if (errors.length > 0 && errors.length <= 5) {
      finalMsg += `📝 *Detalles de errores:*\n${errors.slice(0, 5).join('\n')}\n\n`
    }
    
    finalMsg += `💡 *Tip:* Los estados de WhatsApp duran solo 24 horas.`
    
    conn.reply(m.chat, finalMsg, m, { mentions: [who] })

  } catch (e) {
    await m.react('✖️')
    console.error('❌ Error crítico:', e)
    conn.reply(m.chat, `⚠️ *Error al procesar el comando*\n\n\`\`\`${e.message}\`\`\`\n\n> Usa *${usedPrefix}report* para reportar este problema.\n\n*Stack:*\n\`\`\`${e.stack?.slice(0, 200)}\`\`\``, m)
  }
}

handler.help = ['estado @user', 'estado <número>', 'estado (responder)']
handler.tags = ['tools']
handler.command = ['estado', 'estados', 'status2', 'estadowp', 'getstatus']
handler.premium = false

export default handler
