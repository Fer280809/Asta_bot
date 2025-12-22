import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    if (!user.pokemon?.registrado) return m.reply('❌ No has iniciado tu aventura. Usa .pstart')

    const mapa = JSON.parse(fs.readFileSync('./lib/poke/mapa.json'))
    let p = user.pokemon
    let destino = text.trim()

    // 1. Mostrar estado actual y opciones si no hay destino
    if (!destino) {
        let actual = mapa[p.ubicacion]
        let txt = `📍 *ESTÁS EN:* ${p.ubicacion.toUpperCase()}\n`
        txt += `📝 ${actual.descripcion}\n\n`
        txt += `🛣️ *CONEXIONES DISPONIBLES:*\n`
        
        actual.conexiones.forEach(con => {
            let restr = mapa[con].item_requerido ? ` 🔒 (Req. ${mapa[con].item_requerido})` : ""
            txt += `• ${con}${restr}\n`
        })

        txt += `\n🔍 *PUNTOS DE INTERÉS:*\n`
        actual.puntos_interes.forEach(poi => txt += `• ${poi}\n`)
        
        txt += `\n👣 Usa: *${usedPrefix + command} [nombre del lugar]*`
        return m.reply(txt)
    }

    // 2. Verificar si el lugar existe
    if (!mapa[destino]) {
        return m.reply(`❌ El lugar "${destino}" no existe en la región de Auralis. Revisa la ortografía.`)
    }

    // 3. Verificar si está conectado a la ubicación actual
    if (!mapa[p.ubicacion].conexiones.includes(destino)) {
        return m.reply(`❌ No puedes llegar a *${destino}* desde *${p.ubicacion}*. Debes seguir las rutas conectadas.`)
    }

    // 4. VERIFICACIÓN DE REQUISITOS (BLOQUEOS DE HISTORIA)
    let zonaDestino = mapa[destino]

    // Requisito de Objeto (Bicicleta, Ticket Barco, etc.)
    if (zonaDestino.item_requerido) {
        let tieneItem = p.mochila[zonaDestino.item_requerido.toLowerCase()] > 0
        if (!tieneItem) {
            return m.reply(`🚫 No puedes pasar. Necesitas el objeto: *${zonaDestino.item_requerido}*.\n💡 Búscalo en las tiendas o hablando con NPCs.`)
        }
    }

    // Requisito de Medalla (Para rutas de alto nivel)
    if (zonaDestino.medalla_requerida) {
        if (!p.medallas.includes(zonaDestino.medalla_requerida)) {
            return m.reply(`🎖️ Esta zona es peligrosa. Los guardias solo dejan pasar a entrenadores con la *${zonaDestino.medalla_requerida}*.`)
        }
    }

    // 5. Ejecutar viaje
    p.ubicacion = destino
    
    let arrival = `🚶 *VIAJANDO...*\n\n`
    arrival += `Has llegado a *${destino}*.\n`
    arrival += `✨ ${zonaDestino.descripcion}\n\n`
    
    if (zonaDestino.puntos_interes.includes("Centro Pokémon")) {
        arrival += `🏥 ¡Hay un Centro Pokémon aquí! Puedes usar *.p heal*`
    }

    await conn.reply(m.chat, arrival, m)
}

handler.command = /^(p|pokemon)go|ir|viajar|moverse$/i
export default handler
