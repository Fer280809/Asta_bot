import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const user = global.db.data.users[m.sender]
    
    // Inicializar datos del juego
    if (!user.rascaDonas) {
        user.rascaDonas = {
            lastReset: 0,
            intentosRestantes: 5,
            zonasRascadas: [],
            premiosGanados: []
        }
    }

    const ahora = Date.now()
    const cooldown = 4 * 60 * 60 * 1000 // 4 horas

    // Verificar si deben restablecerse las oportunidades
    if (ahora - user.rascaDonas.lastReset >= cooldown) {
        user.rascaDonas.lastReset = ahora
        user.rascaDonas.intentosRestantes = 5
        user.rascaDonas.zonasRascadas = []
        user.rascaDonas.premiosGanados = []
    }

    // Inicializar recursos si no existen
    user.coin = user.coin || 0
    user.coalStock = user.coalStock || 0
    user.iceCrystals = user.iceCrystals || 0
    user.candyGems = user.candyGems || 0
    user.magicSnow = user.magicSnow || 0
    user.festiveCoal = user.festiveCoal || 0

    // Estructura de las 15 zonas (5 filas x 3 columnas) = A1-A5, B1-B5, C1-C5
    const zonasDisponibles = [
        'A1', 'A2', 'A3', 'A4', 'A5',
        'B1', 'B2', 'B3', 'B4', 'B5',
        'C1', 'C2', 'C3', 'C4', 'C5'
    ]

    // Premios posibles (algunos pueden ser nada)
    const premiosPosibles = [
        { tipo: 'monedas', cantidad: 5000, emoji: '💰', nombre: '¥5,000' },
        { tipo: 'monedas', cantidad: 10000, emoji: '💰', nombre: '¥10,000' },
        { tipo: 'monedas', cantidad: 15000, emoji: '💰', nombre: '¥15,000' },
        { tipo: 'monedas', cantidad: 25000, emoji: '💰', nombre: '¥25,000' },
        { tipo: 'monedas', cantidad: 50000, emoji: '💰', nombre: '¥50,000' },
        { tipo: 'carbon', cantidad: 50, emoji: '⚫', nombre: '50 Carbón' },
        { tipo: 'carbon', cantidad: 100, emoji: '⚫', nombre: '100 Carbón' },
        { tipo: 'carbon', cantidad: 200, emoji: '⚫', nombre: '200 Carbón' },
        { tipo: 'cristales', cantidad: 20, emoji: '❄️', nombre: '20 Cristales' },
        { tipo: 'cristales', cantidad: 50, emoji: '❄️', nombre: '50 Cristales' },
        { tipo: 'gemas', cantidad: 15, emoji: '🍬', nombre: '15 Gemas' },
        { tipo: 'gemas', cantidad: 30, emoji: '🍬', nombre: '30 Gemas' },
        { tipo: 'nieve', cantidad: 25, emoji: '🌨️', nombre: '25 Nieve' },
        { tipo: 'nieve', cantidad: 60, emoji: '🌨️', nombre: '60 Nieve' },
        { tipo: 'carbonFestivo', cantidad: 10, emoji: '🎁', nombre: '10 C.Festivo' },
        { tipo: 'nada', cantidad: 0, emoji: '❌', nombre: 'Nada' },
        { tipo: 'nada', cantidad: 0, emoji: '❌', nombre: 'Nada' },
        { tipo: 'nada', cantidad: 0, emoji: '❌', nombre: 'Nada' },
        { tipo: 'nada', cantidad: 0, emoji: '❌', nombre: 'Nada' }
    ]

    // Si no hay argumento, mostrar el tablero
    if (!text) {
        return await mostrarTablero(conn, m, user, zonasDisponibles, usedPrefix)
    }

    // Validar el comando
    const input = text.toUpperCase().trim()
    
    // Verificar si quedan intentos
    if (user.rascaDonas.intentosRestantes <= 0) {
        const tiempoRestante = user.rascaDonas.lastReset + cooldown - ahora
        return conn.reply(m.chat, 
            `🎄 *¡Ya no tienes intentos!* 🍩\n\n` +
            `❄️ Rascaste todas tus donas de hoy.\n` +
            `⏰ *Próximo restablecimiento:* ${formatTime(tiempoRestante)}\n\n` +
            `🎅 *Premios ganados hoy:*\n${formatPremios(user.rascaDonas.premiosGanados)}`, 
            m
        )
    }

    // Validar formato (ej: A3, B5, C1)
    if (!/^[ABC][1-5]$/.test(input)) {
        return conn.reply(m.chat, 
            `❌ *Formato inválido* 🍩\n\n` +
            `Usa el formato correcto:\n` +
            `• ${usedPrefix}${command} A1\n` +
            `• ${usedPrefix}${command} B3\n` +
            `• ${usedPrefix}${command} C5\n\n` +
            `🎄 Elige una zona de A1 a C5`, 
            m
        )
    }

    // Verificar si la zona ya fue rascada
    if (user.rascaDonas.zonasRascadas.includes(input)) {
        return conn.reply(m.chat, 
            `⚠️ *¡Ya rascaste esa dona!* 🍩\n\n` +
            `La zona *${input}* ya fue descubierta.\n` +
            `Elige otra zona disponible.\n\n` +
            `🎅 Usa: *${usedPrefix}rascadona* para ver el tablero`, 
            m
        )
    }

    await m.react('🍩')

    // Asignar premio aleatorio
    const premio = premiosPosibles[Math.floor(Math.random() * premiosPosibles.length)]

    // Marcar zona como rascada
    user.rascaDonas.zonasRascadas.push(input)
    user.rascaDonas.intentosRestantes--

    // Aplicar premio
    let mensajePremio = ''
    if (premio.tipo === 'monedas') {
        user.coin += premio.cantidad
        mensajePremio = `💰 *¡Ganaste ¥${premio.cantidad.toLocaleString()}!*`
    } else if (premio.tipo === 'carbon') {
        user.coalStock += premio.cantidad
        mensajePremio = `⚫ *¡Ganaste ${premio.cantidad} Carbón!*`
    } else if (premio.tipo === 'cristales') {
        user.iceCrystals += premio.cantidad
        mensajePremio = `❄️ *¡Ganaste ${premio.cantidad} Cristales de Hielo!*`
    } else if (premio.tipo === 'gemas') {
        user.candyGems += premio.cantidad
        mensajePremio = `🍬 *¡Ganaste ${premio.cantidad} Gemas de Caramelo!*`
    } else if (premio.tipo === 'nieve') {
        user.magicSnow += premio.cantidad
        mensajePremio = `🌨️ *¡Ganaste ${premio.cantidad} Nieve Mágica!*`
    } else if (premio.tipo === 'carbonFestivo') {
        user.festiveCoal += premio.cantidad
        mensajePremio = `🎁 *¡Ganaste ${premio.cantidad} Carbón Festivo!*`
    } else {
        mensajePremio = `❌ *¡Dona vacía!* No ganaste nada esta vez.`
    }

    // Guardar premio
    user.rascaDonas.premiosGanados.push({
        zona: input,
        premio: premio.nombre
    })

    // Crear tablero actualizado
    let tablero = crearTablero(zonasDisponibles, user.rascaDonas.zonasRascadas)

    // Mensaje de resultado
    let mensaje = `🍩 *RASCA DONAS NAVIDEÑAS* 🎄\n\n`
    mensaje += `${tablero}\n\n`
    mensaje += `━━━━━━━━━━━━━━━━━━━━\n`
    mensaje += `🎯 *Zona rascada:* ${input}\n`
    mensaje += `${mensajePremio}\n`
    mensaje += `━━━━━━━━━━━━━━━━━━━━\n\n`
    mensaje += `🎁 *Intentos restantes:* ${user.rascaDonas.intentosRestantes}/5\n`
    mensaje += `🍩 *Donas rascadas:* ${user.rascaDonas.zonasRascadas.length}/15\n\n`

    if (user.rascaDonas.intentosRestantes > 0) {
        mensaje += `🎅 *Sigue rascando:*\n`
        mensaje += `Usa: *${usedPrefix}${command} [ZONA]*\n`
        mensaje += `Ejemplo: *${usedPrefix}${command} B2*\n\n`
    } else {
        const tiempoRestante = user.rascaDonas.lastReset + cooldown - ahora
        mensaje += `✨ *¡Se acabaron tus intentos!*\n`
        mensaje += `⏰ *Próximo restablecimiento:* ${formatTime(tiempoRestante)}\n\n`
    }

    mensaje += `🎁 *Premios ganados hoy:*\n${formatPremios(user.rascaDonas.premiosGanados)}\n\n`
    mensaje += `💰 *Tu saldo:* ¥${user.coin.toLocaleString()}\n`
    mensaje += `⚫ *Carbón:* ${user.coalStock}\n`
    mensaje += `❄️ *Cristales:* ${user.iceCrystals}\n`
    mensaje += `🍬 *Gemas:* ${user.candyGems}\n`
    mensaje += `🌨️ *Nieve:* ${user.magicSnow}\n`
    mensaje += `🎁 *C.Festivo:* ${user.festiveCoal}`

    // Imagen de dona navideña
    const imagenDona = 'https://i.ibb.co/7GqXVyM/donas-navidad.jpg'

    try {
        await conn.sendMessage(m.chat, {
            image: { url: imagenDona },
            caption: mensaje
        }, { quoted: m })
    } catch {
        await conn.reply(m.chat, mensaje, m)
    }

    await m.react('🎁')
}

