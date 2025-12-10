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
      title: "📌 Comandos principales",
      rows: [
        { 
          title: "🔎 IANS", 
          description: "Herramienta de búsqueda avanzada",
          rowId: usedPrefix + 'IANS'
        },
        { 
          title: "🕵️ Argus", 
          description: "Ver la velocidad del bot",
          rowId: usedPrefix + 'argus'
        },
        { 
          title: "⚙️ MatrixPDF", 
          description: "Descargar PDF malicioso",
          rowId: usedPrefix + 'matrixpdf'
        },
        { 
          title: "🦠 Virus pc", 
          description: "Virus para pc",
          rowId: usedPrefix + 'viruspc'
        },
        { 
          title: "Próximamente", 
          description: "Próximamente - ",
          rowId: usedPrefix + 'cipher'
        },
        { 
          title: "Próximamente", 
          description: "Próximamente - ",
          rowId: usedPrefix + 'netscan'
        },
        { 
          title: "Próximamente", 
          description: "Próximamente ",
          rowId: usedPrefix + 'dataminer'
        },
        { 
          title: "Próximamente", 
          description: "Próximamente",
          rowId: usedPrefix + 'Próximamente'
        },
        { 
          title: "Próximamente", 
          description: "Próximamente",
          rowId: usedPrefix + 'Próximamente'
        },
        { 
          title: "Próximamente", 
          description: "Próximamente",
          rowId: usedPrefix + 'Próximamente'
        },
        { 
          title: "Próximamente", 
          description: "Próximamente",
          rowId: usedPrefix + 'Próximamente'
        },
        { 
          title: "Próximamente", 
          description: "Próximamente",
          rowId: usedPrefix + 'Próximamente'
        },
        { 
          title: "Próximamente", 
          description: "Próximamente",
          rowId: usedPrefix + 'Próximamente'
        },
        { 
          title: "Próximamente", 
          description: "Próximamente",
          rowId: usedPrefix + 'Próximamente'
        }
      ]
    }
  ];
  
  // URL de la imagen o video (puedes cambiarla por tu propia URL)
  let mediaUrl = 'https://files.catbox.moe/wrwuls.png'; // Cambia esto por tu imagen
  // let mediaUrl = 'https://example.com/video.mp4'; // O usa un video
  
  let listMessage = {
    text: infoText,
    footer: "AstaBot ⚡",
    title: "Selecciona una opción",
    buttonText: "Abrir menú 📋",
    sections,
    mentions: [userId]
  };
  
  try {
    // Enviar con imagen
    await conn.sendMessage(m.chat, {
      image: { url: mediaUrl },
      caption: infoText,
      footer: "AstaBot ⚡",
      buttonText: "Abrir menú 📋",
      sections: sections,
      mentions: [userId]
    }, { quoted: m });
  } catch {
    // Si falla, enviar sin imagen
    await conn.sendMessage(m.chat, listMessage, { quoted: m });
  }
};

handler.help = ['haks', 'haker', 'hack'];
handler.tags = ['main'];
handler.command = ['haks', 'haker', 'hack', 'hacks'];

export default handler;