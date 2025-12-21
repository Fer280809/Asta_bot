import { PokemonLogic } from '../../lib/poke/logic.js'

let handler = async (m, { conn, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    if (!user.pokemon?.registrado) return m.reply('❌ No has iniciado tu aventura. Usa *.p start*')

    let p = user.pokemon
    let poke = p.equipo[0]
    
    let caption = `📑 *PERFIL DE ENTRENADOR*\n`
    caption += `👤 *Entrenador:* ${p.nombreEntrenador}\n`
    caption += `📍 *Lugar:* ${p.ubicacion}\n`
    caption += `💰 *Yenes:* $${p.dinero}\n`
    caption += `🎖️ *Medallas:* ${p.medallas.length}/8\n\n`
    caption += `⭐ *Líder de Equipo:* ${poke.nombre} (Nv. ${poke.nivel})\n`
    caption += `❤️ *HP:* ${poke.hp}/${poke.hpMax}\n`
    caption += `💠 *XP:* ${poke.exp}/${PokemonLogic.getExpRequired(poke.nivel + 1)}`

    const sections = [
        {
            title: "ACCIONES DISPONIBLES",
            rows: [
                { title: "🌿 Buscar Pokémon", rowId: `${usedPrefix}p hunt`, description: "Explorar la zona actual" },
                { title: "🗺️ Viajar", rowId: `${usedPrefix}p go`, description: "Ver rutas cercanas" },
                { title: "🎒 Mochila", rowId: `${usedPrefix}p bag`, description: "Usar objetos" },
                { title: "🏥 Curar", rowId: `${usedPrefix}p heal`, description: "Solo en Centros Pokémon" }
            ]
        }
    ]

    await conn.sendList(m.chat, "🎒 TU AVENTURA POKÉMON", caption, "Abrir Menú", sections, m)
}

handler.command = /^(p\s?info)$/i
handler.tags = ['plugin3']
export default handler
