// ============================================
// plugins/gacha-serielist.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, args }) => {
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
    if (!fs.existsSync(dbPath)) {
        return m.reply('❀ No hay personajes disponibles.');
    }
    
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    // Obtener series únicas
    const seriesMap = {};
    characters.forEach(char => {
        if (!seriesMap[char.source]) {
            seriesMap[char.source] = 0;
        }
        seriesMap[char.source]++;
    });
    
    const seriesList = Object.entries(seriesMap).sort((a, b) => b[1] - a[1]);
    
    const page = parseInt(args[0]) || 1;
    const perPage = 15;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const totalPages = Math.ceil(seriesList.length / perPage);
    
    let text = `
╭━━━━━━━━━━━━━━━━╮
│  📚 *LISTA DE SERIES* 📚
╰━━━━━━━━━━━━━━━━╯

📊 *Total de series:* ${seriesList.length}
📄 *Página ${page} de ${totalPages}*

`;
    
    seriesList.slice(start, end).forEach(([serie, count], i) => {
        text += `${start + i + 1}. *${serie}* - ${count} personajes\n`;
    });
    
    if (totalPages > 1) {
        text += `\n💡 *Usa /serielist <página> para ver más.*`;
    }
    
    m.reply(text);
};

handler.help = ['serielist', 'slist', 'animelist'];
handler.tags = ['gacha'];
handler.command = ['serielist', 'slist', 'animelist'];
handler.group = true;
handler.reg = true

export default handler;
