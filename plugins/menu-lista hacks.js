let handler = async (m, { conn, usedPrefix }) => {
  try {
    console.log('🔍 Comando hack ejecutado por:', m.sender);
    
    let totalreg = Object.keys(global.db.data.users || {}).length;
    let totalCommands = Object.values(global.plugins || {}).filter(
      (v) => v && v.help && v.tags
    ).length;
    
    console.log('📊 Datos obtenidos:', { totalreg, totalCommands });
    
    let libreria = 'Baileys';
    let vs = '2.0.0';
    let userId = m.sender;
    let username = userId.split('@')[0];

    // Texto simple primero para verificar
    let testMessage = `🎭 ¡Hola @${username}! Este es un mensaje de prueba.`;
    
    console.log('📤 Enviando mensaje de prueba...');
    await conn.sendMessage(m.chat, { 
      text: testMessage,
      mentions: [userId]
    }, { quoted: m });
    
    console.log('✅ Mensaje de prueba enviado');
    
    // Ahora intentar con lista
    let infoText = `╭─━━━━━━━━━━━━━━━─╮
│ 🎭 ¡Hola @${username}! 💖
╰─━━━━━━━━━━━━━━━─╯
╭─═⊰ 📡 𝐄𝐒𝐓𝐀𝐃𝐎 𝐀𝐂𝐓𝐈𝐕𝐎
│ 🤖 Estado: ${(conn.user?.jid == global.conn?.user?.jid ? '🟢 PREMIUM' : '🔗 prem-ʙᴏᴛ')}
│ 👥 Users: 『${totalreg}』🔥
│ 🛠️ Comandos: 『${totalCommands}』⚙️
│ 📅 Librería » ${libreria}
│ 🌍 Servidor: México 🇲🇽
│ 📡 Ping: Online ✅
│ 💾 Version: ${vs}
│ 🔒 Modo: ${(conn.user?.jid == global.conn?.user?.jid ? '🔐 PRIVADO' : '🔓 PUBLICO')}
╰───────────────╯
🌟 *Bienvenido a AstaBot!*`;

    console.log('📋 Preparando lista...');
    
    // Crear lista simple
    const listMessage = {
      text: infoText,
      footer: "AstaBot ⚡",
      title: "🎭 ASTABOT MENÚ",
      buttonText: "📋 VER COMANDOS",
      sections: [{
        title: "🔧 COMANDOS HACKER",
        rows: [
          {
            title: "🔎 IANS",
            description: "Búsqueda avanzada",
            rowId: `${usedPrefix || '.'}IANS`
          },
          {
            title: "🕵️ Argus",
            description: "Ver velocidad del bot",
            rowId: `${usedPrefix || '.'}argus`
          }
        ]
      }]
    };

    console.log('📤 Intentando enviar lista...');
    await conn.sendMessage(m.chat, listMessage, { quoted: m });
    console.log('✅ Lista enviada (se espera)');

  } catch (error) {
    console.error('❌ ERROR CRÍTICO:', error);
    console.error('📌 Error stack:', error.stack);
    
    // Intentar enviar al menos un mensaje de error
    try {
      await conn.sendMessage(m.chat, { 
        text: `❌ Error: ${error.message || 'Error desconocido'}\n\nEl comando no funcionó correctamente.`
      }, { quoted: m });
    } catch (e) {
      console.error('No se pudo enviar mensaje de error:', e);
    }
  }
};

handler.help = ['haks', 'hacker', 'hack'];
handler.tags = ['main'];
handler.command = /^(haks|hacker|hack|hacks)$/i;

export default handler;