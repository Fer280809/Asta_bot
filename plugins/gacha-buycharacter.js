// ============================================
// plugins/gacha-buycharacter.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply('❌ *Uso correcto:* /buychar <nombre del Adorno Navideño>');
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
            votes: {},
            gachaCoins: 1000 // Mantener el nombre de la variable, solo cambiar el texto
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
        return m.reply('❌ *El Duende Vendedor no tiene ese Adorno Navideño en su tienda.*');
    }
    
    if (sellerId === buyerId) {
        return m.reply('❌ *¡No puedes comprar tu propio Adorno Navideño! Ya está en tu árbol.*');
    }
    
    // Verificar si ya tiene el personaje
    const alreadyHas = users[buyerId].harem.find(c => c.id === found.id);
    if (alreadyHas) {
        return m.reply('⚠️ *¡Ya tienes este Adorno Navideño en tu Colección Festiva!*');
    }
    
    // Verificar fondos
    const currentCoins = users[buyerId].gachaCoins;
    const requiredPrice = found.salePrice;
    
    if (currentCoins < requiredPrice) {
        return m.reply(`❌ *¡Te falta espíritu navideño (y Monedas de Jengibre)!* Necesitas *$${requiredPrice}* pero solo tienes *$${currentCoins}*`);
    }
    
    // Realizar transacción
    users[buyerId].gachaCoins -= requiredPrice;
    users[sellerId].gachaCoins = (users[sellerId].gachaCoins || 0) + requiredPrice;
    
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
    
    m.reply(`🎁 *¡Feliz Compra Navideña!*\n\n*${buyerName}* ha comprado el *Adorno Navideño* *${found.name}* de *${sellerName}* por *$${requiredPrice} Monedas de Jengibre*`);
    
    // Notificar al vendedor
    conn.sendMessage(sellerId, { 
        text: `💰 *¡Venta Navideña realizada!*\n\n*${buyerName}* ha comprado tu *Adorno Navideño* *${found.name}* y has recibido *$${requiredPrice} Monedas de Jengibre*` 
    });
};

handler.help = ['buycharacter', 'buychar', 'buyc'];
handler.tags = ['gacha'];
handler.command = ['buycharacter', 'buychar', 'buyc'];
handler.group = true;

export default handler;
