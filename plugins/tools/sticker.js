import { sticker } from '../../lib/sticker.js'
import uploadFile from '../../lib/uploadFile.js'
import uploadImage from '../../lib/uploadImage.js'
import { webp2png } from '../../lib/webp2mp4.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let stiker = false
    let userId = m.sender
    let packstickers = global.db.data.users[userId] || {}
    let texto1 = packstickers.text1 || global.packsticker || 'Sticker'
    let texto2 = packstickers.text2 || global.packsticker2 || 'Bot'
    
    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || q.mtype || ''
        
        // Intentar detectar el tipo de mensaje de múltiples formas
        if (!mime) {
            if (q.message?.imageMessage) mime = 'image'
            else if (q.message?.videoMessage) mime = 'video'
            else if (q.message?.stickerMessage) mime = 'webp'
        }
        
        let txt = args.join(' ')
        
        if (/webp|image|video/g.test(mime)) {
            if (!q.download) {
                return conn.reply(m.chat, '❀ No se pudo descargar el archivo multimedia.', m)
            }
            
            if (/video/.test(mime)) {
                const seconds = (q.msg || q).seconds || 0
                if (seconds > 16) {
                    return conn.reply(m.chat, '✧ El video no puede durar más de *15 segundos*', m)
                }
            }
            
            await m.react('🕓')
            
            console.log('Descargando multimedia...')
            let buffer = await q.download()
            
            if (!buffer || buffer.length === 0) {
                throw new Error('El buffer descargado está vacío')
            }
            
            console.log('Buffer descargado:', buffer.length, 'bytes')
            
            let marca = txt ? txt.split(/[•|]/).map(part => part.trim()) : [texto1, texto2]
            if (marca.length === 1) marca.push(texto2)
            
            console.log('Creando sticker con marcas:', marca)
            // Usar null en vez de false para que mantenga proporciones
            stiker = await sticker(buffer, null, marca[0], marca[1])
            
        } else if (args[0] && isUrl(args[0])) {
            await m.react('🕓')
            console.log('Descargando desde URL:', args[0])
            stiker = await sticker(false, args[0], texto1, texto2)
            
        } else {
            return conn.reply(m.chat, `❀ Por favor, envía o responde a una *imagen* o *video* para hacer un sticker.\n\n*Uso:*\n• ${usedPrefix + command} (responde a imagen/video)\n• ${usedPrefix + command} <url>\n• ${usedPrefix + command} <texto1> | <texto2> (responde a multimedia)`, m)
        }
        
    } catch (e) {
        console.error('Error completo en sticker:', e)
        await m.react('✖️')
        return conn.reply(m.chat, `⚠︎ Ocurrió un Error al crear el sticker:\n\n${e.message}\n\n_Asegúrate de que ffmpeg esté instalado correctamente._`, m)
        
    } finally {
        if (stiker && Buffer.isBuffer(stiker) && stiker.length > 0) {
            console.log('Enviando sticker:', stiker.length, 'bytes')
            await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, false, { asSticker: true })
            await m.react('✅')
        } else if (stiker === false) {
            // No hacer nada, ya se envió un mensaje de error
        } else {
            await m.react('✖️')
            await conn.reply(m.chat, '⚠︎ No se pudo crear el sticker. Intenta con otra imagen o video.', m)
        }
    }
}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'stiker']
handler.reg = true

export default handler

const isUrl = (text) => {
    return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(jpe?g|gif|png|webp|mp4)/, 'gi'))
}