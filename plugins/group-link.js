var handler = async (m, { conn, usedPrefix }) => {
    let group = m.chat
    
    // 1. Obtener foto del grupo y código de invitación
    const pp = await conn.profilePictureUrl(group, 'image').catch((_) => 'https://files.catbox.moe/xr2m6u.jpg')
    let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(group)

    // 2. Diseño de la Invitación (TEXTO NORMAL)
    let message = `
🔗 *ENLACE DE INVITACIÓN DEL GRUPO*
━━━━━━━━━━━━━━━━━━━━━━━
Aquí tienes el enlace para invitar a nuevos miembros a este grupo.

📎 *ENLACE DIRECTO:*
${link}

━━━━━━━━━━━━━━━━━━━━━━━
📱 *¡Comparte el enlace con quien quieras!*
『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡`.trim()

    // 3. Enviar con tarjeta de anuncio y botones (MISMA ESTRUCTURA)
    await conn.sendMessage(group, { 
        image: { url: pp }, 
        caption: message,
        contextInfo: {
            externalAdReply: {
                title: "📌 ENLACE DEL GRUPO",
                body: "¡Invitación para nuevos miembros!",
                thumbnailUrl: pp,
                sourceUrl: link,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        },
        buttons: [
            { 
                buttonId: `${usedPrefix}infogrupo`, 
                buttonText: { displayText: '📜 Ver Información' }, 
                type: 1 
            }
        ],
        headerType: 4
    }, { quoted: m })

    await m.react('🔗')
}

// MISMOS HELP, TAGS, COMMAND
handler.help = ['link']
handler.tags = ['grupo']
handler.command = ['link', 'enlace']
handler.group = true
handler.botAdmin = true

export default handler