// Función para mostrar tablero inicial
async function mostrarTablero(conn, m, user, zonasDisponibles, usedPrefix) {
    const tablero = crearTablero(zonasDisponibles, user.rascaDonas.zonasRascadas)
    const ahora = Date.now()
    const cooldown = 4 * 60 * 60 * 1000
    const tiempoRestante = user.rascaDonas.lastReset + cooldown - ahora

    let mensaje = `🍩 *RASCA DONAS NAVIDEÑAS* 🎄\n\n`
    mensaje += `${tablero}\n\n`
    mensaje += `━━━━━━━━━━━━━━━━━━━━\n`
    mensaje += `🎁 *Intentos disponibles:* ${user.rascaDonas.intentosRestantes}/5\n`
    mensaje += `🍩 *Donas rascadas:* ${user.rascaDonas.zonasRascadas.length}/15\n`
    
    if (user.rascaDonas.intentosRestantes > 0) {
        mensaje += `\n🎅 *Cómo jugar:*\n`
        mensaje += `Elige una zona para rascar:\n`
        mensaje += `• ${usedPrefix}rascadona A1\n`
        mensaje += `• ${usedPrefix}rascadona B3\n`
        mensaje += `• ${usedPrefix}rascadona C5\n\n`
        mensaje += `✨ *Premios posibles:*\n`
        mensaje += `💰 Monedas (5k - 50k)\n`
        mensaje += `⚫ Carbón (50 - 200)\n`
        mensaje += `❄️ Cristales de Hielo (20 - 50)\n`
        mensaje += `🍬 Gemas de Caramelo (15 - 30)\n`
        mensaje += `🌨️ Nieve Mágica (25 - 60)\n`
        mensaje += `🎁 Carbón Festivo (10)\n`
        mensaje += `❌ O nada...\n\n`
    } else {
        mensaje += `\n⏰ *Próximo restablecimiento:*\n${formatTime(tiempoRestante)}\n\n`
    }

    if (user.rascaDonas.premiosGanados.length > 0) {
        mensaje += `🎁 *Premios ganados hoy:*\n${formatPremios(user.rascaDonas.premiosGanados)}\n\n`
    }

    mensaje += `━━━━━━━━━━━━━━━━━━━━\n`
    mensaje += `💰 *Tu saldo:* ¥${user.coin.toLocaleString()}\n`
    mensaje += `⚫ *Carbón:* ${user.coalStock || 0}\n`
    mensaje += `❄️ *Cristales:* ${user.iceCrystals || 0}\n`
    mensaje += `🍬 *Gemas:* ${user.candyGems || 0}\n`
    mensaje += `🌨️ *Nieve:* ${user.magicSnow || 0}\n`
    mensaje += `🎁 *C.Festivo:* ${user.festiveCoal || 0}`

    const imagenDona = 'https://i.ibb.co/7GqXVyM/donas-navidad.jpg'

    try {
        await conn.sendMessage(m.chat, {
            image: { url: imagenDona },
            caption: mensaje
        }, { quoted: m })
    } catch {
        await conn.reply(m.chat, mensaje, m)
    }
}

