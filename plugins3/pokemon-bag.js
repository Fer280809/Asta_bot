import { PokemonLogic } from '../../lib/poke/logic.js'

let handler = async (m, { conn, text, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon
    if (!p?.registrado) return m.reply('❌ No has iniciado tu aventura.')

    // Lógica de uso de objetos
    if (text) {
        let item = text.toLowerCase().trim()
        let miPkm = p.equipo[0]

        if (item === 'pocion') {
            if (p.inventario.pocion <= 0) return m.reply('❌ No tienes Pociones.')
            miPkm.hp = Math.min(miPkm.hpMax, miPkm.hp + 20)
            p.inventario.pocion--
            return m.reply(`🧪 Usaste una Poción en *${miPkm.nombre}*. Ahora tiene ${miPkm.hp} HP.`)
        }

        if (item === 'pokeball') {
            if (!p.combate) return m.reply('❌ Solo puedes lanzar Pokéballs en combate.')
            if (p.inventario.pokeball <= 0) return m.reply('❌ No tienes Pokéballs.')
            
            p.inventario.pokeball--
            let enemigo = p.combate
            let hpPercent = (enemigo.hp / enemigo.hpMax) * 100
            let atrapado = PokemonLogic.isCaught(80, hpPercent, 1) // 80 es ratio base

            if (atrapado) {
                let nuevoPkm = {
                    id: enemigo.id,
                    nombre: enemigo.nombre,
                    nivel: enemigo.nivel,
                    exp: 0,
                    hp: enemigo.hpMax,
                    hpMax: enemigo.hpMax,
                    stats: enemigo.stats,
                    tipos: enemigo.tipos,
                    movimientos: ["Placaje"] // En la beta empiezan con básico
                }
                p.equipo.length < 6 ? p.equipo.push(nuevoPkm) : p.pc.push(nuevoPkm)
                delete p.combate
                return m.reply(`✨ ¡Increíble! Has atrapado a *${enemigo.nombre}*!`)
            } else {
                return m.reply(`¡Oh no! El *${enemigo.nombre}* se ha escapado de la bola.`)
            }
        }
    }

    const sections = [{
        title: "TUS OBJETOS",
        rows: [
            { title: "Pocion", rowId: `${usedPrefix}p bag pocion`, description: `Tienes: ${p.inventario.pocion} (Cura 20 HP)` },
            { title: "Pokeball", rowId: `${usedPrefix}p bag pokeball`, description: `Tienes: ${p.inventario.pokeball} (Atrapa Pokémon)` }
        ]
    }]
    await conn.sendList(m.chat, "🎒 MOCHILA", "Selecciona un objeto para usar:", "Ver Mochila", sections, m)
}
handler.command = /^p\s?bag$/i
export default handler
