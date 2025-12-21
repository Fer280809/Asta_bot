import { PokemonLogic } from '../../lib/poke/logic.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    if (!user.pokemon?.registrado) return m.reply('❌ No has iniciado tu aventura.')

    // 1. Si no hay un combate activo, creamos uno nuevo (esto viene de .p hunt)
    if (!user.pokemon.combate) {
        let loc = PokemonLogic.getMap(user.pokemon.ubicacion)
        if (loc.tipo !== 'hierba') return m.reply('❌ No hay nada contra qué pelear aquí.')
        
        // Generamos el rival basado en la zona
        let randomId = loc.spawn[Math.floor(Math.random() * loc.spawn.length)]
        let pkmBase = PokemonLogic.getPokemon(randomId)
        let nivel = Math.floor(Math.random() * (loc.niveles[1] - loc.niveles[0] + 1)) + loc.niveles[0]
        
        // Guardamos el estado del enemigo en el usuario
        user.pokemon.combate = {
            activo: true,
            id: randomId,
            nombre: pkmBase.nombre,
            nivel: nivel,
            hpMax: pkmBase.statsBase.hp + (nivel * 2),
            hp: pkmBase.statsBase.hp + (nivel * 2),
            tipos: pkmBase.tipos,
            stats: { 
                ataque: pkmBase.statsBase.ataque + (nivel * 1),
                defensa: pkmBase.statsBase.defensa + (nivel * 1)
            }
        }
    }

    let enemigo = user.pokemon.combate
    let miPkm = user.pokemon.equipo[0]

    // 2. Lógica de Ataque (si el usuario eligió un movimiento)
    if (text) {
        let moveName = text.trim()
        let result = PokemonLogic.calculateDamage(miPkm, enemigo, moveName)
        
        enemigo.hp -= result.damage
        if (enemigo.hp < 0) enemigo.hp = 0

        let log = `⚔️ *${miPkm.nombre}* usó *${moveName}*!\n`
        log += `💥 Daño: ${result.damage}\n`
        if (result.message) log += `✨ ${result.message}\n`

        // ¿Murió el salvaje?
        if (enemigo.hp <= 0) {
            let expGanada = Math.floor((enemigo.nivel * 20) / 1.5)
            miPkm.exp += expGanada
            let subio = PokemonLogic.checkLevelUp(miPkm)
            
            delete user.pokemon.combate // Limpiar combate
            
            let winMsg = `${log}\n💀 *${enemigo.nombre}* se ha debilitado!\n`
            winMsg += `📈 Ganaste ${expGanada} XP.`
            if (subio) winMsg += `\n🎊 ¡TU POKÉMON SUBIÓ AL NIVEL ${miPkm.nivel}!`
            
            return m.reply(winMsg)
        }

        // 3. Contraataque del enemigo (IA simple)
        let pkmEnemigoData = PokemonLogic.getPokemon(enemigo.id)
        let movesEnemigo = pkmEnemigoData.movimientos["1"] // Por ahora usan ataques de nivel 1
        let moveEnemigo = movesEnemigo[Math.floor(Math.random() * movesEnemigo.length)]
        
        let resultRival = PokemonLogic.calculateDamage(enemigo, miPkm, moveEnemigo)
        miPkm.hp -= resultRival.damage
        if (miPkm.hp < 0) miPkm.hp = 0

        log += `\n💢 *${enemigo.nombre}* salvaje usó *${moveEnemigo}*!\n`
        log += `💔 Recibiste ${resultRival.damage} de daño.\n`

        // ¿Murió tu pokémon?
        if (miPkm.hp <= 0) {
            delete user.pokemon.combate
            return m.reply(`${log}\n😵 Tu Pokémon se ha debilitado... Fuiste teletransportado al Centro Pokémon.`)
        }

        // Mostrar estado actual tras el intercambio
        let status = `${log}\n*ESTADO:*`
        status += `\nTu ${miPkm.nombre}: ${miPkm.hp}/${miPkm.hpMax} HP`
        status += `\n${enemigo.nombre} salvaje: ${enemigo.hp}/${enemigo.hpMax} HP`
        
        const sections = [{
            title: "CONTINUAR LUCHA",
            rows: miPkm.movimientos.map(m => ({ title: m, rowId: `${usedPrefix + command} ${m}` }))
        }]
        return conn.sendList(m.chat, "⚔️ EN COMBATE", status, "Atacar", sections, m)
    }

    // 4. Menú inicial de ataques
    let statusInicial = `*${enemigo.nombre}* Salvaje (Nv. ${enemigo.nivel})\n❤️ HP: ${enemigo.hp}/${enemigo.hpMax}\n\n`
    statusInicial += `Tu *${miPkm.nombre}* (Nv. ${miPkm.nivel})\n❤️ HP: ${miPkm.hp}/${miPkm.hpMax}`

    const sections = [{
        title: "TUS ATAQUES",
        rows: miPkm.movimientos.map(m => ({ title: m, rowId: `${usedPrefix + command} ${m}` }))
    }]

    await conn.sendList(m.chat, "⚔️ COMBATE POKÉMON", statusInicial, "Seleccionar Ataque", sections, m)
}

handler.command = /^p\s?fight$/i
export default handler
