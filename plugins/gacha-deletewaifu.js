// ============================================
// plugins/gacha-deletewaifu.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply('❌ *Uso correcto:* /delwaifu <nombre del Adorno Navideño>');
    }
    
    const userId = m.sender;
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    if (!users[userId] || !users[userId].harem || users[userId].harem.length === 0) {
        return m.reply('❌ *Tu árbol está vacío.* No tienes Adornos Navideños para guardar.');
    }
    
    const charIndex = users[userId].harem.findIndex(c => 
        c.name.toLowerCase().includes(text.toLowerCase())
    );
    
    if (charIndex === -1) {
        return m.reply('❌ *Ese Adorno Navideño no está colgado en tu árbol (harem).*');
    }
    
    const char = users[userId].harem[charIndex];
    const charName = char.name;
    
    // Actualizar en DB principal
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const dbCharIndex = characters.findIndex(c => c.id === char.id);
    if (dbCharIndex !== -1) {
        characters[dbCharIndex].user = null;
        characters[dbCharIndex].status = 'Libre (Devuelto al Taller)';
        fs.writeFileSync(dbPath, JSON.stringify(characters, null, 2), 'utf-8');
    }
    
    // Eliminar personaje
    users[userId].harem.splice(charIndex, 1);
    
    // Eliminar de favoritos si está
    users[userId].favorites = users[userId].favorites.filter(id => id !== char.id);
    
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    m.reply(`✅ *${charName}* ha sido descolgado y guardado en la caja. (Eliminado de tu harem).`);
};

handler.help = ['deletewaifu', 'delwaifu', 'delchar'];
handler.tags = ['gacha'];
handler.command = ['deletewaifu', 'delwaifu', 'delchar'];
handler.group = true;

export default handler;
