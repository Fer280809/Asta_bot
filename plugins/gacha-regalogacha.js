// ============================================
// plugins/gacha-regalogacha.js
// ============================================
import fs from 'fs';
import path from 'path';

// --- CONSTANTES ACTUALIZADAS ---
// AHORA ESTE ES EL COSTO EN LA MONEDA PRINCIPAL DEL BOT (global.db.data.users.coin)
const COST = 500; 
const COOLDOWN_GIFT = 86400000; // Nuevo cooldown: 24 horas
const GRINCH_DURATION = 86400000; // 24 horas (Duración del Pase)

const handler = async (m, { conn, usedPrefix, user, chat }) => {
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

    // Inicializar usuario si es nuevo en el sistema gacha (esto se mantiene)
    if (!users[userId]) {
        users[userId] = {
            harem: [],
            favorites: [],
            claimMessage: '✨ *¡Feliz Navidad!* {user} ha añadido a {character} a su *Colección de Adornos Festivos* (Harem). ¡Qué gran regalo!', 
            lastRoll: 0,
            votes: {},
            gachaCoins: 1000, // Se mantiene para el sistema interno de gacha
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
    
    const now = Date.now();
    
    // --- 1. Verificar Cooldown General (24 horas) ---
    if (users[userId].lastGift && (now - users[userId].lastGift) < COOLDOWN_GIFT) {
        const remainingHours = Math.ceil((COOLDOWN_GIFT - (now - users[userId].lastGift)) / 3600000);
        return m.reply(`⏰ *El Centro de Distribución está cerrado.* Debes esperar ${remainingHours} horas para abrir otro Regalo de Utilidad.`);
    }

    // 🔴 CAMBIO CLAVE: Obtener el balance real (coin)
    const currentRealBalance = user.coin || 0; 
    
    // --- 2. Verificar Costo (500 Monedas REALES) ---
    if (currentRealBalance < COST) {
        // 🔴 ALERTA DE DINERO INSUFICIENTE
        return m.reply(`❌ *¡Te falta dinero!* Necesitas *$${COST}* de tu balance principal para comprar este regalo. Actualmente tienes *$${currentRealBalance}*`);
    }

    // 🔴 CAMBIO CLAVE: Cobrar el costo del balance real
    user.coin -= COST; 
    let responseText = `🎁 *¡REGALO ABIERTO!* - Se descontaron *$${COST}* de tu balance principal. 🎄\n\n`;

    // --- 3. Seleccionar y Aplicar Premio (Probabilidades intactas) ---
    const rand = Math.random();
    let rewardText;

    if (rand < 0.40) { // 40% Monedas de Jengibre (400 a 4000)
        const amount = Math.floor(Math.random() * (4000 - 400 + 1)) + 400;
        
        // 🟢 PREMIO: Sumar a las GACHACOINS internas, NO al balance principal.
        users[userId].gachaCoins += amount; 
        
        rewardText = `💰 ¡Encontraste una bolsa grande! Recibes *${amount} Monedas de Jengibre (GachaCoins)*.`;

    } else if (rand < 0.70) { // 30% Adorno Aleatorio (Personaje)
        // Lógica de obtención de personaje (sin cambios relevantes)
        if (!fs.existsSync(dbPath)) {
            rewardText = "⚠️ No fue posible obtener un Adorno (Catálogo vacío). Se reembolsará el costo.";
            user.coin += COST; // Reembolso al balance principal
        } else {
            const characters = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            if (!Array.isArray(characters) || characters.length === 0) {
                 rewardText = "⚠️ No fue posible obtener un Adorno (Catálogo vacío). Se reembolsará el costo.";
                 user.coin += COST; // Reembolso al balance principal
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
    } else { // 30% Pase del Grinch
        // Lógica del Pase del Grinch (sin cambios relevantes)
        const COOLDOWN_GRINCH = 43200000; 

        if (users[userId].grinchPass.lastGrant && (now - users[userId].grinchPass.lastGrant) < COOLDOWN_GRINCH) {
             rewardText = "⚠️ Ya recibiste un Pase del Grinch recientemente (hace menos de 12 horas). Por esta vez, recibes un reembolso del 80% del costo.";
             user.coin += Math.floor(COST * 0.8); // Reembolso al balance principal
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
    
    // 🔴 CAMBIO CLAVE: El handler se encarga de guardar global.db.data
    // Aquí solo guardamos los datos específicos del sistema Gacha (usersPath)
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    
    m.reply(responseText + rewardText);
};

handler.help = ['regalogacha', 'openpresent'];
handler.tags = ['gacha', 'economy'];
handler.command = ['regalogacha', 'openpresent'];
handler.group = true;

// 🔴 ADICIÓN CLAVE: Añadir 'user' como argumento necesario para acceder a global.db.data.users
// Esto asegura que el handler principal pase los datos de la DB.
handler.limit = true 
// Si 'limit' se usa para el sistema de economía, podrías usar una etiqueta como 'economia: true'
// si tu handler.js no lo pasa automáticamente, pero en tu handler.js 'user' es pasado
// automáticamente en 'extra' si tiene la propiedad 'limit' o 'exp'.
// El handler.js que me mostraste ya pasa 'user' al plugin, ¡así que solo necesitamos incluirlo en los argumentos!

export default handler;
