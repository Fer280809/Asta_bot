const handler = async (m, { conn, usedPrefix, command }) => {
  // Verificar economía activada con temática navideña
  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(
      `🎅 *¡Intercambios Navideños Bloqueados!* 🎄\n\nLos comandos de *Economía Navideña* están desactivados en este grupo.\n\nUn *Elfo Administrador* puede activarlos con:\n» *${usedPrefix}economy on*\n\n🦌 *¡Así podrás participar en intercambios de bondad navideña!* 🤝`
    )
  }

  const user = global.db.data.users[m.sender]
  
  // Inicializar usuario si no existe
  if (!user) {
    global.db.data.users[m.sender] = { 
      coin: 1000, 
      exp: 0, 
      health: 100, 
      christmasSpirit: 0,
      lastExchange: 0,
      exchangeCount: 0
    }
    user = global.db.data.users[m.sender]
  }

  user.lastExchange = user.lastExchange || 0
  user.exchangeCount = user.exchangeCount || 0
  
  // Bonus especial si es diciembre (cooldown reducido)
  const esNavidad = new Date().getMonth() === 11
  const cooldownBase = 2 * 60 * 60 * 1000 // 2 horas base
  const cooldown = esNavidad ? cooldownBase * 0.8 : cooldownBase // 20% menos en diciembre

  if (Date.now() < user.lastExchange) {
    const restante = user.lastExchange - Date.now()
    return conn.reply(m.chat,
      `⏰ *¡Los intercambios necesitan tiempo para organizarse!* 🎄\n\nDebes esperar *${formatTime(restante)}* para participar en un *Intercambio de Bondad Navideña* de nuevo.\n\n*🎅 Mientras tanto puedes:*\n• Ayudar a la comunidad: *${usedPrefix}ayudar*\n• Hornear galletas: *${usedPrefix}cookies*\n• Cantar villancicos: *${usedPrefix}carols*`,
      m
    )
  }

  // Obtener mención del destinatario
  let mentionedJid = await m.mentionedJid
  let who = mentionedJid && mentionedJid.length ? mentionedJid[0] : 
            m.quoted && await m.quoted.sender ? await m.quoted.sender : null

  if (!who) {
    return conn.reply(m.chat,
      `🎁 *¡Intercambio de Bondad Navideña!* 🤝\n\nDebes mencionar o responder a alguien para intercambiar regalos de bondad.\n\n*❄️ Ejemplo:*\n• Responde a un mensaje de la persona\n• Escribe @ y selecciona el contacto\n• Usa: *${usedPrefix + command} @usuario*\n\n*✨ Propósito:* Compartir el espíritu navideño y ayudar a otros.`,
      m
    )
  }

  if (!(who in global.db.data.users)) {
    return conn.reply(m.chat,
      `🎄 *¡Usuario no encontrado en la comunidad navideña!* 🎅\n\nEsta persona no está registrada en nuestra base de datos navideña.\n\n*✨ Sugerencias:*\n1. Pídele que use *${usedPrefix}start* para unirse\n2. Asegúrate de que esté en el grupo\n3. Verifica que hayas escrito correctamente`,
      m
    )
  }

  // No permitir intercambio consigo mismo
  if (who === m.sender) {
    return conn.reply(m.chat,
      `🎅 *¡No puedes intercambiar contigo mismo!* 🎄\n\nEl espíritu navideño se trata de compartir con *otros*.\n\n*✨ Sugerencias:*\n• Busca a un amigo para intercambiar\n• Ayuda a alguien nuevo en el grupo\n• Participa en actividades comunitarias`,
      m
    )
  }

  const name = await (async () => {
    try {
      const n = await conn.getName(who)
      return n || who.split('@')[0]
    } catch {
      return who.split('@')[0]
    }
  })()

  const target = global.db.data.users[who]
  
  // Inicializar target si no tiene propiedades
  if (!target.coin) target.coin = 0
  if (!target.health) target.health = 100
  if (!target.christmasSpirit) target.christmasSpirit = 0

  // Verificar si el objetivo tiene suficientes galletas para compartir
  const minCompartir = 1000
  if (target.coin < minCompartir) {
    return conn.reply(m.chat,
      `🍪 *¡${name} no tiene suficientes galletas para compartir!* 🎄\n\nSanta dice que todos deben tener al menos *${minCompartir} ${currency}* para poder participar en intercambios.\n\n*💰 Galletas de ${name}:* ${currency}${target.coin.toLocaleString()}\n*🎯 Necesita:* ${currency}${minCompartir}\n\n*✨ Sugerencias:*\n1. Ayúdale a ganar galletas: *${usedPrefix}work*\n2. Espera a que tenga más galletas\n3. Comparte tú primero: *${usedPrefix}pay*`,
      m, { mentions: [who] }
    )
  }

  // Bonus de diciembre (más chance de éxito)
  const chanceBase = 0.7 // 70% base de éxito en intercambio
  const chanceExito = esNavidad ? chanceBase * 1.2 : chanceBase // 20% más en diciembre

  // Determinar resultado del intercambio
  const exito = Math.random() < chanceExito
  const tipoIntercambio = Math.random() < 0.3 ? 'mutuo' : 'directo' // 30% chance de intercambio mutuo

  let cantidadIntercambio, experiencia, espirituNavideno, alegria
  let mensajeResultado = ''

  // Bonus de diciembre (valores aumentados)
  const multiplicadorNavidad = esNavidad ? 1.3 : 1

  if (exito) {
    // Éxito en el intercambio
    if (tipoIntercambio === 'mutuo') {
      // Intercambio mutuo exitoso: ambos ganan
      cantidadIntercambio = Math.floor((Math.random() * 501 + 1000) * multiplicadorNavidad)
      experiencia = Math.floor(Math.random() * 51) + 30
      espirituNavideno = Math.floor(Math.random() * 12) + 8
      alegria = Math.floor(Math.random() * 3) + 1

      // Ambos ganan
      user.coin += cantidadIntercambio
      user.exp = (user.exp || 0) + experiencia
      user.christmasSpirit = (user.christmasSpirit || 0) + espirituNavideno
      user.health = Math.min(100, (user.health || 100) + alegria)

      target.coin += cantidadIntercambio
      target.exp = (target.exp || 0) + experiencia
      target.christmasSpirit = (target.christmasSpirit || 0) + espirituNavideno
      target.health = Math.min(100, (target.health || 100) + alegria)

      mensajeResultado = `✨ *¡INTERCAMBIO MUTUO EXITOSO!* 🎁\nAmbos recibieron regalos de bondad.`

    } else {
      // Intercambio directo exitoso: el iniciador gana, el objetivo no pierde
      cantidadIntercambio = Math.floor((Math.random() * 301 + 500) * multiplicadorNavidad)
      experiencia = Math.floor(Math.random() * 31) + 20
      espirituNavideno = Math.floor(Math.random() * 8) + 5
      alegria = Math.floor(Math.random() * 2) + 1

      // Solo el iniciador gana (el objetivo no pierde, es un regalo)
      user.coin += cantidadIntercambio
      user.exp = (user.exp || 0) + experiencia
      user.christmasSpirit = (user.christmasSpirit || 0) + espirituNavideno
      user.health = Math.min(100, (user.health || 100) + alegria)

      // El objetivo también gana un poco de espíritu navideño
      target.christmasSpirit = (target.christmasSpirit || 0) + Math.floor(espirituNavideno * 0.5)

      mensajeResultado = `🎁 *¡INTERCAMBIO DE BONDAD EXITOSO!* ✨\nCompartiste alegría navideña.`
    }

  } else {
    // Intercambio no exitoso (pero no hay pérdidas, solo menos ganancias)
    cantidadIntercambio = Math.floor((Math.random() * 101 + 200) * multiplicadorNavidad * 0.5)
    experiencia = Math.floor(Math.random() * 11) + 10
    espirituNavideno = Math.floor(Math.random() * 3) + 1

    // Ambos ganan un poco (aunque el intercambio no fue ideal)
    user.coin += cantidadIntercambio
    user.exp = (user.exp || 0) + experiencia
    user.christmasSpirit = (user.christmasSpirit || 0) + espirituNavideno

    target.christmasSpirit = (target.christmasSpirit || 0) + Math.floor(espirituNavideno * 0.3)

    mensajeResultado = `❄️ *¡El intercambio fue modesto!* 🎅\nLa magia navideña funcionó parcialmente.`
  }

  // Actualizar contador y tiempo de intercambio
  user.lastExchange = Date.now() + cooldown
  user.exchangeCount = (user.exchangeCount || 0) + 1

  // Construir mensaje navideño
  let mensaje = `🎄 *¡Intercambio de Bondad Navideña!* 🤝\n\n`
  mensaje += `${mensajeResultado}\n\n`

  if (exito) {
    mensaje += `💰 *Regalos compartidos:* ${currency}${cantidadIntercambio.toLocaleString()}\n`
    mensaje += `⭐ *Experiencia:* ${experiencia.toLocaleString()} XP\n`
    mensaje += `🎄 *Espíritu Navideño:* +${espirituNavideno}\n`
    
    if (tipoIntercambio === 'mutuo') {
      mensaje += `❤️ *Alegría navideña:* +${alegria} (para ambos)\n`
    } else {
      mensaje += `❤️ *Tu alegría navideña:* +${alegria}\n`
    }

    if (multiplicadorNavidad > 1) {
      mensaje += `🎅 *Bonus de Diciembre:* +30% en recompensas!\n`
    }

    // Mensaje especial para intercambios muy exitosos
    if (cantidadIntercambio > 1500) {
      mensaje += `🏆 *¡Excelente intercambio!* Los elfos celebran vuestra bondad.\n`
    }

  } else {
    mensaje += `🍪 *Galletas compartidas:* ${currency}${cantidadIntercambio.toLocaleString()}\n`
    mensaje += `⭐ *Experiencia:* ${experiencia.toLocaleString()} XP\n`
    mensaje += `✨ *Espíritu Navideño:* +${espirituNavideno}\n`
    
    mensaje += `💡 *Consejo:* La próxima vez intenta con alguien más activo en la comunidad.\n`
  }

  // Footer con estadísticas
  mensaje += `\n━━━━━━━━━━━━━━━━━━━━\n`
  mensaje += `👤 *Iniciado por:* Tú (${m.sender.split('@')[0]})\n`
  mensaje += `🤝 *Con:* ${name}\n`
  mensaje += `💰 *Tus galletas:* ${currency}${user.coin.toLocaleString()}\n`
  mensaje += `💰 *Galletas de ${name}:* ${currency}${target.coin.toLocaleString()}\n`
  mensaje += `✨ *Tu espíritu navideño:* ${user.christmasSpirit || 0}\n`
  mensaje += `🎯 *Intercambios realizados:* ${user.exchangeCount}\n`
  mensaje += `⏰ *Próximo intercambio:* en ${formatTime(cooldown)}\n\n`
  
  // Frase navideña aleatoria
  const frases = [
    'La Navidad es el tiempo perfecto para celebrar regalos de amor, alegría y paz.',
    'La mejor manera de celebrar la Navidad es abriendo nuestro corazón a los demás.',
    'La verdadera felicidad navideña está en hacer felices a los demás.',
    'Compartir es la esencia de la Navidad.',
    'Un pequeño acto de bondad puede iluminar la Navidad de alguien.',
    'La Navidad no se trata de recibir, sino de dar con amor.',
    'El mejor regalo de Navidad es una mano amiga y un corazón cálido.'
  ]
  
  mensaje += `💝 *"${frases[Math.floor(Math.random() * frases.length)]}"*`

  // Enviar mensaje
  await conn.reply(m.chat, mensaje, m, { mentions: [who] })

  // Enviar notificación al destinatario
  setTimeout(async () => {
    try {
      const mensajeDestinatario = `🎁 *¡Has participado en un Intercambio de Bondad Navideña!* ✨\n\n` +
        `👤 *Iniciado por:* ${m.sender.split('@')[0]}\n` +
        `💰 *Galletas ganadas:* ${tipoIntercambio === 'mutuo' ? currency + cantidadIntercambio.toLocaleString() : 'Espíritu navideño'}\n` +
        `✨ *Espíritu Navideño ganado:* +${tipoIntercambio === 'mutuo' ? espirituNavideno : Math.floor(espirituNavideno * 0.5)}\n` +
        `🎄 *Tu espíritu navideño ahora:* ${target.christmasSpirit}\n\n` +
        `💝 *"Compartir alegría multiplica la felicidad navideña."*\n\n` +
        `🎅 *¡Gracias por ser parte de nuestra comunidad navideña!* 🦌`
      
      await conn.sendMessage(m.chat, {
        text: mensajeDestinatario,
        mentions: [who]
      }, { quoted: m })
    } catch (e) {
      console.log('Error al notificar al destinatario:', e)
    }
  }, 1000)

  // Efecto especial para intercambios muy exitosos
  if (exito && cantidadIntercambio > 2000) {
    setTimeout(() => {
      conn.sendMessage(m.chat, {
        text: `🎊 *¡INTERCAMBIO LEGENDARIO!* 🏆\n\nVuestro intercambio de bondad ha sido registrado en el Libro de Oro de Santa. ¡Felicidades a ambos! 🎅✨`
      }, { quoted: m })
    }, 1500)
  }

  // Efecto especial si es el décimo intercambio
  if (user.exchangeCount === 10) {
    setTimeout(() => {
      conn.sendMessage(m.chat, {
        text: `🎖️ *¡DÉCIMO INTERCAMBIO DE BONDAD!* 🎉\n\nHas alcanzado 10 intercambios de bondad navideña. ¡Santa te otorga el título de "Portador del Espíritu Navideño"! ✨🎄`
      }, { quoted: m })
    }, 2000)
  }
}

// Configuración del handler
handler.help = ['intercambiar', 'compartir', 'bondad', 'intercambionavidad']
handler.tags = ['economy', 'navidad', 'comunidad']
handler.command = ['intercambiar', 'compartir', 'bondad', 'intercambionavidad', 'navidadexchange', 'santashare', 'compartirnavideno']
handler.group = true
handler.limit = true

export default handler

// Función para formatear el tiempo con estilo navideño
function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60
  const partes = []
  
  if (hours) partes.push(`⏰ ${hours} hora${hours !== 1 ? 's' : ''}`)
  if (minutes) partes.push(`❄️ ${minutes} minuto${minutes !== 1 ? 's' : ''}`)
  if (seconds) partes.push(`🎄 ${seconds} segundo${seconds !== 1 ? 's' : ''}`)
  
  return partes.join(' ')
}