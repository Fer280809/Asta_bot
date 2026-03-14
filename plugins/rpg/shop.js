// ============================================
// plugins/rpg/shop.js (VERSIÓN ULTRA SIMPLE)
// ============================================
import { RESOURCE_SYSTEM } from '../../lib/rpg/resource-system.js';

const handler = async (m, { conn, usedPrefix, args }) => {
    if (!global.db.data.chats[m.chat].economy && m.isGroup) {
        return m.reply(`🚫 *Economía desactivada*\n\nUn *administrador* puede activarla con:\n» *${usedPrefix}economy on*`);
    }

    const user = global.db.data.users[m.sender];
    const action = args[0]?.toLowerCase() || 'help';
    const param1 = args[1]?.toLowerCase();
    const param2 = args[2];

    // Inicializar usuario
    if (!user) {
        global.db.data.users[m.sender] = {
            coin: 1000,
            bank: 0,
            health: 100,
            inventory: {
                resources: {},
                tools: { pickaxe: 'basic', axe: 'basic', fishingRod: 'basic' },
                durability: { pickaxe: 100, axe: 100, fishingRod: 100 }
            }
        };
    }

    if (!user.inventory) {
        user.inventory = {
            resources: {},
            tools: { pickaxe: 'basic', axe: 'basic', fishingRod: 'basic' },
            durability: { pickaxe: 100, axe: 100, fishingRod: 100 }
        };
    }

    user.coin = user.coin || 0;
    user.bank = user.bank || 0;

    // --- AYUDA / MENÚ ---
    if (action === 'help' || action === 'menu') {
        let text = `🛒 *TIENDA RPG*\n\n`;
        text += `💰 *Saldo:* ¥${user.coin.toLocaleString()}\n\n`;
        
        text += `🛠️ *COMPRAR HERRAMIENTAS:*\n`;
        text += `» ${usedPrefix}shop buy pico iron\n`;
        text += `» ${usedPrefix}shop buy hacha gold\n`;
        text += `» ${usedPrefix}shop buy caña diamond\n\n`;
        
        text += `💰 *VENDER RECURSOS:*\n`;
        text += `» ${usedPrefix}shop sell stone 10\n`;
        text += `» ${usedPrefix}shop sell wood all\n`;
        text += `» ${usedPrefix}shop sell all\n\n`;
        
        text += `🔧 *REPARAR:*\n`;
        text += `» ${usedPrefix}shop repair pico\n`;
        text += `» ${usedPrefix}shop repair hacha\n`;
        text += `» ${usedPrefix}shop repair caña\n\n`;
        
        text += `📊 *INFORMACIÓN:*\n`;
        text += `» ${usedPrefix}shop tools\n`;
        text += `» ${usedPrefix}shop resources`;
        
        await conn.reply(m.chat, text, m);
        return;
    }

    // --- COMPRAR HERRAMIENTA ---
    if (action === 'buy' && param1) {
        let toolType = param1; // pico, hacha, caña
        let toolId = param2 || 'iron'; // basic, iron, gold, diamond, mythril
        
        // Convertir nombres simples
        const toolMap = {
            'pico': { data: RESOURCE_SYSTEM.TOOLS.PICKAXES, field: 'pickaxe' },
            'pick': { data: RESOURCE_SYSTEM.TOOLS.PICKAXES, field: 'pickaxe' },
            'hacha': { data: RESOURCE_SYSTEM.TOOLS.AXES, field: 'axe' },
            'axe': { data: RESOURCE_SYSTEM.TOOLS.AXES, field: 'axe' },
            'caña': { data: RESOURCE_SYSTEM.TOOLS.FISHING_RODS, field: 'fishingRod' },
            'rod': { data: RESOURCE_SYSTEM.TOOLS.FISHING_RODS, field: 'fishingRod' }
        };
        
        const toolInfo = toolMap[toolType];
        if (!toolInfo) {
            return m.reply(`❌ Herramienta no válida\nOpciones: pico, hacha, caña`);
        }
        
        const toolData = toolInfo.data[toolId];
        if (!toolData) {
            // Mostrar opciones disponibles
            const options = Object.keys(toolInfo.data).join(', ');
            return m.reply(`❌ Tipo no válido\nOpciones para ${toolType}: ${options}\nEjemplo: ${usedPrefix}shop buy ${toolType} iron`);
        }
        
        if (user.coin < toolData.price) {
            return m.reply(`💰 Necesitas ¥${toolData.price.toLocaleString()}\nTienes: ¥${user.coin.toLocaleString()}`);
        }
        
        // Comprar
        user.coin -= toolData.price;
        user.inventory.tools[toolInfo.field] = toolId;
        user.inventory.durability[toolInfo.field] = toolData.durability;
        
        await m.reply(`✅ Comprado: ${toolData.emoji} ${toolData.name}\n💰 -¥${toolData.price.toLocaleString()}\n💳 Saldo: ¥${user.coin.toLocaleString()}`);
        await global.db.write();
        return;
    }

    // --- VENDER RECURSOS ---
    if (action === 'sell' && param1) {
        const resourceName = param1;
        const amountParam = param2 || 'all';
        
        // VENDER TODO
        if (resourceName === 'all') {
            const resources = user.inventory?.resources || {};
            if (Object.keys(resources).length === 0) {
                return m.reply(`❌ No tienes recursos para vender`);
            }
            
            let totalEarned = 0;
            let itemsSold = [];
            
            for (const [id, qty] of Object.entries(resources)) {
                // Buscar valor
                let value = 0;
                let resourceData = null;
                
                for (const category of Object.values(RESOURCE_SYSTEM.RESOURCES)) {
                    if (category[id]) {
                        resourceData = category[id];
                        value = resourceData.value;
                        break;
                    }
                }
                
                if (value > 0) {
                    const itemValue = value * qty;
                    totalEarned += itemValue;
                    itemsSold.push(`${resourceData.emoji} ${resourceData.name}: ${qty} → ¥${itemValue.toLocaleString()}`);
                }
            }
            
            if (totalEarned === 0) {
                return m.reply(`❌ No se pueden vender tus recursos`);
            }
            
            // Track diario
            const totalSold = Object.values(resources).reduce((a, b) => a + b, 0);
            user.soldToday = (user.soldToday || 0) + totalSold;
            
            // Aplicar
            user.coin += totalEarned;
            user.inventory.resources = {};
            
            let reply = `💰 *VENDIDO TODO*\n\n`;
            itemsSold.forEach(item => reply += `${item}\n`);
            reply += `\n💵 Total: +¥${totalEarned.toLocaleString()}\n💳 Saldo: ¥${user.coin.toLocaleString()}`;
            
            await m.reply(reply);
            await global.db.write();
            return;
        }
        
        // VENDER RECURSO ESPECÍFICO
        const currentAmount = user.inventory.resources?.[resourceName] || 0;
        
        if (currentAmount === 0) {
            // Mostrar lo que tiene
            const resources = user.inventory.resources || {};
            if (Object.keys(resources).length === 0) {
                return m.reply(`❌ No tienes recursos\n💡 Usa: ${usedPrefix}mine, ${usedPrefix}chop, ${usedPrefix}fish`);
            }
            
            let resourceList = `📦 *TUS RECURSOS:*\n\n`;
            Object.entries(resources).forEach(([id, qty]) => {
                let resourceData = null;
                for (const category of Object.values(RESOURCE_SYSTEM.RESOURCES)) {
                    if (category[id]) {
                        resourceData = category[id];
                        break;
                    }
                }
                if (resourceData) {
                    resourceList += `${resourceData.emoji} ${resourceData.name}: ${qty}\n`;
                }
            });
            
            resourceList += `\n💡 Vender: ${usedPrefix}shop sell [nombre] [cantidad/all]`;
            return m.reply(resourceList);
        }
        
        // Determinar cantidad
        let sellAmount = 0;
        if (amountParam === 'all') {
            sellAmount = currentAmount;
        } else {
            sellAmount = parseInt(amountParam) || 1;
        }
        
        if (sellAmount > currentAmount) {
            return m.reply(`❌ Solo tienes ${currentAmount} ${resourceName}`);
        }
        
        if (sellAmount < 1) {
            return m.reply(`❌ Cantidad inválida`);
        }
        
        // Buscar valor
        let value = 0;
        let resourceData = null;
        for (const category of Object.values(RESOURCE_SYSTEM.RESOURCES)) {
            if (category[resourceName]) {
                resourceData = category[resourceName];
                value = resourceData.value;
                break;
            }
        }
        
        if (value === 0) {
            return m.reply(`❌ No se puede vender "${resourceName}"`);
        }
        
        const totalValue = value * sellAmount;
        
        // Track diario
        user.soldToday = (user.soldToday || 0) + sellAmount;
        
        // Vender
        user.coin += totalValue;
        user.inventory.resources[resourceName] -= sellAmount;
        
        if (user.inventory.resources[resourceName] <= 0) {
            delete user.inventory.resources[resourceName];
        }
        
        await m.reply(`💰 Vendido: ${sellAmount}x ${resourceData.emoji} ${resourceData.name}\n💵 +¥${totalValue.toLocaleString()}\n💳 Saldo: ¥${user.coin.toLocaleString()}`);
        await global.db.write();
        return;
    }

    // --- REPARAR ---
    if (action === 'repair' && param1) {
        const toolType = param1;
        
        const toolMap = {
            'pico': { field: 'pickaxe', name: '⛏️ Pico' },
            'pick': { field: 'pickaxe', name: '⛏️ Pico' },
            'hacha': { field: 'axe', name: '🪓 Hacha' },
            'axe': { field: 'axe', name: '🪓 Hacha' },
            'caña': { field: 'fishingRod', name: '🎣 Caña' },
            'rod': { field: 'fishingRod', name: '🎣 Caña' }
        };
        
        const toolInfo = toolMap[toolType];
        if (!toolInfo) {
            return m.reply(`❌ Herramienta no válida\nOpciones: pico, hacha, caña`);
        }
        
        const durability = user.inventory.durability[toolInfo.field] || 100;
        const repairCost = Math.floor((100 - durability) * 10);
        
        if (durability >= 100) {
            return m.reply(`✅ ${toolInfo.name} ya está al 100%`);
        }
        
        if (user.coin < repairCost) {
            return m.reply(`💰 Necesitas ¥${repairCost.toLocaleString()}\nTienes: ¥${user.coin.toLocaleString()}`);
        }
        
        user.coin -= repairCost;
        user.inventory.durability[toolInfo.field] = 100;
        
        await m.reply(`🔧 ${toolInfo.name} reparado\n💰 -¥${repairCost.toLocaleString()}\n💳 Saldo: ¥${user.coin.toLocaleString()}`);
        await global.db.write();
        return;
    }

    // --- VER HERRAMIENTAS ---
    if (action === 'tools') {
        let text = `🛠️ *TUS HERRAMIENTAS*\n\n`;
        
        const tools = [
            { type: 'pickaxe', name: '⛏️ Pico', data: RESOURCE_SYSTEM.TOOLS.PICKAXES },
            { type: 'axe', name: '🪓 Hacha', data: RESOURCE_SYSTEM.TOOLS.AXES },
            { type: 'fishingRod', name: '🎣 Caña', data: RESOURCE_SYSTEM.TOOLS.FISHING_RODS }
        ];
        
        tools.forEach(tool => {
            const toolId = user.inventory.tools[tool.type];
            const toolData = tool.data[toolId];
            const durability = user.inventory.durability[tool.type] || 100;
            
            if (toolData) {
                const maxDur = toolData.durability;
                const percent = Math.floor((durability / maxDur) * 100);
                
                text += `${toolData.emoji} *${toolData.name}*\n`;
                text += `▸ Nivel: ${toolData.level}\n`;
                text += `▸ Eficiencia: ${toolData.efficiency}x\n`;
                text += `▸ Durabilidad: ${durability}/${maxDur} (${percent}%)\n`;
                
                // Mostrar siguiente mejora
                const nextTool = Object.entries(tool.data).find(([id, data]) => data.level === toolData.level + 1);
                if (nextTool) {
                    const [nextId, nextData] = nextTool;
                    text += `▸ Siguiente: ${nextData.emoji} ${nextData.name} - ¥${nextData.price.toLocaleString()}\n`;
                }
                
                text += `\n`;
            }
        });
        
        await conn.reply(m.chat, text, m);
        return;
    }

    // --- VER RECURSOS DISPONIBLES ---
    if (action === 'resources') {
        let text = `📦 *RECURSOS DISPONIBLES*\n\n`;
        
        // Minería
        text += `⛏️ *MINERÍA:*\n`;
        Object.entries(RESOURCE_SYSTEM.RESOURCES.MINING).forEach(([id, resource]) => {
            const owned = user.inventory.resources?.[id] || 0;
            text += `${resource.emoji} *${resource.name}*: ¥${resource.value} c/u (Tienes: ${owned})\n`;
        });
        
        text += `\n🪵 *MADERA:*\n`;
        Object.entries(RESOURCE_SYSTEM.RESOURCES.WOODCUTTING).forEach(([id, resource]) => {
            const owned = user.inventory.resources?.[id] || 0;
            text += `${resource.emoji} *${resource.name}*: ¥${resource.value} c/u (Tienes: ${owned})\n`;
        });
        
        text += `\n🎣 *PESCA:*\n`;
        Object.entries(RESOURCE_SYSTEM.RESOURCES.FISHING).forEach(([id, resource]) => {
            const owned = user.inventory.resources?.[id] || 0;
            text += `${resource.emoji} *${resource.name}*: ¥${resource.value} c/u (Tienes: ${owned})\n`;
        });
        
        text += `\n💡 *Comandos:*\n`;
        text += `▸ Vender: ${usedPrefix}shop sell [nombre] [cantidad/all]\n`;
        text += `▸ Vender todo: ${usedPrefix}shop sell all`;
        
        await conn.reply(m.chat, text, m);
        return;
    }

    // --- COMPRAR RECURSOS (OPCIONAL) ---
    if (action === 'buyresource' && param1) {
        const resourceName = param1;
        const amount = parseInt(param2) || 1;
        
        // Precios de compra (más caros)
        const buyPrices = {
            'stone': 30,
            'wood': 25,
            'fish': 40,
            'iron': 100,
            'gold': 200,
            'diamond': 500,
            'emerald': 800,
            'mythril': 1500
        };
        
        const price = buyPrices[resourceName];
        if (!price) {
            const options = Object.keys(buyPrices).join(', ');
            return m.reply(`❌ No se puede comprar\nOpciones: ${options}`);
        }
        
        const totalCost = price * amount;
        
        if (user.coin < totalCost) {
            return m.reply(`💰 Necesitas ¥${totalCost.toLocaleString()}\nTienes: ¥${user.coin.toLocaleString()}`);
        }
        
        user.coin -= totalCost;
        user.inventory.resources[resourceName] = (user.inventory.resources[resourceName] || 0) + amount;
        
        await m.reply(`📦 Comprado: ${amount}x ${resourceName}\n💰 -¥${totalCost.toLocaleString()}\n💳 Saldo: ¥${user.coin.toLocaleString()}`);
        await global.db.write();
        return;
    }

    // Si no reconoce el comando, mostrar ayuda
    return handler(m, { conn, usedPrefix, args: ['help'] });
};

handler.help = ['shop'];
handler.tags = ['rpg'];
handler.command = ['shop', 'tienda'];
handler.group = true;
handler.reg = true

export default handler;