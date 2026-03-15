// ============================================
// plugins/gacha-giveallharem.js (ESTILO PREMIUM)
// ============================================
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
    if (!m.mentionedJid || m.mentionedJid.length === 0) {
        return m.reply('❌ *Uso correcto:* /giveallharem @usuario');
    }
    
    const giverId = m.sender;
    const receiverId = m.mentionedJid[0];
    
    if (giverId === receiverId) {
        return m.reply('❌ *No puedes regalarte personajes a ti mismo.*');
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
    
    const totalChars = users[giverId].harem.length;
    const giverName = await conn.getName(giverId);
    const receiverName = await conn.getName(receiverId);
    
    // ========== CONFIRMACIÓN CON ESTILO PREMIUM ==========
    const confirmTxt = `
> . ﹡ ﹟ ⚠️ ׄ ⬭ *ᴄᴏɴғɪʀᴍᴀᴄɪᴏ́ɴ ʀᴇǫᴜᴇʀɪᴅᴀ* @${giverId.split('@')[0]}

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜⚠️* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  ⚠️ *ᴀᴄᴄɪᴏ́ɴ ɪʀʀᴇᴠᴇʀsɪʙʟᴇ* ⚠️
╰━━━━━━━━━━━━━━━━╯

¿ᴇsᴛᴀ́s sᴇɢᴜʀᴏ ᴅᴇ ʀᴇɢᴀʟᴀʀ ᴛᴏᴅᴏ ᴛᴜ ʜᴀʀᴇᴍ ᴀ @${receiverId.split('@')[0]}?

┌─⊷ *ᴅᴇᴛᴀʟʟᴇs*
│ 📊 *ᴛᴏᴛᴀʟ ᴅᴇ ᴘᴇʀsᴏɴᴀᴊᴇs:* ${totalChars}
│ 🎁 *ᴅᴏɴᴀᴅᴏʀ:* ${giverName}
│ 🎀 *ʀᴇᴄᴇᴘᴛᴏʀ:* ${receiverName}
└───────────────

┌─⊷ *ᴏᴘᴄɪᴏɴᴇs*
│ ✅ *SI* - ᴄᴏɴғɪʀᴍᴀʀ ᴛʀᴀɴsғᴇʀᴇɴᴄɪᴀ
│ ❌ *NO* - ᴄᴀɴᴄᴇʟᴀʀ ᴏᴘᴇʀᴀᴄɪᴏ́ɴ
└───────────────

⏰ *ᴛɪᴇɴᴇs 30 sᴇɢᴜɴᴅᴏs ᴘᴀʀᴀ ᴅᴇᴄɪᴅɪʀ*`.trim();

    // Enviar confirmación con estilo premium
    const isSubBot = conn.user?.jid !== global.conn?.user?.jid;
    const botConfig = conn.subConfig || {};
    
    let thumbnail = null;
    let imageUrl = isSubBot && botConfig.logoUrl ? botConfig.logoUrl 
        : global.icono || global.banner 
        || 'https://i.ibb.co/0Q3J9XZ/file.jpg';
    try {
        const response = await fetch(imageUrl);
        if (response.ok) thumbnail = await response.buffer();
    } catch (e) {}

    try {
        await conn.sendMessage(m.chat, { 
            text: confirmTxt,
            contextInfo: {
                mentionedJid: [giverId, receiverId],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.channelRD?.id || "120363399175402285@newsletter",
                    serverMessageId: '',
                    newsletterName: global.channelRD?.name || "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』"
                },
                externalAdReply: {
                    title: `⚠️ Confirmación Requerida`,
                    body: `Transferir ${totalChars} personajes a ${receiverName}`,
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
        await conn.reply(m.chat, confirmTxt, m);
    }
    
    // Esperar respuesta
    const collector = conn.awaitMessages(m.chat, x => x.sender === m.sender, {
        max: 1,
        time: 30000
    });
    
    collector.then(async collected => {
        const response = collected[0];
        if (!response || response.text.toLowerCase() !== 'si') {
            const cancelTxt = `
> . ﹡ ﹟ ❌ ׄ ⬭ *ᴏᴘᴇʀᴀᴄɪᴏ́ɴ ᴄᴀɴᴄᴇʟᴀᴅᴀ*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜❌* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  ❌ *ᴛʀᴀɴsғᴇʀᴇɴᴄɪᴀ ᴄᴀɴᴄᴇʟᴀᴅᴀ* ❌
╰━━━━━━━━━━━━━━━━╯

*ᴛᴜ ʜᴀʀᴇᴍ sɪɢᴜᴇ ɪɴᴛᴀᴄᴛᴏ.*`.trim();
            
            return conn.sendMessage(m.chat, { 
                text: cancelTxt,
                contextInfo: {
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.channelRD?.id || "120363399175402285@newsletter",
                        serverMessageId: '',
                        newsletterName: global.channelRD?.name || "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』"
                    },
                    externalAdReply: {
                        title: `❌ Cancelado`,
                        body: `Operación abortada por el usuario`,
                        mediaType: 1,
                        thumbnail: thumbnail
                    }
                }
            }, { quoted: m });
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
        
        const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        let transferredCount = 0;
        
        // Transferir todos los personajes
        users[giverId].harem.forEach(char => {
            const alreadyHas = users[receiverId].harem.find(c => c.id === char.id);
            if (!alreadyHas) {
                users[receiverId].harem.push({ ...char, claimedAt: Date.now(), forSale: false, salePrice: 0 });
                
                // Actualizar en DB principal
                const dbCharIndex = characters.findIndex(c => c.id === char.id);
                if (dbCharIndex !== -1) {
                    characters[dbCharIndex].user = receiverId;
                }
                transferredCount++;
            }
        });
        
        // Vaciar harem del donador
        users[giverId].harem = [];
        users[giverId].favorites = [];
        
        fs.writeFileSync(dbPath, JSON.stringify(characters, null, 2), 'utf-8');
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
        
        // ========== TEXTO ÉXITO CON ESTILO PREMIUM ==========
        const successTxt = `
> . ﹡ ﹟ 🎁 ׄ ⬭ *¡ʜᴀʀᴇᴍ ᴛʀᴀɴsғᴇʀɪᴅᴏ!* @${giverId.split('@')[0]}

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜👑* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  🎁 *ᴛʀᴀɴsғᴇʀᴇɴᴄɪᴀ ᴍᴀsɪᴠᴀ* 🎁
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *ᴅᴇᴛᴀʟʟᴇs ᴅᴇ ʟᴀ ᴏᴘᴇʀᴀᴄɪᴏ́ɴ*
│ 📊 *ᴘᴇʀsᴏɴᴀᴊᴇs ᴛʀᴀɴsғᴇʀɪᴅᴏs:* ${transferredCount}
│ 🎁 *ᴅᴏɴᴀᴅᴏʀ:* ${giverName}
│ 🎀 *ɴᴜᴇᴠᴏ ᴅᴜᴇñᴏ:* ${receiverName}
└───────────────

> ## \`ᴀᴄᴛᴏ sᴜᴘʀᴇᴍᴏ ᴅᴇ ɢᴇɴᴇʀᴏsɪᴅᴀᴅ 👑\`

*¡ᴛᴏᴅᴏ ᴛᴜ ʜᴀʀᴇᴍ ᴀʜᴏʀᴀ ᴘᴇʀᴛᴇɴᴇᴄᴇ ᴀ ${receiverName}!*`.trim();

        try {
            await conn.sendMessage(m.chat, { 
                text: successTxt,
                contextInfo: {
                    mentionedJid: [giverId, receiverId],
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.channelRD?.id || "120363399175402285@newsletter",
                        serverMessageId: '',
                        newsletterName: global.channelRD?.name || "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』"
                    },
                    externalAdReply: {
                        title: `🎁 ¡Harem Transferido!`,
                        body: `${transferredCount} personajes • ${giverName} → ${receiverName}`,
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
            
            // Notificar al receptor
            const receiverTxt = `
> . ﹡ ﹟ 🎁 ׄ ⬭ *¡ʀᴇɢᴀʟᴏ ᴇɴᴏʀᴍᴇ ʀᴇᴄɪʙɪᴅᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🎁* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  🎁 *ʜᴀʀᴇᴍ ᴄᴏᴍᴘʟᴇᴛᴏ ʀᴇᴄɪʙɪᴅᴏ* 🎁
╰━━━━━━━━━━━━━━━━╯

*${giverName}* ᴛᴇ ʜᴀ ʀᴇɢᴀʟᴀᴅᴏ sᴜ ʜᴀʀᴇᴍ ᴄᴏᴍᴘʟᴇᴛᴏ ᴅᴇ *${transferredCount}* ᴘᴇʀsᴏɴᴀᴊᴇs!

> ## \`ᴅɪsғʀᴜᴛᴀ ᴛᴜ ɴᴜᴇᴠᴀ ᴄᴏʟᴇᴄᴄɪᴏ́ɴ 👑\``.trim();
            
            conn.sendMessage(receiverId, { 
                text: receiverTxt,
                contextInfo: {
                    externalAdReply: {
                        title: `🎁 ¡Harem Recibido!`,
                        body: `${transferredCount} personajes de ${giverName}`,
                        mediaType: 1,
                        thumbnail: thumbnail
                    }
                }
            });
        } catch (e) {
            await conn.reply(m.chat, successTxt, m);
        }
    }).catch(async () => {
        const timeoutTxt = `
> . ﹡ ﹟ ⏰ ׄ ⬭ *ᴛɪᴇᴍᴘᴏ ᴀɢᴏᴛᴀᴅᴏ*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜⏰* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  ⏰ *ᴏᴘᴇʀᴀᴄɪᴏ́ɴ ᴄᴀɴᴄᴇʟᴀᴅᴀ* ⏰
╰━━━━━━━━━━━━━━━━╯

*ɴᴏ ʜᴜʙᴏ ʀᴇsᴘᴜᴇsᴛᴀ ᴇɴ 30 sᴇɢᴜɴᴅᴏs.*`.trim();
        
        conn.sendMessage(m.chat, { 
            text: timeoutTxt,
            contextInfo: {
                externalAdReply: {
                    title: `⏰ Tiempo Agotado`,
                    body: `Operación cancelada automáticamente`,
                    mediaType: 1,
                    thumbnail: thumbnail
                }
            }
        }, { quoted: m });
    });
};

handler.help = ['giveallharem'];
handler.tags = ['gacha'];
handler.command = ['giveallharem'];
handler.group = true;
handler.reg = true;

export default handler;