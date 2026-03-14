// ============================================
// lib/rpg/mission-system.js
// ============================================
export class MissionSystem {
    constructor() {
        this.dailyMissions = [];
        this.weeklyMissions = [];
        this.monthlyMissions = [];
        this.lastReset = {
            daily: 0,
            weekly: 0,
            monthly: 0
        };
        this.initializeMissions();
    }

    // Bancos de posibles misiones
    missionTemplates = {
        daily: [
            {
                type: 'mine',
                names: ['⛏️ Minero Novato', '⛏️ Excavador', '⛏️ Buscador de Piedras'],
                descriptions: ['Mina {amount} recursos', 'Excava {amount} minerales', 'Busca {amount} piedras'],
                amounts: [10, 15, 20, 25],
                rewards: { coin: [300, 500, 800], resource: ['stone', 'iron'], amounts: [5, 8, 10] }
            },
            {
                type: 'chop',
                names: ['🪓 Leñador', '🪓 Talador', '🪓 Cortador de Árboles'],
                descriptions: ['Tala {amount} recursos', 'Corta {amount} árboles', 'Recoge {amount} maderas'],
                amounts: [12, 18, 24, 30],
                rewards: { coin: [250, 400, 600], resource: ['wood', 'oak'], amounts: [8, 12, 15] }
            },
            {
                type: 'fish',
                names: ['🎣 Pescador', '🎣 Pescador de Ríos', '🎣 Cazador de Peces'],
                descriptions: ['Pesca {amount} recursos', 'Atrapa {amount} peces', 'Captura {amount} criaturas marinas'],
                amounts: [8, 12, 16, 20],
                rewards: { coin: [350, 550, 750], resource: ['fish', 'salmon'], amounts: [6, 9, 12] }
            },
            {
                type: 'craft',
                names: ['⚒️ Artesano', '⚒️ Creador', '⚒️ Forjador'],
                descriptions: ['Craftea {amount} item', 'Crea {amount} objeto', 'Fabrica {amount} herramienta'],
                amounts: [3, 5, 7, 10],
                rewards: { coin: [400, 650, 900], resource: ['gold', 'iron'], amounts: [3, 5, 7] }
            },
            {
                type: 'sell',
                names: ['💰 Vendedor', '💰 Comerciante', '💰 Mercader'],
                descriptions: ['Vende {amount} recursos', 'Comercializa {amount} items', 'Intercambia {amount} materiales'],
                amounts: [15, 25, 35, 50],
                rewards: { coin: [450, 700, 950], resource: ['gold', 'diamond'], amounts: [2, 3, 5] }
            },
            // NUEVAS MISIONES
            {
                type: 'work',
                names: ['💼 Trabajador', '💼 Empleado', '💼 Obrero'],
                descriptions: ['Trabaja {amount} veces', 'Realiza {amount} trabajos', 'Cumple {amount} jornadas'],
                amounts: [3, 5, 7, 10],
                rewards: { coin: [300, 500, 700, 1000], exp: [20, 35, 50, 75] }
            },
            {
                type: 'adventure',
                names: ['⚔️ Aventurero', '⚔️ Explorador', '⚔️ Buscador'],
                descriptions: ['Aventúrate {amount} veces', 'Explora {amount} lugares', 'Completa {amount} aventuras'],
                amounts: [2, 3, 4, 5],
                rewards: { coin: [500, 800, 1200, 1800], health: [5, 8, 12, 15] }
            },
            {
                type: 'crime',
                names: ['🦹 Criminal', '🦹 Asaltante', '🦹 Estafador'],
                descriptions: ['Comete {amount} crímenes', 'Realiza {amount} robos', 'Ejecuta {amount} delitos'],
                amounts: [2, 3, 4, 5],
                rewards: { coin: [600, 900, 1400, 2000] }
            },
            {
                type: 'dungeon',
                names: ['🏰 Conquistador', '🏰 Buscador', '🏰 Cazador'],
                descriptions: ['Completa {amount} mazmorras', 'Explora {amount} calabozos', 'Derrota {amount} guardianes'],
                amounts: [2, 3, 4, 5],
                rewards: { coin: [800, 1300, 1900, 2800], special: ['dungeon_key'] }
            }
        ],
        weekly: [
            {
                type: 'mine',
                names: ['📅 Minero Semanal', '📅 Excavador Semanal', '📅 Perforador Semanal'],
                descriptions: ['Mina {amount} recursos esta semana', 'Excava {amount} minerales semanales', 'Extrae {amount} materiales'],
                amounts: [50, 75, 100, 150],
                rewards: { coin: [2000, 3500, 5000, 7500], resource: ['diamond', 'emerald'], amounts: [3, 5, 8], special: ['weekly_bonus'] }
            },
            {
                type: 'collect',
                names: ['📅 Coleccionista', '📅 Recolector', '📅 Acumulador'],
                descriptions: ['Consigue {amount} de cada recurso básico', 'Acumula {amount} recursos variados', 'Reúne {amount} materiales'],
                amounts: [30, 50, 75, 100],
                rewards: { coin: [2500, 4000, 6000, 9000], resource: ['mythril'], amounts: [2, 3, 5], special: ['collection_bonus'] }
            },
            {
                type: 'total_work',
                names: ['📅 Trabajador Semanal', '📅 Empleado del Mes', '📅 Obrero Ejemplar'],
                descriptions: ['Trabaja {amount} veces esta semana', 'Cumple {amount} turnos', 'Realiza {amount} trabajos'],
                amounts: [15, 25, 35, 50],
                rewards: { coin: [3000, 5000, 8000, 12000], exp: [200, 350, 550, 800] }
            },
            {
                type: 'bank_saver',
                names: ['📅 Ahorrador', '📅 Inversionista', '📅 Magnate'],
                descriptions: ['Ahorra ¥{amount} esta semana', 'Deposita ¥{amount} en el banco', 'Acumula ¥{amount}'],
                amounts: [50000, 100000, 200000, 500000],
                rewards: { coin: [5000, 9000, 15000, 25000], special: ['interest_booster'] }
            }
        ],
        monthly: [
            {
                type: 'bank',
                names: ['📊 Magnate', '📊 Millonario', '📊 Magnate Financiero'],
                descriptions: ['Acumula ¥{amount} en el banco', 'Ahorra ¥{amount} este mes', 'Atesora ¥{amount} en oro'],
                amounts: [100000, 250000, 500000, 1000000],
                rewards: { coin: [10000, 25000, 50000, 100000], special: ['exclusive_character', 'premium_tools', 'legendary_set'] }
            },
            {
                type: 'total_resources',
                names: ['📊 Leyenda', '📊 Épico', '📊 Maestro Recolector'],
                descriptions: ['Consigue {amount} recursos en total', 'Acumula {amount} materiales', 'Reúne {amount} recursos'],
                amounts: [500, 1000, 2000, 5000],
                rewards: { coin: [15000, 30000, 60000, 120000], special: ['unique_character', 'legendary_gear'] }
            },
            {
                type: 'legendary_worker',
                names: ['📊 Leyenda Laboral', '📊 Trabajador Épico', '📊 Maestro del Trabajo'],
                descriptions: ['Trabaja {amount} veces este mes', 'Cumple {amount} jornadas', 'Realiza {amount} trabajos'],
                amounts: [60, 100, 150, 200],
                rewards: { coin: [20000, 40000, 70000, 120000], special: ['legendary_worker_title'] }
            }
        ]
    };

