// ============================================
// plugins/gacha-serieinfo.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text: query }) => {
    if (!query) return m.reply('❌ *Ingresa el nombre de la serie.*');
    
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
    if (!fs.existsSync(dbPath)) {
        return m.reply('❀ No hay personajes disponibles.');
    }
    
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    // Buscar serie
    const serieChars = characters.filter(c => 
        c.source.toLowerCase().includes(query.toLowerCase())
    );
    
    if (serieChars.length === 0) {
        return m.reply('❌ *No se encontró esa serie.*');
    }
    
    const serieName = serieChars[0].source;
    const totalValue = serieChars.reduce((sum, char) => sum + (parseInt(char.value) || 0), 0);
    const avgValue = Math.floor(totalValue / serieChars.length);
    
    // Contar por género
    const genderCount = {};
    serieChars.forEach(char => {
        genderCount[char.gender] = (genderCount[char.gender] || 0) + 1;
    });
    
    let output = `
╭━━━━━━━━━━━━━━━━╮
│  📺 *INFO DE SERIE* 📺
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *${serieName}*
│ 👥 *Total personajes:* ${serieChars.length}
│ 💎 *Valor total:* ${totalValue}
│ 📊 *Valor promedio:* ${avgValue}
└───────────────

┌─⊷ *POR GÉNERO*
${Object.entries(genderCount).map(([gender, count]) => `│ ${gender}: ${count}`).join('\n')}
└───────────────

*Top 5 personajes de esta serie:*
`;

    serieChars
        .sort((a, b) => (parseInt(b.value) || 0) - (parseInt(a.value) || 0))
        .slice(0, 5)
        .forEach((char, i) => {
            output += `\n${i + 1}. *${char.name}* - 💎 ${char.value || 0}`;
        });
    
    m.reply(output);
};

handler.help = ['serieinfo', 'ainfo', 'animeinfo'];
handler.tags = ['gacha'];
handler.command = ['serieinfo', 'ainfo', 'animeinfo'];
handler.group = false;
handler.reg = true

export default handler;
