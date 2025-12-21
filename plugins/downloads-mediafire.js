import fetch from 'node-fetch'
import { lookup } from 'mime-types'

let handler = async (m, { conn, text, usedPrefix }) => {
if (!text) return conn.reply(m.chat, '🎁 ¡Jo-jo-jo! Te faltó el enlace de Mediafire.', m)
try {
await m.react('📦')
const res = await fetch(`${global.APIs.delirius.url}/download/mediafire?url=${encodeURIComponent(text)}`)
const json = await res.json()
const data = json.data
const caption = `🎄 *MEDIAFIRE - X-MAS DELIVERY* 🎄\n\n✩ Regalo » ${data.filename}\n✩ Peso » ${data.size}\n✩ Tipo » ${data.mime}`
await conn.sendMessage(m.chat, { document: { url: data.link }, fileName: data.filename, mimetype: data.mime, caption }, { quoted: m })
await m.react('🌟')
} catch (e) {
await m.react('✖️')
conn.reply(m.chat, '❄️ Santa no pudo cargar este paquete.', m)
}}
handler.command = ['mediafire', 'mf']
export default handler
