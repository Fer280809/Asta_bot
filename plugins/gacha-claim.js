// ============================================
// plugins/gacha-claim.js - VERSIÓN NAVIDEÑA CORREGIDA
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn }) => {
    const userId = m.sender;
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    if (!m.quoted) {
        return m.reply('🎅 *¡Ho-Ho-Ho!* Debes citar el mensaje del *Regalo Secreto* que quieres abrir y reclamar.');
    }
    
    const quotedId = m.quoted.id;
    
    if (!global.tempCharacters || !global.tempCharacters[quotedId]) {
        return m.reply('❄️ *¡Oops! Este Regalo Secreto ya fue reclamado o se lo llevó un duende. ¡Intenta con otro!*');
    }
    
    const tempData = global.tempCharacters[quotedId];
    
    // Verificar si expiró
    if (Date.now() > tempData.expires) {
        delete global.tempCharacters[quotedId];
        return m.reply('⏰ *¡Se acabó el tiempo! Este Regalo Secreto se congeló. Usa /roll para que Santa te dé otro.*');
    }
    
    // Cargar usuarios festivos
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
            votes: {}
            // ¡SE ELIMINÓ gachaCoins: 1000! 🎯
        };
    }
    
    // Verificar si ya tiene el adorno
    const alreadyHas = users[userId].harem.find(c => c.id === tempData.character.id);
    if (alreadyHas) {
        return m.reply('⚠️ *¡Santa dice que ya tienes este Adorno Navideño en tu colección!* No seas avaricioso.');
    }
    
    // Agregar adorno al harem navideño
    users[userId].harem.push({
        ...tempData.character,
        claimedAt: Date.now(),
        forSale: false,
        salePrice: 0,
        obtainedOn: 'Navidad'
    });
    
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    // Eliminar regalo temporal
    delete global.tempCharacters[quotedId];
    
    // Mensaje personalizado navideño
    const userName = await conn.getName(userId);
    let claimMsg = users[userId].claimMessage
        .replace('{user}', userName)
        .replace('{character}', tempData.character.name);
    
    // Bonus navideño en moneda real
    let bonusMsg = '';
    const charValue = parseInt(tempData.character.value) || 100;
    if (global.db.data.users[userId]) {
        const coinBonus = Math.floor(charValue * 0.15); // 15% bonus navideño
        global.db.data.users[userId].coin = (global.db.data.users[userId].coin || 0) + coinBonus;
        bonusMsg = `\n🎁 *¡Bonus Navideño!* +${coinBonus} Monedas de Chocolate por reclamar adorno especial.`;
    }
    
    m.reply(claimMsg + bonusMsg);
};

handler.help = ['claim', 'c', 'reclamar'];
handler.tags = ['gacha'];
handler.command = ['claim', 'c', 'reclamar'];
handler.group = true;

export default handler;