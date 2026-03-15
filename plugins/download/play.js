import fetch from "node-fetch"
import yts from "yt-search"
import Jimp from "jimp"
import axios from "axios"
import fs from "fs"
import { fileURLToPath } from "url"
import path, { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const MAX_FILE_SIZE = 500 * 1024 * 1024
const AUDIO_DOC_THRESHOLD = 30 * 1024 * 1024

async function resizeImage(buffer, size = 300) {
    try {
        const image = await Jimp.read(buffer)
        return await image.resize(size, size).getBufferAsync(Jimp.MIME_JPEG)
    } catch {
        return buffer
    }
}

// =================== HELPER RCANAL ===================
async function getRcanal() {
    try {
        const thumb = await (await fetch(global.icono)).buffer()
        return {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.channelRD?.id || "120363399175402285@newsletter",
                serverMessageId: '',
                newsletterName: global.channelRD?.name || "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』"
            },
            externalAdReply: {
                title: global.botname || 'ᴀsᴛᴀ-ʙᴏᴛ',
                body: global.dev || 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ ғᴇʀɴᴀɴᴅᴏ',
                mediaType: 1,
                mediaUrl: global.redes,
                sourceUrl: global.redes,
                thumbnail: thumb,
                showAdAttribution: false,
                containsAutoReply: true,
                renderLargerThumbnail: false
            }
        }
    } catch {
        return {}
    }
}

// =================== API SAVENOW ===================
const savenowApi = {
    name: "Savenow/Y2Down API",
    key: "dfcb6d76f2f6a9894gjkege8a4ab232222",
    agent: "Mozilla/5.0 (Android 13; Mobile; rv:146.0) Gecko/146.0 Firefox/146.0",
    referer: "https://y2down.cc/enSB/",
    ytdl: async function(url, format) {
        try {
            const initUrl = `https://p.savenow.to/ajax/download.php?copyright=0&format=${format}&url=${encodeURIComponent(url)}&api=${this.key}`
            const init = await fetch(initUrl, { headers: { "User-Agent": this.agent, "Referer": this.referer } })
            const data = await init.json()
            if (!data.success) return { error: data.message || "Failed to start download" }
            const id = data.id
            const progressUrl = `https://p.savenow.to/api/progress?id=${id}`
            let attempts = 0
            while (attempts < 30) {
                await new Promise(r => setTimeout(r, 2000))
                attempts++
                const response = await fetch(progressUrl, { headers: { "User-Agent": this.agent, "Referer": this.referer } })
                const status = await response.json()
                if (status.progress === 1000) return { title: data.title || data.info?.title, image: data.info?.image, link: status.download_url }
            }
            return { error: "Timeout" }
        } catch (e) { return { error: e.message } }
    },
    download: async function(link, type = "audio") {
        try {
            const videoId = link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]
            if (!videoId) return { status: false, error: "ID de video no válido" }
            const videoInfo = await yts({ videoId })
            let result
            if (type === "audio") {
                result = await this.ytdl(link, "mp3")
                if (result.error) result = await this.ytdl(link, "m4a")
            } else {
                for (const fmt of ["720", "360", "480", "240", "144", "1080"]) {
                    result = await this.ytdl(link, fmt)
                    if (!result.error) break
                }
            }
            if (result.error) return { status: false, error: result.error }
            return {
                status: true,
                result: {
                    title: result.title || videoInfo.title || "Sin título",
                    author: videoInfo.author?.name || "Desconocido",
                    views: videoInfo.views || "0",
                    timestamp: videoInfo.timestamp || "0:00",
                    ago: videoInfo.ago || "Desconocido",
                    format: type === "audio" ? "mp3" : "mp4",
                    download: result.link,
                    thumbnail: result.image || videoInfo.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
                }
            }
        } catch (e) { return { status: false, error: e.message } }
    }
}

