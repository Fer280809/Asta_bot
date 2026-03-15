// ============================================
// plugins/gacha-accepttrade.js (ESTILO PREMIUM)
// ============================================
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn }) => {
    const userId = m.sender;
    
    if (!global.tradeRequests) {
        return m.reply('❌ *No hay solicitudes de intercambio pendientes.*');
    }
    
    // Buscar solicitud pendiente para este usuario
    let tradeId = null;
    let trade = null;
    
    for (const [id, data] of Object.entries(global.tradeRequests)) {
        if (data.user2 === userId && Date.now() < data.expires) {
            tradeId = id;
            trade = data;
            break;
        }
    }
    
    if (!trade) {
        return m.reply('❌ *No tienes solicitudes de intercambio pendientes o han expirado.*');
    }
    
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    let users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    
    // Realizar intercambio
    const char1 = users[trade.user1].harem[trade.char1Index];
    const char2 = users[trade.user2].harem[trade.char2Index];
    
    // Intercambiar personajes
    users[trade.user1].harem[trade.char1Index] = { ...char2, claimedAt: Date.now() };
    users[trade.user2].harem[trade.char2Index] = { ...char1, claimedAt: Date.now() };
    
    // Actualizar en DB principal
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const char1Idx = characters.findIndex(c => c.id === char1.id);
    const char2Idx = characters.findIndex(c => c.id === char2.id);
    
    if (char1Idx !== -1) characters[char1Idx].user = trade.user2;
    if (char2Idx !== -1) characters[char2Idx].user = trade.user1;
    
    fs.writeFileSync(dbPath, JSON.stringify(characters, null, 2), 'utf-8');
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    const user1Name = await conn.getName(trade.user1);
    const user2Name = await conn.getName(trade.user2);
    
    // ========== TEXTO CON ESTILO PREMIUM ==========
    const txt = `
> . ﹡ ﹟ ✅ ׄ ⬭ *¡ɪɴᴛᴇʀᴄᴀᴍʙɪᴏ ᴇxɪᴛᴏsᴏ!* @${userId.split('@')[0]}

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🔄* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  ✅ *ᴛʀᴀᴅᴇ ᴄᴏᴍᴘʟᴇᴛᴀᴅᴏ* ✅
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *ᴘᴀʀᴛɪᴄɪᴘᴀɴᴛᴇs*
│ 👤 *${user1Name}* ↔️ *${user2Name}*
└───────────────

┌─⊷ *ᴘᴇʀsᴏɴᴀᴊᴇs ɪɴᴛᴇʀᴄᴀᴍʙɪᴀᴅᴏs*
│ 🎴 ${user1Name} ʀᴇᴄɪʙɪᴏ́: *${char2.name}*
│ 🎴 ${user2Name} ʀᴇᴄɪʙɪᴏ́: *${char1.name}*
└───────────────

> ## \`ᴛʀᴀɴsᴀᴄᴄɪᴏ́ɴ ғɪɴᴀʟɪᴢᴀᴅᴀ 🤝\``.trim();

    // ========== SISTEMA DE ENVÍO PREMIUM ==========
    const isSubBot = conn.user?.jid !== global.conn?.user?.jid;
    const botConfig = conn.subConfig || {};
    
    // Intentar obtener imagen de uno de los personajes intercambiados
    const tradeImg = char1.img && char1.img.length > 0 
        ? char1.img[0] 
        : char2.img && char2.img.length > 0 
        ? char2.img[0] 
        : null;
    
    let thumbnail = null;
    if (tradeImg) {
        try {
            const response = await fetch(tradeImg);
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
                mentionedJid: [trade.user1, trade.user2],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.channelRD?.id || "120363399175402285@newsletter",
                    serverMessageId: '',
                    newsletterName: global.channelRD?.name || "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』"
                },
                externalAdReply: {
                    title: `✅ Trade Completado`,
                    body: `${char1.name} ↔️ ${char2.name}`,
                    mediaType: 1,
                    mediaUrl: tradeImg || global.icono,
                    sourceUrl: global.redes || global.channel,
                    thumbnail: thumbnail || await (await fetch(global.icono)).buffer(),
                    showAdAttribution: false,
                    containsAutoReply: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
        
        // Notificar al otro usuario
        const notifyTxt = `
> . ﹡ ﹟ ✅ ׄ ⬭ *¡ᴛʀᴀᴅᴇ ᴀᴄᴇᴘᴛᴀᴅᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🔄* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  ✅ *ɪɴᴛᴇʀᴄᴀᴍʙɪᴏ ᴄᴏɴғɪʀᴍᴀᴅᴏ* ✅
╰━━━━━━━━━━━━━━━━╯

*${user2Name}* ᴀᴄᴇᴘᴛᴏ́ ᴇʟ ɪɴᴛᴇʀᴄᴀᴍʙɪᴏ.

🎴 *ᴀʜᴏʀᴀ ᴛɪᴇɴᴇs ᴀ:* ${char2.name}

> ## \`ᴅɪsғʀᴜᴛᴀ ᴛᴜ ɴᴜᴇᴠᴀ ᴡᴀɪғᴜ 💕\``.trim();
        
        conn.sendMessage(trade.user1, { 
            text: notifyTxt,
            contextInfo: {
                externalAdReply: {
                    title: `✅ Trade Aceptado`,
                    body: `Recibiste a ${char2.name}`,
                    mediaType: 1,
                    thumbnail: thumbnail
                }
            }
        });
        
        // Eliminar solicitud
        delete global.tradeRequests[tradeId];
    } catch (e) {
        await conn.reply(m.chat, txt, m);
    }
};

handler.help = ['accepttrade'];
handler.tags = ['gacha'];
handler.command = ['accepttrade', 'aceptarintercambio'];
handler.group = true;
handler.reg = true;

export default handler;