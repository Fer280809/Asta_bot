// ============================================
// plugins/gacha-delclaimmsg.js - VERSIÓN MEJORADA
// Ahora SÍ permite eliminar o cambiar el mensaje de claim
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    const userId = m.sender;
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    // Cargar usuarios festivos
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    if (!users[userId]) {
        return m.reply('🎅 *¡Santa no tiene registro de tu perfil navideño!*\n\n🎄 Usa *.roll* primero para crear tu perfil festivo.');
    }
    
    // OPCIÓN 1: Sin texto = Restablecer a mensaje navideño predeterminado
    if (!text) {
        const defaultMsg = '✨ *¡Feliz Navidad!* {user} ha añadido a {character} a su *Colección de Adornos Festivos*. ¡Qué gran regalo!';
        users[userId].claimMessage = defaultMsg;
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
        
        return m.reply(`✅ *Mensaje de Reclamo Restablecido*\n\n🎁 Ahora usarás el mensaje navideño predeterminado:\n_"${defaultMsg}"_`);
    }
    
    // OPCIÓN 2: Con texto "off" = Desactivar mensaje personalizado
    if (text.toLowerCase() === 'off') {
        users[userId].claimMessage = null;
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
        
        return m.reply('🔇 *Mensaje de Reclamo Desactivado*\n\n❄️ Ahora no se mostrará mensaje especial al reclamar adornos.');
    }
    
    // OPCIÓN 3: Con texto = Establecer nuevo mensaje personalizado
    // Verificar que el mensaje tenga los placeholders {user} y {character}
    if (!text.includes('{user}') || !text.includes('{character}')) {
        return m.reply('🎄 *¡Formato incorrecto!*\n\nTu mensaje personalizado DEBE incluir:\n• *{user}* (será reemplazado por tu nombre)\n• *{character}* (será reemplazado por el nombre del adorno)\n\n📝 Ejemplo:\n`.setclaimmsg ¡{user} recibió a {character} en Navidad!`');
    }
    
    // Limitar longitud del mensaje
    if (text.length > 200) {
        return m.reply('📜 *¡Mensaje muy largo!*\n\n🎅 Santa recomienda mensajes más cortos (máximo 200 caracteres).');
    }
    
    users[userId].claimMessage = text;
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    // Mostrar cómo quedará el mensaje
    const preview = text
        .replace('{user}', 'Tú')
        .replace('{character}', 'Adorno Especial');
    
    await m.reply(`✅ *¡Mensaje Personalizado Guardado!*\n\n🎁 *Vista previa:*\n"${preview}"\n\n💡 *Usos disponibles:*\n• \`.delclaimmsg\` - Restablecer a predeterminado\n• \`.delclaimmsg off\` - Desactivar mensaje\n• \`.delclaimmsg <tu mensaje>\` - Personalizar`);
};

handler.help = ['delclaimmsg', 'setclaimmsg', 'claimmsg'];
handler.tags = ['gacha', 'config'];
handler.command = ['delclaimmsg', 'setclaimmsg', 'claimmsg'];
handler.group = true;

// Información adicional
handler.description = 'Gestiona tu mensaje personalizado al reclamar adornos navideños';
handler.usage = '[off | <mensaje con {user} y {character}>]';
handler.example = [
    '.delclaimmsg',
    '.delclaimmsg off',
    '.delclaimmsg 🎄 {user} decoró su árbol con {character} ¡Feliz Navidad!'
];

export default handler;