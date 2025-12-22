import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon
    if (!p?.registrado) return m.reply('❌ No registrado.')

    // Cambiar líder
    if (text && !isNaN(text)) {
        let idx = parseInt(text) - 1
        if (p.equipo[idx]) {
            let pkm = p.equipo.splice(idx, 1)[0]
            p.equipo.unshift(pkm) // Poner al frente
            return m.reply(`✅ *${pkm.nombre}* ahora es tu Pokémon principal.`)
        }
    }

    let rows = p.equipo.map((pk, i) => ({
        title: `${i + 1}. ${pk.nombre} (Nv. ${pk.nivel})`,
        rowId: `${usedPrefix + command} ${i + 1}`,
        description: `HP: ${pk.hp}/${pk.hpMax} | Toca para liderar`
    }))

    return conn.sendList(m.chat, "📱 EQUIPO POKÉMON", "Selecciona para cambiar el orden del equipo.", "Ver Equipo", [{ title: "TUS POKÉMON", rows }], m)
}
handler.command = ['team', 'equipo']
export default handler