const amScraperApi = {
    baseUrl: "https://scrapers.hostrta.win/scraper/24",
    download: async (link, type = "audio") => {
        try {
            const videoId = link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]
            if (!videoId) return { status: false, error: "ID no válido" }
            const videoInfo = await yts({ videoId })
            const response = await axios.get(`${amScraperApi.baseUrl}?url=${encodeURIComponent(link)}`, { timeout: 15000 })
            if (!response.data || response.data.error) return { status: false, error: response.data?.error || "Error" }
            const data = response.data
            let downloadUrl = null, formatType = null
            if (type === "audio") {
                downloadUrl = data.audio?.url; formatType = "mp3"
            } else {
                downloadUrl = data.video?.url; formatType = "mp4"
            }
            if (!downloadUrl) return { status: false, error: "Formato no disponible" }
            return {
                status: true,
                result: {
                    title: videoInfo.title || "Sin título",
                    author: videoInfo.author?.name || "Desconocido",
                    views: videoInfo.views || "0",
                    timestamp: videoInfo.timestamp || "0:00",
                    ago: videoInfo.ago || "Desconocido",
                    format: formatType,
                    download: downloadUrl,
                    thumbnail: videoInfo.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
                }
            }
        } catch (e) { return { status: false, error: e.message } }
    }
}

async function downloadWithFallback(url, type = 'audio') {
    let result = await savenowApi.download(url, type)
    if (result.status) return result
    result = await amScraperApi.download(url, type)
    if (result.status) return result
    return { status: false, error: "No se pudo descargar el contenido." }
}

function formatSize(bytes) {
    if (!bytes || isNaN(bytes)) return 'Desconocido'
    const units = ['B', 'KB', 'MB', 'GB']
    let i = 0; bytes = Number(bytes)
    while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++ }
    return `${bytes.toFixed(2)} ${units[i]}`
}

