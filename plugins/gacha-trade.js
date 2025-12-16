// ============================================
// plugins/gacha-trade.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!text || !text.includes('/')) {
        return m.reply('❌ *Uso correcto (Intercambio de Adornos):* /trade <Tu Adorno> / <Adorno del otro>\n\n*Ejemplo:* /trade Rodolfo / Miku\n\n*Nota:* Cita el mensaje del Ayudante (usuario) con quien quieres intercambiar.');
    }
    
    if (!m.quoted) {
        return m.reply('❌ *Debes citar el mensaje del usuario con quien quieres intercambiar Adornos.*');
    }
    
    const user1 = m.sender;
    const user2 = m.quoted.sender;
    
    if (user1 === user2) {
        return m.reply('❌ *¡No puedes intercambiar Adornos contigo mismo!*');
    }
    
    const [char1Name, char2Name] = text.split('/').map(s => s.trim());
    
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    if (!users[user1] || !users[user1].harem || users[user1].harem.length === 0) {
        return m.reply('❌ *Tu Colección de Adornos está vacía. No tienes nada que intercambiar.*');
    }
    
    if (!users[user2] || !users[user2].harem || users[user2].harem.length === 0) {
        return m.reply('❌ *El otro Ayudante no tiene Adornos en su Colección.*');
    }
    
    // Buscar personajes
    const char1Index = users[user1].harem.findIndex(c => 
        c.name.toLowerCase().includes(char1Name.toLowerCase())
    );
    
    const char2Index = users[user2].harem.findIndex(c => 
        c.name.toLowerCase().includes(char2Name.toLowerCase())
    );
    
    if (char1Index === -1) {
        return m.reply(`❌ *No tienes el Adorno Navideño "${char1Name}"*`);
    }
    
    if (char2Index === -1) {
        return m.reply(`❌ *El otro Ayudante no tiene el Adorno Navideño "${char2Name}"*`);
    }
    
    const char1 = users[user1].harem[char1Index];
    const char2 = users[user2].harem[char2Index];
    
    // Guardar solicitud de intercambio (Lógica intacta)
    global.tradeRequests = global.tradeRequests || {};
    const tradeId = `${user1}_${user2}_${Date.now()}`;
    
    global.tradeRequests[tradeId] = {
        user1,
        user2,
        char1,
        char2,
        char1Index,
        char2Index,
        timestamp: Date.now(),
        expires: Date.now() + 300000 // 5 minutos
    };
    
    const user1Name = await conn.getName(user1);
    const user2Name = await conn.getName(user2);
    
    const tradeMsg = `
╭━━━━━━━━━━━━━━━━╮
│  🎄 *SOLICITUD DE INTERCAMBIO FESTIVO* 🎁
╰━━━━━━━━━━━━━━━━╯

*${user1Name}* quiere intercambiar el Adorno:
┌─⊷ *${char1.name}*
│ 📺 Origen: ${char1.source}
│ 💎 Rareza: ${char1.value}
└───────────────

Por el Adorno de *${user2Name}*:
┌─⊷ *${char2.name}*
│ 📺 Origen: ${char2.source}
│ 💎 Rareza: ${char2.value}
└───────────────

*@${user2.split('@')[0]}* responde con:
✅ */accepttrade* para aceptar el intercambio de regalos
❌ */rejecttrade* para rechazar la oferta

⏰ *La oferta de intercambio expira en 5 minutos*`;

    await conn.sendMessage(m.chat, { text: tradeMsg, mentions: [user2] }, { quoted: m });
    
    // Limpiar después de 5 minutos (Lógica intacta)
    setTimeout(() => {
        if (global.tradeRequests && global.tradeRequests[tradeId]) {
            delete global.tradeRequests[tradeId];
        }
    }, 300000);
};

handler.help = ['trade', 'intercambiar'];
handler.tags = ['gacha'];
handler.command = ['trade', 'intercambiar'];
handler.group = true;

export default handler;
