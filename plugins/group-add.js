import moment from 'moment-timezone'

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
    // Validación de entrada (EXACTAMENTE IGUAL)
    if (!text) return conn.reply(m.chat, `📋 Por favor, ingresa el número (con código de país) para enviarle la invitación.`, m)
    if (text.includes('+')) return conn.reply(m.chat, `⚠️ No es necesario el símbolo +, ingresa el número todo junto.`, m)
    if (isNaN(text)) return conn.reply(m.chat, `❌ Por favor, usa solo números. Asegúrate de incluir el código de país!`, m)

    let group = m.chat
    let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(group)
    let tag = `@${m.sender.split('@')[0]}`
    const chatLabel = await conn.getName(m.chat) || 'Este grupo'
    const horario = moment.tz('America/Caracas').format('DD/MM/YYYY hh:mm:ss A')

    // Cuerpo del mensaje (SOLO CAMBIADO EL TEXTO, MANTENIENDO FORMATO)
    const invite = `
📨 *INVITACIÓN DE GRUPO*
━━━━━━━━━━━━━━━━━━━━━━
👤 *De parte de:* ${tag}
📌 *Grupo:* ${chatLabel}
🕐 *Fecha:* ${horario}

💬 *Mensaje:*
"Has sido invitado a unirte a este grupo. ¡Haz clic abajo para entrar!"

🔗 *Enlace de invitación:*
${link}
━━━━━━━━━━━━━━━━━━━━━━
*¡Te esperamos en el grupo!*`.trim()

    try {
        await conn.reply(`${text}@s.whatsapp.net`, invite, null, { mentions: [m.sender] })
        
        // Reacción de éxito (MISMO COMPORTAMIENTO)
        await m.react('✅')
        m.reply(`✅ *Invitación enviada*\nLa invitación ha sido enviada al número indicado.`)
    } catch (e) {
        await m.react('❌')
        m.reply(`⚠️ *Error*\nHubo un problema al enviar la invitación. Asegúrate de que el número sea correcto.`)
    }
}

// MISMOS HELP, TAGS, COMMAND Y PERMISOS
handler.help = ['invite']
handler.tags = ['group']
handler.command = ['add', 'agregar', 'añadir', 'invitar']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
