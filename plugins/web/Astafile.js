// plugins/owner-astafile.js
let handler = async (m, { conn, text, usedPrefix, command }) => {
    const isOwner = global.owner.includes(m.sender.split('@')[0])
    if (!isOwner) {
        return m.reply('❌ *Este comando es solo para owners*')
    }

    const args = text.trim().split(/\s+/)
    const subcommand = args[0]?.toLowerCase()

    switch(subcommand) {
        case 'panel':
            const ip = await getPublicIP()
            const port = process.env.PORT || 3000
            m.reply(`
🌐 *Panel de Control AstaFile*

🔗 URL: http://${ip}:${port}
📱 Acceso desde cualquier dispositivo

👥 Usuarios creados: ${global.listWebUsers ? global.listWebUsers().length : 0}
⚡ Estado: ${global.astafileConfig ? 'Activo ✓' : 'Inactivo'}
            `.trim())
            break

        case 'crearuser':
            if (args.length < 3) {
                return m.reply(`Uso: ${usedPrefix + command} crearuser <usuario> <contraseña>`)
            }
            
            if (global.createWebUser) {
                const result = global.createWebUser(args[1], args[2], m.sender.split('@')[0])
                m.reply(result.success ? 
                    `✅ Usuario *${args[1]}* creado exitosamente` :
                    `❌ Error: ${result.error}`
                )
            }
            break

        case 'logs':
            const logs = systemLogs?.slice(-5) || []
            let logText = '📜 *Últimos Logs del Sistema*\n\n'
            logs.forEach((log, i) => {
                logText += `${i+1}. [${log.type.toUpperCase()}] ${log.message}\n`
            })
            m.reply(logText)
            break

        case 'stats':
            const stats = botStats || {}
            m.reply(`
📊 *Estadísticas del Bot*

💬 Mensajes: ${stats.messages || 0}
⚡ Comandos: ${stats.commands || 0}
👥 Usuarios Únicos: ${stats.users?.size || 0}
👥 Grupos Activos: ${stats.groups?.size || 0}
⏰ Tiempo Activo: ${formatTime(process.uptime())}
            `.trim())
            break

        default:
            m.reply(`
⚙️ *Comandos de AstaFile*

${usedPrefix + command} panel - Ver URL del panel
${usedPrefix + command} crearuser <user> <pass> - Crear usuario web
${usedPrefix + command} logs - Ver logs del sistema
${usedPrefix + command} stats - Ver estadísticas
${usedPrefix + command} restart - Reiniciar panel web
            `.trim())
    }
}

async function getPublicIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        return data.ip
    } catch {
        return 'localhost'
    }
}

handler.help = ['astafile']
handler.tags = ['owner']
handler.command = ['astafile', 'panel']
handler.rowner = true

export default handler