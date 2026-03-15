// ============================================
// plugins/gacha-claim.js (ESTILO PREMIUM)
// ============================================
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn }) => {
    const userId = m.sender;
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
    if (!m.quoted) {
        return m.reply('❌ *Debes citar el mensaje del personaje que quieres reclamar.*');
    }
    
    const quotedId = m.quoted.id;
    
    if (!global.tempCharacters || !global.tempCharacters[quotedId]) {
        return m.reply('❌ *Este personaje ya no está disponible o ha expirado.*');
    }
    
    const tempData = global.tempCharacters[quotedId];
    
    // Verificar si expiró
    if (Date.now() > tempData.expires) {
        delete global.tempCharacters[quotedId];
        return m.reply('⏰ *Este personaje ya expiró. Usa /roll para obtener otro.*');
    }
    
    // Cargar usuarios
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
    
    // Verificar si ya tiene el personaje
    const alreadyHas = users[userId].harem.find(c => c.id === tempData.character.id);
    if (alreadyHas) {
        return m.reply('⚠️ *Ya tienes este personaje en tu harem.*');
    }
    
    // Cargar y actualizar personaje en DB
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const charIndex = characters.findIndex(c => c.id === tempData.character.id);
    
    if (charIndex !== -1) {
        characters[charIndex].user = userId;
        characters[charIndex].status = 'Reclamado';
        fs.writeFileSync(dbPath, JSON.stringify(characters, null, 2), 'utf-8');
    }
    
    // Agregar personaje al harem
    users[userId].harem.push({
        ...tempData.character,
        claimedAt: Date.now(),
        forSale: false,
        salePrice: 0
    });
    
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    // Eliminar personaje temporal
    delete global.tempCharacters[quotedId];
    
    // Mensaje personalizado con estilo premium
    const userName = await conn.getName(userId);
    let claimMsg = users[userId].claimMessage
        .replace('{user}', userName)
        .replace('{character}', tempData.character.name);
    
    // ========== TEXTO CON ESTILO PREMIUM ==========
    const txt = `
> . ﹡ ﹟ ✨ ׄ ⬭ *¡ᴡᴀɪғᴜ ʀᴇᴄʟᴀᴍᴀᴅᴀ!* @${userId.split('@')[0]}

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💕* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  ✨ *${tempData.character.name.toUpperCase()}* ✨
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *ᴅᴇᴛᴀʟʟᴇs*
│ 📺 *sᴇʀɪᴇ:* ${tempData.character.source}
│ 💎 *ᴠᴀʟᴏʀ:* ${tempData.character.value}
│ 🆔 *ɪᴅ:* ${tempData.character.id}
└───────────────

> ## \`ғᴇʟɪᴄɪᴅᴀᴅᴇs 🎉\`

${claimMsg}

*ᴛᴏᴛᴀʟ ᴇɴ ʜᴀʀᴇᴍ:* ${users[userId].harem.length}`.trim();

    // ========== SISTEMA DE ENVÍO PREMIUM ==========
    const isSubBot = conn.user?.jid !== global.conn?.user?.jid;
    const botConfig = conn.subConfig || {};
    
    // Obtener imagen del personaje
    const charImg = tempData.character.img && tempData.character.img.length > 0 
        ? tempData.character.img[Math.floor(Math.random() * tempData.character.img.length)]
        : 'https://i.ibb.co/0Q3J9XZ/file.jpg';
    
    let thumbnail = null;
    try {
        const response = await fetch(charImg);
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
                mentionedJid: [userId],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.channelRD?.id || "120363399175402285@newsletter",
                    serverMessageId: '',
                    newsletterName: global.channelRD?.name || "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』"
                },
                externalAdReply: {
                    title: `✨ ${tempData.character.name} Reclamada`,
                    body: `Por ${userName} • ${tempData.character.source}`,
                    mediaType: 1,
                    mediaUrl: charImg,
                    sourceUrl: charImg,
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

handler.help = ['claim', 'c', 'reclamar'];
handler.tags = ['gacha'];
handler.command = ['claim', 'c', 'reclamar'];
handler.group = true;
handler.reg = true;

export default handler;