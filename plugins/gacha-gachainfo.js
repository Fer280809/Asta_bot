// ============================================
// plugins/gacha-gachainfo.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn }) => {
    const userId = m.sender;
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
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
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    }
    
    const user = users[userId];
    const userName = await conn.getName(userId);
    
    // Calcular valor total del harem
    const totalValue = user.harem.reduce((sum, char) => sum + parseInt(char.value || 0), 0);
    
    // Contar personajes en venta
    const forSale = user.harem.filter(c => c.forSale).length;
    
    // Tiempo desde último roll
    const lastRollTime = user.lastRoll ? new Date(user.lastRoll).toLocaleString('es-ES') : 'Nunca';
    
    const text = `
╭━━━━━━━━━━━━━━━━╮
│  🎅 *FICHA DE ${userName.toUpperCase()}* 🎁
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *INVENTARIO FESTIVO*
│ 👤 *Ayudante:* ${userName}
│ 💖 *Adornos (Colección):* ${user.harem.length}
│ ⭐ *Favoritos de Santa:* ${user.favorites.length}
│ 💰 *Monedas de Jengibre:* ${user.gachaCoins}
│ 🏪 *Puestos en Venta:* ${forSale}
│ 💎 *Valor Total del Tesoro:* ${totalValue}
└───────────────

┌─⊷ *ACTIVIDAD NAVIDEÑA*
│ 🎲 *Última Tirada de Regalo:* ${lastRollTime}
│ 🗳️ *Deseos Registrados (Votos):* ${Object.keys(user.votes).length}
└───────────────

💬 *Anuncio de Regalo (Claim):* ${user.claimMessage}`;

    m.reply(text);
};

handler.help = ['gachainfo', 'ginfo', 'infogacha'];
handler.tags = ['gacha'];
handler.command = ['gachainfo', 'ginfo', 'infogacha'];
handler.group = true;

export default handler;
