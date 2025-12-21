var handler = async (m, { conn, usedPrefix }) => {
  // Verificar economía activada con temática navideña
  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(
      `🎅 *¡Calendario de Adviento Bloqueado!* 🗓️\n\nLos comandos de *Economía Navideña* están desactivados en este grupo.\n\nUn *Elfo Administrador* puede activarlos con:\n» *${usedPrefix}economy on*\n\n🦌 *¡Así podrás recibir tu regalo mensual navideño!* 🎁`
    )
  }

  let user = global.db.data.users[m.sender]
  
  // Tiempo de espera (30 días - Calendario de Adviento extendido)
  const gap = 2592000000 // 30 días en milisegundos
  
  // Bonus especial si es diciembre
  const esNavidad = new Date().getMonth() === 11
  const bonusNavidad = esNavidad ? 1.5 : 1 // 50% extra en diciembre
  
  const now = Date.now()

  // Inicializar propiedades navideñas
  user.monthlyStreak = user.monthlyStreak || 0
  user.lastMonthlyGlobal = user.lastMonthlyGlobal || 0
  user.coin = user.coin || 0
  user.exp = user.exp || 0
  user.lastmonthly = user.lastmonthly || 0
  user.christmasSpirit = user.christmasSpirit || 0
  user.advientoDays = user.advientoDays || 0 // Nuevo: días de adviento completados

  // Verificar si ya reclamó este mes
  if (now < user.lastmonthly) {
    const wait = formatTime(Math.floor((user.lastmonthly - now) / 1000))
    return conn.reply(m.chat,
      `⏰ *¡Calendario de Adviento Cerrado!* 🗓️\n\nYa has abierto la puerta de este mes en tu *Calendario de Adviento Navideño*.\n\n✨ *Podrás abrir la próxima puerta en:*\n*${wait}*\n\n🎄 *Consejo:* ¡Marca la fecha en tu calendario para no perder tu racha!`,
      m
    )
  }

  // Verificar si perdió la racha (1.5 veces el tiempo)
  const lost = user.monthlyStreak >= 1 && now - user.lastMonthlyGlobal > gap * 1.5
  if (lost) {
    user.monthlyStreak = 0
    user.advientoDays = 0 // Reiniciar días de adviento también
  }

  // Verificar si puede reclamar globalmente (cada 30 días)
  const canClaimGlobal = now - user.lastMonthlyGlobal >= gap
  if (canClaimGlobal) {
    user.monthlyStreak = Math.min(user.monthlyStreak + 1, 24) // Ahora hasta 24 (días de adviento)
    user.lastMonthlyGlobal = now
    user.advientoDays = (user.advientoDays || 0) + 1
  }

  // Calcular recompensas con bonus navideño
  const coinsBase = Math.min(60000 + (user.monthlyStreak - 1) * 5000, 95000)
  const coins = Math.floor(coinsBase * bonusNavidad)
  
  const expRandom = Math.floor(Math.random() * (500 - 100 + 1)) + 100
  const exp = Math.floor(expRandom * bonusNavidad)
  
  const espirituNavideno = Math.floor(Math.random() * 50) + 25
  
  // Bonus especial por racha larga
  let bonusRacha = 0
  let mensajeRacha = ''
  if (user.monthlyStreak >= 12) {
    bonusRacha = Math.floor(coins * 0.2) // 20% extra por 12+ meses
    mensajeRacha = `\n🎖️ *Bonus por Fidelidad Navideña:* +${currency}${bonusRacha.toLocaleString()}`
  }

  // Recompensas totales
  const totalCoins = coins + bonusRacha
  const totalExp = exp
  const totalEspiritu = espirituNavideno

  // Aplicar recompensas
  user.coin += totalCoins
  user.exp += totalExp
  user.christmasSpirit = (user.christmasSpirit || 0) + totalEspiritu
  user.lastmonthly = now + gap

  // Determinar puerta del adviento actual
  const puertaAdviento = (user.monthlyStreak % 24) || 24
  
  // Preparar mensaje de éxito
  let mensaje = ``
  
  // Encabezado según el mes
  if (esNavidad) {
    mensaje += `🎄 *¡FELIZ NAVIDAD!* 🎅\n`
    mensaje += `🎁 *CALENDARIO DE ADVIENTO MENSUAL* 🗓️\n\n`
  } else {
    mensaje += `✨ *CALENDARIO DE ADVIENTO PERMANENTE* 🎄\n\n`
  }

  // Puerta del adviento
  mensaje += `🚪 *Puerta #${puertaAdviento} del Adviento*\n`
  mensaje += `📅 *Mes consecutivo:* ${user.monthlyStreak}\n`
  mensaje += `🗓️ *Días totales de Adviento:* ${user.advientoDays}\n\n`

  // Recompensas obtenidas
  mensaje += `💰 *Regalos navideños:* ${currency}${totalCoins.toLocaleString()}\n`
  mensaje += `⭐ *Experiencia:* ${totalExp.toLocaleString()} XP\n`
  mensaje += `✨ *Espíritu Navideño:* +${totalEspiritu.toLocaleString()}\n`

  if (bonusNavidad > 1) {
    mensaje += `🎅 *Bonus de Diciembre:* x1.5 en recompensas!\n`
  }

  if (mensajeRacha) {
    mensaje += mensajeRacha
  }

  // Si perdió la racha
  if (lost) {
    mensaje += `\n⚠️ *¡Has perdido tu racha navideña!*\n`
    mensaje += `No abriste el calendario a tiempo. Comienza de nuevo.\n`
  }

  // Próxima puerta
  const nextCoins = Math.min(60000 + user.monthlyStreak * 5000, 95000)
  mensaje += `\n🎯 *Próxima puerta (#${(puertaAdviento % 24) + 1}):*\n`
  mensaje += `> Recompensa: *${currency}${nextCoins.toLocaleString()}*\n`
  mensaje += `> En: *30 días*\n`

  // Barra de progreso de adviento
  const progreso = Math.min(user.advientoDays, 24)
  const porcentaje = Math.floor((progreso / 24) * 100)
  const barrasLlenas = Math.floor(porcentaje / 4.16) // 24 barras
  const barrasVacias = 24 - barrasLlenas
  const barra = '▰'.repeat(barrasLlenas) + '▱'.repeat(barrasVacias)
  
  mensaje += `\n📊 *Progreso del Adviento:*\n`
  mensaje += `[${barra}] ${progreso}/24 días (${porcentaje}%)\n`

  // Mensaje especial según el progreso
  if (progreso >= 24) {
    mensaje += `🏆 *¡Calendario de Adviento Completo!*\n¡Has abierto todas las puertas del año! 🎉\n`
  } else if (progreso >= 12) {
    mensaje += `🌟 *¡Mitad del camino!* Sigue así.\n`
  } else if (progreso >= 6) {
    mensaje += `⭐ *¡Buen comienzo!* La Navidad se acerca.\n`
  }

  // Footer con mensaje navideño
  mensaje += `\n${'─'.repeat(35)}\n`
  
  const mensajesNavidenos = [
    'La Navidad no está en la fecha, sino en el corazón.',
    'El mejor regalo de Navidad es tenerte en nuestra comunidad.',
    'Que el espíritu navideño te acompañe todo el año.',
    'Cada puerta del adviento acerca la magia de la Navidad.',
    'La verdadera Navidad está en compartir y ser agradecido.'
  ]
  
  const mensajeAleatorio = mensajesNavidenos[Math.floor(Math.random() * mensajesNavidenos.length)]
  mensaje += `💝 *"${mensajeAleatorio}"*\n\n`
  mensaje += `🎄 *¡Feliz Navidad y próspero año nuevo!* 🎅`

  // Enviar mensaje
  await conn.reply(m.chat, mensaje, m)

  // Efecto especial para rachas importantes
  if (user.monthlyStreak % 12 === 0 && user.monthlyStreak > 0) {
    setTimeout(() => {
      conn.sendMessage(m.chat, {
        text: `🎖️ *¡ANIVERSARIO NAVIDEÑO!* 🎉\n\n¡Felicidades! Has cumplido *${user.monthlyStreak} meses* consecutivos.\n\nSanta te ha agregado a su *"Lista de los Más Fieles"* 🎅✨`
      }, { quoted: m })
    }, 1500)
  }

  // Efecto especial si es diciembre y primera vez del año
  if (esNavidad && user.monthlyStreak === 1) {
    setTimeout(() => {
      conn.sendMessage(m.chat, {
        text: `🎅 *¡PRIMERA NAVIDAD CONTIGO!* 🎄\n\n¡Qué alegría tenerte en esta Navidad!\nSanta te envía un abrazo especial y doble espíritu navideño. 🦌✨`
      }, { quoted: m })
    }, 2000)
  }
}

