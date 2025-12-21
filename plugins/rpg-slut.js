let handler = async (m, { conn, usedPrefix, command }) => {
  // Verificar economía activada con temática navideña
  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(
      `🎅 *¡Fiestas Navideñas Bloqueadas!* 🎄\n\nLos comandos de *Economía Navideña* están desactivados en este grupo.\n\nUn *Elfo Administrador* puede activarlos con:\n» *${usedPrefix}economy on*\n\n🦌 *¡Así podrás participar en las celebraciones navideñas!* 🎉`
    )
  }

  let user = global.db.data.users[m.sender]
  
  // Inicializar usuario si no existe
  if (!user) {
    global.db.data.users[m.sender] = { 
      coin: 1000, 
      exp: 0, 
      health: 100, 
      christmasSpirit: 0,
      lastCelebration: 0,
      celebrationStreak: 0
    }
    user = global.db.data.users[m.sender]
  }

  user.lastCelebration = user.lastCelebration || 0
  user.celebrationStreak = user.celebrationStreak || 0
  
  // Bonus especial si es diciembre (cooldown reducido)
  const esNavidad = new Date().getMonth() === 11
  const cooldownBase = 5 * 60 * 1000 // 5 minutos base
  const cooldown = esNavidad ? cooldownBase * 0.7 : cooldownBase // 30% menos en diciembre

  if (Date.now() < user.lastCelebration) {
    const restante = user.lastCelebration - Date.now()
    const tiempoRestante = formatTime(restante)
    return conn.reply(m.chat,
      `⏰ *¡Las fiestas necesitan tiempo para organizarse!* 🎄\n\nDebes esperar *${tiempoRestante}* para participar en las *Celebraciones Navideñas* de nuevo.\n\n*🎅 Mientras tanto puedes:*\n• Hornear galletas: *${usedPrefix}cookies*\n• Cantar villancicos: *${usedPrefix}carols*\n• Decorar el árbol: *${usedPrefix}decorate*`,
      m
    )
  }

  user.lastCelebration = Date.now() + cooldown
  
  // Aumentar racha de celebraciones
  user.celebrationStreak = (user.celebrationStreak || 0) + 1
  
  // Bonus de diciembre (más chance de éxito)
  const chanceBase = 0.7 // 70% base de éxito
  const chanceExito = esNavidad ? chanceBase * 1.25 : chanceBase // 25% más en diciembre
  
  const exito = Math.random() < chanceExito
  const tipo = exito ? 'victoria' : 'derrota'
  
  // Seleccionar evento apropiado
  const evento = exito ? 
    pickRandom(celebracionesNavidenas.filter(e => e.tipo === 'victoria')) :
    pickRandom(celebracionesNavidenas.filter(e => e.tipo === 'derrota'))

  let cantidad, experiencia, espirituNavideno, alegria, bonusRacha
  
  // Bonus de diciembre (valores aumentados)
  const multiplicadorNavidad = esNavidad ? 1.4 : 1

  // Bonus por racha de celebraciones
  const bonusPorRacha = Math.min(Math.floor(user.celebrationStreak / 3) * 0.1, 0.5) // Hasta 50% extra

  if (exito) {
    // Éxito en celebración
    cantidad = Math.floor((Math.random() * 1501 + 4000) * multiplicadorNavidad * (1 + bonusPorRacha))
    experiencia = Math.floor((Math.random() * 101 + 50) * multiplicadorNavidad)
    espirituNavideno = Math.floor((Math.random() * 20 + 10) * multiplicadorNavidad)
    alegria = Math.floor(Math.random() * 5) + 3
    bonusRacha = Math.floor(cantidad * bonusPorRacha)
    
    user.coin += cantidad
    user.exp = (user.exp || 0) + experiencia
    user.christmasSpirit = (user.christmasSpirit || 0) + espirituNavideno
    user.health = Math.min(100, (user.health || 100) + alegria)
    
  } else {
    // Fracaso en celebración
    cantidad = Math.floor((Math.random() * 1001 + 3000) * 0.6) // 40% menos pérdida
    experiencia = Math.floor((Math.random() * 51 + 20) * 0.5)
    alegria = Math.floor(Math.random() * 3) + 1
    
    // Posibilidad de ganar algo positivo (40% chance)
    if (Math.random() < 0.4) {
      espirituNavideno = Math.floor(Math.random() * 8) + 3
      user.christmasSpirit = (user.christmasSpirit || 0) + espirituNavideno
    }
    
    user.coin = Math.max(0, (user.coin || 0) - cantidad)
    user.exp = Math.max(0, (user.exp || 0) - experiencia)
    user.health = Math.max(0, (user.health || 100) - alegria)
    
    // Perder racha si falla
    user.celebrationStreak = 0
  }

  // Construir mensaje navideño
  let mensaje = `🎉 *¡Celebración Navideña!* 🎄\n\n`
  mensaje += `${evento.mensaje}\n\n`

  if (exito) {
    mensaje += `✨ *¡Fiesta Exitosa!*\n`
    mensaje += `💰 *Regalos obtenidos:* ${currency}${cantidad.toLocaleString()}\n`
    mensaje += `⭐ *Experiencia:* ${experiencia.toLocaleString()} XP\n`
    mensaje += `🎄 *Espíritu Navideño:* +${espirituNavideno}\n`
    mensaje += `❤️ *Alegría navideña:* +${alegria}\n`
    
    if (bonusPorRacha > 0) {
      mensaje += `🏆 *Bonus por racha (${user.celebrationStreak}):* +${Math.round(bonusPorRacha * 100)}% (${currency}${bonusRacha.toLocaleString()})\n`
    }
    
    if (multiplicadorNavidad > 1) {
      mensaje += `🎅 *Bonus de Diciembre:* x1.4 en recompensas!\n`
    }
    
    // Mensaje especial para celebraciones muy exitosas
    if (cantidad > 7000) {
      mensaje += `🎊 *¡Gran celebración!* Los elfos están bailando contigo.\n`
    }
    
    // Mensaje especial por racha alta
    if (user.celebrationStreak >= 5) {
      mensaje += `🔥 *¡Racha de ${user.celebrationStreak} celebraciones exitosas!*\n`
    }
    
  } else {
    mensaje += `❄️ *¡La celebración fue complicada!*\n`
    mensaje += `🦌 *Regalos perdidos:* ${currency}${cantidad.toLocaleString()}\n`
    mensaje += `📉 *Experiencia perdida:* ${experiencia.toLocaleString()} XP\n`
    mensaje += `❤️ *Alegría navideña:* -${alegria}\n`
    
    if (espirituNavideno) {
      mensaje += `✨ *Al menos ganaste Espíritu Navideño:* +${espirituNavideno}\n`
    }
    
    // Mensaje alentador
    mensaje += `💡 *No te preocupes!* Hay muchas más fiestas navideñas por venir.\n`
  }

  // Footer con estadísticas
  mensaje += `\n━━━━━━━━━━━━━━━━━━━━\n`
  mensaje += `💰 *Cartera:* ${currency}${user.coin.toLocaleString()}\n`
  mensaje += `🎯 *Experiencia:* ${user.exp.toLocaleString()} XP\n`
  mensaje += `❤️ *Alegría navideña:* ${user.health}/100\n`
  mensaje += `✨ *Espíritu Navideño:* ${user.christmasSpirit || 0}\n`
  mensaje += `🎉 *Racha de celebraciones:* ${user.celebrationStreak}\n`
  mensaje += `⏰ *Próxima celebración:* en ${formatTime(cooldown)}\n\n`
  
  // Consejo navideño aleatorio
  const consejos = [
    'Las mejores fiestas son las que se comparten con amigos.',
    'La alegría navideña se multiplica cuando la compartes.',
    'Un corazón festivo atrae más celebraciones.',
    'La Navidad es tiempo de bailar, cantar y celebrar.',
    'Cada celebración fortalece el espíritu navideño.',
    'Los mejores recuerdos navideños se crean en las fiestas.',
    'Celebrar juntos es la verdadera magia de la Navidad.'
  ]
  
  mensaje += `💡 *Consejo festivo:* ${pickRandom(consejos)}`

  await conn.reply(m.chat, mensaje, m)
  
  // Efecto especial para celebraciones muy exitosas
  if (exito && cantidad > 8000) {
    setTimeout(() => {
      conn.sendMessage(m.chat, {
        text: `🎊 *¡FIESTA LEGENDARIA!* 🏆\n\nTu celebración navideña ha sido registrada en los anales del Polo Norte. ¡Los renos todavía están bailando! 🦌✨`
      }, { quoted: m })
    }, 1000)
  }

  // Efecto especial por racha de 10 celebraciones
  if (exito && user.celebrationStreak === 10) {
    setTimeout(() => {
      conn.sendMessage(m.chat, {
        text: `🎖️ *¡DÉCIMA CELEBRACIÓN CONSECUTIVA!* 🎉\n\nHas alcanzado 10 celebraciones navideñas exitosas. ¡Santa te otorga el título de "Rey/Reyna de la Fiesta Navideña"! 👑🎄`
      }, { quoted: m })
    }, 1500)
  }
}

