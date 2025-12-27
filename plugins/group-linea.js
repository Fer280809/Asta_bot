let handler = async (m, { conn, args, usedPrefix }) => {
    try {
        // 1. Obtener imagen del grupo o usar fallback
        let pp
        try {
            pp = await conn.profilePictureUrl(m.chat, 'image')
            // Verificar si es un objeto y extraer la URL
            if (pp && typeof pp === 'object') {
                pp = pp.url || pp.imageUrl || null
            }
        } catch {
            pp = 'https://files.catbox.moe/xr2m6u.jpg'
        }
        
        // 2. Obtener ID del chat
        let id = args?.[0]?.match(/\d+\-\d+@g.us/)?.[0] || m.chat
        
        // 3. Obtener participantes que han interactuado recientemente
        const chatData = conn.chats[id]
        let participantesUnicos = []
        
        if (chatData?.messages) {
            const chatMsgs = chatData.messages
            participantesUnicos = Object.values(chatMsgs)
                .map((item) => item?.key?.participant)
                .filter((value, index, self) => 
                    value && 
                    typeof value === 'string' && 
                    self.indexOf(value) === index
                )
        }
        
        // 4. Ordenar alfabéticamente
        const participantesOrdenados = participantesUnicos.sort((a, b) => 
            a.split("@")[0].localeCompare(b.split("@")[0])
        )

        // 5. Construir la lista con estética de la Villa
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

        // 6. Enviar con menciones y diseño limpio
        const messageOptions = {
            image: { url: pp || 'https://files.catbox.moe/xr2m6u.jpg' }, 
            caption: texto, 
            contextInfo: { 
                mentionedJid: participantesOrdenados,
                externalAdReply: {
                    title: "🛰️ SCANNER DE ACTIVIDAD",
                    body: "Revisando el Taller de Santa",
                    thumbnailUrl: pp || 'https://files.catbox.moe/xr2m6u.jpg',
                    sourceUrl: null,
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }

        await conn.sendMessage(m.chat, messageOptions, { quoted: m })
        await m.react('🛰️')

    } catch (error) {
        console.error('Error en comando online:', error)
        await m.reply(`⚠️ *¡Tormenta de nieve!* Hubo un error al rastrear a los elfos.\n${error.message}`)
    }
}

handler.help = ["online"]
handler.tags = ["grupo"]
handler.command = ["listonline", "online", "linea", "enlinea"]
handler.group = true

export default handler
