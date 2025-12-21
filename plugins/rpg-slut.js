let handler = async (m, { conn, usedPrefix, command }) => {
  // Verificar economía activada con temática navideña
  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(
      `🎅 *¡Actividades Navideñas Bloqueadas!* 🎄\n\nLos comandos de *Economía Navideña* están desactivados en este grupo.\n\nUn *Elfo Administrador* puede activarlos con:\n» *${usedPrefix}economy on*\n\n🦌 *¡Así podrás participar en las festividades navideñas!* ✨`
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
      lastFestivity: 0
    }
    user = global.db.data.users[m.sender]
  }

  user.lastFestivity = user.lastFestivity || 0
  
  // Bonus especial si es diciembre (cooldown reducido)
  const esNavidad = new Date().getMonth() === 11
  const cooldownBase = 5 * 60 * 1000 // 5 minutos base
  const cooldown = esNavidad ? cooldownBase * 0.7 : cooldownBase // 30% menos en diciembre

  if (Date.now() < user.lastFestivity) {
    const restante = user.lastFestivity - Date.now()
    const tiempoRestante = formatTime(restante)
    return conn.reply(m.chat,
      `⏰ *¡Las festividades necesitan tiempo para organizarse!* 🎄\n\nDebes esperar *${tiempoRestante}* para participar en las *Actividades Navideñas* de nuevo.\n\n*🎅 Mientras tanto puedes:*\n• Hornear galletas: *${usedPrefix}cookies*\n• Cantar villancicos: *${usedPrefix}carols*\n• Decorar el árbol: *${usedPrefix}decorate*`,
      m
    )
  }

  user.lastFestivity = Date.now() + cooldown
  
  // Bonus de diciembre (más chance de éxito)
  const chanceBase = 0.75 // 75% base de éxito
  const chanceExito = esNavidad ? chanceBase * 1.2 : chanceBase // 20% más en diciembre
  
  const exito = Math.random() < chanceExito
  const tipo = exito ? 'victoria' : 'derrota'
  
  const evento = exito ? 
    pickRandom(actividadesNavidenas.filter(e => e.tipo === 'victoria')) :
    pickRandom(actividadesNavidenas.filter(e => e.tipo === 'derrota'))

  let cantidad, experiencia, espirituNavideno, alegria
  
  // Bonus de diciembre (más recompensas)
  const multiplicadorNavidad = esNavidad ? 1.5 : 1

  if (exito) {
    // Éxito en actividad navideña
    cantidad = Math.floor((Math.random() * 1501 + 4000) * multiplicadorNavidad)
    experiencia = Math.floor(Math.random() * 101) + 50
    espirituNavideno = Math.floor(Math.random() * 15) + 10
    alegria = Math.floor(Math.random() * 5) + 1
    
    user.coin += cantidad
    user.exp = (user.exp || 0) + experiencia
    user.christmasSpirit = (user.christmasSpirit || 0) + espirituNavideno
    user.health = Math.min(100, (user.health || 100) + alegria)
    
  } else {
    // Fracaso en actividad navideña
    cantidad = Math.floor((Math.random() * 1001 + 3000) * 0.6) // 40% menos pérdida
    experiencia = Math.floor(Math.random() * 31) + 10
    alegria = Math.floor(Math.random() * 3) + 1
    
    // Posibilidad de ganar espíritu navideño incluso en fracaso (30% chance)
    if (Math.random() < 0.3) {
      espirituNavideno = Math.floor(Math.random() * 5) + 1
      user.christmasSpirit = (user.christmasSpirit || 0) + espirituNavideno
    }
    
    user.coin = Math.max(0, (user.coin || 0) - cantidad)
    user.exp = Math.max(0, (user.exp || 0) - experiencia)
    user.health = Math.max(0, (user.health || 100) - alegria)
  }

  // Construir mensaje navideño
  let mensaje = `🎄 *¡Participación en Actividades Navideñas!* 🎅\n\n`
  mensaje += `${evento.mensaje}\n\n`

  if (exito) {
    mensaje += `✨ *¡Actividad Exitosa!*\n`
    mensaje += `💰 *Regalos obtenidos:* ${currency}${cantidad.toLocaleString()}\n`
    mensaje += `⭐ *Experiencia:* ${experiencia.toLocaleString()} XP\n`
    mensaje += `🎄 *Espíritu Navideño:* +${espirituNavideno}\n`
    mensaje += `❤️ *Alegría navideña:* +${alegria}\n`
    
    if (multiplicadorNavidad > 1) {
      mensaje += `🎅 *Bonus de Diciembre:* x1.5 en recompensas!\n`
    }
    
    // Mensaje especial para actividades muy exitosas
    if (cantidad > 7000) {
      mensaje += `🏆 *¡Excelente trabajo!* Los elfos están impresionados.\n`
    }
    
  } else {
    mensaje += `❄️ *¡La actividad no salió como esperabas!*\n`
    mensaje += `🦌 *Regalos perdidos:* ${currency}${cantidad.toLocaleString()}\n`
    mensaje += `📉 *Experiencia perdida:* ${experiencia.toLocaleString()} XP\n`
    mensaje += `❤️ *Alegría navideña:* -${alegria}\n`
    
    if (espirituNavideno) {
      mensaje += `✨ *Pero ganaste Espíritu Navideño:* +${espirituNavideno}\n`
    }
    
    // Mensaje alentador
    mensaje += `💡 *No te preocupes!* Siempre hay más oportunidades para ayudar.\n`
  }

  // Footer con estadísticas
  mensaje += `\n━━━━━━━━━━━━━━━━━━━━\n`
  mensaje += `💰 *Cartera:* ${currency}${user.coin.toLocaleString()}\n`
  mensaje += `🎯 *Experiencia:* ${user.exp.toLocaleString()} XP\n`
  mensaje += `❤️ *Alegría navideña:* ${user.health}/100\n`
  mensaje += `✨ *Espíritu Navideño:* ${user.christmasSpirit || 0}\n`
  mensaje += `⏰ *Próxima actividad:* en ${formatTime(cooldown)}\n\n`
  
  // Consejo navideño aleatorio
  const consejos = [
    'La mejor ayuda viene del corazón, no del bolsillo.',
    'Compartir tiempo es más valioso que compartir regalos.',
    'Los pequeños actos de bondad crean grandes recuerdos navideños.',
    'La Navidad es más feliz cuando hacemos felices a los demás.',
    'Cada sonrisa que provocas es un regalo para Santa.',
    'El verdadero espíritu navideño está en dar sin esperar recibir.',
    'Los mejores regalos no se compran, se crean con amor.'
  ]
  
  mensaje += `💡 *Reflexión navideña:* ${pickRandom(consejos)}`

  await conn.reply(m.chat, mensaje, m)
  
  // Efecto especial para actividades muy exitosas
  if (exito && cantidad > 8000) {
    setTimeout(() => {
      conn.sendMessage(m.chat, {
        text: `🎊 *¡CONTRIBUCIÓN EXCEPCIONAL!* 🎅\n\nTu ayuda ha hecho una gran diferencia en la comunidad navideña. ¡Santa te agradece personalmente!`
      }, { quoted: m })
    }, 1000)
  }
}

