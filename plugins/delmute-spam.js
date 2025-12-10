// Comando para desmutear usuarios sancionados por el anti-spam
// Solo administradores pueden usar este comando

let handler = async (m, { conn, isAdmin, args, text }) => {
    // Verificar que sea un grupo
    if (!m.isGroup) {
        return conn.reply(m.chat, '❌ Este comando solo funciona en grupos', m)
    }
    
    // Verificar que sea administrador
    if (!isAdmin) {
        return conn.reply(m.chat, '❌ Solo administradores pueden desmutear usuarios', m)
    }
    
    // Verificar que se haya mencionado a alguien
    if (!args[0]) {
        return conn.reply(m.chat, 
            `⚠️ *Uso incorrecto*\n\n` +
            `*Uso:* ${conn.prefix}delmutes @usuario\n` +
            `*Ejemplo:* ${conn.prefix}delmutes @52123456789\n\n` +
            `> Esto demuteará al usuario pero mantendrá sus advertencias`, m)
    }
    
    // Obtener el usuario mencionado
    let user
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        user = m.mentionedJid[0]
    } else {
        // Limpiar el número y agregar @s.whatsapp.net
        const cleanNumber = args[0].replace('@', '').replace(/[^0-9]/g, '')
        user = cleanNumber + '@s.whatsapp.net'
    }
    
    // Verificar que el usuario existe en la base de datos
    if (!global.db.data.users[user]) {
        return conn.reply(m.chat, 
            `❌ Usuario no encontrado en la base de datos\n\n` +
            `> Asegúrate de escribir el número correctamente`, m)
    }
    
    // Verificar que el usuario tenga datos de spam
    if (!global.db.data.users[user].spam) {
        return conn.reply(m.chat, 
            `⚠️ @${user.split('@')[0]} no tiene historial de spam`, 
            m, { mentions: [user] })
    }
    
    const userSpam = global.db.data.users[user].spam
    const now = Date.now()
    
    // Verificar si el usuario está muteado
    if (!userSpam.muted || now >= userSpam.muteEnd) {
        return conn.reply(m.chat, 
            `⚠️ @${user.split('@')[0]} no está muteado actualmente\n\n` +
            `📊 Advertencias actuales: *${userSpam.warnings}*\n` +
            `🔄 Se resetearán en: *${Math.ceil((5 * 60 * 60 * 1000 - (now - userSpam.lastWarningReset)) / 3600000)}h*`, 
            m, { mentions: [user] })
    }
    
    // Calcular tiempo restante del mute
    const timeLeft = Math.ceil((userSpam.muteEnd - now) / 60000)
    const hoursLeft = Math.floor(timeLeft / 60)
    const minutesLeft = timeLeft % 60
    
    let timeText = ''
    if (hoursLeft > 0) {
        timeText = `${hoursLeft}h ${minutesLeft}m`
    } else {
        timeText = `${minutesLeft}m`
    }
    
    // Desmutear al usuario
    userSpam.muted = false
    userSpam.muteEnd = 0
    userSpam.deleteCount = 0
    userSpam.messages = []
    
    // Mensaje de confirmación
    await conn.reply(m.chat, 
        `✅ *Usuario Desmuteado*\n\n` +
        `👤 Usuario: @${user.split('@')[0]}\n` +
        `⏰ Tiempo restante cancelado: ${timeText}\n` +
        `📊 Advertencias: *${userSpam.warnings}* (mantenidas)\n` +
        `🔄 Se resetearán en: *${Math.ceil((5 * 60 * 60 * 1000 - (now - userSpam.lastWarningReset)) / 3600000)}h*\n\n` +
        `⚠️ Si vuelve a hacer spam, será muteado con el tiempo correspondiente a sus advertencias acumuladas`, 
        m, { mentions: [user] })
    
    console.log(`[AntiSpam] ${user} fue desmuteado manualmente por un admin`)
}

handler.help = ['delmutes']
handler.tags = ['group']
handler.command = ['delmutes', 'unmutes', 'desmutears']
handler.group = true
handler.admin = true

export default handler