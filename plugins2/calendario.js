let handler = async (m, { conn, usedPrefix, command }) => {
    if (!db.data.chats[m.chat].economy && m.isGroup) {
        return m.reply(`🎄 *¡Oh no!* El calendario navideño está *congelado* en este grupo.\n\n🎅 Un *elfo administrador* puede descongelarlo con:\n» *${usedPrefix}economy on*`)
    }
    
    let user = global.db.data.users[m.sender]
    
    // Obtener hora de México (UTC-6)
    const ahora = new Date()
    const offsetMexico = -6 // UTC-6 para hora estándar de México
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
    
    // Inicializar recursos de minería navideña si no existen
    user.coalStock = user.coalStock || 0 // Carbón
    user.iceCrystals = user.iceCrystals || 0 // Cristales de hielo
    user.candyGems = user.candyGems || 0 // Gemas de caramelo
    user.christmasSpirit = user.christmasSpirit || 0 // Espíritu navideño
    user.magicSnow = user.magicSnow || 0 // Nieve mágica
    user.festiveCoal = user.festiveCoal || 0 // Carbón festivo (para niños traviesos)
    
    const calendario = user.calendarData
    
    // Verificar si es un nuevo año (resetear si es enero y el último año fue el anterior)
    if (mes === 1 && calendario.lastYear < añoActual) {
        calendario.currentStreak = 0
        calendario.totalDaysClaimed = 0
        calendario.rewards = {}
        calendario.perfectStreakReward = false
        calendario.lastYear = añoActual
        user.calendarData = calendario
    }
    
    // PERÍODO ESPECIAL: 24 de diciembre al 6 de enero (14 días)
    const fechaInicio = new Date(Date.UTC(añoActual, 11, 24, 0, 0, 0)) // 24 de diciembre
    const fechaFin = new Date(Date.UTC(añoActual + (mes === 12 ? 0 : 1), 0, 6, 23, 59, 59)) // 6 de enero
    
    // Verificar si estamos en el período navideño especial
    if (horaMexico < fechaInicio) {
        const diasParaInicio = Math.ceil((fechaInicio - horaMexico) / (1000 * 60 * 60 * 24))
        return conn.reply(m.chat, 
            `🎄 *¡El calendario navideño especial aún no ha comenzado!*\n\n⏰ *Hora México:* ${hora}:${minutos.toString().padStart(2, '0')}\n📅 Faltan *${diasParaInicio} días* para que comience el calendario especial.\n\n✨ Comienza el *24 de diciembre* hasta el *6 de enero*.`, 
            m
        )
    }
    
    if (horaMexico > fechaFin) {
        return conn.reply(m.chat, 
            `🎅 *¡El calendario navideño especial ha terminado!*\n\n⏰ *Hora México:* ${hora}:${minutos.toString().padStart(2, '0')}\nEl calendario especial estuvo disponible del *24 de diciembre* al *6 de enero*.\n\n¡Nos vemos el próximo año! 🎁`, 
            m
        )
    }
    
    // Calcular día del calendario (1-14)
    let diaCalendario
    if (mes === 12) {
        // Del 24 al 31 de diciembre
        diaCalendario = dia - 23 // Día 1 = 24 de diciembre
    } else if (mes === 1) {
        // Del 1 al 6 de enero
        diaCalendario = dia + 8 // Día 8 = 1 de enero, Día 14 = 6 de enero
    }
    
    // Validar que esté entre 1 y 14
    if (diaCalendario < 1 || diaCalendario > 14) {
        return conn.reply(m.chat, 
            `❄️ *Error en el calendario*\n\n⏰ *Hora México:* ${hora}:${minutos.toString().padStart(2, '0')}\nEl calendario especial solo funciona del *24 de diciembre* al *6 de enero*.\n\nDía actual: ${dia}/${mes}`, 
            m
        )
    }
    
    // Verificar cooldown (24 horas)
    const cooldown = 24 * 60 * 60 * 1000 // 24 horas en milisegundos
    
    // Buscar si ya reclamó hoy
    const yaReclamoHoy = calendario.rewards[diaCalendario] && 
                         (Date.now() - calendario.lastClaim) < cooldown
    
    if (yaReclamoHoy) {
        const tiempoRestante = formatTime(calendario.lastClaim + cooldown - Date.now())
        return conn.reply(m.chat, 
            `⛄ *¡Ya reclamaste el regalo de hoy!*\n\n⏰ *Hora México:* ${hora}:${minutos.toString().padStart(2, '0')}\nDebes esperar *${tiempoRestante}* para reclamar el regalo del próximo día.\n\n📅 Día actual del calendario: *${diaCalendario}/14*`, 
            m
        )
    }
    
    // Verificar racha - debe ser el día siguiente al último reclamado
    const ultimoDiaReclamado = Object.keys(calendario.rewards).map(Number).sort((a,b) => b-a)[0]
    
    if (ultimoDiaReclamado) {
        if (diaCalendario === ultimoDiaReclamado + 1) {
            // Día consecutivo - mantener racha
            calendario.currentStreak = (calendario.currentStreak || 0) + 1
        } else if (diaCalendario > ultimoDiaReclamado + 1) {
            // Se saltó días - romper racha
            calendario.currentStreak = 1
        }
        // Si es el mismo día, ya fue manejado arriba
    } else {
        // Primer día del calendario
        calendario.currentStreak = 1
    }
    
    // Calcular recompensas base según el día
    const recompensaBase = calcularRecompensaEspecial(diaCalendario, mes, dia)
    
    // Bonus por racha (hasta 100% extra para 14 días)
    const bonusRacha = Math.min(calendario.currentStreak * 0.0714, 1.0) // 7.14% por día, máximo 100%
    
    // Recompensas base con bonus de racha
    let monedas = Math.floor(recompensaBase.monedas * (1 + bonusRacha))
    let experiencia = Math.floor(recompensaBase.experiencia * (1 + bonusRacha))
    let carbon = Math.floor(recompensaBase.carbon * (1 + bonusRacha))
    let cristalesHielo = Math.floor(recompensaBase.cristalesHielo * (1 + bonusRacha))
    let gemasCaramelo = Math.floor(recompensaBase.gemasCaramelo * (1 + bonusRacha))
    let nieveMagica = Math.floor(recompensaBase.nieveMagica * (1 + bonusRacha))
    let carbonFestivo = Math.floor(recompensaBase.carbonFestivo * (1 + bonusRacha))
    let espirituNavideno = Math.floor(recompensaBase.espirituNavideno * (1 + bonusRacha))
    
    // Bonus especial para días importantes
    let bonusEspecial = ''
    let bonusMultiplicador = 1
    
    if (diaCalendario === 1) { // 24 de diciembre - Nochebuena
        bonusMultiplicador = 3
        bonusEspecial = '🎄 *BONUS NOCHEBUENA x3*'
    } else if (diaCalendario === 2) { // 25 de diciembre - Navidad
        bonusMultiplicador = 4
        bonusEspecial = '🎅 *BONUS NAVIDAD x4*'
    } else if (diaCalendario === 8) { // 1 de enero - Año Nuevo
        bonusMultiplicador = 5
        bonusEspecial = '✨ *BONUS AÑO NUEVO x5*'
    } else if (diaCalendario === 14) { // 6 de enero - Reyes
        bonusMultiplicador = 6
        bonusEspecial = '👑 *BONUS DÍA DE REYES x6*'
        
        // VERIFICAR SI COMPLETÓ LOS 14 DÍAS PERFECTAMENTE
        if (calendario.currentStreak === 14 && !calendario.perfectStreakReward) {
            const bonusPerfecto = 1000000 // 1,000,000 de bonificación
            monedas += bonusPerfecto
            calendario.perfectStreakReward = true
            bonusEspecial += `\n🏆 *¡RACHA PERFECTA!* +¥1,000,000`
        }
    } else if (diaCalendario === 7) { // 31 de diciembre - Nochevieja
        bonusMultiplicador = 3.5
        bonusEspecial = '🎆 *BONUS NOCHEVIEJA x3.5*'
    }
    
    // Aplicar bonus especial
    monedas = Math.floor(monedas * bonusMultiplicador)
    experiencia = Math.floor(experiencia * bonusMultiplicador)
    carbon = Math.floor(carbon * bonusMultiplicador)
    cristalesHielo = Math.floor(cristalesHielo * bonusMultiplicador)
    gemasCaramelo = Math.floor(gemasCaramelo * bonusMultiplicador)
    nieveMagica = Math.floor(nieveMagica * bonusMultiplicador)
    carbonFestivo = Math.floor(carbonFestivo * bonusMultiplicador)
    espirituNavideno = Math.floor(espirituNavideno * bonusMultiplicador)
    
    // Actualizar usuario
    user.coin = (user.coin || 0) + monedas
    user.exp = (user.exp || 0) + experiencia
    user.coalStock = (user.coalStock || 0) + carbon
    user.iceCrystals = (user.iceCrystals || 0) + cristalesHielo
    user.candyGems = (user.candyGems || 0) + gemasCaramelo
    user.magicSnow = (user.magicSnow || 0) + nieveMagica
    user.festiveCoal = (user.festiveCoal || 0) + carbonFestivo
    user.christmasSpirit = (user.christmasSpirit || 0) + espirituNavideno
    
    // Actualizar calendario
    calendario.lastClaim = Date.now()
    calendario.totalDaysClaimed = (calendario.totalDaysClaimed || 0) + 1
    calendario.rewards[diaCalendario] = {
        fecha: `${dia}/${mes}/${añoActual}`,
        hora: `${hora}:${minutos.toString().padStart(2, '0')}`,
        monedas: monedas,
        experiencia: experiencia,
        recursos: {
            carbon: carbon,
            cristalesHielo: cristalesHielo,
            gemasCaramelo: gemasCaramelo,
            nieveMagica: nieveMagica,
            carbonFestivo: carbonFestivo
        },
        espirituNavideno: espirituNavideno,
        racha: calendario.currentStreak
    }
    
    // Guardar en historial
    calendario.claimHistory = calendario.claimHistory || []
    calendario.claimHistory.push({
        dia: diaCalendario,
        fecha: new Date().toISOString(),
        recompensa: { monedas, experiencia, recursos: recompensaBase }
    })
    
    // Preparar mensaje del calendario
    let mensajeCalendario = `🎄 *CALENDARIO NAVIDEÑO ESPECIAL ${añoActual}* 🎅\n`
    mensajeCalendario += `⏰ *Hora México:* ${hora}:${minutos.toString().padStart(2, '0')}\n`
    mensajeCalendario += `📅 Día: *${diaCalendario}/14* (${dia}/${mes})\n`
    mensajeCalendario += `🔥 Racha actual: *${calendario.currentStreak} días*\n`
    mensajeCalendario += `🎯 Días reclamados: *${calendario.totalDaysClaimed}/14*\n\n`
    
    if (bonusEspecial) {
        mensajeCalendario += `${bonusEspecial}\n\n`
    }
    
    mensajeCalendario += `✨ *¡RECOMPENSAS DEL DÍA!* ✨\n`
    mensajeCalendario += `💰 *Monedas:* ¥${monedas.toLocaleString()}\n`
    mensajeCalendario += `⭐ *Experiencia:* ${experiencia.toLocaleString()} XP\n`
    mensajeCalendario += `🎄 *Espíritu Navideño:* +${espirituNavideno}\n\n`
    
    mensajeCalendario += `⛏️ *RECURSOS MINEROS NAVIDEÑOS:*\n`
    if (carbon > 0) mensajeCalendario += `⚫ *Carbón:* ${carbon} unidades\n`
    if (cristalesHielo > 0) mensajeCalendario += `❄️ *Cristales de Hielo:* ${cristalesHielo}\n`
    if (gemasCaramelo > 0) mensajeCalendario += `🍬 *Gemas de Caramelo:* ${gemasCaramelo}\n`
    if (nieveMagica > 0) mensajeCalendario += `🌨️ *Nieve Mágica:* ${nieveMagica}\n`
    if (carbonFestivo > 0) mensajeCalendario += `🎁 *Carbón Festivo:* ${carbonFestivo} (para niños traviesos)\n`
    
    if (bonusRacha > 0) {
        mensajeCalendario += `\n🔥 *Bonus por racha:* +${Math.floor(bonusRacha * 100)}%\n`
    }
    
    // Mostrar progreso del calendario
    mensajeCalendario += `\n━━━━━━━━━━━━━━━━━━━━\n`
    mensajeCalendario += `📊 *PROGRESO DEL CALENDARIO*\n`
    
    // Mostrar días reclamados recientemente
    const diasReclamados = Object.keys(calendario.rewards).map(Number).sort((a,b) => a-b)
    if (diasReclamados.length > 0) {
        const ultimos3 = diasReclamados.slice(-3)
        mensajeCalendario += `Últimos días: ${ultimos3.map(d => `✅ ${d}`).join(' | ')}\n`
    }
    
    // Días especiales restantes
    const diasEspeciales = []
    if (diaCalendario < 1) diasEspeciales.push('🎄 Nochebuena (24) - x3')
    if (diaCalendario < 2) diasEspeciales.push('🎅 Navidad (25) - x4')
    if (diaCalendario < 7) diasEspeciales.push('🎆 Nochevieja (31) - x3.5')
    if (diaCalendario < 8) diasEspeciales.push('✨ Año Nuevo (1) - x5')
    if (diaCalendario < 14) diasEspeciales.push('👑 Reyes (6) - x6')
    
    if (diasEspeciales.length > 0) {
        mensajeCalendario += `\n🎁 *PRÓXIMOS DÍAS ESPECIALES:*\n${diasEspeciales.join('\n')}\n`
    }
    
    // Información del usuario
    mensajeCalendario += `\n━━━━━━━━━━━━━━━━━━━━\n`
    mensajeCalendario += `💰 *Tu saldo:* ¥${user.coin.toLocaleString()}\n`
    mensajeCalendario += `🎄 *Espíritu Navideño:* ${user.christmasSpirit || 0}\n`
    mensajeCalendario += `⚫ *Carbón:* ${user.coalStock || 0}\n`
    mensajeCalendario += `❄️ *Cristales de Hielo:* ${user.iceCrystals || 0}\n`
    mensajeCalendario += `🍬 *Gemas de Caramelo:* ${user.candyGems || 0}\n`
    mensajeCalendario += `🌨️ *Nieve Mágica:* ${user.magicSnow || 0}\n`
    mensajeCalendario += `🎁 *Carbón Festivo:* ${user.festiveCoal || 0}\n`
    
    // Mostrar próximo premio de racha perfecta
    if (diaCalendario < 14 && calendario.currentStreak === diaCalendario) {
        const diasFaltantes = 14 - diaCalendario
        mensajeCalendario += `\n🏆 *RACHA PERFECTA:* ${diasFaltantes} días para ganar *¥1,000,000* extra\n`
    }
    
    // Mostrar cooldown
    const tiempoSiguiente = formatTime(cooldown)
    mensajeCalendario += `⏰ *Próxima recompensa:* en ${tiempoSiguiente}\n`
    
    // Enviar mensaje
    await conn.reply(m.chat, mensajeCalendario, m)
    
    // Mensaje especial si completó racha perfecta
    if (diaCalendario === 14 && calendario.currentStreak === 14 && calendario.perfectStreakReward) {
        setTimeout(() => {
            conn.sendMessage(m.chat, {
                text: `🎊 *¡FELICIDADES!* 🎊\n\n¡Has completado los *14 días* del calendario navideño especial!\n\n🏆 Recompensa por racha perfecta: *¥1,000,000*\n✨ ¡Eres un verdadero campeón de la Navidad! 🎅`
            }, { quoted: m })
        }, 1500)
    }
}

