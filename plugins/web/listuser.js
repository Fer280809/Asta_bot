// plugins/owner-listusers.js
// Comando para owners: listar usuarios web

let handler = async (m, { conn }) => {
    const isOwner = global.owner.includes(m.sender.split('@')[0])
    if (!isOwner) {
        return m.reply('❌ *Este comando es solo para owners*')
    }

    if (!global.listWebUsers) {
        return m.reply('❌ El sistema web no está iniciado')
    }

    const users = global.listWebUsers()

    if (users.length === 0) {
        return m.reply('📋 *No hay usuarios web creados*')
    }

    let text = `👥 *Usuarios Web AstaFile* (${users.length})\n\n`

    users.forEach((user, i) => {
        text += `*${i + 1}.* ${user.username}\n`
        text += `   Creado por: @${user.createdBy}\n`
        text += `   Fecha: ${new Date(user.createdAt).toLocaleString()}\n\n`
    })

    m.reply(text.trim(), null, {
        mentions: users.map(u => u.createdBy + '@s.whatsapp.net')
    })
}

handler.help = ['listusers']
handler.tags = ['owner']
handler.command = ['listusers', 'usuariosweb', 'webusers', 'users']
handler.rowner = true

export default handler