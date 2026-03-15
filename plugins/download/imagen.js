// ============================================================
// imagen.js  –  estilo ᴀsᴛᴀ-ʙᴏᴛ
// ============================================================
import axios from 'axios'
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

const handler = async (m, { conn, text, usedPrefix }) => {
    const rcanal = await getRcanal()
    if (!text) return conn.sendMessage(m.chat, {
        text:
            `> . ﹡ ﹟ 🖼️ ׄ ⬭ *ʙᴜsᴄᴀᴅᴏʀ ᴅᴇ ɪᴍᴀ́ɢᴇɴᴇs*\n\n` +
            `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🔍* ㅤ֢ㅤ⸱ㅤᯭִ*\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴜsᴏ* :: ${usedPrefix}imagen <texto>\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴇᴊᴇᴍᴘʟᴏ* :: ${usedPrefix}imagen anime girl`,
        contextInfo: rcanal
    }, { quoted: m })

    try {
        await m.react('🕒')
        const res = await getGoogleImageSearch(text)
        const urls = await res.getAll()
        if (urls.length < 2) return conn.sendMessage(m.chat, {
            text: `ׅㅤ𓏸𓈒ㅤׄ ❌ *sɪɴ ɪᴍᴀ́ɢᴇɴᴇs* :: ${text}`,
            contextInfo: rcanal
        }, { quoted: m })

        const medias = urls.slice(0, 10).map(url => ({ type: 'image', data: { url } }))
        const caption =
            `> . ﹡ ﹟ 🖼️ ׄ ⬭ *ʙᴜsᴄᴀᴅᴏʀ ᴅᴇ ɪᴍᴀ́ɢᴇɴᴇs*\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ʙᴜ́sǫᴜᴇᴅᴀ* :: ${text}`
        await conn.sendSylphy(m.chat, medias, { caption, quoted: m })
        await m.react('✅')
    } catch (error) {
        await m.react('❌')
        conn.sendMessage(m.chat, {
            text: `ׅㅤ𓏸𓈒ㅤׄ ⚠️ *ᴇʀʀᴏʀ* :: ${error.message}`,
            contextInfo: rcanal
        }, { quoted: m })
    }
}

handler.help = ['imagen']
handler.tags = ['descargas']
handler.command = ['imagen', 'image']
handler.reg = true

export default handler

function getGoogleImageSearch(query) {
    const apis = [
        `${global.APIs.delirius.url}/search/gimage?query=${encodeURIComponent(query)}`,
        `${global.APIs.siputzx.url}/api/images?query=${encodeURIComponent(query)}`
    ]
    return {
        getAll: async () => {
            for (const url of apis) {
                try {
                    const res = await axios.get(url)
                    const data = res.data
                    if (Array.isArray(data?.data)) {
                        const urls = data.data.map(d => d.url).filter(u => typeof u === 'string' && u.startsWith('http'))
                        if (urls.length) return urls
                    }
                } catch {}
            }
            return []
        }
    }
}
