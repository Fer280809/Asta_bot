const handler = async (m, { conn, participants, groupMetadata, args, usedPrefix }) => {
    // Verificación de bot primario (manteniendo tu lógica)
    const primaryBot = global.db.data.chats[m.chat]?.primaryBot
    if (primaryBot && conn.user.jid !== primaryBot) return

    // Imagen del grupo o fallback navideño
    const pp = await conn.profilePictureUrl(m.chat, 'image').catch((_) => 'https://files.catbox.moe/lajq7h.jpg')
    
    // Obtener admins y creador
    const groupAdmins = participants.filter((p) => p.admin)
    const owner = groupMetadata.owner || groupAdmins.find((p) => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net'
    
    // Construir lista con jerarquía
    const listAdmin = groupAdmins
        .map((v, i) => `${v.id === owner ? '👑' : '⭐'} @${v.id.split('@')[0]}`)
        .join('\n')

    const mensajeExtra = args.join(' ')
    
    const textoNavideño = `
🔔 *CONVOCATORIA DE ELFOS MAYORES* 🔔
━━━━━━━━━━━━━━━━━━━━━━━

🎅 *Creador del Taller:*
@${owner.split('@')[0]}

✨ *Ayudantes de Santa (Admins):*
${listAdmin}

📬 *Nota del Remitente:*
> ${mensajeExtra || '¡Se solicita su presencia en el taller! ❄️'}

━━━━━━━━━━━━━━━━━━━━━━━
『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡`.trim()

    // Enviar con menciones y botones interactivos
    await conn.sendMessage(m.chat, {
        image: { url: pp },
        caption: textoNavideño,
        footer: "Navidad 2024 • Grupo Admin",
        mentions: [...groupAdmins.map((v) => v.id), owner],
        buttons: [
            { 
                buttonId: `${usedPrefix}config`, 
                buttonText: { displayText: '⚙️ Ajustes de Villa' }, 
                type: 1 
            }
        ],
        headerType: 4
    }, { quoted: m })
    
    await m.react('🔔')
}

handler.help = ['admins']
handler.tags = ['grupo']
// He mejorado el prefix para que sea más exacto
handler.command = /^(admins|@admins|dmins)$/i
handler.group = true

export default handler
