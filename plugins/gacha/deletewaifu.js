// ============================================
// plugins/gacha-deletewaifu.js (ESTILO PREMIUM)
// ============================================
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply('❌ *Uso correcto:* /delwaifu <nombre del personaje>');
    }
    
    const userId = m.sender;
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    if (!users[userId] || !users[userId].harem || users[userId].harem.length === 0) {
        return m.reply('❌ *No tienes personajes para eliminar.*');
    }
    
    const charIndex = users[userId].harem.findIndex(c => 
        c.name.toLowerCase().includes(text.toLowerCase())
    );
    
    if (charIndex === -1) {
        return m.reply('❌ *No tienes ese personaje en tu harem.*');
    }
    
    const char = users[userId].harem[charIndex];
    const charName = char.name;
    
    // Actualizar en DB principal
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const dbCharIndex = characters.findIndex(c => c.id === char.id);
    if (dbCharIndex !== -1) {
        characters[dbCharIndex].user = null;
        characters[dbCharIndex].status = 'Libre';
        fs.writeFileSync(dbPath, JSON.stringify(characters, null, 2), 'utf-8');
    }
    
    // Eliminar personaje
    users[userId].harem.splice(charIndex, 1);
    
    // Eliminar de favoritos si está
    users[userId].favorites = users[userId].favorites.filter(id => id !== char.id);
    
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    // ========== TEXTO CON ESTILO PREMIUM ==========
    const txt = `
> . ﹡ ﹟ 🗑️ ׄ ⬭ *ᴘᴇʀsᴏɴᴀᴊᴇ ᴇʟɪᴍɪɴᴀᴅᴏ* @${userId.split('@')[0]}

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🗑️* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  🗑️ *ᴇʟɪᴍɪɴᴀᴄɪᴏ́ɴ ᴄᴏᴍᴘʟᴇᴛᴀᴅᴀ* 🗑️
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *ᴅᴇᴛᴀʟʟᴇs*
│ 🎴 *ɴᴏᴍʙʀᴇ:* ${charName}
│ 📺 *sᴇʀɪᴇ:* ${char.source}
│ 💎 *ᴠᴀʟᴏʀ:* ${char.value}
└───────────────

> ## \`ʟɪʙᴇʀᴀᴅᴏ ᴀ ʟᴀ ɴᴀᴛᴜʀᴀʟᴇᴢᴀ 🍃\`

*${charName}* ʜᴀ sɪᴅᴏ ᴇʟɪᴍɪɴᴀᴅᴏ ᴅᴇ ᴛᴜ ʜᴀʀᴇᴍ.

📊 *ᴛᴏᴛᴀʟ ᴀᴄᴛᴜᴀʟ:* ${users[userId].harem.length} ᴘᴇʀsᴏɴᴀᴊᴇs`.trim();

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
                    title: `🗑️ ${charName} Eliminado`,
                    body: `Eliminado de tu harem • ${users[userId].harem.length} restantes`,
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

handler.help = ['deletewaifu', 'delwaifu', 'delchar'];
handler.tags = ['gacha'];
handler.command = ['deletewaifu', 'delwaifu', 'delchar'];
handler.group = true;
handler.reg = true;

export default handler;