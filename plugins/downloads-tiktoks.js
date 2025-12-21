import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix }) => {
if (!text) return conn.reply(m.chat, '🎅 ¡Ho-ho-ho! Pásame un link de TikTok o dime qué video buscar.', m)
const isUrl = /(?:https:?\/{2})?(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\/([^\s&]+)/gi.test(text)
try {
await m.react('⛄')
if (isUrl) {
const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}?hd=1`)
const data = res.data?.data;
if (!data?.play) return conn.reply(m.chat, '❄️ Enlace inválido o sin contenido en el taller.', m)
const { title, duration, author, created_at, type, images, music, play } = data
const caption = createCaption(title, author, duration, created_at)
if (type === 'image' && Array.isArray(images)) {
const medias = images.map(url => ({ type: 'image', data: { url }, caption }));
await conn.sendSylphy(m.chat, medias, { quoted: m })
if (music) {
await conn.sendMessage(m.chat, { audio: { url: music }, mimetype: 'audio/mp4', fileName: 'tiktok_audio.mp4' }, { quoted: m })
}} else {
await conn.sendMessage(m.chat, { video: { url: play }, caption }, { quoted: m })
}} else {
const res = await axios({ method: 'POST', url: 'https://tikwm.com/api/feed/search', headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, data: { keywords: text, count: 20, cursor: 0, HD: 1 }})
const results = res.data?.data?.videos?.filter(v => v.play) || []
if (results.length < 2) return conn.reply(m.chat, '❄️ Los renos no encontraron suficientes videos.', m)
const medias = results.slice(0, 10).map(v => ({ type: 'video', data: { url: v.play }, caption: createSearchCaption(v) }))
await conn.sendSylphy(m.chat, medias, { quoted: m })
}
await m.react('🎁')
} catch (e) {
await m.react('✖️')
await conn.reply(m.chat, `⚠︎ El Grinch bloqueó la señal.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}`, m)
}}

function createCaption(title, author, duration, created_at = '') {
  return `*🎬 Estreno Navideño ›* \`${title || 'No disponible'}\`  |  🎅 *Duende ›* ${author?.nickname || author?.unique_id || 'Anon'}  |  ⏳ *Duración ›* ${duration}s`
}

function createSearchCaption(data) {
  return `*🎬 Video ›* ${data.title || 'Sin título'}  |  🎅 *Duende ›* ${data.author?.nickname || 'Anon'}  |  ⏳ *Duración ›* ${data.duration}`
}

handler.help = ['tiktok', 'tt']
handler.tags = ['downloader']
handler.command = ['tiktok', 'tt', 'tiktoks', 'tts']
handler.group = false

export default handler
