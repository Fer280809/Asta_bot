import { createHash } from 'crypto'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const user = global.db.data.users[m.sender]
    
    // Verificar si el usuario está registrado
    if (!user || user.registered !== true) {
        return conn.reply(m.chat, `❌ *No estás registrado*\n\nUsa *${usedPrefix}reg* para registrarte.`, m)
    }

    // Si no se proporciona texto, mostrar información y cómo eliminar
    if (!text) {
        let txt = `⚠️ *ELIMINAR REGISTRO* ⚠️\n\n`
        txt += `👤 *Nombre:* ${user.name || 'No especificado'}\n`
        txt += `🎂 *Edad:* ${user.age || 'No especificada'}\n`
        txt += `🆔 *Serial:* ${user.serial || 'No disponible'}\n\n`
        txt += `Para eliminar tu registro, envía el comando con tu *serial*:\n`
        txt += `*${usedPrefix}${command} ${user.serial}*\n\n`
        txt += `⚠️ *Esta acción es irreversible.*`
        return conn.reply(m.chat, txt, m)
    }

    // Verificar el serial
    const inputSerial = text.trim()
    if (inputSerial !== user.serial) {
        return conn.reply(m.chat, `❌ *Serial incorrecto*\n\nPor favor, verifica tu serial y vuelve a intentarlo.`, m)
    }

    // Confirmación final (opcional, se puede saltar si ya se envió el serial correcto)
    // Para mayor seguridad, podríamos pedir una confirmación adicional, pero lo dejamos así.

    // Guardar nombre para mensaje de despedida
    const nombre = user.name || 'Usuario'

    // Eliminar datos de registro
    delete user.registered
    delete user.registro
    delete user.name
    delete user.age
    delete user.genre
    delete user.birth
    delete user.regTime
    delete user.serial
    // También podríamos eliminar cualquier otro campo personal que se haya agregado después

    // Mensaje de éxito
    let txt = `✅ *¡REGISTRO ELIMINADO!* ✅\n\n`
    txt += `👋 *${nombre}*, tus datos han sido eliminados del sistema.\n`
    txt += `Si deseas volver a registrarte, usa *${usedPrefix}reg*.\n\n`
    txt += `*¡Gracias por usar el bot!*`

    await conn.sendMessage(m.chat, { 
        text: txt,
        mentions: [m.sender]
    }, { quoted: m })
}

handler.help = ['unreg', 'deleteuser', 'eliminarregistro']
handler.tags = ['rg']
handler.command = ['unreg', 'deleteuser', 'eliminarregistro']

export default handler
