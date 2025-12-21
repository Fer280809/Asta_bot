import axios from 'axios'
import cheerio from 'cheerio'

let handler = async (m, { conn, text, usedPrefix }) => {
if (!text) return conn.reply(m.chat, `✨ ¡Ho-ho-ho! Pásame el link de Twitter para ver el regalo.`, m)
try {
await m.react('🐦')
const result = await twitterScraper(text);
if (result.data.type === 'video') {
let caption = `🎄 *X - DOWNLOAD* 🎄\n\n> 🎬 Video » ${result.data.title}\n> ⏳ Tiempo » ${result.data.duration}`
conn.sendFile(m.chat, result.data.dl[0].url, "video.mp4", caption, m)
} else {
await conn.sendMessage(m.chat, { image: { url: result.data.imageUrl }, caption: `🎁 Imagen de X (Twitter) entregada.`}, { quoted: m })
}
await m.react('🌟')
} catch (e) {
await m.react('✖️')
return conn.reply(m.chat, `❄️ El Grinch se llevó el tweet.`, m)
}}
handler.command = ["x", "twitter", "xdl"]
export default handler

// (Aquí iría la función twitterScraper que ya tienes en tu archivo original)
