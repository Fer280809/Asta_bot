import yts from 'yt-search'

var handler = async (m, { text, conn, args, command, usedPrefix }) => {
if (!text) return conn.reply(m.chat, `🎶 ¡Jo-jo-jo! Ingresa el nombre del villancico o video que buscas.`, m)
try {
await m.react('⏳')
let results = await yts(text)
let tes = results.all
let teks = results.all.map(v => {
switch (v.type) {
case 'video': return `「🔔」Regalos encontrados para *<${text}>*

🌟 *${v.title}*
> 🎅 Canal » *${v.author.name}*
> ⴵ Duración » *${v.timestamp}*
> ✐ Subido » *${v.ago}*
> ✰ Vistas » *${v.views}*
> 🜸 Enlace » ${v.url}`}}).filter(v => v).join('\n\n⛄️ •••••••••••••••••••••••••••••••••• ⛄️')
await conn.sendFile(m.chat, tes[0].thumbnail, 'yts.jpeg', teks, m)
await m.react('✔️')
} catch (e) {
await m.react('✖️')
conn.reply(m.chat, `⚠︎ Hubo un problema con la entrega de carbón.\n> Usa *${usedPrefix}report* para informarlo.\n\n` + e.message, m)
}}

handler.help = ['ytsearch']
handler.tags = ['descargas']
handler.command = ['ytbuscar', 'ytsearch', 'yts']
handler.group = true

export default handler
