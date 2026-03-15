// ============================================================
// modapk.js  –  estilo ᴀsᴛᴀ-ʙᴏᴛ
// ============================================================
import { search, download } from 'aptoide-scraper'
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

var handler = async (m, { conn, usedPrefix, command, text }) => {
    const rcanal = await getRcanal()
    if (!text) return conn.sendMessage(m.chat, {
        text:
            `> . ﹡ ﹟ 📲 ׄ ⬭ *ᴀᴘᴋ ᴅᴏᴡɴʟᴏᴀᴅ*\n\n` +
            `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📦* ㅤ֢ㅤ⸱ㅤᯭִ*\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴜsᴏ* :: ${usedPrefix}${command} <nombre de la apk>\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴇᴊᴇᴍᴘʟᴏ* :: ${usedPrefix}apk minecraft\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ғᴜᴇɴᴛᴇ* :: Aptoide`,
        contextInfo: rcanal
    }, { quoted: m })

    try {
        await m.react('🕒')
        const searchA = await search(text)
        const data5 = await download(searchA[0].id)

        const caption =
            `> . ﹡ ﹟ 📲 ׄ ⬭ *ᴀᴘᴛᴏɪᴅᴇ - ᴅᴇsᴄᴀʀɢᴀ*\n\n` +
            `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📦* ㅤ֢ㅤ⸱ㅤᯭִ*\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ɴᴏᴍʙʀᴇ* :: ${data5.name}\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴘᴀᴄᴋᴀɢᴇ* :: ${data5.package}\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴀᴄᴛᴜᴀʟɪᴢᴀᴄɪᴏ́ɴ* :: ${data5.lastup}\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴘᴇsᴏ* :: ${data5.size}`

        await conn.sendFile(m.chat, data5.icon, 'thumbnail.jpg', caption, m)

        if (data5.size.includes('GB') || data5.size.replace(' MB', '') > 999) {
            return conn.sendMessage(m.chat, {
                text: `ׅㅤ𓏸𓈒ㅤׄ ❌ *ᴀʀᴄʜɪᴠᴏ ᴅᴇᴍᴀsɪᴀᴅᴏ ɢʀᴀɴᴅᴇ* :: ${data5.size}`,
                contextInfo: rcanal
            }, { quoted: m })
        }

        await conn.sendMessage(m.chat, {
            document: { url: data5.dllink },
            mimetype: 'application/vnd.android.package-archive',
            fileName: data5.name + '.apk',
            caption: null
        }, { quoted: m })

        await m.react('✅')
    } catch (error) {
        await m.react('❌')
        conn.sendMessage(m.chat, {
            text: `ׅㅤ𓏸𓈒ㅤׄ ⚠️ *ᴇʀʀᴏʀ* :: ${error.message}`,
            contextInfo: rcanal
        }, { quoted: m })
    }
}

handler.tags = ['descargas']
handler.help = ['apkmod']
handler.command = ['apk', 'modapk', 'aptoide']
handler.group = true
handler.premium = true
handler.reg = true

export default handler
