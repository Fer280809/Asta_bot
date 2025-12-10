// ============================================
// plugins/gacha-haremshop.js
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
        return m.reply('🏪 *No hay personajes en venta actualmente.*');
    }
    
    const page = parseInt(args[0]) || 1;
    const perPage = 10;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const totalPages = Math.ceil(forSale.length / perPage);
    
    let text = `
╭━━━━━━━━━━━━━━━━╮
│  🏪 *TIENDA DE PERSONAJES* 🏪
╰━━━━━━━━━━━━━━━━╯

📊 *Total en venta:* ${forSale.length}
📄 *Página ${page} de ${totalPages}*

`;
    
    for (let i = start; i < end && i < forSale.length; i++) {
        const char = forSale[i];
        const ownerName = await conn.getName(char.ownerId);
        text += `
┌─⊷ ${i + 1}. *${char.name}*
│ 📺 ${char.source}
│ 💎 Valor base: ${char.value}
│ 💰 Precio: $${char.salePrice}
│ 👤 Vendedor: ${ownerName}
└───────────────
`;
    }
    
    text += `\n💡 *Usa /buychar <nombre> para comprar un personaje*`;
    
    m.reply(text);
};

handler.help = ['haremshop', 'tiendawaifus', 'wshop'];
handler.tags = ['gacha'];
handler.command = ['haremshop', 'tiendawaifus', 'wshop'];
handler.group = true;

export default handler;
