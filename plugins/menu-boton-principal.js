let handler = async (m, { conn, usedPrefix }) => {
  let totalreg = Object.keys(global.db.data.users).length;
  let totalCommands = Object.values(global.plugins).filter(
    (v) => v.help && v.tags
  ).length;
  let libreria = 'Baileys';
  let vs = '1.3';
  let userId = m.sender;
  
  let infoText = `╭─━━━━━━━━━━━━━━━─╮
│ 🎭 ¡Hola @${userId.split('@')[0]}! 💖
╰─━━━━━━━━━━━━━━━─╯

Me llamo『 𝕬𝖘𝖙𝖆-𝕭𝖔𝖙 』⚡

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

*Creador 𝕱𝖊𝖗𝖓𝖆𝖓𝖉𝖔 👑*
Selecciona una opción:`;

  let buttons = [
    { buttonId: usedPrefix + 'menu2', buttonText: { displayText: '📜 Menú' }, type: 1 },
    { buttonId: usedPrefix + 'nuevos', buttonText: { displayText: '📌 Actualizaciones' }, type: 1 },
    { buttonId: usedPrefix + 'code', buttonText: { displayText: '🤖 Sup-Bot' }, type: 1 },
    { buttonId: usedPrefix + 'creador', buttonText: { displayText: '👑 CREADOR' }, type: 1 },
    { buttonId: usedPrefix + 'menu+', buttonText: { displayText: '➕ Menu +18' }, type: 1 }
  ];
  
  // URL de la imagen o video (cambia por tu propia URL)
  let mediaUrl = 'https://github.com/Fer280809/Asta_bot/blob/main/lib/catalogo.jpg'; // Cambia esto por tu imagen
  // let mediaUrl = 'https://example.com/video.mp4'; // O usa un video
  
  try {
    // Intenta enviar con imagen
    await conn.sendMessage(m.chat, {
      image: { url: mediaUrl },
      caption: infoText,
      footer: "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡",
      buttons: buttons,
      headerType: 4,
      mentions: [userId]
    }, { quoted: m });
  } catch {
    // Si falla, envía sin imagen (método alternativo)
    let buttonMessage = {
      text: infoText,
      footer: "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡",
      buttons: buttons,
      headerType: 1,
      mentions: [userId]
    };
    await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
  }
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menú', 'menu', 'help'];

export default handler;