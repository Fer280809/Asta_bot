import fetch from "node-fetch"
import yts from "yt-search"
import Jimp from "jimp"
import axios from "axios"
import crypto from "crypto"
import fs from "fs"
import { spawn } from "child_process"
import { fileURLToPath } from "url"
import path, { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const MAX_FILE_SIZE = 500 * 1024 * 1024
const AUDIO_DOC_THRESHOLD = 30 * 1024 * 1024

// Lista de canciones navideñas aleatorias
const cancionesNavidenas = [
    'Jingle Bells',
    'Feliz Navidad Jose Feliciano',
    'All I Want for Christmas Mariah Carey',
    'White Christmas Bing Crosby',
    'Last Christmas Wham',
    'Santa Claus is Coming to Town',
    'Silent Night',
    'Deck the Halls',
    'Rudolph the Red Nosed Reindeer',
    'Winter Wonderland',
    'Let It Snow',
    'Frosty the Snowman',
    'The Christmas Song',
    'O Holy Night',
    'Rockin Around the Christmas Tree',
    'Its Beginning to Look a Lot Like Christmas',
    'Have Yourself a Merry Little Christmas',
    'Carol of the Bells',
    'Little Drummer Boy',
    'Blue Christmas Elvis Presley',
    'Feliz Navidad letra',
    'Mi Burrito Sabanero',
    'Los Peces en el Rio',
    'Noche de Paz',
    'Campana Sobre Campana',
    'Arbolito de Navidad',
    'Blanca Navidad',
    'Rodolfo el Reno',
    'El Tamborilero',
    'Arre Borriquito',
    'Ya Viene la Vieja',
    'A La Nanita Nana',
    'Los Campanilleros',
    'Hacia Belen Va Una Burra',
    'Dime Niño',
    'Pero Mira Como Beben',
    'Tutaina',
    'Noche Paz Letra Español',
    'Navidad Navidad Dulce Navidad',
    'Santa Baby Eartha Kitt'
]

function convertToWhatsAppAudio(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
            '-i', inputPath,
            '-c:a', 'libopus',
            '-b:a', '64k',
            '-ac', '1',
            '-ar', '16000',
            '-vbr', 'on',
            '-compression_level', '10',
            '-frame_duration', '60',
            '-application', 'voip',
            '-y',
            outputPath
        ])

        ffmpeg.stderr.on('data', (data) => {
            console.log('FFmpeg stderr:', data.toString())
        })

        ffmpeg.on('close', (code) => {
            if (code === 0) {
                resolve(true)
            } else {
                reject(new Error(`FFmpeg falló con código ${code}`))
            }
        })

        ffmpeg.on('error', (err) => {
            reject(err)
        })
    })
}

async function resizeImage(buffer, size = 300) {
    try {
        const image = await Jimp.read(buffer)
        return await image.resize(size, size).getBufferAsync(Jimp.MIME_JPEG)
    } catch (e) {
        console.error('Error redimensionando imagen:', e)
        return buffer
    }
}

