const handler = async (m, { conn, isROwner, text, args }) => {
  // Función para delay más eficiente
  const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));
  
  // Obtener mensaje
  const mensaje = m.quoted && m.quoted.text ? m.quoted.text : text;
  if (!mensaje) throw `🚫 *Necesitas proporcionar un mensaje para el anuncio*\n\n*Ejemplo:*\n${usedPrefix}anuncio Nueva actualización disponible!`;
  
  // Obtener TODOS los grupos sin filtros
  const getGroups = await conn.groupFetchAllParticipating();
  const groups = Object.entries(getGroups).slice(0).map((entry) => entry[1]);
  const gruposIds = groups.map((v) => v.id);
  
  const totalGrupos = gruposIds.length;
  if (totalGrupos === 0) throw `⚠️ *No hay grupos disponibles para enviar el anuncio*`;
  
  // Mensaje de confirmación inicial
  const confirmMsg = await m.reply(`🔥 *INICIANDO ANUNCIO ÉPICO* 🔥\n\n🎯 *Grupos objetivo:* ${totalGrupos}\n⚡ *Preparando la magia...*`);
  
  // Crear mensaje con formato súper chido
  const anuncioFormateado = `
╭━━━━━━━━━━━━━━━━━━╮
┃🔥 *ANUNCIO OFICIAL* 🔥┃
╰━━━━━━━━━━━━━━━━━━╯

${mensaje}


> *🌟 Powered by ${packname || 'EliteBot'} 🌟*
`.trim();
  
  // Envío súper rápido - lotes más grandes
  const loteSize = 10; // Enviar a 10 grupos simultáneamente
  const lotes = [];
  
  for (let i = 0; i < gruposIds.length; i += loteSize) {
    lotes.push(gruposIds.slice(i, i + loteSize));
  }
  
  let exitosos = 0;
  let fallidos = 0;
  
  // Procesar lotes súper rápido
  for (let i = 0; i < lotes.length; i++) {
    const lote = lotes[i];
    
    // Enviar a todos los grupos del lote simultáneamente
    const promesas = lote.map(async (groupId) => {
      try {
        await conn.relayMessage(groupId, {
          extendedTextMessage: {
            text: anuncioFormateado,
            contextInfo: {
              mentionedJid: [],
              forwardingScore: 999,
              isForwarded: false,
              externalAdReply: {
                title: '🔥 ANUNCIO ÉPICO',
                body: 'Información importante - No te lo pierdas',
                thumbnailUrl: 'https://i.imgur.com/placeholder.jpg',
                sourceUrl: 'https://github.com/Fer280809',
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          }
        }, {});
        exitosos++;
        return { success: true };
      } catch (error) {
        fallidos++;
        return { success: false, error };
      }
    });
    
    await Promise.all(promesas);
    
    // Delay súper corto para máxima velocidad
    if (i < lotes.length - 1) {
      await delay(300); // Solo 300ms entre lotes
    }
    
    // Actualizar progreso con estilo
    const progreso = Math.round(((i + 1) / lotes.length) * 100);
    try {
      await conn.sendMessage(m.chat, {
        text: `🚀 *Progreso: ${progreso}%*\n✅ Exitosos: ${exitosos}\n❌ Fallidos: ${fallidos}\n⚡ *Velocidad máxima activada*`,
        edit: confirmMsg.key
      });
    } catch (e) {
      // Si no se puede editar, continuar
    }
  }
  
  // Mensaje final épico
  const mensajeFinal = `
╭━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  🎉 *ANUNCIO COMPLETADO* 🎉  ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━╯

🔥 *Estadísticas Épicas:*
• 🌍 Total de grupos: ${totalGrupos}
• ✅ Exitosos: ${exitosos}
• ❌ Fallidos: ${fallidos}
• 📈 Tasa de éxito: ${Math.round((exitosos/totalGrupos)*100)}%

⚡ *Completado en tiempo récord*
🕐 *Hora:* ${new Date().toLocaleTimeString()}

🎯 *¡Anuncio enviado a toda la red!*
`.trim();
  
  await conn.sendMessage(m.chat, {
    text: mensajeFinal,
    edit: confirmMsg.key
  });
};

// Comando ultra rápido para anuncios express
const ultraHandler = async (m, { conn, isROwner, text }) => {
  const mensaje = m.quoted && m.quoted.text ? m.quoted.text : text;
  if (!mensaje) throw `🚫 *Necesitas proporcionar un mensaje*`;
  
  const getGroups = await conn.groupFetchAllParticipating();
  const gruposIds = Object.entries(getGroups).slice(0).map((entry) => entry[1].id);
  
  const mensajeRapido = `
🔥 *ANUNCIO EXPRESS* 🔥

${mensaje}

💎 *Mensaje prioritario* 💎
  `.trim();
  
  // Envío ultra rápido - todos a la vez
  const promesas = gruposIds.map(async (groupId) => {
    try {
      await conn.sendMessage(groupId, { text: mensajeRapido });
    } catch (error) {
      console.error(`Error en grupo:`, error);
    }
  });
  
  await Promise.all(promesas);
  m.reply(`🚀 *Anuncio express enviado a ${gruposIds.length} grupos*\n⚡ *Velocidad máxima alcanzada*`);
};

// Comando para anuncio con ubicación aleatoria
const locationHandler = async (m, { conn, isROwner, text }) => {
  const mensaje = m.quoted && m.quoted.text ? m.quoted.text : text;
  if (!mensaje) throw `🚫 *Necesitas proporcionar un mensaje*`;
  
  const getGroups = await conn.groupFetchAllParticipating();
  const gruposIds = Object.entries(getGroups).slice(0).map((entry) => entry[1].id);
  
  // Ubicaciones aleatorias de diferentes países
  const ubicacionesRandom = [
    { lat: -34.6037, lng: -58.3816 }, // Buenos Aires, Argentina
    { lat: 40.7128, lng: -74.0060 }, // Nueva York, USA
    { lat: 51.5074, lng: -0.1278 },  // Londres, Reino Unido
    { lat: -33.8688, lng: 151.2093 }, // Sydney, Australia
    { lat: 35.6762, lng: 139.6503 }, // Tokyo, Japón
    { lat: 48.8566, lng: 2.3522 },   // París, Francia
    { lat: -22.9068, lng: -43.1729 }, // Río de Janeiro, Brasil
    { lat: 55.7558, lng: 37.6176 },  // Moscú, Rusia
    { lat: 1.3521, lng: 103.8198 },  // Singapur
    { lat: 25.2048, lng: 55.2708 }   // Dubai, UAE
  ];
  
  // Seleccionar ubicación aleatoria
  const ubicacionRandom = ubicacionesRandom[Math.floor(Math.random() * ubicacionesRandom.length)];
  
  // Envío con ubicación aleatoria
  for (const groupId of gruposIds) {
    await delay(200); // Delay corto
    conn.relayMessage(groupId, {
      liveLocationMessage: {
        degreesLatitude: ubicacionRandom.lat,
        degreesLongitude: ubicacionRandom.lng,
        accuracyInMeters: 0,
        degreesClockwiseFromMagneticNorth: 2,
        caption: `
🔥 *ANUNCIO ÉPICO* 🔥

${mensaje}

🌟 *Mensaje prioritario* 🌟
        `.trim(),
        sequenceNumber: 2,
        timeOffset: 3,
        contextInfo: m,
      }
    }, {}).catch((_) => _);
  }
  
  m.reply(`🎯 *Anuncio con ubicación enviado a ${gruposIds.length} grupos*\n🔥 *Modo épico activado*`);
};

// Configuración del comando principal
handler.help = ['anuncio', 'broadcast', 'bcgc'];
handler.tags = ['owner'];
handler.command = ['anuncio', 'broadcast', 'bcgc'];
handler.owner = true;

// Configuración del comando ultra rápido
ultraHandler.help = ['ultra', 'express'];
ultraHandler.tags = ['owner'];
ultraHandler.command = ['ultra', 'express'];
ultraHandler.owner = true;

// Configuración del comando con ubicación
locationHandler.help = ['anunciolive', 'livelocation'];
locationHandler.tags = ['owner'];
locationHandler.command = ['anunciolive', 'livelocation'];
locationHandler.owner = true;

export default handler;
export { ultraHandler, locationHandler };
