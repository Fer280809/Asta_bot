import ws from 'ws'

const handler = async (m, { conn, usedPrefix }) => {
    const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn.user.jid)])]
    if (global.conn?.user?.jid && !subBots.includes(global.conn.user.jid)) {
        subBots.push(global.conn.user.jid)
    }

    const chat = global.db.data.chats[m.chat]
    const mentionedJid = await m.mentionedJid
    const who = mentionedJid[0] ? mentionedJid[0] : m.quoted ? await m.quoted.sender : false

    if (!who) return conn.reply(m.chat, `❌ *ASTA-BOT* ❌\n> Por favor, menciona un Socket para establecerlo como Bot principal del grupo.`, m)
    if (!subBots.includes(who)) return conn.reply(m.chat, `⚠️ @${who.split('@')[0]} no es un Socket válido de *${botname}*.`, m)
    if (chat.primaryBot === who) return conn.reply(m.chat, `⚠️ @${who.split('@')[0]} ya es el Bot primario de este grupo.`, m, { mentions: [who] })

    try {
        chat.primaryBot = who
        conn.reply(m.chat, `╭━〔🤖 *BOT PRIMARIO ASIGNADO* 🤖〕━╮
 ┃
 ┃ ✅ @${who.split('@')[0]} ha sido establecido como Bot principal del grupo.
 ┃ > Ahora todos los comandos de este grupo serán ejecutados por @${who.split('@')[0]}.
 ╰━━━━━━━━━━━━╯`, m, { mentions: [who] })
    } catch (e) {
        conn.reply(m.chat, `⚠️ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}`, m)
    }
}

handler.help = ['setprimary']
handler.tags = ['grupo']
handler.command = ['setprimary']
handler.group = true
handler.admin = true

export default handler
