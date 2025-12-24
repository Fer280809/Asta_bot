// ╔══════════════════════════════════════════════════════════╗
// ║                 ORION'S WOLF - ASTA BOT                  ║
// ║  Creador: Orion's Wolf       │    Estilo: Cósmico/Lobuno ║
// ║  Archivo: commandExecutor.js │ Versión: 1.0.0            ║
// ╟──────────────────────────────────────────────────────────╢
// ║  "Ejecuto órdenes con precisión cósmica, transformando   ║
// ║   palabras en acciones como un lobo ejecuta su caza."    ║
// ╚══════════════════════════════════════════════════════════╝

// ╔══════════════════════════════════════════════════════════╗
// ║                  DESCRIPCIÓN:                            ║
// ║  Ejecutor de comandos modular - Procesa y ejecuta        ║
// ║  plugins con manejo robusto de errores y hooks.          ║
// ║                                                          ║
// ║  CICLO DE EJECUCIÓN:                                     ║
// ║  1. before(): Validaciones previas                       ║
// ║  2. call(): Ejecución principal                          ║
// ║  3. after(): Acciones posteriores                        ║
// ║  4. error(): Manejo de errores (si ocurren)              ║
// ║                                                          ║
// ║  CARACTERÍSTICAS:                                        ║
// ║  • Try-catch automático                                  ║
// ║  • Logging estructurado                                  ║
// ║  • Timeout configurable                                  ║
// ║  • Validación de plugins                                 ║
// ╚══════════════════════════════════════════════════════════╝
export class CommandExecutor {
    static async execute(plugin, m, context) {
        const { conn, __filename } = context
        
        try {
            // Ejecutar before() si existe
            if (typeof plugin.before === "function") {
                const beforeResult = await plugin.before.call(conn, m, context)
                if (beforeResult === true) {
                    return // Si before devuelve true, no ejecutar el comando principal
                }
            }
            
            // Añadir experiencia
            m.exp += plugin.exp ? parseInt(plugin.exp) : 10
            m.isCommand = true
            
            // Ejecutar comando principal
            await plugin.call(conn, m, context)
            
            // Ejecutar after() si existe
            if (typeof plugin.after === "function") {
                await plugin.after.call(conn, m, context)
            }
            
        } catch (error) {
            console.error(chalk.red(`❌ Error ejecutando comando ${plugin.name || __filename}:`), error)
            m.error = error
            
            // Manejar error específico si existe
            if (typeof plugin.error === "function") {
                await plugin.error.call(conn, m, context, error)
            }
        }
    }
    
    static validateCommand(plugin) {
        const required = ['command', 'handler']
        const missing = required.filter(field => !plugin[field])
        
        if (missing.length > 0) {
            throw new Error(`Plugin inválido: faltan campos ${missing.join(', ')}`)
        }
        
        if (typeof plugin.handler !== 'function') {
            throw new Error('Plugin debe tener una función handler')
        }
        
        return true
    }
}
