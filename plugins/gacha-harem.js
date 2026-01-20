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
        return m.reply('📭 *Este usuario no tiene personajes reclamados.*');
    }
    
    const userName = await conn.getName(targetUser);
    const page = parseInt(args[1]) || 1;
    const perPage = 10;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const totalPages = Math.ceil(users[targetUser].harem.length / perPage);
    
    let text = `
╭━━━━━━━━━━━━━━━━╮
│  💖 *HAREM DE ${userName.toUpperCase()}* 💖
╰━━━━━━━━━━━━━━━━╯

📊 *Total de personajes:* ${users[targetUser].harem.length}
📄 *Página ${page} de ${totalPages}*

`;
    
    users[targetUser].harem.slice(start, end).forEach((char, i) => {
        const isFav = users[targetUser].favorites.includes(char.id);
        const forSale = char.forSale ? `🏪 En venta: $${char.salePrice}` : '';
        text += `
┌─⊷ ${start + i + 1}. *${char.name}* ${isFav ? '⭐' : ''}
│ 📺 ${char.source}
│ 💎 Valor: ${char.value}
${forSale ? `│ ${forSale}` : ''}
└───────────────
`;
    });
    
    if (totalPages > 1) {
        text += `\n💡 *Usa el comando con el número de página para ver más.*`;
    }
    
    m.reply(text);
};

handler.help = ['harem', 'waifus', 'claims'];
handler.tags = ['gacha'];
handler.command = ['harem', 'waifus', 'claims'];
handler.group = true;

export default handler;