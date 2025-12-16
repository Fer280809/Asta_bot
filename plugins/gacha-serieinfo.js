// ============================================
// plugins/gacha-serieinfo.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text: query }) => {
    if (!query) return m.reply('❌ *Ingresa el nombre del Cuento o Serie Navideña.*');
    
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
    if (!fs.existsSync(dbPath)) {
        return m.reply('❀ ¡El Registro de Cuentos de Navidad está vacío! No hay Adornos disponibles.');
    }
    
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    // Buscar serie
    const serieChars = characters.filter(c => 
        c.source.toLowerCase().includes(query.toLowerCase())
    );
    
    if (serieChars.length === 0) {
        return m.reply('❌ *No se encontró ese Cuento o Serie Navideña.*');
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
│  📖 *FICHA DEL CUENTO NAVIDEÑO* 🎄
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *Origen: ${serieName}*
│ 👥 *Total de Adornos:* ${serieChars.length}
│ 💎 *Rareza Total:* ${totalValue}
│ 📊 *Rareza Promedio:* ${avgValue}
└───────────────

┌─⊷ *CLASIFICACIÓN DE ADORNOS*
${Object.entries(genderCount).map(([gender, count]) => `│ Adornos ${gender}: ${count}`).join('\n')}
└───────────────

*Top 5 Adornos (por Rareza) de este Cuento:*
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

export default handler;
