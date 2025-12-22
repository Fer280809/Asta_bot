// ============================================
// plugins/gacha-buycharacter.js - VERSIÓN NAVIDEÑA CORREGIDA
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply('🎅 *¡Ho Ho Ho!* Debes decirme qué *Adorno Navideño* quieres comprar.\n\n❄️ *Uso:* .buychar <nombre del adorno>');
    }
    
    const buyerId = m.sender;
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    // Cargar usuarios de gacha
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    // Inicializar usuario comprador si no existe
    if (!users[buyerId]) {
        users[buyerId] = {
            harem: [],
            favorites: [],
            claimMessage: '🎁 *¡Feliz Navidad!* {user} ha añadido a {character} a su *Colección de Adornos Festivos*. ¡Qué gran regalo!',
            lastRoll: 0,
            votes: {}
            // ¡SE ELIMINÓ gachaCoins: 1000! 🎯
        };
    }
    
    // Buscar adorno en venta
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
        return m.reply('🎄 *¡El Duende Vendedor no tiene ese Adorno Navideño en su tienda!*\n\n🏪 Usa *.tienda* para ver adornos disponibles.');
    }
    
    if (sellerId === buyerId) {
        return m.reply('❄️ *¡No puedes comprar tu propio Adorno Navideño! Ya está en tu árbol.*');
    }
    
    // Verificar si ya tiene el adorno
    const alreadyHas = users[buyerId].harem.find(c => c.id === found.id);
    if (alreadyHas) {
        return m.reply('⛄ *¡Ya tienes este Adorno Navideño en tu Colección Festiva!*');
    }
    
    // ============================================
    // ¡¡VERIFICAR CON MONEDA REAL (user.coin)!!
    // ============================================
    
    const buyerData = global.db.data.users[buyerId];
    if (!buyerData) {
        return m.reply('🦌 *¡Primero debes estar en la Lista de Santa!*\nUsa algún comando para registrarte en el taller.');
    }
    
    const requiredPrice = found.salePrice || 1000;
    
    if (buyerData.coin < requiredPrice) {
        return m.reply(`🎅 *¡Te falta espíritu navideño (y Monedas de Chocolate)!*\n\nNecesitas *$${requiredPrice} Monedas* pero solo tienes *$${buyerData.coin}*.`);
    }
    
    // Verificar vendedor en economía principal
    let sellerData = global.db.data.users[sellerId];
    if (!sellerData) {
        sellerData = global.db.data.users[sellerId] = {
            coin: 0,
            bank: 0,
            exp: 0,
            level: 0
        };
    }
    
    // REALIZAR TRANSACCIÓN NAVIDEÑA 🎄
    buyerData.coin -= requiredPrice;
    sellerData.coin = (sellerData.coin || 0) + requiredPrice;
    
    // Transferir adorno
    const charToTransfer = { 
        ...found, 
        forSale: false, 
        salePrice: 0, 
        claimedAt: Date.now(),
        boughtAt: Date.now(),
        boughtFrom: sellerId 
    };
    
    users[buyerId].harem.push(charToTransfer);
    users[sellerId].harem.splice(sellerIndex, 1);
    
    // Guardar cambios en gacha
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    // Nombres para mensajes
    const buyerName = buyerData.name || await conn.getName(buyerId);
    const sellerName = sellerData.name || await conn.getName(sellerId);
    
    // Mensaje al comprador
    await m.reply(`🎁 *¡Feliz Compra Navideña!*\n\n*${buyerName}* ha comprado el *Adorno Navideño* *${found.name}* de *${sellerName}* por *$${requiredPrice} Monedas de Chocolate*\n\n🎄 *Tu saldo ahora:* $${buyerData.coin} Monedas`);
    
    // Notificar al vendedor
    try {
        await conn.sendMessage(sellerId, { 
            text: `💰 *¡Venta Navideña realizada!*\n\n*${buyerName}* ha comprado tu *Adorno Navideño* *${found.name}*\n🎅 *Has recibido:* $${requiredPrice} Monedas de Chocolate\n🦌 *Tu saldo ahora:* $${sellerData.coin} Monedas`
        });
    } catch (error) {
        console.log('🧝 *Duende mensajero se perdió:*', error.message);
    }
};

handler.help = ['buycharacter', 'buychar', 'buyc'];
handler.tags = ['gacha'];
handler.command = ['buycharacter', 'buychar', 'buyc'];
handler.group = true;

export default handler;