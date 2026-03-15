// ============================================
// plugins/gacha-harem.js (ESTILO PREMIUM)
// ============================================
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn, args }) => {
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    // Determinar usuario a consultar
    let targetUser = m.sender;
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetUser = m.mentionedJid[0];
    } else if (args[0] && args[0].startsWith('@')) {
        const num = args[0].replace('@', '');
        targetUser = num + '@s.whatsapp.net';
    }
    
    // Cargar usuarios
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    if (!users[targetUser] || !users[targetUser].harem || users[targetUser].harem.length === 0) {
        return m.reply('📭 *Este usuario no tiene personajes reclamados.*');
    }
    
    const userName = await conn.getName(targetUser);
    const page = parseInt(args[1]) || 1;
    const perPage = 10;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const totalPages = Math.ceil(users[targetUser].harem.length / perPage);
    
    // Construir lista de personajes con estilo
    let charList = '';
    users[targetUser].harem.slice(start, end).forEach((char, i) => {
        const isFav = users[targetUser].favorites.includes(char.id);
        const forSale = char.forSale ? `🏪 $${char.salePrice}` : '';
        charList += `
┌─⊷ ${start + i + 1}. *${char.name}* ${isFav ? '⭐' : ''}
│ 📺 ${char.source}
│ 💎 ${char.value}${forSale ? ` • ${forSale}` : ''}
└───────────────`;
    });
    
    // ========== TEXTO CON ESTILO PREMIUM ==========
    const txt = `
> . ﹡ ﹟ 💖 ׄ ⬭ *ʜᴀʀᴇᴍ ᴅᴇ* @${targetUser.split('@')[0]}

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💕* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  💖 *${userName.toUpperCase()}* 💖
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *ᴇsᴛᴀᴅɪ́sᴛɪᴄᴀs*
│ 📊 *ᴛᴏᴛᴀʟ:* ${users[targetUser].harem.length}
│ ⭐ *ғᴀᴠᴏʀɪᴛᴏs:* ${users[targetUser].favorites.length}
│ 📄 *ᴘᴀ́ɢɪɴᴀ:* ${page}/${totalPages}
└───────────────

${charList}

${totalPages > 1 ? `💡 *Usa /harem @usuario ${page + 1} para ver más*` : ''}`.trim();

    // ========== SISTEMA DE ENVÍO PREMIUM ==========
    const isSubBot = conn.user?.jid !== global.conn?.user?.jid;
    const botConfig = conn.subConfig || {};
    
    // Obtener imagen del primer personaje o fallback
    const firstChar = users[targetUser].harem[0];
    const charImg = firstChar?.img && firstChar.img.length > 0 
        ? firstChar.img[0]
        : null;
    
    let thumbnail = null;
    if (charImg) {
        try {
            const response = await fetch(charImg);
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
                mentionedJid: [targetUser],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.channelRD?.id || "120363399175402285@newsletter",
                    serverMessageId: '',
                    newsletterName: global.channelRD?.name || "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』"
                },
                externalAdReply: {
                    title: `💖 Harem de ${userName}`,
                    body: `${users[targetUser].harem.length} waifus • ${users[targetUser].favorites.length} favoritas`,
                    mediaType: 1,
                    mediaUrl: charImg || global.icono,
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

handler.help = ['harem', 'waifus', 'claims'];
handler.tags = ['gacha'];
handler.command = ['harem', 'waifus', 'claims'];
handler.group = true;
handler.reg = true;

export default handler;