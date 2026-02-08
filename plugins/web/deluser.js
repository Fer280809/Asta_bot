let handler = async (m, { conn, text, usedPrefix, command }) => {
    const isOwner = global.owner.includes(m.sender.split('@')[0])
    if (!isOwner) {
        return m.reply('❌ *Este comando es solo para owners*')
    }

    const username = text.trim()
    if (!username) {
        return m.reply(`Uso: ${usedPrefix + command} <usuario>\n\nEjemplo: ${usedPrefix + command} admin`)
    }

    // Verificar si el sistema web está iniciado
    if (!global.deleteWebUser) {
        return m.reply('❌ El sistema web no está iniciado. Reinicia el bot.')
    }

    // Eliminar usuario usando la función global
    const result = global.deleteWebUser(username)
    
    if (result.success) {
        m.reply(`✅ Usuario *${username}* eliminado exitosamente\n🗑️ Eliminado por: ${m.sender.split('@')[0]}`)
    } else {
        m.reply(`❌ Error: ${result.error}`)
    }
}

handler.help = ['deluser <usuario>']
handler.tags = ['owner']
handler.command = ['deluser']
handler.rowner = true

export default handler