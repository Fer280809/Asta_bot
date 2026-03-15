// ============================================
// plugins/gacha-sell.js (ESTILO PREMIUM)
// ============================================
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
    const args = text.split(',').map(arg => arg.trim());
    
    if (args.length < 2) {
        return m.reply('❌ *Uso correcto:* /sell <precio>, <nombre del personaje>\n\n*Ejemplo:* /sell 500, Miku');
    }
    
    const price = parseInt(args[0]);
    const charName = args.slice(1).join(',').trim();
    
    if (isNaN(price) || price <= 0) {
        return m.reply('❌ *El precio debe ser un número válido mayor a 0.*');
    }
    
    const userId = m.sender;
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    if (!users[userId] || !users[userId].harem || users[userId].harem.length === 0) {
        return m.reply('❌ *No tienes personajes para vender.*');
    }
    
    const charIndex = users[userId].harem.findIndex(c => 
        c.name.toLowerCase().includes(charName.toLowerCase())
    );
    
    if (charIndex === -1) {
        return m.reply('❌ *No tienes ese personaje en tu harem.*');
    }
    
    // Marcar personaje en venta
    users[userId].harem[charIndex].forSale = true;
    users[userId].harem[charIndex].salePrice = price;
    
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    const char = users[userId].harem[charIndex];
    
    // ========== TEXTO CON ESTILO PREMIUM ==========
    const txt = `
> . ﹡ ﹟ 🏪 ׄ ⬭ *ᴘᴇʀsᴏɴᴀᴊᴇ ᴇɴ ᴠᴇɴᴛᴀ* @${userId.split('@')[0]}

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💰* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  🏪 *ᴇɴ ᴠᴇɴᴛᴀ* 🏪
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *ᴅᴇᴛᴀʟʟᴇs*
│ 🎴 *ɴᴏᴍʙʀᴇ:* ${char.name}
│ 📺 *sᴇʀɪᴇ:* ${char.source}
│ 💎 *ᴠᴀʟᴏʀ:* ${char.value}
│ 💰 *ᴘʀᴇᴄɪᴏ:* ¥${price}
└───────────────

> ## \`ᴍᴀʀᴄᴀᴅᴏ ᴇxɪᴛᴏsᴀᴍᴇɴᴛᴇ ✅\`

*ᴜsᴀ /haremshop ᴘᴀʀᴀ ᴠᴇʀ ʟᴀ ᴛɪᴇɴᴅᴀ*`.trim();

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
                    title: `🏪 ${char.name} en Venta`,
                    body: `Precio: ¥${price} • ${char.source}`,
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

handler.help = ['sell', 'vender'];
handler.tags = ['gacha'];
handler.command = ['sell', 'vender'];
handler.group = true;
handler.reg = true;

export default handler;