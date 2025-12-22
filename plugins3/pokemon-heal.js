import fs from 'fs'

let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon
    const mapa = JSON.parse(fs.readFileSync('./lib/poke/mapa.json'))
    
    let zona = mapa[p.ubicacion]
    if (!zona.puntos_interes.some(i => i.includes("Centro"))) {
        return m.reply('🏥 No hay un Centro Pokémon en esta ubicación.')
    }

    p.equipo.forEach(pk => {
        pk.hp = pk.hpMax
    })

    m.reply('🏥 ¡Tu equipo ha sido restaurado por completo! "Esperamos volver a verte".')
}
handler.command = ['heal', 'curar']
export default handler
