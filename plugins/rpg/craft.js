// ============================================
// plugins/rpg/craft.js (CON SISTEMA DE REPARACIÓN)
// ============================================
import { RESOURCE_SYSTEM } from '../../lib/rpg/resource-system.js';

const handler = async (m, { conn, usedPrefix, args }) => {
    if (!global.db.data.chats[m.chat].economy && m.isGroup) {
        return m.reply(`🚫 *Economía desactivada*\n\nUn *administrador* puede activarla con:\n» *${usedPrefix}economy on*`);
    }

    const user = global.db.data.users[m.sender];
    const itemName = args[0]?.toLowerCase();
    const amount = parseInt(args[1]) || 1;

    // Inicializar usuario
    if (!user.inventory) {
        user.inventory = {
            resources: {},
            tools: { pickaxe: 'basic', axe: 'basic', fishingRod: 'basic' },
            durability: { pickaxe: 100, axe: 100, fishingRod: 100 },
            crafted: {},
            consumables: {}
        };
    }

    // SISTEMA DE REPARACIÓN
    if (itemName === 'reparar' || itemName === 'repair') {
        const toolType = args[1]?.toLowerCase(); // pico, hacha, caña
        const repairMethod = args[2]?.toLowerCase(); // materiales, kit, monedas
        const materialName = args[3]?.toLowerCase();
        const materialAmount = parseInt(args[4]) || 1;

        if (!toolType) {
            let text = `🔧 *SISTEMA DE REPARACIÓN*\n\n`;
            
            text += `🛠️ *MÉTODOS DE REPARACIÓN:*\n\n`;
            text += `1. *Con Materiales:*\n`;
            text += `   ${usedPrefix}craft reparar [pico/hacha/caña] materiales [material] [cantidad]\n`;
            text += `   Ej: ${usedPrefix}craft reparar pico materiales iron 2\n\n`;
            
            text += `2. *Con Kits de Reparación:*\n`;
            text += `   ${usedPrefix}craft reparar [pico/hacha/caña] kit [nombre_kit]\n`;
            text += `   Ej: ${usedPrefix}craft reparar hacha kit repair_kit_advanced\n\n`;
            
            text += `3. *Con Monedas (Shop):*\n`;
            text += `   Usa ${usedPrefix}shop repair\n\n`;
            
            text += `📊 *TUS HERRAMIENTAS:*\n`;
            const tools = [
                { type: 'pickaxe', name: '⛏️ Pico', id: user.inventory.tools.pickaxe },
                { type: 'axe', name: '🪓 Hacha', id: user.inventory.tools.axe },
                { type: 'fishingRod', name: '🎣 Caña', id: user.inventory.tools.fishingRod }
            ];
            
            tools.forEach(tool => {
                const durability = user.inventory.durability[tool.type];
                const toolData = RESOURCE_SYSTEM.TOOLS[
                    tool.type === 'pickaxe' ? 'PICKAXES' : 
                    tool.type === 'axe' ? 'AXES' : 'FISHING_RODS'
                ][tool.id];
                
                if (toolData) {
                    const maxDurability = toolData.durability;
                    const percentage = Math.floor((durability / maxDurability) * 100);
                    text += `▸ ${toolData.emoji} ${toolData.name}: ${durability}/${maxDurability} (${percentage}%)\n`;
                }
            });
            
            await conn.reply(m.chat, text, m);
            return;
        }

        // REPARAR CON MATERIALES
        if (repairMethod === 'materiales' || repairMethod === 'materials') {
            if (!materialName) {
                return m.reply(`❌ Especifica el material.\nUso: ${usedPrefix}craft reparar ${toolType} materiales [material] [cantidad]`);
            }

            const toolTypes = {
                'pico': 'pickaxe',
                'pickaxe': 'pickaxe',
                'hacha': 'axe', 
                'axe': 'axe',
                'caña': 'fishingRod',
                'fishingrod': 'fishingRod'
            };

            const actualToolType = toolTypes[toolType];
            if (!actualToolType) {
                return m.reply(`❌ Herramienta inválida. Usa: pico, hacha o caña`);
            }

            const toolId = user.inventory.tools[actualToolType];
            const currentDurability = user.inventory.durability[actualToolType];
            const toolData = RESOURCE_SYSTEM.TOOLS[
                actualToolType === 'pickaxe' ? 'PICKAXES' : 
                actualToolType === 'axe' ? 'AXES' : 'FISHING_RODS'
            ][toolId];

            if (!toolData) {
                return m.reply(`❌ No tienes ${toolType} equipado`);
            }

            if (currentDurability >= toolData.durability) {
                return m.reply(`✅ Tu ${toolData.name} ya está al máximo de durabilidad`);
            }

            // Verificar material
            const hasMaterial = user.inventory.resources?.[materialName] || 0;
            if (hasMaterial < materialAmount) {
                return m.reply(`❌ No tienes suficiente ${materialName}. Necesitas: ${materialAmount}, Tienes: ${hasMaterial}`);
            }

            // Calcular reparación
            const repairPercentage = RESOURCE_SYSTEM.REPAIR_SYSTEM.REPAIR_PERCENTAGES[materialName] || 5;
            const repairAmount = repairPercentage * materialAmount;
            const newDurability = Math.min(currentDurability + repairAmount, toolData.durability);
            const actualRepair = newDurability - currentDurability;

            // Consumir material
            user.inventory.resources[materialName] -= materialAmount;
            if (user.inventory.resources[materialName] <= 0) {
                delete user.inventory.resources[materialName];
            }

            // Aplicar reparación
            user.inventory.durability[actualToolType] = newDurability;

            await m.reply(`🔧 ¡Reparación exitosa!\n\n${toolData.emoji} *${toolData.name}*\nReparado: +${actualRepair.toFixed(1)}%\nNueva durabilidad: ${newDurability.toFixed(1)}/${toolData.durability}\nMaterial usado: ${materialAmount}x ${materialName}`);
            await global.db.write();
            return;
        }

        // REPARAR CON KIT
        else if (repairMethod === 'kit') {
            const kitName = materialName;
            
            if (!kitName) {
                let text = `🧰 *KITS DE REPARACIÓN DISPONIBLES:*\n\n`;
                
                const repairKits = Object.entries(RESOURCE_SYSTEM.CRAFT_ITEMS.tools)
                    .filter(([id, item]) => item.category === 'repair');
                
                repairKits.forEach(([id, kit]) => {
                    const owned = user.inventory.crafted?.[id] || 0;
                    text += `▸ ${kit.emoji} *${kit.name}*\n`;
                    text += `   Efecto: ${kit.effect}\n`;
                    text += `   Disponibles: ${owned}\n`;
                    text += `   Usar: ${usedPrefix}craft reparar ${toolType} kit ${id}\n\n`;
                });
                
                await conn.reply(m.chat, text, m);
                return;
            }

            // Verificar kit
            const kitData = RESOURCE_SYSTEM.CRAFT_ITEMS.tools[kitName];
            if (!kitData || kitData.category !== 'repair') {
                return m.reply(`❌ Kit de reparación no encontrado. Usa ${usedPrefix}craft reparar ${toolType} kit para ver opciones`);
            }

            const ownedKits = user.inventory.crafted?.[kitName] || 0;
            if (ownedKits < 1) {
                return m.reply(`❌ No tienes ${kitData.name}. Necesitas craftearlo primero`);
            }

            const toolTypes = {
                'pico': 'pickaxe',
                'pickaxe': 'pickaxe',
                'hacha': 'axe', 
                'axe': 'axe',
                'caña': 'fishingRod',
                'fishingrod': 'fishingRod'
            };

            const actualToolType = toolTypes[toolType];
            if (!actualToolType) {
                return m.reply(`❌ Herramienta inválida. Usa: pico, hacha o caña`);
            }

            const toolId = user.inventory.tools[actualToolType];
            const currentDurability = user.inventory.durability[actualToolType];
            const toolData = RESOURCE_SYSTEM.TOOLS[
                actualToolType === 'pickaxe' ? 'PICKAXES' : 
                actualToolType === 'axe' ? 'AXES' : 'FISHING_RODS'
            ][toolId];

            if (!toolData) {
                return m.reply(`❌ No tienes ${toolType} equipado`);
            }

            // Aplicar reparación del kit
            const repairValue = RESOURCE_SYSTEM.REPAIR_SYSTEM.KIT_REPAIR_VALUES[kitName] || 100;
            let newDurability = currentDurability + repairValue;
            
            // Para kit legendario
            if (kitName === 'repair_kit_legendary') {
                newDurability = Math.min(newDurability, toolData.durability + 50);
            } else {
                newDurability = Math.min(newDurability, toolData.durability);
            }
            
            const actualRepair = newDurability - currentDurability;

            // Consumir kit
            user.inventory.crafted[kitName] -= 1;
            if (user.inventory.crafted[kitName] <= 0) {
                delete user.inventory.crafted[kitName];
            }

            // Aplicar reparación
            user.inventory.durability[actualToolType] = newDurability;

            await m.reply(`🧰 ¡Reparación con kit exitosa!\n\n${toolData.emoji} *${toolData.name}*\nKit usado: ${kitData.emoji} ${kitData.name}\nReparado: +${actualRepair.toFixed(1)}%\nNueva durabilidad: ${newDurability.toFixed(1)}/${toolData.durability}\nEfecto: ${kitData.effect}`);
            await global.db.write();
            return;
        }
    }

    // LISTAR ITEMS CRAFTEABLES (si no hay argumentos)
    if (!itemName) {
        let text = `⚒️ *SISTEMA DE CRAFTEO Y REPARACIÓN*\n\n`;

        text += `📌 *COMANDOS:*\n`;
        text += `▸ ${usedPrefix}craft - Ver todo crafteable\n`;
        text += `▸ ${usedPrefix}craft [item] [cantidad] - Craftear item\n`;
        text += `▸ ${usedPrefix}craft reparar - Sistema de reparación\n`;
        text += `▸ ${usedPrefix}craft recursos - Ver todos los recursos\n\n`;

        // Kits de reparación
        text += `🔧 *KITS DE REPARACIÓN:*\n`;
        const repairKits = Object.entries(RESOURCE_SYSTEM.CRAFT_ITEMS.tools)
            .filter(([id, item]) => item.category === 'repair');
        
        if (repairKits.length > 0) {
            repairKits.forEach(([id, kit]) => {
                const owned = user.inventory.crafted?.[id] || 0;
                text += `▸ ${kit.emoji} *${kit.name}* ${owned > 0 ? `(${owned})` : ''}\n`;
                for (const [mat, req] of Object.entries(kit.materials)) {
                    const has = user.inventory.resources?.[mat] || 0;
                    text += `   ${mat}: ${has}/${req} ${has >= req ? '✅' : '❌'}\n`;
                }
                text += `   Efecto: ${kit.effect}\n\n`;
            });
        }

        // Pociones
        text += `🧪 *POCIONES:*\n`;
        const potions = Object.entries(RESOURCE_SYSTEM.CRAFT_ITEMS.consumables || {});
        if (potions.length > 0) {
            potions.forEach(([id, potion]) => {
                const owned = user.inventory.consumables?.[id] || 0;
                text += `▸ ${potion.emoji} *${potion.name}* ${owned > 0 ? `(${owned})` : ''}\n`;
                for (const [mat, req] of Object.entries(potion.materials)) {
                    const has = user.inventory.resources?.[mat] || 0;
                    text += `   ${mat}: ${has}/${req} ${has >= req ? '✅' : '❌'}\n`;
                }
                text += `   Efecto: ${potion.effect}\n\n`;
            });
        }

        // Armas
        text += `🗡️ *ARMAS:*\n`;
        for (const [id, item] of Object.entries(RESOURCE_SYSTEM.CRAFT_ITEMS.weapons)) {
            const owned = user.inventory.crafted?.[id] || 0;
            text += `▸ ${item.emoji} ${item.name} ${owned > 0 ? `(${owned})` : ''}\n`;
            for (const [mat, req] of Object.entries(item.materials)) {
                const has = user.inventory.resources?.[mat] || 0;
                text += `   ${mat}: ${has}/${req} ${has >= req ? '✅' : '❌'}\n`;
            }
            text += `\n`;
        }

        await conn.reply(m.chat, text, m);
        return;
    }

    // MOSTRAR RECURSOS
    if (itemName === 'recursos' || itemName === 'resources') {
        let text = `📦 *TODOS LOS RECURSOS DISPONIBLES*\n\n`;

        const categories = ['MINING', 'WOODCUTTING', 'FISHING', 'SPECIAL'];
        categories.forEach(category => {
            const resources = RESOURCE_SYSTEM.RESOURCES[category];
            if (resources) {
                text += `*${category}:*\n`;
                Object.entries(resources).forEach(([id, resource]) => {
                    const owned = user.inventory.resources?.[id] || 0;
                    text += `▸ ${resource.emoji} ${resource.name}: ${owned} (Valor: ¥${resource.value})\n`;
                });
                text += `\n`;
            }
        });

        text += `💡 *Consejo:* Usa ${usedPrefix}mine, ${usedPrefix}chop, ${usedPrefix}fish para conseguir recursos`;
        await conn.reply(m.chat, text, m);
        return;
    }

    // CRAFTEAR ITEM ESPECÍFICO
    let itemData = null;
    let category = '';

    // Buscar en todas las categorías
    for (const [cat, items] of Object.entries(RESOURCE_SYSTEM.CRAFT_ITEMS)) {
        if (items[itemName]) {
            itemData = items[itemName];
            category = cat;
            break;
        }
    }

    if (!itemData) {
        return m.reply(`❌ Item no encontrado. Usa *${usedPrefix}craft* para ver la lista.`);
    }

    // Verificar materiales
    for (const [material, required] of Object.entries(itemData.materials)) {
        const has = user.inventory?.resources?.[material] || 0;
        if (has < required * amount) {
            return m.reply(`❌ Necesitas ${required * amount} ${material}, solo tienes ${has}`);
        }
    }

    // Consumir materiales
    for (const [material, required] of Object.entries(itemData.materials)) {
        user.inventory.resources[material] -= required * amount;
        if (user.inventory.resources[material] <= 0) {
            delete user.inventory.resources[material];
        }
    }

    // Agregar item crafteado
    if (itemData.category === 'consumable') {
        if (!user.inventory.consumables) user.inventory.consumables = {};
        user.inventory.consumables[itemName] = (user.inventory.consumables[itemName] || 0) + amount;
    } else {
        if (!user.inventory.crafted) user.inventory.crafted = {};
        user.inventory.crafted[itemName] = (user.inventory.crafted[itemName] || 0) + amount;
    }

    // Bonificación para owners
    if (global.owner && global.owner.includes(m.sender.split('@')[0]) && amount === 1) {
        if (itemData.category === 'consumable') {
            user.inventory.consumables[itemName] += 1;
        } else {
            user.inventory.crafted[itemName] += 1;
        }
    }

    await m.reply(`🎉 Has crafteado ${amount}x ${itemData.emoji} *${itemData.name}*!\n${itemData.effect ? `Efecto: ${itemData.effect}\n` : ''}Usa *${usedPrefix}inventory* para ver tus objetos.`);
    await global.db.write();
};

handler.help = ['craft', 'craftear'];
handler.tags = ['rpg'];
handler.command = ['craft', 'craftear'];
handler.group = true;

export default handler;