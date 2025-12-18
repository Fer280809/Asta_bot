import ws from 'ws'

const handler = async (m, { conn, usedPrefix, botname }) => {
    const chat = global.db.data.chats[m.chat]
    
    // 1. Filtrar Sockets activos (SubBots y Main)
    const subBots = [...new Set([
        ...global.conns
            .filter(c => c.user && c.ws.socket && c.ws.socket.readyState !== ws.CLOSED)
            .map(c => c.user.jid),
        global.conn?.user?.jid
    ].filter(Boolean))]

    // 2. Identificar al candidato
    const who = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : false)
    
    if (!who) return m.reply(`🤖 *Selección de Bot Principal*\n\nMenciona o responde a un SubBot de *${botname}* para designarlo como bot principal de este grupo.`)

    // 3. Validaciones de seguridad
    if (!subBots.includes(who)) return m.reply(`⚠️ *Bot no válido* Solo puedes designar como principal a un SubBot activo de *${botname}*.`)

    if (chat.primaryBot === who) {
        return m.reply(`ℹ️ @${who.split`@`[0]} ya es el bot principal de este grupo.`, null, { mentions: [who] })
    }

    try {
        // 4. Establecer nuevo Bot Principal
        chat.primaryBot = who
        
        const texto = `
🤖 *NUEVO BOT PRINCIPAL*
━━━━━━━━━━━━━━━━━━━━━━━
@${who.split`@`[0]} ha sido designado como el **Bot Principal** de este grupo.

⚙️ *Efecto:* A partir de ahora, solo él responderá a los comandos aquí.
━━━━━━━━━━━━━━━━━━━━━━━
『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡`.trim()

        await conn.sendMessage(m.chat, { 
            text: texto, 
            mentions: [who] 
        }, { quoted: m })
        
        await m.react('🤖')

    } catch (e) {
        m.reply(`⚠️ *Error* No se pudo configurar el bot principal.\n${e.message}`)
    }
}

// MISMOS HELP, TAGS, COMMAND
handler.help = ['setprimary']
handler.tags = ['grupo']
handler.command = ['setprimary', 'botprincipal']
handler.group = true
handler.admin = true

export default handler
