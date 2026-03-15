import axios from "axios"
import fetch from "node-fetch"

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

const handler = async (m, { conn, text, usedPrefix }) => {
    const rcanal = await getRcanal()
    if (!text) return conn.sendMessage(m.chat, {
        text:
            `> . ﹡ ﹟ 🎧 ׄ ⬭ *sᴘᴏᴛɪғʏ ᴅᴏᴡɴʟᴏᴀᴅ*\n\n` +
            `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🎵* ㅤ֢ㅤ⸱ㅤᯭִ*\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴜsᴏ* :: ${usedPrefix}spotify <canción/enlace>\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴇᴊᴇᴍᴘʟᴏ* :: ${usedPrefix}spotify Blinding Lights\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴏ* :: ${usedPrefix}spotify https://open.spotify.com/track/...`,
        contextInfo: rcanal
    }, { quoted: m })

    try {
        await m.react('🕒')
        const isUrl = /https?:\/\/(open\.)?spotify\.com\/track\/[a-zA-Z0-9]+/.test(text)
        let trackUrl = text
        let info = null

        if (!isUrl) {
            const search = await axios.get(`${global.APIs.delirius.url}/search/spotify?q=${encodeURIComponent(text)}&limit=1`)
            const result = Array.isArray(search.data?.data) ? search.data.data[0] : null
            if (!result || !result.url) throw new Error("ɴᴏ sᴇ ᴇɴᴄᴏɴᴛʀᴀʀᴏɴ ʀᴇsᴜʟᴛᴀᴅᴏs")
            trackUrl = result.url
            info = { title: result.title, artist: result.artist, album: result.album, duration: result.duration, popularity: result.popularity, release: result.publish, image: result.image, url: result.url }
        }

        const res = await axios.get(`${global.APIs.delirius.url}/download/spotifydl?url=${encodeURIComponent(trackUrl)}`)
        const d = res.data?.data
        if (!res.data?.status || !d?.url) throw new Error("ɴᴏ sᴇ ᴘᴜᴅᴏ ᴏʙᴛᴇɴᴇʀ ᴇʟ ᴀᴜᴅɪᴏ")

        const data = {
            title: d.title || info?.title || "Desconocido",
            artist: d.author || info?.artist || "Desconocido",
            album: info?.album || "Desconocido",
            duration: info?.duration || `${Math.floor(d.duration / 60000)}:${String(Math.floor((d.duration % 60000) / 1000)).padStart(2, '0')}`,
            popularity: info?.popularity || null,
            release: info?.release || null,
            image: d.image || info?.image,
            download: d.url,
            url: info?.url || trackUrl
        }

        const caption =
            `> . ﹡ ﹟ 🎧 ׄ ⬭ *sᴘᴏᴛɪғʏ ᴅᴏᴡɴʟᴏᴀᴅ*\n\n` +
            `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🎵* ㅤ֢ㅤ⸱ㅤᯭִ*\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴛɪ́ᴛᴜʟᴏ* :: ${data.title}\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴀʀᴛɪsᴛᴀ* :: ${data.artist}\n` +
            (data.album !== "Desconocido" ? `ׅㅤ𓏸𓈒ㅤׄ *ᴀ́ʟʙᴜᴍ* :: ${data.album}\n` : '') +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴅᴜʀᴀᴄɪᴏ́ɴ* :: ${data.duration}\n` +
            (data.popularity ? `ׅㅤ𓏸𓈒ㅤׄ *ᴘᴏᴘᴜʟᴀʀɪᴅᴀᴅ* :: ${data.popularity}\n` : '') +
            (data.release ? `ׅㅤ𓏸𓈒ㅤׄ *ᴘᴜʙʟɪᴄᴀᴅᴏ* :: ${data.release}\n` : '') +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴇɴʟᴀᴄᴇ* :: ${data.url}`

        // Enviar con preview de imagen de portada del álbum
        await conn.sendMessage(m.chat, {
            text: caption,
            contextInfo: {
                ...rcanal,
                externalAdReply: {
                    ...rcanal.externalAdReply,
                    title: data.title,
                    body: `🎤 ${data.artist}`,
                    mediaType: 1,
                    thumbnail: data.image ? await (await fetch(data.image)).buffer() : rcanal.externalAdReply?.thumbnail,
                    sourceUrl: data.url,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })

        await conn.sendMessage(m.chat, {
            audio: { url: data.download },
            fileName: `${data.title}.mp3`,
            mimetype: 'audio/mpeg'
        }, { quoted: m })

        await m.react('✅')
    } catch (err) {
        await m.react('❌')
        conn.sendMessage(m.chat, {
            text: `ׅㅤ𓏸𓈒ㅤׄ ⚠️ *ᴇʀʀᴏʀ* :: ${err.message}`,
            contextInfo: rcanal
        }, { quoted: m })
    }
}

handler.help = ["spotify"]
handler.tags = ["descargas"]
handler.command = ["spotify", "splay"]
handler.group = true
handler.reg = true

export default handler
