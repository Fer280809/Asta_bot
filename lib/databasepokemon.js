// lib/databasepokemon.js - Sistema de base de datos optimizado
import { Low, JSONFile } from 'lowdb';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

class PokemonDatabase {
    constructor() {
        // Configuración de límites
        this.config = {
            MAX_PLAYERS: 5000,          // Límite absoluto
            WARNING_THRESHOLD: 3000,    // Aviso a 3000 jugadores
            BACKUP_INTERVAL: 3600000,   // Backup cada hora (1h)
            CLEANUP_DAYS: 90,           // Limpiar jugadores inactivos 90 días
            CACHE_TTL: 300000,          // Cache por 5 minutos
            BATCH_SIZE: 50,             // Procesamiento por lotes
            MAX_HISTORY_PER_CATEGORY: 100 // Máximo de entradas en historial
        };
        
        // Inicializar base de datos
        this.initDatabase();
        this.initBackupSystem();
        this.initCache();
    }
    
    async initDatabase() {
        try {
            // Asegurar que existan las carpetas
            const folders = ['backups', 'cache', 'logs'];
            folders.forEach(folder => {
                if (!fs.existsSync(join(__dirname, folder))) {
                    fs.mkdirSync(join(__dirname, folder), { recursive: true });
                }
            });
            
            // Inicializar LowDB
            const adapter = new JSONFile(join(__dirname, 'players.json'));
            this.db = new Low(adapter);
            
            await this.db.read();
            
            // Inicializar estructura si no existe
            this.db.data ||= {
                players: {},
                metadata: {
                    totalPlayers: 0,
                    totalBattles: 0,
                    createdAt: new Date().toISOString(),
                    lastBackup: null,
                    version: '2.0.0' // Actualizado a versión 2.0.0
                },
                counters: {
                    playerId: 1000,
                    battleId: 1,
                    tradeId: 1,
                    missionId: 1,
                    achievementId: 1
                },
                cache: {
                    rankings: null,
                    globalStats: null,
                    lastUpdated: null
                }
            };
            
            await this.db.write();
            this.log('Database initialized successfully');
            
            // Verificar límites
            await this.checkLimits();
            
        } catch (error) {
            console.error('❌ Database initialization error:', error);
            throw error;
        }
    }
    
    // ============ FUNCIÓN ACTUALIZADA createPlayerSchema ============
    createPlayerSchema(userId, userName, gender = 'masculino') {
        const playerId = `P${this.db.data.counters.playerId++}`;
        const currentDate = new Date().toISOString();
        
        return {
            playerId: playerId,
            userId: userId,
            username: userName,
            gender: gender,
            startDate: currentDate,
            lastActive: currentDate,
            
            // Estadísticas básicas
            nivel: 1,
            experiencia: 0,
            dinero: 3000,
            ubicacion: "Albavera",
            medallas: [],
            
            // Contenido del juego - VIEJO (mantener por compatibilidad)
            equipo: [],
            pc: [], // Mantenido por compatibilidad, pero será reemplazado por pcBoxes
            pokedex: [],
            inventario: { pokeball: 5, pocion: 3 },
            
            // Configuración
            configuracion: {
                notificaciones: true,
                modoClaro: true,
                idioma: "es"
            },
            
            // ============ NUEVOS CAMPOS PARA SISTEMAS ============
            
            // NUEVO: Sistema de PC mejorado con cajas
            pcBoxes: {
                'Caja 1': [],
                'Caja 2': [],
                'Caja 3': [],
                'Caja 4': [],
                'Caja 5': [],
                'Caja 6': [],
                'Caja 7': [],
                'Caja 8': [],
                'Caja 9': [],
                'Caja 10': []
            },
            
            // NUEVO: Guardería Pokémon
            daycare: {
                pokemon1: null,
                pokemon2: null,
                egg: null,
                steps: 0,
                lastUpdate: currentDate
            },
            
            // NUEVO: Sistema de misiones
            missions: {
                daily: [],
                story: [],
                event: [],
                completed: [],
                progress: {},
                lastDailyReset: currentDate
            },
            
            // NUEVO: Sistema de concursos
            contests: {
                ribbons: [],
                points: 0,
                participated: [],
                wins: 0,
                bestScore: 0
            },
            
            // NUEVO: Preferencias climáticas
            weatherPreferences: {
                favorite: null,
                encountered: [],
                bonuses: {}
            },
            
            // NUEVO: Almacenamiento de Pokémon mejorado
            pokemonStorage: {
                team: [], // Pokémon en equipo activo (máximo 6)
                boxes: { // Cajas adicionales para almacenamiento
                    'Caja A': [],
                    'Caja B': [],
                    'Caja C': [],
                    'Caja D': []
                },
                lastSorted: currentDate
            },
            
            // NUEVO: Sistema de logros y títulos
            achievements: {
                titles: ["Novato"],
                unlocked: ["first_catch"],
                progress: {
                    catches: 0,
                    battles: 0,
                    evolutions: 0,
                    trades: 0,
                    kilometers: 0,
                    hours: 0
                },
                hidden: []
            },
            
            // NUEVO: Historial detallado del jugador
            history: {
                battles: [],
                captures: [],
                trades: [],
                evolutions: [],
                badgesEarned: [],
                levelUps: [],
                itemsFound: [],
                locationsVisited: []
            },
            
            // NUEVO: Estadísticas avanzadas
            stats: {
                totalBattles: 0,
                wins: 0,
                losses: 0,
                catches: 0,
                shinyCatches: 0,
                legendaryCatches: 0,
                playTime: 0, // En minutos
                stepsWalked: 0
            }
        };
    }
    
