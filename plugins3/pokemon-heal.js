import fs from 'fs'

let handler = async (m, { conn, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon

    // 1. Verificación de inicio
    if (!p?.registrado) return m.reply(`❌ No tienes una partida activa. Usa *${usedPrefix}p start*`)

    const mapa = JSON.parse(fs.readFileSync('./lib/poke/mapa.json'))
    let zonaActual = mapa[p.ubicacion]

    // 2. Verificar si hay un Centro Pokémon en esta zona
    if (!zonaActual.puntos_interes.includes("Centro Pokémon")) {
        return m.reply(`🏥 No hay un Centro Pokémon en *${p.ubicacion}*.\n📍 Viaja a una Ciudad cercana (como Ciudad Verde o Ciudad Plateada) para curar a tu equipo gratis.`)
    }

    // 3. Verificar si ya tiene la vida al máximo
    if (p.hp >= p.hpMax) {
        return m.reply(`😊 ¡Tu *${p.nombre}* ya se encuentra en perfectas condiciones! No es necesario curarlo ahora.`)
    }

    // 4. Proceso de curación con simulación de tiempo
    let espere = `🏥 *CENTRO POKÉMON*\n\n"Hola, bienvenido al Centro Pokémon. Nos encargaremos de curar a tu Pokémon..."`
    await m.reply(espere)

    // Simulamos un pequeño retraso de 3 segundos para dar realismo (opcional)
    setTimeout(async () => {
        p.hp = p.hpMax
        
        let curado = `✨ *¡TUS POKÉMON HAN SIDO CURADOS!* ✨\n`
        curado += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`
        curado += `❤️ HP Restaurado: ${p.hp}/${p.hpMax}\n`
        curado += `🩹 Estado: Excelente\n`
        curado += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`
        curado += `"¡Esperamos volver a verte!" 👋`

        await conn.reply(m.chat, curado, m)
    }, 3000)
}

handler.command = /^(p|pokemon)(heal|curar|center|centro|hospital)$/i
export default handler
