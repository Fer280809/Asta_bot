let handler = async (m, { conn, usedPrefix, command }) => {
    if (!db.data.chats[m.chat].economy && m.isGroup) {
        return m.reply(`🎄 *¡Oh no!* El calendario navideño está *congelado* en este grupo.\n\n🎅 Un *elfo administrador* puede descongelarlo con:\n» *${usedPrefix}economy on*`)
    }

    let user = global.db.data.users[m.sender]

    // Obtener hora de México (UTC-6)
    const ahora = new Date()
    const offsetMexico = -6
    const horaMexico = new Date(ahora.getTime() + (offsetMexico * 60 * 60 * 1000))

    const añoActual = horaMexico.getUTCFullYear()
    const mes = horaMexico.getUTCMonth() + 1
    const dia = horaMexico.getUTCDate()
    const hora = horaMexico.getUTCHours()
    const minutos = horaMexico.getUTCMinutes()

    // Inicializar datos del calendario
    user.calendarData = user.calendarData || {
        lastClaim: 0,
        currentStreak: 0,
        totalDaysClaimed: 0,
        lastYear: añoActual - 1,
        rewards: {},
        perfectStreakReward: false,
        claimHistory: []
    }

    // Inicializar recursos de minería
    user.coin = user.coin || 0
    user.coalStock = user.coalStock || 0
    user.iceCrystals = user.iceCrystals || 0
    user.candyGems = user.candyGems || 0
    user.magicSnow = user.magicSnow || 0
    user.festiveCoal = user.festiveCoal || 0

    const calendario = user.calendarData

    // Verificar si es un nuevo año
    if (mes === 1 && calendario.lastYear < añoActual) {
        calendario.currentStreak = 0
        calendario.totalDaysClaimed = 0
        calendario.rewards = {}
        calendario.perfectStreakReward = false
        calendario.lastYear = añoActual
        user.calendarData = calendario
    }

    // PERÍODO ESPECIAL: 24 de diciembre al 6 de enero
    const fechaInicio = new Date(Date.UTC(añoActual, 11, 24, 0, 0, 0))
    const fechaFin = new Date(Date.UTC(añoActual, 0, 6, 23, 59, 59))

    // Ajustar año para enero
    if (mes === 1) {
        fechaInicio.setUTCFullYear(añoActual - 1)
    }

    if (horaMexico.getTime() < fechaInicio.getTime()) {
        const diasParaInicio = Math.ceil((fechaInicio.getTime() - horaMexico.getTime()) / (1000 * 60 * 60 * 24))
        return conn.reply(m.chat, 
            `🎄 *¡El calendario navideño especial aún no ha comenzado!*\n\n⏰ *Hora México:* ${hora}:${minutos.toString().padStart(2, '0')}\n📅 Faltan *${diasParaInicio} días* para que comience el calendario especial.\n\n✨ Comienza el *24 de diciembre* hasta el *6 de enero*.`, 
            m
        )
    }

    if (mes === 1 && horaMexico.getTime() > fechaFin.getTime()) {
        return conn.reply(m.chat, 
            `🎅 *¡El calendario navideño especial ha terminado!*\n\n⏰ *Hora México:* ${hora}:${minutos.toString().padStart(2, '0')}\nEl calendario especial estuvo disponible del *24 de diciembre* al *6 de enero*.\n\n¡Nos vemos el próximo año! 🎁`, 
            m
        )
    }

    // Calcular día del calendario (1-14)
    let diaCalendario
    if (mes === 12) {
        diaCalendario = dia - 23  // 24 dic = día 1, 25 dic = día 2, etc.
    } else if (mes === 1) {
        diaCalendario = dia + 8    // 1 ene = día 9, 2 ene = día 10, etc.
    } else {
        return conn.reply(m.chat, 
            `❄️ *Error en el calendario*\n\n⏰ *Hora México:* ${hora}:${minutos.toString().padStart(2, '0')}\nEl calendario especial solo funciona del *24 de diciembre* al *6 de enero*.\n\nDía actual: ${dia}/${mes}`, 
            m
        )
    }

    // Validar rango
    if (diaCalendario < 1 || diaCalendario > 14) {
        return conn.reply(m.chat, 
            `❄️ *Fuera del período especial*\n\n⏰ *Hora México:* ${hora}:${minutos.toString().padStart(2, '0')}\nSolo disponible del 24/12 al 6/1.\nDía actual: ${dia}/${mes}`, 
            m
        )
    }

    // Verificar cooldown (24 horas)
    const cooldown = 24 * 60 * 60 * 1000

    const yaReclamoHoy = calendario.rewards[diaCalendario] !== undefined
    const enCooldown = (Date.now() - calendario.lastClaim) < cooldown

    if (yaReclamoHoy && enCooldown) {
        const tiempoRestante = formatTime(calendario.lastClaim + cooldown - Date.now())
        return conn.reply(m.chat, 
            `⛄ *¡Ya reclamaste el regalo de hoy!*\n\n⏰ *Hora México:* ${hora}:${minutos.toString().padStart(2, '0')}\nDebes esperar *${tiempoRestante}* para reclamar el regalo del próximo día.\n\n📅 Día actual del calendario: *${diaCalendario}/14*`, 
            m
        )
    }

    // Verificar racha
    const ultimoDiaReclamado = Object.keys(calendario.rewards).map(Number).sort((a,b) => b-a)[0]

    if (ultimoDiaReclamado) {
        if (diaCalendario === ultimoDiaReclamado + 1) {
            calendario.currentStreak = (calendario.currentStreak || 0) + 1
        } else if (diaCalendario > ultimoDiaReclamado + 1) {
            calendario.currentStreak = 1
        }
    } else {
        calendario.currentStreak = 1
    }

    // Calcular recompensas base
    const recompensaBase = calcularRecompensaEspecial(diaCalendario)

    // Bonus por racha (hasta 100% extra)
    const bonusRacha = Math.min(calendario.currentStreak * 0.0714, 1.0)

    // Aplicar bonus de racha
    let monedas = Math.floor(recompensaBase.monedas * (1 + bonusRacha))
    let carbon = Math.floor(recompensaBase.carbon * (1 + bonusRacha))
    let cristalesHielo = Math.floor(recompensaBase.cristalesHielo * (1 + bonusRacha))
    let gemasCaramelo = Math.floor(recompensaBase.gemasCaramelo * (1 + bonusRacha))
    let nieveMagica = Math.floor(recompensaBase.nieveMagica * (1 + bonusRacha))
    let carbonFestivo = Math.floor(recompensaBase.carbonFestivo * (1 + bonusRacha))

    // Bonus especial para días importantes
    let bonusEspecial = ''
    let bonusMultiplicador = 1

    if (diaCalendario === 1) {
        bonusMultiplicador = 3
        bonusEspecial = '🎄 *BONUS NOCHEBUENA x3*'
    } else if (diaCalendario === 2) {
        bonusMultiplicador = 4
        bonusEspecial = '🎅 *BONUS NAVIDAD x4*'
    } else if (diaCalendario === 7) {
        bonusMultiplicador = 3.5
        bonusEspecial = '🎆 *BONUS NOCHEVIEJA x3.5*'
    } else if (diaCalendario === 8) {
        bonusMultiplicador = 5
        bonusEspecial = '✨ *BONUS AÑO NUEVO x5*'
    } else if (diaCalendario === 14) {
        bonusMultiplicador = 6
        bonusEspecial = '👑 *BONUS DÍA DE REYES x6*'

        if (calendario.currentStreak === 14 && !calendario.perfectStreakReward) {
            const bonusPerfecto = 1000000
            monedas += bonusPerfecto
            calendario.perfectStreakReward = true
            bonusEspecial += `\n🏆 *¡RACHA PERFECTA!* +¥1,000,000`
        }
    }

    // Aplicar multiplicador especial
    monedas = Math.floor(monedas * bonusMultiplicador)
    carbon = Math.floor(carbon * bonusMultiplicador)
    cristalesHielo = Math.floor(cristalesHielo * bonusMultiplicador)
    gemasCaramelo = Math.floor(gemasCaramelo * bonusMultiplicador)
    nieveMagica = Math.floor(nieveMagica * bonusMultiplicador)
    carbonFestivo = Math.floor(carbonFestivo * bonusMultiplicador)

    // Actualizar usuario
    user.coin += monedas
    user.coalStock += carbon
    user.iceCrystals += cristalesHielo
    user.candyGems += gemasCaramelo
    user.magicSnow += nieveMagica
    user.festiveCoal += carbonFestivo

    // Actualizar calendario
    calendario.lastClaim = Date.now()
    calendario.totalDaysClaimed = (calendario.totalDaysClaimed || 0) + 1
    calendario.rewards[diaCalendario] = {
        fecha: `${dia}/${mes}/${añoActual}`,
        hora: `${hora}:${minutos.toString().padStart(2, '0')}`,
        monedas: monedas,
        recursos: {
            carbon: carbon,
            cristalesHielo: cristalesHielo,
            gemasCaramelo: gemasCaramelo,
            nieveMagica: nieveMagica,
            carbonFestivo: carbonFestivo
        },
        racha: calendario.currentStreak
    }

    calendario.claimHistory = calendario.claimHistory || []
    calendario.claimHistory.push({
        dia: diaCalendario,
        fecha: new Date().toISOString(),
        recompensa: { monedas, recursos: recompensaBase }
    })

    // Guardar cambios
    user.calendarData = calendario

    // Mensaje
    let mensajeCalendario = `🎄 *CALENDARIO NAVIDEÑO ESPECIAL ${añoActual}* 🎅\n`
    mensajeCalendario += `⏰ *Hora México:* ${hora}:${minutos.toString().padStart(2, '0')}\n`
    mensajeCalendario += `📅 Día: *${diaCalendario}/14* (${dia}/${mes})\n`
    mensajeCalendario += `🔥 Racha actual: *${calendario.currentStreak} días*\n`
    mensajeCalendario += `🎯 Días reclamados: *${calendario.totalDaysClaimed}/14*\n\n`

    if (bonusEspecial) {
        mensajeCalendario += `${bonusEspecial}\n\n`
    }

    mensajeCalendario += `✨ *¡RECOMPENSAS DEL DÍA!* ✨\n`
    mensajeCalendario += `💰 *Monedas:* ¥${monedas.toLocaleString()}\n\n`

    mensajeCalendario += `⛏️ *MINERALES OBTENIDOS:*\n`
    if (carbon > 0) mensajeCalendario += `⚫ *Carbón:* ${carbon} unidades\n`
    if (cristalesHielo > 0) mensajeCalendario += `❄️ *Cristales de Hielo:* ${cristalesHielo}\n`
    if (gemasCaramelo > 0) mensajeCalendario += `🍬 *Gemas de Caramelo:* ${gemasCaramelo}\n`
    if (nieveMagica > 0) mensajeCalendario += `🌨️ *Nieve Mágica:* ${nieveMagica}\n`
    if (carbonFestivo > 0) mensajeCalendario += `🎁 *Carbón Festivo:* ${carbonFestivo}\n`

    if (bonusRacha > 0) {
        mensajeCalendario += `\n🔥 *Bonus por racha:* +${Math.floor(bonusRacha * 100)}%\n`
    }

    mensajeCalendario += `\n━━━━━━━━━━━━━━━━━━━━\n`
    mensajeCalendario += `📊 *PROGRESO DEL CALENDARIO*\n`

    const diasReclamados = Object.keys(calendario.rewards).map(Number).sort((a,b) => a-b)
    if (diasReclamados.length > 0) {
        const ultimos3 = diasReclamados.slice(-3)
        mensajeCalendario += `Últimos días: ${ultimos3.map(d => `✅ ${d}`).join(' | ')}\n`
    }

    const diasEspeciales = []
    if (diaCalendario < 1) diasEspeciales.push('🎄 Nochebuena (24) - x3')
    if (diaCalendario < 2) diasEspeciales.push('🎅 Navidad (25) - x4')
    if (diaCalendario < 7) diasEspeciales.push('🎆 Nochevieja (31) - x3.5')
    if (diaCalendario < 8) diasEspeciales.push('✨ Año Nuevo (1) - x5')
    if (diaCalendario < 14) diasEspeciales.push('👑 Reyes (6) - x6')

    if (diasEspeciales.length > 0) {
        mensajeCalendario += `\n🎁 *PRÓXIMOS DÍAS ESPECIALES:*\n${diasEspeciales.join('\n')}\n`
    }

    mensajeCalendario += `\n━━━━━━━━━━━━━━━━━━━━\n`
    mensajeCalendario += `💰 *Tu saldo:* ¥${user.coin.toLocaleString()}\n\n`
    mensajeCalendario += `⛏️ *TUS MINERALES:*\n`
    mensajeCalendario += `⚫ *Carbón:* ${user.coalStock}\n`
    mensajeCalendario += `❄️ *Cristales de Hielo:* ${user.iceCrystals}\n`
    mensajeCalendario += `🍬 *Gemas de Caramelo:* ${user.candyGems}\n`
    mensajeCalendario += `🌨️ *Nieve Mágica:* ${user.magicSnow}\n`
    mensajeCalendario += `🎁 *Carbón Festivo:* ${user.festiveCoal}\n`

    if (diaCalendario < 14 && calendario.currentStreak === diaCalendario) {
        const diasFaltantes = 14 - diaCalendario
        mensajeCalendario += `\n🏆 *RACHA PERFECTA:* ${diasFaltantes} días para ganar *¥1,000,000* extra\n`
    }

    const tiempoSiguiente = formatTime(calendario.lastClaim + cooldown - Date.now())
    mensajeCalendario += `⏰ *Próxima recompensa:* en ${tiempoSiguiente}\n`

    await conn.reply(m.chat, mensajeCalendario, m)

    if (diaCalendario === 14 && calendario.currentStreak === 14 && calendario.perfectStreakReward) {
        setTimeout(() => {
            conn.sendMessage(m.chat, {
                text: `🎊 *¡FELICIDADES!* 🎊\n\n¡Has completado los *14 días* del calendario navideño especial!\n\n🏆 Recompensa por racha perfecta: *¥1,000,000*\n✨ ¡Eres un verdadero campeón de la Navidad! 🎅`
            }, { quoted: m })
        }, 1500)
    }
}

