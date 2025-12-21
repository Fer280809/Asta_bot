import { delay } from "@whiskeysockets/baileys"

const handler = async (m, { args, usedPrefix, command, conn }) => {
  // Verificar economía activada con temática navideña
  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(
      `🎅 *¡Máquina Tragamonedas Navideña Bloqueada!* 🎰\n\nLos comandos de *Economía Navideña* están desactivados en este grupo.\n\nUn *Elfo Administrador* puede activarlos con:\n» *${usedPrefix}economy on*\n\n🦌 *¡Así podrás jugar en las Tragamonedas del Taller de Santa!* 🎁`
    )
  }

  const users = global.db.data.users[m.sender]
  
  // Inicializar usuario si no existe
  if (!users) {
    global.db.data.users[m.sender] = { 
      coin: 1000, 
      exp: 0, 
      health: 100, 
      christmasSpirit: 0,
      lastslot: 0,
      slotWins: 0,
      slotLosses: 0
    }
    users = global.db.data.users[m.sender]
  }

  // Inicializar estadísticas de slots
  users.slotWins = users.slotWins || 0
  users.slotLosses = users.slotLosses || 0

  // Validar apuesta
  if (!args[0] || isNaN(args[0]) || parseInt(args[0]) <= 0) {
    return m.reply(
      `🎰 *¡Máquina Tragamonedas Navideña!* 🎄\n\nPor favor, ingresa la cantidad de *${currency}* que deseas apostar.\n\n*🎁 Ejemplos:*\n• *${usedPrefix + command} 500*\n• *${usedPrefix + command} 1000*\n• *${usedPrefix + command} 5000*\n\n*💰 Apuesta mínima:* 100 ${currency}\n*💎 Apuesta máxima:* 25,000 ${currency}\n\n*✨ Bonus de diciembre:* +15% en ganancias`
    )
  }

  const apuesta = parseInt(args[0])
  
  // Cooldown reducido para navidad
  const cooldownBase = 10000 // 10 segundos base
  const cooldown = new Date().getMonth() === 11 ? cooldownBase * 0.8 : cooldownBase // 20% menos en diciembre
  
  // Verificar cooldown
  if (Date.now() - users.lastslot < cooldown) {
    const restante = users.lastslot + cooldown - Date.now()
    return m.reply(
      `⏰ *¡Las campanas necesitan tiempo para repicar!* 🔔\n\nDebes esperar *${formatTime(restante)}* para jugar en las *Tragamonedas Navideñas* de nuevo.\n\n*🎅 Mientras tanto puedes:*\n• Jugar ruleta: *${usedPrefix}ruleta*\n• Jugar cara o cruz: *${usedPrefix}cf*\n• Hornear galletas: *${usedPrefix}cookies*`
    )
  }

  // Validar apuesta mínima y máxima
  const minBet = 100
  const maxBet = 25000
  
  if (apuesta < minBet) {
    return m.reply(
      `🎄 *¡Apuesta muy pequeña!* 🎰\n\nLa apuesta mínima en las *Tragamonedas Navideñas* es *${minBet} ${currency}*.\n\n*💡 Consejo:* Empieza con 500 ${currency} para tener más oportunidades de ganar.`
    )
  }

  if (apuesta > maxBet) {
    return m.reply(
      `🦌 *¡Apuesta muy grande!* 🎅\n\nLa apuesta máxima permitida es *${maxBet.toLocaleString()} ${currency}*.\n\n*✨ Razón:* Santa quiere que todos tengan oportunidades de ganar sin arriesgar demasiado.`
    )
  }

  // Verificar fondos
  if (users.coin < apuesta) {
    const falta = apuesta - (users.coin || 0)
    return m.reply(
      `🍪 *¡No tienes suficientes galletas navideñas!* 🎄\n\n*💰 Tienes:* ${currency}${(users.coin || 0).toLocaleString()}\n*🎰 Necesitas:* ${currency}${apuesta.toLocaleString()}\n*❄️ Te faltan:* ${currency}${falta.toLocaleString()}\n\n*✨ Sugerencias de Santa:*\n1. Trabaja en el taller: *${usedPrefix}work*\n2. Reclama tu regalo diario: *${usedPrefix}daily*\n3. Ve de cacería: *${usedPrefix}hunt*`
    )
  }

  // Emojis navideños para los slots
  const emojisNavidenos = ['🎄', '🎅', '🦌', '🎁', '🔔', '⭐', '❄️', '🍪']
  
  // Bonus especial si es diciembre
  const esNavidad = new Date().getMonth() === 11
  const bonusNavidad = esNavidad ? 1.15 : 1 // 15% extra en diciembre
  const bonusSuerte = Math.random() < 0.08 // 8% de bonus de suerte

  // Función para obtener emojis aleatorios
  const getRandomEmojis = () => {
    const x = Array.from({ length: 3 }, () => emojisNavidenos[Math.floor(Math.random() * emojisNavidenos.length)])
    const y = Array.from({ length: 3 }, () => emojisNavidenos[Math.floor(Math.random() * emojisNavidenos.length)])
    const z = Array.from({ length: 3 }, () => emojisNavidenos[Math.floor(Math.random() * emojisNavidenos.length)])
    return { x, y, z }
  }

  // Texto inicial con estilo navideño
  const initialText = `🎰 *¡TRAGAMONEDAS NAVIDEÑAS!* 🎄\n${'─'.repeat(30)}\n🎄 🎅 🦌\n🎁 🔔 ⭐\n❄️ 🍪 ✨\n${'─'.repeat(30)}\n*¡Gira la ruleta de la suerte navideña!*`
  
  let { key } = await conn.sendMessage(m.chat, { text: initialText }, { quoted: m })

  // Animación de los slots con estilo navideño
  const animateSlots = async () => {
    const frames = 6 // Número de frames de animación
    
    for (let i = 0; i < frames; i++) {
      const { x, y, z } = getRandomEmojis()
      const animationText = `🎰 *¡TRAGAMONEDAS NAVIDEÑAS!* 🎄\n${'─'.repeat(30)}\n${x[0]} : ${y[0]} : ${z[0]}\n${x[1]} : ${y[1]} : ${z[1]}\n${x[2]} : ${y[2]} : ${z[2]}\n${'─'.repeat(30)}\n*¡Girando... ${'🎄'.repeat(i+1)}${'  '.repeat(frames-i-1)}*`
      
      await conn.sendMessage(m.chat, { text: animationText, edit: key }, { quoted: m })
      await delay(350 - (i * 50)) // Cada vez más rápido
    }
  }

  // Ejecutar animación
  await animateSlots()

  // Resultado final
  const { x, y, z } = getRandomEmojis()
  
  // Determinar resultado
  let ganancia = 0
  let espirituNavideno = 0
  let resultado = ''
  let multiplicador = 0
  let mensajeBonus = ''

  // Comprobar combinaciones ganadoras
  const fila1 = [x[0], y[0], z[0]]
  const fila2 = [x[1], y[1], z[1]]
  const fila3 = [x[2], y[2], z[2]]

  // Función para verificar combinación
  const checkCombinacion = (fila) => {
    // Jackpot: 3 iguales
    if (fila[0] === fila[1] && fila[1] === fila[2]) {
      return { tipo: 'jackpot', multiplicador: 10 }
    }
    // 2 iguales
    if (fila[0] === fila[1] || fila[0] === fila[2] || fila[1] === fila[2]) {
      return { tipo: 'par', multiplicador: 2 }
    }
    // Secuencia especial (por ejemplo, 🎄🎅🦌)
    const secuenciasEspeciales = [
      ['🎄', '🎅', '🦌'],
      ['🎁', '🔔', '⭐'],
      ['❄️', '🍪', '✨']
    ]
    for (const secuencia of secuenciasEspeciales) {
      if (fila[0] === secuencia[0] && fila[1] === secuencia[1] && fila[2] === secuencia[2]) {
        return { tipo: 'secuencia', multiplicador: 5 }
      }
    }
    return null
  }

  // Verificar cada fila
  const resultadosFilas = [
    { fila: 1, resultado: checkCombinacion(fila1) },
    { fila: 2, resultado: checkCombinacion(fila2) },
    { fila: 3, resultado: checkCombinacion(fila3) }
  ].filter(f => f.resultado !== null)

  if (resultadosFilas.length > 0) {
    // Tomar el mejor resultado (jackpot > secuencia > par)
    const mejorResultado = resultadosFilas.reduce((mejor, actual) => {
      const orden = { jackpot: 3, secuencia: 2, par: 1 }
      return orden[actual.resultado.tipo] > orden[mejor.resultado.tipo] ? actual : mejor
    })

    const { tipo, multiplicador: mult } = mejorResultado.resultado
    multiplicador = mult
    
    // Cálculo base
    ganancia = Math.floor(apuesta * multiplicador * bonusNavidad)
    
    // Bonus de suerte (8% chance)
    if (bonusSuerte) {
      const extra = Math.floor(ganancia * 0.3) // 30% extra
      ganancia += extra
      mensajeBonus = `\n🎁 *¡Bonus de Suerte Navideña!* +${currency}${extra.toLocaleString()}`
    }
    
    // Espíritu navideño por ganar
    espirituNavideno = Math.floor(apuesta / 50) + (multiplicador * 2)
    
    // Mensajes según tipo de ganancia
    switch (tipo) {
      case 'jackpot':
        resultado = `🎊 *¡JACKPOT NAVIDEÑO!* 🏆\n¡Tres ${fila1[0]} en la fila ${mejorResultado.fila}!`
        espirituNavideno += 20 // Bonus extra por jackpot
        break
      case 'secuencia':
        resultado = `✨ *¡SECUENCIA ESPECIAL!* ⭐\nCombinación navideña perfecta en fila ${mejorResultado.fila}!`
        espirituNavideno += 10 // Bonus extra por secuencia
        break
      case 'par':
        resultado = `🎉 *¡COMBO NAVIDEÑO!* 🎄\nDos símbolos iguales en fila ${mejorResultado.fila}!`
        break
    }

    // Actualizar usuario
    users.coin += ganancia - apuesta // Sumar ganancia neta
    users.christmasSpirit = (users.christmasSpirit || 0) + espirituNavideno
    users.slotWins++
    
  } else {
    // Perdió
    users.coin -= apuesta
    users.slotLosses++
    
    // Posibilidad de ganar algo de espíritu navideño (20% chance)
    if (Math.random() < 0.2) {
      espirituNavideno = Math.floor(Math.random() * 5) + 1
      users.christmasSpirit = (users.christmasSpirit || 0) + espirituNavideno
      mensajeBonus = `\n✨ *Al menos ganaste Espíritu Navideño:* +${espirituNavideno}`
    }
    
    resultado = `❄️ *¡Mejor suerte la próxima vez!* 🎅\nNo hubo combinaciones ganadoras esta vez.`
  }

  users.lastslot = Date.now()

  // Construir mensaje final
  const finalText = `🎰 *¡TRAGAMONEDAS NAVIDEÑAS!* 🎄\n${'─'.repeat(30)}\n${x[0]} : ${y[0]} : ${z[0]}\n${x[1]} : ${y[1]} : ${z[1]}\n${x[2]} : ${y[2]} : ${z[2]}\n${'─'.repeat(30)}\n`

  let mensajeResultado = finalText + resultado + '\n\n'

  if (multiplicador > 0) {
    mensajeResultado += `💰 *Ganancia:* ${currency}${ganancia.toLocaleString()}\n`
    mensajeResultado += `📈 *Multiplicador:* x${multiplicador}\n`
    mensajeResultado += `🎄 *Espíritu Navideño:* +${espirituNavideno}\n`
    
    if (esNavidad) {
      mensajeResultado += `🎅 *Bonus de Diciembre:* +15% en ganancias\n`
    }
    
    if (mensajeBonus) {
      mensajeResultado += mensajeBonus
    }
    
    // Estadísticas personales
    const totalJuegos = users.slotWins + users.slotLosses
    const porcentajeVictoria = totalJuegos > 0 ? Math.round((users.slotWins / totalJuegos) * 100) : 0
    
    mensajeResultado += `\n📊 *Tus estadísticas:*\n`
    mensajeResultado += `🎮 *Juegos totales:* ${totalJuegos}\n`
    mensajeResultado += `✅ *Victorias:* ${users.slotWins} (${porcentajeVictoria}%)\n`
    mensajeResultado += `❌ *Derrotas:* ${users.slotLosses}\n`
  } else {
    mensajeResultado += `💸 *Pérdida:* ${currency}${apuesta.toLocaleString()}\n`
    
    if (mensajeBonus) {
      mensajeResultado += mensajeBonus
    } else {
      // Consuelo navideño aleatorio
      const consuelos = [
        'Los renos creen en tu próxima jugada.',
        'Santa te dará otra oportunidad.',
        'El espíritu navideño no se mide en monedas.',
        'La próxima vez la suerte estará de tu lado.',
        'Incluso los elfos pierden a veces.'
      ]
      mensajeResultado += `\n🎁 *${consuelos[Math.floor(Math.random() * consuelos.length)]}*\n`
    }
  }

  // Footer con información
  mensajeResultado += `\n${'─'.repeat(30)}\n`
  mensajeResultado += `💰 *Nuevo saldo:* ${currency}${users.coin.toLocaleString()}\n`
  mensajeResultado += `✨ *Espíritu Navideño:* ${users.christmasSpirit || 0}\n`
  mensajeResultado += `⏰ *Próxima jugada:* en ${formatTime(cooldown)}\n\n`
  
  // Información de combinaciones
  mensajeResultado += `*🎯 Combinaciones ganadoras:*\n`
  mensajeResultado += `🎄🎄🎄 = x10 | 🎄🎅🦌 = x5\n`
  mensajeResultado += `🎁🎁🎁 = x10 | Cualquier par = x2`

  // Enviar mensaje final
  await conn.sendMessage(m.chat, { text: mensajeResultado, edit: key }, { quoted: m })

  // Efecto especial para jackpots
  if (multiplicador === 10) {
    setTimeout(() => {
      conn.sendMessage(m.chat, {
        text: `🏆 *¡LEYENDA DE LAS TRAGAMONEDAS!* ⭐\n\n¡JACKPOT NAVIDEÑO! Tu nombre será grabado en el Libro de Oro de Santa. ¡Felicidades! 🎅✨`
      }, { quoted: m })
    }, 1500)
  }

  // Efecto especial para primera victoria del día
  const hoy = new Date().toDateString()
  if (!users.ultimaVictoriaSlot || users.ultimaVictoriaSlot !== hoy) {
    if (multiplicador > 0) {
      users.ultimaVictoriaSlot = hoy
      setTimeout(() => {
        conn.sendMessage(m.chat, {
          text: `🎉 *¡PRIMERA VICTORIA DEL DÍA!* 🎄\n\n¡Felicidades por tu primera victoria navideña hoy!\nLos elfos están celebrando tu suerte. 🦌✨`
        }, { quoted: m })
      }, 2000)
    }
  }
}

// Configuración del handler
handler.help = ['slot <apuesta>', 'slots', 'tragamonedas', 'maquinanavidad']
handler.tags = ['economy', 'navidad', 'juegos']
handler.command = ['slot', 'slots', 'tragamonedas', 'maquinanavidad', 'navidadslot', 'santaslots']
handler.group = true
handler.limit = true

export default handler

// Función para formatear el tiempo con estilo navideño
function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60
  const partes = []
  
  if (minutes > 0) partes.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`)
  partes.push(`${seconds} segundo${seconds !== 1 ? 's' : ''}`)
  
  return partes.join(' ')
}