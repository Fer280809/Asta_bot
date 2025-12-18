let handler = async (m, { conn, usedPrefix, command, args }) => {
    let chat = global.db.data.chats[m.chat]
    let botname = global.botname || 'Asta-Bot'

    // 1. Mostrar estado si no hay argumentos
    if (args.length === 0) {
        const estado = chat.isBanned ? '🔴 DESACTIVADO' : '🟢 ACTIVADO'
        const info = `
╭━━〔 ⚙️ *CONTROL DEL BOT* 〕━━╮
┃
┃ *¿Deseas cambiar mi estado?*
┃
┃ ✅ *Activar:*
┃ ✐ \`${usedPrefix}${command} on\`
┃
┃ ❌ *Desactivar:*
┃ ✐ \`${usedPrefix}${command} off\`
┃
┃ 📊 *Estado actual:*
┃ » ${estado}
╰━━━━━━━━━━━━━━━━━━╯`.trim()
        
        return conn.reply(m.chat, info, m)
    }

    // 2. Lógica de Encendido / Apagado
    const opcion = args[0].toLowerCase()

    if (opcion === 'on') {
        if (!chat.isBanned) return m.reply(`ℹ️ *${botname}* ya está activo en este grupo.`)
        
        chat.isBanned = false
        await m.react('✅')
        return m.reply(`╭━━━〔 🟢 *BOT ACTIVADO* 〕━━╮\n┃\n┃ El bot ha sido activado en este grupo.\n┃ *${botname}* vuelve a estar operativo.\n╰━━━━━━━━━━━━━━━━━━╯`)
    }

    if (opcion === 'off') {
        if (chat.isBanned) return m.reply(`ℹ️ El bot ya está desactivado en este grupo.`)
        
        chat.isBanned = true
        await m.react('❌')
        return m.reply(`╭━━━〔 🔴 *BOT DESACTIVADO* 〕━━╮\n┃\n┃ El bot ha sido desactivado en este grupo.\n┃ *Hasta que sea reactivado.*\n╰━━━━━━━━━━━━━━━━━━╯`)
    }
}

// MISMOS HELP, TAGS, COMMAND
handler.help = ['bot']
handler.tags = ['grupo']
handler.command = ['bot', 'botstatus']
handler.admin = true
handler.group = true

export default handler
