import fs from 'fs'
import { PokemonLogic } from '../lib/poke/logic.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon
    if (!p.combate) return m.reply('❌ No hay ningún combate activo.')

    const movesData = JSON.parse(fs.readFileSync('./lib/poke/moves.json'))
    const pokedex = JSON.parse(fs.readFileSync('./lib/poke/pokedex.json'))
    
    let miPoke = p.equipo[0] // El primero del equipo pelea
    let rival = p.combate

    if (text) {
        let moveKey = text.trim()
        let move = movesData[moveKey]
        
        if (move) {
            // Turno Jugador
            let dmg = PokemonLogic.calculateDamage(miPoke, rival, { ...move, nombre: moveKey })
            rival.hp -= dmg.total
            let res = `⚔️ *${miPoke.nombre}* usó *${moveKey}* e hizo *${dmg.total}* de daño.`
            
            if (rival.hp <= 0) {
                delete p.combate
                p.dinero += 100
                return m.reply(`${res}\n\n🏆 ¡Ganaste! Recibes $100.`)
            }

            // Turno Rival (IA simple con el primer movimiento de su pokedex)
            let rivalData = pokedex[rival.id]
            let moveRivalName = rivalData.movimientos[0].nombre
            let moveRival = movesData[moveRivalName]
            let dmgR = PokemonLogic.calculateDamage(rival, miPoke, { ...moveRival, nombre: moveRivalName })
            miPoke.hp -= dmgR.total
            res += `\n\n💢 *${rival.nombre}* respondió con *${moveRivalName}* e hizo *${dmgR.total}* de daño.`

            if (miPoke.hp <= 0) {
                miPoke.hp = 0
                delete p.combate
                return m.reply(`${res}\n\n😵 Tu Pokémon se ha debilitado.`)
            }
            m.reply(res)
        }
    }

    // Mostrar menú de ataques
    let miPokedexData = pokedex[miPoke.id]
    let status = `🔴 *${rival.nombre}* Nv.${rival.nivel} | HP: ${rival.hp}/${rival.hpMax}\n`
    status += `🔵 *${miPoke.nombre}* Nv.${miPoke.nivel} | HP: ${miPoke.hp}/${miPoke.hpMax}`

    let rows = miPokedexData.movimientos.map(mv => ({
        title: mv.nombre,
        rowId: `${usedPrefix + command} ${mv.nombre}`,
        description: `Tipo: ${mv.tipo} | Daño Base: ${mv.daño || 40}`
    }))

    return conn.sendList(m.chat, "⚔️ COMBATE", status, "Atacar", [{ title: "ATAQUES", rows }], m)
}
handler.command = ['battle', 'luchar']
export default handler
