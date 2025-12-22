// ============================================
// plugins/gacha-haremshop.js - VERSIÓN CON TEXTO MÁS CLARO
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, args }) => {
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    // Obtener todos los personajes en venta
    let forSale = [];
    for (const [userId, userData] of Object.entries(users)) {
        if (userData.harem) {
            userData.harem.forEach(char => {
                if (char.forSale) {
                    forSale.push({
                        ...char,
                        ownerId: userId
                    });
                }
            });
        }
    }
    
    if (forSale.length === 0) {
        return m.reply('🏪 *¡El Mercado de Adornos está vacío!* No hay regalos en venta actualmente.');
    }
    
    const page = parseInt(args[0]) || 1;
    const perPage = 10;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const totalPages = Math.ceil(forSale.length / perPage);
    
    let text = `
╭━━━━━━━━━━━━━━━━╮
│  🏪 *MERCADO DE ADORNOS NAVIDEÑOS* 🎁
╰━━━━━━━━━━━━━━━━╯

📊 *Total de Adornos en Venta:* ${forSale.length}
📄 *Página ${page} de ${totalPages}*

`;
    
    for (let i = start; i < end && i < forSale.length; i++) {
        const char = forSale[i];
        const ownerName = await conn.getName(char.ownerId);
        text += `
┌─⊷ ${i + 1}. *${char.name}*
│ 📺 Origen: ${char.source}
│ 💎 Valor Base: ${char.value}
│ 💰 Precio: ${char.salePrice} coins
│ 👤 Vendedor: ${ownerName}
└───────────────
`;
    }
    
    text += `\n💡 *Usa .buychar <nombre> para comprar un adorno.*`;
    
    m.reply(text);
};

handler.help = ['haremshop', 'tienda', 'market'];
handler.tags = ['gacha', 'navidad'];
handler.command = ['haremshop', 'tienda', 'market'];
handler.group = true;

export default handler;