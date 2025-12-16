// ============================================
// plugins/gacha-vote.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply('❌ *Uso correcto:* /vote <nombre del Adorno Navideño>');
    }
    
    const userId = m.sender;
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    if (!fs.existsSync(dbPath)) {
        return m.reply('❀ ¡El Registro de Adornos está vacío! No hay regalos disponibles.');
    }
    
    let characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    if (!users[userId]) {
        users[userId] = {
            harem: [],
            favorites: [],
            // Usar el mensaje navideño predeterminado
            claimMessage: '✨ *¡Feliz Navidad!* {user} ha añadido a {character} a su *Colección de Adornos Festivos* (Harem). ¡Qué gran regalo!', 
            lastRoll: 0,
            votes: {},
            gachaCoins: 1000
        };
    }
    
    // Buscar personaje
    const charIndex = characters.findIndex(c => 
        c.name.toLowerCase().includes(text.toLowerCase())
    );
    
    if (charIndex === -1) {
        return m.reply('❌ *No se encontró ese Adorno Navideño en el Catálogo.*');
    }
    
    const found = characters[charIndex];
    
    // Verificar cooldown de 24 horas por personaje
    const now = Date.now();
    const cooldown = 86400000; // 24 horas
    
    if (users[userId].votes[found.id] && (now - users[userId].votes[found.id]) < cooldown) {
        const remaining = Math.ceil((cooldown - (now - users[userId].votes[found.id])) / 3600000);
        return m.reply(`⏰ *Debes esperar ${remaining} horas para registrar otro Deseo por este Adorno en la lista de Santa.*`);
    }
    
    // Agregar voto (Lógica intacta)
    if (!found.votes) found.votes = 0;
    found.votes += 1;
    found.value = parseInt(found.value) + 10; // Aumentar valor por voto
    
    characters[charIndex] = found;
    fs.writeFileSync(dbPath, JSON.stringify(characters, null, 2), 'utf-8');
    
    // Registrar voto del usuario (Lógica intacta)
    users[userId].votes[found.id] = now;
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    m.reply(`✅ *¡Deseo Registrado!* Has añadido a *${found.name}* a la Lista de Deseos de Santa.\n\n🗳️ Deseos totales: ${found.votes}\n💎 Nueva Rareza: ${found.value}`);
};

handler.help = ['vote', 'votar'];
handler.tags = ['gacha'];
handler.command = ['vote', 'votar'];
handler.group = true;

export default handler;
