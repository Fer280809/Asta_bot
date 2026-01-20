// ============================================
// plugins/gacha-accepttrade.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn }) => {
    const userId = m.sender;
    
    if (!global.tradeRequests) {
        return m.reply('❌ *No hay solicitudes de intercambio pendientes.*');
    }
    
    // Buscar solicitud pendiente para este usuario
    let tradeId = null;
    let trade = null;
    
    for (const [id, data] of Object.entries(global.tradeRequests)) {
        if (data.user2 === userId && Date.now() < data.expires) {
            tradeId = id;
            trade = data;
            break;
        }
    }
    
    if (!trade) {
        return m.reply('❌ *No tienes solicitudes de intercambio pendientes o han expirado.*');
    }
    
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    let users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    
    // Realizar intercambio
    const char1 = users[trade.user1].harem[trade.char1Index];
    const char2 = users[trade.user2].harem[trade.char2Index];
    
    // Intercambiar personajes
    users[trade.user1].harem[trade.char1Index] = { ...char2, claimedAt: Date.now() };
    users[trade.user2].harem[trade.char2Index] = { ...char1, claimedAt: Date.now() };
    
    // Actualizar en DB principal
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const char1Idx = characters.findIndex(c => c.id === char1.id);
    const char2Idx = characters.findIndex(c => c.id === char2.id);
    
    if (char1Idx !== -1) characters[char1Idx].user = trade.user2;
    if (char2Idx !== -1) characters[char2Idx].user = trade.user1;
    
    fs.writeFileSync(dbPath, JSON.stringify(characters, null, 2), 'utf-8');
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    const user1Name = await conn.getName(trade.user1);
    const user2Name = await conn.getName(trade.user2);
    
    m.reply(`✅ *¡Intercambio exitoso!*\n\n*${user1Name}* recibió a *${char2.name}*\n*${user2Name}* recibió a *${char1.name}*`);
    
    // Notificar al otro usuario
    conn.sendMessage(trade.user1, { 
        text: `✅ *¡Intercambio aceptado!*\n\n*${user2Name}* aceptó el intercambio. Ahora tienes a *${char2.name}*` 
    });
    
    // Eliminar solicitud
    delete global.tradeRequests[tradeId];
};

handler.help = ['accepttrade'];
handler.tags = ['gacha'];
handler.command = ['accepttrade', 'aceptarintercambio'];
handler.group = true;

export default handler;