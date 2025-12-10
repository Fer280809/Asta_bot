// ============================================
// plugins/gacha-givechar.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!m.mentionedJid || m.mentionedJid.length === 0 || !text) {
        return m.reply('❌ *Uso correcto:* /givechar @usuario <nombre del personaje>\n\n*Ejemplo:* /givechar @usuario Miku');
    }
    
    const giverId = m.sender;
    const receiverId = m.mentionedJid[0];
    
    if (giverId === receiverId) {
        return m.reply('❌ *No puedes regalarte personajes a ti mismo.*');
    }
    
    // Extraer nombre del personaje
    const charName = text.replace(/@\d+/g, '').trim();
    
    if (!charName) {
        return m.reply('❌ *Debes especificar el nombre del personaje.*');
    }
    
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    if (!users[giverId] || !users[giverId].harem || users[giverId].harem.length === 0) {
        return m.reply('❌ *No tienes personajes para regalar.*');
    }
    
    const charIndex = users[giverId].harem.findIndex(c => 
        c.name.toLowerCase().includes(charName.toLowerCase())
    );
    
    if (charIndex === -1) {
        return m.reply('❌ *No tienes ese personaje en tu harem.*');
    }
    
    // Inicializar receptor si no existe
    if (!users[receiverId]) {
        users[receiverId] = {
            harem: [],
            favorites: [],
            claimMessage: '✧ {user} ha reclamado a {character}!',
            lastRoll: 0,
            votes: {},
            gachaCoins: 1000
        };
    }
    
    const char = users[giverId].harem[charIndex];
    
    // Verificar si el receptor ya tiene el personaje
    const alreadyHas = users[receiverId].harem.find(c => c.id === char.id);
    if (alreadyHas) {
        return m.reply('⚠️ *Ese usuario ya tiene este personaje.*');
    }
    
    // Transferir personaje
    users[receiverId].harem.push({ ...char, claimedAt: Date.now(), forSale: false, salePrice: 0 });
    users[giverId].harem.splice(charIndex, 1);
    
    // Actualizar en DB principal
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const dbCharIndex = characters.findIndex(c => c.id === char.id);
    if (dbCharIndex !== -1) {
        characters[dbCharIndex].user = receiverId;
        fs.writeFileSync(dbPath, JSON.stringify(characters, null, 2), 'utf-8');
    }
    
    // Eliminar de favoritos si está
    users[giverId].favorites = users[giverId].favorites.filter(id => id !== char.id);
    
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    const giverName = await conn.getName(giverId);
    const receiverName = await conn.getName(receiverId);
    
    m.reply(`✅ *${giverName}* le ha regalado *${char.name}* a *${receiverName}*! 🎁`);
    
    // Notificar al receptor
    conn.sendMessage(receiverId, { 
        text: `🎁 *¡Regalo recibido!*\n\n*${giverName}* te ha regalado a *${char.name}*!` 
    });
};

handler.help = ['givechar', 'givewaifu', 'regalar'];
handler.tags = ['gacha'];
handler.command = ['givechar', 'givewaifu', 'regalar'];
handler.group = true;

export default handler;