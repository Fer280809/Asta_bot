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

const handler = async (m, { args, conn, usedPrefix }) => {
    const rcanal = await getRcanal()
    try {
        if (!args[0]) {
            return conn.sendMessage(m.chat, {
                text:
                    `> . ﹡ ﹟ 📲 ׄ ⬭ *ɪɢ & ғʙ ᴅᴏᴡɴʟᴏᴀᴅ*\n\n` +
                    `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📥* ㅤ֢ㅤ⸱ㅤᯭִ*\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ *ᴜsᴏ* :: ${usedPrefix}ig <enlace>\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ *ᴘʟᴀᴛᴀғᴏʀᴍᴀs* :: Instagram · Facebook\n\n` +
                    `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜✦* ㅤ֢ㅤ⸱ㅤᯭִ* — *ᴇᴊᴇᴍᴘʟᴏs*\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ ${usedPrefix}ig https://www.instagram.com/p/...\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ ${usedPrefix}fb https://www.facebook.com/reel/...\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ ${usedPrefix}fb https://fb.watch/...`,
                contextInfo: rcanal
            }, { quoted: m })
        }

        const url = args[0].trim()
        if (!/https?:\/\/(www\.)?(instagram\.com|facebook\.com|fb\.watch)/i.test(url)) {
            return conn.sendMessage(m.chat, {
                text:
                    `ׅㅤ𓏸𓈒ㅤׄ ❌ *ᴇɴʟᴀᴄᴇ ɪɴᴠᴀ́ʟɪᴅᴏ*\n\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ *ᴀᴄᴇᴘᴛᴀᴅᴏs* :: instagram.com · facebook.com · fb.watch`,
                contextInfo: rcanal
            }, { quoted: m })
        }

        await m.react('🕒')

        let mediaUrls = []
        let success = false

        const apis = [
            {
                name: 'vreden',
                url: `${global.APIs?.vreden?.url || 'https://api.vreden.my.id'}/api/igdownload?url=${encodeURIComponent(url)}`,
                parser: async (json) => {
                    if (json.resultado?.respuesta?.datos?.length)
                        return json.resultado.respuesta.datos.map(v => ({ url: v.url, type: v.type || 'video' }))
                    return []
                }
            },
            {
                name: 'delirius',
                url: `${global.APIs?.delirius?.url || 'https://delirius-api-oficial.vercel.app'}/download/instagram?url=${encodeURIComponent(url)}`,
                parser: async (json) => {
                    if (json.status && json.data?.length)
                        return json.data.map(v => ({ url: v.url, type: v.type || 'video' }))
                    return []
                }
            },
            {
                name: 'alpha',
                url: `https://api.alpha-md.xyz/download/instagram?url=${encodeURIComponent(url)}`,
                parser: async (json) => {
                    const medias = []
                    if (json.data?.image) medias.push({ url: json.data.image, type: 'image' })
                    if (json.data?.video) medias.push({ url: json.data.video, type: 'video' })
                    return medias
                }
            }
        ]

        for (const api of apis) {
            try {
                const res = await fetch(api.url, {
                    headers: { 'User-Agent': 'Mozilla/5.0' },
                    timeout: 30000
                }).catch(() => null)
                if (!res || !res.ok) continue
                const json = await res.json().catch(() => null)
                if (!json) continue
                mediaUrls = await api.parser(json)
                if (mediaUrls.length > 0) { success = true; break }
            } catch { continue }
        }

        if (!success || mediaUrls.length === 0) {
            await m.react('❌')
            return conn.sendMessage(m.chat, {
                text:
                    `ׅㅤ𓏸𓈒ㅤׄ ❌ *ɴᴏ sᴇ ᴘᴜᴅᴏ ᴅᴇsᴄᴀʀɢᴀʀ*\n\n` +
                    `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜⚠️* ㅤ֢ㅤ⸱ㅤᯭִ* — *ᴘᴏsɪʙʟᴇs ᴄᴀᴜsᴀs*\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ ᴇʟ ᴇɴʟᴀᴄᴇ ᴇs ᴘʀɪᴠᴀᴅᴏ ᴏ ᴇʟɪᴍɪɴᴀᴅᴏ\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ ᴇʟ ᴄᴏɴᴛᴇɴɪᴅᴏ ʀᴇǫᴜɪᴇʀᴇ ʟᴏɢɪɴ\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ ᴠɪᴅᴇᴏ ᴍᴜʏ ʟᴀʀɢᴏ (+10ᴍɪɴ)`,
                contextInfo: rcanal
            }, { quoted: m })
        }

        let sentCount = 0
        for (let i = 0; i < mediaUrls.length; i++) {
            const media = mediaUrls[i]
            try {
                const cap =
                    `> . ﹡ ﹟ 📲 ׄ ⬭ *${media.type === 'image' ? 'ɪɴsᴛᴀɢʀᴀᴍ' : 'ᴅᴇsᴄᴀʀɢᴀ'} ᴅᴏᴡɴʟᴏᴀᴅ*\n` +
                    (mediaUrls.length > 1 ? `ׅㅤ𓏸𓈒ㅤׄ *${i + 1}/${mediaUrls.length}* ᴅᴇ ${mediaUrls.length} ᴍᴇᴅɪᴏs` : '')

                if (media.type === 'image') {
                    await conn.sendFile(m.chat, media.url, 'instagram.jpg', cap, m)
                } else {
                    await conn.sendFile(m.chat, media.url, 'instagram.mp4', cap, m)
                }
                sentCount++
                if (i < mediaUrls.length - 1) await new Promise(r => setTimeout(r, 1000))
            } catch { continue }
        }

        if (sentCount > 0) {
            await m.react('✅')
            if (sentCount < mediaUrls.length) {
                await conn.sendMessage(m.chat, {
                    text: `ׅㅤ𓏸𓈒ㅤׄ ✅ *ᴅᴇsᴄᴀʀɢᴀ ᴘᴀʀᴄɪᴀʟ* :: ${sentCount}/${mediaUrls.length} ᴍᴇᴅɪᴏs ᴇɴᴠɪᴀᴅᴏs`,
                    contextInfo: rcanal
                }, { quoted: m })
            }
        } else {
            await m.react('❌')
        }
    } catch (error) {
        await m.react('⚠️')
        await conn.sendMessage(m.chat, {
            text: `ׅㅤ𓏸𓈒ㅤׄ ⚠️ *ᴇʀʀᴏʀ* :: ${error.message}`,
            contextInfo: rcanal
        }, { quoted: m })
    }
}

handler.command = /^(instagram|ig|fb|facebook|igdl|fbdl|descargarig|descargarfb)$/i
handler.tags = ['descargas']
handler.help = ['instagram <enlace>', 'ig <enlace>', 'facebook <enlace>', 'fb <enlace>']
handler.limit = true
handler.premium = false
handler.group = false
handler.reg = true

export default handler
