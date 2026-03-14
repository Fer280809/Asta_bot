// ============================================
// lib/rpg/resource-system.js (VERSIÓN MEJORADA)
// ============================================
export const RESOURCE_SYSTEM = {
    // Recursos disponibles
    RESOURCES: {
        MINING: {
            stone: { name: 'Piedra', value: 5, rarity: 'common', emoji: '🪨', category: 'mining' },
            iron: { name: 'Hierro', value: 20, rarity: 'uncommon', emoji: '⚙️', category: 'mining' },
            copper: { name: 'Cobre', value: 15, rarity: 'uncommon', emoji: '🟠', category: 'mining' },
            silver: { name: 'Plata', value: 35, rarity: 'rare', emoji: '⚪', category: 'mining' },
            gold: { name: 'Oro', value: 50, rarity: 'rare', emoji: '🟡', category: 'mining' },
            diamond: { name: 'Diamante', value: 150, rarity: 'epic', emoji: '💎', category: 'mining' },
            emerald: { name: 'Esmeralda', value: 300, rarity: 'legendary', emoji: '💚', category: 'mining' },
            ruby: { name: 'Rubí', value: 400, rarity: 'legendary', emoji: '❤️', category: 'mining' },
            sapphire: { name: 'Zafiro', value: 350, rarity: 'legendary', emoji: '🔷', category: 'mining' },
            mythril: { name: 'Mitril', value: 500, rarity: 'mythic', emoji: '✨', category: 'mining' },
            obsidian: { name: 'Obsidiana', value: 200, rarity: 'epic', emoji: '🖤', category: 'mining' },
            coal: { name: 'Carbón', value: 8, rarity: 'common', emoji: '🪨⚫', category: 'mining' },
            amethyst: { name: 'Amatista', value: 180, rarity: 'epic', emoji: '💜', category: 'mining' },
            topaz: { name: 'Topacio', value: 120, rarity: 'rare', emoji: '🟨', category: 'mining' }
        },
        WOODCUTTING: {
            wood: { name: 'Madera', value: 3, rarity: 'common', emoji: '🪵', category: 'wood' },
            oak: { name: 'Roble', value: 10, rarity: 'uncommon', emoji: '🌳', category: 'wood' },
            pine: { name: 'Pino', value: 8, rarity: 'common', emoji: '🌲', category: 'wood' },
            birch: { name: 'Abedul', value: 12, rarity: 'uncommon', emoji: '🌿', category: 'wood' },
            maple: { name: 'Arce', value: 25, rarity: 'rare', emoji: '🍁', category: 'wood' },
            mahogany: { name: 'Caoba', value: 40, rarity: 'rare', emoji: '🪵🔴', category: 'wood' },
            ebony: { name: 'Ébano', value: 60, rarity: 'epic', emoji: '⚫', category: 'wood' },
            willow: { name: 'Sauce', value: 18, rarity: 'uncommon', emoji: '🌱', category: 'wood' },
            magic: { name: 'Madera Mágica', value: 120, rarity: 'legendary', emoji: '✨', category: 'wood' },
            ancient: { name: 'Madera Ancestral', value: 200, rarity: 'mythic', emoji: '🌳✨', category: 'wood' }
        },
        FISHING: {
            fish: { name: 'Pescado', value: 8, rarity: 'common', emoji: '🐟', category: 'fishing' },
            salmon: { name: 'Salmón', value: 25, rarity: 'uncommon', emoji: '🐠', category: 'fishing' },
            tuna: { name: 'Atún', value: 45, rarity: 'rare', emoji: '🐋', category: 'fishing' },
            cod: { name: 'Bacalao', value: 20, rarity: 'common', emoji: '🐟❄️', category: 'fishing' },
            bass: { name: 'Perca', value: 30, rarity: 'uncommon', emoji: '🐟🔷', category: 'fishing' },
            trout: { name: 'Trucha', value: 35, rarity: 'uncommon', emoji: '🐟🌈', category: 'fishing' },
            lobster: { name: 'Langosta', value: 60, rarity: 'rare', emoji: '🦞', category: 'fishing' },
            crab: { name: 'Cangrejo', value: 40, rarity: 'rare', emoji: '🦀', category: 'fishing' },
            shark: { name: 'Tiburón', value: 100, rarity: 'epic', emoji: '🦈', category: 'fishing' },
            dolphin: { name: 'Delfín', value: 80, rarity: 'epic', emoji: '🐬', category: 'fishing' },
            whale: { name: 'Ballena', value: 150, rarity: 'legendary', emoji: '🐋', category: 'fishing' },
            dragon: { name: 'Pez Dragón', value: 250, rarity: 'legendary', emoji: '🐉', category: 'fishing' },
            kraken: { name: 'Kraken', value: 300, rarity: 'mythic', emoji: '🐙', category: 'fishing' },
            goldfish: { name: 'Pez Dorado', value: 500, rarity: 'mythic', emoji: '🐠🌟', category: 'fishing' }
        },
        SPECIAL: {
            string: { name: 'Cuerda', value: 2, rarity: 'common', emoji: '🧵', category: 'special' },
            leather: { name: 'Cuero', value: 5, rarity: 'common', emoji: '🐄', category: 'special' },
            cloth: { name: 'Tela', value: 3, rarity: 'common', emoji: '👕', category: 'special' },
            thread: { name: 'Hilo', value: 1, rarity: 'common', emoji: '🧶', category: 'special' },
            glue: { name: 'Pegamento', value: 8, rarity: 'uncommon', emoji: '🫧', category: 'special' },
            oil: { name: 'Aceite', value: 12, rarity: 'uncommon', emoji: '🛢️', category: 'special' },
            crystal: { name: 'Cristal', value: 80, rarity: 'rare', emoji: '🔮', category: 'special' },
            essence: { name: 'Esencia Mágica', value: 100, rarity: 'epic', emoji: '💫', category: 'special' }
        }
    },

    // Herramientas
    TOOLS: {
        PICKAXES: {
            basic: { name: 'Pico Básico', level: 1, price: 500, efficiency: 1.0, durability: 50, emoji: '⛏️', repairMaterials: { stone: 5, wood: 3 } },
            iron: { name: 'Pico de Hierro', level: 2, price: 2000, efficiency: 1.5, durability: 100, emoji: '⛏️⚙️', repairMaterials: { iron: 3, stone: 10 } },
            gold: { name: 'Pico de Oro', level: 3, price: 5000, efficiency: 2.0, durability: 150, emoji: '⛏️🟡', repairMaterials: { gold: 2, iron: 5 } },
            diamond: { name: 'Pico de Diamante', level: 4, price: 15000, efficiency: 3.0, durability: 300, emoji: '⛏️💎', repairMaterials: { diamond: 1, gold: 3 } },
            mythril: { name: 'Pico de Mitril', level: 5, price: 50000, efficiency: 5.0, durability: 500, emoji: '⛏️✨', repairMaterials: { mythril: 1, diamond: 2 } }
        },
        AXES: {
            basic: { name: 'Hacha Básica', level: 1, price: 300, efficiency: 1.0, durability: 40, emoji: '🪓', repairMaterials: { wood: 5, stone: 2 } },
            iron: { name: 'Hacha de Hierro', level: 2, price: 1500, efficiency: 1.4, durability: 80, emoji: '🪓⚙️', repairMaterials: { iron: 2, wood: 8 } },
            gold: { name: 'Hacha de Oro', level: 3, price: 4000, efficiency: 1.8, durability: 120, emoji: '🪓🟡', repairMaterials: { gold: 1, iron: 3 } },
            diamond: { name: 'Hacha de Diamante', level: 4, price: 12000, efficiency: 2.5, durability: 200, emoji: '🪓💎', repairMaterials: { diamond: 1, gold: 2 } },
            mythril: { name: 'Hacha de Mitril', level: 5, price: 35000, efficiency: 4.0, durability: 400, emoji: '🪓✨', repairMaterials: { mythril: 1, diamond: 1 } }
        },
        FISHING_RODS: {
            basic: { name: 'Caña Básica', level: 1, price: 400, efficiency: 1.0, durability: 60, emoji: '🎣', repairMaterials: { wood: 3, string: 2 } },
            iron: { name: 'Caña Mejorada', level: 2, price: 1800, efficiency: 1.3, durability: 90, emoji: '🎣⚙️', repairMaterials: { iron: 1, wood: 5, string: 3 } },
            gold: { name: 'Caña de Oro', level: 3, price: 4500, efficiency: 1.7, durability: 130, emoji: '🎣🟡', repairMaterials: { gold: 1, iron: 2, string: 5 } },
            diamond: { name: 'Caña de Diamante', level: 4, price: 14000, efficiency: 2.2, durability: 180, emoji: '🎣💎', repairMaterials: { diamond: 1, gold: 1, string: 8 } },
            enchanted: { name: 'Caña Encantada', level: 5, price: 40000, efficiency: 3.5, durability: 300, emoji: '🎣✨', repairMaterials: { crystal: 1, essence: 1, string: 10 } }
        }
    },

    // Items crafteables
    CRAFT_ITEMS: {
        weapons: {
            wooden_sword: { 
                name: 'Espada de Madera', 
                materials: { wood: 20 }, 
                value: 100, 
                emoji: '⚔️',
                category: 'weapon',
                level: 1
            },
            iron_sword: { 
                name: 'Espada de Hierro', 
                materials: { wood: 10, iron: 15 }, 
                value: 500, 
                emoji: '🗡️',
                category: 'weapon',
                level: 2
            },
            diamond_sword: { 
                name: 'Espada de Diamante', 
                materials: { wood: 5, diamond: 3, gold: 10 }, 
                value: 2500, 
                emoji: '⚔️💎',
                category: 'weapon',
                level: 4
            },
            mythril_sword: { 
                name: 'Espada de Mitril', 
                materials: { mythril: 5, diamond: 5, gold: 20 }, 
                value: 8000, 
                emoji: '⚔️✨',
                category: 'weapon',
                level: 5
            }
        },
        armor: {
            leather_armor: { 
                name: 'Armadura de Cuero', 
                materials: { leather: 30, wood: 15 }, 
                value: 300, 
                emoji: '🛡️',
                category: 'armor',
                level: 1
            },
            iron_armor: { 
                name: 'Armadura de Hierro', 
                materials: { iron: 40, gold: 5, leather: 10 }, 
                value: 1500, 
                emoji: '🥋',
                category: 'armor',
                level: 2
            },
            diamond_armor: { 
                name: 'Armadura de Diamante', 
                materials: { diamond: 10, gold: 20, iron: 30, leather: 5 }, 
                value: 8000, 
                emoji: '🛡️💎',
                category: 'armor',
                level: 4
            },
            dragon_scale_armor: { 
                name: 'Armadura de Escamas de Dragón', 
                materials: { dragon: 3, mythril: 10, diamond: 5 }, 
                value: 20000, 
                emoji: '🐉🛡️',
                category: 'armor',
                level: 5
            }
        },
        tools: {
            iron_pickaxe_kit: { 
                name: 'Kit Pico Hierro', 
                materials: { iron: 25, wood: 10 }, 
                value: 1500, 
                emoji: '⛏️⚙️',
                category: 'tool',
                level: 2
            },
            diamond_axe_kit: { 
                name: 'Kit Hacha Diamante', 
                materials: { diamond: 5, gold: 15, wood: 20 }, 
                value: 10000, 
                emoji: '🪓💎',
                category: 'tool',
                level: 4
            },
            fishing_rod_upgrade: { 
                name: 'Mejora de Caña', 
                materials: { string: 20, wood: 15, iron: 5 }, 
                value: 2000, 
                emoji: '🎣⬆️',
                category: 'tool',
                level: 2
            },
            repair_kit_basic: {
                name: 'Kit de Reparación Básico',
                materials: { wood: 10, stone: 15, string: 5 },
                value: 300,
                emoji: '🔧',
                category: 'repair',
                level: 1,
                effect: 'Repara 50% de durabilidad'
            },
            repair_kit_advanced: {
                name: 'Kit de Reparación Avanzado',
                materials: { iron: 10, wood: 20, copper: 5 },
                value: 800,
                emoji: '🔧⚙️',
                category: 'repair',
                level: 2,
                effect: 'Repara 75% de durabilidad'
            },
            repair_kit_epic: {
                name: 'Kit de Reparación Épico',
                materials: { gold: 5, diamond: 1, iron: 15 },
                value: 2500,
                emoji: '🔧💎',
                category: 'repair',
                level: 4,
                effect: 'Repara 100% de durabilidad'
            },
            repair_kit_legendary: {
                name: 'Kit de Reparación Legendario',
                materials: { mythril: 2, emerald: 1, gold: 10, crystal: 3 },
                value: 8000,
                emoji: '🔧✨',
                category: 'repair',
                level: 5,
                effect: 'Repara 100% + 50 durabilidad extra'
            }
        },
        consumables: {
            health_potion_small: {
                name: 'Poción de Salud Pequeña',
                materials: { fish: 5, wood: 3 },
                value: 50,
                emoji: '🧪❤️',
                category: 'consumable',
                effect: 'Restaura 30 salud'
            },
            health_potion_medium: {
                name: 'Poción de Salud Media',
                materials: { salmon: 3, oak: 5, iron: 2 },
                value: 150,
                emoji: '🧪❤️❤️',
                category: 'consumable',
                effect: 'Restaura 60 salud'
            },
            health_potion_large: {
                name: 'Poción de Salud Grande',
                materials: { tuna: 2, maple: 3, gold: 1, crystal: 1 },
                value: 400,
                emoji: '🧪❤️❤️❤️',
                category: 'consumable',
                effect: 'Restaura 100 salud'
            },
            stamina_potion: {
                name: 'Poción de Energía',
                materials: { fish: 10, wood: 8, coal: 5 },
                value: 120,
                emoji: '🧪⚡',
                category: 'consumable',
                effect: 'Reduce cooldowns'
            },
            luck_potion: {
                name: 'Poción de Suerte',
                materials: { gold: 3, emerald: 1, essence: 2 },
                value: 1500,
                emoji: '🧪🍀',
                category: 'consumable',
                effect: 'Aumenta probabilidad de rareza por 1 hora'
            }
        }
    },

    // Reparación directa con materiales
    REPAIR_SYSTEM: {
        // Costos de reparación por tipo de herramienta y nivel
        REPAIR_COSTS: {
            pickaxe: {
                basic: { stone: 2, wood: 1 },
                iron: { iron: 1, stone: 3 },
                gold: { gold: 1, iron: 2 },
                diamond: { diamond: 1, gold: 1 },
                mythril: { mythril: 1, diamond: 1 }
            },
            axe: {
                basic: { wood: 2, stone: 1 },
                iron: { iron: 1, wood: 3 },
                gold: { gold: 1, iron: 1 },
                diamond: { diamond: 1, gold: 1 },
                mythril: { mythril: 1, diamond: 1 }
            },
            fishingRod: {
                basic: { wood: 1, string: 1 },
                iron: { iron: 1, wood: 2, string: 1 },
                gold: { gold: 1, iron: 1, string: 2 },
                diamond: { diamond: 1, gold: 1, string: 3 },
                enchanted: { crystal: 1, essence: 1, string: 2 }
            }
        },

        // Porcentaje de reparación por material
        REPAIR_PERCENTAGES: {
            stone: 10,    // 10% por piedra
            wood: 8,      // 8% por madera
            iron: 15,     // 15% por hierro
            copper: 12,   // 12% por cobre
            gold: 20,     // 20% por oro
            diamond: 40,  // 40% por diamante
            mythril: 50,  // 50% por mitril
            string: 5,    // 5% por cuerda
            crystal: 25,  // 25% por cristal
            essence: 30   // 30% por esencia
        },

        // Reparación especial con kits
        KIT_REPAIR_VALUES: {
            repair_kit_basic: 50,      // 50%
            repair_kit_advanced: 75,   // 75%
            repair_kit_epic: 100,      // 100%
            repair_kit_legendary: 150  // 100% + 50 extra
        }
    }
};

