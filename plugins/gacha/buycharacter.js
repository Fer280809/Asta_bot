// ============================================
// plugins/gacha-buycharacter.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply('❌ *Uso correcto:* /buychar <nombre del personaje>');
    }
    
    const buyerId = m.sender;
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    if (!users[buyerId]) {
        users[buyerId] = {
            harem: [],
            favorites: [],
            claimMessage: '✧ {user} ha reclamado a {character}!',
            lastRoll: 0,
            votes: {}
            // Eliminado: gachaCoins
        };
    }
    
    // Buscar personaje en venta
    let found = null;
    let sellerId = null;
    let sellerIndex = -1;
    
    for (const [userId, userData] of Object.entries(users)) {
        if (userData.harem) {
            const index = userData.harem.findIndex(c => 
                c.forSale && c.name.toLowerCase().includes(text.toLowerCase())
            );
            if (index !== -1) {
                found = userData.harem[index];
                sellerId = userId;
                sellerIndex = index;
                break;
            }
        }
    }
    
    if (!found) {
        return m.reply('❌ *No se encontró ese personaje en venta.*');
    }
    
    if (sellerId === buyerId) {
        return m.reply('❌ *No puedes comprar tu propio personaje.*');
    }
    
    // Verificar si ya tiene el personaje
    const alreadyHas = users[buyerId].harem.find(c => c.id === found.id);
    if (alreadyHas) {
        return m.reply('⚠️ *Ya tienes este personaje en tu harem.*');
    }
    
    // Verificar fondos en MONEDA OFICIAL
    if (!global.db.data.users[buyerId]) {
        global.db.data.users[buyerId] = { coin: 0, bank: 0 };
    }
    if (!global.db.data.users[sellerId]) {
        global.db.data.users[sellerId] = { coin: 0, bank: 0 };
    }
    
    const buyerCoins = global.db.data.users[buyerId].coin || 0;
    
    if (buyerCoins < found.salePrice) {
        return m.reply(`❌ *No tienes suficientes monedas.* Necesitas *¥${found.salePrice}* pero solo tienes *¥${buyerCoins}*`);
    }
    
    // Realizar transacción en MONEDA OFICIAL
    global.db.data.users[buyerId].coin -= found.salePrice;
    global.db.data.users[sellerId].coin += found.salePrice;
    
    // Transferir personaje
    const charToTransfer = { ...found, forSale: false, salePrice: 0, claimedAt: Date.now() };
    users[buyerId].harem.push(charToTransfer);
    users[sellerId].harem.splice(sellerIndex, 1);
    
    // Actualizar en DB principal
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const charIndex = characters.findIndex(c => c.id === found.id);
    if (charIndex !== -1) {
        characters[charIndex].user = buyerId;
        fs.writeFileSync(dbPath, JSON.stringify(characters, null, 2), 'utf-8');
    }
    
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    const buyerName = await conn.getName(buyerId);
    const sellerName = await conn.getName(sellerId);
    
    m.reply(`✅ *¡Compra exitosa!*\n\n*${buyerName}* ha comprado a *${found.name}* de *${sellerName}* por *¥${found.salePrice}*`);
    
    // Notificar al vendedor
    conn.sendMessage(sellerId, { 
        text: `💰 *¡Venta realizada!*\n\n*${buyerName}* ha comprado tu personaje *${found.name}* por *¥${found.salePrice}*` 
    });
};

handler.help = ['buycharacter', 'buychar', 'buyc'];
handler.tags = ['gacha'];
handler.command = ['buycharacter', 'buychar', 'buyc'];
handler.group = true;

export default handler;