let handler = async (m, { conn, usedPrefix, command, text, participants }) => {
    // 1. Identificar al usuario (mención o cita)
    let user = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
    
    if (!user) return conn.reply(m.chat, `⚠️ Para quitar admin, debes mencionar a alguien o responder a su mensaje.`, m)

    try {
        const groupMetadata = await conn.groupMetadata(m.chat)
        const ownerGroup = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
        const ownerBot = global.owner[0][0] + '@s.whatsapp.net'
        
        // 2. Verificación de si el usuario es realmente Admin
        const isAdmin = participants.find(p => p.id === user)?.admin
        if (!isAdmin) return conn.reply(m.chat, `ℹ️ Este usuario ya no es administrador.`, m)

        // 3. Protecciones de Seguridad
        if (user === conn.user.jid) return conn.reply(m.chat, `❌ No puedo quitarme a mí mismo el rol de admin.`, m)
        if (user === ownerGroup) return conn.reply(m.chat, `❌ No puedes quitar admin al propietario del grupo.`, m)
        if (user === ownerBot) return conn.reply(m.chat, `❌ No puedes degradar al propietario del bot.`, m)

        // 4. Ejecución del cambio de rango
        await conn.groupParticipantsUpdate(m.chat, [user], 'demote')
        
        // 5. Mensaje de confirmación
        await m.react('📉')
        const tag = `@${user.split('@')[0]}`
        const info = `
📊 *CAMBIO DE ROL*
━━━━━━━━━━━━━━━━━━━━━━━
${tag} ha perdido su rol de *administrador*.

Ahora vuelve a ser un miembro normal del grupo.
━━━━━━━━━━━━━━━━━━━━━━━`.trim()

        conn.reply(m.chat, info, m, { mentions: [user] })

    } catch (e) {
        conn.reply(m.chat, `⚠️ Error al quitar admin.\n${e.message}`, m)
    }
}

// MISMOS HELP, TAGS, COMMAND
handler.help = ['demote']
handler.tags = ['grupo']
handler.command = ['demote', 'degradar', 'quitaradmin']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
