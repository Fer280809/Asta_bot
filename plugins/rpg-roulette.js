const handler = async (m, { conn, text, command, usedPrefix }) => {
  // Verificar economía activada con temática navideña
  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(
      `🎅 *¡Ruleta Navideña Bloqueada!* 🎰\n\nLos comandos de *Economía Navideña* están desactivados en este grupo.\n\nUn *Elfo Administrador* puede activarlos con:\n» *${usedPrefix}economy on*\n\n🦌 *¡Así podrás jugar en la Ruleta del Espíritu Navideño!* ✨`
    )
  }

  const users = global.db.data.users[m.sender]
  
  // Inicializar usuario si no existe
  if (!users) {
    global.db.data.users[m.sender] = { coin: 1000, exp: 0, health: 100, christmasSpirit: 0 }
    users = global.db.data.users[m.sender]
  }

  // Si no hay texto, mostrar ayuda navideña
  if (!text) {
    return conn.reply(m.chat,
      `🎰 *¡Ruleta del Espíritu Navideño!* 🎄\n\nDebes ingresar una cantidad de *${currency}* y apostar a un color festivo.\n\n*🎨 Colores navideños disponibles:*\n• *rojo* 🔴 (50% chance) - Ganas x2\n• *verde* 🟢 (30% chance) - Ganas x3\n• *dorado* 🟡 (15% chance) - Ganas x5\n• *plateado* ⚪ (5% chance) - Ganas x10\n\n*🎁 Ejemplos:*\n• *${usedPrefix + command} 500 rojo*\n• *${usedPrefix + command} 300 verde*\n• *${usedPrefix + command} 200 dorado*\n• *${usedPrefix + command} 100 plateado*\n\n*✨ Apuesta mínima:* 100 ${currency}\n*🎅 Bonus de diciembre:* +10% en ganancias`,
      m
    )
  }

  let args = text.trim().split(" ")
  
  // Validar formato
  if (args.length !== 2) {
    return conn.reply(m.chat,
      `🎄 *¡Formato incorrecto, duendecillo!* 🎅\n\nDebes ingresar la cantidad y luego el color navideño.\n\n*🎰 Ejemplo correcto:*\n*${usedPrefix + command} 1000 rojo*\n\n*🎨 Colores:* rojo, verde, dorado, plateado`,
      m
    )
  }

  let coin = parseInt(args[0])
  let colorOriginal = args[1].toLowerCase()
  let color = colorOriginal
  
  // Traducciones de colores
  const traducciones = {
    'red': 'rojo',
    'rojo': 'rojo',
    '🔴': 'rojo',
    'green': 'verde', 
    'verde': 'verde',
    '🟢': 'verde',
    'gold': 'dorado',
    'dorado': 'dorado',
    '🟡': 'dorado',
    'golden': 'dorado',
    'silver': 'plateado',
    'plateado': 'plateado',
    '⚪': 'plateado',
    'white': 'plateado'
  }
  
  // Convertir color
  if (traducciones[color]) {
    color = traducciones[color]
  }

  // Validar cantidad
  if (isNaN(coin) || coin <= 0) {
    return conn.reply(m.chat,
      `❄️ *¡Cantidad inválida!* 🎄\n\nPor favor, ingresa una cantidad válida de *${currency}* para apostar.\n\n*💰 Apuesta mínima:* 100 ${currency}\n*💎 Apuesta máxima:* 50,000 ${currency}`,
      m
    )
  }

  // Validar apuesta mínima y máxima
  const minBet = 100
  const maxBet = 50000
  
  if (coin < minBet) {
    return conn.reply(m.chat,
      `🎅 *¡Apuesta muy pequeña!* 🎰\n\nLa apuesta mínima en la *Ruleta Navideña* es *${minBet} ${currency}*.\n\n*💡 Consejo:* Empieza con 500 ${currency} para tener más oportunidades.`,
      m
    )
  }

  if (coin > maxBet) {
    return conn.reply(m.chat,
      `🎄 *¡Apuesta muy grande!* 🦌\n\nLa apuesta máxima permitida es *${maxBet.toLocaleString()} ${currency}*.\n\n*✨ Razón:* Santa quiere que todos tengan oportunidades de ganar.`,
      m
    )
  }

  // Validar color
  const coloresValidos = ['rojo', 'verde', 'dorado', 'plateado']
  if (!coloresValidos.includes(color)) {
    return conn.reply(m.chat,
      `🎨 *¡Color navideño inválido!* 🎄\n\nSolo puedes apostar a estos colores festivos:\n\n*🔴 rojo* - 50% chance (x2)\n*🟢 verde* - 30% chance (x3)\n*🟡 dorado* - 15% chance (x5)\n*⚪ plateado* - 5% chance (x10)\n\n*🎅 Ejemplo:* *${usedPrefix + command} 1000 rojo*`,
      m
    )
  }

  // Verificar fondos
  if (coin > users.coin) {
    const falta = coin - (users.coin || 0)
    return conn.reply(m.chat,
      `🍪 *¡No tienes suficientes galletas navideñas!* 🎄\n\n*💰 Tienes:* ${currency}${(users.coin || 0).toLocaleString()}\n*🎰 Necesitas:* ${currency}${coin.toLocaleString()}\n*❄️ Te faltan:* ${currency}${falta.toLocaleString()}\n\n*✨ Sugerencias de Santa:*\n1. Trabaja en el taller: *${usedPrefix}work*\n2. Reclama tu regalo diario: *${usedPrefix}daily*\n3. Juega cara o cruz: *${usedPrefix}cf*`,
      m
    )
  }

  // Bonus especial si es diciembre
  const esNavidad = new Date().getMonth() === 11
  const bonusNavidad = esNavidad ? 1.1 : 1 // 10% extra en diciembre
  const bonusSuerte = Math.random() < 0.05 // 5% de bonus de suerte

  // Probabilidades y multiplicadores para cada color
  const configRuleta = {
    'rojo': { prob: 0.50, mult: 2, emoji: '🔴' },
    'verde': { prob: 0.30, mult: 3, emoji: '🟢' },
    'dorado': { prob: 0.15, mult: 5, emoji: '🟡' },
    'plateado': { prob: 0.05, mult: 10, emoji: '⚪' }
  }

  // Girar la ruleta navideña
  let random = Math.random()
  let resultColor = ''
  let acumulado = 0

  for (const [colorName, config] of Object.entries(configRuleta)) {
    acumulado += config.prob
    if (random <= acumulado) {
      resultColor = colorName
      break
    }
  }

  const win = color === resultColor
  const multiplicador = configRuleta[resultColor].mult
  const emojiResultado = configRuleta[resultColor].emoji
  const emojiApuesta = configRuleta[color].emoji

  let ganancia = 0
  let espirituNavideno = 0
  let mensajeBonus = ''

  if (win) {
    // Cálculo de ganancia base
    ganancia = Math.floor(coin * multiplicador * bonusNavidad)
    
    // Bonus de suerte (5% chance)
    if (bonusSuerte) {
      const extra = Math.floor(ganancia * 0.5) // 50% extra
      ganancia += extra
      mensajeBonus = `\n🎁 *¡Bonus de Suerte Navideña!* +${currency}${extra.toLocaleString()}`
    }
    
    // Espíritu navideño por ganar
    espirituNavideno = Math.floor(coin / 100) + 5
    
    // Actualizar usuario
    users.coin += ganancia - coin // Sumar ganancia neta
    users.christmasSpirit = (users.christmasSpirit || 0) + espirituNavideno
  } else {
    // Perdió
    users.coin -= coin
    
    // Posibilidad de ganar algo de espíritu navideño (25% chance)
    if (Math.random() < 0.25) {
      espirituNavideno = Math.floor(Math.random() * 3) + 1
      users.christmasSpirit = (users.christmasSpirit || 0) + espirituNavideno
      mensajeBonus = `\n✨ *Al menos ganaste Espíritu Navideño:* +${espirituNavideno}`
    }
  }

  // Construir mensaje de resultado
  let mensaje = `🎰 *¡Ruleta del Espíritu Navideño!* 🎄\n\n`

  // Animación de giro (simulada)
  const giros = ['🔴', '🟢', '🟡', '⚪', '🔴', '🟢', '🟡']
  mensaje += `*La ruleta está girando...*\n`
  mensaje += `${giros.join(' → ')} → ${emojiResultado}\n\n`

  // Resultado
  mensaje += `${emojiResultado} *La ruleta cayó en: ${resultColor.toUpperCase()}*\n`
  mensaje += `${emojiApuesta} *Tu apuesta fue: ${color.toUpperCase()}*\n\n`

  if (win) {
    mensaje += `✨ *¡FELICIDADES! GANASTE* 🎉\n`
    mensaje += `💰 *Ganancia:* ${currency}${ganancia.toLocaleString()}\n`
    mensaje += `📈 *Multiplicador:* x${multiplicador}\n`
    mensaje += `🎄 *Espíritu Navideño:* +${espirituNavideno}\n`
    
    if (esNavidad) {
      mensaje += `🎅 *Bonus de Diciembre:* +10% en ganancias\n`
    }
    
    if (mensajeBonus) {
      mensaje += mensajeBonus
    }
    
    // Mensaje especial por color ganador
    if (resultColor === 'plateado') {
      mensaje += `\n🏆 *¡JACKPOT PLATEADO!* ¡Increíble!\nSolo el 5% de probabilidad. ¡Santa está impresionado!`
    } else if (resultColor === 'dorado') {
      mensaje += `\n⭐ *¡GRAN GANANCIA DORADA!*\nLos renos celebran tu victoria.`
    }
  } else {
    mensaje += `❄️ *Lo siento, perdiste* 🎅\n`
    mensaje += `💸 *Pérdida:* ${currency}${coin.toLocaleString()}\n`
    mensaje += `📉 *Multiplicador correcto:* x${multiplicador}\n`
    
    if (mensajeBonus) {
      mensaje += mensajeBonus
    } else {
      mensaje += `\n💡 *No te rindas!* La suerte navideña puede cambiar.\n`
    }
    
    // Consuelo navideño
    const consuelos = [
      'Los elfos creen en tu próxima apuesta.',
      'Santa te dará otra oportunidad.',
      'El espíritu navideño no se mide en ganancias.',
      'La próxima vez será mejor, ¡ánimo!',
      'Incluso Rudolph perdió algunas veces al principio.'
    ]
    mensaje += `🎁 *${consuelos[Math.floor(Math.random() * consuelos.length)]}*`
  }

  // Footer con estadísticas
  mensaje += `\n\n${'─'.repeat(35)}\n`
  mensaje += `💰 *Nuevo saldo:* ${currency}${users.coin.toLocaleString()}\n`
  mensaje += `✨ *Espíritu Navideño:* ${users.christmasSpirit || 0}\n`
  mensaje += `🎯 *Próxima apuesta:* Cuando quieras\n\n`

  // Probabilidades para próxima apuesta
  mensaje += `*🎲 Probabilidades:*\n`
  mensaje += `🔴 Rojo: 50% (x2) | 🟢 Verde: 30% (x3)\n`
  mensaje += `🟡 Dorado: 15% (x5) | ⚪ Plateado: 5% (x10)`

  // Enviar mensaje
  await conn.reply(m.chat, mensaje, m)

  // Efecto especial para ganancias grandes
  if (win && ganancia >= coin * 5) {
    setTimeout(() => {
      conn.sendMessage(m.chat, {
        text: `🎊 *¡GRAN VICTORIA NAVIDEÑA!* 🎄\n\nTu ganancia de ${currency}${ganancia.toLocaleString()} hará feliz a muchos niños esta Navidad. ¡Santa está orgulloso!`
      }, { quoted: m })
    }, 1500)
  }

  // Efecto especial si ganó plateado
  if (win && resultColor === 'plateado') {
    setTimeout(() => {
      conn.sendMessage(m.chat, {
        text: `🏆 *¡LEYENDA DE LA RULETA!* ⭐\n\n¡Has logrado el premio más difícil! Tu nombre será recordado en el Salón de la Fama Navideño. 🎅✨`
      }, { quoted: m })
    }, 2000)
  }
}

// Configuración del handler
handler.tags = ['economy', 'navidad', 'juegos']
handler.help = ['ruleta', 'roulette', 'rt', 'ruletanavidad', 'navidadroulette']
handler.command = ['ruleta', 'roulette', 'rt', 'ruletanavidad', 'navidadroulette', 'santaroulette', 'ruletanavideno']
handler.group = true
handler.limit = true

export default handler