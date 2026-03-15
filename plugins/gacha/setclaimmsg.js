// ============================================
// plugins/gacha-setclaimmsg.js (ESTILO PREMIUM)
// ============================================
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply('❌ *Uso correcto:* /setclaim <mensaje>\n\n*Variables disponibles:*\n{user} - Nombre del usuario\n{character} - Nombre del personaje\n\n*Ejemplo:* /setclaim 🌸 {user} ha conquistado a {character}! 🌸');
    }
    
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
    }
    
    users[userId].claimMessage = text;
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    const userName = await conn.getName(userId);
    const preview = text
        .replace('{user}', userName)
        .replace('{character}', 'Ejemplo');
    
    // ========== TEXTO CON ESTILO PREMIUM ==========
    const txt = `
> . ﹡ ﹟ 💬 ׄ ⬭ *ᴍᴇɴsᴀᴊᴇ ᴘᴇʀsᴏɴᴀʟɪᴢᴀᴅᴏ* @${userId.split('@')[0]}

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💬* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  💬 *ᴍᴇɴsᴀᴊᴇ ᴅᴇ ᴄʟᴀɪᴍ* 💬
╰━━━━━━━━━━━━━━━━╯

> ## \`ᴠɪsᴛᴀ ᴘʀᴇᴠɪᴀ 👁️\`

${preview}

┌─⊷ *ᴠᴀʀɪᴀʙʟᴇs ᴅɪsᴘᴏɴɪʙʟᴇs*
│ {user} - ɴᴏᴍʙʀᴇ ᴅᴇʟ ᴜsᴜᴀʀɪᴏ
│ {character} - ɴᴏᴍʙʀᴇ ᴅᴇʟ ᴘᴇʀsᴏɴᴀᴊᴇ
└───────────────

> ## \`ᴄᴏɴғɪɢᴜʀᴀᴄɪᴏ́ɴ ɢᴜᴀʀᴅᴀᴅᴀ ✅\``.trim();

    // ========== SISTEMA DE ENVÍO PREMIUM ==========
    const isSubBot = conn.user?.jid !== global.conn?.user?.jid;
    const botConfig = conn.subConfig || {};
    
    let thumbnail = null;
    let imageUrl = isSubBot && botConfig.logoUrl ? botConfig.logoUrl 
        : global.icono || 'https://i.ibb.co/0Q3J9XZ/file.jpg';
    try {
        const response = await fetch(imageUrl);
        if (response.ok) thumbnail = await response.buffer();
    } catch (e) {}

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
                    title: `💬 Mensaje Personalizado`,
                    body: `Configurado por ${userName}`,
                    mediaType: 1,
                    mediaUrl: global.icono,
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

handler.help = ['setclaimmsg', 'setclaim'];
handler.tags = ['gacha'];
handler.command = ['setclaimmsg', 'setclaim'];
handler.group = true;
handler.reg = true;

export default handler;