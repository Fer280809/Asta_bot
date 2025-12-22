import fs from 'fs'
import { PokemonLogic } from '../lib/poke/logic.js'

let handler = async (m, { conn, text, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon
    if (!p?.registrado) return m.reply('❌ No has iniciado tu aventura.')
    if (p.hp <= 0) return m.reply('🚑 Tu Pokémon está debilitado. ¡Usa una poción o ve al Centro Pokémon!')

    const mapa = JSON.parse(fs.readFileSync('./lib/poke/mapa.json'))
    const pokedex = JSON.parse(fs.readFileSync('./lib/poke/pokedex.json'))
    const trainers = JSON.parse(fs.readFileSync('./lib/poke/trainers.json'))

    let zona = mapa[p.ubicacion]
    let rival, esLider = false

    // Lógica para elegir rival
    if (text?.toLowerCase() === 'lider') {
        rival = trainers.lideres[p.ubicacion]
        if (!rival) return m.reply('🏙️ Aquí no hay un Gimnasio Pokémon.')
        esLider = true
    } else {
        rival = trainers.entrenadores_ruta[Math.floor(Math.random() * trainers.entrenadores_ruta.length)]
    }

    // Simulación de Batalla Rápida
    let pokeRivalId = rival.equipo[0]
    let pokeRivalData = pokedex[pokeRivalId]
    let statsRival = PokemonLogic.calculateStats(pokeRivalData.statsBase, rival.nivel)

    let log = `⚔️ *COMBATE CONTRA ${rival.nombre.toUpperCase()}*\n`
    log += `👤 "${rival.frase}"\n\n`
    log += `🔴 ${p.nombre} (Nv. ${p.nivel}) vs 🔵 ${pokeRivalData.nombre} (Nv. ${rival.nivel})\n`
    log += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`

    // Cálculo de daño simplificado
    let dañoRecibido = Math.floor((rival.nivel * 2) + (Math.random() * 10))
    let dañoHecho = Math.floor((p.nivel * 3) + (Math.random() * 15))

    p.hp -= dañoRecibido
    statsRival.hp -= dañoHecho

    if (statsRival.hp <= 0) {
        let exp = PokemonLogic.calculateExpGanada(rival.nivel, esLider, p.emocion)
        let dinero = PokemonLogic.calculatePrize(rival.nivel, esLider)
        
        p.exp += exp
        p.dinero += dinero
        
        log += `✨ *¡VICTORIA!* ✨\n`
        log += `💰 Ganaste: $${dinero}\n`
        log += `📈 EXP: +${exp}\n`
        
        if (esLider && !p.medallas.includes(rival.medalla)) {
            p.medallas.push(rival.medalla)
            log += `🏆 ¡Has ganado la *${rival.medalla}*!\n`
        }

        // Checar subida de nivel y evolución
        let expReq = PokemonLogic.getExpRequired(p.nivel)
        if (p.exp >= expReq) {
            p.nivel++
            p.exp = 0
            log += `🎊 ¡Subiste al nivel ${p.nivel}!\n`
            
            let evo = PokemonLogic.checkEvolution(p, pokedex)
            if (evo) {
                p.id = evo.nuevoId; p.nombre = evo.nuevoNombre
                log += `🌟 ¡ESTÁ EVOLUCIONANDO! Ahora es un *${p.nombre}*\n`
            }
        }
    } else {
        log += `💀 *DERROTA...* Tu Pokémon ha huido o se ha debilitado.\n`
    }

    p.hp = Math.max(0, p.hp)
    await m.reply(log)
}

handler.command = /^(p|pokemon)battle|pelear$/i
export default handler