// Sistema Savetube corregido
const savetube = {
    api: {
        base: "https://media.savetube.me/api",
        info: "/v2/info",
        download: "/download",
        cdn: "/random-cdn"
    },
    headers: {
        accept: "*/*",
        "content-type": "application/json",
        origin: "https://yt.savetube.me",
        referer: "https://yt.savetube.me/",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    },
    crypto: {
        hexToBuffer: (hexString) => {
            const matches = hexString.match(/.{1,2}/g)
            return Buffer.from(matches.join(""), "hex")
        },
        decrypt: async (enc) => {
            try {
                const secretKey = "C5D58EF67A7584E4A29F6C35BBC4EB12"
                const data = Buffer.from(enc, "base64")
                const iv = data.slice(0, 16)
                const content = data.slice(16)
                const key = savetube.crypto.hexToBuffer(secretKey)
                
                const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv)
                decipher.setAutoPadding(true)
                
                let decrypted = decipher.update(content)
                decrypted = Buffer.concat([decrypted, decipher.final()])
                return JSON.parse(decrypted.toString())
            } catch (error) {
                console.error('Error decrypting:', error)
                throw error
            }
        }
    },
    youtube: (url) => {
        const patterns = [
            /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
            /youtu\.be\/([a-zA-Z0-9_-]{11})/,
            /v=([a-zA-Z0-9_-]{11})/
        ]
        for (let pattern of patterns) {
            const match = url.match(pattern)
            if (match) return match[1]
        }
        return null
    },
    request: async (endpoint, data = {}, method = "post") => {
        try {
            const response = await axios({
                method,
                url: `${endpoint.startsWith("http") ? "" : savetube.api.base}${endpoint}`,
                data: method === "post" ? data : undefined,
                params: method === "get" ? data : undefined,
                headers: savetube.headers,
                timeout: 30000
            })
            return { status: true, code: 200, data: response.data }
        } catch (error) {
            console.error('Request error:', error.message)
            return { 
                status: false, 
                code: error.response?.status || 500, 
                error: error.message 
            }
        }
    },
    getCDN: async () => {
        const response = await savetube.request(savetube.api.cdn, {}, "get")
        if (!response.status) return response
        return { status: true, code: 200, data: response.data.cdn }
    },
    download: async (link) => {
        try {
            const id = savetube.youtube(link)
            if (!id) return { status: false, code: 400, error: "ID de YouTube no válido" }
            
            console.log(`Obteniendo info para video ID: ${id}`)
            
            const cdnx = await savetube.getCDN()
            if (!cdnx.status) {
                console.error('Error obteniendo CDN:', cdnx.error)
                return cdnx
            }
            
            const cdn = cdnx.data
            console.log(`CDN seleccionado: ${cdn}`)
            
            const videoInfo = await savetube.request(
                `https://${cdn}${savetube.api.info}`,
                { url: `https://www.youtube.com/watch?v=${id}` }
            )
            
            if (!videoInfo.status || !videoInfo.data?.data) {
                console.error('Error info video:', videoInfo.error)
                return { 
                    status: false, 
                    code: 500, 
                    error: "No se pudo obtener información del video" 
                }
            }
            
            console.log('Info obtenida, descifrando...')
            const decrypted = await savetube.crypto.decrypt(videoInfo.data.data)
            
            const downloadData = await savetube.request(
                `https://${cdn}${savetube.api.download}`,
                { 
                    id, 
                    downloadType: "audio", 
                    quality: "mp3", 
                    key: decrypted.key 
                }
            )
            
            if (!downloadData?.data?.data?.downloadUrl) {
                console.error('No hay URL de descarga:', downloadData)
                return { 
                    status: false, 
                    code: 500, 
                    error: "No se pudo obtener enlace de descarga" 
                }
            }
            
            return {
                status: true,
                code: 200,
                result: {
                    title: decrypted.title || "Desconocido",
                    author: decrypted.channel || "Desconocido",
                    download: downloadData.data.data.downloadUrl,
                    thumbnail: decrypted.thumbnail || null,
                    duration: decrypted.duration || 0
                }
            }
            
        } catch (error) {
            console.error('Error en download:', error)
            return { status: false, code: 500, error: error.message }
        }
    }
}

async function getSize(url) {
    try {
        const res = await axios.head(url, {
            timeout: 10000,
            headers: { 
                'User-Agent': 'Mozilla/5.0',
                'Accept': '*/*'
            }
        })
        const contentLength = res.headers['content-length']
        return contentLength ? parseInt(contentLength, 10) : 0
    } catch (error) {
        console.error('Error obteniendo tamaño:', error.message)
        return 0
    }
}

