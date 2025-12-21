import { PokemonLogic } from '../../lib/poke/logic.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    if (!user.pokemon?.registrado) return m.reply('❌ No has iniciado tu aventura.')

    let zonaActual = PokemonLogic.getMap(user.pokemon.ubicacion)

    if (text) {
        let destino = text.trim()
        if (zonaActual.conexiones.includes(destino)) {
            user.pokemon.ubicacion = destino
            return m.reply(`🚶‍♂️ Has llegado a: *${destino}*\n\n${PokemonLogic.getMap(destino).description}`)
        }
    }

    const sections = [{
        title: "DESTINOS DISPONIBLES",
        rows: zonaActual.conexiones.map(loc => ({
            title: loc,
            rowId: `${usedPrefix + command} ${loc}`
        }))
    }]
    await conn.sendList(m.chat, "🗺️ VIAJAR", `Estás en: *${user.pokemon.ubicacion}*`, "Elegir Destino", sections, m)
}
handler.command = /^(p|pokemon)go$/i
export default handler
