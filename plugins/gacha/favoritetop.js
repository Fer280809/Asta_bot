// ============================================
// plugins/gacha-favoritetop.js (ESTILO PREMIUM)
// ============================================
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn }) => {
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
    if (!fs.existsSync(usersPath) || !fs.existsSync(dbPath)) {
        return m.reply('❀ No hay datos disponibles.');
    }
    
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    // Contar favoritos por personaje
    const favCounts = {};
    
    for (const [userId, userData] of Object.entries(users)) {
        if (userData.favorites && userData.favorites.length > 0) {
            userData.favorites.forEach(charId => {
                favCounts[charId] = (favCounts[charId] || 0) + 1;
            });
        }
    }
    
    // Obtener información de personajes favoritos
    const favChars = [];
    for (const [charId, count] of Object.entries(favCounts)) {
        const char = characters.find(c => c.id === charId);
        if (char) {
            favChars.push({
                ...char,
                favCount: count
            });
        }
    }
    
    // Ordenar por cantidad de favoritos
    favChars.sort((a, b) => b.favCount - a.favCount);
    
    const topFavs = favChars.slice(0, 20);
    
    if (topFavs.length === 0) {
        return m.reply('📭 *Aún no hay personajes favoritos.*');
    }
    
    // Construir lista
    let favList = '';
    topFavs.forEach((char, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '•';
        favList += `
${medal} *${i + 1}.* *${char.name}*
   📺 ${char.source}
   ⭐ Favoritos: ${char.favCount}
   💎 Valor: ${char.value}`;
    });
    
    // ========== TEXTO CON ESTILO PREMIUM ==========
    const txt = `
> . ﹡ ﹟ ⭐ ׄ ⬭ *ᴛᴏᴘ ғᴀᴠᴏʀɪᴛᴏs*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜❤️* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  ⭐ *ᴡᴀɪғᴜs ᴍᴀ́s ǫᴜᴇʀɪᴅᴀs* ⭐
╰━━━━━━━━━━━━━━━━╯

📊 *ʟᴀs ᴍᴀ́s ᴀᴍᴀᴅᴀs ᴘᴏʀ ʟᴀ ᴄᴏᴍᴜɴɪᴅᴀᴅ*

${favList}`.trim();

    // ========== SISTEMA DE ENVÍO PREMIUM ==========
    const isSubBot = conn.user?.jid !== global.conn?.user?.jid;
    const botConfig = conn.subConfig || {};
    
    // Imagen del #1 favorito
    const top1 = topFavs[0];
    let thumbnail = null;
    if (top1?.img?.length > 0) {
        try {
            const response = await fetch(top1.img[0]);
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
                    title: `⭐ Top Favoritos`,
                    body: `🥇 ${top1?.name || 'N/A'} • ⭐ ${top1?.favCount || 0} favoritos`,
                    mediaType: 1,
                    mediaUrl: top1?.img?.[0] || global.icono,
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

handler.help = ['favoritetop', 'favtop'];
handler.tags = ['gacha'];
handler.command = ['favoritetop', 'favtop'];
handler.group = true;
handler.reg = true;

export default handler;