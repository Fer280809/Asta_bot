let handler = async (m, { conn, usedPrefix, command, text }) => {
  // Verificar economía activada
  if (!global.db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`🎰 *¡Juego Bloqueado!*\n\nUsa *${usedPrefix}economy on* para activar los juegos en este grupo.`)
  }

  const user = global.db.data.users[m.sender]
  
  // Inicializar usuario si no existe
  if (!user) {
    global.db.data.users[m.sender] = {
      coin: 0,
      lastrasca: 0,
      rascaintentos: 5,
      // Recursos del mine
      coal: 0,
      iron: 0,
      gold: 0,
      diamond: 0,
      emerald: 0,
      redstone: 0,
      lapis: 0,
      quartz: 0,
      copper: 0,
      ancient_debris: 0,
      netherite: 0
    }
    user = global.db.data.users[m.sender]
  }

  // Inicializar propiedades
  const defaults = {
    coin: 0,
    lastrasca: 0,
    rascaintentos: 5,
    coal: 0, iron: 0, gold: 0, diamond: 0, emerald: 0,
    redstone: 0, lapis: 0, quartz: 0, copper: 0,
    ancient_debris: 0, netherite: 0
  }

  for (const key in defaults) {
    if (user[key] === undefined) user[key] = defaults[key]
  }

  // Verificar si es un nuevo día (restablecer intentos)
  const ahora = Date.now()
  const unDia = 24 * 60 * 60 * 1000
  
  if (ahora - user.lastrasca > unDia) {
    user.rascaintentos = 5
    user.lastrasca = ahora
  }

  // Verificar intentos restantes
  if (user.rascaintentos <= 0) {
    const tiempoRestante = unDia - (ahora - user.lastrasca)
    return conn.reply(m.chat, 
      `🎰 *¡Sin intentos!*\n\nYa usaste tus 5 intentos diarios.\n\n` +
      `⏰ *Nuevos intentos en:* ${formatTime(tiempoRestante)}\n\n` +
      `💰 *Tu saldo:* ¥${user.coin.toLocaleString()}`, m)
  }

  // Si no hay argumento, mostrar el tablero
  if (!text) {
    return await mostrarTableroRasca(conn, m, user, usedPrefix)
  }

  // Validar entrada (A1, B3, C5, etc.)
  const input = text.toUpperCase().trim()
  if (!/^[A-E][1-5]$/.test(input)) {
    return conn.reply(m.chat,
      `❌ *Formato incorrecto*\n\nUsa: *${usedPrefix}rascadona [LETRA][NÚMERO]*\n` +
      `Ejemplo: *${usedPrefix}rascadona A1*\n` +
      `Letras: A-E, Números: 1-5`, m)
  }

  // Reducir intentos
  user.rascaintentos--
  user.lastrasca = ahora

  // Generar premio
  const premio = generarPremio()

  // Aplicar premio
  let mensajePremio = ''
  let emoji = ''

  switch(premio.tipo) {
    case 'coin':
      user.coin += premio.cantidad
      mensajePremio = `💰 *¡Ganaste ¥${premio.cantidad.toLocaleString()}!*`
      emoji = '💰'
      break
    case 'coal':
      user.coal += premio.cantidad
      mensajePremio = `⚫ *¡Ganaste ${premio.cantidad} Carbón!*`
      emoji = '⚫'
      break
    case 'iron':
      user.iron += premio.cantidad
      mensajePremio = `🔘 *¡Ganaste ${premio.cantidad} Hierro!*`
      emoji = '🔘'
      break
    case 'gold':
      user.gold += premio.cantidad
      mensajePremio = `🟡 *¡Ganaste ${premio.cantidad} Oro!*`
      emoji = '🟡'
      break
    case 'diamond':
      user.diamond += premio.cantidad
      mensajePremio = `💎 *¡Ganaste ${premio.cantidad} Diamante${premio.cantidad > 1 ? 's' : ''}!*`
      emoji = '💎'
      break
    case 'emerald':
      user.emerald += premio.cantidad
      mensajePremio = `🟢 *¡Ganaste ${premio.cantidad} Esmeralda${premio.cantidad > 1 ? 's' : ''}!*`
      emoji = '🟢'
      break
    case 'redstone':
      user.redstone += premio.cantidad
      mensajePremio = `🔴 *¡Ganaste ${premio.cantidad} Redstone!*`
      emoji = '🔴'
      break
    case 'lapis':
      user.lapis += premio.cantidad
      mensajePremio = `🔵 *¡Ganaste ${premio.cantidad} Lapislázuli!*`
      emoji = '🔵'
      break
    case 'quartz':
      user.quartz += premio.cantidad
      mensajePremio = `⚪ *¡Ganaste ${premio.cantidad} Cuarzo!*`
      emoji = '⚪'
      break
    case 'copper':
      user.copper += premio.cantidad
      mensajePremio = `🟠 *¡Ganaste ${premio.cantidad} Cobre!*`
      emoji = '🟠'
      break
    case 'nada':
      mensajePremio = `❌ *¡Dona vacía!* No ganaste nada esta vez.`
      emoji = '❌'
      break
  }

  // Crear mensaje de resultado
  let mensaje = `🎰 *RASCA DONAS MINECRAFT* ⛏️\n\n`
  mensaje += `📍 *Casilla rascada:* ${input}\n`
  mensaje += `${emoji} *Premio:* ${mensajePremio}\n\n`
  mensaje += `🎮 *Intentos restantes hoy:* ${user.rascaintentos}/5\n`
  mensaje += `💰 *Saldo actual:* ¥${user.coin.toLocaleString()}\n\n`

  // Mostrar inventario de recursos
  const tieneRecursos = [user.coal, user.iron, user.gold, user.diamond, user.emerald, user.redstone, user.lapis, user.quartz, user.copper]
    .some(cantidad => cantidad > 0)
  
  if (tieneRecursos) {
    mensaje += `🎒 *Tus recursos:*\n`
    if (user.coal > 0) mensaje += `• Carbón: ${user.coal}\n`
    if (user.iron > 0) mensaje += `• Hierro: ${user.iron}\n`
    if (user.gold > 0) mensaje += `• Oro: ${user.gold}\n`
    if (user.diamond > 0) mensaje += `• Diamante: ${user.diamond}\n`
    if (user.emerald > 0) mensaje += `• Esmeralda: ${user.emerald}\n`
    if (user.redstone > 0) mensaje += `• Redstone: ${user.redstone}\n`
    if (user.lapis > 0) mensaje += `• Lapislázuli: ${user.lapis}\n`
    if (user.quartz > 0) mensaje += `• Cuarzo: ${user.quartz}\n`
    if (user.copper > 0) mensaje += `• Cobre: ${user.copper}\n`
    if (user.ancient_debris > 0) mensaje += `• Escombros antiguos: ${user.ancient_debris}\n`
    if (user.netherite > 0) mensaje += `• Netherita: ${user.netherite}\n`
  }

  // Consejo aleatorio
  const consejos = [
    'Usa *minar* para obtener más recursos',
    'Los recursos se pueden vender en el mercado',
    'Craftea herramientas con tus recursos',
    'Juega todos los días para más intentos',
    'Los diamantes son los más valiosos'
  ]
  mensaje += `\n💡 *Consejo:* ${consejos[Math.floor(Math.random() * consejos.length)]}`

  // Enviar mensaje
  await conn.reply(m.chat, mensaje, m)

  // Efecto especial si ganó algo bueno
  if (premio.tipo === 'diamond' || premio.tipo === 'emerald' || premio.cantidad > 1000) {
    setTimeout(() => {
      conn.sendMessage(m.chat, {
        text: `🎉 *¡PREMIO ESPECIAL!*\n¡Has ganado un premio valioso en Rasca Donas! 🎰`
      }, { quoted: m })
    }, 1000)
  }
}