    // ============ SISTEMA DE CACHE ============
    initCache() {
        this.cache = {
            rankings: null,
            globalStats: null,
            playerCache: new Map(),
            historyCache: new Map(), // Cache específico para historial
            lastUpdated: null
        };
        
        // Limpiar cache periódicamente
        setInterval(() => {
            this.clearCache();
        }, this.config.CACHE_TTL);
    }
    
    setCache(key, value, ttl = 300000) {
        this.cache[key] = {
            value: value,
            expires: Date.now() + ttl
        };
    }
    
    getCache(key) {
        const cached = this.cache[key];
        if (cached && cached.expires > Date.now()) {
            return cached.value;
        }
        return null;
    }
    
    clearCache() {
        this.cache.playerCache.clear();
        this.cache.historyCache.clear();
        this.cache.rankings = null;
        this.cache.globalStats = null;
        this.log('Cache cleared');
    }
    
    // ============ SISTEMA DE BACKUP AUTOMÁTICO ============
    initBackupSystem() {
        // Backup cada hora
        setInterval(async () => {
            await this.createBackup();
        }, this.config.BACKUP_INTERVAL);
        
        // Backup al iniciar
        setTimeout(async () => {
            await this.createBackup();
        }, 5000);
    }
    
    async createBackup(type = 'hourly') {
        try {
            await this.db.read();
            
            const timestamp = new Date().toISOString()
                .replace(/[:.]/g, '-')
                .replace('T', '_')
                .substring(0, 19);
            
            const backupDir = join(__dirname, 'backups');
            const filename = `${timestamp}_${type}_players_v2.json`;
            const backupPath = join(backupDir, filename);
            
            // Crear backup
            fs.writeFileSync(backupPath, JSON.stringify(this.db.data, null, 2));
            
            // Actualizar metadata
            this.db.data.metadata.lastBackup = new Date().toISOString();
            await this.db.write();
            
            // Rotación de backups (mantener últimos 50)
            this.rotateBackups();
            
            this.log(`Backup created: ${filename}`);
            return { success: true, filename: filename };
            
        } catch (error) {
            console.error('Backup error:', error);
            return { success: false, error: error.message };
        }
    }
    