// Funciones utilitarias
export function getRandomResource(resourceType, toolLevel = 1) {
    const resources = RESOURCE_SYSTEM.RESOURCES[resourceType];
    if (!resources) return null;

    const entries = Object.entries(resources);

    const rarityMultiplier = {
        common: 1,
        uncommon: toolLevel >= 2 ? 1.5 : 1,
        rare: toolLevel >= 3 ? 1.3 : 0.7,
        epic: toolLevel >= 4 ? 1.1 : 0.4,
        legendary: toolLevel >= 5 ? 0.8 : 0.1,
        mythic: toolLevel >= 5 ? 0.3 : 0.05
    };

    let totalWeight = 0;
    const weightedResources = [];

    entries.forEach(([key, resource]) => {
        let weight = 100 / (Object.keys(resources).indexOf(key) + 1);
        weight *= rarityMultiplier[resource.rarity] || 1;
        weightedResources.push({ key, resource, weight });
        totalWeight += weight;
    });

    if (totalWeight === 0) return null;

    let random = Math.random() * totalWeight;
    for (const item of weightedResources) {
        if (random < item.weight) {
            return { ...item.resource, id: item.key };
        }
        random -= item.weight;
    }

    return weightedResources[0]?.resource || null;
}

export function calculateResourceAmount(toolLevel, efficiency) {
    const base = 1 + Math.floor(Math.random() * 3);
    return Math.floor(base * efficiency * (1 + (toolLevel * 0.5)));
}

