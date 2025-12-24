// ╔══════════════════════════════════════════════════════════╗
// ║               ORION'S WOLF - ASTA BOT                    ║
// ║  Creador: Orion's Wolf    │    Estilo: Cósmico/Lobuno    ║
// ║  Archivo: statsTracker.js │    Versión: 1.0.0            ║
// ╟──────────────────────────────────────────────────────────╢
// ║  "Observo cada interacción como estrella en mi mapa,     ║
// ║   trazando constelaciones de uso en el cielo digital."   ║
// ╚══════════════════════════════════════════════════════════╝

// ╔══════════════════════════════════════════════════════════╗
// ║  DESCRIPCIÓN:                                            ║
// ║  Rastreador de estadísticas - Monitorea en tiempo real   ║
// ║  el uso del bot, comandos populares y métricas clave.    ║
// ║                                                          ║
// ║  MÉTRICAS RECOLECTADAS:                                  ║
// ║  • Comandos totales ejecutados                           ║
// ║  • Comandos por usuario                                  ║
// ║  • Comandos más populares                                ║
// ║  • Uso por hora del día                                  ║
// ║  • Errores y excepciones                                 ║
// ║                                                          ║
// ║  INTERVALOS:                                             ║
// ║  • Actualización: En tiempo real                         ║
// ║  • Reset horario: Cada 60 minutos                        ║
// ║  • Persistencia: En memoria (volátil)                    ║
// ╚══════════════════════════════════════════════════════════╝
export class StatsTracker {
    constructor() {
        this.stats = {
            totalCommands: 0,
            commandsByUser: new Map(),
            commandsByType: new Map(),
            hourlyStats: new Map(),
            errors: 0
        }
        
        // Resetear estadísticas cada hora
        setInterval(() => this.resetHourly(), 60 * 60 * 1000)
    }
    
    trackCommand(userId, commandName) {
        this.stats.totalCommands++
        
        // Por usuario
        const userStats = this.stats.commandsByUser.get(userId) || { count: 0, lastCommand: null }
        userStats.count++
        userStats.lastCommand = { name: commandName, time: Date.now() }
        this.stats.commandsByUser.set(userId, userStats)
        
        // Por tipo
        const hour = new Date().getHours()
        const hourKey = `${hour}:00`
        const hourStats = this.stats.hourlyStats.get(hourKey) || 0
        this.stats.hourlyStats.set(hourKey, hourStats + 1)
        
        // Por comando
        const commandStats = this.stats.commandsByType.get(commandName) || 0
        this.stats.commandsByType.set(commandName, commandStats + 1)
    }
    
    trackError() {
        this.stats.errors++
    }
    
    getStats() {
        return {
            totalCommands: this.stats.totalCommands,
            totalUsers: this.stats.commandsByUser.size,
            topCommands: Array.from(this.stats.commandsByType.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10),
            hourly: Array.from(this.stats.hourlyStats.entries()),
            errors: this.stats.errors
        }
    }
    
    getUserStats(userId) {
        return this.stats.commandsByUser.get(userId) || { count: 0, lastCommand: null }
    }
    
    resetHourly() {
        this.stats.hourlyStats.clear()
    }
    
    clear() {
        this.stats = {
            totalCommands: 0,
            commandsByUser: new Map(),
            commandsByType: new Map(),
            hourlyStats: new Map(),
            errors: 0
        }
    }
}
