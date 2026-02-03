// ============================================
// plugins/gacha-charinfo.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!text) return m.reply('❌ *Ingresa el nombre del personaje.*');
    
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    if (!fs.existsSync(dbPath)) {
        return m.reply('❀ No hay personajes disponibles.');
    }
    
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    // Buscar personaje
    const found = characters.find(c => 
        c.name.toLowerCase().includes(text.toLowerCase())
    );
    
    if (!found) {
        return m.reply('❌ *No se encontró ese personaje.*');
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
│  ℹ️ *INFO DEL PERSONAJE* ℹ️
╰━━━━━━━━━━━━━━━━╯

┌─⊷ *DATOS BÁSICOS*
│ 📛 *Nombre:* ${found.name}
│ ⚧️ *Género:* ${found.gender}
│ 📺 *Serie:* ${found.source}
│ 💎 *Valor:* ${found.value}
│ 🆔 *ID:* ${found.id}
└───────────────

┌─⊷ *ESTADÍSTICAS*
│ 👥 *Propietarios:* ${owners.length}
│ 🗳️ *Votos totales:* ${totalVotes}
│ 📊 *Estado:* ${found.status}
└───────────────`;

    await conn.sendFile(m.chat, randomImg, 'character.jpg', caption, m);
};

handler.help = ['charinfo', 'winfo', 'waifuinfo'];
handler.tags = ['gacha'];
handler.command = ['charinfo', 'winfo', 'waifuinfo'];
handler.group = true;

export default handler;