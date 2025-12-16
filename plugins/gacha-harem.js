// ============================================
// plugins/gacha-harem.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, args }) => {
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    // Determinar usuario a consultar
    let targetUser = m.sender;
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetUser = m.mentionedJid[0];
    } else if (args[0] && args[0].startsWith('@')) {
        const num = args[0].replace('@', '');
        targetUser = num + '@s.whatsapp.net';
    }
    
    // Cargar usuarios
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    if (!users[targetUser] || !users[targetUser].harem || users[targetUser].harem.length === 0) {
        return m.reply('📭 *Este usuario no ha colgado ningún Adorno Navideño en su árbol.*');
    }
    
    const userName = await conn.getName(targetUser);
    const page = parseInt(args[1]) || 1;
    const perPage = 10;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const totalPages = Math.ceil(users[targetUser].harem.length / perPage);
    
    let text = `
╭━━━━━━━━━━━━━━━━╮
│  🎄 *COLECCIÓN FESTIVA DE ${userName.toUpperCase()}* 🎁
╰━━━━━━━━━━━━━━━━╯

📊 *Total de Adornos:* ${users[targetUser].harem.length}
📄 *Página ${page} de ${totalPages}*

`;
    
    users[targetUser].harem.slice(start, end).forEach((char, i) => {
        const isFav = users[targetUser].favorites.includes(char.id);
        // Cambiamos el texto "En venta" y "Valor"
        const forSale = char.forSale ? `🏪 En Tienda: $${char.salePrice} Monedas de Jengibre` : '';
        text += `
┌─⊷ ${start + i + 1}. *${char.name}* ${isFav ? '🌟 FAVORITO' : ''}
│ 📺 Origen: ${char.source}
│ 💎 Rareza (Valor): ${char.value}
${forSale ? `│ ${forSale}` : ''}
└───────────────
`;
    });
    
    if (totalPages > 1) {
        text += `\n💡 *Usa el comando con el número de página para ver el resto de los Adornos.*`;
    }
    
    m.reply(text);
};

handler.help = ['harem', 'waifus', 'claims'];
handler.tags = ['gacha'];
handler.command = ['harem', 'waifus', 'claims'];
handler.group = true;

export default handler;
