let handler = async (m, { conn, usedPrefix, command, text, participants }) => {
    // 1. Identificar al usuario (mención o cita)
    let user = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
    
    if (!user) return conn.reply(m.chat, `❄️ *¡Ho Ho Ho!* Para quitar un cargo, debes mencionar a alguien o responder a su mensaje.`, m)

    try {
        const groupMetadata = await conn.groupMetadata(m.chat)
        const ownerGroup = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
        const ownerBot = global.owner[0][0] + '@s.whatsapp.net'
        
        // 2. Verificación de si el usuario es realmente Admin
        const isAdmin = participants.find(p => p.id === user)?.admin
        if (!isAdmin) return conn.reply(m.chat, `🌟 Este usuario ya es un elfo normal, ¡no tiene estrella de admin para quitar!`, m)

        // 3. Protecciones de Seguridad Sagrada
        if (user === conn.user.jid) return conn.reply(m.chat, `🚫 No puedo quitarme mi propio gorro de Santa.`, m)
        if (user === ownerGroup) return conn.reply(m.chat, `🚫 No puedes bajar al Creador del trineo. ¡Él es el dueño de la Navidad!`, m)
        if (user === ownerBot) return conn.reply(m.chat, `🚫 No puedes degradar al Gran Santa (Owner del Bot).`, m)

        // 4. Ejecución del cambio de rango
        await conn.groupParticipantsUpdate(m.chat, [user], 'demote')
        
        // 5. Mensaje de confirmación festivo
        await m.react('📉')
        const tag = `@${user.split('@')[0]}`
        const info = `
❄️ *CAMBIO EN EL TALLER* ❄️
━━━━━━━━━━━━━━━━━━━━━━━
¡Oh no! ${tag} ha perdido su estrella de *Elfo Mayor*. 

Ahora vuelve a ser un ayudante normal en la línea de juguetes. 🎁
━━━━━━━━━━━━━━━━━━━━━━━`.trim()

        conn.reply(m.chat, info, m, { mentions: [user] })

    } catch (e) {
        conn.reply(m.chat, `⚠️ *¡Rayos!* Hubo una tormenta de nieve y no pude degradarlo.\n${e.message}`, m)
    }
}

handler.help = ['demote']
handler.tags = ['grupo']
handler.command = ['demote', 'degradar', 'quitaradmin']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
