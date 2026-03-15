// ============================================================
// pinterest.js  –  estilo ᴀsᴛᴀ-ʙᴏᴛ
// ============================================================
import axios from 'axios'
import cheerio from 'cheerio'
import fetch from 'node-fetch'

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

let handler = async (m, { conn, text, args, usedPrefix }) => {
    const rcanal = await getRcanal()
    if (!text) return conn.sendMessage(m.chat, {
        text:
            `> . ﹡ ﹟ 📌 ׄ ⬭ *ᴘɪɴᴛᴇʀᴇsᴛ*\n\n` +
            `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🖼️* ㅤ֢ㅤ⸱ㅤᯭִ*\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ʙᴜsᴄᴀʀ* :: ${usedPrefix}pinterest <tema>\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴅᴇsᴄᴀʀɢᴀʀ* :: ${usedPrefix}pinterest <enlace>\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴇᴊᴇᴍᴘʟᴏ* :: ${usedPrefix}pin anime wallpaper`,
        contextInfo: rcanal
    }, { quoted: m })

    try {
        if (text.includes("https://")) {
            const i = await dl(args[0])
            const isVideo = i.download?.includes(".mp4")
            await conn.sendMessage(m.chat, {
                [isVideo ? "video" : "image"]: { url: i.download },
                caption:
                    `> . ﹡ ﹟ 📌 ׄ ⬭ *ᴘɪɴᴛᴇʀᴇsᴛ ᴅᴏᴡɴʟᴏᴀᴅ*\n\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ *ᴛɪ́ᴛᴜʟᴏ* :: ${i.title || 'N/A'}`
            }, { quoted: m })
        } else {
            const results = await pins(text)
            if (!results.length) return conn.sendMessage(m.chat, {
                text: `ׅㅤ𓏸𓈒ㅤׄ ❌ *sɪɴ ʀᴇsᴜʟᴛᴀᴅᴏs* :: ${text}`,
                contextInfo: rcanal
            }, { quoted: m })

            const selected = results[Math.floor(Math.random() * results.length)]
            const pinInfo = getPinInfo(selected)

            await conn.sendMessage(m.chat, {
                image: { url: selected.image_large_url },
                caption:
                    `> . ﹡ ﹟ 📌 ׄ ⬭ *ᴘɪɴᴛᴇʀᴇsᴛ*\n\n` +
                    `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🖼️* ㅤ֢ㅤ⸱ㅤᯭִ*\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ *ᴛᴇᴍᴀ* :: ${text}\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ *ᴛɪ́ᴛᴜʟᴏ* :: ${pinInfo.title}\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ *ᴀᴜᴛᴏʀ* :: ${pinInfo.user}\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ *ᴛᴀʙʟᴇʀᴏ* :: ${pinInfo.board}\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ *ᴇɴʟᴀᴄᴇ* :: ${pinInfo.link}`
            }, { quoted: m })
        }
    } catch (e) {
        conn.sendMessage(m.chat, {
            text: `ׅㅤ𓏸𓈒ㅤׄ ⚠️ *ᴇʀʀᴏʀ* :: ${e.message || e}`,
            contextInfo: rcanal
        }, { quoted: m })
    }
}

handler.help = ['pinterest']
handler.command = ['pinterest', 'pin']
handler.tags = ["descargas"]
handler.group = true
handler.reg = true

export default handler

function getPinInfo(imageData) {
    try {
        return {
            user: imageData.pinner?.full_name || imageData.pinner?.username || 'N/A',
            title: imageData.title || imageData.grid_title || 'Sin título',
            board: imageData.board?.name || 'N/A',
            link: imageData.url || `https://pinterest.com/pin/${imageData.id}/`
        }
    } catch { return { user: 'N/A', title: 'Sin título', board: 'N/A', link: '#' } }
}

async function dl(url) {
    try {
        const res = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } })
        const $ = cheerio.load(res.data)
        const tag = $('script[data-test-id="video-snippet"]')
        if (tag.length) {
            const result = JSON.parse(tag.text())
            return { title: result.name, download: result.contentUrl }
        }
        const json = JSON.parse($("script[data-relay-response='true']").eq(0).text())
        const result = json.response.data["v3GetPinQuery"].data
        return { title: result.title, download: result.imageLargeUrl }
    } catch { return { msg: "Error" } }
}

const pins = async (judul) => {
    const link = `https://id.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(judul)}%26rs%3Dtyped&data=%7B%22options%22%3A%7B%22query%22%3A%22${encodeURIComponent(judul)}%22%2C%22redux_normalize_feed%22%3Atrue%2C%22rs%22%3A%22typed%22%2C%22scope%22%3A%22pins%22%7D%2C%22context%22%3A%7B%7D%7D`
    try {
        const res = await axios.get(link, { headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'x-requested-with': 'XMLHttpRequest' } })
        if (res.data?.resource_response?.data?.results) {
            return res.data.resource_response.data.results
                .map(item => item.images ? {
                    image_large_url: item.images.orig?.url,
                    pinner: item.pinner, title: item.title, board: item.board, id: item.id, url: item.url
                } : null).filter(Boolean)
        }
        return []
    } catch { return [] }
}
