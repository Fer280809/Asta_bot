// ============================================
// plugins/gacha-rejecttrade.js
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
    
    const user1Name = await conn.getName(trade.user1);
    const user2Name = await conn.getName(trade.user2);
    
    m.reply(`❌ *Intercambio rechazado.*`);
    
    // Notificar al otro usuario
    conn.sendMessage(trade.user1, { 
        text: `❌ *Intercambio rechazado*\n\n*${user2Name}* rechazó tu solicitud de intercambio.` 
    });
    
    // Eliminar solicitud
    delete global.tradeRequests[tradeId];
};

handler.help = ['rejecttrade'];
handler.tags = ['gacha'];
handler.command = ['rejecttrade', 'rechazarintercambio'];
handler.group = true;

export default handler;