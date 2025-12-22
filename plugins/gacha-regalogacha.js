// ============================================
// plugins/gacha-regalogacha.js - VERSIÓN CORREGIDA
// AHORA usa SOLO la economía principal (user.coin) - ELIMINA gachaCoins
// ============================================
import fs from 'fs';
import path from 'path';

// --- CONSTANTES ACTUALIZADAS ---
const COST = 500; // Costo en MONEDA PRINCIPAL (coin)
const COOLDOWN_GIFT = 86400000; // 24 horas
const GRINCH_DURATION = 86400000; // 24 horas

const handler = async (m, { conn, usedPrefix, user, isOwner, args }) => {
    // Validar que el usuario existe en la economía principal
    if (!user) {
        return m.reply('🎅 *¡Primero debes estar en la Lista de Santa!*\n\nUsa cualquier comando para registrarte en el sistema.');
    }
    
    const userId = m.sender;
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');

    // Cargar usuarios de gacha (solo para personajes/favoritos)
    let gachaUsers = {};
    if (fs.existsSync(usersPath)) {
        gachaUsers = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }

    // Inicializar usuario en SISTEMA GACHA si es nuevo (SOLO para datos de colección)
    if (!gachaUsers[userId]) {
        gachaUsers[userId] = {
            harem: [],
            favorites: [],
            claimMessage: '✨ *¡Feliz Navidad!* {user} ha añadido a {character} a su *Colección de Adornos Festivos*. ¡Qué gran regalo!',
            lastRoll: 0,
            lastGift: 0,
            votes: {},
            grinchPass: {
                uses: 0,
                expires: 0,
                lastGrant: 0
            }
            // ¡SE ELIMINÓ gachaCoins: 1000! 🎯
        };
    }
    
    // --- Modo Prueba (Solo para owners) ---
    const isTestMode = isOwner && args[0] && (args[0].toLowerCase() === 'test' || args[0].toLowerCase() === 'prueba');
    let testHeader = '';
    
    if (isTestMode) {
        testHeader = '🧪 *MODO PRUEBA (OWNER)*\n> No se descontarán coins ni se aplicarán cooldowns.\n\n';
    }

    // --- 1. Verificar Cooldown (24 horas) ---
    const now = Date.now();
    
    if (!isTestMode) {
        if (gachaUsers[userId].lastGift && (now - gachaUsers[userId].lastGift) < COOLDOWN_GIFT) {
            const remainingTime = COOLDOWN_GIFT - (now - gachaUsers[userId].lastGift);
            const hours = Math.floor(remainingTime / 3600000);
            const minutes = Math.floor((remainingTime % 3600000) / 60000);
            
            return m.reply(`⏰ *¡El Taller de Regalos está cerrado!*\n\nDebes esperar ${hours}h ${minutes}m para abrir otro regalo.\n🎄 *Último regalo:* ${new Date(gachaUsers[userId].lastGift).toLocaleTimeString()}`);
        }
    }

    // --- 2. Verificar Costo en MONEDA PRINCIPAL ---
    if (!isTestMode && user.coin < COST) {
        return m.reply(`💰 *¡Fondos insuficientes!*\n\nNecesitas *${COST} Monedas de Chocolate* pero solo tienes *${user.coin}*.\n💡 Gana coins con \`.daily\`, \`.work\` u otros comandos.`);
    }

    // --- 3. Cobrar el costo (SOLO en modo normal) ---
    let paymentMsg = '';
    if (!isTestMode) {
        user.coin -= COST;
        paymentMsg = `💰 *Se descontaron ${COST} Monedas de Chocolate.*\n🎄 *Tu saldo ahora:* ${user.coin} coins\n\n`;
    }

    // --- 4. Seleccionar Premio (SISTEMA MEJORADO) ---
    const rand = Math.random();
    let rewardText = '';
    let testRewardInfo = ''; // Solo para modo prueba
    
    // PROBABILIDADES ACTUALIZADAS (todo en moneda real o personajes):
    // 50% Monedas reales (bonus) | 30% Personaje | 20% Pase Grinch
    
    if (rand < 0.50) { 
        // 50%: BONUS DE MONEDAS REALES (recompensa principal)
        const minBonus = Math.floor(COST * 0.5);   // 50% del costo
        const maxBonus = Math.floor(COST * 2.0);   // 200% del costo
        const bonusAmount = Math.floor(Math.random() * (maxBonus - minBonus + 1)) + minBonus;
        
        if (!isTestMode) {
            user.coin += bonusAmount; // ¡Pago en MONEDA REAL!
        }
        
        rewardText = `💰 *¡TESORO NAVIDEÑO ENCONTRADO!*\n\n`;
        rewardText += `🎁 Has recibido un bonus de *${bonusAmount} Monedas de Chocolate*.\n`;
        rewardText += `✨ *Ganancia neta:* ${bonusAmount - COST} coins\n`;
        rewardText += `🎄 *Tu saldo total:* ${user.coin} coins`;
        
        testRewardInfo = `Bonus de Monedas: ${bonusAmount} coins (${bonusAmount - COST} neto)`;
        
    } else if (rand < 0.80) { 
        // 30%: ADORNO NAVIDEÑO (personaje)
        let randomChar = null;
        
        if (fs.existsSync(dbPath)) {
            const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            if (Array.isArray(characters) && characters.length > 0) {
                // Filtrar personajes no obtenidos por el usuario
                const userHaremIds = gachaUsers[userId].harem.map(c => c.id);
                const availableChars = characters.filter(c => !userHaremIds.includes(c.id));
                
                if (availableChars.length > 0) {
                    randomChar = availableChars[Math.floor(Math.random() * availableChars.length)];
                } else {
                    randomChar = characters[Math.floor(Math.random() * characters.length)];
                }
            }
        }

        if (!randomChar) {
            // Si no hay personajes, dar reembolso + bonus
            const refundBonus = Math.floor(COST * 0.8);
            if (!isTestMode) user.coin += refundBonus;
            
            rewardText = `📦 *¡El taller de Santa está vacío!*\n\n`;
            rewardText += `🎁 Como compensación, recibes *${refundBonus} Monedas de Chocolate*.\n`;
            rewardText += `🎄 *Tu saldo ahora:* ${user.coin} coins`;
            
            testRewardInfo = `Reembolso por catálogo vacío: ${refundBonus} coins`;
        } else {
            // Verificar si ya tiene el personaje
            const alreadyHas = gachaUsers[userId].harem.find(c => c.id === randomChar.id);
            
            if (!alreadyHas && !isTestMode) {
                gachaUsers[userId].harem.push({ 
                    ...randomChar, 
                    claimedAt: now, 
                    obtainedFrom: 'regalo_gacha',
                    forSale: false, 
                    salePrice: 0 
                });
            }
            
            const status = alreadyHas ? '*(¡Duplicado! Recibes coins en su lugar)*' : '*(¡Nuevo para tu colección!)*';
            
            if (alreadyHas && !isTestMode) {
                // Si es duplicado, dar coins equivalentes al valor
                const duplicateBonus = Math.floor((parseInt(randomChar.value) || 100) * 0.7);
                user.coin += duplicateBonus;
                
                rewardText = `⭐ *¡ADORNO DUPLICADO!*\n\n`;
                rewardText += `🎁 Ya tenías a *${randomChar.name}* en tu colección.\n`;
                rewardText += `💰 Recibes *${duplicateBonus} Monedas de Chocolate* en su lugar.\n`;
                rewardText += `🎄 *Tu saldo ahora:* ${user.coin} coins`;
                
                testRewardInfo = `Duplicado convertido a coins: ${duplicateBonus}`;
            } else {
                rewardText = `⭐ *¡NUEVO ADORNO NAVIDEÑO!*\n\n`;
                rewardText += `🎁 Has obtenido a *${randomChar.name}* ${status}\n`;
                rewardText += `📺 Origen: ${randomChar.source || 'Desconocido'}\n`;
                rewardText += `💎 Valor: ${randomChar.value || 100}\n`;
                rewardText += `✨ *Total en tu colección:* ${gachaUsers[userId].harem.length} adornos`;
                
                testRewardInfo = `Nuevo personaje: ${randomChar.name} (Valor: ${randomChar.value || 100})`;
            }
        }
        
    } else { 
        // 20%: PASE DEL GRINCH
        const COOLDOWN_GRINCH = 43200000; // 12 horas
        
        if (!isTestMode && gachaUsers[userId].grinchPass.lastGrant && 
            (now - gachaUsers[userId].grinchPass.lastGrant) < COOLDOWN_GRINCH) {
            
            // Si está en cooldown, dar bonus de coins
            const cooldownBonus = Math.floor(COST * 1.2); // 20% extra
            user.coin += cooldownBonus;
            
            rewardText = `🎭 *¡PASE DEL GRINCH EN ESPERA!*\n\n`;
            rewardText += `🎁 Ya recibiste un pase hace menos de 12 horas.\n`;
            rewardText += `💰 Como compensación, recibes *${cooldownBonus} Monedas de Chocolate*.\n`;
            rewardText += `🎄 *Tu saldo ahora:* ${user.coin} coins\n\n`;
            rewardText += `⏰ Prueba de nuevo en ${Math.ceil((COOLDOWN_GRINCH - (now - gachaUsers[userId].grinchPass.lastGrant)) / 3600000)} horas.`;
            
            testRewardInfo = `Pase en cooldown → Bonus: ${cooldownBonus} coins`;
            
        } else {
            // Otorgar pase del Grinch
            if (!isTestMode) {
                gachaUsers[userId].grinchPass.uses = 10;
                gachaUsers[userId].grinchPass.expires = now + GRINCH_DURATION;
                gachaUsers[userId].grinchPass.lastGrant = now;
            }
            
            const expiryTime = new Date(now + GRINCH_DURATION).toLocaleTimeString();
            
            rewardText = `😈 *¡PASE DEL GRINCH ACTIVADO!*\n\n`;
            rewardText += `🎁 Tienes *10 intentos de robo* disponibles.\n`;
            rewardText += `⏰ Válido por 24 horas (hasta las ${expiryTime}).\n\n`;
            rewardText += `💡 *Usa:* \`${usedPrefix}robwaifu @usuario\`\n`;
            rewardText += `🎯 *Objetivo:* ¡Roba adornos de otros árboles!`;
            
            testRewardInfo = `Pase del Grinch: 10 usos por 24h`;
        }
    }
    
    // --- 5. Actualizar datos (SOLO modo normal) ---
    if (!isTestMode) {
        gachaUsers[userId].lastGift = now;
        fs.writeFileSync(usersPath, JSON.stringify(gachaUsers, null, 2), 'utf-8');
        
        // Enviar mensaje final
        const finalMsg = testHeader + paymentMsg + rewardText;
        await m.reply(finalMsg);
        
    } else {
        // Modo prueba: mostrar solo información
        const testMsg = testHeader + 
                       `🔍 *SIMULACIÓN DE REGALO NAVIDEÑO*\n\n` +
                       `💎 *Costo normal:* ${COST} coins\n` +
                       `🎯 *Premio simulado:* ${testRewardInfo}\n\n` +
                       `📊 *Probabilidades:*\n` +
                       `• 50% Bonus de Coins (${Math.floor(COST*0.5)}-${Math.floor(COST*2)})\n` +
                       `• 30% Adorno Navideño\n` +
                       `• 20% Pase del Grinch (10 robos/24h)\n\n` +
                       `🎅 *En modo real se descontarían ${COST} coins.*`;
        
        await m.reply(testMsg);
    }
};

handler.help = ['regalogacha', 'abrirregalo', 'giftgacha'];
handler.tags = ['gacha', 'navidad', 'economy'];
handler.command = ['regalogacha', 'abrirregalo', 'giftgacha'];
handler.group = true;

// Información del comando
handler.description = 'Abrir un regalo navideño especial (cuesta 500 coins)';
handler.usage = '[test/prueba] (solo owners)';
handler.example = ['.regalogacha', '.regalogacha prueba'];
handler.note = 'Cooldown: 24 horas. Premios: coins, adornos, o pase del Grinch.';

export default handler;