async function getSize(url) {
    try {
        const res = await axios.head(url, { timeout: 10000 })
        return parseInt(res.headers['content-length'], 10) || 0
    } catch { return 0 }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (['ytmp3', 'ytmp4', 'ytmp3doc', 'ytmp4doc'].includes(command)) {
        return await handleDownload(m, conn, text, command, usedPrefix)
    }

    if (!text?.trim()) {
        const rcanal = await getRcanal()
        return conn.sendMessage(m.chat, {
            text: `> . ﹡ ﹟ 📥 ׄ ⬭ *ʏᴏᴜᴛᴜʙᴇ ᴘʟᴀʏ*\n\n*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🎵* ㅤ֢ㅤ⸱ㅤᯭִ*\nׅㅤ𓏸𓈒ㅤׄ *ᴜsᴏ* :: ${usedPrefix}${command} <canción/video>\nׅㅤ𓏸𓈒ㅤׄ *ᴇᴊᴇᴍᴘʟᴏ* :: ${usedPrefix}${command} Bad Bunny Tití\n\n*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜⚡* ㅤ֢ㅤ⸱ㅤᯭִ* — *ᴄᴏᴍᴀɴᴅᴏs*\nׅㅤ𓏸𓈒ㅤׄ *#ytmp3* :: sᴏʟᴏ ᴀᴜᴅɪᴏ\nׅㅤ𓏸𓈒ㅤׄ *#ytmp4* :: sᴏʟᴏ ᴠɪᴅᴇᴏ\nׅㅤ𓏸𓈒ㅤׄ *#ytmp3doc* :: ᴀᴜᴅɪᴏ ᴅᴏᴄᴜᴍᴇɴᴛᴏ\nׅㅤ𓏸𓈒ㅤׄ *#ytmp4doc* :: ᴠɪᴅᴇᴏ ᴅᴏᴄᴜᴍᴇɴᴛᴏ`,
            contextInfo: rcanal
        }, { quoted: m })
    }

    await m.react('🔍')

    try {
        const search = await yts(text)
        const videoInfo = search.all?.[0]
        if (!videoInfo) throw '❗ ɴᴏ sᴇ ᴇɴᴄᴏɴᴛʀᴀʀᴏɴ ʀᴇsᴜʟᴛᴀᴅᴏs'

        const { title, thumbnail, timestamp, views, ago, url, author } = videoInfo
        const vistas = views?.toLocaleString?.() || 'Desconocido'
        const rcanal = await getRcanal()

        const body =
            `> . ﹡ ﹟ 🎬 ׄ ⬭ *ʏᴏᴜᴛᴜʙᴇ ᴘʟᴀʏ*\n\n` +
            `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🎵* ㅤ֢ㅤ⸱ㅤᯭִ*\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴛɪ́ᴛᴜʟᴏ* :: ${title.substring(0, 80)}\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴄᴀɴᴀʟ* :: ${author.name.substring(0, 40)}\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴠɪsᴛᴀs* :: ${vistas}\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴅᴜʀᴀᴄɪᴏ́ɴ* :: ${timestamp}\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *sᴜʙɪᴅᴏ* :: ${ago}\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ʟɪɴᴋ* :: ${url}\n\n` +
            `> ## \`ᴇʟɪɢᴇ ᴜɴ ᴏᴘᴄɪᴏ́ɴ ⬇️\``

        const buttons = [
            { buttonId: `${usedPrefix}ytmp3 ${url}`, buttonText: { displayText: '🎧 ᴀᴜᴅɪᴏ' } },
            { buttonId: `${usedPrefix}ytmp4 ${url}`, buttonText: { displayText: '📽️ ᴠɪᴅᴇᴏ' } },
            { buttonId: `${usedPrefix}ytmp3doc ${url}`, buttonText: { displayText: '💿 ᴀᴜᴅɪᴏ ᴅᴏᴄ' } },
            { buttonId: `${usedPrefix}ytmp4doc ${url}`, buttonText: { displayText: '🎥 ᴠɪᴅᴇᴏ ᴅᴏᴄ' } }
        ]

        try {
            await conn.sendMessage(m.chat, {
                image: { url: thumbnail },
                caption: body,
                footer: `『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡`,
                buttons,
                viewOnce: true,
                headerType: 4,
                contextInfo: rcanal
            }, { quoted: m })
        } catch {
            await conn.sendMessage(m.chat, {
                text: body,
                contextInfo: { ...rcanal, mentionedJid: [] }
            }, { quoted: m })
        }

        await m.react('✅')
    } catch (e) {
        await m.react('❌')
        return conn.reply(m.chat, typeof e === 'string' ? e : `ׅㅤ𓏸𓈒ㅤׄ ⚠️ *ᴇʀʀᴏʀ* :: ${e.message}`, m)
    }
}