const handler = async (m, { conn, usedPrefix }) => {
    await m.react('🎄')

    try {
        // Seleccionar canción navideña aleatoria
        const cancionAleatoria = cancionesNavidenas[Math.floor(Math.random() * cancionesNavidenas.length)]
        
        console.log(`🎵 Buscando villancico: "${cancionAleatoria}"`)

        // Buscar en YouTube usando yts (como en el comando que funciona)
        const searchResults = await yts(cancionAleatoria)
        const videoInfo = searchResults.videos?.[0]

        if (!videoInfo) {
            throw new Error('❌ No se encontró el villancico')
        }

        const { title, thumbnail, url, author, timestamp } = videoInfo
        
        console.log(`🎯 Encontrado: "${title}"`)

        await conn.reply(m.chat, 
            `🎄 *¡Los elfos están trabajando!* 🎅\n\n` +
            `🎵 *Preparando:* ${title}\n` +
            `👤 *Artista:* ${author?.name || 'Desconocido'}\n` +
            `⏱️ *Duración:* ${timestamp || 'Desconocida'}\n\n` +
            `✨ *Descargando villancico...*`, 
            m
        )

        // Procesar miniatura
        let thumbResized = null
        try {
            const thumbResponse = await fetch(thumbnail)
            if (thumbResponse.ok) {
                const thumbBuffer = await thumbResponse.arrayBuffer()
                thumbResized = await resizeImage(Buffer.from(thumbBuffer), 300)
            }
        } catch (thumbError) {
            console.warn('Error con miniatura:', thumbError.message)
        }

        // Descargar audio usando savetube
        console.log(`🔗 Descargando: ${url}`)
        const dl = await savetube.download(url)
        
        if (!dl.status) {
            console.error('Error savetube:', dl.error)
            throw new Error(dl.error || 'Error al descargar el audio')
        }

        console.log(`✅ Audio obtenido: ${dl.result.title}`)

        // Verificar tamaño
        const size = await getSize(dl.result.download)
        console.log(`📦 Tamaño del archivo: ${size} bytes`)

        // Crear objeto de cita similar al otro comando
        const fkontak = {
            key: { 
                fromMe: false, 
                participant: "0@s.whatsapp.net",
                remoteJid: "0@s.whatsapp.net"
            },
            message: {
                extendedTextMessage: {
                    text: `🎄 *${dl.result.title}*\n\n✨ ¡Feliz Navidad! 🎅`,
                    contextInfo: {
                        externalAdReply: {
                            title: dl.result.title.substring(0, 50),
                            body: author?.name || 'Navidad',
                            thumbnail: thumbResized,
                            sourceUrl: url,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }
            }
        }

        // Si es muy grande, enviar como documento
        if (size > AUDIO_DOC_THRESHOLD || size === 0) {
            console.log('📄 Enviando como documento')
            await conn.sendMessage(m.chat, {
                document: { url: dl.result.download },
                mimetype: 'audio/mpeg',
                fileName: `${dl.result.title.substring(0, 50)}.mp3`,
                jpegThumbnail: thumbResized
            }, { quoted: fkontak })
        } else {
            console.log('🔊 Procesando como audio WhatsApp...')
            
            // Crear carpeta temporal
            const tempDir = path.join(__dirname, 'temp')
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true })
            }

            const timestampId = Date.now()
            const tempInput = path.join(tempDir, `input_${timestampId}.mp3`)
            const tempOutput = path.join(tempDir, `output_${timestampId}.opus`)

            try {
                // Descargar el audio
                console.log('⬇️ Descargando archivo...')
                const audioResponse = await fetch(dl.result.download, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0',
                        'Accept': 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8'
                    }
                })
                
                if (!audioResponse.ok) {
                    throw new Error(`HTTP ${audioResponse.status}`)
                }
                
                const audioBuffer = await audioResponse.arrayBuffer()
                fs.writeFileSync(tempInput, Buffer.from(audioBuffer))
                console.log('✅ Archivo descargado')

                // Convertir a formato WhatsApp
                console.log('🔄 Convirtiendo a formato WhatsApp...')
                await convertToWhatsAppAudio(tempInput, tempOutput)
                console.log('✅ Conversión completada')

                // Leer archivo convertido
                const convertedBuffer = fs.readFileSync(tempOutput)
                
                // Enviar como audio
                console.log('📤 Enviando audio...')
                await conn.sendMessage(m.chat, {
                    audio: convertedBuffer,
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: false,
                    fileName: `${dl.result.title.substring(0, 50)}.ogg`,
                    seconds: dl.result.duration || 180
                }, { quoted: fkontak })
                console.log('✅ Audio enviado')

                // Limpiar archivos temporales
                try {
                    if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput)
                    if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput)
                } catch (cleanError) {
                    console.warn('⚠️ Error limpiando temporales:', cleanError.message)
                }

            } catch (conversionError) {
                console.error('❌ Error en conversión:', conversionError.message)
                
                // Fallback: enviar como audio normal
                console.log('🔄 Usando fallback (audio directo)')
                await conn.sendMessage(m.chat, {
                    audio: { url: dl.result.download },
                    mimetype: 'audio/mpeg',
                    fileName: `${dl.result.title.substring(0, 50)}.mp3`,
                    seconds: dl.result.duration || 180
                }, { quoted: fkontak })
            }
        }

        await m.react('🎁')
        console.log('✅ Completado exitosamente')

    } catch (error) {
        console.error('❌ Error en handler:', error)
        await m.react('❌')
        
        const errorMessage = 
            `🎅 *¡Los renos se perdieron!* 🎄\n\n` +
            `El villancico no pudo ser entregado.\n\n` +
            `🔧 *Error:* ${error.message || 'Desconocido'}\n\n` +
            `✨ Intenta de nuevo con *${usedPrefix}musicanavi*`
        
        return conn.reply(m.chat, errorMessage, m)
    }
}

handler.help = ['musicanavi', 'navimusic', 'villancico']
handler.tags = ['descargas', 'navidad', 'audio']
handler.command = ['musicanavi', 'navimusic', 'musicanavidad', 'villancico']
handler.register = false
handler.group = false
handler.limit = true

export default handler
