// ============================================
// plugins/gacha-roll.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, usedPrefix }) => {
    const userId = m.sender;
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    // Cargar personajes
    if (!fs.existsSync(dbPath)) {
        return m.reply('❀ No hay personajes disponibles.');
    }
    
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    if (!Array.isArray(characters) || characters.length === 0) {
        return m.reply('❀ No hay personajes disponibles.');
    }
    
    // Cargar o crear datos de usuario
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    if (!users[userId]) {
        users[userId] = {
            harem: [],
            favorites: [],
            claimMessage: '✧ {user} ha reclamado a {character}!',
            lastRoll: 0,
            votes: {},
            gachaCoins: 1000
        };
    }
    
    // Verificar cooldown de 2 minutos
    const now = Date.now();
    const cooldown = 120000; // 2 minutos (antes era 1 hora)
    
    if (users[userId].lastRoll && (now - users[userId].lastRoll) < cooldown) {
        const remaining = Math.ceil((cooldown - (now - users[userId].lastRoll)) / 1000);
        return m.reply(`⏰ *Debes esperar ${remaining} segundos para hacer otro roll.*`);
    }
    
    // Seleccionar personaje aleatorio
    const randomChar = characters[Math.floor(Math.random() * characters.length)];
    
    // Obtener imagen aleatoria
    const randomImg = randomChar.img && randomChar.img.length > 0 
        ? randomChar.img[Math.floor(Math.random() * randomChar.img.length)]
        : 'https://i.ibb.co/0Q3J9XZ/file.jpg';
    
    const caption = `
╭━━━━━━━━━━━━━━━━╮
│  🎴 *NUEVO PERSONAJE* 🎴
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *INFORMACIÓN*
│ 📛 *Nombre:* ${randomChar.name}
│ ⚧️ *Género:* ${randomChar.gender}
│ 📺 *Serie:* ${randomChar.source}
│ 💎 *Valor:* ${randomChar.value}
│ 🆔 *ID:* ${randomChar.id}
│ 🗳️ *Votos:* ${randomChar.votes || 0}
│ 📊 *Estado:* ${randomChar.status}
└───────────────

💬 *Usa ${usedPrefix}claim o ${usedPrefix}c citando este mensaje para reclamar este personaje!*

⏰ *Tienes 2 minutos para reclamarlo.*`;

    const msg = await conn.sendFile(m.chat, randomImg, 'character.jpg', caption, m);
    
    // Actualizar último roll
    users[userId].lastRoll = now;
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    // Guardar personaje temporal para claim
    global.tempCharacters = global.tempCharacters || {};
    global.tempCharacters[msg.key.id] = {
        character: randomChar,
        timestamp: now,
        expires: now + 120000 // 2 minutos
    };
    
    // Limpiar después de 2 minutos
    setTimeout(() => {
        if (global.tempCharacters && global.tempCharacters[msg.key.id]) {
            delete global.tempCharacters[msg.key.id];
        }
    }, 120000);
};

handler.help = ['rollwaifu', 'rw', 'roll'];
handler.tags = ['gacha'];
handler.command = ['rollwaifu', 'rw', 'roll'];
handler.group = true;

export default handler;
