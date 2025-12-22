import fs from 'fs'

let handler = async (m, { conn, usedPrefix, command, text }) => {
    let user = global.db.data.users[m.sender]
    
    // Lógica para mostrar la Guía del Juego
    if (text === 'guia') {
        let guia = `📖 *GUÍA DE INICIO: POKÉMON AURALIS*\n\n`
        guia += `1️⃣ *Inicio:* Usa *${usedPrefix}p start* para elegir tu compañero.\n`
        guia += `2️⃣ *Exploración:* Usa *${usedPrefix}p go* para moverte. El mapa tiene zonas bloqueadas que requieren objetos (Hacha, Linterna) o Medallas.\n`
        guia += `3️⃣ *Captura:* Ve a una zona de "hierba" y usa *${usedPrefix}p hunt*. Si aparece uno, lánzale una Pokéball desde el menú.\n`
        guia += `4️⃣ *Combate:* Durante un encuentro, pulsa "Luchar". El combate es por turnos manuales. ¡Elige bien tu ataque!\n`
        guia += `5️⃣ *Equipo:* Puedes llevar hasta 6 Pokémon. Los demás se enviarán al Almacén automáticamente.\n`
        guia += `6️⃣ *Curación:* Busca un Centro Pokémon en las ciudades y usa *${usedPrefix}p heal*.\n`
        guia += `7️⃣ *Evolución:* Algunos evolucionan por nivel y otros con piedras que compras en la *${usedPrefix}p shop*.\n\n`
        guia += `💡 *Consejo:* ¡Habla con los NPCs en cada zona, algunos te darán objetos clave para avanzar!`
        
        return m.reply(guia)
    }

    // Definición de comandos y usos
    const comandos = [
        {
            title: "🕹️ AVENTURA Y EXPLORACIÓN",
            rows: [
                { title: "📍 Ir al Mapa (GO)", rowId: `${usedPrefix}p go`, description: "Viajar, hablar con NPCs y ver servicios." },
                { title: "🌿 Cazar (HUNT)", rowId: `${usedPrefix}p hunt`, description: "Buscar Pokémon salvajes en la hierba." },
                { title: "🏥 Curar (HEAL)", rowId: `${usedPrefix}p heal`, description: "Restaura la salud de tu equipo en un Centro." }
            ]
        },
        {
            title: "🎒 GESTIÓN Y EQUIPO",
            rows: [
                { title: "👤 Perfil", rowId: `${usedPrefix}p profile`, description: "Mira tus medallas, dinero y líder." },
                { title: "📱 Equipo", rowId: `${usedPrefix}p team`, description: "Gestiona tus 6 Pokémon y cambia al líder." },
                { title: "👜 Mochila", rowId: `${usedPrefix}p bag`, description: "Usa pociones, piedras y mira tus objetos." },
                { title: "🧬 Evolucionar", rowId: `${usedPrefix}p evo`, description: "Verifica quién está listo para evolucionar." }
            ]
        },
        {
            title: "🏪 COMERCIO Y LUCHA",
            rows: [
                { title: "🛒 Tienda", rowId: `${usedPrefix}p shop`, description: "Compra Balls, Pociones y Piedras." },
                { title: "⚔️ Batalla", rowId: `${usedPrefix}p battle`, description: "Entrar al menú de ataque en un combate activo." }
            ]
        },
        {
            title: "❓ AYUDA",
            rows: [
                { title: "📖 Guía del Juego", rowId: `${usedPrefix}${command} guia`, description: "Aprende cómo jugar paso a paso." }
            ]
        }
    ]

    let footer = `Entrenador: ${user.pokemon?.nombreEntrenador || m.pushName}\nRegión: Auralis`
    
    return conn.sendList(
        m.chat, 
        "🎮 MENÚ PRINCIPAL POKÉMON", 
        "Selecciona un comando para ver su función o pulsa en la Guía para aprender a jugar.", 
        "Ver Comandos", 
        comandos, 
        m
    )
}

handler.command = ['pmenu', 'pokemonhelp', 'phelp']
export default handler
