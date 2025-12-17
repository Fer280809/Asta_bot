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
    
    // Inicializar ladrón si no existe (Mantenido el tema navideño)
    if (!users[robberId]) {
        users[robberId] = {
            harem: [],
            favorites: [],
            claimMessage: '✨ *¡Feliz Navidad!* {user} ha añadido a {character} a su *Colección de Adornos Festivos* (Harem). ¡Qué gran regalo!',
            lastRoll: 0,
            votes: {},
            gachaCoins: 1000,
            grinchPass: { uses: 0, expires: 0, lastGrant: 0 } // Asegurar la estructura
        };
    }
    
    // Asegurar estructura del Pase del Grinch
    if (!users[robberId].grinchPass) {
        users[robberId].grinchPass = { uses: 0, expires: 0, lastGrant: 0 };
    }

    // Cooldown de 6 horas
    const now = Date.now();
    const cooldown = 21600000; // 6 horas
    
    let usePass = false;
    let passUses = users[robberId].grinchPass.uses || 0;
    let passExpires = users[robberId].grinchPass.expires || 0;

    // --- Lógica del Pase del Grinch ---
    if (passUses > 0 && now < passExpires) {
        // Pase activo y con usos restantes
        users[robberId].grinchPass.uses -= 1;
        usePass = true;
    } else if (passUses > 0 && now >= passExpires) {
        // Pase expirado, pero aún tiene usos. Resetear.
        users[robberId].grinchPass.uses = 0;
    }
    // --- Fin Lógica del Pase ---

    if (!usePass) {
        // Aplicar cooldown normal si no se usó el pase
        if (users[robberId].lastRob && (now - users[robberId].lastRob) < cooldown) {
            const remaining = Math.ceil((cooldown - (now - users[robberId].lastRob)) / 3600000);
            return m.reply(`⏰ *El Grinch está cansado.* Debes esperar ${remaining} horas para intentar robar Adornos de nuevo.`);
        }
    } else {
        // Mensaje de uso del pase
        m.reply(`😈 *Pase del Grinch usado.* Te quedan ${users[robberId].grinchPass.uses} robos sin cooldown.`);
    }

    // Probabilidad de éxito: 30%
    const success = Math.random() < 0.3;
    
    if (!success) {
        // Si falló, actualizamos el cooldown normal si NO usó el pase
        if (!usePass) {
            users[robberId].lastRob = now;
        }
        
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
        return m.reply('❌ *¡Intento del Grinch fallido!* Te atraparon los Duendes de Seguridad.');
    }
    
    // Seleccionar personaje aleatorio
    const randomIndex = Math.floor(Math.random() * users[victimId].harem.length);
    const stolenChar = users[victimId].harem[randomIndex];
    
    // Verificar si ya tiene el personaje
    const alreadyHas = users[robberId].harem.find(c => c.id === stolenChar.id);
    if (alreadyHas) {
        if (!usePass) {
            users[robberId].lastRob = now;
        }
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
        return m.reply('⚠️ *Robaste un Adorno que ya tenías.* No se agregó a tu Colección.');
    }
    
    // Transferir personaje
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
    
    // Aplicar cooldown normal solo si NO usó el pase
    if (!usePass) {
        users[robberId].lastRob = now;
    }
    
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
