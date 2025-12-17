// ============================================
// plugins/gacha-regalogacha.js
// ============================================
import fs from 'fs';
import path from 'path';

// --- CONSTANTES ACTUALIZADAS ---
const COST = 500; 
const COOLDOWN_GIFT = 86400000; // 24 horas
const GRINCH_DURATION = 86400000; // 24 horas

const handler = async (m, { conn, usedPrefix, user, isOwner, args, text }) => {
    // Aseguramos que 'user' (datos de la DB principal) esté disponible
    if (!user) {
        return m.reply('❌ No se encontraron datos de usuario. Intente de nuevo.');
    }
    
    const userId = m.sender;
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json');

    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }

    // Inicializar usuario si es nuevo
    if (!users[userId]) {
        users[userId] = {
            harem: [],
            favorites: [],
            claimMessage: '✨ *¡Feliz Navidad!* {user} ha añadido a {character} a su *Colección de Adornos Festivos* (Harem). ¡Qué gran regalo!', 
            lastRoll: 0,
            votes: {},
            gachaCoins: 1000, 
            lastGift: 0,
            grinchPass: {
                uses: 0,
                expires: 0,
                lastGrant: 0
            }
        };
    }
    
    // --- Lógica del Modo Prueba (Owner Only) ---
    // Chequeamos si el primer argumento es 'test' o 'prueba'
    const isTestMode = isOwner && (args[0] === 'test' || args[0] === 'prueba');
    let testResponse = '';

    if (isTestMode) {
        testResponse = '⚙️ *MODO PRUEBA (OWNER)* ⚙️\n> No se descontará dinero ni se aplicarán premios o cooldowns.\n\n';
    }

    // --- 1. Verificar Cooldown General (24 horas) ---
    const now = Date.now();
    
    if (!isTestMode) { // El Owner no tiene cooldown en modo prueba
        if (users[userId].lastGift && (now - users[userId].lastGift) < COOLDOWN_GIFT) {
            const remainingHours = Math.ceil((COOLDOWN_GIFT - (now - users[userId].lastGift)) / 3600000);
            return m.reply(`⏰ *El Centro de Distribución está cerrado.* Debes esperar ${remainingHours} horas para abrir otro Regalo de Utilidad.`);
        }
    }

    // --- 2. Verificar Costo ---
    const currentRealBalance = user.coin || 0; 
    
    if (!isTestMode) { // El Owner no necesita dinero en modo prueba
        if (currentRealBalance < COST) {
            return m.reply(`❌ *¡Te falta dinero!* Necesitas *$${COST}* de tu balance principal para comprar este regalo. Actualmente tienes *$${currentRealBalance}*`);
        }
    }

    // Cobrar el costo (SOLO si NO es Modo Prueba)
    if (!isTestMode) {
        user.coin -= COST; 
    }
    
    // Texto inicial
    let responseText = testResponse;
    if (!isTestMode) {
        responseText += `🎁 *¡REGALO ABIERTO!* - Se descontaron *$${COST}* de tu balance principal. 🎄\n\n`;
    } else {
        responseText += `🔍 *SIMULACIÓN DE APERTURA:*\n`;
    }

    // --- 3. Seleccionar y Aplicar Premio ---
    const rand = Math.random();
    let rewardText;
    let actualReward = ''; // Para guardar el premio real en modo prueba

    if (rand < 0.40) { // 40% Monedas de Jengibre
        const amount = Math.floor(Math.random() * (4000 - 400 + 1)) + 400;
        
        if (!isTestMode) users[userId].gachaCoins += amount; 
        actualReward = `Monedas de Jengibre (+${amount})`;
        
        rewardText = `💰 ¡Encontraste una bolsa grande! Recibes *${amount} Monedas de Jengibre (GachaCoins)*.`;

    } else if (rand < 0.70) { // 30% Adorno Aleatorio (Personaje)
        let randomChar = null;
        let charData = null;
        
        if (fs.existsSync(dbPath)) {
            const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            if (Array.isArray(characters) && characters.length > 0) {
                randomChar = characters[Math.floor(Math.random() * characters.length)];
            }
            charData = characters;
        }

        if (!randomChar) {
            rewardText = "⚠️ No fue posible obtener un Adorno (Catálogo vacío).";
            if (!isTestMode) user.coin += COST; // Reembolso si no se encuentra en modo normal
            actualReward = "Reembolso por error de catálogo";
        } else {
            const alreadyHas = users[userId].harem.find(c => c.id === randomChar.id);
            
            if (!alreadyHas && !isTestMode) {
                users[userId].harem.push({ 
                    ...randomChar, 
                    claimedAt: now, 
                    forSale: false, 
                    salePrice: 0 
                });
            }
            
            const statusText = alreadyHas ? "*(¡Adorno Duplicado!)*" : "*(Nuevo Adorno)*";
            actualReward = `${randomChar.name} ${statusText}`;

            rewardText = `⭐ ¡Sorpresa! Desempacaste el Adorno *${randomChar.name}* ${statusText}.\n`;
            rewardText += `   📺 Origen: ${randomChar.source}\n   💎 Rareza: ${randomChar.value}`;
        }
    } else { // 30% Pase del Grinch
        const COOLDOWN_GRINCH = 43200000; 

        if (users[userId].grinchPass.lastGrant && (now - users[userId].grinchPass.lastGrant) < COOLDOWN_GRINCH && !isTestMode) {
             rewardText = "⚠️ Ya recibiste un Pase del Grinch recientemente (hace menos de 12 horas). Por esta vez, recibes un reembolso del 80% del costo.";
             user.coin += Math.floor(COST * 0.8); // Reembolso en modo normal
             actualReward = "Reembolso (Pase Grinch en cooldown)";
        } else {
            if (!isTestMode) {
                users[userId].grinchPass.uses = 10;
                users[userId].grinchPass.expires = now + GRINCH_DURATION;
                users[userId].grinchPass.lastGrant = now;
            }
            actualReward = "Pase del Grinch Activado (10 usos)";

            rewardText = `😈 ¡Pase del Grinch activado! Tienes *10 intentos de robo* sin cooldown durante las próximas 24 horas.`;
            rewardText += `\n\n💡 *Usa ${usedPrefix}robwaifu @usuario* antes de que expire.`;
        }
    }
    
    // --- 4. Guardar Cooldown y Datos (SOLO si NO es Modo Prueba) ---
    if (!isTestMode) {
        users[userId].lastGift = now;
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    } else {
        // En modo prueba, se muestra un resumen simple del resultado
        rewardText = `\n✅ *RESULTADO DE LA PRUEBA:*\n> ${actualReward}`;
    }
    
    m.reply(responseText + rewardText);
};

handler.help = ['regalogacha', 'openpresent'];
handler.tags = ['gacha', 'economy'];
handler.command = ['regalogacha', 'openpresent'];
handler.group = true;
handler.owner = false; // El owner puede usar el comando, pero no necesita restricción general
// Puedes mantener o quitar 'handler.limit = true' dependiendo de cómo lo uses, 
// pero 'user' ya está inyectado gracias al handler principal.

export default handler;
