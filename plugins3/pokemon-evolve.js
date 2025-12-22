import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon
    if (!p?.registrado) return m.reply('❌ No has iniciado tu aventura.')

    const pokedex = JSON.parse(fs.readFileSync('./lib/poke/pokedex.json'))
    const itemsData = JSON.parse(fs.readFileSync('./lib/poke/items.json'))

    // Lógica de ejecución de evolución
    if (text) {
        let [index, metodo] = text.split(' ')
        let idx = parseInt(index) - 1
        let poke = p.equipo[idx]
        
        if (!poke) return m.reply('❌ No tienes ese Pokémon en tu equipo.')
        
        let pData = pokedex[poke.id]
        if (!pData.evolucion) return m.reply(`❌ ${poke.nombre} no tiene evoluciones registradas.`)

        let evoInfo = pData.evolucion
        let puedeEvolucionar = false
        let mensajeError = ""

        // Caso 1: Evolución por Nivel
        if (evoInfo.nivel && !metodo) {
            if (poke.nivel >= evoInfo.nivel) {
                puedeEvolucionar = true
            } else {
                mensajeError = `❌ ${poke.nombre} necesita nivel ${evoInfo.nivel} para evolucionar (Actual: ${poke.nivel}).`
            }
        }

        // Caso 2: Evolución por Piedra
        if (evoInfo.item && metodo) {
            let itemReq = evoInfo.item.toLowerCase().replace(/ /g, '_')
            if (p.mochila[itemReq] > 0) {
                p.mochila[itemReq]--
                puedeEvolucionar = true
            } else {
                mensajeError = `❌ No tienes la *${evoInfo.item}* necesaria.`
            }
        }

        if (puedeEvolucionar) {
            let evoData = pokedex[evoInfo.id]
            let viejoNombre = poke.nombre
            
            // Actualizar datos del Pokémon conservando nivel y experiencia
            poke.id = evoInfo.id
            poke.nombre = evoData.nombre
            poke.tipos = evoData.tipos
            
            // Aumento de stats por evolución
            poke.hpMax += 20
            poke.hp = poke.hpMax
            if (poke.stats) {
                poke.stats.ataque += 10
                poke.stats.defensa += 10
            }

            return m.reply(`✨ ¡Increíble! Tu *${viejoNombre}* ha evolucionado en un flamante *${poke.nombre}*! ✨`)
        } else {
            return m.reply(mensajeError || "❌ No se cumplen los requisitos de evolución.")
        }
    }

    // Interfaz de Lista: Escanear equipo en busca de candidatos
    let sections = []
    let candidatos = { title: "CANDIDATOS A EVOLUCIONAR", rows: [] }

    p.equipo.forEach((pk, i) => {
        let data = pokedex[pk.id]
        if (data.evolucion) {
            let req = data.evolucion.nivel ? `Nivel ${data.evolucion.nivel}` : `Usar ${data.evolucion.item}`
            candidatos.rows.push({
                title: `${pk.nombre} (Nv. ${pk.nivel})`,
                rowId: `${usedPrefix + command} ${i + 1}`,
                description: `Evoluciona a: ${pokedex[data.evolucion.id].nombre} | Requisito: ${req}`
            })
        }
    })

    if (candidatos.rows.length === 0) {
        return m.reply("📋 Ningún Pokémon de tu equipo puede evolucionar en este momento.")
    }

    return conn.sendList(m.chat, "🧬 LABORATORIO DE EVOLUCIÓN", "Selecciona un Pokémon para evolucionarlo si cumple los requisitos:", "Ver Evoluciones", [candidatos], m)
}

handler.command = ['evolve', 'evolucionar', 'p evo']
export default handler
