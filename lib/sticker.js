import { sticker6, addExif } from '../lib/sticker.js'
import axios from 'axios'
import fetch from 'node-fetch'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const fetchSticker = async (text, attempt = 1) => {
    try {
        const response = await axios.get(`https://skyzxu-brat.hf.space/brat`, { 
            params: { text }, 
            responseType: 'arraybuffer',
            timeout: 30000
        })
        return response.data
    } catch (error) {
        if (error.response?.status === 429 && attempt <= 3) {
            const retryAfter = error.response.headers['retry-after'] || 5
            await delay(retryAfter * 1000)
            return fetchSticker(text, attempt + 1)
        }
        throw error
    }
}

const fetchStickerVideo = async (text) => {
    try {
        const response = await axios.get(`https://skyzxu-brat.hf.space/brat-animated`, { 
            params: { text }, 
            responseType: 'arraybuffer',
            timeout: 30000
        })
        if (!response.data) throw new Error('Error al obtener el video de la API.')
        return response.data
    } catch (error) {
        console.error('Error en fetchStickerVideo:', error.message)
        throw new Error(`No se pudo obtener el sticker animado: ${error.message}`)
    }
}

const fetchJson = (url, options) => new Promise((resolve, reject) => {
    fetch(url, options)
        .then(res => res.json())
        .then(json => resolve(json))
        .catch(err => reject(err))
})

// Función sticker simplificada que solo usa sticker6 y addExif
const sticker = async (buffer, url, packname = 'Sticker Pack', author = 'Autor') => {
    try {
        let webpBuffer;
        
        if (url) {
            // Si tenemos URL, descargarla y convertir
            const response = await fetch(url);
            const imgBuffer = await response.buffer();
            webpBuffer = await sticker6(imgBuffer, null);
        } else if (buffer) {
            // Si tenemos buffer, convertir directamente
            webpBuffer = await sticker6(buffer, null);
        } else {
            throw new Error('Se requiere buffer o URL');
        }
        
        // Añadir metadata
        return await addExif(webpBuffer, packname, author);
    } catch (error) {
        console.error('Error en función sticker:', error);
        throw error;
    }
}

