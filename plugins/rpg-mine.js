let handler = async (m, { conn, usedPrefix, command }) => {
  // Verificar economía activada con temática navideña
  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(
      `🎅 *¡Minería Navideña Cancelada!* ❄️\n\nLos comandos de *Economía Navideña* están desactivados en este grupo.\n\nUn *Elfo Administrador* puede activarlos con:\n» *${usedPrefix}economy on*\n\n🦌 *¡Así podrás extraer carbón para la chimenea de Santa!* 🔥`
    )
  }

  const user = global.db.data.users[m.sender]
  if (!user) {
    global.db.data.users[m.sender] = {
      coin: 0,
      exp: 0,
      health: 100,
      lastmine: 0,
      pickaxedurability: 100,
      christmasSpirit: 0,
      miningSkill: 0,
      coalStock: 0
    }
    user = global.db.data.users[m.sender]
  }

  // Asegurar propiedades
  user.lastmine = user.lastmine || 0
  user.coin = user.coin || 0
  user.exp = user.exp || 0
  user.health = user.health || 100
  user.pickaxedurability = user.pickaxedurability || 100
  user.christmasSpirit = user.christmasSpirit || 0
  user.miningSkill = user.miningSkill || 0
  user.coalStock = user.coalStock || 0

  // Verificar salud (Alegría Navideña)
  if (user.health < 5) {
    return conn.reply(m.chat,
      `🎄 *¡Poco espíritu navideño!* ⛏️\n\nNo tienes suficiente *Alegría Navideña* para trabajar en las *Minas de Carbón Navideñas*.\n\n> Usa *"${usedPrefix}heal"* para recuperar alegría\n> Toma chocolate caliente: *"${usedPrefix}hotchocolate"*\n> Descansa un rato: *"${usedPrefix}rest"*\n\n*❤️ Tu alegría actual:* ${user.health}/100`, m)
  }

  // Verificar durabilidad del pico (si es 0, no puede minar)
  if (user.pickaxedurability <= 0) {
    return conn.reply(m.chat,
      `⛏️ *¡Tu pico está roto!* 🔨\n\nLa durabilidad de tu pico navideño es *0/100*.\n\n*✨ Soluciones:*\n1. Reparar pico: *${usedPrefix}repararpico*\n2. Comprar pico nuevo: *${usedPrefix}tienda*\n3. Esperar a que los elfos lo reparen (24 horas)\n\n🎅 *Consejo:* Usa picos de mejor calidad para que duren más.`, m)
  }

  // Bonus especial si es diciembre (cooldown reducido)
  const esNavidad = new Date().getMonth() === 11
  const gapBase = 10 * 60 * 1000 // 10 minutos base
  const gap = esNavidad ? gapBase * 0.75 : gapBase // 25% menos en diciembre

  const now = Date.now()

  // Verificar cooldown
  if (now < user.lastmine) {
    const restante = user.lastmine - now
    return conn.reply(m.chat,
      `⏰ *¡Las minas necesitan ventilación!* ⛏️\n\nDebes esperar *${formatTime(restante)}* para minar en las *Minas de Carbón Navideñas* de nuevo.\n\n*🎅 Mientras tanto puedes:*\n• Hornear galletas: *${usedPrefix}cookies*\n• Decorar el árbol: *${usedPrefix}decorate*\n• Cantar villancicos: *${usedPrefix}carols*\n• Ir de cacería: *${usedPrefix}hunt*`, m)
  }

  user.lastmine = now + gap

  // Mejorar habilidad de minería
  user.miningSkill = Math.min((user.miningSkill || 0) + 0.2, 15) // Máximo nivel 15

  // Reducir durabilidad del pico
  const reduccionDurabilidad = Math.max(1, 5 - Math.floor(user.miningSkill / 3))
  user.pickaxedurability = Math.max(0, user.pickaxedurability - reduccionDurabilidad)

  // Bonus por habilidad (más chance de éxito)
  const bonusHabilidad = 1 + (user.miningSkill * 0.06) // Hasta 90% más chance
  const chanceBase = 0.7 // 70% base
  const chanceExito = Math.min(chanceBase * bonusHabilidad, 0.96) // Máximo 96%

  // Determinar éxito
  const exito = Math.random() < chanceExito
  const tipo = exito ? 'victoria' : 'derrota'

  // Seleccionar evento apropiado
  const evento = exito ?
    pickRandom(eventosNavidenos.filter(e => e.tipo === 'victoria')) :
    pickRandom(eventosNavidenos.filter(e => e.tipo === 'derrota'))

  let monedas, experiencia, salud, espirituNavideno, carbonExtra, gemasEspeciales

  // Bonus de diciembre
  const multiplicadorNavidad = esNavidad ? 1.5 : 1

  if (exito) {
    // Éxito: Minería exitosa
    monedas = Math.floor((Math.random() * 2001 + 7000) * multiplicadorNavidad * (1 + user.miningSkill * 0.15))
    experiencia = Math.floor((Math.random() * 91 + 10) * multiplicadorNavidad)
    salud = Math.floor(Math.random() * 3) + 1
    espirituNavideno = Math.floor(Math.random() * 8) + 3
    carbonExtra = Math.floor(Math.random() * 10) + 5
    user.coalStock = (user.coalStock || 0) + carbonExtra

    // Posibilidad de gemas navideñas (15% chance)
    if (Math.random() < 0.15) {
      gemasEspeciales = Math.floor(Math.random() * 3) + 1
      monedas += gemasEspeciales * 800
    }

    user.coin += monedas
    user.exp += experiencia
    user.health -= salud
    user.christmasSpirit = (user.christmasSpirit || 0) + espirituNavideno

  } else {
    // Fracaso
    monedas = Math.floor((Math.random() * 2001 + 3000) * 0.6) // 40% menos pérdida
    experiencia = Math.floor((Math.random() * 41 + 10) * 0.5)
    salud = Math.floor(Math.random() * 5) + 1

    // Posibilidad de encontrar algo positivo (20% chance)
    if (Math.random() < 0.2) {
      espirituNavideno = Math.floor(Math.random() * 4) + 1
      user.christmasSpirit = (user.christmasSpirit || 0) + espirituNavideno
      carbonExtra = Math.floor(Math.random() * 3) + 1
      user.coalStock = (user.coalStock || 0) + carbonExtra
    }

    user.coin = Math.max(0, user.coin - monedas)
    user.exp = Math.max(0, user.exp - experiencia)
    user.health -= salud
  }

  // Asegurar que la salud no sea negativa
  if (user.health < 0) user.health = 0
  if (user.health > 100) user.health = 100

  // Construir mensaje de resultado
  let resultado = `⛏️ *¡Minería en las Minas Navideñas!* 🎄\n\n`
  resultado += `${evento.mensaje}\n\n`

  if (exito) {
    resultado += `✨ *¡Extracción Exitosa!*\n`
    resultado += `💰 *Carbón obtenido:* ${currency}${monedas.toLocaleString()}\n`
    resultado += `⭐ *Experiencia:* ${experiencia.toLocaleString()} XP\n`
    resultado += `🖤 *Carbón en stock:* +${carbonExtra} (Total: ${user.coalStock})\n`
    resultado += `🎄 *Espíritu Navideño:* +${espirituNavideno}\n`
    resultado += `⛏️ *Habilidad de Minería:* Nivel ${user.miningSkill.toFixed(1)}\n`
    resultado += `🔨 *Durabilidad del pico:* -${reduccionDurabilidad} (Ahora: ${user.pickaxedurability}/100)\n`
    resultado += `❤️ *Alegría consumida:* -${salud}\n`

    if (gemasEspeciales) {
      resultado += `💎 *¡Gemas Navideñas!* +${gemasEspeciales} gemas (${currency}${(gemasEspeciales * 800).toLocaleString()} extra)\n`
    }

    if (multiplicadorNavidad > 1) {
      resultado += `🎅 *Bonus de Diciembre:* x1.5 en recompensas!\n`
    }

    // Mensaje especial por alta habilidad
    if (user.miningSkill >= 8) {
      resultado += `👑 *¡Eres un minero experto del Polo Norte!*\n`
    }

  } else {
    resultado += `❄️ *¡La extracción fue difícil!*\n`
    resultado += `🦌 *Carbón perdido:* ${currency}${monedas.toLocaleString()}\n`
    resultado += `📉 *Experiencia perdida:* ${experiencia.toLocaleString()} XP\n`
    resultado += `🔨 *Durabilidad del pico:* -${reduccionDurabilidad} (Ahora: ${user.pickaxedurability}/100)\n`
    resultado += `❤️ *Alegría consumida:* -${salud}\n`

    if (espirituNavideno) {
      resultado += `✨ *Pero ganaste Espíritu Navideño:* +${espirituNavideno}\n`
    }
    if (carbonExtra) {
      resultado += `🖤 *Al menos obtuviste carbón:* +${carbonExtra} (Total: ${user.coalStock})\n`
    }

    // Mensaje alentador
    resultado += `💡 *No te rindas!* Las minas del Polo Norte son traicioneras.\n`
  }

  // Advertencia si la durabilidad es baja
  if (user.pickaxedurability <= 20) {
    resultado += `\n⚠️ *¡Tu pico está a punto de romperse!* Considera repararlo pronto.\n`
  }

  // Footer con estadísticas
  resultado += `\n━━━━━━━━━━━━━━━━━━━━\n`
  resultado += `💰 *Cartera:* ${currency}${user.coin.toLocaleString()}\n`
  resultado += `🎯 *Experiencia:* ${user.exp.toLocaleString()} XP\n`
  resultado += `❤️ *Alegría:* ${user.health}/100\n`
  resultado += `✨ *Espíritu Navideño:* ${user.christmasSpirit || 0}\n`
  resultado += `🖤 *Carbón acumulado:* ${user.coalStock} unidades\n`
  resultado += `⛏️ *Nivel de Minería:* ${user.miningSkill.toFixed(1)}/15.0\n`
  resultado += `🔨 *Durabilidad del pico:* ${user.pickaxedurability}/100\n`
  resultado += `⏰ *Próxima minería:* en ${formatTime(gap)}\n\n`

  // Consejo aleatorio
  const consejos = [
    'Los elfos pagan extra por carbón de alta calidad.',
    'Minar cerca de las raíces de los abetos da mejores resultados.',
    'Santa necesita carbón para mantener caliente el taller.',
    'En diciembre, las vetas son más ricas.',
    'Mejora tu pico para encontrar gemas navideñas.',
    'El carbón acumulado puede venderse por buen precio.',
    'Descansa cuando tu pico esté por romperse.'
  ]
  resultado += `💡 *Consejo del Minero:* ${pickRandom(consejos)}`

  // Enviar mensaje
  await conn.reply(m.chat, resultado, m)

  // Efecto especial para extracciones excepcionales
  if (exito && monedas > 15000) {
    setTimeout(() => {
      conn.sendMessage(m.chat, {
        text: `💎 *¡VETA EXCEPCIONAL ENCONTRADA!* ⛏️\n¡Has descubierto una veta legendaria de carbón navideño! Los elfos están impresionados.`
      }, { quoted: m })
    }, 1000)
  }

  // Efecto especial si el pico se rompió
  if (user.pickaxedurability <= 0) {
    setTimeout(() => {
      conn.sendMessage(m.chat, {
        text: `💔 *¡Tu pico se ha roto!* 🔨\n\nNecesitas repararlo o conseguir uno nuevo para seguir minando.\n\nUsa: *${usedPrefix}repararpico* o *${usedPrefix}tienda*`
      }, { quoted: m })
    }, 1500)
  }
}

