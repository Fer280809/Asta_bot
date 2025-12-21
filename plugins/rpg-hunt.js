let handler = async (m, { conn, usedPrefix, command }) => {
  // Verificar economía activada con temática navideña
  if (!global.db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(
      `🎅 *¡Cacería Navideña Cancelada!* ❄️\n\nLos comandos de *Economía Navideña* están desactivados en este grupo.\n\nUn *Elfo Administrador* puede activarlos con:\n» *${usedPrefix}economy on*\n\n🦌 *¡Así podrás ayudar a Santa a preparar la cena navideña!* 🍖`
    )
  }
  
  // Inicializar usuario si no existe
  let user = global.db.data.users[m.sender]
  if (!user) {
    global.db.data.users[m.sender] = { 
      exp: 0, 
      coin: 0, 
      health: 100, 
      lastHunt: 0,
      christmasSpirit: 0,
      huntingSkill: 0
    }
    user = global.db.data.users[m.sender]
  }
  
  // Asegurar propiedades
  user.coin = user.coin || 0
  user.exp = user.exp || 0
  user.health = user.health || 100
  user.lastHunt = user.lastHunt || 0
  user.christmasSpirit = user.christmasSpirit || 0
  user.huntingSkill = user.huntingSkill || 0
  
  // Verificar salud (Alegría Navideña)
  if (user.health < 5) {
    return conn.reply(m.chat, 
      `🎄 *¡Poco espíritu navideño!* 🦌\n\nNo tienes suficiente *Alegría Navideña* para ir de cacería en el *Bosque del Polo Norte*.\n\n> Usa *"${usedPrefix}heal"* para recuperar alegría\n> Toma chocolate caliente con *"${usedPrefix}hotchocolate"*\n> Descansa un rato con *"${usedPrefix}rest"*\n\n*❤️ Tu alegría actual:* ${user.health}/100`, m)
  }
  
  // Bonus especial si es diciembre (cooldown reducido)
  const esNavidad = new Date().getMonth() === 11
  const cooldownBase = 15 * 60 * 1000 // 15 minutos base
  const cooldown = esNavidad ? cooldownBase * 0.8 : cooldownBase // 20% menos en diciembre
  
  const now = Date.now()
  
  // Verificar cooldown
  if (now < user.lastHunt) {
    const restante = user.lastHunt - now
    return conn.reply(m.chat, 
      `⏰ *¡Los animales necesitan descansar!* 🦌\n\nDebes esperar *${formatTime(restante)}* para ir de cacería navideña de nuevo.\n\n*🎅 Mientras tanto puedes:*\n• Hornear galletas: *${usedPrefix}cookies*\n• Decorar el árbol: *${usedPrefix}decorate*\n• Cantar villancicos: *${usedPrefix}carols*\n• Pescar en el lago: *${usedPrefix}fish*`, m)
  }
  
  // Actualizar tiempo de cacería
  user.lastHunt = now + cooldown
  
  // Mejorar habilidad de cacería
  user.huntingSkill = Math.min((user.huntingSkill || 0) + 0.15, 10) // Máximo nivel 10
  
  // Bonus por habilidad (más chance de éxito)
  const bonusHabilidad = 1 + (user.huntingSkill * 0.08) // Hasta 80% más chance
  const chanceBase = 0.7 // 70% base
  const chanceExito = Math.min(chanceBase * bonusHabilidad, 0.95) // Máximo 95%
  
  // Determinar éxito basado en chance mejorada
  const exito = Math.random() < chanceExito
  const tipo = exito ? 'victoria' : 'derrota'
  
  // Seleccionar evento apropiado
  const evento = exito ? 
    pickRandom(eventosNavidenos.filter(e => e.tipo === 'victoria')) :
    pickRandom(eventosNavidenos.filter(e => e.tipo === 'derrota'))
  
  let monedas, experiencia, salud, espirituNavideno, itemEspecial
  
  // Bonus de diciembre
  const multiplicadorNavidad = esNavidad ? 1.6 : 1 // 60% más en diciembre
  
  if (exito) {
    // Éxito: Cacería exitosa
    monedas = Math.floor((Math.random() * 10001 + 1000) * multiplicadorNavidad * (1 + user.huntingSkill * 0.25))
    experiencia = Math.floor((Math.random() * 91 + 30) * multiplicadorNavidad)
    salud = Math.floor(Math.random() * 5) + 3
    espirituNavideno = Math.floor(Math.random() * 10) + 5
    
    // Posibilidad de trofeo especial (12% chance)
    if (Math.random() < 0.12) {
      const trofeos = [
        { nombre: '🦌 Cornamenta de Reno Dorada', bonus: 1200 },
        { nombre: '🎄 Guirnalda de Bayas Mágicas', bonus: 800 },
        { nombre: '✨ Piel de Oso Polar Brillante', bonus: 1500 },
        { nombre: '🎁 Carne Especial para la Cena', bonus: 1000 },
        { nombre: '🔔 Campanilla del Cazador', bonus: 600 }
      ]
      itemEspecial = pickRandom(trofeos)
      monedas += itemEspecial.bonus
    }
    
    user.coin += monedas
    user.exp += experiencia
    user.health -= salud
    user.christmasSpirit = (user.christmasSpirit || 0) + espirituNavideno
    
  } else {
    // Fracaso
    monedas = Math.floor((Math.random() * 2001 + 4000) * 0.5) // 50% menos pérdida
    experiencia = Math.floor((Math.random() * 41 + 30) * 0.4)
    salud = Math.floor(Math.random() * 5) + 3
    
    // Posibilidad de ganar algo positivo (25% chance)
    if (Math.random() < 0.25) {
      espirituNavideno = Math.floor(Math.random() * 4) + 1
      user.christmasSpirit = (user.christmasSpirit || 0) + espirituNavideno
    }
    
    user.coin = Math.max(0, user.coin - monedas)
    user.exp = Math.max(0, user.exp - experiencia)
    user.health -= salud
  }
  
  // Asegurar que la salud no sea negativa
  if (user.health < 0) user.health = 0
  if (user.health > 100) user.health = 100
  
  // Construir mensaje de resultado
  let resultado = `🎯 *¡Cacería Navideña en el Bosque!* 🦌\n\n`
  resultado += `${evento.mensaje}\n\n`
  
  if (exito) {
    resultado += `✨ *¡Cacería Exitosa!*\n`
    resultado += `💰 *Ingredientes obtenidos:* ${currency}${monedas.toLocaleString()}\n`
    resultado += `⭐ *Experiencia:* ${experiencia.toLocaleString()} XP\n`
    resultado += `🎄 *Espíritu Navideño:* +${espirituNavideno}\n`
    resultado += `🏹 *Habilidad de Cacería:* Nivel ${user.huntingSkill.toFixed(1)}\n`
    resultado += `❤️ *Alegría consumida:* -${salud}\n`
    
    if (itemEspecial) {
      resultado += `🏆 *¡Trofeo Especial!* ${itemEspecial.nombre}\n`
      resultado += `✨ *Bonus adicional:* ${currency}${itemEspecial.bonus.toLocaleString()}\n`
    }
    
    if (multiplicadorNavidad > 1) {
      resultado += `🎅 *Bonus de Diciembre:* x1.6 en recompensas!\n`
    }
    
    // Mensaje especial por alta habilidad
    if (user.huntingSkill >= 5) {
      resultado += `👑 *¡Eres un cazador legendario del Polo Norte!*\n`
    }
    
  } else {
    resultado += `❄️ *¡La cacería fue difícil!*\n`
    resultado += `🦌 *Ingredientes perdidos:* ${currency}${monedas.toLocaleString()}\n`
    resultado += `📉 *Experiencia perdida:* ${experiencia.toLocaleString()} XP\n`
    resultado += `❤️ *Alegría consumida:* -${salud}\n`
    
    if (espirituNavideno) {
      resultado += `✨ *Pero ganaste Espíritu Navideño:* +${espirituNavideno}\n`
    }
    
    // Mensaje alentador
    resultado += `💡 *No te desanimes!* Incluso los mejores cazadores tienen días difíciles.\n`
  }
  
  // Footer con estadísticas
  resultado += `\n━━━━━━━━━━━━━━━━━━━━\n`
  resultado += `💰 *Cartera:* ${currency}${user.coin.toLocaleString()}\n`
  resultado += `🎯 *Experiencia:* ${user.exp.toLocaleString()} XP\n`
  resultado += `❤️ *Alegría:* ${user.health}/100\n`
  resultado += `✨ *Espíritu Navideño:* ${user.christmasSpirit || 0}\n`
  resultado += `🏹 *Nivel de Cacería:* ${user.huntingSkill.toFixed(1)}/10.0\n`
  resultado += `⏰ *Próxima cacería:* en ${formatTime(cooldown)}\n\n`
  
  // Consejo aleatorio
  const consejos = [
    'Los renos son más fáciles de encontrar cerca de los abetos.',
    'Usa campanillas para no asustar a las presas.',
    'Santa premia a los cazadores que respetan la naturaleza.',
    'En diciembre, los animales son más generosos.',
    'La paciencia es clave en el bosque nevado.',
    'Mejora tu habilidad cazando regularmente.',
    'Los mejores trofeos se encuentran al amanecer.'
  ]
  resultado += `💡 *Consejo del Cazador:* ${pickRandom(consejos)}`
  
  // Enviar mensaje
  await conn.reply(m.chat, resultado, m)
  
  // Efecto especial para cacerías excepcionales
  if (exito && monedas > 20000) {
    setTimeout(() => {
      conn.sendMessage(m.chat, { 
        text: `🏆 *¡Cacería Legendaria!* 🎖️\nTus hazañas serán recordadas en las canciones de los elfos.` 
      }, { quoted: m })
    }, 1000)
  }
  
  // Efecto especial si alcanzó un nuevo nivel de habilidad
  if (user.huntingSkill >= 3 && user.huntingSkill < 3.2) {
    setTimeout(() => {
      conn.sendMessage(m.chat, { 
        text: `⭐ *¡Nuevo Nivel de Habilidad!* 🏹\nHas alcanzado el nivel ${user.huntingSkill.toFixed(1)} en cacería.\n¡Los animales te respetan más!` 
      }, { quoted: m })
    }, 1500)
  }
}

