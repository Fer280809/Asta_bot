import fs from 'fs'
import { PokemonLogic } from '../lib/poke/logic.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon
    if (!p?.registrado) return m.reply('❌ No tienes una partida activa. Usa .pstart')
    if (p.hp <= 0) return m.reply('🚑 Tu Pokémon está debilitado. Ve al Centro Pokémon o usa una poción.')

    const pokedex = JSON.parse(fs.readFileSync('./lib/poke/pokedex.json'))
    const trainers = JSON.parse(fs.readFileSync('./lib/poke/trainers.json'))
    const mapa = JSON.parse(fs.readFileSync('./lib/poke/mapa.json'))
    
    const pokeData = pokedex[p.id]
    let misMovimientos = pokeData.movimientos.filter(mov => mov.nivel <= p.nivel)

    // LÓGICA DE SELECCIÓN DE RIVAL
    let rival, esLider = false
    if (text?.toLowerCase() === 'lider') {
        rival = trainers.lideres[p.ubicacion]
        if (!rival) return m.reply('🏙️ No hay un Gimnasio Pokémon en esta ubicación.')
        esLider = true
    } else {
        // Seleccionar un entrenador aleatorio de la zona o de la lista general
        let entrenadoresZona = trainers.entrenadores_ruta.filter(t => t.zona === p.ubicacion)
        rival = entrenadoresZona.length > 0 
            ? entrenadoresZona[Math.floor(Math.random() * entrenadoresZona.length)]
            : trainers.entrenadores_ruta[Math.floor(Math.random() * trainers.entrenadores_ruta.length)]
    }

    let idRival = rival.equipo[0]
    let pRivalData = pokedex[idRival]

    // SI EL USUARIO EJECUTA UN ATAQUE
    if (text && !isNaN(text)) {
        let index = parseInt(text) - 1
        if (!misMovimientos[index]) return m.reply('❌ Ese ataque no es válido o no lo has aprendido.')
        
        let move = misMovimientos[index]
        
        // 1. Turno del Jugador
        let dmgInfo = PokemonLogic.calculateDamage(p, pRivalData, move)
        
        // 2. Turno del Rival (Ataque básico proporcional al nivel)
        let dmgRival = Math.floor((rival.nivel * 2.5) + (Math.random() * 5))
        
        // Aplicar daños
        let hpRivalInicial = (rival.nivel * 5) + 50 // HP estimado del rival
        let hpRivalFinal = hpRivalInicial - dmgInfo.total
        p.hp -= dmgRival

        let log = `⚔️ *COMBATE CONTRA ${rival.nombre.toUpperCase()}*\n`
        log += `👤 "${rival.frase}"\n\n`
        log += `🌟 *${p.nombre}* usó *${move.nombre.toUpperCase()}*\n`
        if (dmgInfo.isCrit) log += `🎯 ¡GOLPE CRÍTICO!\n`
        log += `${dmgInfo.textMod}\n`
        log += `💥 Daño causado: ${dmgInfo.total}\n`
        log += `💢 Daño recibido: ${dmgRival}\n`
        log += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`

        // REVISAR VICTORIA
        if (hpRivalFinal <= 0) {
            let expGanada = PokemonLogic.calculateExpGanada(rival.nivel, esLider, p.emocion)
            let dineroGanado = esLider ? rival.premio : (rival.nivel * 50)
            
            p.exp += expGanada
            p.dinero += dineroGanado
            
            log += `✨ *¡VICTORIA TOTAL!* ✨\n`
            log += `💰 Ganaste: $${dineroGanado}\n`
            log += `📈 EXP: +${expGanada}\n`

            if (esLider && !p.medallas.includes(rival.medalla)) {
                p.medallas.push(rival.medalla)
                log += `🏆 ¡Has obtenido la *${rival.medalla}*!\n`
            }

            // Lógica de Subida de Nivel
            let expNext = p.nivel * 100 
            if (p.exp >= expNext) {
                p.nivel++
                p.exp = 0
                p.hpMax += 20
                p.hp = p.hpMax
                log += `🎊 ¡NIVEL UP! Tu Pokémon ahora es Nivel ${p.nivel}\n`
                
                // Revisar Evolución
                if (pokeData.evolucion && p.nivel >= pokeData.evolucion.nivel) {
                    let evoId = pokeData.evolucion.id
                    p.id = evoId
                    p.nombre = pokedex[evoId].nombre
                    log += `🌟 ¡INCREMENTÍBLE! Está evolucionando en un *${p.nombre}*\n`
                }
            }
        } else if (p.hp <= 0) {
            p.hp = 0
            log += `💀 *DERROTA...* Tu Pokémon ha caído. Debes ir al Centro Pokémon.`
        } else {
            log += `❤️ HP Restante: ${p.hp}/${p.hpMax}\n`
            log += `💡 _Escribe el comando de nuevo para seguir atacando._`
        }

        return m.reply(log)
    }

    // INTERFAZ DE SELECCIÓN (Si solo puso .p battle)
    let interfaz = `⚔️ *ESTÁS FRENTE A ${rival.nombre.toUpperCase()}*\n`
    interfaz += `🔴 Rival: ${pRivalData.nombre} (Nv. ${rival.nivel})\n`
    interfaz += `🔵 Tu Pokémon: ${p.nombre} (Nv. ${p.nivel})\n`
    interfaz += `❤️ Tu HP: ${p.hp}/${p.hpMax}\n`
    interfaz += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`
    interfaz += `✨ *ELIGE UN MOVIMIENTO:*\n`
    
    misMovimientos.forEach((m, i) => {
        interfaz += `${i + 1}. ${m.nombre} [${m.tipo}] (Poder: ${m.daño})\n`
    })

    interfaz += `\nUsa: *${usedPrefix + command} [número]*`
    await conn.reply(m.chat, interfaz, m)
}

handler.command = /^(p|pokemon)battle|pelear$/i
export default handler
