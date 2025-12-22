import fs from 'fs'
import { PokemonLogic } from '../lib/poke/logic.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon
    if (!p?.registrado) return m.reply('❌ No tienes una partida activa.')
    if (p.hp <= 0) return m.reply('🚑 Tu Pokémon está debilitado. ¡Ve al Centro Pokémon!')

    const pokedex = JSON.parse(fs.readFileSync('./lib/poke/pokedex.json'))
    const trainers = JSON.parse(fs.readFileSync('./lib/poke/trainers.json'))
    const pokeData = pokedex[p.id]
    
    // 1. Definir rival (Líder o Entrenador de ruta)
    let rival = trainers.lideres[p.ubicacion] || trainers.entrenadores_ruta[0]
    let pRivalData = pokedex[rival.equipo[0]]
    let misMovimientos = pokeData.movimientos.filter(mov => mov.nivel <= p.nivel)

    // 2. PROCESAR ACCIÓN DEL USUARIO
    if (text) {
        let accion = text.toLowerCase().trim()

        // ACCIÓN: ATACAR
        if (!isNaN(accion)) {
            let idx = parseInt(accion) - 1
            if (!misMovimientos[idx]) return m.reply('❌ Ese ataque no existe.')
            
            let move = misMovimientos[idx]
            let dmgInfo = PokemonLogic.calculateDamage(p, pRivalData, move)
            let dmgRival = Math.floor((rival.nivel * 2) + 5) // Daño del NPC

            p.hp -= dmgRival
            let log = `⚔️ *TURNO DE COMBATE*\n\n`
            log += `🌟 *${p.nombre}* usó *${move.nombre.toUpperCase()}*\n`
            log += `${dmgInfo.textMod} (Daño: ${dmgInfo.total})\n`
            log += `💢 *${pRivalData.nombre}* respondió con ${dmgRival} de daño.\n`
            log += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`
            log += `❤️ Tu HP: ${Math.max(0, p.hp)}/${p.hpMax}`
            
            p.hp = Math.max(0, p.hp)
            return m.reply(log)
        }

        // ACCIÓN: MOCHILA (En combate)
        if (accion === 'mochila') {
            let items = Object.entries(p.mochila).filter(([_, cant]) => cant > 0)
            let txt = `🎒 *MOCHILA EN COMBATE*\n\n`
            items.forEach(([nom, cant], i) => txt += `${i+1}. ${nom} (x${cant})\n`)
            txt += `\n💡 Usa: *${usedPrefix}pbag use [nombre]*`
            return m.reply(txt)
        }

        // ACCIÓN: HUIR
        if (accion === 'huir') {
            return m.reply(`🚫 ¡No puedes huir de una batalla contra un entrenador!`)
        }
    }

    // 3. INTERFAZ INICIAL DE COMBATE
    let interfaz = `⚔️ *COMBATE CONTRA ${rival.nombre.toUpperCase()}*\n`
    interfaz += `🔴 Rival: ${pRivalData.nombre} (Nv. ${rival.nivel})\n`
    interfaz += `🔵 Tu Pokémon: ${p.nombre} (Nv. ${p.nivel})\n`
    interfaz += `❤️ Tu HP: ${p.hp}/${p.hpMax}\n`
    interfaz += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`
    interfaz += `✨ *ELIGE UNA ACCIÓN:*\n\n`
    
    misMovimientos.forEach((m, i) => {
        interfaz += `🔹 [${i + 1}] ${m.nombre} (${m.tipo})\n`
    })
    
    interfaz += `\n🎒 Escribe *mochila* para usar un objeto.`
    interfaz += `\n🏃 Escribe *huir* para intentar escapar.`
    interfaz += `\n\n💡 _Responde con el número del ataque o la palabra de la acción._`

    await conn.reply(m.chat, interfaz, m)
}

handler.command = /^(p|pokemon)battle|pelear$/i
export default handler
