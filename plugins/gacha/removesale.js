// ============================================
// plugins/gacha-removesale.js (ESTILO PREMIUM)
// ============================================
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply('❌ *Uso correcto:* /removesale <nombre del personaje>');
    }
    
    const userId = m.sender;
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    if (!users[userId] || !users[userId].harem || users[userId].harem.length === 0) {
        return m.reply('❌ *No tienes personajes en venta.*');
    }
    
    const charIndex = users[userId].harem.findIndex(c => 
        c.name.toLowerCase().includes(text.toLowerCase()) && c.forSale
    );
    
    if (charIndex === -1) {
        return m.reply('❌ *No tienes ese personaje en venta.*');
    }
    
    const char = users[userId].harem[charIndex];
    
    // Quitar de venta
    users[userId].harem[charIndex].forSale = false;
    users[userId].harem[charIndex].salePrice = 0;
    
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    // ========== TEXTO CON ESTILO PREMIUM ==========
    const txt = `
> . ﹡ ﹟ 🏪 ׄ ⬭ *ᴘᴇʀsᴏɴᴀᴊᴇ ʀᴇᴛɪʀᴀᴅᴏ* @${userId.split('@')[0]}

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🏪* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  🏪 *ғᴜᴇʀᴀ ᴅᴇ ʟᴀ ᴛɪᴇɴᴅᴀ* 🏪
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *ᴅᴇᴛᴀʟʟᴇs*
│ 🎴 *ɴᴏᴍʙʀᴇ:* ${char.name}
│ 📺 *sᴇʀɪᴇ:* ${char.source}
│ 💎 *ᴠᴀʟᴏʀ:* ${char.value}
└───────────────

> ## \`ʀᴇᴛɪʀᴀᴅᴏ ᴅᴇ ʟᴀ ᴠᴇɴᴛᴀ ✅\`

*${char.name}* ʏᴀ ɴᴏ ᴇsᴛᴀ́ ᴇɴ ᴠᴇɴᴛᴀ ᴇɴ ᴇʟ ᴍᴇʀᴄᴀᴅᴏ.

*ᴛᴜ ᴘᴇʀsᴏɴᴀᴊᴇ ʜᴀ ᴠᴜᴇʟᴛᴏ ᴀ ᴛᴜ ʜᴀʀᴇᴍ ᴘʀɪᴠᴀᴅᴏ.*`.trim();

    // ========== SISTEMA DE ENVÍO PREMIUM ==========
    const isSubBot = conn.user?.jid !== global.conn?.user?.jid;
    const botConfig = conn.subConfig || {};
    
    let thumbnail = null;
    if (char.img && char.img.length > 0) {
        try {
            const response = await fetch(char.img[0]);
            if (response.ok) thumbnail = await response.buffer();
        } catch (e) {}
    }
    
    if (!thumbnail) {
        let imageUrl = isSubBot && botConfig.logoUrl ? botConfig.logoUrl 
            : global.icono || 'https://i.ibb.co/0Q3J9XZ/file.jpg';
        try {
            const response = await fetch(imageUrl);
            if (response.ok) thumbnail = await response.buffer();
        } catch (e) {}
    }

    try {
        await conn.sendMessage(m.chat, { 
            text: txt,
            contextInfo: {
                mentionedJid: [userId],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.channelRD?.id || "120363399175402285@newsletter",
                    serverMessageId: '',
                    newsletterName: global.channelRD?.name || "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』"
                },
                externalAdReply: {
                    title: `🏪 ${char.name} Retirado`,
                    body: `Ya no está en venta`,
                    mediaType: 1,
                    mediaUrl: char.img?.[0] || global.icono,
                    sourceUrl: global.redes || global.channel,
                    thumbnail: thumbnail || await (await fetch(global.icono)).buffer(),
                    showAdAttribution: false,
                    containsAutoReply: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
    } catch (e) {
        await conn.reply(m.chat, txt, m);
    }
};

handler.help = ['removesale', 'removerventa'];
handler.tags = ['gacha'];
handler.command = ['removesale', 'removerventa'];
handler.group = true;
handler.reg = true;

export default handler;