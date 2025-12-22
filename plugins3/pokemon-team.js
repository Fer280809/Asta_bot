import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon

    // 1. Verificación de inicio
    if (!p?.registrado) return m.reply(`❌ No tienes una partida activa. Usa *${usedPrefix}p start*`)
    if (!p.almacen) p.almacen = []

    const pokedex = JSON.parse(fs.readFileSync('./lib/poke/pokedex.json'))

    // 2. LÓGICA DE INTERCAMBIO (SWITCH)
    if (command === 'pswitch' || command === 'cambiar') {
        if (!text || isNaN(text)) return m.reply(`💡 Indica el número del Pokémon en el PC que quieres usar.\nEjemplo: *${usedPrefix}pswitch 1*`)
        
        let index = parseInt(text) - 1
        if (!p.almacen[index]) return m.reply(`❌ No hay ningún Pokémon en la posición [${text}] de tu PC.`)

        // Guardar datos del líder actual para enviarlo al PC
        let liderActual = {
            id: p.id,
            nombre: p.nombre,
            nivel: p.nivel,
            hp: p.hp,
            hpMax: p.hpMax,
            exp: p.exp,
            tipos: p.tipos,
            emocion: p.emocion
        }

        // Obtener el nuevo Pokémon del PC
        let nuevoLider = p.almacen[index]

        // Realizar el intercambio (Swap)
        p.id = nuevoLider.id
        p.nombre = nuevoLider.nombre
        p.nivel = nuevoLider.nivel
        p.hp = nuevoLider.hp
        p.hpMax = nuevoLider.hpMax
        p.exp = nuevoLider.exp
        p.tipos = nuevoLider.tipos
        p.emocion = nuevoLider.emocion

        // Reemplazar en el almacén al que sacamos por el que entró
        p.almacen[index] = liderActual

        return m.reply(`✅ ¡Has intercambiado a tus Pokémon!\n🌟 *${p.nombre}* es ahora tu líder.\n📦 *${liderActual.nombre}* ha sido enviado al PC.`)
    }

    // 3. INTERFAZ DE EQUIPO Y PC (Visualización)
    let equipoTxt = `📱 *SISTEMA DE GESTIÓN POKÉMON*\n`
    equipoTxt += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n`
    
    equipoTxt += `⭐ *LÍDER ACTUAL:*\n`
    equipoTxt += `• ${p.nombre} (Nv. ${p.nivel})\n`
    equipoTxt += `• HP: ${p.hp}/${p.hpMax}\n`
    equipoTxt += `• Tipos: ${p.tipos.join('/')}\n\n`

    equipoTxt += `📦 *ALMACÉN (PC):*\n`
    if (p.almacen.length === 0) {
        equipoTxt += `_El PC está vacío. ¡Captura más Pokémon!_\n`
    } else {
        p.almacen.forEach((pk, i) => {
            equipoTxt += `${i + 1}. ${pk.nombre} (Nv. ${pk.nivel}) - HP: ${pk.hp}/${pk.hpMax}\n`
        })
    }

    equipoTxt += `\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`
    equipoTxt += `💡 Para cambiar de líder, usa:\n*${usedPrefix}pswitch [número del PC]*`

    await conn.reply(m.chat, equipoTxt, m)
}

handler.command = /^(p|pokemon)(team|pc|switch|cambiar|equipo)$/i
export default handler
