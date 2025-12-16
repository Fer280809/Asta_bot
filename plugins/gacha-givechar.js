// ============================================
// plugins/gacha-givechar.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!m.mentionedJid || m.mentionedJid.length === 0 || !text) {
        return m.reply('❌ *Uso correcto:* /givechar @usuario <nombre del Adorno Navideño>\n\n*Ejemplo:* /givechar @duende Ayumi');
    }
    
    const giverId = m.sender;
    const receiverId = m.mentionedJid[0];
    
    if (giverId === receiverId) {
        return m.reply('❌ *¡No puedes regalarte Adornos a ti mismo!* Ya están en tu árbol.');
    }
    
    // Extraer nombre del personaje
    const charName = text.replace(/@\d+/g, '').trim();
    
    if (!charName) {
        return m.reply('❌ *Debes especificar el nombre del Adorno Navideño.*');
    }
    
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    if (!users[giverId] || !users[giverId].harem || users[giverId].harem.length === 0) {
        return m.reply('❌ *Tu caja de Adornos está vacía.* No tienes qué regalar.');
    }
    
    const charIndex = users[giverId].harem.findIndex(c => 
        c.name.toLowerCase().includes(charName.toLowerCase())
    );
    
    if (charIndex === -1) {
        return m.reply('❌ *Ese Adorno Navideño no está en tu Colección Festiva (harem).*');
    }
    
    // Inicializar receptor si no existe
    if (!users[receiverId]) {
        users[receiverId] = {
            harem: [],
            favorites: [],
            // Usar el mensaje navideño predeterminado
            claimMessage: '✨ *¡Feliz Navidad!* {user} ha añadido a {character} a su *Colección de Adornos Festivos* (Harem). ¡Qué gran regalo!', 
            lastRoll: 0,
            votes: {},
            gachaCoins: 1000
        };
    }
    
    const char = users[giverId].harem[charIndex];
    
    // Verificar si el receptor ya tiene el personaje
    const alreadyHas = users[receiverId].harem.find(c => c.id === char.id);
    if (alreadyHas) {
        return m.reply('⚠️ *¡Ese usuario ya tiene este Adorno Navideño!* Elfo duplicado.');
    }
    
    // Transferir personaje (Lógica del código intacta)
    users[receiverId].harem.push({ ...char, claimedAt: Date.now(), forSale: false, salePrice: 0 });
    users[giverId].harem.splice(charIndex, 1);
    
    // Actualizar en DB principal (Lógica del código intacta)
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const dbCharIndex = characters.findIndex(c => c.id === char.id);
    if (dbCharIndex !== -1) {
        characters[dbCharIndex].user = receiverId;
        fs.writeFileSync(dbPath, JSON.stringify(characters, null, 2), 'utf-8');
    }
    
    // Eliminar de favoritos si está (Lógica del código intacta)
    users[giverId].favorites = users[giverId].favorites.filter(id => id !== char.id);
    
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    const giverName = await conn.getName(giverId);
    const receiverName = await conn.getName(receiverId);
    
    m.reply(`✅ *¡Regalo Navideño Enviado!* *${giverName}* le ha regalado el Adorno *${char.name}* a *${receiverName}*! 🎁`);
    
    // Notificar al receptor
    conn.sendMessage(receiverId, { 
        text: `🎁 *¡Un Adorno Navideño para tu árbol!*\n\n*${giverName}* te ha obsequiado a *${char.name}*!` 
    });
};

handler.help = ['givechar', 'givewaifu', 'regalar'];
handler.tags = ['gacha'];
handler.command = ['givechar', 'givewaifu', 'regalar'];
handler.group = true;

export default handler;
