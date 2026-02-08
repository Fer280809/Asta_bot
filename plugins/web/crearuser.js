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

    // Verificar si ya existe el usuario
    if (global.webUsers && global.webUsers.has(username)) {
        return m.reply(`❌ El usuario *${username}* ya existe`)
    }

    try {
        // Crear usuario en el sistema web
        const newUser = {
            username,
            password: password, // En producción, deberías hashear la contraseña
            createdBy,
            createdAt: new Date().toISOString(),
            level: 'user'
        }

        // Cargar usuarios existentes
        let users = []
        try {
            const fs = require('fs')
            if (fs.existsSync('./webusers.json')) {
                const data = fs.readFileSync('./webusers.json', 'utf-8')
                users = JSON.parse(data)
            }
        } catch (e) {}

        // Verificar si usuario ya existe
        if (users.some(u => u.username === username)) {
            return m.reply(`❌ El usuario *${username}* ya existe`)
        }

        // Agregar nuevo usuario
        users.push(newUser)

        // Guardar en archivo
        const fs = require('fs')
        fs.writeFileSync('./webusers.json', JSON.stringify(users, null, 2))

        // Actualizar el Map en memoria si existe
        if (global.webUsers) {
            global.webUsers.set(username, newUser)
        }

        m.reply(`✅ Usuario *${username}* creado exitosamente\n📝 Creado por: ${createdBy}\n🔐 Contraseña: ${password}`)
        
        // Agregar log al sistema
        if (global.addSystemLog) {
            global.addSystemLog(`Nuevo usuario web creado: ${username}`, 'success')
        }

    } catch (error) {
        console.error(error)
        m.reply('❌ Error al crear usuario: ' + error.message)
    }
}

handler.help = ['crearuser <usuario> <contraseña>']
handler.tags = ['owner']
handler.command = ['crearuser']
handler.rowner = true

export default handler