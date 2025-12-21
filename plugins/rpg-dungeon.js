
let handler = async (m, { conn, command, usedPrefix }) => {
  // Verificar economía activada con temática navideña
  if (!global.db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`🎅 *¡Expedición Navideña Cancelada!* 🎄\n\nLos comandos de *Economía Navideña* están desactivados en este grupo.\n\nUn *Elfo Administrador* puede activarlos con:\n» *${usedPrefix}economy on*\n\n🦌 *¡Así podrás explorar el Taller de Santa!* 🔔`)
  }
  
  let user = global.db.data.users[m.sender]
  if (!user) global.db.data.users[m.sender] = user = { 
    health: 100, 
    coin: 0, 
    exp: 0, 
    lastDungeon: 0,
    christmasSpirit: 0 // Nuevo: espíritu navideño
  }
  
  // Verificar salud (Alegría Navideña)
  if (user.health < 5) {
    return conn.reply(m.chat, 
      `🦌 *¡Poco espíritu navideño!* ❄️\n\nNo tienes suficiente *Alegría Navideña* para explorar el *Taller de Santa*.\n\n> Usa *"${usedPrefix}heal"* para recuperar alegría\n> Toma chocolate caliente con *"${usedPrefix}hotchocolate"*\n\n*🎄 Tu alegría actual:* ${user.health}/100`, m)
  }
  
  // Cooldown reducido para navidad (15 minutos en lugar de 18)
  const cooldown = 15 * 60 * 1000
  const ahora = Date.now()
  
  if (ahora < user.lastDungeon) {
    const restante = user.lastDungeon - ahora
    const wait = formatTimeMs(restante)
    return conn.reply(m.chat, 
      `⏰ *¡Los renos necesitan descansar!* 🦌\n\nDebes esperar *${wait}* para explorar el *Taller de Santa* de nuevo.\n\n*🎅 Mientras tanto puedes:*\n• Repartir regalos: *${usedPrefix}work*\n• Jugar juegos: *${usedPrefix}games*\n• Cocinar galletas: *${usedPrefix}cookies*`, m)
  }
  
  user.lastDungeon = ahora + cooldown
  
  // Bonus especial si es diciembre
  const esNavidad = new Date().getMonth() === 11
  const bonusNavidad = esNavidad ? 1.5 : 1
  
  // Evento aleatorio navideño
  const evento = pickRandom(eventosNavidenos)
  let monedas, experiencia, salud, espirituNavideno
  
  if (evento.tipo === 'victoria') {
    monedas = Math.floor((Math.random() * 3001 + 12000) * bonusNavidad)
    experiencia = Math.floor((Math.random() * 71 + 30) * bonusNavidad)
    salud = Math.floor(Math.random() * 3) + 8
    espirituNavideno = Math.floor(Math.random() * 5) + 3
    
    user.coin += monedas
    user.exp += experiencia
    user.health -= salud
    user.christmasSpirit = (user.christmasSpirit || 0) + espirituNavideno
    
  } else if (evento.tipo === 'derrota') {
    monedas = Math.floor((Math.random() * 2001 + 6000) * 0.7) // 30% menos de pérdida en navidad
    experiencia = Math.floor((Math.random() * 31 + 40) * 0.5)
    salud = Math.floor(Math.random() * 3) + 8
    
    user.coin = Math.max(0, user.coin - monedas)
    user.exp = Math.max(0, user.exp - experiencia)
    user.health -= salud
    
    // Posibilidad de encontrar espíritu navideño incluso en derrota
    if (Math.random() < 0.3) {
      espirituNavideno = Math.floor(Math.random() * 3) + 1
      user.christmasSpirit = (user.christmasSpirit || 0) + espirituNavideno
    }
    
  } else { // Evento especial
    experiencia = Math.floor((Math.random() * 61 + 30) * bonusNavidad)
    espirituNavideno = Math.floor(Math.random() * 8) + 5
    
    user.exp += experiencia
    user.christmasSpirit = (user.christmasSpirit || 0) + espirituNavideno
    
    // Posibilidad de regalo extra
    if (Math.random() < 0.2) {
      const regaloExtra = Math.floor(Math.random() * 2000) + 500
      user.coin += regaloExtra
      evento.mensaje += ` Además, encontraste un regalo extra de ${currency}${regaloExtra.toLocaleString()}!`
    }
  }
  
  // Asegurar que la salud no sea negativa
  if (user.health < 0) user.health = 0
  if (user.health > 100) user.health = 100
  
  // Construir mensaje de resultado
  let resultado = `🎄 *¡Expedición al Taller de Santa!* 🎅\n\n`
  resultado += `${evento.mensaje}\n\n`
  
  if (evento.tipo === 'victoria') {
    resultado += `✨ *¡Victoria Navideña!*\n`
    resultado += `🎁 *Regalos obtenidos:* ${currency}${monedas.toLocaleString()}\n`
    resultado += `⭐ *Experiencia:* ${experiencia.toLocaleString()} XP\n`
    resultado += `🎄 *Espíritu Navideño:* +${espirituNavideno}\n`
    resultado += `❤️ *Alegría consumida:* -${salud}\n`
    if (bonusNavidad > 1) {
      resultado += `🎅 *Bonus de Diciembre:* x1.5 en recompensas!\n`
    }
    
  } else if (evento.tipo === 'derrota') {
    resultado += `❄️ *¡Encontraste dificultades!*\n`
    resultado += `🦌 *Regalos perdidos:* ${currency}${monedas.toLocaleString()}\n`
    resultado += `📉 *Experiencia perdida:* ${experiencia.toLocaleString()} XP\n`
    resultado += `❤️ *Alegría consumida:* -${salud}\n`
    if (espirituNavideno) {
      resultado += `✨ *Pero ganaste Espíritu Navideño:* +${espirituNavideno}\n`
    }
    
  } else {
    resultado += `🎁 *¡Evento Especial Navideño!*\n`
    resultado += `⭐ *Experiencia ganada:* ${experiencia.toLocaleString()} XP\n`
    resultado += `🎄 *Espíritu Navideño:* +${espirituNavideno}\n`
  }
  
  // Footer con estadísticas
  resultado += `\n━━━━━━━━━━━━━━━━━━━━\n`
  resultado += `💰 *Cartera:* ${currency}${user.coin.toLocaleString()}\n`
  resultado += `🎯 *Experiencia:* ${user.exp.toLocaleString()} XP\n`
  resultado += `❤️ *Alegría:* ${user.health}/100\n`
  resultado += `✨ *Espíritu Navideño:* ${user.christmasSpirit || 0}\n`
  resultado += `⏰ *Próxima expedición:* en 15 minutos\n\n`
  resultado += `🎅 *Consejo de Santa:* ${pickRandom(consejosSanta)}`
  
  // Enviar mensaje
  await conn.reply(m.chat, resultado, m)
  
  // Efecto especial si ganó mucho espíritu navideño
  if (espirituNavideno && espirituNavideno >= 7) {
    setTimeout(() => {
      conn.sendMessage(m.chat, { 
        text: `✨ *¡Tu Espíritu Navideño brilla intensamente!*\nLos renos pueden sentir tu alegría desde el Polo Norte. 🦌🎄` 
      }, { quoted: m })
    }, 1500)
  }
  
  await global.db.write()
}

