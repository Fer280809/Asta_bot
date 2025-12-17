let handler = async (m, { conn, usedPrefix }) => {
  let totalreg = Object.keys(global.db.data.users).length;
  let totalCommands = Object.values(global.plugins).filter(
    (v) => v.help && v.tags
  ).length;
  let libreria = 'Baileys';
  let vs = '1.3';
  let userId = m.sender;
  
  let infoText = `╭─━━━━━━━━━━━━━━━─╮
│ 🎄 ¡Feliz Navidad @${userId.split('@')[0]}! 🎅
╰─━━━━━━━━━━━━━━━─╯

Me llamo『 𝕬𝖘𝖙𝖆-𝕭𝖔𝖙 𝓝𝓪𝓿𝓲𝓭𝓪𝓭 』🎁

╭─═⊰ 🎄 𝐄𝐒𝐓𝐀𝐃𝐎 𝐍𝐀𝐕𝐈𝐃𝐄Ñ𝐎
│ 🎅 Estado: ${(conn.user.jid == global.conn.user.jid ? '🟢 MODO NAVIDAD' : '🔗 ELFOS ACTIVOS')}
│ 👥 Usuarios: 『${totalreg.toLocaleString()}』🔥
│ 🎁 Comandos: 『${totalCommands}』✨
│ 📅 Librería » ${libreria}
│ 🌍 Servidor: Polo Norte 🎅
│ 📡 Ping: Alegría Navideña ✅
│ 💾 Versión: ${vs}
│ 🔒 Modo: ${(conn.user.jid == global.conn.user.jid ? '🔐 PRIVADO' : '🔓 PÚBLICO')}
╰───────────────╯

*Creador 𝕱𝖊𝖗𝖓𝖆𝖓𝖉𝖔 👑 con espíritu navideño 🎄*
Selecciona una opción:`;

  let buttons = [
    { buttonId: usedPrefix + 'menu2', buttonText: { displayText: '🎄 Menú Navideño' }, type: 1 },
    { buttonId: usedPrefix + 'nuevos', buttonText: { displayText: '🎁 Novedades' }, type: 1 },
    { buttonId: usedPrefix + 'code', buttonText: { displayText: '🤖 Ayuda Santa' }, type: 1 },
    { buttonId: usedPrefix + 'creador', buttonText: { displayText: '🎅 CREADOR' }, type: 1 },
    { buttonId: usedPrefix + 'menu+', buttonText: { displayText: '🍪 Galletas +' }, type: 1 }
  ];
  
  // URL de imagen navideña (recomiendo cambiarla por una imagen navideña)
  let mediaUrl = 'https://files.catbox.moe/nqvhaq.jpg'; // Cambia esto por una imagen navideña
  // Sugerencias de imágenes navideñas gratuitas:
  // https://images.unsplash.com/photo-1547716750-5c2e2c2b9d81 (Navidad)
  // https://images.unsplash.com/photo-1512389142860-9c449e58a543 (Árbol navideño)
  
  try {
    // Intenta enviar con imagen
    await conn.sendMessage(m.chat, {
      image: { url: mediaUrl },
      caption: infoText,
      footer: "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙 𝓝𝓪𝓿𝓲𝓭𝓪𝓭』🎄 ¡Felices Fiestas!",
      buttons: buttons,
      headerType: 4,
      mentions: [userId]
    }, { quoted: m });
  } catch {
    // Si falla, envía sin imagen (método alternativo)
    let buttonMessage = {
      text: infoText,
      footer: "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙 𝓝𝓪𝓿𝓲𝓭𝓪𝓭』🎄 ¡Que la magia te acompañe!",
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
