import { PokemonLogic } from '../lib/poke/logic.js'

let handler = async (m, { conn, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    if (!user.pokemon?.registrado) return m.reply('❌ No has iniciado tu aventura.')

    let p = user.pokemon
    // Corregido: p ya es el pokémon líder según tu estructura
    
    let expNext = PokemonLogic.getExpRequired(p.nivel)
    let expBar = '▓'.repeat(Math.floor((p.exp / expNext) * 10)) + '░'.repeat(10 - Math.floor((p.exp / expNext) * 10))

    let caption = `📑 *INFO ENTRENADOR*\n`
    caption += `👤 *Nombre:* ${p.nombreEntrenador}\n`
    caption += `📍 *Ubicación:* ${p.ubicacion}\n`
    caption += `💰 *Dinero:* $${p.dinero}\n\n`
    caption += `⭐ *Compañero:* ${p.nombre} (Nv. ${p.nivel})\n`
    caption += `❤️ *HP:* ${p.hp}/${p.hpMax}\n`
    caption += `💠 *XP:* ${p.exp}/${expNext}\n${expBar}`

    m.reply(caption)
}
handler.command = ['pinfo', 'pokemon-info']
export default handler