async function mostrarTableroRasca(conn, m, user, usedPrefix) {
  let mensaje = `🎰 *RASCA DONAS MINECRAFT* ⛏️\n\n`
  mensaje += `Elige una casilla para rascar:\n`
  mensaje += `Ejemplo: *${usedPrefix}rascadona A1*\n\n`
  mensaje += `🎮 *Intentos disponibles:* ${user.rascaintentos}/5\n`
  mensaje += `💰 *Tu saldo:* ¥${user.coin.toLocaleString()}\n\n`
  
  mensaje += `✨ *Premios posibles:*\n`
  mensaje += `💰 Dinero (100 - 10,000 monedas)\n`
  mensaje += `⚫ Carbón (5 - 50 unidades)\n`
  mensaje += `🔘 Hierro (3 - 30 unidades)\n`
  mensaje += `🟡 Oro (2 - 20 unidades)\n`
  mensaje += `💎 Diamante (1 - 5 unidades)\n`
  mensaje += `🟢 Esmeralda (1 - 3 unidades)\n`
  mensaje += `🔴 Redstone (5 - 40 unidades)\n`
  mensaje += `🔵 Lapislázuli (4 - 35 unidades)\n`
  mensaje += `⚪ Cuarzo (3 - 25 unidades)\n`
  mensaje += `🟠 Cobre (5 - 45 unidades)\n`
  mensaje += `❌ O nada...\n\n`
  
  mensaje += `📋 *Tablero (5x5):*\n`
  mensaje += `\`\`\`\n`
  mensaje += `   1  2  3  4  5\n`
  for (let letra of ['A', 'B', 'C', 'D', 'E']) {
    mensaje += `${letra} `
    for (let i = 1; i <= 5; i++) {
      mensaje += ' 🍩'
    }
    mensaje += '\n'
  }
  mensaje += `\`\`\`\n\n`
  mensaje += `🎮 *Juega ahora:*\n`
  mensaje += `*${usedPrefix}rascadona* [letra][número]\n`
  mensaje += `Ejemplo: *${usedPrefix}rascadona C3*`

  await conn.reply(m.chat, mensaje, m)
}

