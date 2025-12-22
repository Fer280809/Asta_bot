// ============================================
// plugins/gacha-giveallharem.js - VERSIÓN SEGURA
// Ahora es una "VENTA MASIVA" con compensación justa
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!m.mentionedJid || m.mentionedJid.length === 0) {
        return m.reply('🎅 *¡Ho Ho Ho!* Debes mencionar al ayudante que recibirá tu colección.\n\n❄️ *Uso:* .giveallharem @usuario');
    }
    
    const giverId = m.sender;
    const receiverId = m.mentionedJid[0];
    
    if (giverId === receiverId) {
        return m.reply('🎄 *No puedes regalarte tu propia colección navideña!*\n\n¡Ya la tienes en tu árbol!');
    }
    
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    // Cargar usuarios festivos
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    // Verificar que el donador existe y tiene adornos
    if (!users[giverId] || !users[giverId].harem || users[giverId].harem.length === 0) {
        return m.reply('🎁 *¡Tu árbol está vacío!*\n\nNo tienes Adornos Navideños para transferir.\n✨ Usa `.roll` para obtener adornos primero.');
    }
    
    const totalAdornos = users[giverId].harem.length;
    const totalValue = users[giverId].harem.reduce((sum, char) => sum + (parseInt(char.value) || 100), 0);
    const saleValue = Math.floor(totalValue * 0.5); // 50% del valor total
    
    // Verificar que el receptor existe en la ECONOMÍA PRINCIPAL
    if (!global.db.data.users[receiverId]) {
        return m.reply('🦌 *El receptor no está en la Lista de Santa!*\n\nEl ayudante mencionado debe usar el bot al menos una vez primero.');
    }
    
    // Verificar que el receptor tenga suficientes coins
    const receiverCoins = global.db.data.users[receiverId].coin || 0;
    if (receiverCoins < saleValue) {
        return m.reply(`💰 *¡El receptor no tiene suficientes monedas!*\n\n• Valor total: ${saleValue} Monedas de Chocolate\n• Monedas del receptor: ${receiverCoins}\n\n🎄 Necesita ${saleValue - receiverCoins} monedas más.`);
    }
    
    // MENSAJE DE CONFIRMACION MEJORADO
    const confirmationMsg = 
`🎅 *¿TRANSFERIR COLECCIÓN NAVIDEÑA COMPLETA?*

🎁 *Donador:* Tú
👤 *Receptor:* @${receiverId.split('@')[0]}
🎄 *Adornos a transferir:* ${totalAdornos} adornos
💎 *Valor total colección:* ${totalValue}
💰 *Precio de venta:* ${saleValue} Monedas de Chocolate

⚠️ *¡ESTA ACCIÓN ES PERMANENTE!*
• Perderás TODOS tus adornos
• El receptor pagará ${saleValue} coins
• No se puede deshacer

✅ *Para confirmar, responde exactamente:*
\`\`\`
CONFIRMAR VENTA ${totalAdornos} ADORNOS
\`\`\`

❌ *Para cancelar:* Ignora este mensaje`;

    await m.reply(confirmationMsg);
    
    // Colector de respuesta simplificado
    try {
        const filter = (msg) => msg.sender === giverId && msg.chat === m.chat;
        const collected = await conn.awaitMessages(m.chat, filter, {
            max: 1,
            time: 45000, // 45 segundos
            errors: ['time']
        });
        
        const response = collected[0].text;
        
        if (response !== `CONFIRMAR VENTA ${totalAdornos} ADORNOS`) {
            return m.reply('❌ *Transferencia cancelada.*\n\nLa frase de confirmación no coincide.');
        }
        
        // ============================================
        // REALIZAR TRANSACCIÓN SEGURA
        // ============================================
        
        // 1. Inicializar receptor en SISTEMA GACHA si no existe
        if (!users[receiverId]) {
            users[receiverId] = {
                harem: [],
                favorites: [],
                claimMessage: '✨ *¡Feliz Navidad!* {user} ha añadido a {character} a su *Colección de Adornos Festivos*. ¡Qué gran regalo!',
                lastRoll: 0,
                votes: {}
                // ¡NO HAY gachaCoins!
            };
        }
        
        // 2. Calcular adornos únicos a transferir (evitar duplicados)
        const uniqueChars = [];
        const duplicateChars = [];
        
        users[giverId].harem.forEach(char => {
            const alreadyHas = users[receiverId].harem.find(c => c.id === char.id);
            if (alreadyHas) {
                duplicateChars.push(char.name);
            } else {
                uniqueChars.push({
                    ...char,
                    transferredAt: Date.now(),
                    transferredFrom: giverId,
                    forSale: false,
                    salePrice: 0
                });
            }
        });
        
        // 3. Transferir adornos únicos
        users[receiverId].harem.push(...uniqueChars);
        
        // 4. Vaciar colección del donador
        users[giverId].harem = [];
        users[giverId].favorites = [];
        
        // 5. REALIZAR TRANSACCIÓN MONETARIA (ECONOMÍA PRINCIPAL)
        // Receptor paga al donador
        global.db.data.users[receiverId].coin -= saleValue;
        global.db.data.users[giverId].coin = (global.db.data.users[giverId].coin || 0) + saleValue;
        
        // 6. Guardar cambios en gacha
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
        
        // 7. Obtener nombres
        const giverName = await conn.getName(giverId);
        const receiverName = await conn.getName(receiverId);
        
        // 8. Mensaje de éxito
        let successMsg = `✅ *¡TRANSFERENCIA NAVIDEÑA EXITOSA!*\n\n`;
        successMsg += `🎁 *${giverName}* vendió su colección a *${receiverName}*\n`;
        successMsg += `🎄 *Adornos transferidos:* ${uniqueChars.length}/${totalAdornos}\n`;
        successMsg += `💰 *Precio:* ${saleValue} Monedas de Chocolate\n`;
        successMsg += `👑 *Nueva colección de ${receiverName}:* ${users[receiverId].harem.length} adornos\n`;
        
        if (duplicateChars.length > 0) {
            successMsg += `\n⚠️ *Nota:* ${duplicateChars.length} adornos no se transfirieron (el receptor ya los tenía)`;
        }
        
        successMsg += `\n\n🎅 *¡Que disfruten su nueva colección!*`;
        
        await m.reply(successMsg);
        
        // 9. Notificar al receptor
        try {
            await conn.sendMessage(receiverId, {
                text: `🎁 *¡HAS ADQUIRIDO UNA COLECCIÓN NAVIDEÑA!*\n\n*${giverName}* te vendió ${uniqueChars.length} adornos únicos por ${saleValue} Monedas.\n\n🎄 *Tu colección ahora tiene:* ${users[receiverId].harem.length} adornos\n💰 *Tu saldo ahora:* ${global.db.data.users[receiverId].coin} coins`
            });
        } catch (notifyError) {
            console.log('No se pudo notificar al receptor:', notifyError.message);
        }
        
    } catch (error) {
        return m.reply('⏰ *Tiempo agotado.* La transferencia ha sido cancelada.');
    }
};

handler.help = ['giveallharem', 'vendercoleccion', 'transferharem'];
handler.tags = ['gacha', 'navidad', 'economy'];
handler.command = ['giveallharem', 'vendercoleccion', 'transferharem'];
handler.group = true;

// Información de seguridad
handler.description = 'Vende toda tu colección de adornos a otro usuario por coins';
handler.usage = '@usuario';
handler.example = '.giveallharem @amigo';
handler.note = 'Requiere confirmación explícita. El receptor paga el 50% del valor total.';

export default handler;