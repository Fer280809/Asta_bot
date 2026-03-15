import path from "path"
import fetch from "node-fetch"
import { File } from "megajs"

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

const handler = async (m, { conn, args, usedPrefix, command, text }) => {
    const rcanal = await getRcanal()
    if (!text) return conn.sendMessage(m.chat, {
        text:
            `> . ﹡ ﹟ ☁️ ׄ ⬭ *ᴍᴇɢᴀ ᴅᴏᴡɴʟᴏᴀᴅ*\n\n` +
            `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📥* ㅤ֢ㅤ⸱ㅤᯭִ*\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴜsᴏ* :: ${usedPrefix}${command} <enlace mega>\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ʟɪ́ᴍɪᴛᴇ* :: 300ᴍʙ ᴍᴀ́xɪᴍᴏ`,
        contextInfo: rcanal
    }, { quoted: m })

    try {
        await m.react('🕒')
        const file = File.fromURL(text)
        await file.loadAttributes()

        if (file.size >= 300 * 1024 * 1024) return conn.sendMessage(m.chat, {
            text:
                `ׅㅤ𓏸𓈒ㅤׄ ❌ *ᴀʀᴄʜɪᴠᴏ ᴅᴇᴍᴀsɪᴀᴅᴏ ɢʀᴀɴᴅᴇ*\n` +
                `ׅㅤ𓏸𓈒ㅤׄ *ᴘᴇsᴏ* :: ${formatBytes(file.size)}\n` +
                `ׅㅤ𓏸𓈒ㅤׄ *ʟɪ́ᴍɪᴛᴇ* :: 300ᴍʙ`,
            contextInfo: rcanal
        }, { quoted: m })

        const infoMsg =
            `> . ﹡ ﹟ ☁️ ׄ ⬭ *ᴍᴇɢᴀ ᴅᴏᴡɴʟᴏᴀᴅ*\n\n` +
            `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📦* ㅤ֢ㅤ⸱ㅤᯭִ*\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ɴᴏᴍʙʀᴇ* :: ${file.name}\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴛᴀᴍᴀɴ̃ᴏ* :: ${formatBytes(file.size)}\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴜʀʟ* :: ${text}\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴇsᴛᴀᴅᴏ* :: ᴅᴇsᴄᴀʀɢᴀɴᴅᴏ...`

        m.reply(infoMsg)

        const data = await file.downloadBuffer()
        const ext = path.extname(file.name).toLowerCase()
        const mimeTypes = {
            ".mp4": "video/mp4", ".pdf": "application/pdf", ".zip": "application/zip",
            ".rar": "application/x-rar-compressed", ".7z": "application/x-7z-compressed",
            ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png"
        }
        const mimetype = mimeTypes[ext] || "application/octet-stream"
        await conn.sendFile(m.chat, data, file.name, "", m, null, { mimetype, asDocument: true })
        await m.react('✅')
    } catch (e) {
        await m.react('❌')
        conn.sendMessage(m.chat, {
            text: `ׅㅤ𓏸𓈒ㅤׄ ⚠️ *ᴇʀʀᴏʀ* :: ${e.message}`,
            contextInfo: rcanal
        }, { quoted: m })
    }
}

handler.help = ["mega"]
handler.tags = ["descargas"]
handler.command = ["mega", "mg"]
handler.group = true
handler.reg = true

export default handler

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
