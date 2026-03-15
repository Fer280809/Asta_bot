// ============================================
// plugins/gacha-vote.js (ESTILO PREMIUM)
// ============================================
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply('❌ *Uso correcto:* /vote <nombre del personaje>');
    }
    
    const userId = m.sender;
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    if (!fs.existsSync(dbPath)) {
        return m.reply('❀ No hay personajes disponibles.');
    }
    
    let characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
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
    
    // Buscar personaje
    const charIndex = characters.findIndex(c => 
        c.name.toLowerCase().includes(text.toLowerCase())
    );
    
    if (charIndex === -1) {
        return m.reply('❌ *No se encontró ese personaje.*');
    }
    
    const found = characters[charIndex];
    
    // Verificar cooldown de 24 horas
    const now = Date.now();
    const cooldown = 86400000;
    
    if (users[userId].votes[found.id] && (now - users[userId].votes[found.id]) < cooldown) {
        const remaining = Math.ceil((cooldown - (now - users[userId].votes[found.id])) / 3600000);
        return m.reply(`⏰ *Debes esperar ${remaining} horas para votar nuevamente por este personaje.*`);
    }
    
    // Agregar voto
    if (!found.votes) found.votes = 0;
    found.votes += 1;
    found.value = parseInt(found.value) + 10;
    
    characters[charIndex] = found;
    fs.writeFileSync(dbPath, JSON.stringify(characters, null, 2), 'utf-8');
    
    // Registrar voto del usuario
    users[userId].votes[found.id] = now;
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    // ========== TEXTO CON ESTILO PREMIUM ==========
    const txt = `
> . ﹡ ﹟ 🗳️ ׄ ⬭ *¡ᴠᴏᴛᴏ ʀᴇɢɪsᴛʀᴀᴅᴏ!* @${userId.split('@')[0]}

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜❤️* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  🗳️ *ᴠᴏᴛᴏ ᴄᴏɴᴛᴀᴅᴏ* 🗳️
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *ᴘᴇʀsᴏɴᴀᴊᴇ*
│ 🎴 *ɴᴏᴍʙʀᴇ:* ${found.name}
│ 📺 *sᴇʀɪᴇ:* ${found.source}
└───────────────

┌─⊷ *ɴᴜᴇᴠᴀs ᴇsᴛᴀᴅɪ́sᴛɪᴄᴀs*
│ 🗳️ *ᴠᴏᴛᴏs:* ${found.votes}
│ 💎 *ᴠᴀʟᴏʀ:* ${found.value}
│ ⬆️ *ʙᴏɴᴜs:* +10
└───────────────

> ## \`ɢʀᴀᴄɪᴀs ᴘᴏʀ ᴠᴏᴛᴀʀ ⭐\``;

    // ========== SISTEMA DE ENVÍO PREMIUM ==========
    const isSubBot = conn.user?.jid !== global.conn?.user?.jid;
    const botConfig = conn.subConfig || {};
    
    let thumbnail = null;
    if (found.img && found.img.length > 0) {
        try {
            const response = await fetch(found.img[0]);
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
                    title: `🗳️ Voto por ${found.name}`,
                    body: `${found.votes} votos • 💎 ${found.value}`,
                    mediaType: 1,
                    mediaUrl: found.img?.[0] || global.icono,
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

handler.help = ['vote', 'votar'];
handler.tags = ['gacha'];
handler.command = ['vote', 'votar'];
handler.group = true;
handler.reg = true;

export default handler;