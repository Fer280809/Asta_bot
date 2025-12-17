var handler = async (m, { conn, usedPrefix }) => {
    let group = m.chat
    
    // 1. Obtener foto del grupo y código de invitación
    const pp = await conn.profilePictureUrl(group, 'image').catch((_) => 'https://files.catbox.moe/xr2m6u.jpg')
    let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(group)

    // 2. Diseño de la Invitación
    let message = `
🌟 *¡PASE VIP A LA VILLA!* 🌟
━━━━━━━━━━━━━━━━━━━━━━━
¡Ho Ho Ho! Aquí tienes el acceso real para invitar a nuevos elfos a nuestra comunidad.

🎫 *ENLACE DIRECTO:*
${link}

━━━━━━━━━━━━━━━━━━━━━━━
🎁 *¡Comparte la magia con tus amigos!*
『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』❄️`.trim()

    // 3. Enviar con tarjeta de anuncio y botones
    await conn.sendMessage(group, { 
        image: { url: pp }, 
        caption: message,
        contextInfo: {
            externalAdReply: {
                title: "🏰 INVITACIÓN AL GRUPO",
                body: "¡Únete a nuestra gran celebración!",
                thumbnailUrl: pp,
                sourceUrl: link, // El link se vuelve clickeable en la tarjeta
                mediaType: 1,
                renderLargerThumbnail: true // Hace que la imagen se vea grande y premium
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

    await m.react('🎫')
}

handler.help = ['link']
handler.tags = ['grupo']
handler.command = ['link', 'enlace']
handler.group = true
handler.botAdmin = true

export default handler
