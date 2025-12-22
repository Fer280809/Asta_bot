import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    
    // 1. Verificación de inicio
    if (!user.pokemon?.registrado) {
        return m.reply(`❌ No has iniciado tu aventura. Usa *${usedPrefix}p start*`)
    }

    const mapa = JSON.parse(fs.readFileSync('./lib/poke/mapa.json'))
    let p = user.pokemon
    let destino = text.trim()

    // 2. Si el usuario no escribe un destino, mostramos el radar de la zona
    if (!destino) {
        let actual = mapa[p.ubicacion]
        let txt = `📍 *ESTÁS EN:* ${p.ubicacion.toUpperCase()}\n`
        txt += `📝 _"${actual.descripcion}"_\n\n`
        
        txt += `🛣️ *RUTAS CONECTADAS:*\n`
        actual.conexiones.forEach(con => {
            let infoZona = mapa[con]
            let bloqueo = ""
            if (infoZona.item_requerido) bloqueo = ` 🔒 (Req. ${infoZona.item_requerido})`
            if (infoZona.medalla_requerida) bloqueo = ` 🎖️ (Req. Medalla ${infoZona.medalla_requerida})`
            txt += `• ${con}${bloqueo}\n`
        })

        txt += `\n🔍 *PUNTOS DE INTERÉS:*\n`
        actual.puntos_interes.forEach(poi => {
            txt += `• ${poi}\n`
        })
        
        txt += `\n👣 Para moverte usa: *${usedPrefix + command} [nombre del lugar]*`
        return m.reply(txt)
    }

    // 3. Validar si el lugar existe en el mapa
    if (!mapa[destino]) {
        return m.reply(`❌ El lugar *"${destino}"* no existe en el mapa actual. Revisa las mayúsculas y acentos.`)
    }

    // 4. Validar si hay conexión desde la ubicación actual
    if (!mapa[p.ubicacion].conexiones.includes(destino)) {
        return m.reply(`❌ No puedes viajar a *${destino}* directamente desde *${p.ubicacion}*. Debes seguir las rutas conectadas.`)
    }

    // 5. VALIDACIÓN DE REQUISITOS (OBJETOS Y MEDALLAS)
    let zonaDestino = mapa[destino]

    // Bloqueo por Objetos (Ej: Bicicleta para el Camino de Bicis)
    if (zonaDestino.item_requerido) {
        let itemReq = zonaDestino.item_requerido.toLowerCase()
        if (!p.mochila[itemReq] || p.mochila[itemReq] <= 0) {
            return m.reply(`🚫 *CAMINO BLOQUEADO*\n\nNecesitas tener el objeto: *${zonaDestino.item_requerido}* en tu mochila para pasar por aquí.`)
        }
    }

    // Bloqueo por Medallas (Ej: Ruta que requiere la Medalla Roca)
    if (zonaDestino.medalla_requerida) {
        if (!p.medallas.includes(zonaDestino.medalla_requerida)) {
            return m.reply(`🎖️ *CONTROL DE GUARDIA*\n\nLos guardias no te permiten pasar a esta zona hasta que ganes la *Medalla ${zonaDestino.medalla_requerida}* en el gimnasio correspondiente.`)
        }
    }

    // 6. EJECUTAR EL VIAJE
    p.ubicacion = destino
    
    let llegada = `🚶 *CAMINANDO...*\n\n`
    llegada += `¡Has llegado a *${destino}*!\n`
    llegada += `✨ ${zonaDestino.descripcion}\n\n`
    
    // Anuncios especiales de la zona
    if (zonaDestino.puntos_interes.includes("Centro Pokémon")) {
        llegada += `🏥 Hay un *Centro Pokémon* aquí. Puedes usar *.p heal* para recuperarte.\n`
    }
    if (zonaDestino.puntos_interes.includes("Gimnasio Pokémon")) {
        llegada += `🏆 ¡Aquí está el *Gimnasio*! Prepárate para el reto del Líder.\n`
    }
    if (zonaDestino.spawn && zonaDestino.spawn.length > 0) {
        llegada += `🌿 Se escuchan sonidos en la hierba alta... Usa *.p hunt*`
    }

    await conn.reply(m.chat, llegada, m)
}

handler.command = /^(p|pokemon)go|ir|viajar|moverse$/i
export default handler
