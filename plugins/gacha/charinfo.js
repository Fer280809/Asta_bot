// ============================================
// plugins/gacha-charinfo.js (ESTILO PREMIUM)
// ============================================
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
    if (!text) return m.reply('❌ *Ingresa el nombre del personaje.*');
    
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    if (!fs.existsSync(dbPath)) {
        return m.reply('❀ No hay personajes disponibles.');
    }
    
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    // Buscar personaje
    const found = characters.find(c => 
        c.name.toLowerCase().includes(text.toLowerCase())
    );
    
    if (!found) {
        return m.reply('❌ *No se encontró ese personaje.*');
    }
    
    // Contar propietarios
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    const owners = Object.entries(users).filter(([id, data]) => 
        data.harem && data.harem.some(c => c.id === found.id)
    );
    
    const totalVotes = found.votes || 0;
    
    // Obtener imagen aleatoria
    const randomImg = found.img && found.img.length > 0 
        ? found.img[Math.floor(Math.random() * found.img.length)]
        : 'https://i.ibb.co/0Q3J9XZ/file.jpg';
    
    // ========== TEXTO CON ESTILO PREMIUM ==========
    const txt = `
> . ﹡ ﹟ ℹ️ ׄ ⬭ *ɪɴғᴏ ᴅᴇʟ ᴘᴇʀsᴏɴᴀᴊᴇ*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📊* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  ℹ️ *${found.name.toUpperCase()}* ℹ️
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *ᴅᴀᴛᴏs ʙᴀ́sɪᴄᴏs*
│ 📛 *ɴᴏᴍʙʀᴇ:* ${found.name}
│ ⚧️ *ɢᴇ́ɴᴇʀᴏ:* ${found.gender}
│ 📺 *sᴇʀɪᴇ:* ${found.source}
│ 💎 *ᴠᴀʟᴏʀ:* ${found.value}
│ 🆔 *ɪᴅ:* ${found.id}
└───────────────

┌─⊷ *ᴇsᴛᴀᴅɪ́sᴛɪᴄᴀs*
│ 👥 *ᴘʀᴏᴘɪᴇᴛᴀʀɪᴏs:* ${owners.length}
│ 🗳️ *ᴠᴏᴛᴏs:* ${totalVotes}
│ 📊 *ᴇsᴛᴀᴅᴏ:* ${found.status}
└───────────────`.trim();

    // ========== SISTEMA DE ENVÍO PREMIUM ==========
    const isSubBot = conn.user?.jid !== global.conn?.user?.jid;
    const botConfig = conn.subConfig || {};
    
    let thumbnail = null;
    try {
        const response = await fetch(randomImg);
        if (response.ok) thumbnail = await response.buffer();
    } catch (e) {}
    
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
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.channelRD?.id || "120363399175402285@newsletter",
                    serverMessageId: '',
                    newsletterName: global.channelRD?.name || "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』"
                },
                externalAdReply: {
                    title: `ℹ️ ${found.name}`,
                    body: `${found.source} • 💎 ${found.value} • 👥 ${owners.length} dueños`,
                    mediaType: 1,
                    mediaUrl: randomImg,
                    sourceUrl: randomImg,
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

handler.help = ['charinfo', 'winfo', 'waifuinfo'];
handler.tags = ['gacha'];
handler.command = ['charinfo', 'winfo', 'waifuinfo'];
handler.group = true;
handler.reg = true;

export default handler;