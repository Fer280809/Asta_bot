let handler = async (m, { conn, text, usedPrefix, command }) => {
    const isOwner = global.owner.includes(m.sender.split('@')[0])
    if (!isOwner) {
        return m.reply('❌ *Este comando es solo para owners*')
    }

    const args = text.trim().split(/\s+/)
    if (args.length < 2) {
        return m.reply(`Uso: ${usedPrefix + command} <usuario> <contraseña>`)
    }

    const username = args[0]
    const password = args[1]
    const createdBy = m.sender.split('@')[0]

    // Verificar si el sistema web está iniciado
    if (!global.createWebUser) {
        return m.reply('❌ El sistema web no está iniciado. Reinicia el bot.')
    }

    // Crear usuario usando la función global
    const result = global.createWebUser(username, password, createdBy)
    
    if (result.success) {
        m.reply(`✅ Usuario *${username}* creado exitosamente\n📝 Creado por: ${createdBy}\n🔐 Contraseña: ${password}`)
    } else {
        m.reply(`❌ Error: ${result.error}`)
    }
}

handler.help = ['crearuser <usuario> <contraseña>']
handler.tags = ['owner']
handler.command = ['crearuser']
handler.rowner = true

export default handler