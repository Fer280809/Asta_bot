import db from '../lib/database.js';

let handler = async (m, { conn, text, args }) => {
    // Verificar que se proporcionen los parámetros necesarios
    if (!text) return m.reply(`💸 *Uso correcto:*\n» ownerpay @usuario @destinatario <cantidad|all>\n» ownerpay número número <cantidad|all>\n\n*Ejemplo:*\n» ownerpay @user1 @user2 100\n» ownerpay @user1 @user2 all`);
    
    let users = global.db.data.users;
    let parts = text.trim().split(/\s+/);
    
    if (parts.length < 2) return m.reply(`💸 *Faltan parámetros*\n» Debes especificar: usuario destino y cantidad`);
    
    let fromUser;
    let toUser;
    let amount;
    
    // Si hay menciones, usarlas
    if (m.mentionedJid && m.mentionedJid.length >= 2) {
        // Dos menciones: @origen @destino cantidad
        fromUser = m.mentionedJid[0];
        toUser = m.mentionedJid[1];
        amount = parts[parts.length - 1].toLowerCase();
    } else if (m.mentionedJid && m.mentionedJid.length === 1) {
        // Una mención: puede ser @origen número cantidad o número @destino cantidad
        if (parts[0].startsWith('@') || parts[0].match(/^\d+$/) === null) {
            // @origen número cantidad
            fromUser = m.mentionedJid[0];
            if (parts[1] && parts[1].match(/^\d+$/)) {
                toUser = parts[1] + '@s.whatsapp.net';
                amount = parts[2] ? parts[2].toLowerCase() : null;
            } else {
                return m.reply(`💸 *Usuario destino inválido*\n» El segundo parámetro debe ser un número`);
            }
        } else {
            // número @destino cantidad
            if (parts[0].match(/^\d+$/)) {
                fromUser = parts[0] + '@s.whatsapp.net';
                toUser = m.mentionedJid[0];
                amount = parts[parts.length - 1].toLowerCase();
            }
        }
    } else {
        // Sin menciones: número número cantidad
        if (parts[0].match(/^\d+$/) && parts[1].match(/^\d+$/)) {
            fromUser = parts[0] + '@s.whatsapp.net';
            toUser = parts[1] + '@s.whatsapp.net';
            amount = parts[2] ? parts[2].toLowerCase() : null;
        } else {
            return m.reply(`💸 *Formato inválido*\n» Usa: ownerpay @user1 @user2 cantidad\n» O: ownerpay número número cantidad`);
        }
    }
    
    if (!amount) return m.reply(`💸 *Falta la cantidad*\n» Especifica cuántos coins transferir o usa "all"`);
    
    // Inicializar usuarios si no existen
    if (!users[fromUser]) users[fromUser] = { coin: 0, bank: 0 };
    if (!users[toUser]) users[toUser] = { coin: 0, bank: 0 };
    
    let transferAmount;
    
    // Calcular saldo total (billetera + banco)
    let saldoOrigenTotal = (users[fromUser].coin || 0) + (users[fromUser].bank || 0);
    let saldoOrigenBilletera = users[fromUser].coin || 0;
    let saldoOrigenBanco = users[fromUser].bank || 0;
    
    if (amount === 'all') {
        transferAmount = saldoOrigenTotal;
        if (transferAmount <= 0) {
            return m.reply(`💸 *El usuario @${fromUser.split('@')[0]} no tiene coins para transferir*`, null, { mentions: [fromUser] });
        }
    } else {
        if (isNaN(amount)) return m.reply(`💸 *Cantidad inválida*\n» Escribe un número o "all" para transferir todo`);
        transferAmount = parseInt(amount);
        if (transferAmount < 1) return m.reply(`💸 *La cantidad mínima es 1 coin*`);
    }
    
    // Verificar que el usuario origen tenga suficientes coins (billetera + banco)
    if (saldoOrigenTotal < transferAmount) {
        return m.reply(`💸 *Fondos insuficientes*\n» @${fromUser.split('@')[0]} tiene:\n  • Billetera: ${saldoOrigenBilletera} coins\n  • Banco: ${saldoOrigenBanco} coins\n  • Total: ${saldoOrigenTotal} coins\n» Se intentó transferir: ${transferAmount} coins`, null, { mentions: [fromUser] });
    }
    
    // Realizar la transferencia (primero de la billetera, luego del banco)
    let restante = transferAmount;
    
    // Quitar primero de la billetera
    if (saldoOrigenBilletera >= restante) {
        users[fromUser].coin -= restante;
        restante = 0;
    } else {
        restante -= saldoOrigenBilletera;
        users[fromUser].coin = 0;
        // Quitar el resto del banco
        users[fromUser].bank -= restante;
    }
    
    // Añadir todo a la billetera del destino
    users[toUser].coin += transferAmount;
    
    // Guardar cambios en la base de datos
    global.db.data.users = users;
    
    // Mensaje de confirmación
    let nuevoSaldoOrigenBilletera = users[fromUser].coin || 0;
    let nuevoSaldoOrigenBanco = users[fromUser].bank || 0;
    let nuevoSaldoOrigenTotal = nuevoSaldoOrigenBilletera + nuevoSaldoOrigenBanco;
    let nuevoSaldoDestinoBilletera = users[toUser].coin || 0;
    let nuevoSaldoDestinoBanco = users[toUser].bank || 0;
    let nuevoSaldoDestinoTotal = nuevoSaldoDestinoBilletera + nuevoSaldoDestinoBanco;
    
    m.reply(`✅ *Transferencia exitosa*\n\n💸 *Detalles:*\n» De: @${fromUser.split('@')[0]}\n» Para: @${toUser.split('@')[0]}\n» Cantidad transferida: ${transferAmount} coins\n\n📊 *Saldos actuales:*\n\n@${fromUser.split('@')[0]}:\n  • Billetera: ${nuevoSaldoOrigenBilletera} coins\n  • Banco: ${nuevoSaldoOrigenBanco} coins\n  • Total: ${nuevoSaldoOrigenTotal} coins\n\n@${toUser.split('@')[0]}:\n  • Billetera: ${nuevoSaldoDestinoBilletera} coins\n  • Banco: ${nuevoSaldoDestinoBanco} coins\n  • Total: ${nuevoSaldoDestinoTotal} coins`, null, { 
        mentions: [fromUser, toUser] 
    });
};

handler.help = ['ownerpay *<@user> <@destino> <cantidad|all>*'];
handler.tags = ['owner'];
handler.command = ['ownerpay', 'transfercoin', 'paycoin']; 
handler.fernando = true;

export default handler;