var handler = async (m, { conn, usedPrefix, command, text, groupMetadata }) => {
    // 1. Identificar al usuario (mención o cita)
    let mentionedJid = await m.mentionedJid
    let user = mentionedJid && mentionedJid.length ? mentionedJid[0] : m.quoted ? m.quoted.sender : null

    if (!user) return conn.reply(m.chat, `⚠️ Para dar admin, debes mencionar a alguien o responder a su mensaje.`, m)

    try {
        const groupInfo = await conn.groupMetadata(m.chat)
        const ownerGroup = groupInfo.owner || m.chat.split('-')[0] + '@s.whatsapp.net'
        
        // 2. Verificar si ya es admin
        const isAdmin = groupInfo.participants.find(p => p.id === user)?.admin
        if (user === ownerGroup || isAdmin) {
            return conn.reply(m.chat, `ℹ️ Este usuario ya es administrador.`, m)
        }

        // 3. Ejecutar el ascenso
        await conn.groupParticipantsUpdate(m.chat, [user], 'promote')
        
        // 4. Mensaje de confirmación
        await m.react('✅')
        const tag = `@${user.split('@')[0]}`
        const info = `
📈 *NUEVO ADMINISTRADOR*
━━━━━━━━━━━━━━━━━━━━━━━
¡Felicidades ${tag}! Has sido ascendido a *Administrador* del grupo.

Ahora tienes permisos para gestionar el grupo. ¡Usa tus permisos responsablemente!
━━━━━━━━━━━━━━━━━━━━━━━`.trim()

        conn.reply(m.chat, info, m, { mentions: [user] })

    } catch (e) {
        await m.react('❌')
        conn.reply(m.chat, `⚠️ Error al dar admin.\n${e.message}`, m)
    }
}

// MISMOS HELP, TAGS, COMMAND
handler.help = ['promote']
handler.tags = ['grupo']
handler.command = ['promote', 'promover', 'daradmin']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
