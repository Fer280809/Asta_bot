let handler = async (m, { conn, usedPrefix }) => {
  let totalreg = Object.keys(global.db.data.users).length;
  let totalCommands = Object.values(global.plugins).filter(
    (v) => v.help && v.tags
  ).length;
  let libreria = 'Baileys';
  let vs = '2.0.0';
  let userId = m.sender;

  let infoText = `╭─━━━━━━━━━━━━━━━─╮
│ 🎭 ¡Hola @${userId.split('@')[0]}! 💖
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

  let sections = [{
    title: "📌 Comandos principales",
    rows: [
      { title: "🔎 IANS", rowId: `${usedPrefix}IANS`, description: "Herramienta de búsqueda avanzada" },
      { title: "🕵️ Argus", rowId: `${usedPrefix}argus`, description: "Ver la velocidad del bot" },
      { title: "⚙️ MatrixPDF", rowId: `${usedPrefix}matrixpdf`, description: "Descargar PDF malicioso" },
      { title: "🦠 Virus pc", rowId: `${usedPrefix}viruspc`, description: "Virus para pc" },
      { title: "Próximamente", rowId: `${usedPrefix}cipher`, description: "Próximamente" },
      { title: "Próximamente", rowId: `${usedPrefix}netscan`, description: "Próximamente" },
      { title: "Próximamente", rowId: `${usedPrefix}dataminer`, description: "Próximamente" },
      { title: "Próximamente", rowId: `${usedPrefix}Próximamente`, description: "Próximamente" }
    ]
  }];

  let listMessage = {
    text: infoText,
    footer: "AstaBot ⚡",
    title: "🎭 *ASTABOT - MENÚ PRINCIPAL* 🎭",
    buttonText: "📋 ABRIR MENÚ",
    sections
  };

  try {
    // Intentar enviar como lista interactiva
    await conn.sendMessage(m.chat, listMessage, { quoted: m, mentions: [userId] });
  } catch (error) {
    console.error(error);
    // Fallback: enviar como mensaje normal
    await conn.sendMessage(m.chat, { 
      text: infoText + "\n\n" + sections[0].rows.map(r => `➤ ${r.title}: ${usedPrefix}${r.title.toLowerCase()}`).join('\n'),
      mentions: [userId]
    }, { quoted: m });
  }
};

handler.help = ['haks', 'haker', 'hack'];
handler.tags = ['main'];
handler.command = ['haks', 'haker', 'hack', 'hacks'];

export default handler;