export function calculateRepairAmount(toolType, toolId, materials) {
    const toolData = RESOURCE_SYSTEM.TOOLS[toolType === 'pickaxe' ? 'PICKAXES' : 
                                          toolType === 'axe' ? 'AXES' : 'FISHING_RODS'][toolId];
    
    if (!toolData) return 0;

    let repairAmount = 0;
    for (const [material, amount] of Object.entries(materials)) {
        const percentage = RESOURCE_SYSTEM.REPAIR_SYSTEM.REPAIR_PERCENTAGES[material] || 5;
        repairAmount += percentage * amount;
    }

    return Math.min(repairAmount, toolData.durability);
}

export function getRepairCosts(toolType, toolId) {
    return RESOURCE_SYSTEM.REPAIR_SYSTEM.REPAIR_COSTS[toolType]?.[toolId] || {};
}

export function applyOwnerBonus(sender, baseAmount) {
    if (!global.owner || !sender) return baseAmount;

    const senderNumber = sender.split('@')[0] || sender;
    let multiplier = 1;

    if (global.owner.includes(senderNumber)) {
        multiplier = 2;
    }
    if (global.fernando && global.fernando.includes(senderNumber)) {
        multiplier = 3;
    }

    return baseAmount * multiplier;
}

// Nueva función para obtener todos los recursos por categoría
export function getAllResourcesByCategory(category) {
    const allResources = {};
    for (const [cat, resources] of Object.entries(RESOURCE_SYSTEM.RESOURCES)) {
        if (category === 'all' || cat === category) {
            Object.assign(allResources, resources);
        }
    }
    return allResources;
}

// Función para calcular costo de reparación en monedas
export function calculateCoinRepairCost(currentDurability, maxDurability, toolLevel) {
    const missing = maxDurability - currentDurability;
    return Math.floor(missing * 2 * (1 + (toolLevel * 0.5)));
}