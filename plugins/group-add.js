import moment from 'moment-timezone'

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
    // Validación de entrada
    if (!text) return conn.reply(m.chat, `🎁 *¡Ho Ho Ho!* Por favor, ingresa el número (con código de país) para enviarle su regalo de invitación.`, m)
    if (text.includes('+')) return conn.reply(m.chat, `❄️ No es necesario el símbolo *+*, ingresa el número todo junto.`, m)
    if (isNaN(text)) return conn.reply(m.chat, `🌟 Por favor, usa solo números. ¡Asegúrate de incluir el código de país!`, m)

    let group = m.chat
    let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(group)
    let tag = `@${m.sender.split('@')[0]}`
    const chatLabel = await conn.getName(m.chat) || 'Villa Navideña'
    const horario = moment.tz('America/Caracas').format('DD/MM/YYYY hh:mm:ss A')

    // Cuerpo del mensaje navideño
    const invite = `
✨ *¡TIENES UNA INVITACIÓN ESPECIAL!* ✨
━━━━━━━━━━━━━━━━━━━━━━
🎄 *De parte de:* ${tag}
🎁 *Destino:* ${chatLabel}
📅 *Momento Mágico:* ${horario}

🎅 *Mensaje de Santa:*
"Has sido seleccionado para unirte a nuestra celebración. ¡Haz clic abajo para entrar al taller!"

🌟 *Enlace de Acceso:*
${link}
━━━━━━━━━━━━━━━━━━━━━━
*¡Te esperamos con chocolate caliente!* ☕`.trim()

    try {
        await conn.reply(`${text}@s.whatsapp.net`, invite, null, { mentions: [m.sender] })
        
        // Reacción de éxito
        await m.react('🎁')
        m.reply(`✅ *¡Misión Navideña cumplida!*\nEl elfo mensajero ha llevado la invitación al número indicado. 🦌`)
    } catch (e) {
        await m.react('❌')
        m.reply(`⚠️ *¡Rayos!* Hubo un problema al enviar la invitación. Asegúrate de que el número sea correcto.`)
    }
}

handler.help = ['invite']
handler.tags = ['group']
handler.command = ['add', 'agregar', 'añadir', 'invitar'] // Añadí 'invitar' por comodidad
handler.group = true
handler.admin = true // Es mejor que solo los admins puedan invitar gente
handler.botAdmin = true

export default handler
