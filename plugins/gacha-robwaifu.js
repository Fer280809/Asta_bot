// ============================================
// plugins/gacha-robwaifu.js
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!m.mentionedJid || m.mentionedJid.length === 0) {
        return m.reply('❌ *Uso correcto (Intento del Grinch):* /robwaifu @usuario');
    }
    
    const robberId = m.sender;
    const victimId = m.mentionedJid[0];
    
    if (robberId === victimId) {
        return m.reply('❌ *¡No puedes robar tus propios Adornos Navideños!*');
    }
    
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    if (!users[victimId] || !users[victimId].harem || users[victimId].harem.length === 0) {
        return m.reply('❌ *¡Ese árbol ya está vacío!* No tiene Adornos para robar.');
    }
    
    // Inicializar ladrón si no existe
    if (!users[robberId]) {
        users[robberId] = {
            harem: [],
            favorites: [],
            // Usar el mensaje navideño predeterminado
            claimMessage: '✨ *¡Feliz Navidad!* {user} ha añadido a {character} a su *Colección de Adornos Festivos* (Harem). ¡Qué gran regalo!',
            lastRoll: 0,
            votes: {},
            gachaCoins: 1000
        };
    }
    
    // Cooldown de 6 horas
    const now = Date.now();
    const cooldown = 21600000; // 6 horas
    
    if (users[robberId].lastRob && (now - users[robberId].lastRob) < cooldown) {
        const remaining = Math.ceil((cooldown - (now - users[robberId].lastRob)) / 3600000);
        return m.reply(`⏰ *El Grinch está cansado.* Debes esperar ${remaining} horas para intentar robar Adornos de nuevo.`);
    }
    
    // Probabilidad de éxito: 30%
    const success = Math.random() < 0.3;
    
    if (!success) {
        users[robberId].lastRob = now;
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
        return m.reply('❌ *¡Intento del Grinch fallido!* Te atraparon los Duendes de Seguridad.');
    }
    
    // Seleccionar personaje aleatorio (Lógica intacta)
    const randomIndex = Math.floor(Math.random() * users[victimId].harem.length);
    const stolenChar = users[victimId].harem[randomIndex];
    
    // Verificar si ya tiene el personaje
    const alreadyHas = users[robberId].harem.find(c => c.id === stolenChar.id);
    if (alreadyHas) {
        users[robberId].lastRob = now;
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
        return m.reply('⚠️ *Robaste un Adorno que ya tenías.* No se agregó a tu Colección.');
    }
    
    // Transferir personaje (Lógica intacta)
    users[robberId].harem.push({ ...stolenChar, claimedAt: now, forSale: false, salePrice: 0 });
    users[victimId].harem.splice(randomIndex, 1);
    
    // Actualizar en DB principal (Lógica intacta)
    const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const dbCharIndex = characters.findIndex(c => c.id === stolenChar.id);
    if (dbCharIndex !== -1) {
        characters[dbCharIndex].user = robberId;
        fs.writeFileSync(dbPath, JSON.stringify(characters, null, 2), 'utf-8');
    }
    
    // Eliminar de favoritos de la víctima (Lógica intacta)
    users[victimId].favorites = users[victimId].favorites.filter(id => id !== stolenChar.id);
    
    users[robberId].lastRob = now;
    
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    const robberName = await conn.getName(robberId);
    const victimName = await conn.getName(victimId);
    
    m.reply(`🎄 *¡EL ROBO DEL GRINCH FUE EXITOSO!*\n\n*${robberName}* le robó el Adorno *${stolenChar.name}* a *${victimName}*!`);
    
    // Notificar a la víctima
    conn.sendMessage(victimId, { 
        text: `🚨 *¡UN ADORNO DESAPARECIÓ!*\n\n*${robberName}* te robó el Adorno *${stolenChar.name}* de tu árbol!` 
    });
};

handler.help = ['robwaifu', 'robarwaifu'];
handler.tags = ['gacha'];
handler.command = ['robwaifu', 'robarwaifu'];
handler.group = true;

export default handler;
