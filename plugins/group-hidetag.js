import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

var handler = async (m, { conn, text, participants, usedPrefix, command }) => {
    // 1. Obtener el texto o el mensaje citado
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    let msgText = text || (m.quoted && m.quoted.text) || ''

    if (!m.quoted && !text) return conn.reply(m.chat, `📢 Debes escribir un mensaje o citar algo para notificar a todos los miembros del grupo.`, m)

    // 2. Preparar lista de usuarios a mencionar (Todos)
    let users = participants.map(u => conn.decodeJid(u.id))
    
    // 3. Reacción de anuncio
    await m.react('📢')

    // 4. Encabezado normal
    let header = `📢 *MENSAJE PARA TODOS*\n━━━━━━━━━━━━━━━━━━━━━━━\n\n`
    let finalMsg = msgText ? (header + msgText) : header

    try {
        // Lógica simplificada: Si es multimedia (Imagen, Video, Audio, Sticker)
        if (/image|video|sticker|audio/.test(mime)) {
            let media = await q.download?.()
            let type = mime.split('/')[0]
            let options = { 
                mentions: users, 
                caption: finalMsg,
                quoted: null
            }

            if (type === 'audio') {
                delete options.caption
                options.ptt = true
                return conn.sendMessage(m.chat, { audio: media, ...options })
            }
            
            return conn.sendMessage(m.chat, { [type]: media, ...options })

        } else {
            // Si es solo texto
            return conn.sendMessage(m.chat, { 
                text: finalMsg, 
                mentions: users,
                contextInfo: {
                    externalAdReply: {
                        title: "📢 NOTIFICACIÓN GRUPAL",
                        body: "Mensaje para todos los miembros",
                        thumbnailUrl: "https://files.catbox.moe/lajq7h.jpg",
                        sourceUrl: null,
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            })
        }
    } catch (e) {
        // Fallback simple si falla lo anterior
        await conn.sendMessage(m.chat, { text: finalMsg, mentions: users })
    }
}

// MISMOS HELP, TAGS, COMMAND
handler.help = ['hidetag']
handler.tags = ['grupo']
handler.command = ['hidetag', 'notificar', 'tag', 'avisar']
handler.group = true
handler.admin = true

export default handler
