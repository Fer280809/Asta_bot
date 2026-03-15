import fetch from 'node-fetch'
import axios from 'axios'
import * as cheerio from 'cheerio'

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

let handler = async (m, { conn, args, text }) => {
    const rcanal = await getRcanal()
    if (!text) return conn.sendMessage(m.chat, {
        text:
            `> . ﹡ ﹟ 🐦 ׄ ⬭ *x/ᴛᴡɪᴛᴛᴇʀ ᴅᴏᴡɴʟᴏᴀᴅ*\n\n` +
            `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📥* ㅤ֢ㅤ⸱ㅤᯭִ*\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴜsᴏ* :: #twitter <enlace>\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴇᴊᴇᴍᴘʟᴏ* :: #x https://x.com/...`,
        contextInfo: rcanal
    }, { quoted: m })

    try {
        await m.react('🕒')
        const result = await twitterScraper(text)
        if (!result.status) return conn.sendMessage(m.chat, {
            text: `ׅㅤ𓏸𓈒ㅤׄ ❌ *ɴᴏ sᴇ ᴘᴜᴅᴏ ᴏʙᴛᴇɴᴇʀ ᴇʟ ᴄᴏɴᴛᴇɴɪᴅᴏ*`,
            contextInfo: rcanal
        }, { quoted: m })

        if (result.data.type === 'video') {
            const caption =
                `> . ﹡ ﹟ 🐦 ׄ ⬭ *x/ᴛᴡɪᴛᴛᴇʀ ᴅᴏᴡɴʟᴏᴀᴅ*\n\n` +
                `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🎬* ㅤ֢ㅤ⸱ㅤᯭִ*\n` +
                `ׅㅤ𓏸𓈒ㅤׄ *ᴛɪ́ᴛᴜʟᴏ* :: ${result.data.title || 'N/A'}\n` +
                `ׅㅤ𓏸𓈒ㅤׄ *ᴅᴜʀᴀᴄɪᴏ́ɴ* :: ${result.data.duration || 'N/A'}\n` +
                `ׅㅤ𓏸𓈒ㅤׄ *ᴜʀʟ* :: ${text}`
            conn.sendFile(m.chat, result.data.dl[0].url, "video.mp4", caption, m)
        } else {
            await conn.sendMessage(m.chat, {
                image: { url: result.data.imageUrl },
                caption:
                    `> . ﹡ ﹟ 🐦 ׄ ⬭ *x/ᴛᴡɪᴛᴛᴇʀ ᴅᴏᴡɴʟᴏᴀᴅ*\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ *ᴜʀʟ* :: ${text}`
            }, { quoted: m })
        }
        await m.react('✅')
    } catch (e) {
        await m.react('❌')
        conn.sendMessage(m.chat, {
            text: `ׅㅤ𓏸𓈒ㅤׄ ⚠️ *ᴇʀʀᴏʀ* :: ${e.message}`,
            contextInfo: rcanal
        }, { quoted: m })
    }
}

handler.command = ["x", "twitter", "xdl"]
handler.help = ["twitter"]
handler.tags = ["descargas"]
handler.group = true
handler.reg = true

export default handler

async function twitterScraper(url) {
    return new Promise(async (resolve, reject) => {
        try {
            const twitterUrlMatch = url.match(/(https:\/\/x.com\/[^?]+)/)
            const tMatch = url.match(/t=([^&]+)/)
            const twitterUrl = twitterUrlMatch ? twitterUrlMatch[1] : ''
            const t = tMatch ? tMatch[1] : ''
            const urlnya = encodeURIComponent(`${twitterUrl}?t=${t}&s=19`)
            const response = await axios.post("https://savetwitter.net/api/ajaxSearch", `q=${urlnya}&lang=en`)
            const $ = cheerio.load(response.data.data)
            const isVideo = $('.tw-video').length > 0
            const twitterId = $('#TwitterId').val()
            if (isVideo) {
                const data = []
                $('.dl-action a').each((i, elem) => {
                    const quality = $(elem).text().trim()
                    const url = $(elem).attr('href')
                    data.push({ quality, url: $(elem).hasClass('action-convert') ? $(elem).attr('data-audioUrl') || 'N/A' : url })
                })
                resolve({ status: true, data: { type: "video", title: $('.tw-middle h3').text().trim(), duration: $('.tw-middle p').text().trim(), twitterId, dl: data } })
            } else {
                resolve({ status: true, data: { type: "image", twitterId, imageUrl: $('.photo-list .download-items__thumb img').attr('src'), dl: $('.photo-list .download-items__btn a').attr('href') } })
            }
        } catch (error) { reject(error) }
    })
}
