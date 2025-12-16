// ============================================
// plugins/gacha-charimage.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!text) return m.reply('❌ *Ingresa el nombre del Adorno o Personaje Navideño que quieres ver.*');
    
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
    if (!fs.existsSync(dbPath)) {
        return m.reply('❀ ¡El taller de Santa está vacío! No hay Adornos Navideños disponibles.');
    }
    
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    // Buscar personaje
    const found = characters.find(c => 
        c.name.toLowerCase().includes(text.toLowerCase())
    );
    
    if (!found) {
        return m.reply('❌ *No se encontró ese Adorno Navideño en el catálogo de Santa.*');
    }
    
    if (!found.img || found.img.length === 0) {
        return m.reply('❌ *¡Este Adorno Navideño no tiene fotos disponibles para mostrar!*');
    }
    
    const randomImg = found.img[Math.floor(Math.random() * found.img.length)];
    
    const caption = `📸 *Foto Navideña:* ${found.name}\n🌟 *Origen (Cuento/Serie):* ${found.source}`;
    
    await conn.sendFile(m.chat, randomImg, 'character_navidad.jpg', caption, m);
};

handler.help = ['charimage', 'waifuimage', 'cimage', 'wimage'];
handler.tags = ['gacha'];
handler.command = ['charimage', 'waifuimage', 'cimage', 'wimage'];
handler.group = true;

export default handler;
