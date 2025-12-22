import fs from 'fs'

let handler = async (m, { conn, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon
    if (!p?.registrado) return m.reply('❌ No registrado.')

    let lider = p.equipo[0]
    let medallasTxt = p.medallas.length > 0 ? p.medallas.join(', ') : 'Ninguna'

    let perfil = `✨ *PERFIL DE ENTRENADOR* ✨\n\n`
    perfil += `👤 *Nombre:* ${p.nombreEntrenador}\n`
    perfil += `📍 *Ubicación:* ${p.ubicacion}\n`
    perfil += `💰 *Dinero:* $${p.dinero}\n`
    perfil += `🎖️ *Medallas:* ${medallasTxt}\n\n`
    perfil += `⭐ *POKÉMON LÍDER:* ${lider.nombre} (Nv. ${lider.nivel})\n`
    perfil += `❤️ *HP:* ${lider.hp}/${lider.hpMax}\n`
    perfil += `👥 *Equipo:* ${p.equipo.length}/6 Pokémon`

    // Botones de acción rápida (Baileys Button Message)
    const buttons = [
        { buttonId: `${usedPrefix}p go`, buttonText: { displayText: '🗺️ Ir al Mapa' }, type: 1 },
        { buttonId: `${usedPrefix}p team`, buttonText: { displayText: '📱 Ver Equipo' }, type: 1 },
        { buttonId: `${usedPrefix}p bag`, buttonText: { displayText: '🎒 Mochila' }, type: 1 }
    ]

    const buttonMessage = {
        text: perfil,
        footer: 'Auralis RPG • Gestión de Entrenador',
        buttons: buttons,
        headerType: 1
    }

    return conn.sendMessage(m.chat, buttonMessage, { quoted: m })
}
handler.command = ['profile', 'perfil', 'p profile']
export default handler
