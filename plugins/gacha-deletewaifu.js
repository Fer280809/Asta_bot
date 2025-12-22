// ============================================
// plugins/gacha-deletewaifu.js - VERSIÓN MEJORADA
// Ahora ofrece VENDER en lugar de ELIMINAR gratuitamente
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply('🎅 *¡Ho Ho Ho!* ¿Qué Adorno Navideño quieres gestionar?\n\n❄️ *Usos:*\n• `.delwaifu <nombre>` - Vender adorno\n• `.delwaifu list` - Ver adornos vendibles\n• `.delwaifu confirm <nombre>` - Confirmar venta');
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
        return m.reply('🎄 *¡Tu árbol está vacío!*\n\n🦌 No tienes Adornos Navideños para gestionar.\n✨ Usa `.roll` para obtener adornos nuevos.');
    }
    
    // OPCIÓN 1: Listar adornos que se pueden vender
    if (text.toLowerCase() === 'list') {
        const salableChars = users[userId].harem
            .filter(c => !c.forSale) // Solo los que NO están ya en venta
            .slice(0, 10); // Máximo 10 para no saturar
        
        if (salableChars.length === 0) {
            return m.reply('🛍️ *Todos tus adornos ya están en venta!*\n\nUsa `.tienda` para ver tu tienda personal.');
        }
        
        let listMsg = '🎁 *ADORNOS QUE PUEDES VENDER:*\n\n';
        salableChars.forEach((char, index) => {
            const value = parseInt(char.value) || 100;
            const salePrice = Math.floor(value * 0.7); // 70% del valor
            listMsg += `${index + 1}. *${char.name}*\n   💎 Valor: ${value} | 🪙 Venta: ${salePrice} coins\n   🎬 Origen: ${char.source || 'Desconocido'}\n\n`;
        });
        
        if (users[userId].harem.length > 10) {
            listMsg += `... y ${users[userId].harem.length - 10} adornos más\n`;
        }
        
        listMsg += '\n💡 *Usa:* `.delwaifu <nombre>` para vender un adorno';
        return m.reply(listMsg);
    }
    
    // OPCIÓN 2: Confirmar venta (protección contra eliminación accidental)
    if (text.toLowerCase().startsWith('confirm ')) {
        const charName = text.substring(8).trim();
        const charIndex = users[userId].harem.findIndex(c => 
            c.name.toLowerCase().includes(charName.toLowerCase())
        );
        
        if (charIndex === -1) {
            return m.reply('🎄 *¡Ese adorno no está en tu árbol!*\n\nVerifica el nombre con `.delwaifu list`');
        }
        
        const char = users[userId].harem[charIndex];
        const value = parseInt(char.value) || 100;
        const salePrice = Math.floor(value * 0.7); // 70% del valor como reembolso
        
        // ELIMINAR y dar reembolso en MONEDA REAL
        users[userId].harem.splice(charIndex, 1);
        
        // Eliminar de favoritos si está
        if (users[userId].favorites) {
            users[userId].favorites = users[userId].favorites.filter(id => id !== char.id);
        }
        
        // Guardar cambios en gacha
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
        
        // Dar reembolso en ECONOMÍA PRINCIPAL
        let refundMsg = '';
        if (global.db.data.users[userId]) {
            global.db.data.users[userId].coin = (global.db.data.users[userId].coin || 0) + salePrice;
            refundMsg = `\n💰 *Reembolso:* +${salePrice} Monedas de Chocolate`;
        }
        
        return m.reply(`✅ *¡Adorno Vendido al Taller de Santa!*\n\n🎁 *${char.name}* ha sido descolgado de tu árbol.\n✨ *Valor recuperado:* ${salePrice} coins${refundMsg}\n\n🎄 _Santa guardará este adorno para otro niño..._`);
    }
    
    // OPCIÓN 3: Iniciar proceso de venta (nombre del adorno)
    const charIndex = users[userId].harem.findIndex(c => 
        c.name.toLowerCase().includes(text.toLowerCase())
    );
    
    if (charIndex === -1) {
        return m.reply('❄️ *¡Ese Adorno Navideño no está colgado en tu árbol!*\n\n🎄 Usa `.delwaifu list` para ver tus adornos disponibles.');
    }
    
    const char = users[userId].harem[charIndex];
    const charName = char.name;
    const value = parseInt(char.value) || 100;
    const salePrice = Math.floor(value * 0.7); // 70% del valor
    
    // Verificar que no esté ya en venta
    if (char.forSale) {
        return m.reply(`🛍️ *¡${charName} ya está en tu tienda!*\n\n💎 Precio actual: ${char.salePrice} coins\n🎁 Usa \`.delsale ${charName}\` para quitar de venta.`);
    }
    
    // Mostrar confirmación de venta (protección)
    const confirmationMsg = `🎅 *¿VENDER ADORNO NAVIDEÑO?*\n\n` +
                          `🎁 *Adorno:* ${charName}\n` +
                          `💎 *Valor original:* ${value}\n` +
                          `💰 *Reembolso:* ${salePrice} Monedas de Chocolate\n` +
                          `🎬 *Origen:* ${char.source || 'Desconocido'}\n\n` +
                          `⚠️ *¡Esta acción NO se puede deshacer!*\n` +
                          `El adorno será eliminado permanentemente de tu colección.\n\n` +
                          `✅ *Para confirmar:*\n\`.delwaifu confirm ${charName}\`\n\n` +
                          `❌ *Para cancelar:* Ignora este mensaje`;
    
    await m.reply(confirmationMsg);
};

handler.help = ['deletewaifu', 'delwaifu', 'delchar', 'venderadorno'];
handler.tags = ['gacha', 'economy'];
handler.command = ['deletewaifu', 'delwaifu', 'delchar', 'venderadorno'];
handler.group = true;

// Información adicional
handler.description = 'Vender adornos navideños al taller de Santa por coins';
handler.usage = '[list | confirm <nombre> | <nombre del adorno>]';
handler.example = [
    '.delwaifu list',
    '.delwaifu Yui',
    '.delwaifu confirm Yui'
];

export default handler;