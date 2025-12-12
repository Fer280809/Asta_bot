let handler = async (m, { conn, usedPrefix, text, command }) => {
  try {
    await m.react('🕒')
    
    // Comando de debug para ver qué tiene el bot
    if (command === 'debugstatus') {
      let debug = `🔍 *DEBUG DE ESTADOS*\n\n`
      
      // Verificar todas las estructuras
      debug += `📦 *Estructuras disponibles:*\n`
      debug += `• conn.chats: ${conn.chats ? '✅' : '❌'}\n`
      debug += `• conn.store: ${conn.store ? '✅' : '❌'}\n`
      debug += `• conn.messages: ${conn.messages ? '✅' : '❌'}\n`
      debug += `• status@broadcast en chats: ${conn.chats?.['status@broadcast'] ? '✅' : '❌'}\n`
      debug += `• status@broadcast en store: ${conn.store?.messages?.['status@broadcast'] ? '✅' : '❌'}\n\n`
      
      // Listar todos los chats que empiezan con "status"
      if (conn.chats) {
        const statusChats = Object.keys(conn.chats).filter(k => k.includes('status'))
        debug += `💬 *Chats con "status":*\n${statusChats.join('\n') || 'Ninguno'}\n\n`
      }
      
      // Contar mensajes en status@broadcast
      if (conn.chats?.['status@broadcast']?.messages) {
        const msgs = conn.chats['status@broadcast'].messages
        const count = Array.isArray(msgs) ? msgs.length : Object.keys(msgs).length
        debug += `📊 Mensajes en status@broadcast: ${count}\n\n`
        
        // Mostrar últimos 3 mensajes
        const msgArray = Array.isArray(msgs) ? msgs : Object.values(msgs)
        if (msgArray.length > 0) {
          debug += `📝 *Últimos mensajes:*\n`
          msgArray.slice(-3).forEach((msg, i) => {
            const participant = msg?.key?.participant || 'desconocido'
            const type = Object.keys(msg?.message || {})[0] || 'desconocido'
            debug += `${i + 1}. ${participant.split('@')[0]} - ${type}\n`
          })
        }
      }
      
      return conn.reply(m.chat, debug, m)
    }
    
    // Comando normal de estados
    let who = m.mentionedJid && m.mentionedJid[0] 
      ? m.mentionedJid[0] 
      : m.quoted 
        ? m.quoted.sender 
        : text 
          ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
          : m.sender

    await conn.reply(m.chat, `🔍 Buscando estados de @${who.split('@')[0]}...\n\n_Usa ${usedPrefix}debugstatus para ver información de debug_`, m, { mentions: [who] })

    let downloaded = 0
    let foundStatuses = []
    
    // Buscar estados de la forma MÁS SIMPLE posible
    try {
      // Opción 1: Directamente en chats
      if (conn.chats && conn.chats['status@broadcast']) {
        console.log('✅ Encontrado status@broadcast en chats')
        const statusChat = conn.chats['status@broadcast']
        
        if (statusChat.messages) {
          const msgs = Array.isArray(statusChat.messages) 
            ? statusChat.messages 
            : Object.values(statusChat.messages)
          
          console.log(`📊 Total mensajes en status: ${msgs.length}`)
          
          // NO filtrar por usuario primero, tomar TODOS
          foundStatuses = msgs.filter(msg => {
            // Verificar que tenga la estructura básica
            return msg && (msg.message || msg.msg) && msg.key
          })
          
          console.log(`📦 Mensajes válidos: ${foundStatuses.length}`)
        }
      }
      
      // Opción 2: En store
      if (foundStatuses.length === 0 && conn.store?.messages?.['status@broadcast']) {
        console.log('✅ Encontrado status@broadcast en store')
        const msgs = Array.isArray(conn.store.messages['status@broadcast'])
          ? conn.store.messages['status@broadcast']
          : Object.values(conn.store.messages['status@broadcast'])
        
        foundStatuses = msgs.filter(msg => msg && (msg.message || msg.msg) && msg.key)
        console.log(`📦 Mensajes en store: ${foundStatuses.length}`)
      }
      
    } catch (error) {
      console.error('❌ Error buscando estados:', error)
    }
    
    if (foundStatuses.length === 0) {
      await m.react('ℹ️')
      return conn.reply(m.chat, `ℹ️ *No se encontraron estados en el bot*\n\n*Esto significa que:*\n• El bot no tiene estados guardados en caché\n• Necesitas ver estados desde WhatsApp primero\n• O el bot no está recibiendo actualizaciones de estados\n\n💡 *Solución:*\n1. Ve algunos estados desde tu WhatsApp\n2. Espera unos segundos\n3. Intenta de nuevo\n\nUsa *${usedPrefix}debugstatus* para más información`, m)
    }
    
    // Ahora SÍ filtrar por usuario
    const userStatuses = foundStatuses.filter(msg => {
      const participant = msg?.key?.participant || msg?.participant
      if (!participant) return false
      
      // Comparar números
      const msgNumber = participant.split('@')[0]
      const targetNumber = who.split('@')[0]
      
      return msgNumber === targetNumber || msgNumber.includes(targetNumber) || targetNumber.includes(msgNumber)
    })
    
    console.log(`👤 Estados del usuario ${who.split('@')[0]}: ${userStatuses.length}`)
    
    if (userStatuses.length === 0) {
      // Mostrar cuántos estados hay en total
      await m.react('ℹ️')
      return conn.reply(m.chat, `ℹ️ *No se encontraron estados de este usuario*\n\n📊 Estados totales en el bot: ${foundStatuses.length}\n👤 Estados de @${who.split('@')[0]}: 0\n\n*Posible solución:*\n• Verifica que el número sea correcto\n• El usuario debe tener estados activos\n• Intenta con: ${usedPrefix}${command} (sin argumentos para ver tus propios estados)\n\nUsa *${usedPrefix}debugstatus* para ver todos los usuarios con estados`, m, { mentions: [who] })
    }

    // Descargar estados
    const { downloadContentFromMessage } = await import('@whiskeysockets/baileys')
    
    for (let i = 0; i < userStatuses.length; i++) {
      try {
        const status = userStatuses[i]
        const msg = status.message || status.msg || status
        
        // Buscar multimedia
        let mediaType = null
        let mediaContent = null
        
        if (msg.imageMessage) {
          mediaType = 'image'
          mediaContent = msg.imageMessage
        } else if (msg.videoMessage) {
          mediaType = 'video'
          mediaContent = msg.videoMessage
        } else if (msg.audioMessage) {
          mediaType = 'audio'
          mediaContent = msg.audioMessage
        }
        
        if (!mediaContent) {
          console.log(`⚠️ Estado ${i + 1}: Solo texto o tipo no soportado`)
          continue
        }
        
        console.log(`📥 Descargando ${mediaType} ${i + 1}/${userStatuses.length}`)
        
        // Descargar
        const stream = await downloadContentFromMessage(mediaContent, mediaType)
        let buffer = Buffer.from([])
        
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk])
        }

        if (buffer.length === 0) continue

        // Enviar
        const caption = mediaContent.caption || `${mediaType === 'video' ? '📹' : mediaType === 'image' ? '📸' : '🎵'} Estado de @${who.split('@')[0]}`
        
        if (mediaType === 'video') {
          await conn.sendMessage(m.chat, { 
            video: buffer, 
            caption,
            mentions: [who]
          }, { quoted: m })
        } else if (mediaType === 'image') {
          await conn.sendMessage(m.chat, { 
            image: buffer, 
            caption,
            mentions: [who]
          }, { quoted: m })
        } else if (mediaType === 'audio') {
          await conn.sendMessage(m.chat, { 
            audio: buffer, 
            mimetype: 'audio/ogg; codecs=opus', 
            ptt: mediaContent.ptt || false 
          }, { quoted: m })
        }
        
        downloaded++
        await new Promise(resolve => setTimeout(resolve, 1500))
        
      } catch (err) {
        console.error(`❌ Error en estado ${i + 1}:`, err.message)
        continue
      }
    }

    await m.react(downloaded > 0 ? '✔️' : 'ℹ️')
    
    let response = `📊 *RESULTADO*\n\n`
    response += `👤 Usuario: @${who.split('@')[0]}\n`
    response += `📱 Estados encontrados: ${userStatuses.length}\n`
    response += `✅ Descargados: ${downloaded}\n`
    
    if (downloaded === 0) {
      response += `\n⚠️ Los estados pueden ser solo texto o estar cifrados.\n`
    }
    
    conn.reply(m.chat, response, m, { mentions: [who] })

  } catch (e) {
    await m.react('✖️')
    console.error('❌ ERROR:', e)
    conn.reply(m.chat, `⚠️ Error: ${e.message}\n\n\`\`\`${e.stack?.slice(0, 300)}\`\`\``, m)
  }
}

handler.help = ['estado @user', 'debugstatus']
handler.tags = ['tools']
handler.command = ['estado', 'estados', 'status2', 'estadowp', 'getstatus', 'debugstatus']
handler.premium = false

export default handler
