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
        return m.reply('❀ ¡El saco de regalos está vacío! No hay Adornos disponibles.');
    }
    
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    if (!Array.isArray(characters) || characters.length === 0) {
        return m.reply('❀ ¡El saco de regalos está vacío! No hay Adornos disponibles.');
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
            // Usar el mensaje navideño predeterminado
            claimMessage: '✨ *¡Feliz Navidad!* {user} ha añadido a {character} a su *Colección de Adornos Festivos* (Harem). ¡Qué gran regalo!', 
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
        return m.reply(`⏰ *El Trineo está recargando.* Debes esperar ${remaining} segundos para otra Tirada de Regalo.`);
    }
    
    // Seleccionar personaje aleatorio (Lógica intacta)
    const randomChar = characters[Math.floor(Math.random() * characters.length)];
    
    // Obtener imagen aleatoria (Lógica intacta)
    const randomImg = randomChar.img && randomChar.img.length > 0 
        ? randomChar.img[Math.floor(Math.random() * randomChar.img.length)]
        : 'https://i.ibb.co/0Q3J9XZ/file.jpg';
    
    const caption = `
╭━━━━━━━━━━━━━━━━╮
│  🎁 *¡HAS DESEMPACADO UN REGALO!* 🎄
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *DETALLES DEL ADORNO*
│ 📛 *Nombre del Adorno:* ${randomChar.name}
│ ⚧️ *Decoración (Género):* ${randomChar.gender}
│ 📺 *Origen (Cuento/Serie):* ${randomChar.source}
│ 💎 *Rareza (Valor):* ${randomChar.value}
│ 🏷️ *ID del Catálogo:* ${randomChar.id}
│ 🗳️ *Deseos Pedidos (Votos):* ${randomChar.votes || 0}
│ 📊 *Condición del Regalo:* ${randomChar.status}
└───────────────

💬 *Usa ${usedPrefix}claim o ${usedPrefix}c citando este mensaje para reclamar este Adorno para tu árbol!*

⏰ *Tienes 2 minutos antes de que el Adorno regrese al saco de Santa.*`;

    const msg = await conn.sendFile(m.chat, randomImg, 'character_roll.jpg', caption, m); // Cambié el nombre del archivo para mantener el tema

    // Actualizar último roll (Lógica intacta)
    users[userId].lastRoll = now;
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    // Guardar personaje temporal para claim (Lógica intacta)
    global.tempCharacters = global.tempCharacters || {};
    global.tempCharacters[msg.key.id] = {
        character: randomChar,
        timestamp: now,
        expires: now + 120000 // 2 minutos
    };
    
    // Limpiar después de 2 minutos (Lógica intacta)
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
