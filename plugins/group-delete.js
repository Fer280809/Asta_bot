let handler = async (m, { conn, usedPrefix, command }) => {
    // 1. Verificación de cita
    if (!m.quoted) {
        return conn.reply(m.chat, `📝 Para eliminar un mensaje, debes citarlo (responder a él).`, m)
    }

    try {
        // 2. Reacción de confirmación
        await m.react('🗑️')

        // 3. Protección: Evitar borrar mensajes del Owner por error
        const isOwner = m.quoted.sender.split('@')[0] === global.owner[0][0]
        if (isOwner && !m.fromMe) {
            return m.reply('⚠️ No puedo borrar los mensajes del propietario del bot.')
        }

        // 4. Ejecución de borrado (Usando la lógica optimizada de Baileys)
        return await conn.sendMessage(m.chat, { 
            delete: { 
                remoteJid: m.chat, 
                fromMe: m.quoted.fromMe, 
                id: m.quoted.id, 
                participant: m.quoted.sender 
            } 
        })

    } catch (e) {
        // Fallback en caso de que falle la lógica anterior
        console.error(e)
        try {
            return await m.quoted.delete()
        } catch (err2) {
            m.reply('❌ No pude borrar el mensaje. Verifica que sea reciente y que yo sea administrador.')
        }
    }
}

// MISMOS HELP, TAGS, COMMAND
handler.help = ['delete']
handler.tags = ['grupo']
handler.command = ['del', 'delete', 'borrar']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