// Función para calcular recompensas base para el período especial (14 días)
function calcularRecompensaEspecial(diaCalendario, mes, diaOriginal) {
    // RECURSOS MINEROS NAVIDEÑOS:
    // 1. Carbón (coalStock) - Para calentar el taller de Santa
    // 2. Cristales de Hielo (iceCrystals) - Para decoraciones mágicas
    // 3. Gemas de Caramelo (candyGems) - Para dulces especiales
    // 4. Nieve Mágica (magicSnow) - Para crear ambiente navideño
    // 5. Carbón Festivo (festiveCoal) - Versión decorativa para niños traviesos
    // 6. Espíritu Navideño (christmasSpirit) - Para habilidades especiales
    
    // Ajustes especiales por día del período especial
    const ajustes = {
        // Días de diciembre
        1: { // 24 dic - Nochebuena
            monedas: 10000, experiencia: 1000, 
            carbon: 150, cristalesHielo: 30, gemasCaramelo: 20, 
            nieveMagica: 25, carbonFestivo: 10, espirituNavideno: 25
        },
        2: { // 25 dic - Navidad
            monedas: 15000, experiencia: 1500, 
            carbon: 200, cristalesHielo: 40, gemasCaramelo: 30, 
            nieveMagica: 35, carbonFestivo: 15, espirituNavideno: 35
        },
        3: { // 26 dic
            monedas: 7000, experiencia: 700, 
            carbon: 80, cristalesHielo: 15, gemasCaramelo: 10, 
            nieveMagica: 12, carbonFestivo: 5, espirituNavideno: 15
        },
        4: { // 27 dic
            monedas: 8000, experiencia: 800, 
            carbon: 90, cristalesHielo: 18, gemasCaramelo: 12, 
            nieveMagica: 15, carbonFestivo: 6, espirituNavideno: 18
        },
        5: { // 28 dic
            monedas: 9000, experiencia: 900, 
            carbon: 100, cristalesHielo: 20, gemasCaramelo: 15, 
            nieveMagica: 18, carbonFestivo: 7, espirituNavideno: 20
        },
        6: { // 29 dic
            monedas: 10000, experiencia: 1000, 
            carbon: 110, cristalesHielo: 22, gemasCaramelo: 18, 
            nieveMagica: 20, carbonFestivo: 8, espirituNavideno: 22
        },
        7: { // 30 dic
            monedas: 12000, experiencia: 1200, 
            carbon: 130, cristalesHielo: 25, gemasCaramelo: 20, 
            nieveMagica: 22, carbonFestivo: 10, espirituNavideno: 25
        },
        8: { // 31 dic - Nochevieja
            monedas: 18000, experiencia: 1800, 
            carbon: 180, cristalesHielo: 35, gemasCaramelo: 25, 
            nieveMagica: 30, carbonFestivo: 12, espirituNavideno: 30
        },
        
        // Días de enero
        9: { // 1 ene - Año Nuevo
            monedas: 25000, experiencia: 2500, 
            carbon: 250, cristalesHielo: 50, gemasCaramelo: 40, 
            nieveMagica: 45, carbonFestivo: 20, espirituNavideno: 50
        },
        10: { // 2 ene
            monedas: 11000, experiencia: 1100, 
            carbon: 120, cristalesHielo: 24, gemasCaramelo: 16, 
            nieveMagica: 20, carbonFestivo: 9, espirituNavideno: 22
        },
        11: { // 3 ene
            monedas: 12000, experiencia: 1200, 
            carbon: 130, cristalesHielo: 26, gemasCaramelo: 18, 
            nieveMagica: 22, carbonFestivo: 10, espirituNavideno: 24
        },
        12: { // 4 ene
            monedas: 13000, experiencia: 1300, 
            carbon: 140, cristalesHielo: 28, gemasCaramelo: 20, 
            nieveMagica: 24, carbonFestivo: 11, espirituNavideno: 26
        },
        13: { // 5 ene
            monedas: 14000, experiencia: 1400, 
            carbon: 150, cristalesHielo: 30, gemasCaramelo: 22, 
            nieveMagica: 26, carbonFestivo: 12, espirituNavideno: 28
        },
        14: { // 6 ene - Reyes
            monedas: 30000, experiencia: 3000, 
            carbon: 300, cristalesHielo: 60, gemasCaramelo: 50, 
            nieveMagica: 55, carbonFestivo: 25, espirituNavideno: 100
        }
    }
    
    if (ajustes[diaCalendario]) {
        return ajustes[diaCalendario]
    }
    
    // Para otros días, usar fórmula base (no debería ocurrir)
    return {
        monedas: 5000 + (diaCalendario * 2000),
        experiencia: 500 + (diaCalendario * 200),
        carbon: 50 + (diaCalendario * 20),
        cristalesHielo: 10 + (diaCalendario * 5),
        gemasCaramelo: 8 + (diaCalendario * 4),
        nieveMagica: 10 + (diaCalendario * 6),
        carbonFestivo: 3 + (diaCalendario * 2),
        espirituNavideno: 15 + (diaCalendario * 3)
    }
}

function formatTime(ms) {
    const totalSec = Math.ceil(ms / 1000)
    const hours = Math.floor(totalSec / 3600)
    const minutes = Math.floor((totalSec % 3600) / 60)
    const seconds = totalSec % 60
    
    const parts = []
    if (hours > 0) parts.push(`${hours} hora${hours !== 1 ? 's' : ''}`)
    if (minutes > 0) parts.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`)
    if (seconds > 0) parts.push(`${seconds} segundo${seconds !== 1 ? 's' : ''}`)
    
    return parts.join(' ')
}

handler.help = ['calendario', 'adviento', 'calend']
handler.tags = ['economy', 'navidad', 'minería']
handler.command = ['calendario', 'adviento', 'calend', 'diario']
handler.group = true

export default handler