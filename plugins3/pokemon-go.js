import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    if (!user.pokemon?.registrado) return m.reply(`❌ Usa *${usedPrefix}p start* primero.`)

    const mapa = JSON.parse(fs.readFileSync('./lib/poke/mapa.json'))
    const dialogos = JSON.parse(fs.readFileSync('./lib/poke/dialogos.json'))
    let p = user.pokemon
    let input = text.trim()

    // LÓGICA DE DIÁLOGOS
    if (input.startsWith('hablar_')) {
        let npc = input.replace('hablar_', '').replace(/_/g, ' ')
        let frase = dialogos[npc] || "Hola, soy un ciudadano de Auralis."
        return m.reply(`🗣️ *${npc}:* "${frase}"`)
    }

    // LÓGICA DE MOVIMIENTO
    if (input && mapa[input]) {
        let actual = mapa[p.ubicacion]
        let destino = mapa[input]

        if (!actual.conexiones.includes(input)) return m.reply('❌ Esa zona no está conectada a tu ubicación.')

        if (destino.item_requerido) {
            let itemReq = destino.item_requerido.toLowerCase()
            if (!p.mochila[itemReq]) return m.reply(`🚫 Bloqueado: Necesitas el objeto *${destino.item_requerido}*.`)
        }

        p.ubicacion = input
        return m.reply(`🚶 Has llegado a *${input}*.\n\n${destino.descripcion}`)
    }

    // INTERFAZ DE LISTA
    let zona = mapa[p.ubicacion]
    let sections = []

    // Sección de Viaje
    let rutas = { title: "🗺️ VIAJAR", rows: [] }
    zona.conexiones.forEach(c => {
        rutas.rows.push({ title: `Ir a ${c}`, rowId: `${usedPrefix + command} ${c}` })
    })
    sections.push(rutas)

    // Sección de Personajes
    if (zona.npc) {
        let npcs = { title: "🗣️ PERSONAJES", rows: [] }
        zona.npc.forEach(n => {
            npcs.rows.push({ title: `Hablar con ${n}`, rowId: `${usedPrefix + command} hablar_${n.replace(/ /g, '_')}` })
        })
        sections.push(npcs)
    }

    // Sección de Servicios
    let serv = { title: "🏢 LUGARES", rows: [] }
    if (zona.puntos_interes.some(i => i.includes("Centro"))) serv.rows.push({ title: "🏥 Centro Pokémon", rowId: `${usedPrefix}p heal` })
    if (zona.puntos_interes.some(i => i.includes("Tienda"))) serv.rows.push({ title: "🛒 Tienda", rowId: `${usedPrefix}p shop` })
    if (zona.puntos_interes.some(i => i.includes("Gimnasio"))) serv.rows.push({ title: "🏆 Gimnasio", rowId: `${usedPrefix}p battle lider` })
    if (serv.rows.length > 0) sections.push(serv)

    // Acciones rápidas
    sections.push({
        title: "⚙️ MENÚ",
        rows: [
            { title: "🎒 Mochila", rowId: `${usedPrefix}p bag` },
            { title: "📱 Equipo", rowId: `${usedPrefix}p team` },
            { title: "🌿 Cazar", rowId: `${usedPrefix}p hunt` }
        ]
    })

    return conn.sendList(m.chat, `📍 UBICACIÓN: ${p.ubicacion}`, zona.descripcion, "Seleccionar", sections, m)
}
handler.command = ['go', 'p']
export default handler