// Configuración del handler (manteniendo comandos originales)
handler.help = ['slut']
handler.tags = ['economy', 'navidad', 'fiesta']
handler.command = ['slut']
handler.group = true
handler.limit = true

export default handler

// Funciones auxiliares
function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60
  const partes = []
  if (minutes > 0) partes.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`)
  partes.push(`${seconds} segundo${seconds !== 1 ? 's' : ''}`)
  return partes.join(' ')
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

// Eventos navideños de celebración
const celebracionesNavidenas = [
  // Victorias - Celebraciones exitosas
  { tipo: 'victoria', mensaje: 'Organizaste una increíble fiesta de Navidad en el taller de Santa y todos los elfos disfrutaron mucho.' },
  { tipo: 'victoria', mensaje: 'Bailaste toda la noche al ritmo de villancicos con los renos y ganaste un concurso de baile navideño.' },
  { tipo: 'victoria', mensaje: 'Preparaste un banquete navideño espectacular que dejó a todos los invitados maravillados.' },
  { tipo: 'victoria', mensaje: 'Ganaste el concurso de decoración navideña con tu creatividad y estilo único.' },
  { tipo: 'victoria', mensaje: 'Cantaste villancicos tan bellamente que hiciste llorar de alegría al mismísimo Santa Claus.' },
  { tipo: 'victoria', mensaje: 'Organizaste un intercambio de regalos secreto que fue el evento más comentado del Polo Norte.' },
  { tipo: 'victoria', mensaje: 'Tu fiesta de Nochebuena fue tan memorable que los elfos todavía hablan de ella.' },
  { tipo: 'victoria', mensaje: 'Ganaste el torneo de juegos navideños demostrando tu destreza y espíritu competitivo.' },
  { tipo: 'victoria', mensaje: 'Preparaste el ponche de huevo más delicioso que haya probado Santa en décadas.' },
  { tipo: 'victoria', mensaje: 'Tu habilidad para contar historias navideñas mantuvo a todos cautivados durante horas.' },
  { tipo: 'victoria', mensaje: 'Decoraste la casa más bonita del vecindario y ganaste el premio a la mejor decoración.' },
  { tipo: 'victoria', mensaje: 'Tu talento para hacer manualidades navideñas impresionó a todos los asistentes a la feria.' },
  { tipo: 'victoria', mensaje: 'Organizaste una obra de teatro navideña que emocionó a niños y adultos por igual.' },
  { tipo: 'victoria', mensaje: 'Tu karaoke de villancicos fue tan divertido que todos quisieron participar.' },
  { tipo: 'victoria', mensaje: 'Preparaste galletas navideñas tan deliciosas que los elfos te pidieron la receta.' },
  
  // Derrotas - Celebraciones con contratiempos
  { tipo: 'derrota', mensaje: 'Quemaste el pavo navideño justo cuando llegaban los invitados a la cena.' },
  { tipo: 'derrota', mensaje: 'Se te cayó el árbol de Navidad decorado justo antes de que comenzara la fiesta.' },
  { tipo: 'derrota', mensaje: 'Confundiste las fechas y organizaste la fiesta un día después de Navidad.' },
  { tipo: 'derrota', mensaje: 'Se rompió el reproductor de música justo cuando iba a comenzar la pista de baile.' },
  { tipo: 'derrota', mensaje: 'Olvidaste comprar ingredientes importantes para la cena navideña.' },
  { tipo: 'derrota', mensaje: 'Una tormenta de nieve impidió que la mayoría de invitados llegara a tu fiesta.' },
  { tipo: 'derrota', mensaje: 'Confundiste los regalos y le diste a cada persona el regalo equivocado.' },
  { tipo: 'derrota', mensaje: 'Se te pasó la hora y comenzaste la celebración cuando todos ya se estaban yendo.' },
  { tipo: 'derrota', mensaje: 'Los adornos navideños que compraste resultaron ser de mala calidad y se rompieron.' },
  { tipo: 'derrota', mensaje: 'Tu disfraz de Santa se deshizo en medio de la celebración.' },
  { tipo: 'derrota', mensaje: 'Se te olvidó invitar a personas importantes a tu reunión navideña.' },
  { tipo: 'derrota', mensaje: 'La piñata navideña se rompió antes de tiempo y todos los dulces cayeron al suelo.' },
  { tipo: 'derrota', mensaje: 'Tu fotógrafo de la fiesta perdió todas las fotos del evento.' },
  { tipo: 'derrota', mensaje: 'La bebida navideña especial que preparaste tenía un sabor extraño.' },
  { tipo: 'derrota', mensaje: 'Tu actuación en el concurso de villancicos fue olvidada por los jueces.' }
]