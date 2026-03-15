// ============================================
// plugins/gacha-serielist.js (ESTILO PREMIUM)
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
    
    // Obtener series únicas
    const seriesMap = {};
    characters.forEach(char => {
        if (!seriesMap[char.source]) {
            seriesMap[char.source] = 0;
        }
        seriesMap[char.source]++;
    });
    
    const seriesList = Object.entries(seriesMap).sort((a, b) => b[1] - a[1]);
    
    const page = parseInt(args[0]) || 1;
    const perPage = 15;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const totalPages = Math.ceil(seriesList.length / perPage);
    
    // Construir lista
    let listText = '';
    seriesList.slice(start, end).forEach(([serie, count], i) => {
        listText += `${start + i + 1}. *${serie}* • ${count} 👤\n`;
    });
    
    // ========== TEXTO CON ESTILO PREMIUM ==========
    const txt = `
> . ﹡ ﹟ 📚 ׄ ⬭ *ᴄᴀᴛᴀ́ʟᴏɢᴏ ᴅᴇ sᴇʀɪᴇs*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📚* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  📚 *ʟɪsᴛᴀ ᴅᴇ sᴇʀɪᴇs* 📚
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *ᴇsᴛᴀᴅɪ́sᴛɪᴄᴀs*
│ 📊 *ᴛᴏᴛᴀʟ:* ${seriesList.length}
│ 📄 *ᴘᴀ́ɢɪɴᴀ:* ${page}/${totalPages}
└───────────────

${listText}

${totalPages > 1 ? `💡 *Usa /serielist ${page + 1} para ver más*` : ''}`.trim();

    // ========== SISTEMA DE ENVÍO PREMIUM ==========
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
            text: txt,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.channelRD?.id || "120363399175402285@newsletter",
                    serverMessageId: '',
                    newsletterName: global.channelRD?.name || "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』"
                },
                externalAdReply: {
                    title: `📚 Catálogo de Series`,
                    body: `${seriesList.length} series disponibles`,
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
        await conn.reply(m.chat, txt, m);
    }
};

handler.help = ['serielist', 'slist', 'animelist'];
handler.tags = ['gacha'];
handler.command = ['serielist', 'slist', 'animelist'];
handler.group = true;
handler.reg = true;

export default handler;