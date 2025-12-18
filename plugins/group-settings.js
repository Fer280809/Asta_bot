let handler = async (m, { conn, command }) => {
    let isClose = { 
        'open': 'not_announcement', 
        'abrir': 'not_announcement', 
        'close': 'announcement', 
        'cerrar': 'announcement', 
    }[command]

    try {
        await conn.groupSettingUpdate(m.chat, isClose)

        if (isClose === 'not_announcement') {
            const textoOpen = `
🔓 *CHAT ABIERTO*
━━━━━━━━━━━━━━━━━━━━━━━
El chat ha sido abierto. Todos los miembros pueden escribir y participar.

✅ *Estado:* Chat Libre
👥 *Permisos:* Todos pueden escribir
━━━━━━━━━━━━━━━━━━━━━━━`.trim()
            
            await m.reply(textoOpen)
            await m.react('🔓')

        } else {
            const textoClose = `
🔒 *CHAT CERRADO*
━━━━━━━━━━━━━━━━━━━━━━━
El chat ha sido cerrado. Solo los **administradores** pueden escribir.

⚠️ *Estado:* Solo Admins
🔐 *Permisos:* Chat Restringido
━━━━━━━━━━━━━━━━━━━━━━━`.trim()

            await m.reply(textoClose)
            await m.react('🔒')
        }
    } catch (e) {
        m.reply(`⚠️ *Error* No se pudo cambiar el estado del chat.\n${e.message}`)
    }
}

// MISMOS HELP, TAGS, COMMAND, PERMISOS
handler.help = ['abrir', 'cerrar']
handler.tags = ['grupo']
handler.command = /^(open|abrir|close|cerrar)$/i
handler.admin = true
handler.botAdmin = true
handler.group = true

export default handler
