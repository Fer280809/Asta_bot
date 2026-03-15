// ============================================
// plugins/gacha-delclaimmsg.js (ESTILO PREMIUM)
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
        return m.reply('❌ *No tienes un perfil creado.*');
    }
    
    users[userId].claimMessage = '✧ {user} ha reclamado a {character}!';
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    // ========== TEXTO CON ESTILO PREMIUM ==========
    const txt = `
> . ﹡ ﹟ 🔄 ׄ ⬭ *ᴍᴇɴsᴀᴊᴇ ʀᴇsᴛᴀʙʟᴇᴄɪᴅᴏ* @${userId.split('@')[0]}

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🔄* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  🔄 *ᴄᴏɴғɪɢᴜʀᴀᴄɪᴏ́ɴ ᴘᴏʀ ᴅᴇғᴇᴄᴛᴏ* 🔄
╰━━━━━━━━━━━━━━━━╯

> ## \`ᴍᴇɴsᴀᴊᴇ ᴘʀᴇᴅᴇᴛᴇʀᴍɪɴᴀᴅᴏ ✅\`

*✧ {user} ha reclamado a {character}!*

*ᴛᴜ ᴍᴇɴsᴀᴊᴇ ᴅᴇ ᴄʟᴀɪᴍ ʜᴀ sɪᴅᴏ ʀᴇsᴛᴀʙʟᴇᴄɪᴅᴏ ᴀʟ ᴠᴀʟᴏʀ ᴘᴏʀ ᴅᴇғᴇᴄᴛᴏ.*`.trim();

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
                    title: `🔄 Mensaje Restablecido`,
                    body: `Configuración por defecto aplicada`,
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

handler.help = ['delclaimmsg'];
handler.tags = ['gacha'];
handler.command = ['delclaimmsg'];
handler.group = true;
handler.reg = true;

export default handler;