function calcularRecompensaEspecial(diaCalendario) {
    const ajustes = {
        1: { monedas: 10000, carbon: 150, cristalesHielo: 30, gemasCaramelo: 20, nieveMagica: 25, carbonFestivo: 10 },
        2: { monedas: 15000, carbon: 200, cristalesHielo: 40, gemasCaramelo: 30, nieveMagica: 35, carbonFestivo: 15 },
        3: { monedas: 7000, carbon: 80, cristalesHielo: 15, gemasCaramelo: 10, nieveMagica: 12, carbonFestivo: 5 },
        4: { monedas: 8000, carbon: 90, cristalesHielo: 18, gemasCaramelo: 12, nieveMagica: 15, carbonFestivo: 6 },
        5: { monedas: 9000, carbon: 100, cristalesHielo: 20, gemasCaramelo: 15, nieveMagica: 18, carbonFestivo: 7 },
        6: { monedas: 10000, carbon: 110, cristalesHielo: 22, gemasCaramelo: 18, nieveMagica: 20, carbonFestivo: 8 },
        7: { monedas: 12000, carbon: 130, cristalesHielo: 25, gemasCaramelo: 20, nieveMagica: 22, carbonFestivo: 10 },
        8: { monedas: 18000, carbon: 180, cristalesHielo: 35, gemasCaramelo: 25, nieveMagica: 30, carbonFestivo: 12 },
        9: { monedas: 25000, carbon: 250, cristalesHielo: 50, gemasCaramelo: 40, nieveMagica: 45, carbonFestivo: 20 },
        10: { monedas: 11000, carbon: 120, cristalesHielo: 24, gemasCaramelo: 16, nieveMagica: 20, carbonFestivo: 9 },
        11: { monedas: 12000, carbon: 130, cristalesHielo: 26, gemasCaramelo: 18, nieveMagica: 22, carbonFestivo: 10 },
        12: { monedas: 13000, carbon: 140, cristalesHielo: 28, gemasCaramelo: 20, nieveMagica: 24, carbonFestivo: 11 },
        13: { monedas: 14000, carbon: 150, cristalesHielo: 30, gemasCaramelo: 22, nieveMagica: 26, carbonFestivo: 12 },
        14: { monedas: 30000, carbon: 300, cristalesHielo: 60, gemasCaramelo: 50, nieveMagica: 55, carbonFestivo: 25 }
    }

    return ajustes[diaCalendario] || {
        monedas: 5000 + (diaCalendario * 2000),
        carbon: 50 + (diaCalendario * 20),
        cristalesHielo: 10 + (diaCalendario * 5),
        gemasCaramelo: 8 + (diaCalendario * 4),
        nieveMagica: 10 + (diaCalendario * 6),
        carbonFestivo: 3 + (diaCalendario * 2)
    }
}

function formatTime(ms) {
    if (ms <= 0) return "0 segundos"
    
    const totalSec = Math.ceil(ms / 1000)
    const hours = Math.floor(totalSec / 3600)
    const minutes = Math.floor((totalSec % 3600) / 60)
    const seconds = totalSec % 60

    const parts = []
    if (hours > 0) parts.push(`${hours} hora${hours !== 1 ? 's' : ''}`)
    if (minutes > 0) parts.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`)
    if (seconds > 0) parts.push(`${seconds} segundo${seconds !== 1 ? 's' : ''}`)
    if (parts.length === 0) parts.push('0 segundos')
    
    return parts.join(' ')
}

handler.help = ['calendario', 'adviento', 'calend']
handler.tags = ['economy', 'navidad', 'minería']
handler.command = ['calendario', 'adviento', 'calend', 'diario']
handler.group = true

export default handler
