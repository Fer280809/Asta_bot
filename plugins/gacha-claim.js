// ============================================
// plugins/gacha-claim.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn }) => {
    const userId = m.sender;
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
    if (!m.quoted) {
        return m.reply('❌ *¡Ho-Ho-Ho! Debes citar el mensaje del Regalo Secreto que quieres abrir y reclamar.*');
    }
    
    const quotedId = m.quoted.id;
    
    if (!global.tempCharacters || !global.tempCharacters[quotedId]) {
        return m.reply('❌ *¡Oops! Este Regalo Secreto ya fue reclamado o se lo llevó un duende. ¡Intenta con otro!*');
    }
    
    const tempData = global.tempCharacters[quotedId];
    
    // Verificar si expiró
    if (Date.now() > tempData.expires) {
        delete global.tempCharacters[quotedId];
        return m.reply('⏰ *¡Se acabó el tiempo! Este Regalo Secreto se congeló. Usa /roll para que Santa te dé otro.*');
    }
    
    // Cargar usuarios
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    if (!users[userId]) {
        users[userId] = {
            harem: [],
            favorites: [],
            claimMessage: '✨ *¡Feliz Navidad!* {user} ha añadido a {character} a su *Colección de Adornos Festivos* (Harem). ¡Qué gran regalo!',
            lastRoll: 0,
            votes: {},
            gachaCoins: 1000
        };
    }
    
    // Verificar si ya tiene el personaje
    const alreadyHas = users[userId].harem.find(c => c.id === tempData.character.id);
    if (alreadyHas) {
        return m.reply('⚠️ *¡Santa dice que ya tienes este Adorno Navideño en tu colección!* No seas avaricioso.');
    }
    
    // Cargar y actualizar personaje en DB
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const charIndex = characters.findIndex(c => c.id === tempData.character.id);
    
    if (charIndex !== -1) {
        characters[charIndex].user = userId;
        characters[charIndex].status = 'Reclamado (Regalo Abierto)';
        fs.writeFileSync(dbPath, JSON.stringify(characters, null, 2), 'utf-8');
    }
    
    // Agregar personaje al harem
    users[userId].harem.push({
        ...tempData.character,
        claimedAt: Date.now(),
        forSale: false,
        salePrice: 0
    });
    
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    // Eliminar personaje temporal
    delete global.tempCharacters[quotedId];
    
    // Mensaje personalizado
    const userName = await conn.getName(userId);
    let claimMsg = users[userId].claimMessage
        .replace('{user}', userName)
        .replace('{character}', tempData.character.name);
    
    m.reply(claimMsg);
};

handler.help = ['claim', 'c', 'reclamar'];
handler.tags = ['gacha'];
handler.command = ['claim', 'c', 'reclamar'];
handler.group = true;

export default handler;

// ============================================
// plugins/gacha-harem.js
