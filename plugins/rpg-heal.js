let handler = async (m, { conn, usedPrefix, command }) => {
  // Verificar economía activada con temática navideña
  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(
      `🎅 *¡Cuidado Navideño Cancelado!* ❄️\n\nLa *Alegría Navideña* está desactivada en este grupo.\n\nUn *Elfo Administrador* puede activarla con:\n» *${usedPrefix}economy on*\n\n🦌 *¡Así podrás recuperar tu espíritu festivo!* ✨`
    )
  }

  let user = global.db.data.users[m.sender]
  if (!user) return conn.reply(m.chat, 
    `🎄 *¡No estás en la lista de Santa!* 🎅\n\nPrimero debes registrarte en el sistema navideño.\n\nUsa: *${usedPrefix}start* para comenzar tu aventura navideña.`, m)
  
  // Verificar si ya tiene alegría navideña máxima
  if (user.health >= 100) return conn.reply(m.chat, 
    `✨ *¡Tu alegría navideña ya está al máximo!* 🎄\n\n*❤️ Alegría:* 100/100\n\n🎅 *¡Eres pura felicidad navideña!*\nPuedes ayudar a otros o explorar el Taller de Santa.`, m)
  
  // Verificar si tiene monedas (galletas)
  if (user.coin <= 0) return conn.reply(m.chat, 
    `🍪 *¡No tienes galletas para el tratamiento!* 🎄\n\nNecesitas *${currency}* para comprar chocolate caliente y galletas curativas.\n\n*✨ Sugerencias de Santa:*\n1. Trabaja en el taller: *${usedPrefix}work*\n2. Reclama tu regalo diario: *${usedPrefix}daily*\n3. Juega cara o cruz: *${usedPrefix}cf*`, m)

  // Bonus especial si es diciembre
  const esNavidad = new Date().getMonth() === 11
  const costoPorPunto = esNavidad ? 40 : 50 // 20% más barato en diciembre
  const bonusAleatorio = Math.random() < 0.15 // 15% chance de bonus
  
  // Calcular curación
  const faltante = 100 - user.health
  const maxCurableConDinero = Math.floor(user.coin / costoPorPunto)
  const curable = Math.min(faltante, maxCurableConDinero)
  
  // Aplicar bonus si corresponde
  let curacionExtra = 0
  if (bonusAleatorio) {
    curacionExtra = Math.floor(curable * 0.3) // 30% extra
  }
  
  const curacionTotal = curable + curacionExtra
  const costoTotal = curable * costoPorPunto
  
  // Aplicar cambios
  user.health += curacionTotal
  if (user.health > 100) user.health = 100
  user.coin -= costoTotal
  user.lastHeal = Date.now()
  
  // Opciones de tratamiento navideño
  const tratamientos = [
    { nombre: '🍫 Chocolate Caliente Mágico', emoji: '☕' },
    { nombre: '🍪 Galletas de Jengibre Curativas', emoji: '🌟' },
    { nombre: '🎄 Abrazo de Espíritu Navideño', emoji: '🫂' },
    { nombre: '✨ Baño de Luces Navideñas', emoji: '💫' },
    { nombre: '🦌 Masaje de Reno Terapéutico', emoji: '❤️' },
    { nombre: '🎅 Visita de Santa Clínico', emoji: '🎁' }
  ]
  
  const tratamiento = tratamientos[Math.floor(Math.random() * tratamientos.length)]
  
  // Crear mensaje navideño
  let info = ``
  
  // Encabezado festivo
  if (esNavidad) {
    info += `🎄 *¡TRATAMIENTO NAVIDEÑO ESPECIAL!* 🎅\n\n`
  } else {
    info += `✨ *CURACIÓN DE ALEGRÍA NAVIDEÑA* ❄️\n\n`
  }
  
  // Decoración superior
  info += `╔══════════════════════════════╗\n`
  info += `║    ${tratamiento.emoji} ${tratamiento.nombre} ${tratamiento.emoji}    ║\n`
  info += `╠══════════════════════════════╣\n\n`
  
  // Detalles del tratamiento
  info += `🎁 *Tratamiento usado:* ${tratamiento.nombre}\n`
  info += `❤️ *Alegría recuperada:* +${curacionTotal} punto${curacionTotal !== 1 ? 's' : ''}\n`
  
  if (curacionExtra > 0) {
    info += `✨ *Bonus especial:* +${curacionExtra} (¡Santa te sonrió!)\n`
  }
  
  info += `💰 *Costo del tratamiento:* ${currency}${costoTotal.toLocaleString()}\n`
  info += `🍪 *Galletas restantes:* ${currency}${user.coin.toLocaleString()}\n\n`
  
  // Barra de progreso de alegría
  const porcentaje = user.health
  const barrasLlenas = Math.floor(porcentaje / 10)
  const barrasVacias = 10 - barrasLlenas
  const barra = '█'.repeat(barrasLlenas) + '░'.repeat(barrasVacias)
  
  info += `✨ *Nivel de Alegría Navideña:*\n`
  info += `[${barra}] ${user.health}/100\n\n`
  
  // Mensaje según nivel de alegría
  if (user.health < 30) {
    info += `❄️ *¡Cuidado!* Tu espíritu navideño está bajo.\nToma más chocolate caliente pronto.\n`
  } else if (user.health < 70) {
    info += `🎄 *¡Vas mejorando!* Sigue cuidando tu alegría.\n`
  } else if (user.health < 100) {
    info += `✨ *¡Excelente!* Tu alegría navideña brilla.\n`
  } else {
    info += `🎅 *¡PERFECTO!* Eres pura alegría navideña.\nLos renos bailan a tu alrededor.\n`
  }
  
  // Footer con consejos
  info += `\n${'─'.repeat(35)}\n`
  
  if (esNavidad) {
    info += `🎅 *¡Bonus de Diciembre!*\n`
    info += `Los tratamientos cuestan solo ${costoPorPunto} ${currency} por punto.\n`
  }
  
  // Consejos aleatorios
  const consejos = [
    'Los villancicos aumentan la alegría naturalmente.',
    'Compartir regalos recupera 5 puntos de alegría gratis.',
    'Ayudar a los elfos da puntos de alegría extra.',
    'La risa es la mejor medicina navideña.',
    'Los abrazos de oso polar son gratis y curativos.',
    'Cantar villancicos bajo la aurora boreal es mágico.'
  ]
  
  info += `💡 *Consejo navideño:* ${consejos[Math.floor(Math.random() * consejos.length)]}\n\n`
  
  info += `╚══════════════════════════════╝\n`
  info += `🎶 *¡Que la alegría navideña te acompañe!* 🎄`
  
  // Enviar mensaje
  await conn.sendMessage(m.chat, { text: info }, { quoted: m })
  
  // Efecto especial si se curó completamente
  if (user.health === 100) {
    setTimeout(() => {
      conn.sendMessage(m.chat, { 
        text: `🎉 *¡ALEGRÍA NAVIDEÑA COMPLETA!* 🎅\n\n¡Felicidades! Tu espíritu navideño brilla al máximo.\nLos elfos te han agregado a la "Lista de los Más Alegres". ✨🎄` 
      }, { quoted: m })
    }, 1500)
  }
  
  // Efecto especial si obtuvo bonus
  if (bonusAleatorio) {
    setTimeout(() => {
      conn.sendMessage(m.chat, { 
        text: `🎁 *¡BONUS DE SANTA RECIBIDO!* ✨\n\nSanta vio tu buen comportamiento y te dio curación extra.\n¡Sigue siendo buen@! 🎅❤️` 
      }, { quoted: m })
    }, 2000)
  }
}

// Configuración del handler
handler.help = ['heal', 'curar', 'chocolate', 'galletas', 'alegría']
handler.tags = ['economy', 'navidad', 'salud']
handler.command = ['heal', 'curar', 'chocolate', 'galletas', 'alegria', 'navidadheal', 'santacure', 'espíritu']
handler.group = true
handler.limit = true

export default handler