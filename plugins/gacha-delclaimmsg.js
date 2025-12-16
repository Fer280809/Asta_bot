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
        return m.reply('❌ *¡Santa no tiene registro de tu perfil!* No tienes un perfil creado.');
    }
    
    // El mensaje de reclamo predeterminado debe ser el nuevo (navideño)
    users[userId].claimMessage = '✨ *¡Feliz Navidad!* {user} ha añadido a {character} a su *Colección de Adornos Festivos* (Harem). ¡Qué gran regalo!';
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    m.reply('✅ *El Anuncio de Regalo (Claim) ha sido restablecido al mensaje predeterminado de Navidad.*');
};

handler.help = ['delclaimmsg'];
handler.tags = ['gacha'];
handler.command = ['delclaimmsg'];
handler.group = true;

export default handler;
