// ============================================================
// mediafire.js  –  estilo ᴀsᴛᴀ-ʙᴏᴛ
// ============================================================
import fetch from 'node-fetch'
import { lookup } from 'mime-types'

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

let handler = async (m, { conn, text, usedPrefix }) => {
    const rcanal = await getRcanal()
    if (!text) return conn.sendMessage(m.chat, {
        text: `ׅㅤ𓏸𓈒ㅤׄ ❗ *ᴜsᴏ* :: ${usedPrefix}mediafire <enlace>\nׅㅤ𓏸𓈒ㅤׄ *ᴇᴊᴇᴍᴘʟᴏ* :: ${usedPrefix}mf https://www.mediafire.com/...`,
        contextInfo: rcanal
    }, { quoted: m })

    if (!/^https:\/\/www\.mediafire\.com\//i.test(text)) return conn.sendMessage(m.chat, {
        text: `ׅㅤ𓏸𓈒ㅤׄ ❌ *ᴇɴʟᴀᴄᴇ ɪɴᴠᴀ́ʟɪᴅᴏ* :: sᴏʟᴏ ᴍᴇᴅɪᴀғɪʀᴇ.ᴄᴏᴍ`,
        contextInfo: rcanal
    }, { quoted: m })

    try {
        await m.react('🕒')
        const res = await fetch(`${global.APIs.delirius.url}/download/mediafire?url=${encodeURIComponent(text)}`)
        const json = await res.json()
        const data = json.data
        if (!json.status || !data?.filename || !data?.link) throw 'ɴᴏ sᴇ ᴘᴜᴅᴏ ᴏʙᴛᴇɴᴇʀ ᴇʟ ᴀʀᴄʜɪᴠᴏ'
        const mimetype = data.mime || lookup(data.extension?.toLowerCase()) || 'application/octet-stream'
        const dl_url = data.link.includes('u=') ? decodeURIComponent(data.link.split('u=')[1]) : data.link
        const caption =
            `> . ﹡ ﹟ 📁 ׄ ⬭ *ᴍᴇᴅɪᴀғɪʀᴇ ᴅᴏᴡɴʟᴏᴀᴅ*\n\n` +
            `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📦* ㅤ֢ㅤ⸱ㅤᯭִ*\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ɴᴏᴍʙʀᴇ* :: ${data.filename}\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴘᴇsᴏ* :: ${data.size || 'Desconocido'}\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴛɪᴘᴏ* :: ${mimetype}\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴇɴʟᴀᴄᴇ* :: ${text}`
        await conn.sendMessage(m.chat, { document: { url: dl_url }, fileName: data.filename, mimetype, caption }, { quoted: m })
        await m.react('✅')
    } catch (e) {
        await m.react('❌')
        conn.sendMessage(m.chat, {
            text: `ׅㅤ𓏸𓈒ㅤׄ ⚠️ *ᴇʀʀᴏʀ* :: ${e.message || e}`,
            contextInfo: rcanal
        }, { quoted: m })
    }
}

handler.command = ['mf', 'mediafire']
handler.help = ['mediafire']
handler.tags = ['descargas']
handler.group = true
handler.premium = true
handler.reg = true

export { handler as default }
