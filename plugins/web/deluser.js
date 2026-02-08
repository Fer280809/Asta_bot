let handler = async (m, { conn, text, usedPrefix, command }) => {
    const isOwner = global.owner.includes(m.sender.split('@')[0])
    if (!isOwner) {
        return m.reply('❌ *Este comando es solo para owners*')
    }

    const username = text.trim()
    if (!username) {
        return m.reply(`Uso: ${usedPrefix + command} <usuario>\n\nEjemplo: ${usedPrefix + command} admin`)
    }

    try {
        const fs = require('fs')
        if (!fs.existsSync('./webusers.json')) {
            return m.reply('❌ No hay usuarios registrados')
        }

        const data = fs.readFileSync('./webusers.json', 'utf-8')
        let users = JSON.parse(data)

        // Buscar usuario
        const userIndex = users.findIndex(u => u.username === username)
        if (userIndex === -1) {
            return m.reply(`❌ El usuario *${username}* no existe`)
        }

        // Eliminar usuario
        const deletedUser = users.splice(userIndex, 1)[0]

        // Guardar cambios
        fs.writeFileSync('./webusers.json', JSON.stringify(users, null, 2))

        // Actualizar Map en memoria si existe
        if (global.webUsers) {
            global.webUsers.delete(username)
        }

        m.reply(`✅ Usuario *${username}* eliminado exitosamente\n🗑️ Eliminado por: ${m.sender.split('@')[0]}`)

        // Agregar log al sistema
        if (global.addSystemLog) {
            global.addSystemLog(`Usuario web eliminado: ${username}`, 'warning')
        }

    } catch (error) {
        console.error(error)
        m.reply('❌ Error al eliminar usuario: ' + error.message)
    }
}

handler.help = ['deluser <usuario>']
handler.tags = ['owner']
handler.command = ['deluser']
handler.rowner = true

export default handler