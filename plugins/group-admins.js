const handler = async (m, { conn, participants, groupMetadata, args, usedPrefix }) => {
    // Verificación de bot primario (manteniendo tu lógica exactamente)
    const primaryBot = global.db.data.chats[m.chat]?.primaryBot
    if (primaryBot && conn.user.jid !== primaryBot) return

    // Imagen del grupo o fallback normal
    const pp = await conn.profilePictureUrl(m.chat, 'image').catch((_) => 'https://files.catbox.moe/lajq7h.jpg')
    
    // Obtener admins y creador (MISMA LÓGICA)
    const groupAdmins = participants.filter((p) => p.admin)
    const owner = groupMetadata.owner || groupAdmins.find((p) => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net'
    
    // Construir lista con jerarquía (MISMO FORMATO)
    const listAdmin = groupAdmins
        .map((v, i) => `${v.id === owner ? '👑' : '⭐'} @${v.id.split('@')[0]}`)
        .join('\n')

    const mensajeExtra = args.join(' ')
    
    // TEXTO NORMAL (solo cambiados los mensajes)
    const textoNormal = `
👥 *ADMINISTRADORES DEL GRUPO*
━━━━━━━━━━━━━━━━━━━━━━━

👑 *Creador del Grupo:*
@${owner.split('@')[0]}

⭐ *Administradores:*
${listAdmin}

📢 *Mensaje:*
> ${mensajeExtra || 'Mencionando a todos los administradores'}

━━━━━━━━━━━━━━━━━━━━━━━
『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡`.trim()

    // Enviar con menciones y botones (MISMA ESTRUCTURA)
    await conn.sendMessage(m.chat, {
        image: { url: pp },
        caption: textoNormal,
        footer: "Lista de Administradores",
        mentions: [...groupAdmins.map((v) => v.id), owner],
        buttons: [
            { 
                buttonId: `${usedPrefix}config`, 
                buttonText: { displayText: '⚙️ Configuración' }, 
                type: 1 
            }
        ],
        headerType: 4
    }, { quoted: m })
    
    await m.react('👥')
}

// MISMOS HELP, TAGS, COMMAND (exactamente igual)
handler.help = ['admins']
handler.tags = ['grupo']
handler.command = /^(admins|@admins|dmins)$/i
handler.group = true

export default handler
