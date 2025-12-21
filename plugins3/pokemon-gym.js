import { PokemonLogic } from '../../lib/poke/logic.js'

let handler = async (m, { conn, usedPrefix, command, text }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon
    if (!p?.registrado) return m.reply('❌ No has iniciado tu aventura.')

    let loc = PokemonLogic.getMap(p.ubicacion)
    
    // 1. Verificar si hay un líder en esta ciudad
    const gymLeader = loc.npc?.find(n => n.includes("Brock") || n.includes("Misty"))
    if (!loc.puntos_interes?.some(pi => pi.includes("Gimnasio"))) {
        return m.reply(`🏟️ No hay un Gimnasio oficial en *${p.ubicacion}*.`)
    }

    // Definición de los Líderes (Equipos de la Beta)
    const leaders = {
        "Brock": {
            id: "Brock",
            medalla: "Roca",
            recompensa: 1000,
            equipo: [
                { id: 74, nombre: "Geodude", nivel: 12, hpMax: 40, hp: 40, tipos: ["Roca", "Tierra"], stats: { ataque: 25, defensa: 35 }, movimientos: ["Placaje", "Lanzarrocas"] },
                { id: 95, nombre: "Onix", nivel: 14, hpMax: 55, hp: 55, tipos: ["Roca", "Tierra"], stats: { ataque: 30, defensa: 50 }, movimientos: ["Lanzarrocas", "Placaje"] }
            ]
        },
        "Misty": {
            id: "Misty",
            medalla: "Cascada",
            recompensa: 2000,
            equipo: [
                { id: 120, nombre: "Staryu", nivel: 18, hpMax: 50, hp: 50, tipos: ["Agua"], stats: { ataque: 35, defensa: 35 }, movimientos: ["Pistola Agua", "Burbuja"] },
                { id: 121, nombre: "Starmie", nivel: 21, hpMax: 70, hp: 70, tipos: ["Agua", "Psíquico"], stats: { ataque: 50, defensa: 50 }, movimientos: ["Burbuja", "Confusión"] }
            ]
        }
    }

    const leaderName = gymLeader.split(' ')[0] // Tomar "Brock" o "Misty"
    const leaderData = leaders[leaderName]

    if (p.medallas.includes(leaderData.medalla)) {
        return m.reply(`🏆 Ya has derrotado a *${leaderName}* y posees la Medalla ${leaderData.medalla}.`)
    }

    // Iniciar combate especial de Gimnasio
    if (!p.combate_gym) {
        p.combate_gym = {
            activo: true,
            leader: leaderName,
            pokemonIndex: 0,
            enemigoActual: { ...leaderData.equipo[0] }
        }
    }

    let c = p.combate_gym
    let miPkm = p.equipo[0]
    let rival = c.enemigoActual

    // Lógica de ataque (Si el usuario envió el nombre de un ataque)
    if (text) {
        let result = PokemonLogic.calculateDamage(miPkm, rival, text.trim())
        rival.hp -= result.damage
        if (rival.hp < 0) rival.hp = 0

        let log = `⚔️ *${miPkm.nombre}* usó *${text}*!\n💥 Daño: ${result.damage}\n`

        if (rival.hp <= 0) {
            c.pokemonIndex++
            if (c.pokemonIndex >= leaderData.equipo.length) {
                // VICTORIA TOTAL
                p.medallas.push(leaderData.medalla)
                p.dinero += leaderData.recompensa
                delete p.combate_gym
                return m.reply(`🎊 ¡Increíble! Has derrotado a *${leaderName}*.\n🏆 Recibiste la *Medalla ${leaderData.medalla}* y $${leaderData.recompensa}.`)
            } else {
                // SIGUIENTE POKÉMON DEL LÍDER
                c.enemigoActual = { ...leaderData.equipo[c.pokemonIndex] }
                return m.reply(`${log}\n💀 *${rival.nombre}* cayó. ¡${leaderName} envía a *${c.enemigoActual.nombre}*!`)
            }
        }

        // Contraataque del Líder
        let moveRival = rival.movimientos[Math.floor(Math.random() * rival.movimientos.length)]
        let resRival = PokemonLogic.calculateDamage(rival, miPkm, moveRival)
        miPkm.hp -= resRival.damage
        if (miPkm.hp < 0) miPkm.hp = 0

        log += `\n💢 *${rival.nombre}* de ${leaderName} usó *${moveRival}*!\n💔 Daño: ${resRival.damage}`
        
        if (miPkm.hp <= 0) {
            delete p.combate_gym
            return m.reply(`${log}\n😵 Tu Pokémon se debilitó. Perdiste el desafío del Gimnasio.`)
        }

        const sections = [{
            title: "TUS MOVIMIENTOS",
            rows: miPkm.movimientos.map(m => ({ title: m, rowId: `${usedPrefix + command} ${m}` }))
        }]
        return conn.sendList(m.chat, `🏆 GYM: ${leaderName.toUpperCase()}`, `${log}\n\nHP Rival: ${rival.hp}/${rival.hpMax}\nTu HP: ${miPkm.hp}/${miPkm.hpMax}`, "Atacar", sections, m)
    }

    // Menú inicial del Gimnasio
    let msg = `🏟️ ¡Bienvenido al Gimnasio de *${p.ubicacion}*!\n👤 Líder: *${leaderName}*\n✨ Medalla en juego: *${leaderData.medalla}*\n\n¿Estás listo para el desafío?`
    const sections = [{
        title: "BATALLA",
        rows: miPkm.movimientos.map(m => ({ title: m, rowId: `${usedPrefix + command} ${m}` }))
    }]
    await conn.sendList(m.chat, "🏟️ DESAFÍO DE LÍDER", msg, "Empezar Batalla", sections, m)
}

handler.command = /^(p|pokemon)gym$/i
export default handler
