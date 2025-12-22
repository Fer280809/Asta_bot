// ============================================
// plugins/gacha-setclaimmsg.js - VERSIÓN CORREGIDA
// ELIMINA gachaCoins completamente
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply('🎅 *¡Necesitas escribir un mensaje!*\n\n❄️ *Uso:* `.setclaimmsg <tu mensaje personalizado>`\n✨ *Variables disponibles:*\n• `{user}` - Tu nombre\n• `{character}` - Nombre del adorno\n\n🎄 *Ejemplo:*\n`.setclaimmsg 🎁 ¡{user} recibió a {character} en Navidad!`');
    }
    
    const userId = m.sender;
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    // Cargar usuarios festivos
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    // Verificar que el mensaje incluya las variables obligatorias
    if (!text.includes('{user}') || !text.includes('{character}')) {
        return m.reply('📝 *¡Formato incorrecto!*\n\nTu mensaje DEBE incluir:\n✅ `{user}` (será tu nombre)\n✅ `{character}` (nombre del adorno)\n\n🎯 *Ejemplo correcto:*\n`.setclaimmsg 🎄 {user} decoró su árbol con {character}`');
    }
    
    // Limitar longitud del mensaje
    if (text.length > 200) {
        return m.reply('📜 *¡Mensaje muy largo!*\n\nEl máximo permitido es 200 caracteres.\nTu mensaje tiene: ' + text.length + ' caracteres.');
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
    
    // Guardar mensaje personalizado
    users[userId].claimMessage = text;
    
    // Guardar cambios
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    // Crear vista previa
    const userName = await conn.getName(userId);
    const preview = text
        .replace(/{user}/g, userName)
        .replace(/{character}/g, '⭐ Adorno Especial ⭐');
    
    // Mensaje de confirmación
    const confirmMsg = 
`✅ *¡MENSAJE PERSONALIZADO GUARDADO!*

🎁 *Tu mensaje cuando reclames adornos será:*
"${preview}"

🔧 *Opciones disponibles:*
• \`.delclaimmsg\` - Restablecer a mensaje navideño predeterminado
• \`.delclaimmsg off\` - Desactivar mensaje personalizado
• \`.delclaimmsg <nuevo mensaje>\` - Cambiar mensaje (alternativa)

🎄 *¡Felices decoraciones!*`;
    
    await m.reply(confirmMsg);
};

handler.help = ['setclaimmsg', 'personalizarclaim', 'miclaim'];
handler.tags = ['gacha', 'navidad'];
handler.command = ['setclaimmsg', 'personalizarclaim', 'miclaim'];
handler.group = true;
handler.private = true;

// Información del comando
handler.description = 'Personalizar el mensaje que aparece al reclamar adornos';
handler.usage = '<mensaje con {user} y {character}>';
handler.example = '.setclaimmsg 🎄 {user} recibió a {character} como regalo navideño';
handler.note = 'Las variables {user} y {character} son obligatorias. Límite: 200 caracteres.';

export default handler;