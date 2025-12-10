let handler = async (m, { conn }) => {
  const botname = global.botname || "AstaBot";

  let message = `
✨ *Información del Creador* ✨

👤 *Nombre:* Fernando 
📱 *Número:* +52 50947298472
🌎 *País:* México
💻 *Repositorio:* https://github.com/Fer2808
🤖 *Bot:* ${botname}

🔹 Este bot fue creado para ofrecer herramientas y diversión en WhatsApp.
🔹 Puedes contactar al creador para soporte, dudas o sugerencias.
`;

  await conn.sendMessage(m.chat, { text: message }, { quoted: m });
};

// Configuración del comando
handler.help = ['creador', 'owner'];
handler.tags = ['info'];
handler.command = ['creador', 'owner', 'propietario'];

export default handler;