async function handleDownload(m, conn, text, command, usedPrefix) {
    if (!text?.trim()) {
        const rcanal = await getRcanal()
        return conn.sendMessage(m.chat, {
            text: `ׅㅤ𓏸𓈒ㅤׄ ❗ *ᴜsᴏ* :: ${usedPrefix}${command} <nombre o URL>`,
            contextInfo: rcanal
        }, { quoted: m })
    }

    await m.react('⏳')

    try {
        let url, title, thumbnail, author
        const rcanal = await getRcanal()

        if (/youtube.com|youtu.be/.test(text)) {
            const id = text.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]
            if (!id) throw '❌ ᴜʀʟ ɪɴᴠᴀ́ʟɪᴅᴀ'
            const s = await yts({ videoId: id })
            url = `https://www.youtube.com/watch?v=${id}`
            title = s.title || "Sin título"
            thumbnail = s.thumbnail
            author = s.author?.name || "Desconocido"
        } else {
            const s = await yts(text)
            if (!s.videos.length) throw "❌ ɴᴏ sᴇ ᴇɴᴄᴏɴᴛʀᴀʀᴏɴ ʀᴇsᴜʟᴛᴀᴅᴏs"
            const v = s.videos[0]
            url = v.url; title = v.title; thumbnail = v.thumbnail; author = v.author?.name || "Desconocido"
        }

        const thumbResized = await resizeImage(await (await fetch(thumbnail)).buffer(), 300)

        const processingMsg =
            `> . ﹡ ﹟ ⏳ ׄ ⬭ *ᴅᴇsᴄᴀʀɢᴀɴᴅᴏ...*\n\n` +
            `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜${command.includes('mp3') ? '🎵' : '🎬'}* ㅤ֢ㅤ⸱ㅤᯭִ*\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴛɪ́ᴛᴜʟᴏ* :: ${title}\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴇsᴛᴀᴅᴏ* :: ᴘʀᴏᴄᴇsᴀɴᴅᴏ...`

        await conn.sendMessage(m.chat, { text: processingMsg, contextInfo: rcanal }, { quoted: m })

        const type = command.includes('mp3') ? 'audio' : 'video'
        const dl = await downloadWithFallback(url, type)
        if (!dl.status) throw dl.error || '❌ ᴇʀʀᴏʀ ᴀʟ ᴅᴇsᴄᴀʀɢᴀʀ'

        const fkontak = {
            key: { fromMe: false, participant: "0@s.whatsapp.net" },
            message: {
                documentMessage: {
                    title: `${command.includes('mp3') ? '🎵' : '🎬'}「 ${title} 」⚡`,
                    fileName: `ᴅᴇsᴄᴀʀɢᴀs ᴀsᴛᴀ-ʙᴏᴛ`,
                    jpegThumbnail: thumbResized
                }
            }
        }

        if (command === 'ytmp3') {
            await conn.sendMessage(m.chat, {
                audio: { url: dl.result.download },
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`
            }, { quoted: fkontak })
        } else if (command === 'ytmp4') {
            const size = await getSize(dl.result.download)
            if (size > 200 * 1024 * 1024) throw `ׅㅤ𓏸𓈒ㅤׄ 📦 *ᴅᴇᴍᴀsɪᴀᴅᴏ ɢʀᴀɴᴅᴇ* :: ${formatSize(size)}\nׅㅤ𓏸𓈒ㅤׄ 💡 *ᴜsᴀ* :: ${usedPrefix}ytmp4doc`
            await conn.sendMessage(m.chat, {
                video: { url: dl.result.download },
                mimetype: 'video/mp4',
                caption: `ׅㅤ𓏸𓈒ㅤׄ 🎬 *${title}*`,
                jpegThumbnail: thumbResized
            }, { quoted: fkontak })
        } else if (command === 'ytmp3doc') {
            await conn.sendMessage(m.chat, {
                document: { url: dl.result.download },
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`,
                caption: `ׅㅤ𓏸𓈒ㅤׄ 🎵 *${title}*`,
                jpegThumbnail: thumbResized
            }, { quoted: fkontak })
        } else if (command === 'ytmp4doc') {
            const size = await getSize(dl.result.download)
            if (size > 600 * 1024 * 1024) throw `ׅㅤ𓏸𓈒ㅤׄ 📦 *ᴅᴇᴍᴀsɪᴀᴅᴏ ɢʀᴀɴᴅᴇ* :: ${formatSize(size)}`
            await conn.sendMessage(m.chat, {
                document: { url: dl.result.download },
                mimetype: 'video/mp4',
                fileName: `${title}.mp4`,
                jpegThumbnail: thumbResized,
                caption: `ׅㅤ𓏸𓈒ㅤׄ 🎬 *${title}*`
            }, { quoted: fkontak })
        }

        await m.react('✅')
    } catch (e) {
        await m.react('❌')
        return conn.reply(m.chat, typeof e === 'string' ? e : `ׅㅤ𓏸𓈒ㅤׄ ⚠️ *ᴇʀʀᴏʀ* :: ${e.message}`, m)
    }
}

handler.help = ['play', 'ytmp3', 'ytmp4', 'ytmp3doc', 'ytmp4doc']
handler.tags = ['descargas']
handler.command = ['play', 'ytmp3', 'ytmp4', 'ytmp3doc', 'ytmp4doc']
handler.register = false
handler.group = false
handler.reg = true

export default handler
