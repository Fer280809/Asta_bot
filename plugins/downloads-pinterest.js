import axios from 'axios'
import cheerio from 'cheerio'

let handler = async (m, { conn, text, args, usedPrefix }) => {
if (!text) return m.reply(`✨ ¡Ho-ho-ho! ¿Qué ideas de decoración o imágenes buscas en Pinterest?`)
try {
await m.react('❄️')
if (text.includes("https://")) {
let i = await dl(args[0])
let isVideo = i.download.includes(".mp4")
await conn.sendMessage(m.chat, { [isVideo ? "video" : "image"]: { url: i.download }, caption: i.title }, { quoted: m })
} else {
const results = await pins(text)
if (!results.length) {
return conn.reply(m.chat, `🚫 No encontré adornos para "${text}" en el almacén.`, m)
}
const medias = results.slice(0, 10).map(img => ({ type: 'image', data: { url: img.image_large_url } }))
await conn.sendSylphy(m.chat, medias, {
caption: `🎁 Inspiración Navideña 🎁\n\n🌟 Búsqueda » "${text}"\n✨ Ideas encontradas » ${medias.length}`, quoted: m })
await m.react('✔️')
}} catch (e) {
await m.react('✖️')
conn.reply(m.chat, `⚠︎ Los duendes están en huelga.\n> Usa *${usedPrefix}report* para informarlo.\n\n` + e, m)
}}

handler.help = ['pinterest']
handler.command = ['pinterest', 'pin']
handler.tags = ["download"]
handler.group = true

export default handler

async function dl(url) {
try {
let res = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }).catch(e => e.response)
let $ = cheerio.load(res.data)
let tag = $('script[data-test-id="video-snippet"]')
if (tag.length) {
let result = JSON.parse(tag.text())
return { title: result.name, download: result.contentUrl }
} else {
let json = JSON.parse($("script[data-relay-response='true']").eq(0).text())
let result = json.response.data["v3GetPinQuery"].data
return { title: result.title, download: result.imageLargeUrl }
}} catch { return { msg: "Error navideño" } }}

const pins = async (judul) => {
const link = `https://id.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(judul)}&data=%7B%22options%22%3A%7B%22query%22%3A%22${encodeURIComponent(judul)}%22%2C%22scope%22%3A%22pins%22%7D%2C%22context%22%3A%7B%7D%7D`
const headers = { 'user-agent': 'Mozilla/5.0' }
try {
const res = await axios.get(link, { headers })
if (res.data?.resource_response?.data?.results) {
return res.data.resource_response.data.results.map(item => ({
image_large_url: item.images.orig?.url || null
})).filter(img => img.image_large_url !== null)
}
return []
} catch { return [] }}
