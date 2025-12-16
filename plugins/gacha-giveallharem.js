// ============================================
// plugins/gacha-giveallharem.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!m.mentionedJid || m.mentionedJid.length === 0) {
        return m.reply('❌ *Uso correcto:* /giveallharem @AyudanteDestino');
    }
    
    const giverId = m.sender;
    const receiverId = m.mentionedJid[0];
    
    if (giverId === receiverId) {
        return m.reply('❌ *No puedes regalarte tu propia Colección Navideña.* ¡Ya la tienes!');
    }
    
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    if (!users[giverId] || !users[giverId].harem || users[giverId].harem.length === 0) {
        return m.reply('❌ *Tu árbol está vacío.* No tienes Adornos Navideños para donar.');
    }
    
    const totalAdornos = users[giverId].harem.length;
    
    // Confirmar acción
    const confirmMsg = await m.reply(`⚠️ *¡ALERTA FESTIVA!* ¿Estás seguro de donar *TODOS* tus ${totalAdornos} Adornos Navideños (harem)?\n\nResponde con *SI* para confirmar la GRAN DONACIÓN o *NO* para cancelar.\n\n⏰ Tienes 30 segundos.`);
    
    // Esperar respuesta
    const collector = conn.awaitMessages(m.chat, x => x.sender === m.sender, {
        max: 1,
        time: 30000
    });
    
    collector.then(collected => {
        const response = collected[0];
        if (!response || response.text.toLowerCase() !== 'si') {
            return m.reply('❌ *Operación de Donación cancelada.* ¡Qué susto!');
        }
        
        // Inicializar receptor si no existe
        if (!users[receiverId]) {
            users[receiverId] = {
                harem: [],
                favorites: [],
                // Usar el mensaje navideño predeterminado
                claimMessage: '✨ *¡Feliz Navidad!* {user} ha añadido a {character} a su *Colección de Adornos Festivos* (Harem). ¡Qué gran regalo!', 
                lastRoll: 0,
                votes: {},
                gachaCoins: 1000
            };
        }
        
        const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        
        // Transferir todos los personajes (evitar duplicados)
        users[giverId].harem.forEach(char => {
            const alreadyHas = users[receiverId].harem.find(c => c.id === char.id);
            if (!alreadyHas) {
                users[receiverId].harem.push({ ...char, claimedAt: Date.now(), forSale: false, salePrice: 0 });
                
                // Actualizar en DB principal
                const dbCharIndex = characters.findIndex(c => c.id === char.id);
                if (dbCharIndex !== -1) {
                    characters[dbCharIndex].user = receiverId;
                }
            }
        });
        
        // Vaciar harem del donador
        users[giverId].harem = [];
        users[giverId].favorites = [];
        
        fs.writeFileSync(dbPath, JSON.stringify(characters, null, 2), 'utf-8');
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
        
        conn.getName(giverId).then(giverName => {
            conn.getName(receiverId).then(receiverName => {
                m.reply(`✅ *¡Donación de Espíritu Navideño Exitosa!* *${giverName}* le ha regalado su Colección completa (${totalAdornos} Adornos) a *${receiverName}*! 🎁`);
                
                // Notificar al receptor
                conn.sendMessage(receiverId, { 
                    text: `🎁 *¡Mega Regalo de Navidad recibido!*\n\n*${giverName}* te ha donado su Colección de ${totalAdornos} Adornos Navideños. ¡Que tengas un Feliz Árbol!` 
                });
            });
        });
    }).catch(() => {
        m.reply('❌ *Tiempo agotado. La Gran Donación ha sido cancelada.*');
    });
};

handler.help = ['giveallharem'];
handler.tags = ['gacha'];
handler.command = ['giveallharem'];
handler.group = true;

export default handler;
