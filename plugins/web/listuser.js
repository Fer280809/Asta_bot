let handler = async (m, { conn, usedPrefix, command }) => {
    const isOwner = global.owner.includes(m.sender.split('@')[0])
    if (!isOwner) {
        return m.reply('❌ *Este comando es solo para owners*')
    }

    // Verificar si el sistema web está iniciado
    if (!global.listWebUsers) {
        return m.reply('❌ El sistema web no está iniciado. Reinicia el bot.')
    }

    const users = global.listWebUsers()
    
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
}

handler.help = ['listusers']
handler.tags = ['owner']
handler.command = ['listusers']
handler.rowner = true

export default handler