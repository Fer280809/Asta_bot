// ============================================
// plugins/gacha-setclaimmsg.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply('❌ *Uso correcto:* /setclaim <mensaje>\n\n*Variables disponibles para tu Anuncio de Regalo:*\n{user} - Nombre del Ayudante (usuario)\n{character} - Nombre del Adorno Navideño (personaje)\n\n*Ejemplo:* /setclaim 🔔 ¡{user} ha colgado al Adorno {character} en el pino! 🔔');
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
            // Usar el mensaje navideño predeterminado
            claimMessage: '✨ *¡Feliz Navidad!* {user} ha añadido a {character} a su *Colección de Adornos Festivos* (Harem). ¡Qué gran regalo!', 
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
    
    m.reply(`✅ *¡Anuncio de Regalo (Claim) personalizado guardado!* \n\n*Vista previa:*\n${preview}`);
};

handler.help = ['setclaimmsg', 'setclaim'];
handler.tags = ['gacha'];
handler.command = ['setclaimmsg', 'setclaim'];
handler.group = true;

export default handler;
