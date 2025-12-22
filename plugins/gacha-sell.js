// ============================================
// plugins/gacha-sell.js - VERSIÓN CON TEXTO MÁS CLARO
// Solo cambia "Monedas de Jengibre" por "coins" para consistencia
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    const args = text.split(',').map(arg => arg.trim());
    
    if (args.length < 2) {
        return m.reply('🎅 *¡Formato incorrecto!*\n\n❄️ *Uso:* `.sell <precio>, <nombre del adorno>`\n✨ *Ejemplo:* `.sell 500, Yui`');
    }
    
    const price = parseInt(args[0]);
    const charName = args.slice(1).join(',').trim();
    
    if (isNaN(price) || price <= 0) {
        return m.reply('💰 *¡Precio inválido!*\n\nEl precio debe ser un número mayor a 0.\nEjemplo: `.sell 500, NombreAdorno`');
    }
    
    // Límite de precio razonable
    if (price > 100000) {
        return m.reply('🎄 *¡Precio muy alto!*\n\nEl precio máximo permitido es 100,000 coins.');
    }
    
    const userId = m.sender;
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    // Cargar usuarios festivos
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    // Verificar que el usuario existe y tiene adornos
    if (!users[userId] || !users[userId].harem || users[userId].harem.length === 0) {
        return m.reply('🎁 *¡No tienes adornos para vender!*\n\nUsa `.roll` para obtener adornos primero.');
    }
    
    // Buscar adorno (búsqueda flexible)
    const charIndex = users[userId].harem.findIndex(c => 
        c.name.toLowerCase().includes(charName.toLowerCase())
    );
    
    if (charIndex === -1) {
        // Sugerir adornos similares
        const suggestions = users[userId].harem
            .filter(c => c.name.toLowerCase().includes(charName.toLowerCase().substring(0, 3)))
            .slice(0, 5)
            .map(c => `• ${c.name}`)
            .join('\n');
        
        let reply = `🎄 *¡No tienes un adorno llamado "${charName}"!*\n\n`;
        if (suggestions) {
            reply += `🦌 *¿Quizás quisiste decir?*\n${suggestions}\n\n`;
        }
        reply += `Usa \`.harem\` para ver todos tus adornos.`;
        return m.reply(reply);
    }
    
    const char = users[userId].harem[charIndex];
    
    // Verificar que no esté ya en venta
    if (char.forSale) {
        return m.reply(`🛍️ *¡${char.name} ya está en venta!*\n\n💎 Precio actual: ${char.salePrice} coins\n🎁 Para cambiar precio: \`.sell ${char.salePrice + 100}, ${char.name}\``);
    }
    
    // Verificar valor mínimo (al menos 10% del valor del adorno)
    const charValue = parseInt(char.value) || 100;
    const minPrice = Math.floor(charValue * 0.1);
    
    if (price < minPrice) {
        return m.reply(`💰 *¡Precio muy bajo!*\n\nEl adorno *${char.name}* vale ${charValue}.\n💡 Precio mínimo sugerido: ${minPrice} coins`);
    }
    
    // Marcar adorno en venta
    users[userId].harem[charIndex].forSale = true;
    users[userId].harem[charIndex].salePrice = price;
    
    // Guardar cambios
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    // Mensaje de éxito
    const successMsg = 
`✅ *¡ADORNO PUESTO EN VENTA!*

🎁 *Adorno:* ${char.name}
💰 *Precio:* ${price} coins
💎 *Valor base:* ${charValue}
🎬 *Origen:* ${char.source || 'Desconocido'}

📊 *Total en venta:* ${users[userId].harem.filter(c => c.forSale).length} adornos
🛍️ *Ver en tienda:* \`.tienda\`

💡 *Para quitar de venta:* \`.removesale ${char.name}\``;
    
    await m.reply(successMsg);
};

handler.help = ['sell', 'vender', 'ponerenventa'];
handler.tags = ['gacha', 'navidad'];
handler.command = ['sell', 'vender', 'ponerenventa'];
handler.group = true;

export default handler;