// Configuración del handler
handler.help = ['festividad', 'ayudar', 'participar', 'actividadesnavidenas']
handler.tags = ['economy', 'navidad', 'comunidad']
handler.command = ['festividad', 'ayudar', 'participar', 'actividadesnavidenas', 'navidadayuda', 'santahelp', 'comunidadnavidena']
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

// Actividades navideñas apropiadas
const actividadesNavidenas = [
  // Victorias - Actividades exitosas
  { tipo: 'victoria', mensaje: 'Organizaste una colecta de juguetes para niños necesitados y lograste reunir muchos regalos.' },
  { tipo: 'victoria', mensaje: 'Ayudaste a un anciano a decorar su casa para la Navidad y te agradeció con una recompensa.' },
  { tipo: 'victoria', mensaje: 'Participaste como voluntario en el banco de alimentos navideño y ayudaste a muchas familias.' },
  { tipo: 'victoria', mensaje: 'Cocinaste galletas para la comunidad y todos disfrutaron de tu deliciosa receta.' },
  { tipo: 'victoria', mensaje: 'Organizaste un coro de villancicos que alegró el vecindario completo.' },
  { tipo: 'victoria', mensaje: 'Ayudaste a empaquetar regalos en el centro comunitario durante toda la tarde.' },
  { tipo: 'victoria', mensaje: 'Recolectaste donaciones para el refugio de animales y les diste una Navidad especial.' },
  { tipo: 'victoria', mensaje: 'Visitaste un hospital infantil disfrazado de elfo y alegraste a los niños enfermos.' },
  { tipo: 'victoria', mensaje: 'Limpiaste y decoraste el parque local para la celebración navideña comunitaria.' },
  { tipo: 'victoria', mensaje: 'Ayudaste a repartir cenas navideñas a personas sin hogar en tu ciudad.' },
  { tipo: 'victoria', mensaje: 'Enseñaste a niños pequeños a hacer manualidades navideñas en la biblioteca local.' },
  { tipo: 'victoria', mensaje: 'Organizaste un intercambio de regalos secretos en tu trabajo o escuela.' },
  { tipo: 'victoria', mensaje: 'Ayudaste a una familia a armar su primer árbol de Navidad.' },
  { tipo: 'victoria', mensaje: 'Recogiste y entregaste cartas a Santa para niños de orfanatos.' },
  { tipo: 'victoria', mensaje: 'Donaste tu tiempo para leer cuentos navideños en la guardería local.' },
  
  // Derrotas - Actividades con contratiempos
  { tipo: 'derrota', mensaje: 'La lluvia arruinó la colecta de juguetes al aire libre que habías organizado.' },
  { tipo: 'derrota', mensaje: 'Se canceló el evento navideño donde ibas a ser voluntario por falta de permisos.' },
  { tipo: 'derrota', mensaje: 'Quemaste las galletas que ibas a donar y tuviste que empezar de nuevo.' },
  { tipo: 'derrota', mensaje: 'Se te cayó el árbol de Navidad que estabas decorando y se rompieron algunos adornos.' },
  { tipo: 'derrota', mensaje: 'Pocas personas asistieron al coro de villancicos que organizaste.' },
  { tipo: 'derrota', mensaje: 'Perdiste parte del dinero recaudado para caridad en el camino al banco.' },
  { tipo: 'derrota', mensaje: 'El disfraz de elfo que llevabas para el hospital se rompió justo antes de entrar.' },
  { tipo: 'derrota', mensaje: 'Una tormenta de nieve impidió que llegaras al centro comunitario donde ibas a ayudar.' },
  { tipo: 'derrota', mensaje: 'Confundiste las direcciones y entregaste los regalos en la casa equivocada.' },
  { tipo: 'derrota', mensaje: 'Se te pasó la hora y llegaste tarde para ayudar a servir la cena navideña.' },
  { tipo: 'derrota', mensaje: 'Olvidaste comprar materiales importantes para las manualidades navideñas.' },
  { tipo: 'derrota', mensaje: 'El intercambio de regalos secretos tuvo problemas porque algunos no trajeron regalos.' },
  { tipo: 'derrota', mensaje: 'Las luces navideñas que instalaste se fundieron durante la primera noche.' },
  { tipo: 'derrota', mensaje: 'Las cartas a Santa que recogiste se mojaron en un aguacero repentino.' },
  { tipo: 'derrota', mensaje: 'Los niños de la guardería estaban demasiado inquietos para escuchar los cuentos.' }
]