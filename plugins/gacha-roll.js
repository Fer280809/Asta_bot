// ============================================
// plugins/gacha-roll.js - VERSIÓN CORREGIDA
// ELIMINA gachaCoins completamente
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, usedPrefix }) => {
    const userId = m.sender;
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    // Verificar que exista el catálogo de adornos
    if (!fs.existsSync(dbPath)) {
        return m.reply('🎅 *¡El saco de regalos de Santa está vacío!*\n\nNo hay adornos navideños disponibles en este momento.');
    }
    
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    if (!Array.isArray(characters) || characters.length === 0) {
        return m.reply('📭 *¡No hay adornos en el catálogo!*\n\nContacta a un administrador para agregar adornos.');
    }
    
    // Cargar datos de usuarios de gacha (solo para colección)
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    // Inicializar usuario en SISTEMA GACHA si no existe (SOLO para colección)
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
    
    // Verificar cooldown de 2 minutos
    const now = Date.now();
    const cooldown = 120000; // 2 minutos
    
    if (users[userId].lastRoll && (now - users[userId].lastRoll) < cooldown) {
        const remaining = Math.ceil((cooldown - (now - users[userId].lastRoll)) / 1000);
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        
        return m.reply(`⏰ *¡El trineo necesita descansar!*\n\nDebes esperar ${minutes > 0 ? `${minutes}m ` : ''}${seconds}s para otra tirada.\n🎄 *Última tirada:* ${new Date(users[userId].lastRoll).toLocaleTimeString()}`);
    }
    
    // Seleccionar adorno aleatorio (evitar duplicados si es posible)
    let randomChar;
    const userHaremIds = users[userId].harem.map(c => c.id);
    
    // Primero intentar con adornos que el usuario NO tiene
    const newChars = characters.filter(c => !userHaremIds.includes(c.id));
    
    if (newChars.length > 0) {
        randomChar = newChars[Math.floor(Math.random() * newChars.length)];
    } else {
        // Si ya tiene todos, dar uno aleatorio cualquiera
        randomChar = characters[Math.floor(Math.random() * characters.length)];
    }
    
    // Obtener imagen aleatoria
    const randomImg = randomChar.img && randomChar.img.length > 0 
        ? randomChar.img[Math.floor(Math.random() * randomChar.img.length)]
        : 'https://i.ibb.co/0Q3J9XZ/file.jpg';
    
    // Verificar si ya tiene este adorno
    const alreadyHas = userHaremIds.includes(randomChar.id);
    const duplicateWarning = alreadyHas ? '\n⚠️ *¡Ya tienes este adorno!* Si lo reclamas, será un duplicado.' : '';
    
    // Crear mensaje del roll
    const caption = 
`🎄 *¡HAS DESEMPACADO UN REGALO NAVIDEÑO!* 🎁

🎁 *Adorno:* ${randomChar.name}
⚧️ *Género:* ${randomChar.gender || 'No especificado'}
📺 *Origen:* ${randomChar.source || 'Desconocido'}
💎 *Valor:* ${randomChar.value || 100}
🏷️ *ID:* ${randomChar.id}
📊 *Estado:* ${randomChar.status || 'Libre'}

${duplicateWarning}

💡 *Para reclamar este adorno:*
1. Responde a ESTE mensaje
2. Escribe: \`.claim\` o \`.c\`

⏰ *¡Date prisa!* Tienes 2 minutos antes de que el regalo desaparezca.`;

    // Enviar imagen y mensaje
    const msg = await conn.sendFile(m.chat, randomImg, 'regalo_navideno.jpg', caption, m);
    
    // Actualizar último roll del usuario
    users[userId].lastRoll = now;
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    // Guardar adorno temporal para claim (necesario para gacha-claim.js)
    global.tempCharacters = global.tempCharacters || {};
    global.tempCharacters[msg.key.id] = {
        character: randomChar,
        timestamp: now,
        expires: now + 120000, // 2 minutos
        isDuplicate: alreadyHas
    };
    
    // Limpiar registro después de 2 minutos (para no acumular basura)
    setTimeout(() => {
        if (global.tempCharacters && global.tempCharacters[msg.key.id]) {
            delete global.tempCharacters[msg.key.id];
        }
    }, 120000);
};

handler.help = ['roll', 'rollwaifu', 'gacharoll', 'tirada'];
handler.tags = ['gacha', 'navidad'];
handler.command = ['roll', 'rollwaifu', 'gacharoll', 'tirada'];
handler.group = true;
handler.private = true;

// Información del comando
handler.description = 'Hacer una tirada gratuita para obtener un adorno navideño';
handler.usage = '';
handler.example = '.roll';
handler.note = 'Cooldown: 2 minutos. Responde al mensaje con .claim para reclamar el adorno.';

export default handler;