// Función para crear el tablero visual
function crearTablero(zonasDisponibles, zonasRascadas) {
    let tablero = '```\n'
    tablero += '   1️⃣  2️⃣  3️⃣  4️⃣  5️⃣\n'
    tablero += '━━━━━━━━━━━━━━━━━━━━━\n'
    
    const filas = ['A', 'B', 'C']
    
    filas.forEach(fila => {
        tablero += `${fila} `
        for (let i = 1; i <= 5; i++) {
            const zona = `${fila}${i}`
            if (zonasRascadas.includes(zona)) {
                tablero += ' ❌ '
            } else {
                tablero += ' 🍩 '
            }
        }
        tablero += '\n'
    })
    
    tablero += '```'
    return tablero
}

// Función para formatear premios
function formatPremios(premios) {
    if (premios.length === 0) return '_Aún no has ganado nada_'
    
    return premios.map((p, i) => `${i + 1}. ${p.zona}: ${p.premio}`).join('\n')
}

// Función para formatear tiempo
function formatTime(ms) {
    const totalSec = Math.ceil(ms / 1000)
    const hours = Math.floor(totalSec / 3600)
    const minutes = Math.floor((totalSec % 3600) / 60)
    const seconds = totalSec % 60

    const parts = []
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    if (seconds > 0) parts.push(`${seconds}s`)

    return parts.join(' ')
}

handler.help = ['rascadona']
handler.tags = ['economy', 'navidad', 'juegos']
handler.command = ['rascadona', 'rascadonas', 'donanavi', 'rascanavi']
handler.group = false

export default handler