    // Inicializar misiones aleatorias
    initializeMissions() {
        const now = Date.now();
        
        // Generar nuevas misiones diarias si es necesario
        if (this.shouldReset('daily')) {
            this.dailyMissions = this.generateRandomMissions('daily', 5);
            this.lastReset.daily = now;
        }
        
        // Generar nuevas misiones semanales si es necesario
        if (this.shouldReset('weekly')) {
            this.weeklyMissions = this.generateRandomMissions('weekly', 3);
            this.lastReset.weekly = now;
        }
        
        // Generar nuevas misiones mensuales si es necesario
        if (this.shouldReset('monthly')) {
            this.monthlyMissions = this.generateRandomMissions('monthly', 2);
            this.lastReset.monthly = now;
        }
    }

    // Generar misiones aleatorias
    generateRandomMissions(type, count) {
        const templates = this.missionTemplates[type];
        const missions = [];
        const usedTypes = new Set();
        
        for (let i = 0; i < count; i++) {
            let template;
            let attempts = 0;
            
            // Evitar duplicados de tipos principales
            do {
                template = templates[Math.floor(Math.random() * templates.length)];
                attempts++;
            } while (usedTypes.has(template.type) && attempts < templates.length * 2);
            
            usedTypes.add(template.type);
            
            const nameIndex = Math.floor(Math.random() * template.names.length);
            const descIndex = Math.floor(Math.random() * template.descriptions.length);
            const amountIndex = Math.floor(Math.random() * template.amounts.length);
            const coinIndex = Math.floor(Math.random() * template.rewards.coin.length);
            const resourceIndex = template.rewards.resource ? 
                Math.floor(Math.random() * template.rewards.resource.length) : 0;
            const amountResourceIndex = template.rewards.amounts ? 
                Math.floor(Math.random() * template.rewards.amounts.length) : 0;
            
            const mission = {
                id: `${type}_${Date.now()}_${i}`,
                name: template.names[nameIndex],
                description: template.descriptions[descIndex].replace('{amount}', template.amounts[amountIndex]),
                type: template.type,
                requirement: {
                    type: template.type,
                    amount: template.amounts[amountIndex],
                    resources: template.type === 'collect' ? ['stone', 'wood', 'fish'] : undefined
                },
                reward: {
                    coin: template.rewards.coin[coinIndex],
                    resource: template.rewards.resource ? template.rewards.resource[resourceIndex] : null,
                    amount: template.rewards.amounts ? template.rewards.amounts[amountResourceIndex] : 1,
                    special: template.rewards.special ? 
                        template.rewards.special[Math.floor(Math.random() * template.rewards.special.length)] : 
                        null,
                    exp: template.rewards.exp ? 
                        template.rewards.exp[Math.floor(Math.random() * template.rewards.exp.length)] : 0,
                    health: template.rewards.health ? 
                        template.rewards.health[Math.floor(Math.random() * template.rewards.health.length)] : 0
                }
            };
            
            missions.push(mission);
        }
        
        return missions;
    }

