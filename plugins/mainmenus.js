let handler = async (m, { conn, usedPrefix }) => {
    // Imagen del bot desde settings.js
    let menuImage = global.icono || "https://files.catbox.moe/nqvhaq.jpg";
    
    let txt = `🎮 *${global.botname || 'Asta-Bot'} - PANEL DE CONTROL* 🎮

╔════════════════════════╗
   🚀 *PANEL PRINCIPAL*
╚════════════════════════╝

¡Bienvenido al panel de control principal!
Desde aquí puedes acceder a todas las secciones del bot.

*Secciones disponibles:*

🏠 *HOME* - Regresa al menú principal
📱 *MENU* - Accede al menú de inicio rápido
🔞 *MENU +18* - Contenido exclusivo para adultos
👑 *MENU DEV* - Herramientas para desarrolladores

╔════════════════════════╗
 💡 *INFORMACIÓN RÁPIDA*
╚════════════════════════╝

▸ *Bot:* ${global.botname || 'Asta-Bot'}
▸ *Prefijo:* ${usedPrefix}
▸ *Usuario:* @${m.sender.split('@')[0]}
▸ *Hora:* ${new Date().toLocaleTimeString()}

*Selecciona una opción con los botones de abajo*`;

    const buttonMessage = {
        image: { url: menuImage },
        caption: txt,
        footer: `${global.botname || 'Asta-Bot'} | Panel de Control`,
        buttons: [
            {
                buttonId: `${usedPrefix}menu`,
                buttonText: { displayText: '🏠 HOME' },
                type: 1
            },
            {
                buttonId: `${usedPrefix}start`,
                buttonText: { displayText: '📱 MENU' },
                type: 1
            },
            {
                buttonId: `${usedPrefix}menu+`,
                buttonText: { displayText: '🔞 MENU +18' },
                type: 1
            },
            {
                buttonId: `${usedPrefix}dev`,
                buttonText: { displayText: '👑 MENU OWNER' },
                type: 1
            }
        ],
        headerType: 1,
        mentions: [m.sender]
    };
    
    await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
};

handler.help = ['menu1']
handler.tags = ['main']
handler.command = ['menu1', 'mainmenus', 'main-menu', 'controlpanel', 'panel']

export default handler
