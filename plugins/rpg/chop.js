// ============================================
// plugins/rpg/chop.js
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
    const cooldown = 2 * 60 * 1000; // 2 minutos
    user.lastChop = user.lastChop || 0;
    
    if (now - user.lastChop < cooldown) {
        const remaining = cooldown - (now - user.lastChop);
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        return m.reply(`⏰ Debes esperar *${minutes}:${seconds.toString().padStart(2, '0')}* para talar de nuevo.`);
    }

    // Verificar herramienta
    const axeType = user.inventory.tools.axe;
    const axeData = RESOURCE_SYSTEM.TOOLS.AXES[axeType];
    
    if (!axeData) {
        return m.reply(`❌ No tienes un hacha. Compra una en la tienda:\n» ${usedPrefix}shop`);
    }

    let durability = user.inventory.durability?.axe || 100;
    if (durability <= 0) {
        return m.reply(`🛠️ Tu hacha está rota. Repárala en la tienda:\n» ${usedPrefix}shop repair`);
    }

    // Talar
    user.lastChop = now;
    durability -= 4 + Math.floor(Math.random() * 8);
    if (durability < 0) durability = 0;
    user.inventory.durability.axe = durability;

    // Obtener recurso
    const resource = getRandomResource('WOODCUTTING', axeData.level);
    const amount = calculateResourceAmount(axeData.level, axeData.efficiency);
    
    if (!user.inventory.resources[resource.id]) {
        user.inventory.resources[resource.id] = 0;
    }
    user.inventory.resources[resource.id] += amount;

    // Recompensa en monedas
    const coinReward = Math.floor(resource.value * amount * 0.6);
    user.coin = (user.coin || 0) + coinReward;

    // Verificar misión diaria
    checkDailyMission(user, 'chop', amount);

    const result = `🪓 *TALA EXITOSA*\n
▸ Herramienta: ${axeData.emoji} ${axeData.name}
▸ Durabilidad restante: ${durability}%
▸ Recurso obtenido: ${resource.emoji} ${resource.name} x${amount}
▸ Valor: ¥${(resource.value * amount).toLocaleString()}
▸ Monedas ganadas: ¥${coinReward.toLocaleString()}`;

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
    
    if (!missions.completed.includes('chop_15')) {
        const chopped = user.choppedToday || 0;
        user.choppedToday = chopped + amount;
        
        if (user.choppedToday >= 15) {
            missions.completed.push('chop_15');
            missions.streak = (missions.streak || 0) + 1;
            user.coin += 300;
            user.inventory.resources['oak'] = (user.inventory.resources['oak'] || 0) + 10;
        }
    }
}

handler.help = ['chop', 'talar'];
handler.tags = ['rpg'];
handler.command = ['chop', 'talar'];
handler.group = true;
handler.reg = true
-
export default handler;