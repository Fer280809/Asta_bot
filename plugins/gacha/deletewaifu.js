// ============================================
// plugins/gacha-deletewaifu.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply('❌ *Uso correcto:* /delwaifu <nombre del personaje>');
    }
    
    const userId = m.sender;
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    if (!users[userId] || !users[userId].harem || users[userId].harem.length === 0) {
        return m.reply('❌ *No tienes personajes para eliminar.*');
    }
    
    const charIndex = users[userId].harem.findIndex(c => 
        c.name.toLowerCase().includes(text.toLowerCase())
    );
    
    if (charIndex === -1) {
        return m.reply('❌ *No tienes ese personaje en tu harem.*');
    }
    
    const char = users[userId].harem[charIndex];
    const charName = char.name;
    
    // Actualizar en DB principal
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const dbCharIndex = characters.findIndex(c => c.id === char.id);
    if (dbCharIndex !== -1) {
        characters[dbCharIndex].user = null;
        characters[dbCharIndex].status = 'Libre';
        fs.writeFileSync(dbPath, JSON.stringify(characters, null, 2), 'utf-8');
    }
    
    // Eliminar personaje
    users[userId].harem.splice(charIndex, 1);
    
    // Eliminar de favoritos si está
    users[userId].favorites = users[userId].favorites.filter(id => id !== char.id);
    
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    m.reply(`✅ *${charName}* ha sido eliminado de tu harem.`);
};

handler.help = ['deletewaifu', 'delwaifu', 'delchar'];
handler.tags = ['gacha'];
handler.command = ['deletewaifu', 'delwaifu', 'delchar'];
handler.group = true;

export default handler;