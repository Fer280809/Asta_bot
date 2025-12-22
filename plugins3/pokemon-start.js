import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    if (!user.pokemon) user.pokemon = {}
    if (user.pokemon.registrado) return m.reply(`❌ Ya eres un entrenador. Usa *${usedPrefix}p profile*`)

    const pokedex = JSON.parse(fs.readFileSync('./lib/poke/pokedex.json'))
    
    // Basado en tu pokedex.json: Pidgey es el ID 10. 
    // He puesto estos de ejemplo que sí suelen estar.
    const iniciales = {
        "10": "Pidgey 🐦",
        "13": "Caterpie 🐛",
        "19": "Rattata 🐀"
    }

    if (!text || !iniciales[text]) {
        let menu = `🌟 *BIENVENIDO A AURALIS* 🌟\n\nElija su primer Pokémon:\n`
        for (let id in iniciales) {
            menu += `• [${id}] ${iniciales[id]}\n`
        }
        return m.reply(menu)
    }

    let pData = pokedex[text]
    user.pokemon = {
        registrado: true,
        id: text,
        nombre: pData.nombre,
        nombreEntrenador: m.pushName || 'Entrenador',
        nivel: 5,
        exp: 0,
        hp: pData.statsBase.hp + 10,
        hpMax: pData.statsBase.hp + 10,
        dinero: 1000,
        ubicacion: "Albavera",
        tipos: pData.tipos,
        mochila: { "pokeball": 5, "pocion": 3 },
        medallas: [],
        almacen: [],
        lastHunt: 0
    }

    m.reply(`🎊 ¡Has elegido a *${pData.nombre}*! Tu aventura comienza en Albavera.`)
}
handler.command = ['pstart', 'pokemon-start']
export default handler
