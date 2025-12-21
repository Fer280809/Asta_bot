import { PokemonLogic } from '../../lib/poke/logic.js'

let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon
    let loc = PokemonLogic.getMap(p.ubicacion)

    if (!loc.puntos_interes?.includes("Centro Pokémon")) {
        return m.reply(`🏥 Aquí no hay un Centro Pokémon. Debes ir a una Ciudad.`)
    }

    // Curar a todo el equipo
    p.equipo.forEach(pk => {
        pk.hp = pk.hpMax
    })

    await conn.sendMessage(m.chat, { 
        text: `🏥 *Enfermera Joy:* "Tus Pokémon están recuperados. ¡Esperamos volver a verte!"`,
        mentions: [m.sender] 
    }, { quoted: m })
}
handler.command = /^p\s?heal$/i
export default handler
