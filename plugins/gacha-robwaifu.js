// ============================================
// plugins/gacha-robwaifu.js - VERSIÓN CORREGIDA
// ELIMINA gachaCoins completamente
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
    if (!m.mentionedJid || m.mentionedJid.length === 0) {
        return m.reply('🎭 *¡Ho Ho... NO!*\n\n❄️ *Uso:* `.robwaifu @usuario`\n✨ Intenta robar un adorno navideño de otro árbol.');
    }
    
    const robberId = m.sender;
    const victimId = m.mentionedJid[0];
    
    if (robberId === victimId) {
        return m.reply('🎄 *¡No puedes robar tus propios adornos!*\n\n¡Ya están decorando tu propio árbol!');
    }
    
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');
    
    // Cargar usuarios festivos
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    // Verificar que la víctima existe y tiene adornos
    if (!users[victimId] || !users[victimId].harem || users[victimId].harem.length === 0) {
        return m.reply('🎁 *¡Ese árbol está vacío!*\n\nLa víctima no tiene adornos para robar.');
    }
    
    // Inicializar ladrón en SISTEMA GACHA si no existe
    if (!users[robberId]) {
        users[robberId] = {
            harem: [],
            favorites: [],
            claimMessage: '✨ *¡Feliz Navidad!* {user} ha añadido a {character} a su *Colección de Adornos Festivos*. ¡Qué gran regalo!',
            lastRoll: 0,
            lastRob: 0,
            votes: {},
            grinchPass: { 
                uses: 0, 
                expires: 0, 
                lastGrant: 0 
            }
            // ¡SE ELIMINÓ gachaCoins: 1000! 🎯
        };
    }
    
    // Asegurar estructura del Pase del Grinch
    if (!users[robberId].grinchPass) {
        users[robberId].grinchPass = { uses: 0, expires: 0, lastGrant: 0 };
    }

    // --- Lógica del Pase del Grinch ---
    const now = Date.now();
    const normalCooldown = 21600000; // 6 horas
    let usePass = false;
    
    const passUses = users[robberId].grinchPass.uses || 0;
    const passExpires = users[robberId].grinchPass.expires || 0;

    if (passUses > 0 && now < passExpires) {
        // Usar pase activo
        users[robberId].grinchPass.uses -= 1;
        usePass = true;
    } else if (passUses > 0 && now >= passExpires) {
        // Pase expirado, resetear
        users[robberId].grinchPass.uses = 0;
        users[robberId].grinchPass.expires = 0;
    }
    
    // --- Verificar cooldown normal (si no usa pase) ---
    if (!usePass) {
        const lastRob = users[robberId].lastRob || 0;
        if (lastRob && (now - lastRob) < normalCooldown) {
            const remaining = normalCooldown - (now - lastRob);
            const hours = Math.floor(remaining / 3600000);
            const minutes = Math.floor((remaining % 3600000) / 60000);
            
            return m.reply(`⏰ *¡El Grinch está descansando!*\n\nDebes esperar ${hours}h ${minutes}m para otro intento.\n🎄 Usa un \`Pase del Grinch\` para saltar el cooldown.`);
        }
    }
    
    // --- Probabilidad de éxito: 30% (o 50% con pase) ---
    const baseChance = 0.30; // 30%
    const passBonus = usePass ? 0.20 : 0; // +20% con pase
    const successChance = baseChance + passBonus;
    
    const success = Math.random() < successChance;
    
    // Obtener nombres para mensajes
    const robberName = await conn.getName(robberId);
    const victimName = await conn.getName(victimId);
    
    if (!success) {
        // FALLO: Actualizar cooldown normal si NO usó pase
        if (!usePass) {
            users[robberId].lastRob = now;
        }
        
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
        
        let failMsg = `🎭 *¡ROBO FALLIDO!*\n\n`;
        failMsg += `*${robberName}* intentó robar a *${victimName}* pero fue atrapado.\n`;
        
        if (usePass) {
            failMsg += `😈 *Pase del Grinch usado.* Te quedan ${users[robberId].grinchPass.uses} robos sin cooldown.\n`;
            failMsg += `🎯 Probabilidad con pase: ${Math.floor(successChance * 100)}%`;
        } else {
            failMsg += `⏰ *Cooldown activado:* 6 horas para el próximo intento.\n`;
            failMsg += `🎯 Probabilidad base: ${Math.floor(baseChance * 100)}%`;
        }
        
        return m.reply(failMsg);
    }
    
    // --- ÉXITO: Seleccionar y transferir adorno ---
    // Filtrar adornos NO en venta (más valiosos robar)
    const nonSaleChars = users[victimId].harem.filter(c => !c.forSale);
    const targetChars = nonSaleChars.length > 0 ? nonSaleChars : users[victimId].harem;
    
    if (targetChars.length === 0) {
        return m.reply(`🎁 *${victimName} solo tiene adornos en venta.*\n\nCompra con \`.buychar\` en lugar de robar.`);
    }
    
    const randomIndex = Math.floor(Math.random() * targetChars.length);
    const stolenChar = targetChars[randomIndex];
    const originalIndex = users[victimId].harem.findIndex(c => c.id === stolenChar.id);
    
    // Verificar si el ladrón ya tiene el adorno
    const alreadyHas = users[robberId].harem.find(c => c.id === stolenChar.id);
    if (alreadyHas) {
        if (!usePass) {
            users[robberId].lastRob = now;
        }
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
        
        return m.reply(`⚠️ *¡Robaste un adorno duplicado!*\n\nYa tenías a *${stolenChar.name}* en tu colección.\n🎄 El robo no tuvo efecto.`);
    }
    
    // Transferir adorno
    const transferredChar = { 
        ...stolenChar, 
        claimedAt: now, 
        stolenAt: now,
        stolenFrom: victimId,
        forSale: false, 
        salePrice: 0 
    };
    
    users[robberId].harem.push(transferredChar);
    users[victimId].harem.splice(originalIndex, 1);
    
    // Eliminar de favoritos de la víctima
    if (users[victimId].favorites) {
        users[victimId].favorites = users[victimId].favorites.filter(id => id !== stolenChar.id);
    }
    
    // Actualizar cooldown normal si NO usó pase
    if (!usePass) {
        users[robberId].lastRob = now;
    }
    
    // Guardar cambios
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    // --- Mensaje de éxito ---
    let successMsg = `🎄 *¡ROBO NAVIDEÑO EXITOSO!* 🎁\n\n`;
    successMsg += `😈 *Ladrón:* ${robberName}\n`;
    successMsg += `👤 *Víctima:* ${victimName}\n`;
    successMsg += `🎁 *Adorno robado:* ${stolenChar.name}\n`;
    successMsg += `💎 *Valor:* ${stolenChar.value || 100}\n`;
    successMsg += `🎬 *Origen:* ${stolenChar.source || 'Desconocido'}\n\n`;
    
    if (usePass) {
        successMsg += `😈 *Pase del Grinch usado.* Usos restantes: ${users[robberId].grinchPass.uses}\n`;
    } else {
        successMsg += `⏰ *Próximo robo en:* 6 horas\n`;
    }
    
    successMsg += `✨ *Ahora tienes:* ${users[robberId].harem.length} adornos`;
    
    await m.reply(successMsg);
    
    // Notificar a la víctima
    try {
        await conn.sendMessage(victimId, {
            text: `🚨 *¡ALERTA NAVIDEÑA!*\n\n😈 *${robberName}* robó tu adorno *${stolenChar.name}*!\n\n🎄 *Tus adornos restantes:* ${users[victimId].harem.length}\n💡 ¡Refuerza la seguridad de tu árbol!`
        });
    } catch (notifyError) {
        console.log('No se pudo notificar a la víctima:', notifyError.message);
    }
};

handler.help = ['robwaifu', 'robaradorno', 'grinch'];
handler.tags = ['gacha', 'navidad'];
handler.command = ['robwaifu', 'robaradorno', 'grinch'];
handler.group = true;

// Información del comando
handler.description = 'Intentar robar un adorno navideño de otro usuario';
handler.usage = '@usuario';
handler.example = '.robwaifu @amigo';
handler.note = '30% probabilidad, cooldown 6h. Pase del Grinch aumenta probabilidad y elimina cooldown.';

export default handler;