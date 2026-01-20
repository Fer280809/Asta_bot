// ============================================
// plugins/gacha-charimage.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!text) return m.reply('❌ *Ingresa el nombre del personaje.*');
    
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
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
    
    if (!found.img || found.img.length === 0) {
        return m.reply('❌ *Este personaje no tiene imágenes disponibles.*');
    }
    
    const randomImg = found.img[Math.floor(Math.random() * found.img.length)];
    
    const caption = `🖼️ *${found.name}* - ${found.source}`;
    
    await conn.sendFile(m.chat, randomImg, 'character.jpg', caption, m);
};

handler.help = ['charimage', 'waifuimage', 'cimage', 'wimage'];
handler.tags = ['gacha'];
handler.command = ['charimage', 'waifuimage', 'cimage', 'wimage'];
handler.group = true;

export default handler;