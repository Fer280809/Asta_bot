// ============================================
// plugins/gacha-favoritetop.js - VERSIÓN EMBELLECIDA (OPCIONAL)
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn }) => {
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
    if (!fs.existsSync(usersPath) || !fs.existsSync(dbPath)) {
        return m.reply('🎅 *¡El Registro de Deseos Navideños está vacío!*\n\n🎄 Santa aún no recibió deseos para procesar.');
    }
    
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    // Contar favoritos (deseos navideños)
    const favCounts = {};
    let totalWishes = 0;
    
    for (const [userId, userData] of Object.entries(users)) {
        if (userData.favorites && Array.isArray(userData.favorites) && userData.favorites.length > 0) {
            userData.favorites.forEach(charId => {
                favCounts[charId] = (favCounts[charId] || 0) + 1;
                totalWishes++;
            });
        }
    }
    
    if (totalWishes === 0) {
        return m.reply('📭 *¡Aún no hay Deseos Navideños registrados!*\n\n✨ Usa `.fav <nombre>` para marcar tus adornos favoritos.');
    }
    
    // Obtener información de adornos favoritos
    const favChars = [];
    for (const [charId, count] of Object.entries(favCounts)) {
        const char = characters.find(c => c.id === charId);
        if (char) {
            favChars.push({
                name: char.name,
                source: char.source || 'Desconocido',
                value: char.value || '100',
                favCount: count,
                rank: 0
            });
        }
    }
    
    // Ordenar por deseos
    favChars.sort((a, b) => b.favCount - a.favCount);
    
    // Asignar rangos (máximo 15)
    const topFavs = favChars.slice(0, 15).map((char, index) => ({
        ...char,
        rank: index + 1,
        medal: index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`
    }));
    
    // Crear mensaje festivo
    let text = `🎄 *TOP 15 ADORNOS MÁS DESEADOS* 🎄\n\n`;
    text += `✨ *Total de deseos registrados:* ${totalWishes}\n`;
    text += `🎁 *Adornos únicos con deseos:* ${favChars.length}\n\n`;
    text += `╔══════════════════════════╗\n`;
    text += `║    🎅 TABLA DE LÍDERES    ║\n`;
    text += `╚══════════════════════════╝\n\n`;
    
    topFavs.forEach(char => {
        const hearts = '❤️'.repeat(Math.min(5, Math.ceil(char.favCount / 3)));
        text += `${char.medal} *${char.name}*\n`;
        text += `   🎬 ${char.source}\n`;
        text += `   ${hearts} ${char.favCount} deseos\n`;
        text += `   💎 Valor: ${char.value}\n\n`;
    });
    
    // Pie de página
    text += `🎁 *Consejo:* Marca tus adornos favoritos con \`.fav <nombre>\`\n`;
    text += `🦌 *Actualización:* La lista se actualiza automáticamente\n`;
    
    await m.reply(text);
};

handler.help = ['favoritetop', 'favtop', 'topdeseos'];
handler.tags = ['gacha', 'info'];
handler.command = ['favoritetop', 'favtop', 'topdeseos'];
handler.group = true;
handler.private = true;

export default handler;