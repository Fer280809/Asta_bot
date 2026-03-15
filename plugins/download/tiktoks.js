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
        text: `> . ﹡ ﹟ 🎵 ׄ ⬭ *ᴛɪᴋᴛᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅ*\n\n*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📥* ㅤ֢ㅤ⸱ㅤᯭִ*\nׅㅤ𓏸𓈒ㅤׄ *ᴜsᴏ* :: ${usedPrefix}tiktok <enlace o búsqueda>\nׅㅤ𓏸𓈒ㅤׄ *ᴇᴊᴇᴍᴘʟᴏ* :: ${usedPrefix}tiktok https://tiktok.com/...\nׅㅤ𓏸𓈒ㅤׄ *ʙᴜsᴄᴀʀ* :: ${usedPrefix}tiktok baile viral`,
        contextInfo: rcanal
    }, { quoted: m })

    const isUrl = /(?:https:?\/{2})?(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\/([^\s&]+)/gi.test(text)
    try {
        await m.react('🕒')
        if (isUrl) {
            const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}?hd=1`)
            const data = res.data?.data
            if (!data?.play) return conn.sendMessage(m.chat, {
                text: `ׅㅤ𓏸𓈒ㅤׄ ❌ *ᴇɴʟᴀᴄᴇ ɪɴᴠᴀ́ʟɪᴅᴏ* :: sɪɴ ᴄᴏɴᴛᴇɴɪᴅᴏ ᴅᴇsᴄᴀʀɢᴀʙʟᴇ`,
                contextInfo: rcanal
            }, { quoted: m })

            const { title, duration, author, created_at, type, images, music, play } = data
            const caption =
                `> . ﹡ ﹟ 🎵 ׄ ⬭ *ᴛɪᴋᴛᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅ*\n\n` +
                `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📱* ㅤ֢ㅤ⸱ㅤᯭִ*\n` +
                `ׅㅤ𓏸𓈒ㅤׄ *ᴛɪ́ᴛᴜʟᴏ* :: ${title || 'sɪɴ ᴛɪ́ᴛᴜʟᴏ'}\n` +
                `ׅㅤ𓏸𓈒ㅤׄ *ᴀᴜᴛᴏʀ* :: ${author?.nickname || author?.unique_id || 'Desconocido'}\n` +
                `ׅㅤ𓏸𓈒ㅤׄ *ᴅᴜʀᴀᴄɪᴏ́ɴ* :: ${duration || 'N/A'}s`

            if (type === 'image' && Array.isArray(images)) {
                const medias = images.map(url => ({ type: 'image', data: { url }, caption }))
                await conn.sendSylphy(m.chat, medias, { quoted: m })
                if (music) await conn.sendMessage(m.chat, { audio: { url: music }, mimetype: 'audio/mp4', fileName: 'tiktok_audio.mp4' }, { quoted: m })
            } else {
                await conn.sendMessage(m.chat, { video: { url: play }, caption }, { quoted: m })
            }
        } else {
            const res = await axios({
                method: 'POST',
                url: 'https://tikwm.com/api/feed/search',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Cookie': 'current_language=en',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'
                },
                data: { keywords: text, count: 20, cursor: 0, HD: 1 }
            })
            const results = res.data?.data?.videos?.filter(v => v.play) || []
            if (results.length < 2) return conn.sendMessage(m.chat, {
                text: `ׅㅤ𓏸𓈒ㅤׄ ❌ *sɪɴ ʀᴇsᴜʟᴛᴀᴅᴏs* :: ${text}`,
                contextInfo: rcanal
            }, { quoted: m })

            const medias = results.slice(0, 10).map(v => ({
                type: 'video',
                data: { url: v.play },
                caption:
                    `ׅㅤ𓏸𓈒ㅤׄ *ᴛɪ́ᴛᴜʟᴏ* :: ${v.title || 'N/A'}\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ *ᴀᴜᴛᴏʀ* :: ${v.author?.nickname || 'Desconocido'}\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ *ᴅᴜʀᴀᴄɪᴏ́ɴ* :: ${v.duration || 'N/A'}`
            }))
            await conn.sendSylphy(m.chat, medias, { quoted: m })
        }

        await m.react('✅')
    } catch (e) {
        await m.react('❌')
        await conn.sendMessage(m.chat, {
            text: `ׅㅤ𓏸𓈒ㅤׄ ⚠️ *ᴇʀʀᴏʀ* :: ${e.message}\nׅㅤ𓏸𓈒ㅤׄ 💡 *ʀᴇᴘᴏʀᴛᴀʀ* :: ${global.etiqueta || 'admin'}`,
            contextInfo: rcanal
        }, { quoted: m })
    }
}

handler.help = ['tiktok', 'tt']
handler.tags = ['descargas']
handler.command = ['tiktok', 'tt', 'tiktoks', 'tts']
handler.group = false
handler.reg = true

export default handler
