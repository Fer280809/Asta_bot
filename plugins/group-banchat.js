let handler = async (m, { conn, usedPrefix, command, args }) => {
    let chat = global.db.data.chats[m.chat]

    if (command === 'bot') {
        // Info general si no se pone argumento
        if (args.length === 0) {
            const estado = chat.isBanned ? '✗ Desactivado' : '✓ Activado'
            const info = `╭━〔🤖 *GESTIÓN DEL BOT* 🤖〕━╮
 ┃
 ┃ Un administrador puede activar o desactivar a *${botname}* usando los siguientes comandos:
 ┃
 ┃ ✐ Activar » *${usedPrefix}bot on*
 ┃ ✐ Desactivar » *${usedPrefix}bot off*
 ┃
 ┃ ✧ Estado actual » *${estado}*
 ╰━━━━━━━━━━━━╯`
            return conn.reply(m.chat, info, m)
        }

        // Desactivar Bot
        if (args[0].toLowerCase() === 'off') {
            if (chat.isBanned) {
                return conn.reply(m.chat, `⚠️ *${botname}* ya estaba desactivado.`, m)
            }
            chat.isBanned = true
            return conn.reply(m.chat, `╭━〔🚫 *BOT DESACTIVADO* 🚫〕━╮
 ┃
 ┃ Has *desactivado* a ${botname} correctamente.
 ╰━━━━━━━━━━━━╯`, m)
        } 
        // Activar Bot
        else if (args[0].toLowerCase() === 'on') {
            if (!chat.isBanned) {
                return conn.reply(m.chat, `⚠️ *${botname}* ya estaba activado.`, m)
            }
            chat.isBanned = false
            return conn.reply(m.chat, `╭━〔✅ *BOT ACTIVADO* ✅〕━╮
 ┃
 ┃ Has *activado* a ${botname} correctamente.
 ╰━━━━━━━━━━━━╯`, m)
        }
    }
}

handler.help = ['bot']
handler.tags = ['grupo']
handler.command = ['bot']
handler.admin = true

export default handler
