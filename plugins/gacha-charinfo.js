// ============================================
// plugins/gacha-charinfo.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!text) return m.reply('❌ *Ingresa el nombre del Adorno Navideño para ver su ficha.*');
    
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    if (!fs.existsSync(dbPath)) {
        return m.reply('❀ ¡La Lista de Santa está vacía! No hay registros de Adornos disponibles.');
    }
    
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    // Buscar personaje
    const found = characters.find(c => 
        c.name.toLowerCase().includes(text.toLowerCase())
    );
    
    if (!found) {
        return m.reply('❌ *No se encontró ese Adorno Navideño en el Registro de Santa.*');
    }
    
    // Contar propietarios
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    const owners = Object.entries(users).filter(([id, data]) => 
        data.harem && data.harem.some(c => c.id === found.id)
    );
    
    const totalVotes = found.votes || 0;
    
    const randomImg = found.img && found.img.length > 0 
        ? found.img[Math.floor(Math.random() * found.img.length)]
        : 'https://i.ibb.co/0Q3J9XZ/file.jpg';
    
    const caption = `
╭━━━━━━━━━━━━━━━━╮
│  🌟 *FICHA DEL ADORNO NAVIDEÑO* 🌟
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *DETALLES FESTIVOS*
│ 📛 *Nombre del Adorno:* ${found.name}
│ ⚧️ *Decoración (Género):* ${found.gender}
│ 📺 *Origen (Cuento/Serie):* ${found.source}
│ 💎 *Rareza (Valor):* ${found.value}
│ 🏷️ *ID del Catálogo:* ${found.id}
└───────────────

┌─⊷ *ESTADÍSTICAS DEL ÁRBOL*
│ 👥 *Árboles Decorados:* ${owners.length}
│ 🗳️ *Deseos Pedidos (Votos):* ${totalVotes}
│ 📊 *Condición del Regalo:* ${found.status}
└───────────────`;

    await conn.sendFile(m.chat, randomImg, 'adorno_navideno.jpg', caption, m);
};

handler.help = ['charinfo', 'winfo', 'waifuinfo'];
handler.tags = ['gacha'];
handler.command = ['charinfo', 'winfo', 'waifuinfo'];
handler.group = true;

export default handler;
