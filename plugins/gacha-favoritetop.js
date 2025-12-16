// ============================================
// plugins/gacha-favoritetop.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn }) => {
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
    if (!fs.existsSync(usersPath) || !fs.existsSync(dbPath)) {
        return m.reply('❀ ¡El Registro de Deseos de Navidad está vacío! No hay datos disponibles.');
    }
    
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    // Contar favoritos por personaje (Contar Deseos)
    const favCounts = {};
    
    for (const [userId, userData] of Object.entries(users)) {
        if (userData.favorites && userData.favorites.length > 0) {
            userData.favorites.forEach(charId => {
                favCounts[charId] = (favCounts[charId] || 0) + 1;
            });
        }
    }
    
    // Obtener información de personajes favoritos
    const favChars = [];
    for (const [charId, count] of Object.entries(favCounts)) {
        const char = characters.find(c => c.id === charId);
        if (char) {
            favChars.push({
                ...char,
                favCount: count
            });
        }
    }
    
    // Ordenar por cantidad de deseos (favoritos)
    favChars.sort((a, b) => b.favCount - a.favCount);
    
    const topFavs = favChars.slice(0, 20);
    
    if (topFavs.length === 0) {
        return m.reply('📭 *¡Aún no hay Deseos de Navidad registrados!* Nadie ha marcado un favorito.');
    }
    
    let text = `
╭━━━━━━━━━━━━━━━━╮
│  ✨ *TOP 20 ADORNOS MÁS DESEADOS* ✨
╰━━━━━━━━━━━━━━━━╯

📊 *Los Adornos Navideños más pedidos y queridos por la comunidad*

`;
    
    topFavs.forEach((char, i) => {
        text += `
${i + 1}. *${char.name}*
   📺 Origen: ${char.source}
   ❤️ Deseos (Favoritos): ${char.favCount}
   💎 Rareza: ${char.value}
`;
    });
    
    m.reply(text);
};

handler.help = ['favoritetop', 'favtop'];
handler.tags = ['gacha'];
handler.command = ['favoritetop', 'favtop'];
handler.group = true;

export default handler;
