// ============================================
// plugins/gacha-removesale.js - VERSIÓN MEJORADA (OPCIONAL)
// Agrega listado y confirmación
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
    
    // Verificar que el usuario existe y tiene adornos
    if (!users[userId] || !users[userId].harem || users[userId].harem.length === 0) {
        return m.reply('🎄 *¡Tu árbol está vacío!*\n\nNo tienes adornos para gestionar.');
    }
    
    // OPCIÓN 1: Listar adornos en venta
    if (!text || text.toLowerCase() === 'list') {
        const forSaleChars = users[userId].harem.filter(c => c.forSale);
        
        if (forSaleChars.length === 0) {
            return m.reply('🛍️ *No tienes adornos en venta.*\n\nUsa `.sell <nombre> <precio>` para poner adornos en tu tienda.');
        }
        
        let listMsg = '🎁 *TUS ADORNOS EN VENTA:*\n\n';
        forSaleChars.forEach((char, index) => {
            listMsg += `${index + 1}. *${char.name}*\n`;
            listMsg += `   💰 Precio: ${char.salePrice} coins\n`;
            listMsg += `   💎 Valor: ${char.value || 100}\n`;
            listMsg += `   🎬 Origen: ${char.source || 'Desconocido'}\n\n`;
        });
        
        listMsg += '💡 *Para quitar de venta:* `.removesale <nombre>`';
        return m.reply(listMsg);
    }
    
    // OPCIÓN 2: Quitar adorno específico de venta
    const charIndex = users[userId].harem.findIndex(c => 
        c.name.toLowerCase().includes(text.toLowerCase()) && c.forSale
    );
    
    if (charIndex === -1) {
        // Buscar sugerencias
        const similarChars = users[userId].harem
            .filter(c => c.forSale && c.name.toLowerCase().includes(text.toLowerCase().substring(0, 3)))
            .slice(0, 5)
            .map(c => `• ${c.name} (${c.salePrice} coins)`)
            .join('\n');
        
        let reply = `🎄 *No tienes un adorno llamado "${text}" en venta.*\n\n`;
        if (similarChars) {
            reply += `🦌 *¿Quizás quisiste decir?*\n${similarChars}\n\n`;
        }
        reply += `Usa \`.removesale list\` para ver todos tus adornos en venta.`;
        return m.reply(reply);
    }
    
    const char = users[userId].harem[charIndex];
    
    // CONFIRMACIÓN (opcional, para evitar errores)
    if (char.salePrice > 1000) { // Solo confirmar para ventas caras
        const confirmMsg = 
`🎅 *¿QUITAR ADORNO CARO DE LA VENTA?*

🎁 *Adorno:* ${char.name}
💰 *Precio actual:* ${char.salePrice} coins
💎 *Valor:* ${char.value || 100}

⚠️ *¿Estás seguro de quitar este adorno de tu tienda?*

✅ *Para confirmar, responde:* \`SI QUITAR ${char.name}\`

❌ *Para cancelar:* Ignora este mensaje`;

        await m.reply(confirmMsg);
        
        try {
            const filter = (msg) => msg.sender === userId && msg.chat === m.chat;
            const collected = await conn.awaitMessages(m.chat, filter, {
                max: 1,
                time: 20000,
                errors: ['time']
            });
            
            const response = collected[0].text;
            if (response !== `SI QUITAR ${char.name}`) {
                return m.reply('❌ *Operación cancelada.* El adorno sigue en venta.');
            }
        } catch (error) {
            return m.reply('⏰ *Tiempo agotado.* El adorno sigue en venta.');
        }
    }
    
    // Quitar de venta
    users[userId].harem[charIndex].forSale = false;
    users[userId].harem[charIndex].salePrice = 0;
    
    // Guardar cambios
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    // Mensaje de éxito
    const successMsg = 
`✅ *¡ADORNO RETIRADO DE LA VENTA!*

🎁 *${char.name}* ha sido quitado de tu tienda.
✨ *Ahora está seguro en tu colección personal.*

📊 *Adornos restantes en venta:* ${users[userId].harem.filter(c => c.forSale).length}
💡 Usa \`.sell\` si quieres volver a ponerlo en venta.`;
    
    await m.reply(successMsg);
};

handler.help = ['removesale', 'quitardeventa', 'delsale'];
handler.tags = ['gacha', 'navidad'];
handler.command = ['removesale', 'quitardeventa', 'delsale'];
handler.group = true;
handler.private = true;

export default handler;