const handler = async (m, { isOwner, isAdmin, conn, text, participants, args, command, botname, vs }) => {
    // 1. Mensaje personalizado o por defecto
    const mensaje = args.join(' ') || "¡Atención Elfos! Santa tiene un anuncio."
    const nota = `*» 📢 MENSAJE:* ${mensaje}`
    
    // 2. Encabezado Estético
    let teks = `🔔 *INVOCACIÓN GENERAL DE LA VILLA* 🔔\n`
    teks += `📜 *Para:* ${participants.length} Habitantes\n\n`
    teks += `${nota}\n\n`
    teks += `┏━━━🎁 *LISTA REAL* 🎁━━━\n`

    // 3. Generar la lista con menciones
    for (const mem of participants) {
        teks += `┃ ✨ @${mem.id.split('@')[0]}\n`
    }

    teks += `┗━━━━━━━━━━━━━━━━━━━━━━\n\n`
    teks += `> *${botname} ${vs}* ❄️`

    // 4. Enviar con menciones funcionales
    conn.sendMessage(m.chat, { 
        text: teks, 
        mentions: participants.map((a) => a.id) 
    }, { quoted: m })

    await m.react('🔔')
}

handler.help = ['todos']
handler.tags = ['group']
handler.command = ['todos', 'invocar', 'tagall']
handler.admin = true
handler.group = true

export default handler
