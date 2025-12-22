import fs from 'fs'
let handler = async (m, { conn, text }) => {
    let user = global.db.data.users[m.sender]
    if (!user.pokemon?.registrado) return m.reply('❌ No has iniciado.')

    const mapa = JSON.parse(fs.readFileSync('./lib/poke/mapa.json'))
    let p = user.pokemon
    let destino = text.trim()

    if (!destino || !mapa[destino]) {
        let opciones = mapa[p.ubicacion].conexiones.join(', ')
        return m.reply(`📍 *UBICACIÓN ACTUAL:* ${p.ubicacion}\n🛣️ *PUEDES IR A:* ${opciones}`)
    }

    if (!mapa[p.ubicacion].conexiones.includes(destino)) {
        return m.reply(`❌ No puedes llegar a ${destino} desde aquí.`)
    }

    p.ubicacion = destino
    m.reply(`🚶 Has llegado a *${destino}*.\n${mapa[destino].descripcion}`)
}
handler.command = /^(pgo|ir|viajar)$/i
export default handler
