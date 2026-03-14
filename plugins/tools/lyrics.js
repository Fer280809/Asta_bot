import fetch from 'node-fetch'

let handler = async (m, { text, usedPrefix, command, conn }) => {
if (!text) return m.reply(`❀ Por favor, escribe el nombre de la canción para obtener la letra`)
try {
await m.react('🕒')
let res = await fetch(`${global.APIs.delirius.url}/search/lyrics?query=${encodeURIComponent(text)}`)
if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)
let json = await res.json()
if (!json.status || !json.data?.lyrics) {
await m.react('✖️')
return m.reply('ꕥ No se encontró la letra de la canción')
}
let { title, artists, lyrics, image, url } = json.data
let caption = `❀ *Título:* ${title}\n○ *Artista:* ${artists}\n○ *Letra:*\n\n${lyrics}`
if (caption.length > 4000) caption = caption.slice(0, 3990) + '...'
caption += `\n\n↯ [Ver en Musixmatch](${url})`
await conn.sendMessage(m.chat, { image: { url: image }, caption, mentions: [m.sender] }, { quoted: m })
await m.react('✔️')
} catch (error) {
await m.react('✖️')
return conn.reply(m.chat, `⚠︎ Se ha producido un problema\n> Usa *${usedPrefix}report* para informarlo\n\n${error.message}`, m)
}}

handler.command = ['lyrics']
handler.help = ['lyrics']
handler.tags = ['tools']
handler.reg = true

export default handler
