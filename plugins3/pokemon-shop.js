import { PokemonLogic } from '../lib/poke/logic.js' // <-- Ahora sí la llamamos

let handler = async (m, { conn, text, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon
    if (!p?.registrado) return m.reply('❌ No has iniciado tu aventura.')

    // USAMOS LA LÓGICA: Consultamos el mapa
    let loc = PokemonLogic.getMap(p.ubicacion)
    if (!loc.puntos_interes?.includes("Tienda")) {
        return m.reply(`🛒 Aquí no hay una tienda. Debes ir a una Ciudad como *Ciudad Verde* o *Ciudad Celeste*.`)
    }

    if (text) {
        let buy = text.toLowerCase().trim()
        if (buy === 'ball' && p.dinero >= 200) {
            p.dinero -= 200; p.inventario.pokeball++;
            return m.reply('🛒 Compraste 1 Pokéball por $200')
        }
        if (buy === 'pocion' && p.dinero >= 300) {
            p.dinero -= 300; p.inventario.pocion++;
            return m.reply('🛒 Compraste 1 Poción por $300')
        }
        return m.reply('❌ Dinero insuficiente o artículo inválido.')
    }

    const sections = [{
        title: "TIENDA POKÉMON",
        rows: [
            { title: "Pokeball", rowId: `${usedPrefix}p shop ball`, description: "$200" },
            { title: "Pocion", rowId: `${usedPrefix}p shop pocion`, description: "$300" }
        ]
    }]
    await conn.sendList(m.chat, "🛒 TIENDA", `Tu dinero: $${p.dinero}\nUbicación: ${p.ubicacion}`, "Comprar", sections, m)
}
handler.command = /^(p|pokemon)shop$/i
export default handler
