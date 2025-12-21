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
            outputPath
        ])

        ffmpeg.stderr.on('data', (data) => {
            console.log('FFmpeg:', data.toString())
        })

        ffmpeg.on('close', (code) => {
            if (code === 0) {
                resolve(true)
            } else {
                reject(new Error(`FFmpeg failed with code ${code}`))
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
    } catch {
        return buffer
    }
}

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
        "user-agent": "Postify/1.0.0"
    },
    crypto: {
        hexToBuffer: (hexString) => {
            const matches = hexString.match(/.{1,2}/g)
            return Buffer.from(matches.join(""), "hex")
        },
        decrypt: async (enc) => {
            const secretKey = "C5D58EF67A7584E4A29F6C35BBC4EB12"
            const data = Buffer.from(enc, "base64")
            const iv = data.slice(0, 16)
            const content = data.slice(16)
            const key = savetube.crypto.hexToBuffer(secretKey)
            const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv)
            let decrypted = decipher.update(content)
            decrypted = Buffer.concat([decrypted, decipher.final()])
            return JSON.parse(decrypted.toString())
        }
    },
    youtube: (url) => {
        const patterns = [
            /youtube.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
            /youtube.com\/embed\/([a-zA-Z0-9_-]{11})/,
            /youtu.be\/([a-zA-Z0-9_-]{11})/
        ]
        for (let pattern of patterns) {
            const match = url.match(pattern)
            if (match) return match[1]
        }
        return null
    },
    request: async (endpoint, data = {}, method = "post") => {
        try {
            const { data: response } = await axios({
                method,
                url: `${endpoint.startsWith("http") ? "" : savetube.api.base}${endpoint}`,
                data: method === "post" ? data : undefined,
                params: method === "get" ? data : undefined,
                headers: savetube.headers
            })
            return { status: true, code: 200, data: response }
        } catch (error) {
            return { status: false, code: error.response?.status || 500, error: error.message }
        }
    },
    getCDN: async () => {
        const response = await savetube.request(savetube.api.cdn, {}, "get")
        if (!response.status) return response
        return { status: true, code: 200, data: response.data.cdn }
    },
    download: async (link) => {
        const id = savetube.youtube(link)
        if (!id) return { status: false, code: 400, error: "No se pudo obtener el ID del video" }
        try {
            const cdnx = await savetube.getCDN()
            if (!cdnx.status) return cdnx
            const cdn = cdnx.data
            const videoInfo = await savetube.request(`https://${cdn}${savetube.api.info}`, { url: `https://www.youtube.com/watch?v=${id}` })
            if (!videoInfo.status || !videoInfo.data?.data) return { status: false, code: 500, error: "No se pudo obtener información del video" }
            const decrypted = await savetube.crypto.decrypt(videoInfo.data.data)
            const downloadData = await savetube.request(
                `https://${cdn}${savetube.api.download}`,
                { id, downloadType: "audio", quality: "mp3", key: decrypted.key }
            )
            if (!downloadData?.data?.data?.downloadUrl) return { status: false, code: 500, error: "No se pudo obtener link de descarga" }
            return {
                status: true,
                code: 200,
                result: {
                    title: decrypted.title || "Desconocido",
                    author: decrypted.channel || "Desconocido",
                    download: downloadData.data.data.downloadUrl,
                    thumbnail: decrypted.thumbnail || null
                }
            }
        } catch (error) {
            return { status: false, code: 500, error: error.message }
        }
    }
}

async function getSize(url) {
    try {
        const res = await axios.head(url, {
            timeout: 10000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        return parseInt(res.headers['content-length'], 10) || 0
    } catch {
        return 0
    }
}

const handler = async (m, { conn, usedPrefix }) => {
    await m.react('🎄')

    try {
        // Seleccionar canción navideña aleatoria
        const cancionAleatoria = cancionesNavidenas[Math.floor(Math.random() * cancionesNavidenas.length)]
        
        console.log(`🎵 Buscando: ${cancionAleatoria}`)

        // Buscar en YouTube
        const search = await yts(cancionAleatoria)
        const videoInfo = search.all?.[0]

        if (!videoInfo) {
            throw '❌ No se encontró la canción navideña'
        }

        const { title, thumbnail, url, author } = videoInfo

        await conn.reply(m.chat, 
            `🎄 *¡Descargando música navideña!* 🎅\n\n` +
            `🎵 *Preparando tu villancico...*\n` +
            `❄️ *Los elfos están trabajando...*`, 
            m
        )

        console.log(`🎯 Descargando: ${title}`)

        const thumbResized = await resizeImage(await (await fetch(thumbnail)).buffer(), 300)

        // Descargar audio
        const dl = await savetube.download(url)
        if (!dl.status) throw dl.error || '❌ Error al descargar'

        const size = await getSize(dl.result.download)
        console.log(`📦 Tamaño: ${size} bytes`)

        const fkontak = {
            key: { fromMe: false, participant: "0@s.whatsapp.net" },
            message: {
                documentMessage: {
                    title: `🎵 ${title}`,
                    fileName: `Música Navideña`,
                    jpegThumbnail: thumbResized
                }
            }
        }

        // Si es muy grande, enviar como documento
        if (size > AUDIO_DOC_THRESHOLD) {
            await conn.sendMessage(m.chat, {
                document: { url: dl.result.download },
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`,
                jpegThumbnail: thumbResized
            }, { quoted: fkontak })
        } else {
            // Convertir y enviar como audio de WhatsApp
            const tempDir = path.join(__dirname, 'temp')
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

            const timestamp = Date.now()
            const tempInput = path.join(tempDir, `input_${timestamp}.mp3`)
            const tempOutput = path.join(tempDir, `output_${timestamp}.opus`)

            try {
                // Descargar el audio
                const audioResponse = await fetch(dl.result.download)
                const buffer = await audioResponse.arrayBuffer()
                fs.writeFileSync(tempInput, Buffer.from(buffer))

                // Convertir a formato WhatsApp
                await convertToWhatsAppAudio(tempInput, tempOutput)

                // Leer el audio convertido
                const audioBuffer = fs.readFileSync(tempOutput)

                // Enviar como audio
                await conn.sendMessage(m.chat, {
                    audio: audioBuffer,
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true,
                    fileName: `${title}.ogg`
                }, { quoted: fkontak })

                // Limpiar archivos temporales
                if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput)
                if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput)

            } catch (conversionError) {
                console.error('Error en conversión:', conversionError)
                // Fallback: enviar como audio normal
                await conn.sendMessage(m.chat, {
                    audio: { url: dl.result.download },
                    mimetype: 'audio/mpeg',
                    fileName: `${title}.mp3`
                }, { quoted: fkontak })
            }
        }

        await m.react('🎁')

    } catch (e) {
        await m.react('❌')
        console.error('❌ Error:', e)
        return conn.reply(m.chat, 
            `⚠️ *¡El Grinch bloqueó la música!* 🎄\n\n` +
            `Error: ${typeof e === 'string' ? e : e.message}\n\n` +
            `🎅 Intenta de nuevo con *${usedPrefix}musicanavi*`, 
            m
        )
    }
}

handler.help = ['musicanavi', 'navimusic', 'villancico']
handler.tags = ['descargas', 'navidad']
handler.command = ['musicanavi', 'navimusic', 'musicanavidad']
handler.register = false
handler.group = false

export default handler