handler.tags = ['economy', 'navidad', 'aventura']
handler.help = ['dungeon', 'mazmorra', 'taller', 'tallersanta', 'expedicionnavidena']
handler.command = ['dungeon', 'mazmorra', 'taller', 'tallersanta', 'expedicionnavidena', 'navidadmaze', 'santaworkshop']
handler.group = true
handler.limit = true

export default handler

// Funciones auxiliares
function formatTimeMs(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  const partes = []
  if (min) partes.push(`${min} minuto${min !== 1 ? 's' : ''}`)
  partes.push(`${sec} segundo${sec !== 1 ? 's' : ''}`)
  return partes.join(' ')
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

// Eventos navideños
const eventosNavidenos = [
  // Victorias
  { tipo: 'victoria', mensaje: 'Ayudaste a Santa a empacar los regalos a tiempo y recibiste una recompensa especial.' },
  { tipo: 'victoria', mensaje: 'Derrotaste al Grinch que intentaba robar la Navidad y salvaste los regalos.' },
  { tipo: 'victoria', mensaje: 'Encontraste la receta secreta de las galletas de Santa y las horneaste perfectamente.' },
  { tipo: 'victoria', mensaje: 'Guiaste a los renos perdidos de vuelta al establo y recibiste agradecimiento.' },
  { tipo: 'victoria', mensaje: 'Reparaste el trineo mágico justo antes de la entrega de medianoche.' },
  { tipo: 'victoria', mensaje: 'Decoraste el árbol de Navidad más hermoso que el Polo Norte haya visto.' },
  { tipo: 'victoria', mensaje: 'Distribuiste regalos en una aldea remota y llenaste de alegría a los niños.' },
  { tipo: 'victoria', mensaje: 'Encontraste el carbón mágico que mantiene caliente el taller de los elfos.' },
  { tipo: 'victoria', mensaje: 'Resolviste el acertijo del duende sabio y ganaste un tesoro navideño.' },
  { tipo: 'victoria', mensaje: 'Cantaste villancicos tan bellamente que hiciste llorar de alegría a Santa.' },
  
  // Derrotas
  { tipo: 'derrota', mensaje: 'El Grinch te engañó y te robó algunos regalos que llevabas.' },
  { tipo: 'derrota', mensaje: 'Te quedaste dormido junto a la chimenea y perdiste tiempo valioso.' },
  { tipo: 'derrota', mensaje: 'Los duendes traviesos escondieron tus herramientas de trabajo.' },
  { tipo: 'derrota', mensaje: 'Una tormenta de nieve te desvió del camino y tuviste que regresar.' },
  { tipo: 'derrota', mensaje: 'Quemaste las galletas para Santa y tuviste que empezar de nuevo.' },
  { tipo: 'derrota', mensaje: 'Confundiste las listas de regalos y entregaste algunos en la dirección equivocada.' },
  { tipo: 'derrota', mensaje: 'Los renos se comieron los dulces que llevabas para los niños.' },
  { tipo: 'derrota', mensaje: 'Romper accidentalmente un juguete raro mientras lo empacabas.' },
  
  // Eventos especiales
  { tipo: 'especial', mensaje: 'Encontraste a un elfo anciano que te enseñó un villancico olvidado.' },
  { tipo: 'especial', mensaje: 'Descubriste una carta de agradecimiento de un niño que te llenó de alegría.' },
  { tipo: 'especial', mensaje: 'Santa te dio un abrazo que aumentó tu espíritu navideño.' },
  { tipo: 'especial', mensaje: 'Encontraste un duende perdido y lo ayudaste a volver al taller.' },
  { tipo: 'especial', mensaje: 'Una aurora boreal especial te dio una visión del verdadero significado de la Navidad.' },
  { tipo: 'especial', mensaje: 'Los renos te mostraron un atajo secreto a través del cielo nocturno.' }
]

// Consejos de Santa para el footer
const consejosSanta = [
  '¡Mantén alto tu espíritu navideño!',
  'Los regalos mejor empacados traen más alegría.',
  'Un duende feliz es un duende productivo.',
  'Las galletas y leche nunca están de más.',
  'La paciencia es clave al esperar a Santa.',
  '¡Compartir es la esencia de la Navidad!',
  'Cada acto de bondad hace crecer el espíritu navideño.',
  'Los villancicos alegran incluso los corazones más fríos.',
  'Un regalo hecho a mano vale más que uno comprado.',
  'La Navidad está en el corazón, no bajo el árbol.'
]