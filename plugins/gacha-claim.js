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
        return m.reply('❌ *Debes citar el mensaje del personaje que quieres reclamar.*');
    }
    
    const quotedId = m.quoted.id;
    
    if (!global.tempCharacters || !global.tempCharacters[quotedId]) {
        return m.reply('❌ *Este personaje ya no está disponible o ha expirado.*');
    }
    
    const tempData = global.tempCharacters[quotedId];
    
    // Verificar si expiró
    if (Date.now() > tempData.expires) {
        delete global.tempCharacters[quotedId];
        return m.reply('⏰ *Este personaje ya expiró. Usa /roll para obtener otro.*');
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
            claimMessage: '✧ {user} ha reclamado a {character}!',
            lastRoll: 0,
            votes: {}
            // Eliminado: gachaCoins
        };
    }
    
    // Verificar si ya tiene el personaje
    const alreadyHas = users[userId].harem.find(c => c.id === tempData.character.id);
    if (alreadyHas) {
        return m.reply('⚠️ *Ya tienes este personaje en tu harem.*');
    }
    
    // Cargar y actualizar personaje en DB
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const charIndex = characters.findIndex(c => c.id === tempData.character.id);
    
    if (charIndex !== -1) {
        characters[charIndex].user = userId;
        characters[charIndex].status = 'Reclamado';
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