const handler = async (m, { conn, text, args, command, usedPrefix }) => {
    try {
        let userId = m.sender
        let packstickers = global.db.data.users[userId] || {}
        let texto1 = packstickers.text1 || global.packsticker || 'Sticker Pack'
        let texto2 = packstickers.text2 || global.packsticker2 || 'Autor'
        
        switch (command) {
            case 'brat': {
                let textInput = m.quoted?.text || text
                if (!textInput) return conn.reply(m.chat, '❀ Por favor, responde a un mensaje o ingresa un texto para crear el Sticker.', m)
                
                await m.react('🕒')
                const buffer = await fetchSticker(textInput)
                if (!buffer || buffer.length === 0) throw new Error('No se obtuvo respuesta válida de la API')
                
                const stiker = await sticker(buffer, null, texto1, texto2)
                if (!stiker) throw new Error('ꕥ No se pudo generar el sticker.')
                
                await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
                await m.react('✔️')
                break
            }
            
            case 'bratv': {
                let textInput = m.quoted?.text || text
                if (!textInput) return conn.reply(m.chat, '❀ Por favor, responde a un mensaje o ingresa un texto para crear el Sticker.', m)
                
                await m.react('🕒')
                const videoBuffer = await fetchStickerVideo(textInput)
                
                // Convertir video a webp
                const webpBuffer = await sticker6(videoBuffer, null)
                // Añadir metadata
                const stickerBuffer = await addExif(webpBuffer, texto1, texto2)
                
                if (!stickerBuffer) throw new Error('No se pudo generar el sticker animado')
                await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m })
                await m.react('✔️')
                break
            }
            
            case 'emojimix': {
                if (!args[0]) return m.reply(`❀ Ingresa 2 emojis para combinar.\n> Ejemplo: *${usedPrefix + command}* 👻+👀`)
                
                let [emoji1, emoji2] = text.split('+')
                if (!emoji1 || !emoji2) return m.reply('Formato incorrecto. Usa: emoji1+emoji2')
                
                await m.react('🕒')
                const res = await fetchJson(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`)
                
                if (!res.results || res.results.length === 0) {
                    await m.react('✖️')
                    return m.reply('ꕥ No se encontraron stickers para esos emojis.')
                }
                
                // Enviar solo el primer resultado
                let result = res.results[0]
                if (!result.url) throw new Error('No se encontró URL para el emoji combinado')
                
                // Descargar y convertir
                const response = await fetch(result.url)
                const imgBuffer = await response.buffer()
                const webpBuffer = await sticker6(imgBuffer, null)
                const finalSticker = await addExif(webpBuffer, texto1, texto2)
                
                await conn.sendFile(m.chat, finalSticker, null, { asSticker: true }, m)
                await m.react('✔️')
                break
            }
            
            case 'qc': {
                let textFinal = args.join(' ') || m.quoted?.text
                if (!textFinal) return conn.reply(m.chat, `❀ Ingresa un texto para crear el sticker.`, m)
                
                let target = m.quoted ? m.quoted.sender : m.sender
                const pp = await conn.profilePictureUrl(target).catch((_) => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')
                
                let nombre = target.split('@')[0]
                try {
                    const nameFromDb = global.db.data.users[target]?.name
                    if (nameFromDb && typeof nameFromDb === 'string' && nameFromDb.trim()) {
                        nombre = nameFromDb
                    } else {
                        const n = await conn.getName(target)
                        if (n && typeof n === 'string' && n.trim()) nombre = n
                    }
                } catch (e) {
                    console.log('Error obteniendo nombre:', e)
                }
                
                const mentionRegex = new RegExp(`@${target.split('@')[0]}`, 'g')
                let frase = textFinal.replace(mentionRegex, '')
                
                if (frase.length > 30) {
                    await m.react('✖️')
                    return conn.reply(m.chat, `ꕥ El texto no puede tener más de 30 caracteres.`, m)
                }
                
                await m.react('🕒')
                const quoteObj = { 
                    type: 'quote', 
                    format: 'png', 
                    backgroundColor: '#000000', 
                    width: 512, 
                    height: 768, 
                    scale: 2, 
                    messages: [{
                        entities: [], 
                        avatar: true, 
                        from: { 
                            id: 1, 
                            name: nombre, 
                            photo: { url: pp } 
                        }, 
                        text: frase, 
                        replyMessage: {} 
                    }]
                }
                
                const json = await axios.post('https://bot.lyo.su/quote/generate', quoteObj, { 
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 30000
                })
                
                if (!json.data?.result?.image) throw new Error('No se obtuvo imagen del servicio de quotes')
                
                const buffer = Buffer.from(json.data.result.image, 'base64')
                const webpBuffer = await sticker6(buffer, null)
                const stiker = await addExif(webpBuffer, texto1, texto2)
                
                if (stiker) {
                    await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
                    await m.react('✔️')
                } else {
                    await m.react('✖️')
                }
                break
            }
            
            case 'take': 
            case 'wm': 
            case 'robar': {
                if (!m.quoted) return m.reply(`❀ Responde a un sticker con el comando *${usedPrefix + command}* seguido del nuevo nombre.\n> Ejemplo: *${usedPrefix + command}* NuevoNombre|NuevoAutor`)
                
                if (!m.quoted.mtype || !m.quoted.mtype.includes('sticker')) {
                    return m.reply('❀ Solo puedes usar este comando respondiendo a un sticker.')
                }
                
                await m.react('🕒')
                const stickerData = await m.quoted.download()
                if (!stickerData || stickerData.length === 0) {
                    await m.react('✖️')
                    return m.reply('ꕥ No se pudo descargar el sticker.')
                }
                
                const parts = text.split(/[\u2022|]/).map(p => p.trim())
                const nuevoPack = parts[0] || texto1
                const nuevoAutor = parts[1] || texto2
                
                try {
                    const exif = await addExif(stickerData, nuevoPack, nuevoAutor)
                    await conn.sendMessage(m.chat, { sticker: exif }, { quoted: m })
                    await m.react('✔️')
                } catch (e) {
                    console.error('Error en addExif:', e)
                    await m.react('✖️')
                    m.reply('Error al modificar el sticker. Puede que sea un sticker animado que no soporta modificación.')
                }
                break
            }
        }
    } catch (e) {
        console.error('Error en sticker handler:', e)
        await m.react('✖️')
        conn.reply(m.chat, `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}`, m)
    }
}

handler.tags = ['sticker']
handler.help = ['brat', 'bratv', 'emojimix', 'qc', 'take', 'robar', 'wm']
handler.command = ['brat', 'bratv', 'emojimix', 'qc', 'take', 'wm', 'robar']

export default handler