function generarPremio() {
  const premios = [
    // Dinero (40% de probabilidad)
    { tipo: 'coin', cantidad: () => Math.floor(Math.random() * 900) + 100, prob: 0.2 },
    { tipo: 'coin', cantidad: () => Math.floor(Math.random() * 1900) + 100, prob: 0.1 },
    { tipo: 'coin', cantidad: () => Math.floor(Math.random() * 4900) + 100, prob: 0.05 },
    { tipo: 'coin', cantidad: () => Math.floor(Math.random() * 9900) + 100, prob: 0.05 },
    
    // Recursos comunes (50% de probabilidad)
    { tipo: 'coal', cantidad: () => Math.floor(Math.random() * 45) + 5, prob: 0.15 },
    { tipo: 'iron', cantidad: () => Math.floor(Math.random() * 27) + 3, prob: 0.12 },
    { tipo: 'gold', cantidad: () => Math.floor(Math.random() * 18) + 2, prob: 0.08 },
    { tipo: 'redstone', cantidad: () => Math.floor(Math.random() * 35) + 5, prob: 0.07 },
    { tipo: 'lapis', cantidad: () => Math.floor(Math.random() * 31) + 4, prob: 0.05 },
    { tipo: 'quartz', cantidad: () => Math.floor(Math.random() * 22) + 3, prob: 0.04 },
    { tipo: 'copper', cantidad: () => Math.floor(Math.random() * 40) + 5, prob: 0.06 },
    
    // Recursos raros (9% de probabilidad)
    { tipo: 'diamond', cantidad: () => Math.floor(Math.random() * 4) + 1, prob: 0.04 },
    { tipo: 'emerald', cantidad: () => Math.floor(Math.random() * 2) + 1, prob: 0.03 },
    
    // Nada (1% de probabilidad)
    { tipo: 'nada', cantidad: () => 0, prob: 0.01 }
  ]

  // Seleccionar premio basado en probabilidades
  const random = Math.random()
  let acumulado = 0
  
  for (const premio of premios) {
    acumulado += premio.prob
    if (random <= acumulado) {
      return {
        tipo: premio.tipo,
        cantidad: premio.cantidad()
      }
    }
  }
  
  // Por defecto, dar dinero pequeño
  return { tipo: 'coin', cantidad: Math.floor(Math.random() * 100) + 50 }
}

function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60

  const partes = []
  if (hours > 0) partes.push(`${hours}h`)
  if (minutes > 0) partes.push(`${minutes}m`)
  if (seconds > 0) partes.push(`${seconds}s`)

  return partes.join(' ')
}

handler.help = ['rascadona', 'rascadonas']
handler.tags = ['economy', 'games', 'mine']
handler.command = ['rascadona', 'rascadonas', 'donamine', 'rascamine']
handler.group = true

export default handler
