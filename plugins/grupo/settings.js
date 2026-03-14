let handler = async (m, { conn, usedPrefix, command }) => {
    let isClose = { 
        'open': 'not_announcement', 
        'abrir': 'not_announcement', 
        'close': 'announcement', 
        'cerrar': 'announcement', 
    }[command]

    await conn.groupSettingUpdate(m.chat, isClose)

    if (isClose === 'not_announcement') {
        m.reply(`✅ *¡El chat ha sido abierto!* ✅\nAhora todos los miembros pueden enviar mensajes 💬✨`)
    } else if (isClose === 'announcement') {
        m.reply(`🚨 *¡Modo solo admins activado!* 🚨\nSolo los administradores pueden enviar mensajes 🛡️`)
    }
}

handler.help = ['open', 'close', 'abrir', 'cerrar']
handler.tags = ['grupo']
handler.command = ['open', 'close', 'abrir', 'cerrar']
handler.admin = true
handler.botAdmin = true

export default handler