let handler = async (m, { conn, usedPrefix, command }) => {
    const isOwner = global.owner.includes(m.sender.split('@')[0])
    if (!isOwner) {
        return m.reply('❌ *Este comando es solo para owners*')
    }

    try {
        const fs = require('fs')
        let users = []
        
        if (fs.existsSync('./webusers.json')) {
            const data = fs.readFileSync('./webusers.json', 'utf-8')
            users = JSON.parse(data)
        }

        if (users.length === 0) {
            return m.reply('📭 No hay usuarios web registrados')
        }

        let userList = '📋 *Usuarios Web Registrados*\n\n'
        users.forEach((user, i) => {
            userList += `👤 *Usuario ${i + 1}:*\n`
            userList += `   ├─ 📛 Nombre: ${user.username}\n`
            userList += `   ├─ 👨‍💻 Creado por: ${user.createdBy || 'Desconocido'}\n`
            userList += `   ├─ 📅 Fecha: ${new Date(user.createdAt).toLocaleDateString('es-ES')}\n`
            userList += `   └─ 🎚️ Nivel: ${user.level || 'user'}\n\n`
        })

        userList += `📊 Total: ${users.length} usuario(s)`

        m.reply(userList)

    } catch (error) {
        console.error(error)
        m.reply('❌ Error al listar usuarios: ' + error.message)
    }
}

handler.help = ['listusers']
handler.tags = ['owner']
handler.command = ['listusers']
handler.rowner = true

export default handler