    // Verificar si debe resetear
    shouldReset(type) {
        const now = Date.now();
        const lastReset = this.lastReset[type];
        
        // Si nunca se ha resetado, hacerlo ahora
        if (lastReset === 0) return true;
        
        switch(type) {
            case 'daily':
                return (now - lastReset) >= 24 * 60 * 60 * 1000;
            case 'weekly':
                return (now - lastReset) >= 7 * 24 * 60 * 60 * 1000;
            case 'monthly':
                return (now - lastReset) >= 30 * 24 * 60 * 60 * 1000;
            default:
                return false;
        }
    }

    // Obtener misiones actuales
    getMissions(type) {
        this.initializeMissions();
        return this[`${type}Missions`];
    }

    // Obtener progreso para un usuario
    getUserProgress(user, mission) {
        switch(mission.requirement.type) {
            case 'mine':
                return user.minedToday || 0;
            case 'chop':
                return user.choppedToday || 0;
            case 'fish':
                return user.fishedToday || 0;
            case 'craft':
                return user.craftedToday || 0;
            case 'sell':
                return user.soldToday || 0;
            case 'work':
                return user.workedToday || 0;
            case 'adventure':
                return user.adventuresToday || 0;
            case 'crime':
                return user.crimesToday || 0;
            case 'dungeon':
                return user.dungeonsToday || 0;
            case 'collect':
                if (!mission.requirement.resources) return 0;
                // Tomar el recurso con menor cantidad
                const minResource = Math.min(...mission.requirement.resources.map(res => 
                    user.inventory?.resources?.[res] || 0
                ));
                return minResource;
            case 'bank':
                return user.bank || 0;
            case 'total_work':
                return user.totalWork || 0;
            default:
                return 0;
        }
    }

    // Verificar si misión está completada
    isMissionCompleted(user, mission) {
        const progress = this.getUserProgress(user, mission);
        return progress >= mission.requirement.amount;
    }
}

// Instancia global del sistema de misiones
export const missionSystem = new MissionSystem();