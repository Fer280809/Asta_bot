import Jimp from 'jimp'
import { fileTypeFromBuffer } from 'file-type'
import fetch from 'node-fetch'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'

const execPromise = promisify(exec)

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''
        
        // Validar que sea una imagen
        if (!/image|webp/g.test(mime)) {
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
        
        // Verificar tipo de archivo
        const type = await fileTypeFromBuffer(media)
        
        // Si es WebP o formato no soportado por Jimp, intentar con conversión manual
        if (type && type.mime === 'image/webp') {
            try {
                // Verificar si tiene FFmpeg instalado
                await execPromise('ffmpeg -version')
                
                // Usar FFmpeg para convertir WebP
                const tmpInput = path.join('./tmp', `${Date.now()}_input.webp`)
                const tmpOutput = path.join('./tmp', `${Date.now()}_output.png`)
                
                // Crear carpeta tmp si no existe
                if (!fs.existsSync('./tmp')) {
                    fs.mkdirSync('./tmp', { recursive: true })
                }
                
                // Guardar WebP temporal
                fs.writeFileSync(tmpInput, media)
                
                // Convertir con FFmpeg
                await execPromise(`ffmpeg -i ${tmpInput} -vf scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0.0 ${tmpOutput}`)
                
                // Leer resultado
                const converted = fs.readFileSync(tmpOutput)
                
                // Limpiar archivos temporales
                fs.unlinkSync(tmpInput)
                fs.unlinkSync(tmpOutput)
                
                // Enviar como sticker
                await conn.sendMessage(m.chat, {
                    sticker: converted
                }, { quoted: m })
                
                await m.react('✅')
                return
                
            } catch (ffmpegError) {
                // Si no tiene FFmpeg, intentar enviar el WebP directo
                console.log('FFmpeg no disponible, enviando WebP directo')
                try {
                    await conn.sendMessage(m.chat, {
                        sticker: media
                    }, { quoted: m })
                    
                    await m.react('✅')
                    return
                } catch (e) {
                    throw new Error('No se puede procesar WebP sin FFmpeg. Instala FFmpeg con: pkg install ffmpeg')
                }
            }
        }
        
        // Para otros formatos, usar Jimp
        const image = await Jimp.read(media)
        
        // Redimensionar a 512x512 manteniendo proporción
        image.contain(512, 512, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE)
        
        // Convertir a PNG
        const stickerBuffer = await image.getBufferAsync(Jimp.MIME_PNG)
        
        // Enviar como sticker
        await conn.sendMessage(m.chat, {
            sticker: stickerBuffer
        }, { quoted: m })
        
        await m.react('✅')
        
    } catch (e) {
        console.error('Error en comando sticker:', e)
        await m.react('✖️')
        
        let errorMsg = `⚠︎ Ocurrió un Error: ${e.message}`
        
        if (e.message.includes('Unsupported MIME type') || e.message.includes('WebP')) {
            errorMsg += '\n\n*Solución:* Instala FFmpeg para soportar todos los formatos:\n`pkg install ffmpeg -y`'
        }
        
        await conn.reply(m.chat, errorMsg, m)
    }
}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'stiker']

export default handler

const isUrl = (text) => {
    return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(jpe?g|gif|png|webp)/, 'gi'))
}