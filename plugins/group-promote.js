var handler = async (m, { conn, usedPrefix, command, text, groupMetadata }) => {
    // 1. Identificar al usuario (mención o cita)
    let mentionedJid = await m.mentionedJid
    let user = mentionedJid && mentionedJid.length ? mentionedJid[0] : m.quoted ? m.quoted.sender : null

    if (!user) return conn.reply(m.chat, `❄️ *¡Ho Ho Ho!* Para nombrar un nuevo Elfo Mayor, debes mencionar a alguien o responder a su mensaje.`, m)

    try {
        const groupInfo = await conn.groupMetadata(m.chat)
        const ownerGroup = groupInfo.owner || m.chat.split('-')[0] + '@s.whatsapp.net'
        
        // 2. Verificar si ya es admin
        const isAdmin = groupInfo.participants.find(p => p.id === user)?.admin
        if (user === ownerGroup || isAdmin) {
            return conn.reply(m.chat, `🌟 Este elfo ya tiene una estrella de administrador en su gorro.`, m)
        }

        // 3. Ejecutar el ascenso
        await conn.groupParticipantsUpdate(m.chat, [user], 'promote')
        
        // 4. Mensaje de confirmación festivo
        await m.react('⭐')
        const tag = `@${user.split('@')[0]}`
        const info = `
✨ *NUEVO NOMBRAMIENTO* ✨
━━━━━━━━━━━━━━━━━━━━━━━
¡Felicidades ${tag}! Has sido ascendido a *Elfo Mayor* (Admin).

Ahora tienes el poder de ayudar a Santa a dirigir esta Villa. ¡Usa tus poderes con sabiduría! 🎁
━━━━━━━━━━━━━━━━━━━━━━━`.trim()

        conn.reply(m.chat, info, m, { mentions: [user] })

    } catch (e) {
        await m.react('✖️')
        conn.reply(m.chat, `⚠️ *¡Rayos!* Hubo un problema al entregar la estrella de admin.\\n${e.message}`, m)
    }
}

handler.help = ['promote']
handler.tags = ['grupo']
handler.command = ['promote', 'promover', 'daradmin']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
