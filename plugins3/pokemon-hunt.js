import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon

    // 1. Validaciones previas
    if (!p?.registrado) return m.reply(`❌ No tienes una partida activa. Usa *${usedPrefix}p start*`)
    if (p.hp <= 0) return m.reply(`🚑 Tu Pokémon líder está debilitado. No puedes cazar en este estado. ¡Ve a un Centro Pokémon!`)

    const pokedex = JSON.parse(fs.readFileSync('./lib/poke/pokedex.json'))
    const mapa = JSON.parse(fs.readFileSync('./lib/poke/mapa.json'))
    
    let zona = mapa[p.ubicacion]

    // 2. Verificar si hay Pokémon en la zona
    if (!zona.spawn || zona.spawn.length === 0) {
        return m.reply(`🏙️ Estás en una zona urbana o segura. Aquí no aparecen Pokémon salvajes. ¡Busca una Ruta o Cueva!`)
    }

    // Cooldown de caza (30 segundos para evitar spam)
    let tiempo = 30000 
    if (new Date() - p.lastHunt < tiempo) {
        let faltan = Math.ceil((tiempo - (new Date() - p.lastHunt)) / 1000)
        return m.reply(`⏳ Debes esperar ${faltan} segundos para volver a buscar en la hierba alta.`)
    }

    // 3. Generar el encuentro
    let idSalvaje = zona.spawn[Math.floor(Math.random() * zona.spawn.length)]
    let pS = pokedex[idSalvaje]
    // Nivel aleatorio dentro del rango de la zona
    let lvlS = Math.floor(Math.random() * (zona.rango_nivel[1] - zona.rango_nivel[0] + 1)) + zona.rango_nivel[0]

    // 4. PROCESAR ACCIÓN (CAPTURA O HUIDA)
    if (text) {
        let accion = text.toLowerCase().trim()

        if (accion === 'capturar') {
            if (!p.mochila.pokebola || p.mochila.pokebola <= 0) {
                return m.reply(`❌ ¡No te quedan Poké Balls! Compra más en la tienda de la ciudad.`)
            }

            p.mochila.pokebola--
            p.lastHunt = new Date() * 1 // Aplicar cooldown tras intento

            // Lógica de captura (Probabilidad base del 40%, aumenta un poco si el nivel es bajo)
            let chance = 0.4 + (p.nivel > lvlS ? 0.1 : 0)
            let exito = Math.random() < chance

            if (exito) {
                let nuevoPk = {
                    id: idSalvaje,
                    nombre: pS.nombre,
                    nivel: lvlS,
                    hp: 100,
                    hpMax: 100,
                    exp: 0,
                    tipos: pS.tipos,
                    fechaCaptura: new Date().toLocaleString()
                }

                p.almacen.push(nuevoPk)
                return m.reply(`🎊 ¡Te pones en posición y lanzas la Poké Ball...!\n\n⭐ *¡CONSEGUIDO!* ⭐\nHas capturado a *${pS.nombre}* (Nv. ${lvlS}).\n📦 Se ha enviado a tu PC (Almacén).`)
            } else {
                return m.reply(`☁️ ¡La Poké Ball se rompió! El *${pS.nombre}* salvaje ha escapado entre la maleza...`)
            }
        }

        if (accion === 'huir') {
            p.lastHunt = new Date() * 1
            return m.reply(`💨 Escapaste sano y salvo del *${pS.nombre}* salvaje.`)
        }
    }

    // 5. INTERFAZ DE ENCUENTRO
    let interfaz = `🌿 *¡UN POKÉMON SALVAJE HA APARECIDO!*\n`
    interfaz += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`
    interfaz += `👾 *${pS.nombre.toUpperCase()}*\n`
    interfaz += `📊 Nivel: ${lvlS}\n`
    interfaz += `🏷️ Tipos: ${pS.tipos.join(' / ')}\n`
    interfaz += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`
    interfaz += `✨ *¿QUÉ DESEAS HACER?*\n\n`
    interfaz += `🔴 Escribe: *${usedPrefix + command} capturar*\n`
    interfaz += `🏃 Escribe: *${usedPrefix + command} huir*\n\n`
    interfaz += `🎒 Tienes: ${p.mochila.pokebola || 0} Poké Balls.`

    // Enviar imagen del salvaje si existe
    if (pS.imagen) {
        await conn.sendFile(m.chat, pS.imagen, 'wild.jpg', interfaz, m)
    } else {
        await conn.reply(m.chat, interfaz, m)
    }
}

handler.command = /^(p|pokemon)hunt|cazar|buscar|hierba$/i
export default handler
