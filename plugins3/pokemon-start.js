import { PokemonLogic } from '../../lib/poke/logic.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    if (!user.pokemon) user.pokemon = {}
    
    if (user.pokemon.registrado) {
        return m.reply(`¡Ya eres entrenador! Tu aventura sigue en *${user.pokemon.ubicacion}*`)
    }

    if (!text) {
        const sections = [
            {
                title: "ELIGE TU COMPAÑERO",
                rows: [
                    { title: "Bulbasaur", rowId: `${usedPrefix + command} bulbasaur`, description: "Tipo Planta/Veneno" },
                    { title: "Charmander", rowId: `${usedPrefix + command} charmander`, description: "Tipo Fuego" },
                    { title: "Squirtle", rowId: `${usedPrefix + command} squirtle`, description: "Tipo Agua" }
                ]
            }
        ]

        return conn.sendList(m.chat, "✨ BIENVENIDO A AURELIA ✨", "Hola, soy el Profesor Roble. Para comenzar, elige uno de estos 3 Pokémon iniciales:", "Ver Iniciales", sections, m)
    }

    let choice = text.toLowerCase().trim()
    let pokemonId = choice === 'bulbasaur' ? 1 : choice === 'charmander' ? 4 : choice === 'squirtle' ? 7 : null
    
    if (!pokemonId) return m.reply("❌ Selección inválida.")

    const pkmBase = PokemonLogic.getPokemon(pokemonId)
    
    // Inicializar partida
    user.pokemon = {
        registrado: true,
        nombreEntrenador: m.name,
        dinero: 500,
        ubicacion: "Pueblo Origen",
        medallas: [],
        inventario: { pokeball: 5, pocion: 2 },
        equipo: [{
            id: pokemonId,
            nombre: pkmBase.nombre,
            nivel: 5,
            exp: 0,
            hp: pkmBase.statsBase.hp + 10,
            hpMax: pkmBase.statsBase.hp + 10,
            stats: { ...pkmBase.statsBase },
            tipos: pkmBase.tipos,
            movimientos: ["Placaje", "Gruñido"] // Movimientos iniciales
        }],
        pc: []
    }

    await conn.sendMessage(m.chat, { 
        image: { url: pkmBase.imagen }, 
        caption: `🎉 ¡Excelente elección! *${pkmBase.nombre}* y tú serán grandes amigos.\n\n📍 Estás en: *Pueblo Origen*\n🎒 Tienes: 5 Pokéballs y 2 Pociones.\n\nUsa *.p info* para ver tu estado.` 
    }, { quoted: m })
}

handler.command = /^(p|pokemon)start$/i
handler.tags = ['plugin3']
export default handler
