// ============================================
// plugins/gacha-removesale.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply('❌ *Uso correcto:* /removesale <nombre del personaje>');
    }
    
    const userId = m.sender;
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    if (!users[userId] || !users[userId].harem || users[userId].harem.length === 0) {
        return m.reply('❌ *No tienes personajes en venta.*');
    }
    
    const charIndex = users[userId].harem.findIndex(c => 
        c.name.toLowerCase().includes(text.toLowerCase()) && c.forSale
    );
    
    if (charIndex === -1) {
        return m.reply('❌ *No tienes ese personaje en venta.*');
    }
    
    // Quitar de venta
    users[userId].harem[charIndex].forSale = false;
    users[userId].harem[charIndex].salePrice = 0;
    
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    m.reply(`✅ *${users[userId].harem[charIndex].name}* ya no está en venta.`);
};

handler.help = ['removesale', 'removerventa'];
handler.tags = ['gacha'];
handler.command = ['removesale', 'removerventa'];
handler.group = true;

export default handler;