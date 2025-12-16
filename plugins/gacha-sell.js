// ============================================
// plugins/gacha-sell.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    const args = text.split(',').map(arg => arg.trim());
    
    if (args.length < 2) {
        return m.reply('❌ *Uso correcto:* /sell <precio en Monedas de Jengibre>, <nombre del Adorno Navideño>\n\n*Ejemplo:* /sell 500, Rodolfo el Reno');
    }
    
    const price = parseInt(args[0]);
    const charName = args.slice(1).join(',').trim();
    
    if (isNaN(price) || price <= 0) {
        return m.reply('❌ *El precio debe ser un número válido de Monedas de Jengibre, mayor a 0.*');
    }
    
    const userId = m.sender;
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    if (!users[userId] || !users[userId].harem || users[userId].harem.length === 0) {
        return m.reply('❌ *No tienes Adornos Navideños para vender.*');
    }
    
    const charIndex = users[userId].harem.findIndex(c => 
        c.name.toLowerCase().includes(charName.toLowerCase())
    );
    
    if (charIndex === -1) {
        return m.reply('❌ *Ese Adorno Navideño no está en tu Colección Festiva (harem).*');
    }
    
    // Marcar personaje en venta (Lógica intacta)
    users[userId].harem[charIndex].forSale = true;
    users[userId].harem[charIndex].salePrice = price;
    
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    m.reply(`✅ *¡Puesto en el Mercado!* *${users[userId].harem[charIndex].name}* ahora está en venta por *$${price} Monedas de Jengibre*`);
};

handler.help = ['sell', 'vender'];
handler.tags = ['gacha'];
handler.command = ['sell', 'vender'];
handler.group = true;

export default handler;
