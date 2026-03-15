// ============================================
// plugins/gacha-roll.js (ESTILO PREMIUM)
// ============================================
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn, usedPrefix }) => {
    const userId = m.sender;
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    // Cargar personajes
    if (!fs.existsSync(dbPath)) {
        return m.reply('❀ No hay personajes disponibles.');
    }
    
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    if (!Array.isArray(characters) || characters.length === 0) {
        return m.reply('❀ No hay personajes disponibles.');
    }
    
    // Cargar o crear datos de usuario
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
    
    // Verificar cooldown de 2 minutos
    const now = Date.now();
    const cooldown = 120000;
    
    if (users[userId].lastRoll && (now - users[userId].lastRoll) < cooldown) {
        const remaining = Math.ceil((cooldown - (now - users[userId].lastRoll)) / 1000);
        return m.reply(`⏰ *Debes esperar ${remaining} segundos para hacer otro roll.*`);
    }
    
    // Seleccionar personaje aleatorio
    const randomChar = characters[Math.floor(Math.random() * characters.length)];
    
    // Obtener imagen aleatoria
    const randomImg = randomChar.img && randomChar.img.length > 0 
        ? randomChar.img[Math.floor(Math.random() * randomChar.img.length)]
        : 'https://i.ibb.co/0Q3J9XZ/file.jpg';
    
    // ========== TEXTO CON ESTILO PREMIUM ==========
    const userName = await conn.getName(userId);
    const txt = `
> . ﹡ ﹟ 🎴 ׄ ⬭ *¡ʀᴏʟʟ ᴅᴇ ᴡᴀɪғᴜ!* @${userId.split('@')[0]}

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜✨* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  🎴 *${randomChar.name.toUpperCase()}* 🎴
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *ɪɴғᴏʀᴍᴀᴄɪᴏ́ɴ*
│ ⚧️ *ɢᴇ́ɴᴇʀᴏ:* ${randomChar.gender}
│ 📺 *sᴇʀɪᴇ:* ${randomChar.source}
│ 💎 *ᴠᴀʟᴏʀ:* ${randomChar.value}
│ 🆔 *ɪᴅ:* ${randomChar.id}
│ 🗳️ *ᴠᴏᴛᴏs:* ${randomChar.votes || 0}
│ 📊 *ᴇsᴛᴀᴅᴏ:* ${randomChar.status}
└───────────────

> ## \`ʀᴇᴄʟᴀᴍᴀʀ ⚔️\`

💬 *ᴜsᴀ ${usedPrefix}claim ᴏ ${usedPrefix}c ᴄɪᴛᴀɴᴅᴏ ᴇsᴛᴇ ᴍᴇɴsᴀᴊᴇ!*

⏰ *ᴛɪᴇɴᴇs 2 ᴍɪɴᴜᴛᴏs ᴘᴀʀᴀ ʀᴇᴄʟᴀᴍᴀʀʟᴏ.*`.trim();

    // ========== SISTEMA DE ENVÍO PREMIUM ==========
    const isSubBot = conn.user?.jid !== global.conn?.user?.jid;
    const botConfig = conn.subConfig || {};
    
    let thumbnail = null;
    
    // Intentar cargar imagen del personaje como thumbnail
    try {
        const response = await fetch(randomImg);
        if (response.ok) thumbnail = await response.buffer();
    } catch (e) {}
    
    // Fallback a banner del bot
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
        const msg = await conn.sendMessage(m.chat, { 
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
                    title: `🎴 ${randomChar.name}`,
                    body: `${randomChar.source} • 💎 ${randomChar.value}`,
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

        // Actualizar último roll
        users[userId].lastRoll = now;
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
        
        // Guardar personaje temporal para claim
        global.tempCharacters = global.tempCharacters || {};
        global.tempCharacters[msg.key.id] = {
            character: randomChar,
            timestamp: now,
            expires: now + 120000
        };
        
        // Limpiar después de 2 minutos
        setTimeout(() => {
            if (global.tempCharacters && global.tempCharacters[msg.key.id]) {
                delete global.tempCharacters[msg.key.id];
            }
        }, 120000);
        
    } catch (e) {
        // Fallback simple
        await conn.reply(m.chat, txt, m);
    }
};

handler.help = ['rollwaifu', 'rw', 'roll'];
handler.tags = ['gacha'];
handler.command = ['rollwaifu', 'rw', 'roll'];
handler.group = true;
handler.reg = true;

export default handler;