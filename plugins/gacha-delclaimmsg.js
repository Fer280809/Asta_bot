// ============================================
// plugins/gacha-delclaimmsg.js
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
        return m.reply('❌ *No tienes un perfil creado.*');
    }
    
    users[userId].claimMessage = '✧ {user} ha reclamado a {character}!';
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    m.reply('✅ *Mensaje de claim restablecido al predeterminado.*');
};

handler.help = ['delclaimmsg'];
handler.tags = ['gacha'];
handler.command = ['delclaimmsg'];
handler.group = true;

export default handler;