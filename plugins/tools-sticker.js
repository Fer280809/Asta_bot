import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, args }) => {
    let stiker = false
    let userId = m.sender
    let packstickers = global.db.data.users[userId] || {}
    let texto1 = packstickers.text1 || global.packsticker || 'Sticker'
    let texto2 = packstickers.text2 || global.packsticker2 || 'Bot'
    
    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''
        let txt = args.join(' ')
        
        if (/webp|image|video/g.test(mime)) {
            // Verificar si hay método de descarga
            if (!q.download) {
                return conn.reply(m.chat, '❀ No se pudo descargar el archivo.', m)
            }
            
            // Verificar duración del video
            if (/video/.test(mime)) {
                let seconds = (q.msg || q).seconds || 0
                if (seconds > 16) {
                    return conn.reply(m.chat, '✧ El video no puede durar más de *15 segundos*', m)
                }
            }
            
            let buffer = await q.download()
            await m.react('🕓')
            
            let marca = texto1
            let autor = texto2
            
            // Si el usuario proporciona texto personalizado
            if (txt) {
                let partes = txt.split('|').map(part => part.trim())
                marca = partes[0] || texto1
                autor = partes[1] || texto2
            }
            
            stiker = await sticker(buffer, false, marca, autor)
            
        } else if (args[0] && isUrl(args[0])) {
            await m.react('🕓')
            stiker = await sticker(false, args[0], texto1, texto2)
            
        } else {
            return conn.reply(m.chat, '❀ Por favor, envía una *imagen* o *video* para hacer un sticker.\n\n*Uso:*\n• Responde a una imagen/video/sticker\n• Envía una URL de imagen\n• Formato: .s | nombre | autor', m)
        }
        
    } catch (e) {
        console.error('Error en sticker:', e)
        await m.react('✖️')
        return conn.reply(m.chat, `⚠︎ Ocurrió un Error: ${e.message}`, m)
    }
    
    // Enviar sticker si se generó correctamente
    if (stiker) {
        try {
            await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
            await m.react('✅')
        } catch (e) {
            console.error('Error al enviar sticker:', e)
            await m.react('✖️')
            await conn.reply(m.chat, '⚠︎ Error al enviar el sticker.', m)
        }
    }
}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'stiker']

export default handler

const isUrl = (text) => {
    return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(jpe?g|gif|png|webp)/, 'gi'))
}