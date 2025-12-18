let handler = async (m, { conn, args, usedPrefix }) => {
    // 1. Imagen del grupo o fallback normal
    const pp = await conn.profilePictureUrl(m.chat, 'image').catch((_) => 'https://files.catbox.moe/xr2m6u.jpg')
    
    try {
        let id = args?.[0]?.match(/\d+\-\d+@g.us/) || m.chat
        
        // 2. Obtener participantes que han interactuado recientemente (según caché de mensajes)
        const chatMsgs = conn.chats[id]?.messages || {}
        const participantesUnicos = Object.values(chatMsgs)
            .map((item) => item.key.participant)
            .filter((value, index, self) => value && self.indexOf(value) === index)

        // 3. Ordenar alfabéticamente
        const participantesOrdenados = participantesUnicos.sort((a, b) => 
            a.split("@")[0].localeCompare(b.split("@")[0])
        )

        // 4. Construir la lista normal
        const listaEnLinea = participantesOrdenados.length > 0
            ? participantesOrdenados.map((k) => `👤 @${k.split("@")[0]}`).join("\n")
            : "📭 No hay usuarios activos en este momento."

        const texto = `
👥 *USUARIOS ACTIVOS RECIENTEMENTE*
━━━━━━━━━━━━━━━━━━━━━━━
Estos son los usuarios que han estado activos recientemente en el grupo:

${listaEnLinea}

━━━━━━━━━━━━━━━━━━━━━━━
📊 *Total activos:* ${participantesOrdenados.length}
『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡`.trim()

        // 5. Enviar con menciones y diseño limpio (MISMA ESTRUCTURA)
        await conn.sendMessage(m.chat, { 
            image: { url: pp }, 
            caption: texto, 
            contextInfo: { 
                mentionedJid: participantesOrdenados,
                externalAdReply: {
                    title: "📱 ACTIVIDAD DEL GRUPO",
                    body: "Lista de usuarios recientemente activos",
                    thumbnailUrl: pp,
                    sourceUrl: null,
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m })

        await m.react('👥')

    } catch (error) {
        await m.reply(`⚠️ *Error*\nHubo un problema al obtener la lista de usuarios activos.\n${error.message}`)
    }
}

// MISMOS HELP, TAGS, COMMAND
handler.help = ["online"]
handler.tags = ["grupo"]
handler.command = ["listonline", "online", "linea", "enlinea"]
handler.group = true

export default handler
