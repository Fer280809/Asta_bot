var handler = async (m, { conn, usedPrefix, command, text }) => {
    // Obtener usuario de múltiples formas
    let user = null

    // 1. Usuario mencionado
    if (m.mentionedJid && m.mentionedJid.length) {
        user = m.mentionedJid[0]
    }
    // 2. Mensaje citado
    else if (m.quoted && m.quoted.sender) {
        user = m.quoted.sender
    }
    // 3. Número directo escrito
    else if (text) {
        let number = text.replace(/[^0-9]/g, '')
        if (number.length >= 10) {
            user = number + '@s.whatsapp.net'
        }
    }

    if (!user) {
        return conn.reply(m.chat, `❀ Debes mencionar a un usuario, responder a su mensaje o escribir su número para poder expulsarlo del grupo.\n\n*Ejemplos:*\n• ${usedPrefix + command} @usuario\n• ${usedPrefix + command} 123456789\n• Responder al mensaje con ${usedPrefix + command}`, m)
    }

    try {
        // Obtener metadatos actualizados del grupo
        const groupInfo = await conn.groupMetadata(m.chat)
        const participants = groupInfo.participants // Participantes actualizados
        const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
        const ownerBot = global.owner[0][0] + '@s.whatsapp.net'

        // Verificar si el usuario está en el grupo (con datos actualizados)
        const isInGroup = participants.some(p => p.id === user)
        if (!isInGroup) {
            return conn.reply(m.chat, `⚠️ El usuario @${user.split('@')[0]} no se encuentra en este grupo.`, m, { mentions: [user] })
        }

        // Verificaciones de seguridad
        if (user === conn.user.jid) {
            return conn.reply(m.chat, `ꕥ No puedo eliminar el bot del grupo.`, m)
        }
        if (user === ownerGroup) {
            return conn.reply(m.chat, `ꕥ No puedo eliminar al propietario del grupo.`, m)
        }
        if (user === ownerBot) {
            return conn.reply(m.chat, `ꕥ No puedo eliminar al propietario del bot.`, m)
        }

        // Verificar si el usuario es admin
        const isAdmin = participants.find(p => p.id === user)?.admin
        if (isAdmin) {
            return conn.reply(m.chat, `⚠️ No puedo eliminar a @${user.split('@')[0]} porque es administrador del grupo.`, m, { mentions: [user] })
        }

        // Eliminar usuario
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')

        // Mensaje de confirmación
        await conn.reply(m.chat, `✅ Usuario @${user.split('@')[0]} ha sido eliminado del grupo.`, m, { mentions: [user] })

    } catch (e) {
        console.error(e)
        // Manejo específico de errores comunes
        if (e.message.includes('404') || e.message.includes('not found')) {
            return conn.reply(m.chat, `⚠️ El usuario ya no está en el grupo o no existe.`, m)
        }
        if (e.message.includes('403') || e.message.includes('forbidden')) {
            return conn.reply(m.chat, `⚠️ No tengo permisos para eliminar a este usuario. Verifica que soy administrador.`, m)
        }
        conn.reply(m.chat, `⚠️ Se ha producido un problema al intentar eliminar al usuario.\n> Usa *${usedPrefix}report* para informarlo.\n\n*Error:* ${e.message}`, m)
    }
}

handler.help = ['kick @usuario / número']
handler.tags = ['grupo']
handler.command = ['kick', 'echar', 'hechar', 'sacar']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler