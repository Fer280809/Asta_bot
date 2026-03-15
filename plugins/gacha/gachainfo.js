// ============================================
// plugins/gacha-gachainfo.js (ESTILO PREMIUM)
// ============================================
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn }) => {
    const userId = m.sender;
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    if (!users[userId]) {
        users[userId] = {
            harem: [],
            favorites: [],
            claimMessage: '✧ {user} ha reclamado a {character}!',
            lastRoll: 0,
            votes: {},
            gachaCoins: 1000
        };
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    }
    
    const user = users[userId];
    const userName = await conn.getName(userId);
    
    // Calcular valor total del harem
    const totalValue = user.harem.reduce((sum, char) => sum + parseInt(char.value || 0), 0);
    
    // Contar personajes en venta
    const forSale = user.harem.filter(c => c.forSale).length;
    
    // Tiempo desde último roll
    const lastRollTime = user.lastRoll ? new Date(user.lastRoll).toLocaleString('es-ES') : 'Nunca';
    
    // ========== TEXTO CON ESTILO PREMIUM ==========
    const txt = `
> . ﹡ ﹟ 📊 ׄ ⬭ *ᴘᴇʀғɪʟ ɢᴀᴄʜᴀ* @${userId.split('@')[0]}

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📊* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  📊 *${userName.toUpperCase()}* 📊
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *ᴇsᴛᴀᴅɪ́sᴛɪᴄᴀs*
│ 👤 *ᴜsᴜᴀʀɪᴏ:* ${userName}
│ 💖 *ᴘᴇʀsᴏɴᴀᴊᴇs:* ${user.harem.length}
│ ⭐ *ғᴀᴠᴏʀɪᴛᴏs:* ${user.favorites.length}
│ 💰 *ɢᴀᴄʜᴀᴄᴏɪɴs:* ${user.gachaCoins}
│ 🏪 *ᴇɴ ᴠᴇɴᴛᴀ:* ${forSale}
│ 💎 *ᴠᴀʟᴏʀ ᴛᴏᴛᴀʟ:* ${totalValue}
└───────────────

┌─⊷ *ᴀᴄᴛɪᴠɪᴅᴀᴅ*
│ 🎲 *ᴜ́ʟᴛɪᴍᴏ ʀᴏʟʟ:* ${lastRollTime}
│ 🗳️ *ᴠᴏᴛᴏs ᴅᴀᴅᴏs:* ${Object.keys(user.votes).length}
└───────────────

> ## \`ᴍᴇɴsᴀᴊᴇ ᴅᴇ ᴄʟᴀɪᴍ 💬\`

${user.claimMessage}`.trim();

    // ========== SISTEMA DE ENVÍO PREMIUM ==========
    const isSubBot = conn.user?.jid !== global.conn?.user?.jid;
    const botConfig = conn.subConfig || {};
    
    // Obtener imagen del personaje favorito o primero del harem
    let profileImg = null;
    if (user.favorites.length > 0) {
        const favChar = user.harem.find(c => c.id === user.favorites[0]);
        if (favChar?.img?.length > 0) profileImg = favChar.img[0];
    }
    if (!profileImg && user.harem.length > 0 && user.harem[0].img?.length > 0) {
        profileImg = user.harem[0].img[0];
    }
    
    let thumbnail = null;
    if (profileImg) {
        try {
            const response = await fetch(profileImg);
            if (response.ok) thumbnail = await response.buffer();
        } catch (e) {}
    }
    
    if (!thumbnail) {
        let imageUrl = isSubBot && botConfig.logoUrl ? botConfig.logoUrl 
            : global.icono || global.banner 
            || 'https://i.ibb.co/0Q3J9XZ/file.jpg';
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
                    title: `📊 Perfil Gacha de ${userName}`,
                    body: `${user.harem.length} waifus • 💎 ${totalValue} valor total`,
                    mediaType: 1,
                    mediaUrl: profileImg || global.icono,
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

handler.help = ['gachainfo', 'ginfo', 'infogacha'];
handler.tags = ['gacha'];
handler.command = ['gachainfo', 'ginfo', 'infogacha'];
handler.group = true;
handler.reg = true;

export default handler;