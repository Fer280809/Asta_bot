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

  let sections = [
    {
      title: "📌 COMANDOS HACKER",
      rows: [
        { title: "🔎 IANS", rowId: `${usedPrefix}IANS`, description: "Herramienta de búsqueda avanzada" },
        { title: "🕵️ Argus", rowId: `${usedPrefix}argus`, description: "Ver la velocidad del bot" },
        { title: "⚙️ MatrixPDF", rowId: `${usedPrefix}matrixpdf`, description: "Descargar PDF malicioso" },
        { title: "🦠 Virus PC", rowId: `${usedPrefix}viruspc`, description: "Virus para pc" }
      ]
    },
    {
      title: "📌 PRÓXIMAMENTE",
      rows: [
        { title: "📊 Dataminer", rowId: `${usedPrefix}dataminer`, description: "En desarrollo" },
        { title: "🔐 Cipher", rowId: `${usedPrefix}cipher`, description: "En desarrollo" },
        { title: "🌐 Netscan", rowId: `${usedPrefix}netscan`, description: "En desarrollo" }
      ]
    }
  ];

  // OPCIÓN 1: Lista CON imagen (headerType: 1 para imagen)
  let listMessageWithImage = {
    text: infoText,
    footer: "AstaBot ⚡ | Selecciona un comando",
    title: "🎭 ASTABOT - MENÚ HACKER",
    buttonText: "VER COMANDOS 📋",
    sections: sections,
    headerType: 1,
    // Puedes agregar imagen aquí si quieres
    // image: { url: 'https://files.catbox.moe/wrwuls.png' }
  };

  // OPCIÓN 2: Lista SIN imagen
  let listMessage = {
    text: infoText,
    footer: "AstaBot ⚡ | Selecciona un comando",
    title: "🎭 ASTABOT - MENÚ HACKER",
    buttonText: "VER COMANDOS 📋",
    sections: sections
  };

  // Intentar enviar
  try {
    // Enviar la lista directamente
    await conn.sendMessage(m.chat, listMessage, { 
      quoted: m,
      mentions: [userId]
    });
    
  } catch (error) {
    console.error("Error lista:", error);
    
    // Si falla, probar método alternativo
    try {
      // Método alternativo usando template messages
      let template = {
        text: infoText,
        templateButtons: [
          { index: 1, urlButton: { displayText: '🔗 GitHub', url: 'https://github.com' } },
          { index: 1, quickReplyButton: { displayText: `🔎 IANS`, id: `${usedPrefix}IANS` } },
          { index: 2, quickReplyButton: { displayText: `🕵️ Argus`, id: `${usedPrefix}argus` } },
          { index: 3, quickReplyButton: { displayText: `⚙️ MatrixPDF`, id: `${usedPrefix}matrixpdf` } },
          { index: 4, quickReplyButton: { displayText: `🦠 Virus PC`, id: `${usedPrefix}viruspc` } }
        ]
      };
      
      await conn.sendMessage(m.chat, template, { quoted: m });
      
    } catch (err2) {
      console.error("Error template:", err2);
      
      // Último fallback
      await conn.sendMessage(m.chat, { 
        text: `${infoText}\n\n` +
              "*Usa:*\n" +
              `• ${usedPrefix}IANS\n` +
              `• ${usedPrefix}argus\n` +
              `• ${usedPrefix}matrixpdf\n` +
              `• ${usedPrefix}viruspc\n` +
              `• ${usedPrefix}dataminer\n` +
              `• ${usedPrefix}cipher`,
        mentions: [userId]
      }, { quoted: m });
    }
  }
};

handler.help = ['haks', 'haker', 'hack'];
handler.tags = ['main'];
handler.command = ['haks', 'haker', 'hack', 'hacks'];

export default handler;