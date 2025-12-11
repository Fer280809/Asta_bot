import Jimp from 'jimp'
import { fileTypeFromBuffer } from 'file-type'
import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''
        
        // Validar que sea una imagen
        if (!/image/g.test(mime)) {
            if (args[0] && isUrl(args[0])) {
                // Es una URL
            } else {
                return conn.reply(m.chat, '❀ Por favor, envía o responde a una *imagen* para crear un sticker.\n\n*Uso:* Responde a una imagen con `.s`', m)
            }
        }
        
        await m.react('🕓')
        
        let media
        if (args[0] && isUrl(args[0])) {
            // Descargar desde URL
            const res = await fetch(args[0])
            if (!res.ok) throw new Error('No se pudo descargar la imagen')
            media = await res.buffer()
        } else {
            // Descargar desde mensaje
            media = await q.download()
        }
        
        if (!media) {
            await m.react('✖️')
            return conn.reply(m.chat, '⚠︎ No se pudo descargar la imagen.', m)
        }
        
        // Verificar que sea una imagen
        const type = await fileTypeFromBuffer(media)
        if (!type || !type.mime.includes('image')) {
            await m.react('✖️')
            return conn.reply(m.chat, '⚠︎ Solo se permiten imágenes. Para videos necesitas instalar FFmpeg.', m)
        }
        
        // Convertir a sticker con Jimp
        const image = await Jimp.read(media)
        
        // Redimensionar a 512x512 manteniendo proporción
        image.contain(512, 512)
        
        // Convertir a PNG (WhatsApp acepta PNG como sticker)
        const stickerBuffer = await image.getBufferAsync(Jimp.MIME_PNG)
        
        // Enviar como sticker
        await conn.sendMessage(m.chat, {
            sticker: stickerBuffer
        }, { quoted: m })
        
        await m.react('✅')
        
    } catch (e) {
        console.error('Error en comando sticker:', e)
        await m.react('✖️')
        await conn.reply(m.chat, `⚠︎ Ocurrió un Error: ${e.message}\n\n*Nota:* Este comando solo funciona con imágenes. Para videos instala FFmpeg:\n\`pkg install ffmpeg\``, m)
    }
}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'stiker']

export default handler

const isUrl = (text) => {
    return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(jpe?g|gif|png|webp)/, 'gi'))
}