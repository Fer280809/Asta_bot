import { downloadContentFromMessage } from '@whiskeysockets/baileys';

let handler = async (m, { conn, usedPrefix, text, command }) => {
  try {
    await m.react('🕒');

    // --- LÓGICA DE DETECCIÓN DEL USUARIO ---
    let who = m.mentionedJid && m.mentionedJid[0]
      ? m.mentionedJid[0]
      : m.quoted
        ? m.quoted.sender
        : text
          ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
          : m.sender;

    // --- COMANDO DE DEBUG ---
    if (command === 'debugstatus') {
      let debug = `🔍 *DEBUG DE ESTADOS*\n\n`;
      const statusBroadcastId = 'status@broadcast';
      
      // Formas alternativas de buscar estados
      debug += `📦 *Fuentes de estados:*\n`;
      
      // 1. Buscar en chats
      if (conn.chats) {
        const statusChat = conn.chats[statusBroadcastId];
        debug += `• conn.chats['status@broadcast']: ${statusChat ? '✅' : '❌'}\n`;
      }
      
      // 2. Buscar en store (forma más común)
      if (conn.store) {
        const hasMessages = conn.store.messages && conn.store.messages[statusBroadcastId];
        debug += `• conn.store.messages['status@broadcast']: ${hasMessages ? '✅' : '❌'}\n`;
      }
      
      // 3. Buscar directamente en la conexión
      if (conn.messages) {
        const hasMessages = conn.messages[statusBroadcastId];
        debug += `• conn.messages['status@broadcast']: ${hasMessages ? '✅' : '❌'}\n`;
      }
      
      debug += `\n`;

      // Intentar encontrar mensajes de estados
      let allStatusMsgs = [];
      
      // Método 1: Buscar en store
      if (conn.store?.messages?.[statusBroadcastId]) {
        const msgs = conn.store.messages[statusBroadcastId];
        allStatusMsgs = Array.isArray(msgs) ? msgs : Object.values(msgs);
      }
      
      // Método 2: Buscar en conn.messages
      if (conn.messages?.[statusBroadcastId] && allStatusMsgs.length === 0) {
        const msgs = conn.messages[statusBroadcastId];
        allStatusMsgs = Array.isArray(msgs) ? msgs : Object.values(msgs);
      }

      debug += `📊 Mensajes de estados encontrados: ${allStatusMsgs.length}\n\n`;
      
      if (allStatusMsgs.length > 0) {
        // Listar usuarios con estados
        const userStatusCounts = {};
        
        allStatusMsgs.forEach((msg, index) => {
          if (msg?.key) {
            const participant = msg.key.participant || msg.key.remoteJid;
            if (participant && participant.includes('@s.whatsapp.net')) {
              const userNumber = participant.split('@')[0];
              userStatusCounts[userNumber] = (userStatusCounts[userNumber] || 0) + 1;
            }
          }
        });
        
        debug += `👤 *Usuarios con estados (${Object.keys(userStatusCounts).length}):*\n`;
        if (Object.keys(userStatusCounts).length > 0) {
          const userList = Object.entries(userStatusCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([num, count]) => `• ${num}: ${count} estado(s)`)
            .join('\n');
          debug += userList;
        } else {
          debug += 'No se pudieron identificar usuarios';
        }
        
        // Mostrar algunos ejemplos de mensajes
        debug += `\n\n📝 *Ejemplos de mensajes encontrados (primeros 3):*\n`;
        allStatusMsgs.slice(0, 3).forEach((msg, i) => {
          debug += `${i + 1}. Tipo: ${Object.keys(msg.message || {})[0] || 'desconocido'}\n`;
          if (msg.key?.participant) {
            debug += `   De: ${msg.key.participant.split('@')[0]}\n`;
          }
        });
      }

      debug += `\n\n_Para ver estados de alguien: ${usedPrefix}estado @usuario_`;

      return conn.reply(m.chat, debug, m);
    }
    // --- FIN COMANDO DE DEBUG ---

    await conn.reply(m.chat, `🔍 Buscando estados de @${who.split('@')[0]}...`, m, { mentions: [who] });

    let downloaded = 0;
    let foundStatuses = [];
    const statusBroadcastId = 'status@broadcast';
    const targetNumber = who.split('@')[0];

    // 1. Buscar estados en todas las fuentes posibles
    try {
      // Fuente principal: store
      if (conn.store?.messages?.[statusBroadcastId]) {
        const msgs = conn.store.messages[statusBroadcastId];
        foundStatuses = Array.isArray(msgs) ? msgs : Object.values(msgs);
      }
      
      // Fuente alternativa: conn.messages
      if (foundStatuses.length === 0 && conn.messages?.[statusBroadcastId]) {
        const msgs = conn.messages[statusBroadcastId];
        foundStatuses = Array.isArray(msgs) ? msgs : Object.values(msgs);
      }

      // Filtrar mensajes válidos
      foundStatuses = foundStatuses.filter(msg => 
        msg && msg.key && (msg.message || msg.msg)
      );

    } catch (error) {
      console.error('❌ Error buscando estados:', error);
    }

    if (foundStatuses.length === 0) {
      await m.react('ℹ️');
      return conn.reply(m.chat, 
        `ℹ️ *No se encontraron estados en caché.*\n\n` +
        `_Para que el bot pueda ver estados, necesitas:_\n` +
        `1. Asegurarte de que el bot sigue a la persona\n` +
        `2. Que la persona tenga estados públicos o permitidos\n` +
        `3. Esperar a que el bot actualice la caché\n\n` +
        `Usa *${usedPrefix}debugstatus* para ver qué está almacenado`, 
        m
      );
    }

    // 2. Filtrar por usuario específico
    const userStatuses = foundStatuses.filter(status => {
      const participant = status?.key?.participant;
      if (!participant) return false;
      
      const msgNumber = participant.split('@')[0];
      // Coincidencia exacta
      return msgNumber === targetNumber;
    });

    if (userStatuses.length === 0) {
      await m.react('ℹ️');
      return conn.reply(m.chat, 
        `ℹ️ *No se encontraron estados de @${targetNumber}*\n\n` +
        `📊 Estados totales en caché: ${foundStatuses.length}\n` +
        `👤 Usuarios distintos: ${[...new Set(foundStatuses.map(s => s.key?.participant?.split('@')[0]).filter(Boolean))].length}\n\n` +
        `Usa *${usedPrefix}debugstatus* para ver todos los usuarios`, 
        m, { mentions: [who] }
      );
    }

    // 3. Procesar cada estado
    for (let i = 0; i < Math.min(userStatuses.length, 10); i++) { // Limitar a 10 para no saturar
      try {
        const status = userStatuses[i];
        const fullMsg = status.message || status.msg || {};
        
        // Determinar tipo de contenido
        let mediaType = null;
        let mediaContent = null;
        
        // Verificar tipos de mensaje
        if (fullMsg.imageMessage) {
          mediaType = 'image';
          mediaContent = fullMsg.imageMessage;
        } else if (fullMsg.videoMessage) {
          mediaType = 'video';
          mediaContent = fullMsg.videoMessage;
        } else if (fullMsg.audioMessage) {
          mediaType = 'audio';
          mediaContent = fullMsg.audioMessage;
        } else if (fullMsg.extendedTextMessage) {
          // Estados con texto pueden tener media adjunta
          const quoted = fullMsg.extendedTextMessage.contextInfo?.quotedMessage;
          if (quoted?.imageMessage) {
            mediaType = 'image';
            mediaContent = quoted.imageMessage;
          } else if (quoted?.videoMessage) {
            mediaType = 'video';
            mediaContent = quoted.videoMessage;
          } else {
            // Es solo texto, saltar
            continue;
          }
        } else {
          // Tipo no soportado
          continue;
        }
        
        if (!mediaContent) {
          continue;
        }

        console.log(`📥 Descargando ${mediaType} ${i + 1}/${Math.min(userStatuses.length, 10)}`);
        
        // Descargar contenido
        let buffer;
        try {
          const stream = await downloadContentFromMessage(mediaContent, mediaType);
          const chunks = [];
          
          for await (const chunk of stream) {
            chunks.push(chunk);
          }
          
          buffer = Buffer.concat(chunks);
          
          if (!buffer || buffer.length === 0) {
            throw new Error('Buffer vacío');
          }
        } catch (downloadErr) {
          console.error(`❌ Error descargando ${mediaType}:`, downloadErr.message);
          continue;
        }
        
        // Preparar para enviar
        const caption = mediaContent.captionText || 
                       mediaContent.caption || 
                       `Estado ${mediaType} de @${targetNumber}\n📅 ${new Date().toLocaleString()}`;
        
        const messageOptions = {
          caption: caption,
          mentions: [who],
        };
        
        // Enviar según el tipo
        if (mediaType === 'image') {
          await conn.sendMessage(m.chat, { 
            image: buffer,
            ...messageOptions 
          }, { quoted: m });
          
        } else if (mediaType === 'video') {
          await conn.sendMessage(m.chat, { 
            video: buffer,
            ...messageOptions,
            gifPlayback: mediaContent.gifPlayback || false
          }, { quoted: m });
          
        } else if (mediaType === 'audio') {
          await conn.sendMessage(m.chat, { 
            audio: buffer,
            mimetype: mediaContent.mimetype || 'audio/mp4',
            ptt: mediaContent.ptt || false
          }, { quoted: m });
        }
        
        downloaded++;
        
        // Pequeña pausa entre envíos
        if (i < userStatuses.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (err) {
        console.error(`❌ Error procesando estado ${i + 1}:`, err.message);
        continue;
      }
    }

    // 4. Enviar resumen
    await m.react(downloaded > 0 ? '✅' : 'ℹ️');
    
    let response = `📊 *RESULTADO DE ESTADOS*\n\n`;
    response += `👤 Usuario: @${targetNumber}\n`;
    response += `🔍 Estados encontrados: ${userStatuses.length}\n`;
    response += `✅ Descargados exitosamente: ${downloaded}\n`;
    
    if (downloaded === 0 && userStatuses.length > 0) {
      response += `\n⚠️ *Posibles razones:*\n`;
      response += `• Los estados eran solo texto\n`;
      response += `• Error de descarga (sin permisos, contenido eliminado)\n`;
      response += `• Formato no soportado\n`;
    }
    
    response += `\n💡 *Consejo:* Asegúrate de que el bot sigue a la persona y tiene acceso a sus estados.`;
    
    await conn.reply(m.chat, response, m, { mentions: [who] });

  } catch (e) {
    await m.react('❌');
    console.error('❌ ERROR CRÍTICO:', e);
    await conn.reply(m.chat, 
      `⚠️ *Error inesperado:*\n\n\`\`\`${e.message}\`\`\`\n\n` +
      `Usa *${usedPrefix}debugstatus* para diagnosticar problemas.`, 
      m
    );
  }
};

handler.help = ['estado @usuario', 'debugstatus'];
handler.tags = ['herramientas', 'descargas'];
handler.command = ['estado', 'estados', 'status', 'verestado', 'descargarestado', 'debugstatus'];
handler.premium = false;
handler.limit = true;

export default handler;
