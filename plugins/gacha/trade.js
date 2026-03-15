// ============================================
// plugins/gacha-trade.js (ESTILO PREMIUM)
// ============================================
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
    if (!text || !text.includes('/')) {
        return m.reply('❌ *Uso correcto:* /trade <Tu personaje> / <Personaje del otro>\n\n*Ejemplo:* /trade Miku / Asuna\n\n*Nota:* Cita el mensaje del usuario con quien quieres intercambiar.');
    }
    
    if (!m.quoted) {
        return m.reply('❌ *Debes citar el mensaje del usuario con quien quieres intercambiar.*');
    }
    
    const user1 = m.sender;
    const user2 = m.quoted.sender;
    
    if (user1 === user2) {
        return m.reply('❌ *No puedes intercambiar contigo mismo.*');
    }
    
    const [char1Name, char2Name] = text.split('/').map(s => s.trim());
    
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    if (!users[user1] || !users[user1].harem || users[user1].harem.length === 0) {
        return m.reply('❌ *No tienes personajes para intercambiar.*');
    }
    
    if (!users[user2] || !users[user2].harem || users[user2].harem.length === 0) {
        return m.reply('❌ *El otro usuario no tiene personajes.*');
    }
    
    // Buscar personajes
    const char1Index = users[user1].harem.findIndex(c => 
        c.name.toLowerCase().includes(char1Name.toLowerCase())
    );
    
    const char2Index = users[user2].harem.findIndex(c => 
        c.name.toLowerCase().includes(char2Name.toLowerCase())
    );
    
    if (char1Index === -1) {
        return m.reply(`❌ *No tienes el personaje "${char1Name}"*`);
    }
    
    if (char2Index === -1) {
        return m.reply(`❌ *El otro usuario no tiene el personaje "${char2Name}"*`);
    }
    
    const char1 = users[user1].harem[char1Index];
    const char2 = users[user2].harem[char2Index];
    
    // Guardar solicitud de intercambio
    global.tradeRequests = global.tradeRequests || {};
    const tradeId = `${user1}_${user2}_${Date.now()}`;
    
    global.tradeRequests[tradeId] = {
        user1,
        user2,
        char1,
        char2,
        char1Index,
        char2Index,
        timestamp: Date.now(),
        expires: Date.now() + 300000 // 5 minutos
    };
    
    const user1Name = await conn.getName(user1);
    const user2Name = await conn.getName(user2);
    
    // ========== TEXTO CON ESTILO PREMIUM ==========
    const txt = `
> . ﹡ ﹟ 🔄 ׄ ⬭ *sᴏʟɪᴄɪᴛᴜᴅ ᴅᴇ ɪɴᴛᴇʀᴄᴀᴍʙɪᴏ*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🔄* ㅤ֢ㅤ⸱ㅤᯭִ*

╭━━━━━━━━━━━━━━━━╮
│  🔄 *ᴘʀᴏᴘᴜᴇsᴛᴀ ᴅᴇ ᴛʀᴀᴅᴇ* 🔄
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *${user1Name}* ᴏғʀᴇᴄᴇ:
│ 🎴 *${char1.name}*
│ 📺 ${char1.source}
│ 💎 ${char1.value}
└───────────────

┌─⊷ *ᴘᴏʀ ᴇʟ ᴘᴇʀsᴏɴᴀᴊᴇ ᴅᴇ* *${user2Name}*:
│ 🎴 *${char2.name}*
│ 📺 ${char2.source}
│ 💎 ${char2.value}
└───────────────

> ## \`ᴀᴄᴄɪᴏ́ɴ ʀᴇǫᴜᴇʀɪᴅᴀ ⚔️\`

@${user2.split('@')[0]} *ʀᴇsᴘᴏɴᴅᴇ ᴄᴏɴ:*
✅ */accepttrade* ᴘᴀʀᴀ ᴀᴄᴇᴘᴛᴀʀ
❌ */rejecttrade* ᴘᴀʀᴀ ʀᴇᴄʜᴀᴢᴀʀ

⏰ *ᴇxᴘɪʀᴀ ᴇɴ 5 ᴍɪɴᴜᴛᴏs*`.trim();

    // ========== SISTEMA DE ENVÍO PREMIUM ==========
    const isSubBot = conn.user?.jid !== global.conn?.user?.jid;
    const botConfig = conn.subConfig || {};
    
    // Intentar obtener imagen de uno de los personajes
    const tradeImg = char1.img && char1.img.length > 0 
        ? char1.img[0] 
        : char2.img && char2.img.length > 0 
        ? char2.img[0] 
        : null;
    
    let thumbnail = null;
    if (tradeImg) {
        try {
            const response = await fetch(tradeImg);
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
                mentionedJid: [user1, user2],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.channelRD?.id || "120363399175402285@newsletter",
                    serverMessageId: '',
                    newsletterName: global.channelRD?.name || "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』"
                },
                externalAdReply: {
                    title: `🔄 Trade Request`,
                    body: `${char1.name} ↔️ ${char2.name}`,
                    mediaType: 1,
                    mediaUrl: tradeImg || global.icono,
                    sourceUrl: global.redes || global.channel,
                    thumbnail: thumbnail || await (await fetch(global.icono)).buffer(),
                    showAdAttribution: false,
                    containsAutoReply: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
        
        // Limpiar después de 5 minutos
        setTimeout(() => {
            if (global.tradeRequests && global.tradeRequests[tradeId]) {
                delete global.tradeRequests[tradeId];
            }
        }, 300000);
        
    } catch (e) {
        await conn.reply(m.chat, txt, m);
    }
};

handler.help = ['trade', 'intercambiar'];
handler.tags = ['gacha'];
handler.command = ['trade', 'intercambiar'];
handler.group = true;
handler.reg = true;

export default handler;