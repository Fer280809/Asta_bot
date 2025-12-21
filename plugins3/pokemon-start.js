import { PokemonLogic } from '../lib/poke/logic.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    
    // Si no existe el objeto pokemon, lo creamos
    if (!user.pokemon) user.pokemon = {}
    
    if (user.pokemon.registrado) return m.reply(`❌ Ya eres un entrenador. Tu aventura actual está en *${user.pokemon.ubicacion}*`)

    if (!text) {
        const sections = [{
            title: "ELIGE TU COMPAÑERO",
            rows: [
                { title: "Bulbasaur", rowId: `${usedPrefix + command} bulbasaur`, description: "Tipo Planta/Veneno" },
                { title: "Charmander", rowId: `${usedPrefix + command} charmander`, description: "Tipo Fuego" },
                { title: "Squirtle", rowId: `${usedPrefix + command} squirtle`, description: "Tipo Agua" }
            ]
        }]
        return conn.sendList(m.chat, "✨ BIENVENIDO A AURELIA ✨", "Elige a tu primer Pokémon para comenzar tu viaje:", "Ver Iniciales", sections, m)
    }

    let choice = text.toLowerCase().trim()
    let pkmId = choice === 'bulbasaur' ? 1 : choice === 'charmander' ? 4 : choice === 'squirtle' ? 7 : null
    if (!pkmId) return m.reply("❌ Selección inválida. Elige entre Bulbasaur, Charmander o Squirtle.")

    const pkmBase = PokemonLogic.getPokemon(pkmId)
    
    // --- ESTRUCTURA DE PERFIL EXCLUSIVA ---
    user.pokemon = {
        registrado: true,
        nombreEntrenador: m.name,
        dinero: 500, // <--- INICIA CON UN POQUITO DE DINERO (500 Yenes)
        ubicacion: "Pueblo Origen",
        medallas: [],
        inventario: { 
            pokeball: 5, // 5 Pokéballs de regalo
            pocion: 2    // 2 Pociones de regalo
        },
        equipo: [{
            id: pkmId,
            nombre: pkmBase.nombre,
            nivel: 5,
            exp: 0,
            hp: pkmBase.statsBase.hp + 10,
            hpMax: pkmBase.statsBase.hp + 10,
            stats: { ...pkmBase.statsBase },
            tipos: pkmBase.tipos,
            movimientos: ["Placaje", "Arañazo"]
        }],
        pc: []
    }

    await conn.sendMessage(m.chat, { 
        image: { url: pkmBase.imagen }, 
        caption: `🎉 ¡Felicidades! Has recibido a *${pkmBase.nombre}*.\n\n💰 Has recibido *$500* y un kit de *5 Pokéballs* para empezar.\n\nUsa *.p info* para ver tu estado.` 
    }, { quoted: m })
}

handler.command = /^(p|pokemon)start$/i
export default handler
