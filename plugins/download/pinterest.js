import { pinterestSearch } from '../../lib/pinterest.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {

if (!text) {

return m.reply(`❀ Escribe qué buscar

Ejemplo:
${usedPrefix + command} paisajes`)
}

await m.react('🕒')

try {

let results = await pinterestSearch(text, 10)

if (!results || results.length === 0) {

await m.react('❌')
return m.reply('❌ No se encontraron resultados.')
}

let url = results[Math.floor(Math.random() * results.length)]

await conn.sendMessage(m.chat, {

image: { url },

caption:
'꒰ ❀ ꒱ ─ Pinterest ─ ꒰ ❀ ꒱\n' +
`Búsqueda › ${text}`

}, { quoted: m })

await m.react('✅')

} catch (e) {

console.log(e)

await m.react('❌')

m.reply('❌ Error al buscar en Pinterest.')

}

}

handler.help = ['pinterest <texto>']
handler.tags = ['download']
handler.command = ['pinterest', 'pin']
handler.group = true

export default handler
