// plugins/menu2.js
import { readdirSync, statSync } from 'fs'
import { join } from 'path'

const MenuData = {
    "MENU_INICIO": {
        title: "¡BIENVENIDO! 🌟",
        body: (totalreg, userId, conn) => `
╭─━━━━━━━━━━━━━━━─╮
│ 🎁 ¡Hola @${userId.split('@')[0]}! 🌟
╰─━━━━━━━━━━━━━━━─╯
Me llamo 『 𝕬𝖘𝖙𝖆-𝕭𝖔𝖙 』

╭─═⊰ 🎀 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂𝐈Ó𝐍
│ 🤖 Estado: ${(conn.user.jid == global.conn.user.jid ? '🟢 ACTIVO' : '🔗 SUB-BOT')}
│ 👥 Usuarios: 『${totalreg}』
│ 🛠️ Comandos: 『${Object.values(global.plugins).filter(v => v.help && v.tags).length}』
│ 📅 Librería: Baileys
│ 💾 Versión: 1.3.1
╰───────────────╯

*🤖 PON #code O #qr PARA HACERTE SUBBOT*`.trim()
    },
    "ECONOMY": { 
        title: "💰 ECONOMÍA",
        body: `╰┈➤ ✿ Comandos para ganar y gestionar coins.
╰┈➤ 💼 *#work* | 💃 *#slut* | 🎲 *#cf*
╰┈➤ 🚨 *#crime* | 🎯 *#rt* | 🎰 *#slot*
╰┈➤ 🏦 *#bal* | 💳 *#dep* | 💸 *#with*
╰┈➤ 🎁 *#daily* | 🧰 *#cofre* | 🕶️ *#rob*`.trim()
    },
    "DOWNLOAD": {
        title: "📥 DESCARGAS",
        body: `╰┈➤ ✿ Descarga contenido de redes sociales.
╰┈➤ 🎵 *#tiktok* | 🎶 *#play* | 📘 *#fb*
╰┈➤ 📂 *#mediafire* | 📂 *#mega* | 📸 *#ig*
╰┈➤ 📌 *#pin* | 🔍 *#img* | 📱 *#apk*`.trim()
    },
    "GACHA": {
        title: "🎴 GACHA / WAIFUS",
        body: `╰┈➤ ✿ Colecciona y gestiona personajes.
╰┈➤ 🎲 *#roll* | ✨ *#claim* | 👥 *#harem*
╰┈➤ 🛒 *#buychar* | 💰 *#sell* | 🔄 *#trade*
╰┈➤ ℹ️ *#charinfo* | 🏆 *#wtop*`.trim()
    },
    "SOCKETS": {
        title: "🔌 CONEXIÓN",
        body: `╰┈➤ ✿ Gestión de Sub-Bots y estado.
╰┈➤ 🔗 *#qr* | 🤖 *#bots* | 📈 *#status*
╰┈➤ 🏓 *#ping* | ➕ *#join* | ❌ *#leave*`.trim()
    },
    "UTILITIES": {
        title: "🛠️ UTILIDADES",
        body: `╰┈➤ ✿ Herramientas y funciones varias.
╰┈➤ 🎨 *#s* (Sticker) | 🖌️ *#brat* | 🔧 *#hd*
╰┈➤ 🌐 *#ss* | 🌍 *#trad* | 🤖 *#ia*
╰┈➤ 🔗 *#tourl* | 📚 *#wiki* | 🔎 *#google*`.trim()
    },
    "PROFILES": {
        title: "👤 PERFILES",
        body: `╰┈➤ ✿ Configura tu identidad en el bot.
╰┈➤ 📝 *#profile* | 📊 *#lvl* | 🏆 *#top*
╰┈➤ 💍 *#marry* | 💔 *#divorce* | 💎 *#prem*`.trim()
    },
    "GROUPS": {
        title: "👥 GRUPOS",
        body: `╰┈➤ ✿ Gestión para administradores.
╰┈➤ 📢 *#tagall* | 🚫 *#kick* | ⬆️ *#promote*
╰┈➤ 🔒 *#close* | 🎉 *#welcome* | ⚠️ *#warn*
╰┈➤ 🔎 *#config* | 🔗 *#antilink*`.trim()
    },
    "ANIME": {
        title: "🎌 REACCIONES ANIME",
        body: `╰┈➤ ✿ Interactúa con otros usuarios.
╰┈➤ 😘 *#kiss* | 🤗 *#hug* | 👋 *#slap*
╰┈➤ 👊 *#punch* | 😂 *#laugh* | 😢 *#cry*
╰┈➤ 💃 *#dance* | 😏 *#smug* | 👋 *#wave*`.trim()
    }
};

const MenuOrder = Object.keys(MenuData);

let handler = async (m, { conn, usedPrefix, text }) => {
    let currentIndex = parseInt(text) || 0;
    currentIndex = Math.max(0, Math.min(currentIndex, MenuOrder.length - 1));
    
    const currentCategoryKey = MenuOrder[currentIndex];
    const currentMenu = MenuData[currentCategoryKey];
    
    let bodyText = "";
    if (currentCategoryKey === "MENU_INICIO") {
        const totalreg = Object.keys(global.db.data.users).length;
        bodyText = currentMenu.body(totalreg, m.sender, conn);
    } else {
        bodyText = `╭ *Página ${currentIndex + 1}/${MenuOrder.length}*\n╰──────────────────\n\n*${currentMenu.title}*\n\n${currentMenu.body}`;
    }

    const buttons = [];
    if (currentIndex > 0) buttons.push({ buttonId: `${usedPrefix}menu2 ${currentIndex - 1}`, buttonText: { displayText: '◀️ Anterior' }, type: 1 });
    if (currentIndex < MenuOrder.length - 1) buttons.push({ buttonId: `${usedPrefix}menu2 ${currentIndex + 1}`, buttonText: { displayText: 'Siguiente ▶️' }, type: 1 });
    buttons.push({ buttonId: `${usedPrefix}code`, buttonText: { displayText: '🤖 Sub-Bot' }, type: 1 });

    const isButton = m.quoted && m.quoted.fromMe && m.quoted.buttons;
    const commonParams = {
        footer: "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡",
        buttons,
        mentions: [m.sender]
    };

    if (isButton) {
        await conn.sendMessage(m.chat, { text: bodyText, edit: m.quoted.vM.key, ...commonParams });
    } else {
        await conn.sendMessage(m.chat, { image: { url: 'https://files.catbox.moe/nqvhaq.jpg' }, caption: bodyText, ...commonParams }, { quoted: m });
    }
};

handler.help = ['menu2'];
handler.tags = ['main'];
handler.command = /^(menu2|menú2|help2)$/i;

export default handler;
