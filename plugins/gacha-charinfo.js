// ============================================
// plugins/gacha-charinfo.js - VERSIÓN NAVIDEÑA CORREGIDA
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply('🎄 *¡Ho Ho Ho!* ¿Qué Adorno Navideño quieres conocer?\n\n❄️ *Uso:* .charinfo <nombre del adorno>');
    }
    
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    if (!fs.existsSync(dbPath)) {
        return m.reply('🎅 *¡La Lista de Santa está vacía!* No hay registros de Adornos disponibles.');
    }
    
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    // Buscar adorno navideño
    const found = characters.find(c => 
        c.name.toLowerCase().includes(text.toLowerCase())
    );
    
    if (!found) {
        // Sugerencias festivas
        const suggestions = characters
            .filter(c => c.name && c.name.toLowerCase().includes(text.toLowerCase().substring(0, 3)))
            .slice(0, 5)
            .map(c => `• ${c.name}`)
            .join('\n');
        
        let reply = '🎁 *¡Ese Adorno no está en el Catálogo de Santa!*\n\n';
        if (suggestions) {
            reply += `🦌 *¿Quizás buscabas estos adornos?*\n${suggestions}`;
        } else {
            reply += '❄️ Usa *.catalogo* para ver todos los adornos disponibles.';
        }
        return m.reply(reply);
    }
    
    // Contar árboles decorados con este adorno
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    const owners = Object.entries(users).filter(([id, data]) => 
        data.harem && data.harem.some(c => c.id === found.id)
    );
    
    const totalVotes = found.votes || 0;
    
    // Imagen navideña
    const randomImg = found.img && found.img.length > 0 
        ? found.img[Math.floor(Math.random() * found.img.length)]
        : 'https://i.ibb.co/0Q3J9XZ/file.jpg';
    
    // Mensaje festivo
    const caption = `
╭━━━━━━━━━━━━━━━━━━━━╮
│   🎅 *FICHA DEL ADORNO NAVIDEÑO* 🎅
╰━━━━━━━━━━━━━━━━━━━━╯

┌─⊷ *🎄 DETALLES FESTIVOS*
│ 📛 *Nombre del Adorno:* ${found.name}
│ ⚧️ *Decoración (Género):* ${found.gender}
│ 📺 *Origen (Cuento/Serie):* ${found.source}
│ 💎 *Rareza (Valor):* ${found.value}
│ 🏷️ *ID del Catálogo:* ${found.id}
└───────────────

┌─⊷ *🌟 ESTADÍSTICAS DEL ÁRBOL*
│ 🎄 *Árboles Decorados:* ${owners.length} árboles
│ 🗳️ *Deseos Pedidos (Votos):* ${totalVotes} deseos
│ 📊 *Condición del Regalo:* ${found.status || 'Listo para decorar'}
└───────────────

🎁 *¡Feliz Navidad!* Que este adorno traiga alegría a tu hogar.`;

    await conn.sendFile(m.chat, randomImg, 'adorno_navideno.jpg', caption, m);
};

handler.help = ['charinfo', 'winfo'];
handler.tags = ['gacha'];
handler.command = ['charinfo', 'winfo', ''];
handler.group = true;

export default handler;