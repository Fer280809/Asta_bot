let handler = async (m, { conn, usedPrefix }) => {
  let totalreg = Object.keys(global.db.data.users).length;
  let totalCommands = Object.values(global.plugins).filter(
    (v) => v.help && v.tags
  ).length;
  let libreria = 'Baileys';
  let vs = '2.0.0';
  let user = m.sender;
  let username = user.split('@')[0];

  let infoText = `╭─━━━━━━━━━━━━━━━─╮
│ 🎭 ¡Hola @${username}! 💖
╰─━━━━━━━━━━━━━━━─╯
╭─═⊰ 📡 𝐄𝐒𝐓𝐀𝐃𝐎 𝐀𝐂𝐓𝐈𝐕𝐎
│ 🤖 Estado: ${(conn.user.jid == global.conn.user.jid ? '🟢 PREMIUM' : '🔗 prem-ʙᴏᴛ')}
│ 👥 Users: 『${totalreg.toLocaleString()}』🔥
│ 🛠️ Comandos: 『${totalCommands}』⚙️
│ 📅 Librería » ${libreria}
│ 🌍 Servidor: México 🇲🇽
│ 📡 Ping: Online ✅
│ 💾 Version: ${vs}
│ 🔒 Modo: ${(conn.user.jid == global.conn.user.jid ? '🔐 PRIVADO' : '🔓 PUBLICO')}
╰───────────────╯
🌟 *Bienvenido a AstaBot!*`;

  // ENVIAR IMAGEN PRIMERO
  try {
    await conn.sendFile(m.chat, 'https://files.catbox.moe/wrwuls.png', 'asta.jpg', infoText, m, false, {
      mentions: [user]
    });
  } catch (e) {
    console.log(e);
    await conn.sendMessage(m.chat, { text: infoText, mentions: [user] }, { quoted: m });
  }

  // ESPERAR 1 SEGUNDO Y ENVIAR LA LISTA
  await new Promise(resolve => setTimeout(resolve, 1000));

  let sections = [{
    title: "📌 COMANDOS PRINCIPALES",
    rows: [
      { title: "🔎 IANS", rowId: `${usedPrefix}IANS`, description: "Herramienta de búsqueda avanzada" },
      { title: "🕵️ Argus", rowId: `${usedPrefix}argus`, description: "Ver la velocidad del bot" },
      { title: "⚙️ MatrixPDF", rowId: `${usedPrefix}matrixpdf`, description: "Descargar PDF malicioso" },
      { title: "🦠 Virus PC", rowId: `${usedPrefix}viruspc`, description: "Virus para pc" },
      { title: "📊 Dataminer", rowId: `${usedPrefix}dataminer`, description: "Próximamente" },
      { title: "🔐 Cipher", rowId: `${usedPrefix}cipher`, description: "Próximamente" },
      { title: "🌐 Netscan", rowId: `${usedPrefix}netscan`, description: "Próximamente" }
    ]
  }];

  let listMessage = {
    text: "🎭 *SELECCIONA UN COMANDO:*",
    footer: "AstaBot ⚡ | Menú interactivo",
    title: "⚡ COMANDOS DISPONIBLES",
    buttonText: "📋 VER OPCIONES",
    sections
  };

  try {
    // Enviar la lista como mensaje separado
    await conn.sendMessage(m.chat, listMessage, { quoted: m });
  } catch (error) {
    console.error('Error al enviar lista:', error);
    // Fallback: enviar como texto simple
    let fallbackText = `*COMANDOS DISPONIBLES:*\n\n` +
      sections[0].rows.map((cmd, i) => `${i + 1}. *${cmd.title}* - ${cmd.description}\n   Usa: \`${cmd.rowId}\``).join('\n\n');
    
    await conn.sendMessage(m.chat, { 
      text: fallbackText,
      mentions: [user]
    }, { quoted: m });
  }
};

handler.help = ['haks', 'haker', 'hack'];
handler.tags = ['main'];
handler.command = ['haks', 'haker', 'hack', 'hacks'];

export default handler;