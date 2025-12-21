import axios from "axios"

const handler = async (m, { conn, text, usedPrefix }) => {
if (!text) return m.reply("🎶 ¡Ho-ho-ho! ¿Qué villancico o canción quieres escuchar hoy?")
try {
await m.react('🎵')
const isUrl = /https?:\/\/(open\.)?spotify\.com\/track\/[a-zA-Z0-9]+/.test(text)
let trackUrl = text
let info = null
if (!isUrl) {
const search = await axios.get(`${global.APIs.delirius.url}/search/spotify?q=${encodeURIComponent(text)}&limit=1`)
const result = search.data?.data?.[0]
if (!result) throw new Error("❄️ No encontré esa canción en el taller.")
trackUrl = result.url
info = { title: result.title, artist: result.artist, album: result.album, image: result.image }
}
const res = await axios.get(`${global.APIs.delirius.url}/download/spotifydl?url=${encodeURIComponent(trackUrl)}`)
const d = res.data?.data
const caption = `「🔔」*VILLANCICO EN CAMINO* <${d.title || info.title}>\n\n> 🎅 Autor » *${d.author || info.artist}*\n> ⏳ Duración » *${d.duration || '??'}*\n> 🔗 Enlace » ${trackUrl}`
await conn.sendMessage(m.chat, { text: caption, contextInfo: { externalAdReply: { title: '🎄 s⍴᥆𝗍і𝖿ᥡ • X-MAS 🎄', body: 'Regalos musicales', mediaType: 1, thumbnail: await (await fetch(d.image || info.image)).buffer() }}}, { quoted: m })
await conn.sendMessage(m.chat, { audio: { url: d.url }, mimetype: 'audio/mp4' }, { quoted: m })
await m.react('🌟')
} catch (e) {
await m.react('✖️')
m.reply(`⚠︎ El Grinch rompió el tocadiscos.\n\n${e.message}`)
}}
handler.command = ['spotify', 'music']
export default handler
