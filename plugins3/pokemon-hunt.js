import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon
    const pokedex = JSON.parse(fs.readFileSync('./lib/poke/pokedex.json'))
    const mapa = JSON.parse(fs.readFileSync('./lib/poke/mapa.json'))
    
    let zona = mapa[p.ubicacion]
    if (!zona.spawn) return m.reply('🏙️ Aquí no hay Pokémon salvajes.')

    // Generar encuentro si no hay uno activo
    let idSalvaje = zona.spawn[Math.floor(Math.random() * zona.spawn.length)]
    let pS = pokedex[idSalvaje]
    let lvlS = Math.floor(Math.random() * 5) + zona.rango_nivel[0]

    if (text) {
        let accion = text.toLowerCase().trim()

        if (accion === 'capturar') {
            if (!p.mochila.pokebola || p.mochila.pokebola <= 0) return m.reply('❌ No tienes Poké Balls.')
            p.mochila.pokebola--
            if (Math.random() > 0.5) {
                p.almacen.push({ id: idSalvaje, nombre: pS.nombre, nivel: lvlS, hp: 100, hpMax: 100, tipos: pS.tipos })
                return m.reply(`🎊 ¡Atrapaste a *${pS.nombre}*! Se envió al PC.`)
            } else {
                return m.reply(`☁️ ¡Se escapó de la bola! Intenta de nuevo.`)
            }
        }

        if (accion === 'huir') {
            return m.reply(`💨 Escapaste sin problemas del *${pS.nombre}* salvaje.`)
        }
    }

    let interfaz = `🌿 *POKÉMON SALVAJE APARECIÓ*\n\n`
    interfaz += `👾 *${pS.nombre}* (Nv. ${lvlS})\n`
    interfaz += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`
    interfaz += `✨ *ACCIONES:*\n`
    interfaz += `⚔️ Atacar (Usa el comando .p battle)\n`
    interfaz += `🎒 *Capturar* (Usa una Poké Ball)\n`
    interfaz += `🏃 *Huir* (Escapar del encuentro)\n\n`
    interfaz += `💡 Escribe: *${usedPrefix + command} capturar* o *huir*`

    await conn.reply(m.chat, interfaz, m)
}

handler.command = /^(p|pokemon)hunt|cazar$/i
export default handler