handler.tags = ['economy', 'navidad', 'cacería']
handler.help = ['cazar', 'hunt']
handler.command = ['cazar', 'hunt']
handler.group = true
handler.limit = true

export default handler

// Funciones auxiliares
function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const min = Math.floor((totalSec % 3600) / 60)
  const sec = totalSec % 60
  const partes = []
  if (min > 0) partes.push(`${min} minuto${min !== 1 ? 's' : ''}`)
  partes.push(`${sec} segundo${sec !== 1 ? 's' : ''}`)
  return partes.join(' ')
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

// Eventos navideños de cacería
const eventosNavidenos = [
  // Victorias - Cacerías exitosas
  { tipo: 'victoria', mensaje: '🦌 *¡Atrapaste un Reno para la cena de Santa!* 🎄\nTu puntería fue perfecta bajo la aurora boreal.' },
  { tipo: 'victoria', mensaje: '🐻 *¡Cazaste un Oso Polar con pelaje brillante!* ✨\nSu piel será un abrigo perfecto para los elfos.' },
  { tipo: 'victoria', mensaje: '🦊 *¡Capturaste un Zorro Ártico de cola plateada!* ❄️\nSu pelaje brilla como la nieve al amanecer.' },
  { tipo: 'victoria', mensaje: '🐰 *¡Atrapaste una Liebre de las Nieves!* 🏹\nPerfecta para el estofado navideño.' },
  { tipo: 'victoria', mensaje: '🦉 *¡Cazaste un Búho Nival!* 🌙\nSus plumas tienen propiedades mágicas.' },
  { tipo: 'victoria', mensaje: '🦡 *¡Capturaste un Tejón Invernal!* 🎁\nProporcionará grasa para las velas.' },
  { tipo: 'victoria', mensaje: '🦅 *¡Derribaste un Águila Real!* ⚡\nSus garras son un trofeo valioso.' },
  { tipo: 'victoria', mensaje: '🐺 *¡Venciste a un Lobo del Hielo!* ❄️\nFue una batalla épica en la tundra.' },
  { tipo: 'victoria', mensaje: '🦃 *¡Atrapaste un Pavo Salvaje!* 🍗\nSerá el plato principal de la cena.' },
  { tipo: 'victoria', mensaje: '🎯 *¡Cazaste un Alce Majestuoso!* 👑\nSus astas son más grandes que un árbol navideño.' },
  
  // Derrotas - Cacerías fallidas
  { tipo: 'derrota', mensaje: '🎅 *Santa pasó con su trineo y asustó a todas las presas.*\nTendrás que esperar a que se calme el bosque.' },
  { tipo: 'derrota', mensaje: '🌨️ *Una tormenta de nieve te obligó a refugiarte.*\nLa visibilidad era cero y perdiste el rastro.' },
  { tipo: 'derrota', mensaje: '🐻 *Un oso polar defendió su territorio.*\nTuviste que retirarte para no lastimarlo.' },
  { tipo: 'derrota', mensaje: '🦌 *Los renos se organizaron y te rodearon.*\nRudolph lideró una contraofensiva sorpresa.' },
  { tipo: 'derrota', mensaje: '🧚 *Los duendes del bosque escondieron tus presas.*\nLes divierte gastar bromas a los cazadores.' },
  { tipo: 'derrota', mensaje: '🌲 *Te perdiste en el bosque de abetos.*\nLos árboles idénticos te desorientaron.' },
  { tipo: 'derrota', mensaje: '❄️ *Tu arco se congeló y se quebró.*\nEl frío extremo del Polo Norte es implacable.' },
  { tipo: 'derrota', mensaje: '🕳️ *Caíste en una trampa para osos.*\nPasaste horas tratando de salir.' },
  { tipo: 'derrota', mensaje: '🌅 *La aurora boreal distrajo tu atención.*\nSu belleza te hizo olvidar la cacería.' },
  { tipo: 'derrota', mensaje: '🎄 *Un árbol de Navidad vivo te bloqueó el camino.*\nParece que los árboles también se defienden.' }
]