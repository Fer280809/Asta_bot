import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix }) => {
try {
if (!text) return conn.reply(m.chat, `🎄 *¡Ho Ho Ho!* Por favor, escribe el nombre del Pokemon que quieres buscar en la Pokédex Navideña.`, m)
const url = `https://some-random-api.com/pokemon/pokedex?pokemon=${encodeURIComponent(text)}`
await m.react('🎅')
const response = await fetch(url)
const json = await response.json()
if (!response.ok) return conn.reply(m.chat, '❄️ *¡Oh no!* No pude encontrar ese Pokémon en el Polo Norte.', m)
const aipokedex = `🎁 *POKÉDEX NAVIDEÑA* 🎁

🎅 *Información del Pokémon:*
> ✨ *Nombre* » ${json.name}
> 🔢 *ID* » ${json.id}
> 🎨 *Tipo* » ${json.type}
> ⚡ *Habilidades* » ${json.abilities}
> 📏 *Tamaño* » ${json.height}
> ⚖️ *Peso* » ${json.weight}
> 📖 *Descripción* » ${json.description}

🌟 *¡Encuentra más detalles sobre este Pokémon mágico en la Pokedex!*
> https://www.pokemon.com/es/pokedex/${json.name.toLowerCase()}

🎄 *¡Feliz búsqueda en esta Navidad!*`
conn.reply(m.chat, aipokedex, m)
await m.react('✨')
} catch (error) {
await m.react('❄️')
await conn.reply(m.chat, `🎄 *¡Error en el taller!* Algo salió mal al buscar el Pokémon.\n> Usa *${usedPrefix}report* para informarle a Santa.\n\n${error.message}`, m)
}}

handler.help = ['pokedex']
handler.tags = ['fun']
handler.command = ['pokedex']
handler.group = true

export default handler