// Configuración del handler
handler.help = ['monthly', 'mensual', 'adviento', 'calendario', 'regalomensual']
handler.tags = ['economy', 'navidad', 'recompensas']
handler.command = ['monthly', 'mensual', 'adviento', 'calendario', 'regalomensual', 'navidadmonthly', 'santacalendar', 'advientomensual']
handler.group = true
handler.limit = false

export default handler

// Función para formatear el tiempo (mantenida con estilo navideño)
function formatTime(t) {
  const d = Math.floor(t / 86400)
  const h = Math.floor((t % 86400) / 3600)
  const m = Math.floor((t % 3600) / 60)
  const s = t % 60
  
  const partes = []
  
  if (d) {
    partes.push(`🎄 ${d} día${d !== 1 ? 's' : ''}`)
    if (h) partes.push(`⏰ ${h} hora${h !== 1 ? 's' : ''}`)
  } else if (h) {
    partes.push(`⏰ ${h} hora${h !== 1 ? 's' : ''}`)
    if (m) partes.push(`❄️ ${m} minuto${m !== 1 ? 's' : ''}`)
  } else if (m) {
    partes.push(`❄️ ${m} minuto${m !== 1 ? 's' : ''}`)
    if (s) partes.push(`⏱️ ${s} segundo${s !== 1 ? 's' : ''}`)
  } else {
    partes.push(`⏱️ ${s} segundo${s !== 1 ? 's' : ''}`)
  }
  
  return partes.join(' ')
}