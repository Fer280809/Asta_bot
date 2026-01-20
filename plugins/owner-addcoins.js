import db from '../lib/database.js';

let impts = 0;

let handler = async (m, { conn, text }) => {
    let who;
    
    // Detectar usuario objetivo
    if (m.isGroup) {
        if (m.mentionedJid && m.mentionedJid.length > 0) {
            who = m.mentionedJid[0];
        } else if (m.quoted && m.quoted.sender) {
            who = m.quoted.sender;
        } else {
            return m.reply('❌ Por favor, menciona al usuario o responde a su mensaje.');
        }
    } else {
        who = m.chat;
    }
    
    if (!who) return m.reply('❌ Por favor, menciona al usuario o cita un mensaje.');
    
    // Extraer cantidad del texto
    let txt = text.replace('@' + who.split('@')[0], '').trim();
    if (!txt) return m.reply('❌ Por favor, ingresa la cantidad que deseas añadir.\nEjemplo: /addcoin @usuario 100');
    if (isNaN(txt)) return m.reply('❌ Solo se permiten números.');
    
    let dmt = parseInt(txt);
    let coin = dmt;
    let pjk = Math.ceil(dmt * impts);
    coin += pjk;
    
    if (coin < 1) return m.reply('❌ Mínimo es *1*');
    
    // Asegurarse de que la base de datos existe
    let users = global.db.data.users;
    
    // Verificar que el usuario existe en la base de datos
    if (!users[who]) {
        users[who] = {
            coin: 0
        };
    }
    
    // Asegurarse de que coin existe
    if (typeof users[who].coin === 'undefined') {
        users[who].coin = 0;
    }
    
    // Añadir coins
    users[who].coin += dmt;
    
    // Responder con confirmación
    await m.reply(`💸 *Coins Añadidos:*
    
✅ Cantidad: ${dmt} coins
👤 Usuario: @${who.split('@')[0]}
💰 Total actual: ${users[who].coin} coins`, null, { mentions: [who] });
};

handler.help = ['addcoins *<@user> <cantidad>*'];
handler.tags = ['owner'];
handler.command = ['añadircoin', 'addcoin', 'addcoins']; 
handler.rowner = true;

export default handler;