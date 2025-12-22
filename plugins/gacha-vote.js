// ============================================
// plugins/gacha-vote.js - VERSIÓN CORREGIDA
// ELIMINA gachaCoins completamente
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply('🎅 *¡Necesitas decirme qué adorno quieres votar!*\n\n❄️ *Uso:* `.vote <nombre del adorno>`\n✨ *Ejemplo:* `.vote Yui`');
    }
    
    const userId = m.sender;
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    // Verificar que exista el catálogo
    if (!fs.existsSync(dbPath)) {
        return m.reply('📭 *¡El catálogo de adornos está vacío!*\n\nNo hay adornos disponibles para votar.');
    }
    
    // Cargar datos
    let characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    // Inicializar usuario en SISTEMA GACHA si no existe
    if (!users[userId]) {
        users[userId] = {
            harem: [],
            favorites: [],
            claimMessage: '✨ *¡Feliz Navidad!* {user} ha añadido a {character} a su *Colección de Adornos Festivos*. ¡Qué gran regalo!',
            lastRoll: 0,
            votes: {}
            // ¡SE ELIMINÓ gachaCoins: 1000! 🎯
        };
    }
    
    // Buscar adorno (búsqueda flexible)
    const charIndex = characters.findIndex(c => 
        c.name && c.name.toLowerCase().includes(text.toLowerCase())
    );
    
    if (charIndex === -1) {
        // Sugerir adornos similares
        const suggestions = characters
            .filter(c => c.name && c.name.toLowerCase().includes(text.toLowerCase().substring(0, 3)))
            .slice(0, 5)
            .map(c => `• ${c.name}`)
            .join('\n');
        
        let reply = `🎄 *¡No hay un adorno llamado "${text}"!*\n\n`;
        if (suggestions) {
            reply += `🦌 *¿Quizás buscabas?*\n${suggestions}\n\n`;
        }
        reply += `Usa \`.serielist\` para ver todos los adornos disponibles.`;
        return m.reply(reply);
    }
    
    const found = characters[charIndex];
    
    // --- Verificar cooldown (24 horas por adorno) ---
    const now = Date.now();
    const cooldown = 86400000; // 24 horas
    
    if (users[userId].votes && users[userId].votes[found.id]) {
        const lastVoteTime = users[userId].votes[found.id];
        
        if ((now - lastVoteTime) < cooldown) {
            const remaining = cooldown - (now - lastVoteTime);
            const hours = Math.floor(remaining / 3600000);
            const minutes = Math.floor((remaining % 3600000) / 60000);
            
            return m.reply(`⏰ *¡Ya votaste por este adorno recientemente!*\n\nDebes esperar ${hours}h ${minutes}m para votar por *${found.name}* nuevamente.\n🎄 *Último voto:* ${new Date(lastVoteTime).toLocaleTimeString()}`);
        }
    }
    
    // --- Procesar el voto ---
    
    // 1. Aumentar votos del adorno
    if (!found.votes) found.votes = 0;
    found.votes += 1;
    
    // 2. Aumentar valor (rarity) en 10 puntos
    const currentValue = parseInt(found.value) || 100;
    found.value = currentValue + 10;
    
    // 3. Actualizar en el catálogo
    characters[charIndex] = found;
    fs.writeFileSync(dbPath, JSON.stringify(characters, null, 2), 'utf-8');
    
    // 4. Registrar voto del usuario
    if (!users[userId].votes) {
        users[userId].votes = {};
    }
    users[userId].votes[found.id] = now;
    
    // 5. Guardar datos del usuario
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    // --- Mensaje de éxito ---
    const userName = await conn.getName(userId);
    
    const successMsg = 
`✅ *¡VOTO REGISTRADO CON ÉXITO!*

🎁 *Adorno:* ${found.name}
👤 *Votante:* ${userName}
🗳️ *Votos totales:* ${found.votes}
💎 *Nuevo valor:* ${found.value} (+10)
🎬 *Origen:* ${found.source || 'Desconocido'}

✨ *Efecto:* Este adorno ahora es más valioso y aparecerá más arriba en los rankings.

⏰ *Próximo voto por este adorno:* En 24 horas
📊 *Total de adornos votados por ti:* ${Object.keys(users[userId].votes || {}).length}`;
    
    await m.reply(successMsg);
};

handler.help = ['vote', 'votar', 'votaradorno'];
handler.tags = ['gacha', 'navidad'];
handler.command = ['vote', 'votar', 'votaradorno'];
handler.group = true;
handler.private = true;

// Información del comando
handler.description = 'Votar por un adorno para aumentar su valor y popularidad';
handler.usage = '<nombre del adorno>';
handler.example = '.vote Yui';
handler.note = 'Cooldown: 24 horas por adorno. Cada voto aumenta el valor en 10 puntos.';

export default handler;