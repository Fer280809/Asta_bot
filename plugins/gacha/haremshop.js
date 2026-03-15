// ============================================
// plugins/gacha-haremshop.js (ESTILO PREMIUM)
// ============================================
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn, args }) => {
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    // Obtener todos los personajes en venta
    let forSale = [];
    for (const [userId, userData] of Object.entries(users)) {
        if (userData.harem) {
            userData.harem.forEach(char => {
                if (char.forSale) {
                    forSale.push({
                        ...char,
                        ownerId: userId
                    });
                }
            });
        }
    }
    
    if (forSale.length === 0) {
        return m.reply('🏪 *No hay personajes en venta actualmente.*');
    }
    
    const page = parseInt(args[0]) || 1;
    const perPage = 10;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const totalPages = Math.ceil(forSale.length / perPage);
    
    // Construir lista
    let shopList = '';
    for (let i = start; i < end && i < forSale.length; i++) {
        const char = forSale[i];
        const ownerName = await conn.getName(char.ownerId);
        shopList += `
┌─⊷ ${i + 1}. *${char.name}*
│ 📺 ${char.source}
│ 💎 Valor: ${char.value}
│ 💰 Precio: ¥${char.salePrice}
│ 👤 Vendedor: ${ownerName}
└───────────────`;
    }
    
    // ========== TEXTO CON ESTILO PREMIUM ==========
    const txt = `
> . ﹡ ﹟ 🏪 ׄ ⬭ *ᴛɪᴇɴᴅᴀ ᴅᴇ ᴡᴀɪғᴜs*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🛒* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  🏪 *ᴍᴇʀᴄᴀᴅᴏ ᴅᴇ ᴘᴇʀsᴏɴᴀᴊᴇs* 🏪
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *ᴇsᴛᴀᴅɪ́sᴛɪᴄᴀs*
│ 📊 *ᴛᴏᴛᴀʟ:* ${forSale.length}
│ 📄 *ᴘᴀ́ɢɪɴᴀ:* ${page}/${totalPages}
└───────────────

${shopList}

> ## \`ᴄᴏᴍᴏ ᴄᴏᴍᴘʀᴀʀ 💡\`

💡 *Usa /buychar <nombre> para comprar*`.trim();

    // ========== SISTEMA DE ENVÍO PREMIUM ==========
    const isSubBot = conn.user?.jid !== global.conn?.user?.jid;
    const botConfig = conn.subConfig || {};
    
    // Imagen del primer personaje en venta
    const firstItem = forSale[0];
    let thumbnail = null;
    if (firstItem?.img?.length > 0) {
        try {
            const response = await fetch(firstItem.img[0]);
            if (response.ok) thumbnail = await response.buffer();
        } catch (e) {}
    }
    
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
                    title: `🏪 Tienda de Waifus`,
                    body: `${forSale.length} personajes en venta`,
                    mediaType: 1,
                    mediaUrl: firstItem?.img?.[0] || global.icono,
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

handler.help = ['haremshop', 'tiendawaifus', 'wshop'];
handler.tags = ['gacha'];
handler.command = ['haremshop', 'tiendawaifus', 'wshop'];
handler.group = true;
handler.reg = true;

export default handler;