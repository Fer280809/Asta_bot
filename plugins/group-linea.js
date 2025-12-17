let handler = async (m, { conn, args, usedPrefix }) => {
    // 1. Imagen del grupo o fallback navideño
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

        // 4. Construir la lista con estética de la Villa
        const listaEnLinea = participantesOrdenados.length > 0
            ? participantesOrdenados.map((k) => `✨ @${k.split("@")[0]}`).join("\n")
            : "❄️ No hay elfos despiertos en el taller ahora mismo."

        const texto = `
🔔 *ELFO-DETECTOR ACTIVADO* 🔔
━━━━━━━━━━━━━━━━━━━━━━━
Estos son los habitantes que han estado activos recientemente en la Villa:

${listaEnLinea}

━━━━━━━━━━━━━━━━━━━━━━━
🕯️ *Total despiertos:* ${participantesOrdenados.length}
『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』❄️`.trim()

        // 5. Enviar con menciones y diseño limpio
        await conn.sendMessage(m.chat, { 
            image: { url: pp }, 
            caption: texto, 
            contextInfo: { 
                mentionedJid: participantesOrdenados,
                externalAdReply: {
                    title: "🛰️ SCANNER DE ACTIVIDAD",
                    body: "Revisando el Taller de Santa",
                    thumbnailUrl: pp,
                    sourceUrl: null,
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m })

        await m.react('🛰️')

    } catch (error) {
        await m.reply(`⚠️ *¡Tormenta de nieve!* Hubo un error al rastrear a los elfos.\n${error.message}`)
    }
}

handler.help = ["online"]
handler.tags = ["grupo"]
handler.command = ["listonline", "online", "linea", "enlinea"]
handler.group = true

export default handler
