import fs from 'fs'
import { PokemonLogic } from '../lib/poke/logic.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon
    if (!p?.registrado) return
    if (p.hp <= 0) return m.reply('🚑 Tu Pokémon está debilitado. ¡Cúralo!')

    const pokedex = JSON.parse(fs.readFileSync('./lib/poke/pokedex.json'))
    const trainers = JSON.parse(fs.readFileSync('./lib/poke/trainers.json'))
    const pokeData = pokedex[p.id]
    let moves = pokeData.movimientos.filter(mv => mv.nivel <= p.nivel)

    if (text && !isNaN(text)) {
        let idx = parseInt(text) - 1
        if (!moves[idx]) return m.reply('❌ Movimiento inválido.')
        
        let move = moves[idx]
        let rival = trainers.entrenadores_ruta[0] // Ejemplo
        let pRival = pokedex[rival.equipo[0]]
        
        let damage = PokemonLogic.calculateDamage(p, pRival, move)
        let recDamage = Math.floor(rival.nivel * 1.5)

        p.hp -= recDamage
        let res = `⚔️ *${p.nombre}* usó *${move.nombre.toUpperCase()}*\n`
        res += `${damage.textMod}\n💥 Daño: ${damage.total}\n💢 Recibiste: ${recDamage}\n`
        res += `❤️ HP: ${Math.max(0, p.hp)}`
        
        p.hp = Math.max(0, p.hp)
        return m.reply(res)
    }

    let menu = `⚔️ *COMBATE EN ${p.ubicacion}*\n`
    moves.forEach((m, i) => menu += `${i+1}. ${m.nombre} [${m.tipo}]\n`)
    m.reply(menu + `\nUsa: ${usedPrefix}${command} [número]`)
}
handler.command = /^(pbattle|pelear)$/i
export default handler
