// ============================================
// lib/rpg/init-resources.js
// ============================================
// Sistema básico de misiones (placeholder) - SIN IMPORTACIÓN
let missionSystem = {
    getMissions: () => [],
    lastReset: { daily: 0, weekly: 0, monthly: 0 },
    shouldReset: () => false,
    generateRandomMissions: () => [],
    dailyMissions: [],
    weeklyMissions: [],
    monthlyMissions: []
};

// Función para extraer número del JID
function extractNumber(jid) {
    if (!jid) return '';
    return jid.split('@')[0] || jid;
}

// Función para verificar si es owner
export function isOwner(sender) {
    const senderNumber = extractNumber(sender);
    return global.owner && global.owner.includes(senderNumber);
}

// Función para verificar si está en fernando
export function isFernando(sender) {
    const senderNumber = extractNumber(sender);
    return global.fernando && global.fernando.includes(senderNumber);
}

export function initializeResourceSystem() {
    console.log('🔄 Inicializando sistema de recursos...');
    
    if (!global.db || !global.db.data) {
        console.log('❌ Base de datos no inicializada');
        return;
    }
    
    if (!global.db.data.users) {
        global.db.data.users = {};
        console.log('✅ Base de datos de usuarios creada');
    }
    
    // Inicializar usuarios existentes
    let usersInitialized = 0;
    Object.values(global.db.data.users).forEach(user => {
        if (!user.inventory) {
            user.inventory = {
                resources: {},
                tools: {
                    pickaxe: 'basic',
                    axe: 'basic',
                    fishingRod: 'basic'
                },
                durability: {
                    pickaxe: 100,
                    axe: 100,
                    fishingRod: 100
                },
                crafted: {},
                missions: {
                    daily: { streak: 0, lastCompleted: 0, completed: [], lastClaimed: {} },
                    weekly: { completed: [], lastClaimed: {} },
                    monthly: { completed: [], lastClaimed: {} }
                }
            };
            usersInitialized++;
        }
        
        // Inicializar campos de seguimiento diario
        user.minedToday = user.minedToday || 0;
        user.choppedToday = user.choppedToday || 0;
        user.fishedToday = user.fishedToday || 0;
        user.craftedToday = user.craftedToday || 0;
        user.soldToday = user.soldToday || 0;
        
        // Inicializar economía básica si no existe
        user.coin = user.coin || 1000;
        user.bank = user.bank || 0;
        user.health = user.health || 100;
        
        // Inicializar harem si no existe
        if (!user.harem) {
            user.harem = [];
        }
    });
    
    console.log(`✅ Sistema de recursos inicializado (${usersInitialized} usuarios actualizados)`);
}

// Reiniciar estadísticas diarias automáticamente
export function resetDailyStats() {
    try {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        
        // Reiniciar a medianoche (00:00)
        if (hour === 0 && minute === 0) {
            let usersReset = 0;
            Object.values(global.db.data.users).forEach(user => {
                user.minedToday = 0;
                user.choppedToday = 0;
                user.fishedToday = 0;
                user.craftedToday = 0;
                user.soldToday = 0;
                usersReset++;
                
                // Reiniciar misiones diarias del usuario
                if (user.inventory?.missions?.daily) {
                    // Guardar racha actual
                    const currentStreak = user.inventory.missions.daily.streak || 0;
                    
                    // Reiniciar misiones completadas
                    user.inventory.missions.daily.completed = [];
                    user.inventory.missions.daily.lastClaimed = {};
                    
                    // Mantener la racha solo si completó misiones ayer
                    const today = new Date().toDateString();
                    if (user.inventory.missions.daily.lastCompleted === today) {
                        user.inventory.missions.daily.streak = currentStreak;
                    } else {
                        user.inventory.missions.daily.streak = 0;
                    }
                }
            });
            console.log(`🔄 Estadísticas diarias reiniciadas (${usersReset} usuarios)`);
        }
        
    } catch (error) {
        console.log('❌ Error en resetDailyStats:', error.message);
    }
}

// Iniciar el sistema si global.db existe
if (global.db && global.db.data) {
    initializeResourceSystem();
}

// Programar chequeo cada minuto para reinicios precisos
setInterval(() => {
    if (global.db && global.db.data) {
        resetDailyStats();
    }
}, 60 * 1000);

// Exportar funciones auxiliares
export { extractNumber };