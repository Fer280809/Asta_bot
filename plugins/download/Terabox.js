// ============================================================
// Terabox.js  –  estilo ᴀsᴛᴀ-ʙᴏᴛ
// ============================================================
import axios from "axios"
import fetch from "node-fetch"

const MAX_DIRECT_SIZE = 50 * 1024 * 1024
const MAX_FILE_SIZE   = 2 * 1024 * 1024 * 1024

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
    } catch { return {} }
}

async function getTeraBoxInfo(url) {
    const api = `https://terabox-dl.qtlfp.repl.co/api?url=${encodeURIComponent(url)}`
    const { data } = await axios.get(api, { timeout: 15000, headers: { "User-Agent": "Mozilla/5.0" } })
    if (!data || !data.download_url) throw new Error("ʟᴀ ᴀᴘɪ ɴᴏ ᴘᴜᴅᴏ ᴏʙᴛᴇɴᴇʀ ᴇʟ ᴇɴʟᴀᴄᴇ")
    const size = await getFileSize(data.download_url)
    return { title: data.title || "Sin título", thumbnail: data.thumbnail || "", downloadLink: data.download_url, size }
}

async function getFileSize(url) {
    try {
        const res = await axios.head(url)
        return parseInt(res.headers["content-length"]) || 0
    } catch { return 0 }
}

function formatSize(bytes) {
    if (!bytes || isNaN(bytes)) return "Desconocido"
    const units = ["B", "KB", "MB", "GB"]
    let i = 0; bytes = Number(bytes)
    while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++ }
    return `${bytes.toFixed(2)} ${units[i]}`
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const rcanal = await getRcanal()
    if (!text?.trim()) {
        return conn.sendMessage(m.chat, {
            text:
                `> . ﹡ ﹟ ☁️ ׄ ⬭ *ᴛᴇʀᴀʙᴏx ᴅᴏᴡɴʟᴏᴀᴅ*\n\n` +
                `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📥* ㅤ֢ㅤ⸱ㅤᯭִ*\n` +
                `ׅㅤ𓏸𓈒ㅤׄ *ᴜsᴏ* :: ${usedPrefix}${command} <enlace>\n` +
                `ׅㅤ𓏸𓈒ㅤׄ *ᴇᴊᴇᴍᴘʟᴏ* :: ${usedPrefix}${command} https://terabox.com/s/xxxxx`,
            contextInfo: rcanal
        }, { quoted: m })
    }

    await m.react("🔍")

    try {
        const info = await getTeraBoxInfo(text.trim())
        const { title, thumbnail, downloadLink, size } = info
        const isBig = size > MAX_DIRECT_SIZE

        const body =
            `> . ﹡ ﹟ ☁️ ׄ ⬭ *ᴛᴇʀᴀʙᴏx ᴅᴏᴡɴʟᴏᴀᴅ*\n\n` +
            `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📦* ㅤ֢ㅤ⸱ㅤᯭִ*\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ɴᴏᴍʙʀᴇ* :: ${title}\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴛᴀᴍᴀɴ̃ᴏ* :: ${formatSize(size)}\n\n` +
            `> ## \`ᴇʟɪɢᴇ ᴜɴ ᴏᴘᴄɪᴏ́ɴ ⬇️\``

        const buttons = []
        if (!isBig) {
            buttons.push(
                { buttonId: `teradownload|${downloadLink}|audio|false`, buttonText: { displayText: '🎧 ᴀᴜᴅɪᴏ' } },
                { buttonId: `teradownload|${downloadLink}|video|false`, buttonText: { displayText: '📽️ ᴠɪᴅᴇᴏ' } }
            )
        }
        buttons.push(
            { buttonId: `teradownload|${downloadLink}|audio|true`, buttonText: { displayText: '💿 ᴀᴜᴅɪᴏ ᴅᴏᴄ' } },
            { buttonId: `teradownload|${downloadLink}|video|true`, buttonText: { displayText: '🎥 ᴠɪᴅᴇᴏ ᴅᴏᴄ' } }
        )

        await conn.sendMessage(m.chat, {
            image: { url: thumbnail },
            caption: body,
            footer: `『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡`,
            buttons,
            viewOnce: true,
            headerType: 4,
            contextInfo: rcanal
        }, { quoted: m })

        m.react("✅")
    } catch (e) {
        m.react("❌")
        conn.sendMessage(m.chat, {
            text: `ׅㅤ𓏸𓈒ㅤׄ ⚠️ *ᴇʀʀᴏʀ* :: ${e.message}`,
            contextInfo: rcanal
        }, { quoted: m })
    }
}

handler.before = async (m, { conn }) => {
    if (!m.buttonId?.startsWith("teradownload|")) return
    const [_, url, type, asDoc] = m.buttonId.split("|")
    const isDoc = asDoc === "true"
    const mime = type === "audio" ? "audio/mpeg" : "video/mp4"
    const ext  = type === "audio" ? "mp3" : "mp4"
    await m.react("⏳")
    try {
        if (isDoc) {
            await conn.sendMessage(m.chat, {
                document: { url },
                mimetype: mime,
                fileName: `archivo.${ext}`,
                caption: `ׅㅤ𓏸𓈒ㅤׄ 📦 *ᴀʀᴄʜɪᴠᴏ ᴛᴇʀᴀʙᴏx* :: ${ext.toUpperCase()}`
            }, { quoted: m })
        } else {
            if (type === "audio") {
                await conn.sendMessage(m.chat, { audio: { url }, mimetype: "audio/mpeg", fileName: "audio.mp3" }, { quoted: m })
            } else {
                await conn.sendMessage(m.chat, { video: { url }, mimetype: "video/mp4", caption: `ׅㅤ𓏸𓈒ㅤׄ 🎥 *ᴠɪᴅᴇᴏ ᴅᴇsᴅᴇ ᴛᴇʀᴀʙᴏx*` }, { quoted: m })
            }
        }
        m.react("✅")
    } catch {
        m.react("❌")
        conn.reply(m.chat, `ׅㅤ𓏸𓈒ㅤׄ ❌ *ᴇʀʀᴏʀ ᴀʟ ᴇɴᴠɪᴀʀ ᴇʟ ᴀʀᴄʜɪᴠᴏ*`, m)
    }
}

handler.command = ["teraplay"]
handler.tags = ["descargas"]
handler.group = false
handler.reg = true

export default handler
