// ============================================
// plugins/gacha-waifusboard.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, args }) => {
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
    if (!fs.existsSync(dbPath)) {
        return m.reply('❀ No hay personajes disponibles.');
    }
    
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    // Ordenar por valor
    const sortedChars = characters.sort((a, b) => parseInt(b.value) - parseInt(a.value));
    
    const limit = parseInt(args[0]) || 20;
    const topChars = sortedChars.slice(0, limit);
    
    let text = `
╭━━━━━━━━━━━━━━━━╮
│  🏆 *TOP ${limit} PERSONAJES* 🏆
╰━━━━━━━━━━━━━━━━╯

📊 *Por valor más alto*

`;
    
    topChars.forEach((char, i) => {
        text += `
${i + 1}. *${char.name}*
   📺 ${char.source}
   💎 Valor: ${char.value}
   🗳️ Votos: ${char.votes || 0}
`;
    });
    
    m.reply(text);
};

handler.help = ['waifusboard', 'waifustop', 'topwaifus', 'wtop'];
handler.tags = ['gacha'];
handler.command = ['waifusboard', 'waifustop', 'topwaifus', 'wtop'];
handler.group = true;

export default handler;