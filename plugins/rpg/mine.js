// ============================================
// plugins/rpg/mine.js
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
    const cooldown = 3 * 60 * 1000; // 3 minutos
    user.lastMine = user.lastMine || 0;
    
    if (now - user.lastMine < cooldown) {
        const remaining = cooldown - (now - user.lastMine);
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        return m.reply(`⏰ Debes esperar *${minutes}:${seconds.toString().padStart(2, '0')}* para minar de nuevo.`);
    }

    // Verificar herramienta y durabilidad
    const pickaxeType = user.inventory.tools.pickaxe;
    const pickaxeData = RESOURCE_SYSTEM.TOOLS.PICKAXES[pickaxeType];
    
    if (!pickaxeData) {
        return m.reply(`❌ No tienes un pico. Compra uno en la tienda:\n» ${usedPrefix}shop`);
    }

    let durability = user.inventory.durability?.pickaxe || 100;
    if (durability <= 0) {
        return m.reply(`🛠️ Tu pico está roto. Repáralo en la tienda:\n» ${usedPrefix}shop repair`);
    }

    // Minar
    user.lastMine = now;
    
    // Reducir durabilidad
    durability -= 5 + Math.floor(Math.random() * 10);
    if (durability < 0) durability = 0;
    user.inventory.durability.pickaxe = durability;

    // Obtener recurso
    const resource = getRandomResource('MINING', pickaxeData.level);
    const amount = calculateResourceAmount(pickaxeData.level, pickaxeData.efficiency);
    
    // Agregar al inventario
    if (!user.inventory.resources[resource.id]) {
        user.inventory.resources[resource.id] = 0;
    }
    user.inventory.resources[resource.id] += amount;

    // Recompensa en monedas base
    const coinReward = Math.floor(resource.value * amount * 0.5);
    user.coin = (user.coin || 0) + coinReward;

    // Verificar misión diaria
    checkDailyMission(user, 'mine', amount);

    const result = `⛏️ *MINERÍA EXITOSA*\n
▸ Herramienta: ${pickaxeData.emoji} ${pickaxeData.name}
▸ Durabilidad restante: ${durability}%
▸ Recurso obtenido: ${resource.emoji} ${resource.name} x${amount}
▸ Valor: ¥${(resource.value * amount).toLocaleString()}
▸ Monedas ganadas: ¥${coinReward.toLocaleString()}

${durability <= 20 ? `⚠️ Tu pico está a punto de romperse!` : ''}`;

    await conn.reply(m.chat, result, m);
    await global.db.write();
};

function checkDailyMission(user, type, amount) {
    if (!user.inventory?.missions) return;
    
    const missions = user.inventory.missions.daily;
    const today = new Date().toDateString();
    
    if (missions.lastCompleted !== today) {
        // Reiniciar misiones diarias
        missions.completed = [];
        missions.lastCompleted = today;
    }
    
    // Misión de minería diaria
    if (!missions.completed.includes('mine_10')) {
        const mined = user.minedToday || 0;
        user.minedToday = mined + amount;
        
        if (user.minedToday >= 10) {
            missions.completed.push('mine_10');
            missions.streak = (missions.streak || 0) + 1;
            // Recompensa por completar misión
            user.coin += 500;
            user.inventory.resources['iron'] = (user.inventory.resources['iron'] || 0) + 5;
        }
    }
}

handler.help = ['mine', 'minar'];
handler.tags = ['rpg'];
handler.command = ['mine', 'minar'];
handler.group = true;
handler.reg = true

export default handler;