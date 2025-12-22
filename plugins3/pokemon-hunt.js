import fs from 'fs'
import { PokemonLogic } from '../lib/poke/logic.js'

let handler = async (m, { conn, usedPrefix, command, text }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon
    if (!p?.registrado) return m.reply('❌ No has iniciado tu aventura.')

    const pokedex = JSON.parse(fs.readFileSync('./lib/poke/pokedex.json'))
    const mapa = JSON.parse(fs.readFileSync('./lib/poke/mapa.json'))
    const items = JSON.parse(fs.readFileSync('./lib/poke/items.json'))

    let zona = mapa[p.ubicacion]
    if (zona.tipo !== 'hierba') return m.reply('🌿 Aquí no hay hierba alta para buscar Pokémon.')

    // Lógica de captura si el usuario envió una ball
    if (text && p.combate) {
        let ballId = text.toLowerCase().trim()
        if (!p.mochila[ballId]) return m.reply('🚫 No tienes esa Pokéball.')

        let enemigo = p.combate
        let ratio = items.balls[ballId].ratio
        let chance = (enemigo.hpMax - enemigo.hp) / enemigo.hpMax * ratio * 100

        if (Math.random() * 100 < chance || ballId === 'masterball') {
            let nuevoPoke = { ...enemigo }
            delete nuevoPoke.hpMax // Limpiamos datos de combate
            
            if (p.equipo.length < 6) {
                p.equipo.push(nuevoPoke)
                m.reply(`✅ ¡Atrapado! *${nuevoPoke.nombre}* se unió a tu equipo.`)
            } else {
                p.almacen.push(nuevoPoke)
                m.reply(`📦 ¡Atrapado! Tu equipo está lleno, *${nuevoPoke.nombre}* fue enviado al Almacén.`)
            }
            delete p.combate
            return
        } else {
            p.mochila[ballId]--
            return m.reply('💢 ¡Se escapó de la bola! Sigue intentándolo.')
        }
    }

    // Generar encuentro salvaje
    let spawnList = zona.spawn
    let idEnemigo = spawnList[Math.floor(Math.random() * spawnList.length)]
    let pData = pokedex[idEnemigo]
    let nivel = Math.floor(Math.random() * (zona.niveles[1] - zona.niveles[0] + 1)) + zona.niveles[0]

    p.combate = {
        id: idEnemigo,
        nombre: pData.nombre,
        nivel: nivel,
        hp: pData.statsBase.hp + (nivel * 2),
        hpMax: pData.statsBase.hp + (nivel * 2),
        tipos: pData.tipos,
        stats: pData.statsBase
    }

    let msg = `🌿 ¡Un *${pData.nombre}* salvaje (Nivel ${nivel}) ha aparecido!\n\n`
    msg += `Selecciona una Pokéball de tu mochila para intentar capturarlo o usa *.p battle* para luchar.`
    
    // Lista de balls disponibles
    let rows = []
    for (let b in p.mochila) {
        if (items.balls[b] && p.mochila[b] > 0) {
            rows.push({ title: `Lanzar ${items.balls[b].nombre}`, rowId: `${usedPrefix + command} ${b}`, description: `Tienes: ${p.mochila[b]}` })
        }
    }

    if (rows.length === 0) return m.reply(msg + '\n\n⚠️ No tienes Pokéballs.')
    return conn.sendList(m.chat, "🐾 ENCUENTRO SALVAJE", msg, "Lanzar Ball", [{ title: "MOCHILA", rows }], m)
}
handler.command = ['hunt', 'cazar']
export default handler
