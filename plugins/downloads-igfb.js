const handler = async (m, { args, conn, usedPrefix }) => {
try {
if (!args[0]) return conn.reply(m.chat, `🎄 ¡Jo-jo-jo! Ingresa un enlace de Instagram o Facebook para tu regalo.`, m)
let data = []
try {
await m.react('❄️')
const api = `${global.APIs.vreden.url}/api/igdownload?url=${encodeURIComponent(args[0])}`
const res = await fetch(api)
const json = await res.json()
if (json.resultado?.respuesta?.datos?.length) {
data = json.resultado.respuesta.datos.map(v => v.url)
}} catch {}
if (!data.length) return conn.reply(m.chat, `🎅 No encontré nada en el calcetín.`, m)
for (let media of data) {
await conn.sendFile(m.chat, media, 'ig.mp4', `🎁 Aquí tienes tu regalo de Navidad ฅ^•ﻌ•^ฅ.`, m)
await m.react('🌟')
}} catch (error) {
await m.react('✖️')
await m.reply(`⚠︎ Los duendes tuvieron un error.\n> Usa *${usedPrefix}report*.\n\n${error.message}`)
}}
handler.help = ['ig', 'fb']
handler.tags = ['descargas']
handler.command = /^(instagram|ig|fb|facebook)$/i
export default handler
