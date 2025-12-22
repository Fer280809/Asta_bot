// ============================================
// plugins/gacha-givechar.js - VERSIÓN CORREGIDA
// ELIMINA gachaCoins, agrega confirmación y mejora seguridad
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!m.mentionedJid || m.mentionedJid.length === 0 || !text) {
        return m.reply('🎅 *¡Ho Ho Ho!* Formato incorrecto.\n\n❄️ *Uso:* `.givechar @usuario <nombre del adorno>`\n✨ *Ejemplo:* `.givechar @amigo Yui`');
    }
    
    const giverId = m.sender;
    const receiverId = m.mentionedJid[0];
    
    if (giverId === receiverId) {
        return m.reply('🎄 *¡No puedes regalarte adornos a ti mismo!*\n\n¡Ya están decorando tu propio árbol!');
    }
    
    // Extraer nombre del adorno (eliminar menciones)
    const charName = text.replace(/@\d+/g, '').trim();
    
    if (!charName) {
        return m.reply('🎁 *¡Debes especificar el nombre del Adorno Navideño!*\n\nUsa `.harem` para ver tus adornos disponibles.');
    }
    
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    // Cargar usuarios festivos
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    // Verificar que el donador existe y tiene adornos
    if (!users[giverId] || !users[giverId].harem || users[giverId].harem.length === 0) {
        return m.reply('🎄 *¡Tu caja de adornos está vacía!*\n\nNo tienes qué regalar.\n✨ Usa `.roll` para obtener adornos nuevos.');
    }
    
    // Buscar el adorno (búsqueda flexible)
    const charIndex = users[giverId].harem.findIndex(c => 
        c.name.toLowerCase().includes(charName.toLowerCase())
    );
    
    if (charIndex === -1) {
        // Sugerir adornos similares
        const suggestions = users[giverId].harem
            .filter(c => c.name.toLowerCase().includes(charName.toLowerCase().substring(0, 3)))
            .slice(0, 5)
            .map(c => `• ${c.name}`)
            .join('\n');
        
        let reply = `🎁 *¡No tienes un adorno llamado "${charName}"!*\n\n`;
        if (suggestions) {
            reply += `🦌 *¿Quizás quisiste decir?*\n${suggestions}`;
        } else {
            reply += `Usa \`.harem\` para ver todos tus adornos.`;
        }
        return m.reply(reply);
    }
    
    const char = users[giverId].harem[charIndex];
    
    // Verificar si el adorno está en venta
    if (char.forSale) {
        return m.reply(`🛍️ *¡${char.name} está en tu tienda!*\n\n💎 Precio: ${char.salePrice} coins\n🎁 Quita de venta primero con \`.delsale ${char.name}\``);
    }
    
    // Inicializar receptor en SISTEMA GACHA si no existe
    if (!users[receiverId]) {
        users[receiverId] = {
            harem: [],
            favorites: [],
            claimMessage: '✨ *¡Feliz Navidad!* {user} ha añadido a {character} a su *Colección de Adornos Festivos*. ¡Qué gran regalo!',
            lastRoll: 0,
            votes: {}
            // ¡SE ELIMINÓ gachaCoins: 1000! 🎯
        };
    }
    
    // Verificar si el receptor ya tiene el adorno
    const alreadyHas = users[receiverId].harem.find(c => c.id === char.id);
    if (alreadyHas) {
        return m.reply(`⚠️ *¡${char.name} ya está en el árbol del receptor!*\n\nNo puedes regalar adornos duplicados.`);
    }
    
    // ============================================
    // CONFIRMACIÓN DE REGALO (seguridad)
    // ============================================
    
    const giverName = await conn.getName(giverId);
    const receiverName = await conn.getName(receiverId);
    
    const confirmationMsg = 
`🎅 *¿REGALAR ADORNO NAVIDEÑO?*

🎁 *Adorno:* ${char.name}
💎 *Valor:* ${char.value || 100}
🎬 *Origen:* ${char.source || 'Desconocido'}

👤 *Donador:* ${giverName} (Tú)
👤 *Receptor:* ${receiverName}

⚠️ *¡Esta acción no se puede deshacer!*
Perderás permanentemente este adorno.

✅ *Para confirmar, responde:*
\`\`\`
SI REGALO ${char.name}
\`\`\`

❌ *Para cancelar:* Ignora este mensaje`;

    await m.reply(confirmationMsg);
    
    // Esperar confirmación
    try {
        const filter = (msg) => msg.sender === giverId && msg.chat === m.chat;
        const collected = await conn.awaitMessages(m.chat, filter, {
            max: 1,
            time: 30000,
            errors: ['time']
        });
        
        const response = collected[0].text;
        
        if (response !== `SI REGALO ${char.name}`) {
            return m.reply('❌ *Regalo cancelado.*\n\nLa confirmación no coincide.');
        }
        
        // ============================================
        // REALIZAR TRANSFERENCIA
        // ============================================
        
        // 1. Transferir adorno
        const transferredChar = { 
            ...char, 
            claimedAt: Date.now(), 
            transferredAt: Date.now(),
            transferredFrom: giverId,
            forSale: false, 
            salePrice: 0 
        };
        
        users[receiverId].harem.push(transferredChar);
        users[giverId].harem.splice(charIndex, 1);
        
        // 2. Eliminar de favoritos si está
        if (users[giverId].favorites) {
            users[giverId].favorites = users[giverId].favorites.filter(id => id !== char.id);
        }
        
        // 3. Guardar cambios
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
        
        // 4. Mensaje de éxito
        const successMsg = 
`✅ *¡REGALO NAVIDEÑO ENVIADO!*

🎁 *${giverName}* regaló a *${char.name}*
✨ *Para:* ${receiverName}
💎 *Valor del regalo:* ${char.value || 100}
🎄 *Adornos restantes:* ${users[giverId].harem.length}

🎅 *¡Que el espíritu navideño los acompañe!*`;
        
        await m.reply(successMsg);
        
        // 5. Notificar al receptor
        try {
            await conn.sendMessage(receiverId, {
                text: `🎁 *¡HAS RECIBIDO UN REGALO NAVIDEÑO!*\n\n*${giverName}* te regaló el adorno *${char.name}*\n\n✨ *Ahora tienes:* ${users[receiverId].harem.length} adornos\n🎄 *¡Felices fiestas!*`
            });
        } catch (notifyError) {
            console.log('No se pudo notificar al receptor:', notifyError.message);
        }
        
    } catch (error) {
        return m.reply('⏰ *Tiempo agotado.* El regalo ha sido cancelado.');
    }
};

handler.help = ['givechar', 'regalaradorno', 'donar'];
handler.tags = ['gacha', 'navidad'];
handler.command = ['givechar', 'regalaradorno', 'donar'];
handler.group = true;

// Información adicional
handler.description = 'Regalar un adorno navideño a otro usuario';
handler.usage = '@usuario <nombre del adorno>';
handler.example = '.givechar @amigo Yui';
handler.note = 'Requiere confirmación. No se puede regalar adornos en venta.';

export default handler;