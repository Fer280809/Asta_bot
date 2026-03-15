// ============================================
// plugins/gacha-serieinfo.js (ESTILO PREMIUM)
// ============================================
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn, text: query }) => {
    if (!query) return m.reply('❌ *Ingresa el nombre de la serie.*');
    
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
    if (!fs.existsSync(dbPath)) {
        return m.reply('❀ No hay personajes disponibles.');
    }
    
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    // Buscar serie
    const serieChars = characters.filter(c => 
        c.source.toLowerCase().includes(query.toLowerCase())
    );
    
    if (serieChars.length === 0) {
        return m.reply('❌ *No se encontró esa serie.*');
    }
    
    const serieName = serieChars[0].source;
    const totalValue = serieChars.reduce((sum, char) => sum + (parseInt(char.value) || 0), 0);
    const avgValue = Math.floor(totalValue / serieChars.length);
    
    // Contar por género
    const genderCount = {};
    serieChars.forEach(char => {
        genderCount[char.gender] = (genderCount[char.gender] || 0) + 1;
    });
    
    // Top 5 personajes
    const top5 = serieChars
        .sort((a, b) => (parseInt(b.value) || 0) - (parseInt(a.value) || 0))
        .slice(0, 5);
    
    let top5Text = '';
    top5.forEach((char, i) => {
        top5Text += `\n${i + 1}. *${char.name}* • 💎 ${char.value || 0}`;
    });
    
    // ========== TEXTO CON ESTILO PREMIUM ==========
    const txt = `
> . ﹡ ﹟ 📺 ׄ ⬭ *ɪɴғᴏʀᴍᴀᴄɪᴏ́ɴ ᴅᴇ sᴇʀɪᴇ*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📺* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  📺 *${serieName.toUpperCase()}* 📺
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *ᴇsᴛᴀᴅɪ́sᴛɪᴄᴀs ɢᴇɴᴇʀᴀʟᴇs*
│ 👥 *ᴘᴇʀsᴏɴᴀᴊᴇs:* ${serieChars.length}
│ 💎 *ᴠᴀʟᴏʀ ᴛᴏᴛᴀʟ:* ${totalValue}
│ 📊 *ᴠᴀʟᴏʀ ᴘʀᴏᴍᴇᴅɪᴏ:* ${avgValue}
└───────────────

┌─⊷ *ᴅɪsᴛʀɪʙᴜᴄɪᴏ́ɴ ᴘᴏʀ ɢᴇ́ɴᴇʀᴏ*
${Object.entries(genderCount).map(([gender, count]) => `│ ${gender}: ${count}`).join('\n')}
└───────────────

> ## \`ᴛᴏᴘ 5 ᴘᴇʀsᴏɴᴀᴊᴇs 👑\`
${top5Text}`.trim();

    // ========== SISTEMA DE ENVÍO PREMIUM ==========
    const isSubBot = conn.user?.jid !== global.conn?.user?.jid;
    const botConfig = conn.subConfig || {};
    
    // Imagen del personaje más valioso
    const topChar = top5[0];
    let thumbnail = null;
    if (topChar?.img?.length > 0) {
        try {
            const response = await fetch(topChar.img[0]);
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
                    title: `📺 ${serieName}`,
                    body: `${serieChars.length} personajes • 💎 ${totalValue} valor total`,
                    mediaType: 1,
                    mediaUrl: topChar?.img?.[0] || global.icono,
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

handler.help = ['serieinfo', 'ainfo', 'animeinfo'];
handler.tags = ['gacha'];
handler.command = ['serieinfo', 'ainfo', 'animeinfo'];
handler.group = false;
handler.reg = true;

export default handler;