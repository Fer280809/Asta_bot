// plugins/owner-deleteuser.js
// Comando para owners: eliminar usuario web

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const isOwner = global.owner.includes(m.sender.split('@')[0])
    if (!isOwner) {
        return m.reply('❌ *Este comando es solo para owners*')
    }

    if (!text) {
        return m.reply(`
*Formato incorrecto*

Uso:
${usedPrefix + command} <usuario>

Ejemplo:
${usedPrefix + command} admin123
        `.trim())
    }

    const username = text.trim()

    if (!global.deleteWebUser) {
        return m.reply('❌ El sistema web no está iniciado')
    }

    const result = global.deleteWebUser(username)

    if (result.success) {
        m.reply(`✅ *Usuario "${username}" eliminado exitosamente*`)
    } else {
        m.reply(`❌ *Error:* ${result.error}`)
    }
}

handler.help = ['deleteuser <usuario>']
handler.tags = ['owner']
handler.command = ['deleteuser', 'deluser', 'removeuser', 'eliminaruser']
handler.rowner = true

export default handler
