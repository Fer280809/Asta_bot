const handler = async (m, { isOwner, isAdmin, conn, text, participants, args, command, botname, vs }) => {
    // 1. Mensaje personalizado o por defecto
    const mensaje = args.join(' ') || "Atención a todos los miembros del grupo"
    const nota = `*» 📢 MENSAJE:* ${mensaje}`
    
    // 2. Encabezado normal
    let teks = `📢 *MENSAJE PARA TODOS*\n`
    teks += `👥 *Destinatarios:* ${participants.length} miembros\n\n`
    teks += `${nota}\n\n`
    teks += `┏━━━📋 *LISTA DE MIEMBROS* 📋━━━\n`

    // 3. Generar la lista con menciones
    for (const mem of participants) {
        teks += `┃ 👤 @${mem.id.split('@')[0]}\n`
    }

    teks += `┗━━━━━━━━━━━━━━━━━━━━━━\n\n`
    teks += `> *${botname} ${vs}* ⚡`

    // 4. Enviar con menciones funcionales
    conn.sendMessage(m.chat, { 
        text: teks, 
        mentions: participants.map((a) => a.id) 
    }, { quoted: m })

    await m.react('📢')
}

// MISMOS HELP, TAGS, COMMAND
handler.help = ['todos']
handler.tags = ['group']
handler.command = ['todos', 'invocar', 'tagall']
handler.admin = true
handler.group = true

export default handler
