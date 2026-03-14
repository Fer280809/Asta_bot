// ============================================
// plugins/rpg/fishing.js
// ============================================
import { RESOURCE_SYSTEM, getRandomResource, calculateResourceAmount } from '../../lib/rpg/resource-system.js';

const handler = async (m, { conn, usedPrefix, command }) => {
    if (!global.db.data.chats[m.chat].economy && m.isGroup) {
        return m.reply(`🚫 *Economía desactivada*\n\nUn *administrador* puede activarla con:\n» *${usedPrefix}economy on*`);
    }

    const user = global.db.data.users[m.sender];
    
    // Inicializar inventario
    if (!user.inventory) {
        user.inventory = {
            resources: {},
            tools: { pickaxe: 'basic', axe: 'basic', fishingRod: 'basic' },
            durability: { pickaxe: 100, axe: 100, fishingRod: 100 }
        };
    }

    // Verificar cooldown
    const now = Date.now();
    const cooldown = 4 * 60 * 1000; // 4 minutos
    user.lastFish = user.lastFish || 0;
    
    if (now - user.lastFish < cooldown) {
        const remaining = cooldown - (now - user.lastFish);
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        return m.reply(`⏰ Debes esperar *${minutes}:${seconds.toString().padStart(2, '0')}* para pescar de nuevo.`);
    }

    // Verificar caña
    const rodType = user.inventory.tools.fishingRod;
    const rodData = RESOURCE_SYSTEM.TOOLS.FISHING_RODS[rodType];
    
    if (!rodData) {
        return m.reply(`❌ No tienes una caña. Compra una en la tienda:\n» ${usedPrefix}shop`);
    }

    let durability = user.inventory.durability?.fishingRod || 100;
    if (durability <= 0) {
        return m.reply(`🛠️ Tu caña está rota. Repárala en la tienda:\n» ${usedPrefix}shop repair`);
    }

    // Pescar
    user.lastFish = now;
    durability -= 3 + Math.floor(Math.random() * 6);
    if (durability < 0) durability = 0;
    user.inventory.durability.fishingRod = durability;

    // Obtener recurso
    const resource = getRandomResource('FISHING', rodData.level);
    const amount = calculateResourceAmount(rodData.level, rodData.efficiency);
    
    if (!user.inventory.resources[resource.id]) {
        user.inventory.resources[resource.id] = 0;
    }
    user.inventory.resources[resource.id] += amount;

    // Recompensa especial para dueños
    let bonus = 0;
    let extraAmount = 0;
    if (global.owner && global.owner.includes(m.sender)) {
        bonus = Math.floor(resource.value * 2);
        extraAmount = amount;
    }
    if (global.fernando && global.fernando.includes(m.sender)) {
        bonus = Math.floor(resource.value * 3);
        extraAmount = amount * 2;
    }

    const coinReward = Math.floor(resource.value * (amount + extraAmount) * 0.7) + bonus;
    user.coin = (user.coin || 0) + coinReward;

    // Verificar misión diaria
    checkDailyMission(user, 'fish', amount + extraAmount);

    const result = `🎣 *PESCA EXITOSA*\n
▸ Herramienta: ${rodData.emoji} ${rodData.name}
▸ Durabilidad restante: ${durability}%
▸ Recurso obtenido: ${resource.emoji} ${resource.name} x${amount + extraAmount}
▸ Valor: ¥${(resource.value * (amount + extraAmount)).toLocaleString()}
▸ Monedas ganadas: ¥${coinReward.toLocaleString()}
${bonus > 0 ? `✨ *Bono especial:* +¥${bonus.toLocaleString()}` : ''}`;

    await conn.reply(m.chat, result, m);
    await global.db.write();
};

function checkDailyMission(user, type, amount) {
    if (!user.inventory?.missions) return;
    
    const missions = user.inventory.missions.daily;
    const today = new Date().toDateString();
    
    if (missions.lastCompleted !== today) {
        missions.completed = [];
        missions.lastCompleted = today;
    }
    
    if (!missions.completed.includes('fish_8')) {
        const fished = user.fishedToday || 0;
        user.fishedToday = fished + amount;
        
        if (user.fishedToday >= 8) {
            missions.completed.push('fish_8');
            missions.streak = (missions.streak || 0) + 1;
            user.coin += 400;
            user.inventory.resources['salmon'] = (user.inventory.resources['salmon'] || 0) + 8;
        }
    }
}

handler.help = ['fish', 'pescar'];
handler.tags = ['rpg'];
handler.command = ['fish', 'pescar'];
handler.group = true;
handler.reg = true

export default handler;