// ============================================
// plugins/gacha-setclaimmsg.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply('❌ *Uso correcto:* /setclaim <mensaje>\n\n*Variables disponibles:*\n{user} - Nombre del usuario\n{character} - Nombre del personaje\n\n*Ejemplo:* /setclaim 🌸 {user} ha conquistado a {character}! 🌸');
    }
    
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
    }
    
    users[userId].claimMessage = text;
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    const userName = await conn.getName(userId);
    const preview = text
        .replace('{user}', userName)
        .replace('{character}', 'Ejemplo');
    
    m.reply(`✅ *Mensaje de claim actualizado!*\n\n*Vista previa:*\n${preview}`);
};

handler.help = ['setclaimmsg', 'setclaim'];
handler.tags = ['gacha'];
handler.command = ['setclaimmsg', 'setclaim'];
handler.group = true;
handler.reg = true

export default handler;