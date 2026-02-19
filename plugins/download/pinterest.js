import { pinterestSearch } from '../lib/pinterest.js'

const cache = new Map()
const TTL = 300000
const MAX = 50

let handler = async (m, { conn, text }) => {

const query = text?.trim()
if (!query) return m.reply('꒰ ❀ ꒱ Escribe algo para buscar en Pinterest')

const key = query.toLowerCase()
const now = Date.now()

let images

const cached = cache.get(key)

if (cached && now - cached.time < TTL) {
images = cached.data
} else {

images = await pinterestSearch(query, 5)

if (!Array.isArray(images) || !images.length) {
return m.reply('꒰ ❀ ꒱ No se encontraron resultados')
}

cache.set(key, { data: images, time: now })

if (cache.size > MAX) {
cache.delete(cache.keys().next().value)
}

}

const url = images[Math.floor(Math.random() * images.length)]

if (typeof url !== 'string') {
return m.reply('꒰ ❀ ꒱ No se pudo obtener una imagen válida')
}

await conn.sendMessage(
m.chat,
{
image: { url },
caption:
'꒰ ❀ ꒱ ── Pinterest ── ꒰ ❀ ꒱\n' +
`      Búsqueda › ${query}\n\n` +
'╭─ Enlace\n' +
`╰› ${url}`
},
{ quoted: m }
)

}

handler.help=['pinterest <texto>']
handler.tags=['download']
handler.command=['pinterest','pin']
handler.group=true

export default handler
