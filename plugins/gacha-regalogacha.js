// ============================================
// plugins/gacha-regalogacha.js
// ============================================
import fs from 'fs';
import path from 'path';

// --- CONSTANTES ACTUALIZADAS ---
const COST = 500; // Nuevo costo: 500 Monedas de Jengibre
const COOLDOWN_GIFT = 86400000; // Nuevo cooldown: 24 horas
const GRINCH_DURATION = 86400000; // 24 horas (Duración del Pase)

const handler = async (m, { conn, usedPrefix }) => {
    const userId = m.sender;
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    const dbPath = path.join(process.cwd(), 'lib', 'characters.json'); // Para el roll de personaje

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

    // Asegurar estructura del Pase del Grinch
    if (!users[userId].grinchPass) {
        users[userId].grinchPass = { uses: 0, expires: 0, lastGrant: 0 };
    }
    
    // --- 1. Verificar Cooldown General (24 horas) ---
    const now = Date.now();
    
    if (users[userId].lastGift && (now - users[userId].lastGift) < COOLDOWN_GIFT) {
        const remainingHours = Math.ceil((COOLDOWN_GIFT - (now - users[userId].lastGift)) / 3600000);
        return m.reply(`⏰ *El Centro de Distribución está cerrado.* Debes esperar ${remainingHours} horas para abrir otro Regalo de Utilidad.`);
    }

    // --- 2. Verificar Costo (500 Monedas) ---
    if ((users[userId].gachaCoins || 0) < COST) {
        return m.reply(`❌ *Necesitas $${COST} Monedas de Jengibre* para comprar y abrir este regalo. Actualmente tienes $${users[userId].gachaCoins || 0}.`);
    }

    // Cobrar el costo
    users[userId].gachaCoins -= COST;
    let responseText = `🎁 *¡REGALO ABIERTO!* - Se descontaron $${COST} Monedas de Jengibre. 🎄\n\n`;

    // --- 3. Seleccionar y Aplicar Premio (Probabilidades intactas) ---
    const rand = Math.random();
    let rewardText;

    if (rand < 0.40) { // 40% Monedas (400 a 4000)
        const amount = Math.floor(Math.random() * (4000 - 400 + 1)) + 400;
        users[userId].gachaCoins += amount;
        rewardText = `💰 ¡Encontraste una bolsa grande! Recibes *${amount} Monedas de Jengibre*.`;

    } else if (rand < 0.70) { // 30% Adorno Aleatorio (Personaje)
        if (!fs.existsSync(dbPath)) {
            rewardText = "⚠️ No fue posible obtener un Adorno (Catálogo vacío). Se reembolsará el costo.";
            users[userId].gachaCoins += COST;
        } else {
            const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            if (!Array.isArray(characters) || characters.length === 0) {
                 rewardText = "⚠️ No fue posible obtener un Adorno (Catálogo vacío). Se reembolsará el costo.";
                 users[userId].gachaCoins += COST;
            } else {
                const randomChar = characters[Math.floor(Math.random() * characters.length)];
                
                const alreadyHas = users[userId].harem.find(c => c.id === randomChar.id);
                
                if (!alreadyHas) {
                    users[userId].harem.push({ 
                        ...randomChar, 
                        claimedAt: now, 
                        forSale: false, 
                        salePrice: 0 
                    });
                }
                
                const statusText = alreadyHas ? "*(¡Adorno Duplicado!)*" : "*(Nuevo Adorno)*";

                rewardText = `⭐ ¡Sorpresa! Desempacaste el Adorno *${randomChar.name}* ${statusText}.\n`;
                rewardText += `   📺 Origen: ${randomChar.source}\n   💎 Rareza: ${randomChar.value}`;
            }
        }
    } else { // 30% Pase del Grinch (10 usos, 24h duración, 12h cooldown de concesión)
        const COOLDOWN_GRINCH = 43200000; // 12 horas (para recibir el pase)

        if (users[userId].grinchPass.lastGrant && (now - users[userId].grinchPass.lastGrant) < COOLDOWN_GRINCH) {
             rewardText = "⚠️ Ya recibiste un Pase del Grinch recientemente (hace menos de 12 horas). Por esta vez, recibes un reembolso del 80% del costo.";
             users[userId].gachaCoins += Math.floor(COST * 0.8);
        } else {
            users[userId].grinchPass.uses = 10;
            users[userId].grinchPass.expires = now + GRINCH_DURATION;
            users[userId].grinchPass.lastGrant = now;
            rewardText = `😈 ¡Pase del Grinch activado! Tienes *10 intentos de robo* sin cooldown durante las próximas 24 horas.`;
            rewardText += `\n\n💡 *Usa ${usedPrefix}robwaifu @usuario* antes de que expire.`;
        }
    }
    
    // --- 4. Guardar Cooldown y Datos ---
    users[userId].lastGift = now;
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    m.reply(responseText + rewardText);
};

handler.help = ['regalogacha', 'openpresent'];
handler.tags = ['gacha', 'economy'];
handler.command = ['regalogacha', 'openpresent'];
handler.group = true;

export default handler;
