// ============================================
// plugins/gacha-givechar.js (ESTILO PREMIUM)
// ============================================
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
    if (!m.mentionedJid || m.mentionedJid.length === 0 || !text) {
        return m.reply('❌ *Uso correcto:* /givechar @usuario <nombre del personaje>\n\n*Ejemplo:* /givechar @usuario Miku');
    }
    
    const giverId = m.sender;
    const receiverId = m.mentionedJid[0];
    
    if (giverId === receiverId) {
        return m.reply('❌ *No puedes regalarte personajes a ti mismo.*');
    }
    
    // Extraer nombre del personaje
    const charName = text.replace(/@\d+/g, '').trim();
    
    if (!charName) {
        return m.reply('❌ *Debes especificar el nombre del personaje.*');
    }
    
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    if (!users[giverId] || !users[giverId].harem || users[giverId].harem.length === 0) {
        return m.reply('❌ *No tienes personajes para regalar.*');
    }
    
    const charIndex = users[giverId].harem.findIndex(c => 
        c.name.toLowerCase().includes(charName.toLowerCase())
    );
    
    if (charIndex === -1) {
        return m.reply('❌ *No tienes ese personaje en tu harem.*');
    }
    
    // Inicializar receptor si no existe
    if (!users[receiverId]) {
        users[receiverId] = {
            harem: [],
            favorites: [],
            claimMessage: '✧ {user} ha reclamado a {character}!',
            lastRoll: 0,
            votes: {},
            gachaCoins: 1000
        };
    }
    
    const char = users[giverId].harem[charIndex];
    
    // Verificar si el receptor ya tiene el personaje
    const alreadyHas = users[receiverId].harem.find(c => c.id === char.id);
    if (alreadyHas) {
        return m.reply('⚠️ *Ese usuario ya tiene este personaje.*');
    }
    
    // Transferir personaje
    users[receiverId].harem.push({ ...char, claimedAt: Date.now(), forSale: false, salePrice: 0 });
    users[giverId].harem.splice(charIndex, 1);
    
    // Actualizar en DB principal
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const dbCharIndex = characters.findIndex(c => c.id === char.id);
    if (dbCharIndex !== -1) {
        characters[dbCharIndex].user = receiverId;
        fs.writeFileSync(dbPath, JSON.stringify(characters, null, 2), 'utf-8');
    }
    
    // Eliminar de favoritos si está
    users[giverId].favorites = users[giverId].favorites.filter(id => id !== char.id);
    
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    const giverName = await conn.getName(giverId);
    const receiverName = await conn.getName(receiverId);
    
    // ========== TEXTO CON ESTILO PREMIUM ==========
    const txt = `
> . ﹡ ﹟ 🎁 ׄ ⬭ *¡ʀᴇɢᴀʟᴏ ᴇɴᴠɪᴀᴅᴏ!* @${giverId.split('@')[0]}

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🎁* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  🎁 *ᴛʀᴀɴsғᴇʀᴇɴᴄɪᴀ ᴄᴏᴍᴘʟᴇᴛᴀᴅᴀ* 🎁
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *ᴘᴇʀsᴏɴᴀᴊᴇ ʀᴇɢᴀʟᴀᴅᴏ*
│ 🎴 *ɴᴏᴍʙʀᴇ:* ${char.name}
│ 📺 *sᴇʀɪᴇ:* ${char.source}
│ 💎 *ᴠᴀʟᴏʀ:* ${char.value}
└───────────────

┌─⊷ *ᴘᴀʀᴛɪᴄɪᴘᴀɴᴛᴇs*
│ 🎁 *ᴅᴏɴᴀᴅᴏʀ:* ${giverName}
│ 🎀 *ʀᴇᴄᴇᴘᴛᴏʀ:* ${receiverName}
└───────────────

> ## \`ᴀᴄᴛᴏ ᴅᴇ ɢᴇɴᴇʀᴏsɪᴅᴀᴅ ❤️\``;

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
                mentionedJid: [giverId, receiverId],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.channelRD?.id || "120363399175402285@newsletter",
                    serverMessageId: '',
                    newsletterName: global.channelRD?.name || "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』"
                },
                externalAdReply: {
                    title: `🎁 ${char.name} Regalada`,
                    body: `De ${giverName} para ${receiverName}`,
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
        
        // Notificar al receptor
        conn.sendMessage(receiverId, { 
            text: `🎁 *¡ʀᴇɢᴀʟᴏ ʀᴇᴄɪʙɪᴅᴏ!*\n\n*${giverName}* ᴛᴇ ʜᴀ ʀᴇɢᴀʟᴀᴅᴏ ᴀ *${char.name}*!`,
            contextInfo: {
                externalAdReply: {
                    title: `🎁 Regalo Recibido`,
                    body: `${char.name} • ${char.source}`,
                    mediaType: 1,
                    thumbnail: thumbnail
                }
            }
        });
    } catch (e) {
        await conn.reply(m.chat, txt, m);
    }
};

handler.help = ['givechar', 'givewaifu', 'regalar'];
handler.tags = ['gacha'];
handler.command = ['givechar', 'givewaifu', 'regalar'];
handler.group = true;
handler.reg = true;

export default handler;