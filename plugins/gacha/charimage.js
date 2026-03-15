// ============================================
// plugins/gacha-charimage.js (ESTILO PREMIUM)
// ============================================
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
    if (!text) return m.reply('❌ *Ingresa el nombre del personaje.*');
    
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
    if (!fs.existsSync(dbPath)) {
        return m.reply('❀ No hay personajes disponibles.');
    }
    
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    // Buscar personaje
    const found = characters.find(c => 
        c.name.toLowerCase().includes(text.toLowerCase())
    );
    
    if (!found) {
        return m.reply('❌ *No se encontró ese personaje.*');
    }
    
    if (!found.img || found.img.length === 0) {
        return m.reply('❌ *Este personaje no tiene imágenes disponibles.*');
    }
    
    const randomImg = found.img[Math.floor(Math.random() * found.img.length)];
    
    // ========== TEXTO CON ESTILO PREMIUM ==========
    const txt = `
> . ﹡ ﹟ 🖼️ ׄ ⬭ *ɪᴍᴀɢᴇɴ ᴅᴇʟ ᴘᴇʀsᴏɴᴀᴊᴇ*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🖼️* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  🖼️ *${found.name.toUpperCase()}* 🖼️
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *ɪɴғᴏʀᴍᴀᴄɪᴏ́ɴ*
│ 📺 *sᴇʀɪᴇ:* ${found.source}
│ 💎 *ᴠᴀʟᴏʀ:* ${found.value}
│ 🖼️ *ɪᴍᴀɢᴇɴᴇs ᴅɪsᴘᴏɴɪʙʟᴇs:* ${found.img.length}
└───────────────

> ## \`ᴠɪsᴜᴀʟɪᴢᴀᴄɪᴏ́ɴ 🎨\``.trim();

    // ========== SISTEMA DE ENVÍO PREMIUM ==========
    const isSubBot = conn.user?.jid !== global.conn?.user?.jid;
    const botConfig = conn.subConfig || {};
    
    let thumbnail = null;
    try {
        const response = await fetch(randomImg);
        if (response.ok) thumbnail = await response.buffer();
    } catch (e) {}
    
    if (!thumbnail) {
        let imageUrl = isSubBot && botConfig.logoUrl ? botConfig.logoUrl 
            : global.icono || 'https://i.ibb.co/0Q3J9XZ/file.jpg';
        try {
            const response = await fetch(imageUrl);
            if (response.ok) thumbnail = await response.buffer();
        } catch (e) {}
    }

    try {
        // Enviar imagen con caption estilizado
        await conn.sendMessage(m.chat, { 
            image: { url: randomImg },
            caption: txt,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.channelRD?.id || "120363399175402285@newsletter",
                    serverMessageId: '',
                    newsletterName: global.channelRD?.name || "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』"
                },
                externalAdReply: {
                    title: `🖼️ ${found.name}`,
                    body: `${found.source} • Imagen ${Math.floor(Math.random() * found.img.length) + 1}/${found.img.length}`,
                    mediaType: 1,
                    mediaUrl: randomImg,
                    sourceUrl: randomImg,
                    thumbnail: thumbnail || await (await fetch(global.icono)).buffer(),
                    showAdAttribution: false,
                    containsAutoReply: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
    } catch (e) {
        // Fallback: enviar como archivo
        await conn.sendFile(m.chat, randomImg, 'character.jpg', txt, m);
    }
};

handler.help = ['charimage', 'waifuimage', 'cimage', 'wimage'];
handler.tags = ['gacha'];
handler.command = ['charimage', 'waifuimage', 'cimage', 'wimage'];
handler.group = true;
handler.reg = true;

export default handler;