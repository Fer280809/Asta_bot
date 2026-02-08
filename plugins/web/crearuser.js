// plugins/owner-createuser.js
// Comando para owners: crear usuario web para AstaFile

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Verificar si es owner
    const isOwner = global.owner.includes(m.sender.split('@')[0])
    if (!isOwner) {
        return m.reply('❌ *Este comando es solo para owners*')
    }

    // Parsear argumentos: .createuser usuario contraseña
    const args = text.trim().split(/\s+/)
    if (args.length < 2) {
        return m.reply(`
*Formato incorrecto*

Uso:
${usedPrefix + command} <usuario> <contraseña>

Ejemplo:
${usedPrefix + command} admin123 miPasswordSegura

*Nota:* El usuario podrá acceder al panel web en:
http://tu-servidor:3000
        `.trim())
    }

    const username = args[0]
    const password = args[1]

    // Validaciones
    if (username.length < 3) {
        return m.reply('❌ El usuario debe tener al menos 3 caracteres')
    }

    if (password.length < 6) {
        return m.reply('❌ La contraseña debe tener al menos 6 caracteres')
    }

    // Verificar si la función global existe
    if (!global.createWebUser) {
        return m.reply('❌ El sistema web no está iniciado. Reinicia el bot.')
    }

    // Crear usuario
    const result = global.createWebUser(username, password, m.sender.split('@')[0])

    if (result.success) {
        m.reply(`
✅ *Usuario Web Creado Exitosamente*

📋 *Datos de acceso:*
• Usuario: ${username}
• Contraseña: ${password}
• Creado por: @${m.sender.split('@')[0]}

🔗 *Acceso al panel:*
http://${global.publicIP || 'localhost'}:3000

⚠️ *Guarda estos datos en un lugar seguro*
        `.trim(), null, {
            mentions: [m.sender]
        })

        // Notificar por privado también
        conn.sendMessage(m.sender, {
            text: `
🔐 *Credenciales AstaFile*

Usuario: ${username}
Contraseña: ${password}

Guarda esta información.
            `.trim()
        })
    } else {
        m.reply(`❌ *Error:* ${result.error}`)
    }
}

handler.help = ['createuser <usuario> <contraseña>']
handler.tags = ['owner']
handler.command = ['createuser', 'crearuser', 'adduser', 'nuevouser']
handler.rowner = true

export default handler