    rotateBackups() {
        const backupDir = join(__dirname, 'backups');
        if (!fs.existsSync(backupDir)) return;
        
        const files = fs.readdirSync(backupDir)
            .filter(f => f.endsWith('.json'))
            .map(f => ({
                name: f,
                path: join(backupDir, f),
                time: fs.statSync(join(backupDir, f)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time);
        
        // Mantener solo los últimos 50 backups
        if (files.length > 50) {
            files.slice(50).forEach(file => {
                try {
                    fs.unlinkSync(file.path);
                    this.log(`Deleted old backup: ${file.name}`);
                } catch (e) {
                    console.error('Error deleting backup:', e);
                }
            });
        }
    }
    
    // ============ VERIFICACIÓN DE LÍMITES ============
    async checkLimits() {
        await this.db.read();
        
        const totalPlayers = Object.keys(this.db.data.players).length;
        
        if (totalPlayers >= this.config.WARNING_THRESHOLD) {
            this.log(`⚠️ WARNING: ${totalPlayers} players (threshold: ${this.config.WARNING_THRESHOLD})`);
        }
        
        if (totalPlayers >= this.config.MAX_PLAYERS) {
            this.log(`🚨 CRITICAL: Maximum players reached (${totalPlayers}/${this.config.MAX_PLAYERS})`);
        }
        
        return {
            totalPlayers: totalPlayers,
            limit: this.config.MAX_PLAYERS,
            status: totalPlayers >= this.config.MAX_PLAYERS ? 'FULL' : 'OK'
        };
    }
    
    // ============ MÉTODOS PRINCIPALES OPTIMIZADOS ============
    
    // Crear jugador con nuevo schema
    async createPlayer(userId, userName, gender = 'masculino') {
        await this.db.read();
        
        // Verificar límite
        const playerCount = Object.keys(this.db.data.players).length;
        if (playerCount >= this.config.MAX_PLAYERS) {
            return { 
                success: false, 
                error: "El servidor ha alcanzado el límite máximo de jugadores",
                code: "SERVER_FULL"
            };
        }
        
        // Verificar si ya existe
        if (this.db.data.players[userId]) {
            // Agregar a caché si existe
            this.cache.playerCache.set(userId, this.db.data.players[userId]);
            return { success: false, error: "El jugador ya existe" };
        }
        
        // Crear jugador con nuevo schema
        const newPlayer = this.createPlayerSchema(userId, userName, gender);
        
        // Guardar en base de datos
        this.db.data.players[userId] = newPlayer;
        this.db.data.metadata.totalPlayers++;
        
        // Agregar a caché
        this.cache.playerCache.set(userId, newPlayer);
        
        await this.db.write();
        
        this.log(`New player created: ${userName} (ID: ${newPlayer.playerId}) with v2 schema`);
        return { success: true, player: newPlayer };
    }
    
    // Obtener jugador optimizado (con caché)
    async getPlayer(userId, useCache = true) {
        // Intentar desde caché primero
        if (useCache) {
            const cached = this.cache.playerCache.get(userId);
            if (cached) {
                return cached;
            }
        }
        
        // Leer de la base de datos
        await this.db.read();
        const player = this.db.data.players[userId];
        
        // Agregar a caché si existe
        if (player && useCache) {
            this.cache.playerCache.set(userId, player);
        }
        
        return player;
    }
    
    // Actualizar jugador
    async updatePlayer(userId, updates) {
        await this.db.read();
        
        if (!this.db.data.players[userId]) {
            return { success: false, error: "Jugador no encontrado" };
        }
        
        // Actualizar lastActive automáticamente
        updates.lastActive = new Date().toISOString();
        
        // Aplicar actualizaciones
        Object.assign(this.db.data.players[userId], updates);
        
        // Actualizar caché
        this.cache.playerCache.set(userId, this.db.data.players[userId]);
        
        // Invalidar caché de rankings
        this.cache.rankings = null;
        this.cache.globalStats = null;
        
        await this.db.write();
        return { success: true, player: this.db.data.players[userId] };
    }
    
    // ============ NUEVOS MÉTODOS PARA LAS MEJORAS ============
    
    // Actualizar un Pokémon en el equipo
    async updatePokemonInTeam(userId, pokemonIndex, updates) {
        const player = await this.getPlayer(userId);
        if (!player || !player.equipo[pokemonIndex]) {
            return { success: false, error: "Pokémon no encontrado" };
        }
        
        // Aplicar actualizaciones al Pokémon
        Object.assign(player.equipo[pokemonIndex], updates);
        
        // También actualizar en el sistema de almacenamiento si está en el equipo
        const teamPokemon = player.pokemonStorage.team[pokemonIndex];
        if (teamPokemon) {
            Object.assign(teamPokemon, updates);
        }
        
        return await this.updatePlayer(userId, player);
    }
    
    // Agregar entrada al historial
    async addToHistory(userId, category, data) {
        const player = await this.getPlayer(userId);
        if (!player) return { success: false, error: "Jugador no encontrado" };
        
        // Inicializar categoría si no existe
        if (!player.history[category]) {
            player.history[category] = [];
        }
        
        // Crear entrada de historial
        const historyEntry = {
            ...data,
            id: `H${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString()
        };
        
        // Agregar al historial
        player.history[category].push(historyEntry);
        
        // Mantener solo últimos N en cada categoría
        if (player.history[category].length > this.config.MAX_HISTORY_PER_CATEGORY) {
            player.history[category] = player.history[category].slice(-this.config.MAX_HISTORY_PER_CATEGORY);
        }
        
        // Actualizar caché de historial
        this.cache.historyCache.set(`${userId}_${category}`, player.history[category]);
        
        return await this.updatePlayer(userId, player);
    }
    
    // Obtener historial con filtros
    async getHistory(userId, category, limit = 20) {
        const cacheKey = `${userId}_${category}_${limit}`;
        
        // Verificar caché primero
        const cached = this.cache.historyCache.get(cacheKey);
        if (cached) {
            return cached;
        }
        
        const player = await this.getPlayer(userId);
        if (!player || !player.history[category]) {
            return [];
        }
        
        const history = player.history[category]
            .slice(-limit)
            .reverse(); // Más reciente primero
        
        // Guardar en caché
        this.cache.historyCache.set(cacheKey, history);
        
        return history;
    }
    
    // Administrar cajas del PC
    async managePCBoxes(userId, boxName, action, pokemon = null, index = -1) {
        const player = await this.getPlayer(userId);
        if (!player) return { success: false, error: "Jugador no encontrado" };
        
        // Inicializar sistema de cajas si no existe
        if (!player.pcBoxes) {
            player.pcBoxes = this.createPlayerSchema(userId, player.username, player.gender).pcBoxes;
        }
        
        // Crear caja si no existe
        if (!player.pcBoxes[boxName]) {
            player.pcBoxes[boxName] = [];
        }
        
        let result;
        
        switch (action) {
            case 'add':
                if (pokemon) {
                    player.pcBoxes[boxName].push(pokemon);
                    result = { success: true, message: "Pokémon agregado a la caja" };
                }
                break;
                
            case 'remove':
                if (index >= 0 && index < player.pcBoxes[boxName].length) {
                    const removed = player.pcBoxes[boxName].splice(index, 1)[0];
                    result = { success: true, message: "Pokémon removido", pokemon: removed };
                }
                break;
                
            case 'move':
                if (pokemon && index >= 0) {
                    player.pcBoxes[boxName][index] = pokemon;
                    result = { success: true, message: "Pokémon movido" };
                }
                break;
                
            case 'get':
                result = { 
                    success: true, 
                    box: player.pcBoxes[boxName],
                    count: player.pcBoxes[boxName].length 
                };
                break;
                
            case 'clear':
                player.pcBoxes[boxName] = [];
                result = { success: true, message: "Caja vaciada" };
                break;
                
            default:
                result = { success: false, error: "Acción no válida" };
        }
        
        await this.updatePlayer(userId, player);
        return result;
    }
    
    // Sistema de guardería
    async updateDaycare(userId, updates) {
        const player = await this.getPlayer(userId);
        if (!player) return { success: false, error: "Jugador no encontrado" };
        
        // Inicializar guardería si no existe
        if (!player.daycare) {
            player.daycare = this.createPlayerSchema(userId, player.username, player.gender).daycare;
        }
        
        // Actualizar
        Object.assign(player.daycare, updates, { lastUpdate: new Date().toISOString() });
        
        return await this.updatePlayer(userId, player);
    }
    
    // Sistema de misiones
    async updateMission(userId, missionType, missionData) {
        const player = await this.getPlayer(userId);
        if (!player) return { success: false, error: "Jugador no encontrado" };
        
        // Inicializar sistema de misiones si no existe
        if (!player.missions) {
            player.missions = this.createPlayerSchema(userId, player.username, player.gender).missions;
        }
        
        const missionId = `M${this.db.data.counters.missionId++}`;
        const mission = {
            id: missionId,
            ...missionData,
            startedAt: new Date().toISOString(),
            completed: false,
            progress: 0
        };
        
        // Agregar a la categoría correspondiente
        player.missions[missionType].push(mission);
        
        // Actualizar contador de progreso
        player.missions.progress[missionId] = 0;
        
        await this.db.write();
        return { success: true, mission: mission };
    }
    
    // Sistema de logros
    async unlockAchievement(userId, achievementId, data = {}) {
        const player = await this.getPlayer(userId);
        if (!player) return { success: false, error: "Jugador no encontrado" };
        
        // Inicializar sistema de logros si no existe
        if (!player.achievements) {
            player.achievements = this.createPlayerSchema(userId, player.username, player.gender).achievements;
        }
        
        // Verificar si ya está desbloqueado
        if (!player.achievements.unlocked.includes(achievementId)) {
            player.achievements.unlocked.push(achievementId);
            
            // Registrar en historial
            await this.addToHistory(userId, 'achievements', {
                achievementId: achievementId,
                title: data.title || "Logro Desbloqueado",
                description: data.description || "",
                reward: data.reward || {}
            });
            
            return await this.updatePlayer(userId, player);
        }
        
        return { success: false, error: "Logro ya desbloqueado" };
    }
    
    // ============ MÉTODOS MASIVOS OPTIMIZADOS ============
    
    async batchUpdate(updates) {
        await this.db.read();
        
        let processed = 0;
        for (const [userId, update] of Object.entries(updates)) {
            if (this.db.data.players[userId]) {
                Object.assign(this.db.data.players[userId], update);
                this.db.data.players[userId].lastActive = new Date().toISOString();
                processed++;
            }
            
            // Procesar en lotes para no bloquear
            if (processed % this.config.BATCH_SIZE === 0) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        
        await this.db.write();
        return { success: true, processed: processed };
    }
    
    // Ranking optimizado (con caché)
    async getRanking(limit = 10) {
        // Verificar caché primero
        const cached = this.getCache('rankings');
        if (cached) {
            return cached.slice(0, limit);
        }
        
        await this.db.read();
        
        const players = Object.values(this.db.data.players);
        
        // Calcular scores mejorado con nuevos sistemas
        const ranked = players
            .map(p => ({
                userId: p.userId,
                username: p.username,
                nivel: p.nivel,
                experiencia: p.experiencia,
                medallas: p.medallas.length,
                dinero: p.dinero,
                achievements: p.achievements?.unlocked?.length || 0,
                contestPoints: p.contests?.points || 0,
                stats: p.stats || {},
                score: this.calculateScore(p)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 100);
        
        // Guardar en caché
        this.setCache('rankings', ranked);
        
        return ranked.slice(0, limit);
    }
    
    // Fórmula de score mejorada
    calculateScore(player) {
        let score = 0;
        
        // Base
        score += (player.nivel * 1000);
        score += (player.medallas.length * 5000);
        score += (player.experiencia / 100);
        score += (player.dinero / 1000);
        
        // Nuevos sistemas
        if (player.achievements) {
            score += (player.achievements.unlocked.length * 100);
        }
        
        if (player.contests) {
            score += (player.contests.points * 10);
            score += (player.contests.wins * 500);
        }
        
        if (player.stats) {
            score += (player.stats.totalBattles * 5);
            score += (player.stats.wins * 20);
            score += (player.stats.catches * 10);
            score += (player.stats.shinyCatches * 1000);
            score += (player.stats.legendaryCatches * 5000);
        }
        
        return Math.round(score);
    }
    
    // ============ MANTENIMIENTO AUTOMÁTICO ============
    
    async cleanupInactivePlayers() {
        await this.db.read();
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.config.CLEANUP_DAYS);
        
        let removed = 0;
        const activePlayers = {};
        
        for (const [userId, player] of Object.entries(this.db.data.players)) {
            const lastActive = new Date(player.lastActive);
            
            // Mantener jugadores activos, de nivel alto (>20) o con logros significativos
            const keepPlayer = (
                lastActive >= cutoffDate || 
                player.nivel > 20 || 
                (player.achievements && player.achievements.unlocked.length > 5) ||
                (player.stats && player.stats.legendaryCatches > 0)
            );
            
            if (keepPlayer) {
                activePlayers[userId] = player;
            } else {
                removed++;
                // Remover de cachés
                this.cache.playerCache.delete(userId);
                // Limpiar cachés de historial de este jugador
                for (const key of this.cache.historyCache.keys()) {
                    if (key.startsWith(`${userId}_`)) {
                        this.cache.historyCache.delete(key);
                    }
                }
            }
        }
        
        this.db.data.players = activePlayers;
        this.db.data.metadata.totalPlayers = Object.keys(activePlayers).length;
        
        await this.db.write();
        
        if (removed > 0) {
            this.log(`Cleaned up ${removed} inactive players`);
        }
        
        return { removed: removed, remaining: Object.keys(activePlayers).length };
    }
    
    // ============ MIGRACIÓN DE DATOS ANTIGUOS ============
    
    async migrateOldPlayers() {
        await this.db.read();
        
        let migrated = 0;
        for (const [userId, player] of Object.entries(this.db.data.players)) {
            // Si el jugador no tiene los nuevos campos, migrarlo
            if (!player.pcBoxes || !player.history) {
                const newSchema = this.createPlayerSchema(userId, player.username, player.gender);
                
                // Mantener datos existentes
                Object.keys(player).forEach(key => {
                    if (key in newSchema) {
                        // Si ya existe en el nuevo schema, mantener el valor existente
                        // (excepto campos que deben ser reemplazados)
                        if (!['pcBoxes', 'daycare', 'missions', 'contests', 
                              'weatherPreferences', 'pokemonStorage', 
                              'achievements', 'history', 'stats'].includes(key)) {
                            newSchema[key] = player[key];
                        }
                    }
                });
                
                // Migrar PC antiguo a nuevas cajas
                if (player.pc && Array.isArray(player.pc) && player.pc.length > 0) {
                    // Distribuir Pokémon antiguos en las primeras cajas
                    const oldPC = [...player.pc];
                    const boxes = Object.keys(newSchema.pcBoxes);
                    
                    for (let i = 0; i < oldPC.length && i < boxes.length * 30; i++) {
                        const boxIndex = Math.floor(i / 30);
                        const boxName = boxes[boxIndex];
                        newSchema.pcBoxes[boxName].push(oldPC[i]);
                    }
                }
                
                // Reemplazar jugador con versión migrada
                this.db.data.players[userId] = newSchema;
                migrated++;
                
                this.log(`Migrated player: ${player.username}`);
            }
        }
        
        if (migrated > 0) {
            await this.db.write();
            this.log(`Total players migrated: ${migrated}`);
        }
        
        return { migrated: migrated };
    }
    
    // ============ EXPORTACIÓN PARA MIGRACIÓN ============
    
    async exportForMigration() {
        await this.db.read();
        
        const exportData = {
            players: this.db.data.players,
            total: Object.keys(this.db.data.players).length,
            exportDate: new Date().toISOString(),
            format: 'mongodb-ready',
            schemaVersion: '2.0.0'
        };
        
        const exportPath = join(__dirname, 'backups', `migration_v2_${Date.now()}.json`);
        fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
        
        return {
            success: true,
            playersExported: Object.keys(this.db.data.players).length,
            file: exportPath,
            version: '2.0.0'
        };
    }
    
    // ============ UTILIDADES ============
    
    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;
        
        // Escribir en archivo de log
        const logPath = join(__dirname, 'logs', 'activity.log');
        fs.appendFileSync(logPath, logMessage);
        
        // También mostrar en consola si es importante
        if (message.includes('ERROR') || message.includes('WARNING') || message.includes('CRITICAL')) {
            console.log(`[DB v2] ${message}`);
        }
    }
    
    // ============ ESTADÍSTICAS DEL SISTEMA MEJORADAS ============
    
    async getSystemStats() {
        await this.db.read();
        
        const players = Object.values(this.db.data.players);
        
        // Estadísticas avanzadas de los nuevos sistemas
        const advancedStats = {
            totalAchievements: players.reduce((sum, p) => sum + (p.achievements?.unlocked?.length || 0), 0),
            totalContestPoints: players.reduce((sum, p) => sum + (p.contests?.points || 0), 0),
            totalDaycarePokemon: players.reduce((sum, p) => {
                let count = 0;
                if (p.daycare?.pokemon1) count++;
                if (p.daycare?.pokemon2) count++;
                if (p.daycare?.egg) count++;
                return sum + count;
            }, 0),
            activeMissions: players.reduce((sum, p) => {
                const missions = p.missions || {};
                return sum + (missions.daily?.length || 0) + (missions.story?.length || 0) + (missions.event?.length || 0);
            }, 0),
            totalHistoryEntries: players.reduce((sum, p) => {
                const history = p.history || {};
                return Object.values(history).reduce((hSum, arr) => hSum + (arr?.length || 0), 0);
            }, 0)
        };
        
        return {
            database: {
                totalPlayers: Object.keys(this.db.data.players).length,
                fileSize: fs.existsSync(join(__dirname, 'players.json')) 
                    ? fs.statSync(join(__dirname, 'players.json')).size 
                    : 0,
                lastBackup: this.db.data.metadata.lastBackup,
                schemaVersion: '2.0.0',
                uptime: process.uptime()
            },
            performance: {
                cacheSize: this.cache.playerCache.size,
                historyCacheSize: this.cache.historyCache.size,
                memoryUsage: process.memoryUsage(),
                loadAvg: process.cpuUsage()
            },
            limits: {
                maxPlayers: this.config.MAX_PLAYERS,
                warningThreshold: this.config.WARNING_THRESHOLD,
                currentStatus: Object.keys(this.db.data.players).length >= this.config.MAX_PLAYERS ? 'FULL' : 'OK'
            },
            advancedStats: advancedStats
        };
    }
    
}

// Exportar instancia única
export const pokemonDB = new PokemonDatabase();