// ============================================
// plugins/gacha-buycharacter.js (ESTILO PREMIUM)
// ============================================
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply('❌ *Uso correcto:* /buychar <nombre del personaje>');
    }
    
    const buyerId = m.sender;
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    if (!users[buyerId]) {
        users[buyerId] = {
            harem: [],
            favorites: [],
            claimMessage: '✧ {user} ha reclamado a {character}!',
            lastRoll: 0,
            votes: {}
        };
    }
    
    // Buscar personaje en venta
    let found = null;
    let sellerId = null;
    let sellerIndex = -1;
    
    for (const [userId, userData] of Object.entries(users)) {
        if (userData.harem) {
            const index = userData.harem.findIndex(c => 
                c.forSale && c.name.toLowerCase().includes(text.toLowerCase())
            );
            if (index !== -1) {
                found = userData.harem[index];
                sellerId = userId;
                sellerIndex = index;
                break;
            }
        }
    }
    
    if (!found) {
        return m.reply('❌ *No se encontró ese personaje en venta.*');
    }
    
    if (sellerId === buyerId) {
        return m.reply('❌ *No puedes comprar tu propio personaje.*');
    }
    
    // Verificar si ya tiene el personaje
    const alreadyHas = users[buyerId].harem.find(c => c.id === found.id);
    if (alreadyHas) {
        return m.reply('⚠️ *Ya tienes este personaje en tu harem.*');
    }
    
    // Verificar fondos
    if (!global.db.data.users[buyerId]) {
        global.db.data.users[buyerId] = { coin: 0, bank: 0 };
    }
    if (!global.db.data.users[sellerId]) {
        global.db.data.users[sellerId] = { coin: 0, bank: 0 };
    }
    
    const buyerCoins = global.db.data.users[buyerId].coin || 0;
    
    if (buyerCoins < found.salePrice) {
        return m.reply(`❌ *No tienes suficientes monedas.* Necesitas *¥${found.salePrice}* pero solo tienes *¥${buyyerCoins}*`);
    }
    
    // Realizar transacción
    global.db.data.users[buyerId].coin -= found.salePrice;
    global.db.data.users[sellerId].coin += found.salePrice;
    
    // Transferir personaje
    const charToTransfer = { ...found, forSale: false, salePrice: 0, claimedAt: Date.now() };
    users[buyerId].harem.push(charToTransfer);
    users[sellerId].harem.splice(sellerIndex, 1);
    
    // Actualizar en DB principal
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const charIndex = characters.findIndex(c => c.id === found.id);
    if (charIndex !== -1) {
        characters[charIndex].user = buyerId;
        fs.writeFileSync(dbPath, JSON.stringify(characters, null, 2), 'utf-8');
    }
    
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    const buyerName = await conn.getName(buyerId);
    const sellerName = await conn.getName(sellerId);
    
    // ========== TEXTO CON ESTILO PREMIUM ==========
    const txt = `
> . ﹡ ﹟ 💰 ׄ ⬭ *¡ᴄᴏᴍᴘʀᴀ ᴇxɪᴛᴏsᴀ!* @${buyerId.split('@')[0]}

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💎* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  💰 *ᴛʀᴀɴsᴀᴄᴄɪᴏ́ɴ ᴄᴏᴍᴘʟᴇᴛᴀᴅᴀ* 💰
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *ᴅᴇᴛᴀʟʟᴇs ᴅᴇ ʟᴀ ᴄᴏᴍᴘʀᴀ*
│ 🎴 *ᴘᴇʀsᴏɴᴀᴊᴇ:* ${found.name}
│ 📺 *sᴇʀɪᴇ:* ${found.source}
│ 💎 *ᴠᴀʟᴏʀ:* ${found.value}
│ 💰 *ᴘʀᴇᴄɪᴏ:* ¥${found.salePrice}
└───────────────

┌─⊷ *ᴘᴀʀᴛɪᴄɪᴘᴀɴᴛᴇs*
│ 👤 *ᴄᴏᴍᴘʀᴀᴅᴏʀ:* ${buyerName}
│ 🏷️ *ᴠᴇɴᴅᴇᴅᴏʀ:* ${sellerName}
└───────────────

> ## \`ғᴇʟɪᴄɪᴅᴀᴅᴇs 🎉\`

*¡${found.name}* ᴀʜᴏʀᴀ ᴘᴇʀᴛᴇɴᴇᴄᴇ ᴀ ᴛᴜ ʜᴀʀᴇᴍ!`.trim();

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
                mentionedJid: [buyerId, sellerId],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.channelRD?.id || "120363399175402285@newsletter",
                    serverMessageId: '',
                    newsletterName: global.channelRD?.name || "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』"
                },
                externalAdReply: {
                    title: `💰 ${found.name} Adquirida`,
                    body: `Comprada por ${buyerName} • ¥${found.salePrice}`,
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
        
        // Notificar al vendedor
        conn.sendMessage(sellerId, { 
            text: `💰 *¡ᴠᴇɴᴛᴀ ʀᴇᴀʟɪᴢᴀᴅᴀ!*\n\n*${buyerName}* ʜᴀ ᴄᴏᴍᴘʀᴀᴅᴏ ᴛᴜ ᴘᴇʀsᴏɴᴀᴊᴇ *${found.name}* ᴘᴏʀ *¥${found.salePrice}*`,
            contextInfo: {
                externalAdReply: {
                    title: `💰 Venta Realizada`,
                    body: `${found.name} • ¥${found.salePrice}`,
                    mediaType: 1,
                    thumbnail: thumbnail
                }
            }
        });
    } catch (e) {
        await conn.reply(m.chat, txt, m);
    }
};

handler.help = ['buycharacter', 'buychar', 'buyc'];
handler.tags = ['gacha'];
handler.command = ['buycharacter', 'buychar', 'buyc'];
handler.group = true;
handler.reg = true;

export default handler;