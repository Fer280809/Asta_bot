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
            claimMessage: '✧ {user} ha reclamado a {character}!',
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
│  📊 *INFO DE ${userName.toUpperCase()}* 📊
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *ESTADÍSTICAS*
│ 👤 *Usuario:* ${userName}
│ 💖 *Personajes:* ${user.harem.length}
│ ⭐ *Favoritos:* ${user.favorites.length}
│ 💰 *GachaCoins:* ${user.gachaCoins}
│ 🏪 *En venta:* ${forSale}
│ 💎 *Valor total:* ${totalValue}
└───────────────

┌─⊷ *ACTIVIDAD*
│ 🎲 *Último roll:* ${lastRollTime}
│ 🗳️ *Votos dados:* ${Object.keys(user.votes).length}
└───────────────

💬 *Mensaje de claim:* ${user.claimMessage}`;

    m.reply(text);
};

handler.help = ['gachainfo', 'ginfo', 'infogacha'];
handler.tags = ['gacha'];
handler.command = ['gachainfo', 'ginfo', 'infogacha'];
handler.group = true;
handler.reg = true

export default handler;