// ============================================
// plugins/gacha-claim.js - VERSIÓN NAVIDEÑA CORREGIDA
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn }) => {
    // Obtener ID del usuario que debe reclamar (dueño del mensaje citado)
    const quotedMsg = m.quoted;
    
    if (!quotedMsg) {
        return m.reply('🎅 *¡Ho-Ho-Ho!* Debes citar el mensaje del *Regalo Secreto* que quieres abrir y reclamar.');
    }
    
    const quotedId = quotedMsg.id;
    const giftOwner = quotedMsg.sender; // Dueño original del mensaje del regalo
    
    // Verificar que el que reclama es el dueño del mensaje
    const claimer = m.sender;
    
    // **CORRECCIÓN:** Verificar que quien reclama es quien recibió el regalo
    if (claimer !== giftOwner) {
        const giftOwnerName = await conn.getName(giftOwner).catch(() => 'Usuario');
        return m.reply(`❌ *¡Este regalo no es tuyo!*\n\nEste Regalo Secreto fue enviado a *${giftOwnerName}*.\n¡Pídele a Santa que te mande tu propio regalo con /roll!`);
    }
    
    if (!global.tempCharacters || !global.tempCharacters[quotedId]) {
        return m.reply('❄️ *¡Oops! Este Regalo Secreto ya fue reclamado o se lo llevó un duende. ¡Intenta con otro!*');
    }
    
    const tempData = global.tempCharacters[quotedId];
    
    // **CORRECCIÓN:** Verificar también que el tempData pertenezca al usuario correcto
    if (tempData.userId && tempData.userId !== giftOwner) {
        return m.reply('🎄 *¡Este regalo está destinado a otro niño!* Solo quien recibió el mensaje puede reclamarlo.');
    }
    
    // Verificar si expiró
    if (Date.now() > tempData.expires) {
        delete global.tempCharacters[quotedId];
        return m.reply('⏰ *¡Se acabó el tiempo! Este Regalo Secreto se congeló. Usa /roll para que Santa te dé otro.*');
    }
    
    // Cargar usuarios festivos
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    // **CORRECCIÓN IMPORTANTE:** Usar el giftOwner, no el m.sender
    const userId = giftOwner;
    
    if (!users[userId]) {
        users[userId] = {
            harem: [],
            favorites: [],
            claimMessage: '✨ *¡Feliz Navidad!* {user} ha añadido a {character} a su *Colección de Adornos Festivos* (Harem). ¡Qué gran regalo!',
            lastRoll: 0,
            votes: {}
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
        obtainedOn: 'Navidad',
        obtainedFrom: 'Regalo Secreto',
        giftId: quotedId
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
    
    await m.reply(claimMsg + bonusMsg);
    
    // **BONUS:** Notificar en el grupo si es un grupo
    if (m.isGroup) {
        setTimeout(() => {
            const messages = [
                `🎊 *¡${userName} ha abierto un Regalo Secreto!*`,
                `🎄 *¡Mira lo que encontró ${userName} en su regalo!*`,
                `✨ *¡Increíble! ${userName} ha obtenido un adorno especial.*`,
                `🎅 *Santa está orgulloso de ${userName} por reclamar su regalo.*`
            ];
            const randomMsg = messages[Math.floor(Math.random() * messages.length)];
            conn.sendMessage(m.chat, { text: randomMsg }, { quoted: m });
        }, 1000);
    }
};

// **CORRECCIÓN ADICIONAL:** Añadir funciones helper
handler.help = ['claim', 'c', 'reclamar', 'abrirregalo'];
handler.tags = ['gacha', 'navidad'];
handler.command = ['claim', 'c', 'reclamar', 'abrirregalo'];
handler.group = true;

// Para que funcione mejor, asegúrate de que en el comando /roll se guarde así:
/*
// En tu comando de roll/gacha:
global.tempCharacters[messageId] = {
    character: characterData,
    expires: Date.now() + (10 * 60 * 1000), // 10 minutos
    userId: m.sender, // <-- IMPORTANTE: Guardar quién lo recibió
    timestamp: Date.now()
};
*/

export default handler;
