// ============================================
// plugins/gacha-rejecttrade.js (ESTILO PREMIUM)
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
    
    const user1Name = await conn.getName(trade.user1);
    const user2Name = await conn.getName(trade.user2);
    
    // ========== TEXTO CON ESTILO PREMIUM ==========
    const txt = `
> . ﹡ ﹟ ❌ ׄ ⬭ *ɪɴᴛᴇʀᴄᴀᴍʙɪᴏ ʀᴇᴄʜᴀᴢᴀᴅᴏ* @${userId.split('@')[0]}

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜❌* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  ❌ *ᴛʀᴀᴅᴇ ᴄᴀɴᴄᴇʟᴀᴅᴏ* ❌
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *ᴅᴇᴛᴀʟʟᴇs*
│ 👤 *ʀᴇᴄʜᴀᴢᴀᴅᴏ ᴘᴏʀ:* ${user2Name}
│ 👤 *sᴏʟɪᴄɪᴛᴀɴᴛᴇ:* ${user1Name}
└───────────────

> ## \`ᴏᴘᴇʀᴀᴄɪᴏ́ɴ ᴅᴇɴᴇɢᴀᴅᴀ 🚫\`

*ʟᴀ sᴏʟɪᴄɪᴛᴜᴅ ᴅᴇ ɪɴᴛᴇʀᴄᴀᴍʙɪᴏ ʜᴀ sɪᴅᴏ ʀᴇᴄʜᴀᴢᴀᴅᴀ.*`.trim();

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
                mentionedJid: [trade.user1, trade.user2],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.channelRD?.id || "120363399175402285@newsletter",
                    serverMessageId: '',
                    newsletterName: global.channelRD?.name || "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』"
                },
                externalAdReply: {
                    title: `❌ Trade Rechazado`,
                    body: `${user2Name} rechazó el intercambio`,
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
        
        // Notificar al otro usuario
        const notifyTxt = `
> . ﹡ ﹟ ❌ ׄ ⬭ *ᴛʀᴀᴅᴇ ʀᴇᴄʜᴀᴢᴀᴅᴏ*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜❌* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  ❌ *sᴏʟɪᴄɪᴛᴜᴅ ᴅᴇɴᴇɢᴀᴅᴀ* ❌
╰━━━━━━━━━━━━━━━━╯

*${user2Name}* ʀᴇᴄʜᴀᴢᴏ́ ᴛᴜ sᴏʟɪᴄɪᴛᴜᴅ ᴅᴇ ɪɴᴛᴇʀᴄᴀᴍʙɪᴏ.

> ## \`ɪɴᴛᴇɴᴛᴀ ᴄᴏɴ ᴏᴛʀᴏ ᴜsᴜᴀʀɪᴏ 🔄\``.trim();
        
        conn.sendMessage(trade.user1, { 
            text: notifyTxt,
            contextInfo: {
                externalAdReply: {
                    title: `❌ Trade Rechazado`,
                    body: `${user2Name} no aceptó el intercambio`,
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

handler.help = ['rejecttrade'];
handler.tags = ['gacha'];
handler.command = ['rejecttrade', 'rechazarintercambio'];
handler.group = true;
handler.reg = true;

export default handler;