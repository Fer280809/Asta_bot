import fs from 'fs'
let handler = async (m, { conn, text, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    if (user.pokemon?.registrado) return m.reply('❌ Ya eres un entrenador.')

    const pokedex = JSON.parse(fs.readFileSync('./lib/poke/pokedex.json'))
    const iniciales = ["1", "4", "7"] // Bulbasaur, Charmander, Squirtle

    if (!text || !iniciales.includes(text)) {
        return m.reply(`🌟 *BIENVENIDO A POKÉMON AURALIS* 🌟\n\nElige a tu compañero:\n1. Bulbasaur 🍃\n4. Charmander 🔥\n7. Squirtle 💧\n\nUsa: *${usedPrefix}pstart [número]*`)
    }

    let pData = pokedex[text]
    user.pokemon = {
        registrado: true,
        id: text,
        nombre: pData.nombre,
        nombreEntrenador: m.pushName || 'Entrenador',
        nivel: 5,
        exp: 0,
        hp: 100,
        hpMax: 100,
        tipos: pData.tipos,
        dinero: 500,
        ubicacion: "Pueblo Paleta",
        mochila: { "pokebola": 5, "pocion": 2 },
        medallas: [],
        almacen: [],
        emocion: 100
    }

    m.reply(`🎉 ¡Felicidades! Ahora *${pData.nombre}* es tu compañero. ¡Tu aventura comienza en Pueblo Paleta!`)
}
handler.command = /^(pstart|pokemonstart)$/i
export default handler
