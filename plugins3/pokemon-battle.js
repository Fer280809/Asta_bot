import fs from 'fs'
import { PokemonLogic } from '../lib/poke/logic.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon

    // 1. Validaciones de estado
    if (!p?.registrado) return m.reply(`❌ No tienes una partida activa. Usa *${usedPrefix}p start*`)
    if (p.hp <= 0) return m.reply(`🚑 Tu Pokémon líder (${p.nombre}) no tiene energía. Usa *.p heal* en un Centro Pokémon.`)

    const pokedex = JSON.parse(fs.readFileSync('./lib/poke/pokedex.json'))
    const trainers = JSON.parse(fs.readFileSync('./lib/poke/trainers.json'))
    const pokeData = pokedex[p.id]

    // 2. Determinar el Rival (Líder de la zona o Entrenador aleatorio)
    let rival, esLider = false
    let liderZona = trainers.lideres[p.ubicacion]

    if (text?.toLowerCase() === 'lider' && liderZona) {
        rival = liderZona
        esLider = true
    } else {
        // Entrenadores de la ruta actual
        let posibles = trainers.entrenadores_ruta.filter(t => t.zona === p.ubicacion)
        rival = posibles.length > 0 
            ? posibles[Math.floor(Math.random() * posibles.length)] 
            : trainers.entrenadores_ruta[0] // Default si no hay en la zona
    }

    let idRival = rival.equipo[0]
    let pRivalData = pokedex[idRival]
    let misMovimientos = pokeData.movimientos.filter(mov => mov.nivel <= p.nivel)

    // 3. PROCESAR ACCIÓN SELECCIONADA
    if (text && !isNaN(text)) {
        let index = parseInt(text) - 1
        if (!misMovimientos[index]) return m.reply('❌ Selecciona un número válido de la lista de ataques.')
        
        let move = misMovimientos[index]
        
        // --- TURNO DEL JUGADOR ---
        let dmgInfo = PokemonLogic.calculateDamage(p, pRivalData, move)
        let hpRivalEstimado = (rival.nivel * 8) + 40 // Vida base del NPC
        
        // --- TURNO DEL RIVAL ---
        // El rival usa un ataque básico pero con ventaja si es líder
        let poderRival = esLider ? 2.5 : 1.8
        let dmgRecibido = Math.floor((rival.nivel * poderRival) + (Math.random() * 10))
        
        // Aplicar resultados
        p.hp -= dmgRecibido
        let log = `⚔️ *TURNO: ${p.nombre.toUpperCase()} VS ${rival.nombre.toUpperCase()}*\n`
        log += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`
        log += `🌟 *${p.nombre}* usó *${move.nombre.toUpperCase()}*\n`
        if (dmgInfo.isCrit) log += `🎯 ¡GOLPE CRÍTICO!\n`
        log += `${dmgInfo.textMod}\n`
        log += `💥 Daño causado: ${dmgInfo.total}\n`
        log += `💢 Daño recibido: ${dmgRecibido}\n`
        log += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`

        // REVISAR RESULTADO DE LA BATALLA
        if (dmgInfo.total >= hpRivalEstimado || Math.random() < 0.2) { // Simulación de victoria
            let expGanada = PokemonLogic.calculateExpGanada(rival.nivel, esLider, p.emocion)
            let plata = esLider ? rival.premio : (rival.nivel * 45)
            
            p.exp += expGanada
            p.dinero += plata
            log += `✨ *¡HAS GANADO LA BATALLA!* ✨\n`
            log += `💰 Recompensa: $${plata}\n`
            log += `📈 Experiencia: +${expGanada}\n`

            if (esLider && !p.medallas.includes(rival.medalla)) {
                p.medallas.push(rival.medalla)
                log += `🏆 ¡Increíble! Has obtenido la *${rival.medalla}*!\n`
            }

            // Lógica de Nivel y Evolución
            if (p.exp >= (p.nivel * 100)) {
                p.nivel++
                p.exp = 0
                p.hpMax += 15
                p.hp = p.hpMax
                log += `🎊 ¡NIVEL UP! Ahora eres Nivel ${p.nivel}\n`
                
                if (pokeData.evolucion && p.nivel >= pokeData.evolucion.nivel) {
                    let evo = pokedex[pokeData.evolucion.id]
                    p.id = pokeData.evolucion.id
                    p.nombre = evo.nombre
                    p.tipos = evo.tipos
                    log += `🌟 ¡TU POKÉMON ESTÁ EVOLUCIONANDO EN ${evo.nombre.toUpperCase()}!\n`
                }
            }
        } else if (p.hp <= 0) {
            p.hp = 0
            log += `💀 *TU POKÉMON HA CAÍDO...*\nHas perdido el combate y parte de tu dinero.`
            p.dinero = Math.floor(p.dinero * 0.9)
        } else {
            log += `❤️ HP Restante: ${p.hp}/${p.hpMax}\n`
            log += `\n🔄 _Responde con el número para atacar de nuevo._`
        }

        return m.reply(log)
    }

    // 4. INTERFAZ DE COMANDOS (Menú Inicial)
    let interfaz = `⚔️ *DESAFÍO EN ${p.ubicacion.toUpperCase()}*\n`
    interfaz += `👤 *Rival:* ${rival.nombre} (${esLider ? 'LÍDER' : 'ENTRENADOR'})\n`
    interfaz += `👾 *Pokémon:* ${pRivalData.nombre} (Nv. ${rival.nivel})\n`
    interfaz += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`
    interfaz += `✨ *TUS MOVIMIENTOS:*\n`
    
    misMovimientos.forEach((m, i) => {
        interfaz += `${i + 1}. ${m.nombre} [${m.tipo}] (Poder: ${m.daño})\n`
    })

    interfaz += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`
    interfaz += `🎒 Escribe *mochila* para usar un objeto.\n`
    interfaz += `🏃 Escribe *huir* para escapar (No líderes).\n\n`
    interfaz += `💡 _Escribe el número del ataque para comenzar._`

    if (text?.toLowerCase() === 'huir' && !esLider) {
        return m.reply(`🏃💨 Has escapado de la batalla contra ${rival.nombre}.`)
    } else if (text?.toLowerCase() === 'huir' && esLider) {
        return m.reply(`🚫 ¡No puedes huir de un combate oficial contra un Líder!`)
    }

    await conn.reply(m.chat, interfaz, m)
}

handler.command = /^(p|pokemon)battle|pelear|luchar$/i
export default handler
