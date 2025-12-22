import fs from 'fs'

let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon
    if (!p?.registrado) return
    if (p.hp <= 0) return m.reply('🚑 Tu Pokémon líder no puede luchar. Cúralo antes de ir a la hierba alta.')

    const pokedex = JSON.parse(fs.readFileSync('./lib/poke/pokedex.json'))
    const mapa = JSON.parse(fs.readFileSync('./lib/poke/mapa.json'))
    
    let zona = mapa[p.ubicacion]
    if (!zona.spawn || zona.spawn.length === 0) {
        return m.reply('🏙️ No parece haber Pokémon salvajes en esta ciudad.')
    }

    // 1. Aparece un Pokémon aleatorio de la zona
    let idSalvaje = zona.spawn[Math.floor(Math.random() * zona.spawn.length)]
    let pSalvaje = pokedex[idSalvaje]
    let nivelSalvaje = Math.floor(Math.random() * (zona.rango_nivel[1] - zona.rango_nivel[0] + 1)) + zona.rango_nivel[0]

    let msg = `🌿 ¡Un *${pSalvaje.nombre}* salvaje (Nv. ${nivelSalvaje}) ha aparecido!\n\n`

    // 2. Intentar captura (Probabilidad base 50% si no tienes Poke Balls es 0)
    if (!p.mochila.pokebola || p.mochila.pokebola <= 0) {
        return m.reply(msg + `❌ ¡No tienes Poké Balls para intentar capturarlo!`)
    }

    p.mochila.pokebola--
    let exito = Math.random() < 0.5 // 50% de éxito

    if (exito) {
        let nuevoPk = {
            id: idSalvaje,
            nombre: pSalvaje.nombre,
            nivel: nivelSalvaje,
            hp: 100, // Se calcula real al sacar del PC
            hpMax: 100,
            exp: 0,
            emocion: 100,
            tipos: pSalvaje.tipos
        }

        p.almacen.push(nuevoPk)
        msg += `✨ ¡Te pones en posición y lanzas la Poké Ball...!\n`
        msg += `🎊 ¡CONSEGUIDO! *${pSalvaje.nombre}* ha sido enviado a tu PC.`
    } else {
        msg += `☁️ ¡La Poké Ball se rompió! El *${pSalvaje.nombre}* huyó despavorido...`
    }

    await conn.reply(m.chat, msg, m)
}

handler.command = /^(p|pokemon)hunt|cazar|buscar$/i
export default handler
