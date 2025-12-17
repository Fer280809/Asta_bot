let handler = async (m, { conn, usedPrefix, command }) => {
    // 1. Verificación de cita
    if (!m.quoted) {
        return conn.reply(m.chat, `🎁 *¡Ho Ho Ho!* Para desaparecer un mensaje, debes citarlo (responder a él).`, m)
    }

    try {
        // 2. Reacción de confirmación (Magia navideña)
        await m.react('✨')

        // 3. Protección: Evitar borrar mensajes del Dueño/Owner por error
        const isOwner = m.quoted.sender.split('@')[0] === global.owner[0][0]
        if (isOwner && !m.fromMe) {
            return m.reply('❄️ *¡Uy!* No puedo borrar los mensajes de Santa (Owner). Es demasiado poderoso.')
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
            m.reply('⚠️ *¡Rayos!* No pude borrar el mensaje. Asegúrate de que no sea muy antiguo y que yo sea administrador.')
        }
    }
}

handler.help = ['delete']
handler.tags = ['grupo']
handler.command = ['del', 'delete', 'borrar']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
