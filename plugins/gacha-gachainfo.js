// ============================================
// plugins/gacha-gachainfo.js - VERSIÓN CORREGIDA
// ELIMINA gachaCoins y muestra info REAL de la economía
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn }) => {
    const userId = m.sender;
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    // 1. Cargar datos de gacha (personajes, favoritos, etc.)
    let gachaUsers = {};
    if (fs.existsSync(usersPath)) {
        gachaUsers = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    // 2. Inicializar usuario en SISTEMA GACHA si no existe
    if (!gachaUsers[userId]) {
        gachaUsers[userId] = {
            harem: [],
            favorites: [],
            claimMessage: '✨ *¡Feliz Navidad!* {user} ha añadido a {character} a su *Colección de Adornos Festivos*. ¡Qué gran regalo!',
            lastRoll: 0,
            votes: {}
            // ¡SE ELIMINÓ gachaCoins: 1000! 🎯
        };
        fs.writeFileSync(usersPath, JSON.stringify(gachaUsers, null, 2), 'utf-8');
    }
    
    const gachaData = gachaUsers[userId];
    const userName = await conn.getName(userId);
    
    // 3. Obtener datos de la ECONOMÍA PRINCIPAL
    const economyData = global.db.data.users[userId] || {};
    
    // 4. Calcular estadísticas del harem navideño
    const totalValue = gachaData.harem.reduce((sum, char) => sum + parseInt(char.value || 0), 0);
    const forSale = gachaData.harem.filter(c => c.forSale).length;
    
    // 5. Personajes por rareza (basado en valor)
    const rarityCounts = {
        común: gachaData.harem.filter(c => (parseInt(c.value) || 0) < 1000).length,
        raro: gachaData.harem.filter(c => {
            const val = parseInt(c.value) || 0;
            return val >= 1000 && val < 2000;
        }).length,
        épico: gachaData.harem.filter(c => {
            const val = parseInt(c.value) || 0;
            return val >= 2000 && val < 3000;
        }).length,
        legendario: gachaData.harem.filter(c => (parseInt(c.value) || 0) >= 3000).length
    };
    
    // 6. Tiempo desde último roll
    const lastRollTime = gachaData.lastRoll 
        ? formatTimeAgo(gachaData.lastRoll) 
        : 'Nunca';
    
    // 7. Crear mensaje informativo navideño
    const text = `
╭━━━━━━━━━━━━━━━━━━━━╮
│   🎄 *INFORME NAVIDEÑO* 🎁
╰━━━━━━━━━━━━━━━━━━━━╯

👤 *Ayudante de Santa:* ${userName}
📊 *ID:* ${userId.split('@')[0]}

┌─⊷ *🎅 ECONOMÍA FESTIVA*
│ 🪙 *Monedas de Chocolate:* ${economyData.coin || 0}
│ 🏦 *Ahorros en el Banco:* ${economyData.bank || 0}
│ 📈 *Nivel de Espíritu Navideño:* ${economyData.level || 0}
│ ⭐ *Experiencia Festiva:* ${economyData.exp || 0}
└───────────────

┌─⊷ *🎁 COLECCIÓN DE ADORNOS*
│ 🎄 *Total Adornos:* ${gachaData.harem.length}
│ 💝 *Favoritos:* ${gachaData.favorites.length}
│ 🏪 *En Venta:* ${forSale}
│ 💎 *Valor Total:* ${totalValue}
└───────────────

┌─⊷ *🌟 RAREZAS NAVIDEÑAS*
│ ⛄ Comunes: ${rarityCounts.común}
│ ❄️ Raros: ${rarityCounts.raro}
│ ⭐ Épicos: ${rarityCounts.épico}
│ 🎅 Legendarios: ${rarityCounts.legendario}
└───────────────

┌─⊷ *📅 ACTIVIDAD RECIENTE*
│ 🎲 Último Regalo: ${lastRollTime}
│ 🗳️ Votos Realizados: ${Object.keys(gachaData.votes).length}
│ 💬 Mensaje Personal: ${gachaData.claimMessage.substring(0, 40)}...
└───────────────

🎯 *Consejo de Santa:* Usa \`.roll\` para más adornos!
🦌 *Próximo objetivo:* ${gachaData.harem.length < 5 ? 'Conseguir 5 adornos' : 
                       gachaData.harem.length < 20 ? 'Conseguir 20 adornos' : 
                       'Completar la colección'}`;

    await m.reply(text);
};

// Función helper para formatear tiempo
function formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
        return `Hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    } else if (hours < 24) {
        return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
    } else {
        return `Hace ${days} día${days !== 1 ? 's' : ''}`;
    }
}

handler.help = ['gachainfo', 'ginfo', 'migacha', 'miinfo'];
handler.tags = ['gacha', 'navidad', 'info'];
handler.command = ['gachainfo', 'ginfo', 'migacha', 'miinfo'];
handler.group = true;
handler.private = true;

export default handler;