handler.tags = ['economy', 'navidad', 'minería']
handler.help = ['minar', 'mine', 'minernavidad', 'carbon', 'santamining']
handler.command = ['minar', 'mine', 'minernavidad', 'carbon', 'santamining', 'navidadmine', 'minarnavideno']
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

// Eventos navideños de minería
const eventosNavidenos = [
  // Victorias - Extracciones exitosas
  { tipo: 'victoria', mensaje: '⛏️ *¡Encontraste una veta de carbón dulce!* 🍬\nPerfecto para mantener caliente el taller de Santa.' },
  { tipo: 'victoria', mensaje: '🎄 *¡Descubriste una caverna de caramelos de roca!* 🍭\nLos elfos los usarán para decorar los regalos.' },
  { tipo: 'victoria', mensaje: '✨ *¡Hallaste cristales de hielo mágico!* ❄️\nBrillan como las luces navideñas.' },
  { tipo: 'victoria', mensaje: '🦌 *¡Encontraste turba aromática!* 🌿\nPerfecta para el fuego de la chimenea de Santa.' },
  { tipo: 'victoria', mensaje: '🎁 *¡Descubriste una geoda de gemas navideñas!* 💎\nRojo, verde y dorado brillante.' },
  { tipo: 'victoria', mensaje: '🔥 *¡Extraíste antracita de alta calidad!* ⚫\nQuemará toda la noche en el taller.' },
  { tipo: 'victoria', mensaje: '🌟 *¡Encontraste lignito fosforescente!* 💫\nIlumina los túneles como un árbol de Navidad.' },
  { tipo: 'victoria', mensaje: '🎅 *¡Descubriste la veta madre de carbón!* 🖤\nSanta tendrá combustible para todo el invierno.' },
  { tipo: 'victoria', mensaje: '🧊 *¡Extraíste hielo perpetuo!* ❄️\nNo se derrite ni en el taller más caliente.' },
  { tipo: 'victoria', mensaje: '💎 *¡Encontraste diamantes de azúcar!* 🍬\nLos elfos los usan para los regalos más especiales.' },

  // Derrotas - Extracciones fallidas
  { tipo: 'derrota', mensaje: '🌨️ *Un derrumbe de nieve bloqueó el túnel.*\nTuviste que retroceder y perder parte del carbón.' },
  { tipo: 'derrota', mensaje: '🦌 *Un reno curioso se metió en la mina.*\nTuviste que sacarlo y perdiste tiempo valioso.' },
  { tipo: 'derrota', mensaje: '🎅 *Santa pasó inspeccionando y distrajo a los elfos.*\nLa producción se detuvo temporalmente.' },
  { tipo: 'derrota', mensaje: '🧊 *El hielo era demasiado duro para tu pico.*\nSolo lograste astillar la superficie.' },
  { tipo: 'derrota', mensaje: '💧 *Una filtración de agua arruinó el carbón.*\nQuedó inutilizable y húmedo.' },
  { tipo: 'derrota', mensaje: '🌪️ *Una ventisca entró por la entrada.*\nEl viento dispersó todo el polvo de carbón.' },
  { tipo: 'derrota', mensaje: '🕳️ *Caíste en un pozo oculto.*\nPerdiste parte del equipo y el carbón.' },
  { tipo: 'derrota', mensaje: '🔦 *Se agotaron las lámparas.*\nTuviste que salir antes de extraer suficiente.' },
  { tipo: 'derrota', mensaje: '🧚 *Los duendes hicieron una travesura.*\nCambiaron el carbón por piedras pintadas.' },
  { tipo: 'derrota', mensaje: '❄️ *La temperatura bajó demasiado.*\nLas herramientas se congelaron y se quebraron.' }
]