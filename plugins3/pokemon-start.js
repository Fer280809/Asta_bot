import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Verificar si el usuario ya tiene una partida
    let user = global.db.data.users[m.sender]
    if (!user.pokemon) user.pokemon = {}
    if (user.pokemon.registrado) return m.reply(`❌ Ya eres un entrenador Pokémon. Usa *${usedPrefix}p profile* para ver tus datos.`)

    const pokedex = JSON.parse(fs.readFileSync('./lib/poke/pokedex.json'))
    
    // IDs de los iniciales: 1 (Bulbasaur), 4 (Charmander), 7 (Squirtle)
    const iniciales = {
        "1": "Bulbasaur 🍃",
        "4": "Charmander 🔥",
        "7": "Squirtle 💧"
    }

    // 2. Si no ha elegido uno, mostrar el menú
    if (!text || !iniciales[text]) {
        let menu = `🌟 *BIENVENIDO AL MUNDO POKÉMON* 🌟\n\n`
        menu += `Soy el Profesor Cerezo. Para comenzar tu investigación en la región de *Auralis*, necesito que elijas a tu primer compañero:\n\n`
        for (let id in iniciales) {
            menu += `• [${id}] ${iniciales[id]}\n`
        }
        menu += `\nUsa: *${usedPrefix + command} [ID]*\n_Ejemplo: ${usedPrefix + command} 4_`
        return m.reply(menu)
    }

    // 3. Registrar al usuario con la estructura completa
    let pData = pokedex[text]
    user.pokemon = {
        registrado: true,
        id: text,
        nombre: pData.nombre,
        nombreEntrenador: m.pushName || 'Entrenador',
        nivel: 5,
        exp: 0,
        hp: 100, // Vida actual
        hpMax: 100, // Vida máxima según nivel
        dinero: 1000,
        ubicacion: "Pueblo Paleta",
        tipos: pData.tipos,
        // Mochila inicial balanceada
        mochila: {
            "pokebola": 5,
            "pocion": 3,
            "antidoto": 1
        },
        medallas: [],
        almacen: [], // El PC para los Pokémon capturados
        emocion: 100, // Felicidad del Pokémon (afecta la EXP)
        lastHunt: 0 // Cooldown para evitar spam de caza
    }

    let bienvenida = `🎊 ¡Felicidades, *${user.pokemon.nombreEntrenador}*!\n\n`
    bienvenida += `Has elegido a *${pData.nombre}* como tu compañero de aventuras.\n`
    bienvenida += `📍 Actualmente te encuentras en *Pueblo Paleta*.\n\n`
    bienvenida += `📱 Usa *${usedPrefix}p go* para empezar a moverte o *${usedPrefix}p hunt* para buscar Pokémon en la hierba alta.`

    await conn.reply(m.chat, bienvenida, m)
}

handler.command = /^(p|pokemon)start|iniciar$/i
export default handler
