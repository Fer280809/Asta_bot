import fetch from "node-fetch"
import yts from "yt-search"
import Jimp from "jimp"
import fs from "fs"
import path, { dirname } from "path"
import { spawn } from "child_process"
import { fileURLToPath } from "url"
import play from "play-dl"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500 MB
const AUDIO_DOC_THRESHOLD = 30 * 1024 * 1024 // 30 MB

// Conversión a audio WhatsApp válido
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

        ffmpeg.stderr.on('data', (data) => console.log('FFmpeg:', data.toString()))
        ffmpeg.on('close', (code) => code === 0 ? resolve(true) : reject(new Error(`FFmpeg failed: ${code}`)))
        ffmpeg.on('error', reject)
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

function formatSize(bytes) {
    if (!bytes || isNaN(bytes)) return 'Desconocido'
    const units = ['B', 'KB', 'MB', 'GB']
    let i = 0
    bytes = Number(bytes)
    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024
        i++
    }
    return `${bytes.toFixed(2)} ${units[i]}`
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (['ytmp3', 'ytmp4', 'ytmp3doc', 'ytmp4doc'].includes(command)) {
        return await handleDownload(m, conn, text, command, usedPrefix)
    }

    if (!text?.trim()) {
        return conn.reply(m.chat, `❗ Ingresa el nombre de una canción o video.\n\n📝 Ejemplo: *${usedPrefix + command} Bad Bunny Tití Me Preguntó*`, m)
    }

    await m.react('🔍')

    try {
        const search = await yts(text)
        const videoInfo = search.all?.[0]
        if (!videoInfo) throw '❗ No se encontraron resultados.'

        const { title, thumbnail, timestamp, views, ago, url, author } = videoInfo
        const vistas = views?.toLocaleString?.() || 'Desconocido'

        const body = `╭━━━━━━━━━━━━━╮
│ 🎵 *YouTube Play*
╰━━━━━━━━━━━━━╯

📹 *${title}*
👤 Canal: ${author.name}
👁️ Vistas: ${vistas}
⏱️ Duración: ${timestamp}
📅 Publicado: ${ago}
🔗 Link: ${url}

*Elige una opción:*`

        const buttons = [
            { buttonId: `${usedPrefix}ytmp3 ${url}`, buttonText: { displayText: '🎧 Audio' } },
            { buttonId: `${usedPrefix}ytmp4 ${url}`, buttonText: { displayText: '📽️ Video' } },
            { buttonId: `${usedPrefix}ytmp3doc ${url}`, buttonText: { displayText: '💿 Audio Doc' } },
            { buttonId: `${usedPrefix}ytmp4doc ${url}`, buttonText: { displayText: '🎥 Video Doc' } }
        ]

        await conn.sendMessage(m.chat, {
            image: { url: thumbnail },
            caption: body,
            footer: `『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡`,
            buttons,
            viewOnce: true,
            headerType: 4
        }, { quoted: m })

        await m.react('✅')
    } catch (e) {
        await m.react('❌')
        return conn.reply(m.chat, typeof e === 'string' ? e : `⚠️ Error: ${e.message}`, m)
    }
}

async function handleDownload(m, conn, text, command, usedPrefix) {
    if (!text?.trim()) {
        return conn.reply(m.chat, `❌ Ingresa una URL o nombre.\n\n📝 Ejemplo: *${usedPrefix + command} Bad Bunny*`, m)
    }

    await m.react('⏳')

    try {
        let url, title, thumbnail, author

        if (/youtube.com|youtu.be/.test(text)) {
            url = text
            const info = await play.video_basic_info(url)
            title = info.video_details.title
            thumbnail = info.video_details.thumbnails[0].url
            author = info.video_details.channel?.name || "Desconocido"
        } else {
            const search = await yts(text)
            if (!search.videos.length) throw "❌ No se encontraron resultados"
            const videoInfo = search.videos[0]
            url = videoInfo.url
            title = videoInfo.title
            thumbnail = videoInfo.thumbnail
            author = videoInfo.author?.name || "Desconocido"
        }

        console.log(`🎯 Descargando: ${title}`)
        const thumbResized = await resizeImage(await (await fetch(thumbnail)).buffer(), 300)

        // Audio
        if (command === 'ytmp3' || command === 'ytmp3doc') {
            const stream = await play.stream(url, { quality: 2 })
            const tempDir = path.join(__dirname, 'temp')
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

            const tempInput = path.join(tempDir, `input_${Date.now()}.mp3`)
            const fileStream = fs.createWriteStream(tempInput)
            stream.stream.pipe(fileStream)

            await new Promise(res => fileStream.on('finish', res))

            if (command === 'ytmp3') {
                const tempOutput = path.join(tempDir, `output_${Date.now()}.opus`)
                await convertToWhatsAppAudio(tempInput, tempOutput)
                const audioBuffer = fs.readFileSync(tempOutput)
                await conn.sendMessage(m.chat, {
                    audio: audioBuffer,
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true,
                    fileName: `${title}.ogg`
                }, { quoted: m })
                fs.unlinkSync(tempInput)
                fs.unlinkSync(tempOutput)
            } else {
                await conn.sendMessage(m.chat, {
                    document: { url: tempInput },
                    mimetype: 'audio/mpeg',
                    fileName: `${title}.mp3`,
                    caption: `${title}`,
                    jpegThumbnail: thumbResized
                }, { quoted: m })
            }
        }

        // Video
        if (command === 'ytmp4' || command === 'ytmp4doc') {
            const stream = await play.stream(url, { quality: 1 })
            await conn.sendMessage(m.chat, {
                video: { url },
                mimetype: 'video/mp4',
                caption: `🎬 *${title}*`,
                jpegThumbnail: thumbResized
            }, { quoted: m })
        }

        await m.react('✅')
    } catch (e) {
        await m.react('❌')
        console.error('❌ Error:', e)
        return conn.reply(m.chat, typeof e === 'string' ? e : `❌ Error: ${e.message}`, m)
    }
}

handler.help = ['play', 'ytmp3', 'ytmp4', 'ytmp3doc', 'ytmp4doc']
handler.tags = ['descargas']
handler.command = ['play', 'ytmp3', 'ytmp4', 'ytmp3doc', 'ytmp4doc']
handler.register = false
handler.group = false

export default handler
