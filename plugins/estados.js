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
      const statusChat = conn.chats?.[statusBroadcastId];
      const statusStore = conn.store?.messages?.[statusBroadcastId];

      debug += `📦 *Estructuras disponibles:*\n`;
      debug += `• status@broadcast en conn.chats: ${statusChat ? '✅' : '❌'}\n`;
      debug += `• status@broadcast en conn.store: ${statusStore ? '✅' : '❌'}\n\n`;

      let totalMsgs = 0;
      let msgsArray = [];

      if (statusChat && statusChat.messages) {
        msgsArray = Array.isArray(statusChat.messages)
          ? statusChat.messages
          : Object.values(statusChat.messages);
      } else if (statusStore) {
        msgsArray = Array.isArray(statusStore)
          ? statusStore
          : Object.values(statusStore);
      }
      
      totalMsgs = msgsArray.length;
      debug += `📊 Mensajes de estados en caché: ${totalMsgs}\n\n`;
      
      // Listar usuarios con estados
      const userStatusCounts = {};
      
      msgsArray.forEach(msg => {
          const participant = msg?.key?.participant || msg?.participant;
          if (participant) {
              const userNumber = participant.split('@')[0];
              userStatusCounts[userNumber] = (userStatusCounts[userNumber] || 0) + 1;
          }
      });
      
      debug += `👤 *Usuarios con estados (${Object.keys(userStatusCounts).length}):*\n`;
      if (Object.keys(userStatusCounts).length > 0) {
          const userList = Object.entries(userStatusCounts)
              .sort((a, b) => b[1] - a[1]) // Ordenar por cantidad
              .map(([num, count]) => `• ${num}: ${count} estado(s)`)
              .slice(0, 15) // Mostrar solo los 15 más recientes/activos
              .join('\n');
          debug += userList;
      } else {
          debug += 'Ninguno';
      }
      debug += `\n\n_Para ver los tuyos: ${usedPrefix}${command.replace('debug', '')}_\n`;

      return conn.reply(m.chat, debug, m);
    }
    // --- FIN COMANDO DE DEBUG ---

    await conn.reply(m.chat, `🔍 Buscando estados de @${who.split('@')[0]}...`, m, { mentions: [who] });

    let downloaded = 0;
    let foundStatuses = [];
    const statusBroadcastId = 'status@broadcast';

    // 1. Búsqueda robusta de estados
    try {
      const statusChat = conn.chats?.[statusBroadcastId];
      const statusStore = conn.store?.messages?.[statusBroadcastId];
      let msgs = [];

      if (statusChat && statusChat.messages) {
        msgs = Array.isArray(statusChat.messages)
          ? statusChat.messages
          : Object.values(statusChat.messages);
      } else if (statusStore) {
        msgs = Array.isArray(statusStore)
          ? statusStore
          : Object.values(statusStore);
      }
      
      // Filtrar mensajes válidos con key
      foundStatuses = msgs.filter(msg => msg && msg.key);

    } catch (error) {
      console.error('❌ Error buscando estados:', error);
    }

    if (foundStatuses.length === 0) {
      await m.react('ℹ️');
      return conn.reply(m.chat, `ℹ️ *No se encontraron estados en la caché del bot*.\n\n_El bot debe haber visto el estado para poder descargarlo._\n\nUsa *${usedPrefix}debugstatus* para más información`, m);
    }

    // 2. Filtrar por usuario objetivo
    const targetNumber = who.split('@')[0];
    const userStatuses = foundStatuses.filter(status => {
      const participant = status?.key?.participant || status?.participant;
      if (!participant) return false;

      const msgNumber = participant.split('@')[0];
      // Solo coincidencia exacta
      return msgNumber === targetNumber; 
    });

    if (userStatuses.length === 0) {
      await m.react('ℹ️');
      return conn.reply(m.chat, `ℹ️ *No se encontraron estados de este usuario* (@${targetNumber}).\n\n📊 Estados totales en caché: ${foundStatuses.length}\n\nUsa *${usedPrefix}debugstatus* para ver todos los usuarios con estados`, m, { mentions: [who] });
    }

    // 3. Descargar y enviar estados
    for (let i = 0; i < userStatuses.length; i++) {
      try {
        const status = userStatuses[i];
        const fullMsg = status.message || status.msg || status; 

        let mediaType = null;
        let mediaContent = null;
        let isTextOnly = true;

        // Determinar el tipo de mensaje y su contenido
        if (fullMsg.extendedTextMessage && fullMsg.extendedTextMessage.contextInfo?.quotedMessage) {
            const quoted = fullMsg.extendedTextMessage.contextInfo.quotedMessage;
            if (quoted.imageMessage) { mediaType = 'image'; mediaContent = quoted.imageMessage; isTextOnly = false; }
            else if (quoted.videoMessage) { mediaType = 'video'; mediaContent = quoted.videoMessage; isTextOnly = false; }
        } else if (fullMsg.imageMessage) {
          mediaType = 'image'; mediaContent = fullMsg.imageMessage; isTextOnly = false;
        } else if (fullMsg.videoMessage) {
          mediaType = 'video'; mediaContent = fullMsg.videoMessage; isTextOnly = false;
        } else if (fullMsg.audioMessage) {
          mediaType = 'audio'; mediaContent = fullMsg.audioMessage; isTextOnly = false;
        }
        
        if (isTextOnly) {
          // Si es solo texto, no hay nada que descargar, continuar al siguiente estado.
          continue; 
        }

        console.log(`📥 Descargando ${mediaType} ${i + 1}/${userStatuses.length}`);

        // **Punto Crítico: Descarga**
        const stream = await downloadContentFromMessage(mediaContent, mediaType);
        let buffer = Buffer.from([]);

        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }

        if (buffer.length === 0) {
            console.log(`⚠️ Buffer vacío para el estado ${i + 1}. Posible fallo de descarga.`);
            continue;
        }

        // Enviar
        const caption = mediaContent.caption || `💾 Estado ${mediaType === 'video' ? '📹' : mediaType === 'image' ? '📸' : '🎵'} de @${targetNumber}`;

        const messageOptions = {
            caption,
            mentions: [who],
        };
        
        if (mediaType === 'video') {
          await conn.sendMessage(m.chat, { video: buffer, ...messageOptions }, { quoted: m });
        } else if (mediaType === 'image') {
          await conn.sendMessage(m.chat, { image: buffer, ...messageOptions }, { quoted: m });
        } else if (mediaType === 'audio') {
           await conn.sendMessage(m.chat, { 
               audio: buffer, 
               mimetype: 'audio/ogg; codecs=opus', 
               ptt: mediaContent.ptt || false,
           }, { quoted: m });
        }

        downloaded++;
        await new Promise(resolve => setTimeout(resolve, 1500)); 
      } catch (err) {
        // Muestra la key para depuración si falla la descarga
        const keyInfo = JSON.stringify(status.key);
        console.error(`❌ ERROR DE DESCARGA en estado ${i + 1}. Key: ${keyInfo}. Error:`, err.message);
        
        if (i === 0) {
            await conn.reply(m.chat, `⚠️ Fallo la descarga del primer estado. Causa: ${err.message}\n\n*Key de mensaje para debug:* \`${keyInfo}\``, m);
        }
        continue;
      }
    }

    await m.react(downloaded > 0 ? '✔️' : 'ℹ️');

    let response = `📊 *RESULTADO DE ESTADOS*\n\n`;
    response += `👤 Usuario: @${targetNumber}\n`;
    response += `📱 Estados encontrados (Multimedia + Texto): ${userStatuses.length}\n`;
    response += `✅ Descargados y Enviados: ${downloaded}\n`;

    if (downloaded === 0 && userStatuses.length > 0) {
      response += `\n⚠️ *Aviso:*\n• Los estados encontrados eran solo texto o el bot no pudo descargar el contenido multimedia (buffer vacío o error de key).`;
    }

    conn.reply(m.chat, response, m, { mentions: [who] });

  } catch (e) {
    await m.react('✖️');
    console.error('❌ ERROR CRÍTICO:', e);
    conn.reply(m.chat, `⚠️ *Error CRÍTICO inesperado*:\n\n\`\`\`${e.message}\n${e.stack?.slice(0, 300)}\`\`\``, m);
  }
};

handler.help = ['estado @user', 'debugstatus'];
handler.tags = ['tools'];
handler.command = ['estado', 'estados', 'status2', 'estadowp', 'getstatus', 'debugstatus'];
handler.premium = false;

export default handler;
