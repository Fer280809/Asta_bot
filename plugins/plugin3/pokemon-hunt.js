import { PokemonLogic } from '../../lib/poke/logic.js'

let handler = async (m, { conn, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    let loc = PokemonLogic.getMap(user.pokemon.ubicacion)

    if (loc.tipo !== 'hierba') return m.reply(`🏘️ Aquí no hay Pokémon salvajes. Ve a una ruta.`)

    let randomId = loc.spawn[Math.floor(Math.random() * loc.spawn.length)]
    let pkm = PokemonLogic.getPokemon(randomId)
    let nivel = Math.floor(Math.random() * (loc.niveles[1] - loc.niveles[0] + 1)) + loc.niveles[0]

    let txt = `🌿 ¡Un *${pkm.nombre}* salvaje apareció! (Nv. ${nivel})`
    
    const sections = [{
        title: "OPCIONES",
        rows: [
            { title: "⚔️ Luchar", rowId: `${usedPrefix}p fight`, description: "Iniciar combate" },
            { title: "🏃 Huir", rowId: `${usedPrefix}p info`, description: "Escapar" }
        ]
    }]
    await conn.sendMessage(m.chat, { image: { url: pkm.imagen }, caption: txt })
    await conn.sendList(m.chat, "ENCUENTRO", "¿Qué harás?", "Seleccionar", sections, m)
}
handler.command = /^p\s?hunt$/i
export default handler
