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
