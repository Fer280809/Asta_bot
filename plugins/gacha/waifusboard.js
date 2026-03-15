// ============================================
// plugins/gacha-waifusboard.js (ESTILO PREMIUM)
// ============================================
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn, args }) => {
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
    if (!fs.existsSync(dbPath)) {
        return m.reply('❀ No hay personajes disponibles.');
    }
    
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    // Ordenar por valor
    const sortedChars = characters.sort((a, b) => parseInt(b.value) - parseInt(a.value));
    
    const limit = parseInt(args[0]) || 20;
    const topChars = sortedChars.slice(0, limit);
    
    // Construir lista top
    let topList = '';
    topChars.forEach((char, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '•';
        topList += `
${medal} *${i + 1}.* *${char.name}*
   📺 ${char.source}
   💎 ${char.value} • 🗳️ ${char.votes || 0}`;
    });
    
    // ========== TEXTO CON ESTILO PREMIUM ==========
    const txt = `
> . ﹡ ﹟ 🏆 ׄ ⬭ *ᴛᴏᴘ ᴡᴀɪғᴜs*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜👑* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  🏆 *ᴛᴏᴘ ${limit} ᴘᴇʀsᴏɴᴀᴊᴇs* 🏆
╰━━━━━━━━━━━━━━━━╯

📊 *ᴘᴏʀ ᴠᴀʟᴏʀ ᴍᴀ́s ᴀʟᴛᴏ*

${topList}`.trim();

    // ========== SISTEMA DE ENVÍO PREMIUM ==========
    const isSubBot = conn.user?.jid !== global.conn?.user?.jid;
    const botConfig = conn.subConfig || {};
    
    // Imagen del top 1 o fallback
    const top1Img = topChars[0]?.img && topChars[0].img.length > 0 
        ? topChars[0].img[0]
        : null;
    
    let thumbnail = null;
    if (top1Img) {
        try {
            const response = await fetch(top1Img);
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
                    title: `🏆 Top Waifus`,
                    body: `🥇 ${topChars[0]?.name || 'N/A'} • 💎 ${topChars[0]?.value || 0}`,
                    mediaType: 1,
                    mediaUrl: top1Img || global.icono,
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

handler.help = ['waifusboard', 'waifustop', 'topwaifus', 'wtop'];
handler.tags = ['gacha'];
handler.command = ['waifusboard', 'waifustop', 'topwaifus', 'wtop'];
handler.group = true;
handler.reg = true;

export default handler;