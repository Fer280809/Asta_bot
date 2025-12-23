let handler = async (m, { conn, usedPrefix, command }) => {
  // Verificar economía activada
  if (!global.db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`🔨 *¡Minería Bloqueada!*\n\nUsa *${usedPrefix}economy on* para activar la minería en este grupo.`)
  }

  const user = global.db.data.users[m.sender]
  
  // Inicializar usuario si no existe
  if (!user) {
    global.db.data.users[m.sender] = {
      coin: 0,
      exp: 0,
      health: 100,
      lastmine: 0,
      miningSkill: 0,
      // Sistema de picos (0: ninguno, 1: madera, 2: piedra, 3: hierro, 4: diamante, 5: netherita)
      pickaxe: 0,
      pickaxeDurability: 0,
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
      netherite: 0,
      // Materiales para crafteo
      wood: 0,
      cobblestone: 0,
      stick: 0,
      // Materiales especiales
      obsidian: 0,
      blaze_rod: 0,
      ender_pearl: 0
    }
    user = global.db.data.users[m.sender]
  }

  // Inicializar todas las propiedades necesarias
  const defaults = {
    coin: 0,
    exp: 0,
    health: 100,
    lastmine: 0,
    miningSkill: 0,
    pickaxe: 0,
    pickaxeDurability: 0,
    coal: 0, iron: 0, gold: 0, diamond: 0, emerald: 0,
    redstone: 0, lapis: 0, quartz: 0, copper: 0,
    ancient_debris: 0, netherite: 0,
    wood: 0, cobblestone: 0, stick: 0,
    obsidian: 0, blaze_rod: 0, ender_pearl: 0
  }

  for (const key in defaults) {
    if (user[key] === undefined) user[key] = defaults[key]
  }

  // Verificar si tiene pico
  if (user.pickaxe === 0 || user.pickaxeDurability <= 0) {
    return conn.reply(m.chat, 
      `🔨 *¡Necesitas un pico!*\n\nNo tienes pico o está roto.\n\n` +
      `🛒 *Picos disponibles:*\n` +
      `• *${usedPrefix}comprar madera* - ¥2,000 (Durabilidad: 50)\n` +
      `• *${usedPrefix}comprar piedra* - ¥5,000 (Durabilidad: 100)\n` +
      `• *${usedPrefix}comprar hierro* - ¥15,000 (Durabilidad: 200)\n` +
      `• *${usedPrefix}comprar diamante* - ¥50,000 (Durabilidad: 500)\n` +
      `• *${usedPrefix}comprar netherita* - ¥100,000 (Durabilidad: 1000)\n\n` +
      `⚒️ *O craftea uno con:*\n` +
      `• *${usedPrefix}craft madera* (3 madera + 2 palos)\n` +
      `• *${usedPrefix}craft piedra* (3 piedra + 2 palos)\n` +
      `• *${usedPrefix}craft hierro* (3 hierro + 2 palos)\n` +
      `• *${usedPrefix}craft diamante* (3 diamante + 2 palos)\n` +
      `• *${usedPrefix}craft netherita* (3 netherita + 2 palos)`, m)
  }

  // Verificar salud
  if (user.health < 10) {
    return conn.reply(m.chat, 
      `❤️ *¡Poca salud!*\n\nTu salud es ${user.health}/100\n\n` +
      `🍎 Usa *${usedPrefix}heal* para recuperar salud\n` +
      `🍗 Usa *${usedPrefix}comida* para comer\n` +
      `💤 Usa *${usedPrefix}descansar* para descansar`, m)
  }

  // Cooldown basado en el pico (mejor pico = menos cooldown)
  const cooldowns = {
    1: 5 * 60 * 1000,    // Madera: 5 minutos
    2: 4 * 60 * 1000,    // Piedra: 4 minutos
    3: 3 * 60 * 1000,    // Hierro: 3 minutos
    4: 2 * 60 * 1000,    // Diamante: 2 minutos
    5: 1 * 60 * 1000     // Netherita: 1 minuto
  }

  const gap = cooldowns[user.pickaxe] || 5 * 60 * 1000
  const now = Date.now()

  // Verificar cooldown
  if (now < user.lastmine) {
    const restante = user.lastmine - now
    return conn.reply(m.chat, 
      `⏰ *¡Espera!*\n\nPuedes minar de nuevo en *${formatTime(restante)}*\n\n` +
      `⚒️ *Mientras tanto:*\n` +
      `• Revisa tu inventario: *${usedPrefix}inventario*\n` +
      `• Repara tu pico: *${usedPrefix}reparar*\n` +
      `• Ve a cazar: *${usedPrefix}cazar*`, m)
  }

  // Actualizar tiempo de última minería
  user.lastmine = now + gap

  // Reducir durabilidad
  const durabilidadPerdida = Math.max(1, 6 - user.pickaxe)
  user.pickaxeDurability = Math.max(0, user.pickaxeDurability - durabilidadPerdida)

  // Reducir salud
  user.health -= Math.floor(Math.random() * 5) + 1

  // Mejorar habilidad de minería
  user.miningSkill = Math.min(user.miningSkill + 0.1, 50)

  // Bonus por nivel de habilidad
  const bonusSkill = 1 + (user.miningSkill * 0.02)
  
  // Bonus por tipo de pico
  const bonusPickaxe = [0, 1, 1.2, 1.5, 2, 3][user.pickaxe]

  // Generar recursos según el pico
  let recursosGanados = {}
  let monedasGanadas = 0
  let experienciaGanada = 0

  // Tablas de recursos por nivel de pico
  const recursosPorPico = {
    1: [ // Madera
      { nombre: 'coal', min: 1, max: 5, prob: 0.8 },
      { nombre: 'copper', min: 1, max: 3, prob: 0.6 },
      { nombre: 'iron', min: 1, max: 2, prob: 0.3 }
    ],
    2: [ // Piedra
      { nombre: 'coal', min: 3, max: 8, prob: 0.9 },
      { nombre: 'copper', min: 2, max: 5, prob: 0.7 },
      { nombre: 'iron', min: 1, max: 4, prob: 0.5 },
      { nombre: 'lapis', min: 1, max: 3, prob: 0.3 }
    ],
    3: [ // Hierro
      { nombre: 'coal', min: 5, max: 12, prob: 0.9 },
      { nombre: 'iron', min: 3, max: 7, prob: 0.8 },
      { nombre: 'gold', min: 1, max: 4, prob: 0.4 },
      { nombre: 'redstone', min: 2, max: 6, prob: 0.5 },
      { nombre: 'lapis', min: 2, max: 5, prob: 0.4 },
      { nombre: 'diamond', min: 1, max: 2, prob: 0.1 }
    ],
    4: [ // Diamante
      { nombre: 'coal', min: 8, max: 16, prob: 0.9 },
      { nombre: 'iron', min: 5, max: 10, prob: 0.9 },
      { nombre: 'gold', min: 3, max: 8, prob: 0.6 },
      { nombre: 'diamond', min: 1, max: 3, prob: 0.3 },
      { nombre: 'emerald', min: 1, max: 2, prob: 0.2 },
      { nombre: 'redstone', min: 4, max: 10, prob: 0.7 },
      { nombre: 'lapis', min: 3, max: 8, prob: 0.6 },
      { nombre: 'quartz', min: 2, max: 6, prob: 0.4 }
    ],
    5: [ // Netherita
      { nombre: 'coal', min: 10, max: 20, prob: 0.9 },
      { nombre: 'iron', min: 8, max: 15, prob: 0.9 },
      { nombre: 'gold', min: 5, max: 12, prob: 0.7 },
      { nombre: 'diamond', min: 2, max: 5, prob: 0.5 },
      { nombre: 'emerald', min: 1, max: 4, prob: 0.3 },
      { nombre: 'redstone', min: 6, max: 14, prob: 0.8 },
      { nombre: 'lapis', min: 4, max: 10, prob: 0.7 },
      { nombre: 'quartz', min: 3, max: 8, prob: 0.6 },
      { nombre: 'ancient_debris', min: 1, max: 2, prob: 0.15 },
      { nombre: 'netherite', min: 1, max: 1, prob: 0.05 }
    ]
  }

  // Generar recursos
  const tablaRecursos = recursosPorPico[user.pickaxe] || recursosPorPico[1]
  
  tablaRecursos.forEach(recurso => {
    if (Math.random() < recurso.prob * bonusSkill * bonusPickaxe) {
      const cantidad = Math.floor(Math.random() * (recurso.max - recurso.min + 1)) + recurso.min
      recursosGanados[recurso.nombre] = (recursosGanados[recurso.nombre] || 0) + cantidad
      
      // Actualizar inventario
      switch(recurso.nombre) {
        case 'coal': user.coal += cantidad; break
        case 'iron': user.iron += cantidad; break
        case 'gold': user.gold += cantidad; break
        case 'diamond': user.diamond += cantidad; break
        case 'emerald': user.emerald += cantidad; break
        case 'redstone': user.redstone += cantidad; break
        case 'lapis': user.lapis += cantidad; break
        case 'quartz': user.quartz += cantidad; break
        case 'copper': user.copper += cantidad; break
        case 'ancient_debris': user.ancient_debris += cantidad; break
        case 'netherite': user.netherite += cantidad; break
      }
    }
  })

  // Generar dinero basado en recursos obtenidos
  const valores = {
    coal: 10,
    iron: 25,
    gold: 50,
    diamond: 200,
    emerald: 300,
    redstone: 15,
    lapis: 20,
    quartz: 30,
    copper: 15,
    ancient_debris: 500,
    netherite: 1000
  }

  for (const [recurso, cantidad] of Object.entries(recursosGanados)) {
    if (valores[recurso]) {
      monedasGanadas += cantidad * valores[recurso] * bonusPickaxe
    }
  }

  // Si no obtuvo recursos, ganar dinero mínimo
  if (Object.keys(recursosGanados).length === 0) {
    monedasGanadas = Math.floor(Math.random() * 100) + 50
  }

  // Generar experiencia
  experienciaGanada = Math.floor(10 * bonusPickaxe * bonusSkill) + Object.keys(recursosGanados).length * 5

  // Aplicar ganancias
  user.coin += monedasGanadas
  user.exp += experienciaGanada

  // Verificar si el pico se rompió
  let mensajeRoto = ''
  if (user.pickaxeDurability <= 0) {
    mensajeRoto = `\n💔 *¡Tu pico se rompió!* Necesitas uno nuevo.`
  }

  // Construir mensaje de resultado
  const nombrePico = ['Ninguno', 'Madera', 'Piedra', 'Hierro', 'Diamante', 'Netherita'][user.pickaxe]
  
  let resultado = `⛏️ *MINERÍA CON ${nombrePico.toUpperCase()}* 🔨\n\n`
  
  if (Object.keys(recursosGanados).length > 0) {
    resultado += `📦 *Recursos obtenidos:*\n`
    for (const [recurso, cantidad] of Object.entries(recursosGanados)) {
      resultado += `• ${formatearNombre(recurso)}: ${cantidad}\n`
    }
    resultado += `\n💰 *Dinero ganado:* ¥${monedasGanadas.toLocaleString()}\n`
  } else {
    resultado += `❌ *No encontraste recursos esta vez*\n`
    resultado += `💰 *Dinero de consolación:* ¥${monedasGanadas.toLocaleString()}\n`
  }
  
  resultado += `⭐ *Experiencia:* +${experienciaGanada} XP\n`
  resultado += `🔨 *Durabilidad:* -${durabilidadPerdida} (${user.pickaxeDurability})\n`
  resultado += `❤️ *Salud:* -${Math.floor(Math.random() * 5) + 1} (${user.health}/100)\n`
  resultado += `📈 *Nivel minería:* ${user.miningSkill.toFixed(1)}/50\n`
  resultado += `⏰ *Próximo minado:* ${formatTime(gap)}\n`
  resultado += mensajeRoto
  resultado += `\n━━━━━━━━━━━━━━━━━━━━\n`
  resultado += `💰 *Monedas:* ¥${user.coin.toLocaleString()}\n`
  resultado += `⭐ *Experiencia total:* ${user.exp.toLocaleString()} XP\n\n`
  
  // Mostrar recursos acumulados si hay
  const tieneRecursos = [user.coal, user.iron, user.gold, user.diamond, user.emerald, user.redstone, user.lapis, user.quartz, user.copper, user.ancient_debris, user.netherite]
    .some(cantidad => cantidad > 0)
  
  if (tieneRecursos) {
    resultado += `🎒 *Inventario de recursos:*\n`
    if (user.coal > 0) resultado += `• Carbón: ${user.coal}\n`
    if (user.iron > 0) resultado += `• Hierro: ${user.iron}\n`
    if (user.gold > 0) resultado += `• Oro: ${user.gold}\n`
    if (user.diamond > 0) resultado += `• Diamante: ${user.diamond}\n`
    if (user.emerald > 0) resultado += `• Esmeralda: ${user.emerald}\n`
    if (user.redstone > 0) resultado += `• Redstone: ${user.redstone}\n`
    if (user.lapis > 0) resultado += `• Lapislázuli: ${user.lapis}\n`
    if (user.quartz > 0) resultado += `• Cuarzo: ${user.quartz}\n`
    if (user.copper > 0) resultado += `• Cobre: ${user.copper}\n`
    if (user.ancient_debris > 0) resultado += `• Escombros antiguos: ${user.ancient_debris}\n`
    if (user.netherite > 0) resultado += `• Netherita: ${user.netherite}\n`
  }

  // Enviar mensaje
  await conn.reply(m.chat, resultado, m)

  // Efecto especial si encontró algo raro
  if (Object.keys(recursosGanados).includes('diamond') || Object.keys(recursosGanados).includes('emerald') || Object.keys(recursosGanados).includes('netherite')) {
    setTimeout(() => {
      conn.sendMessage(m.chat, { 
        text: `💎 *¡ENCONTRASTE UN TESORO!*\n¡Has minado recursos valiosos! Sigue así minero.` 
      }, { quoted: m })
    }, 1000)
  }
}

// Funciones auxiliares
function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60
  const partes = []
  if (minutes > 0) partes.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`)
  if (seconds > 0) partes.push(`${seconds} segundo${seconds !== 1 ? 's' : ''}`)
  return partes.join(' ')
}

function formatearNombre(recurso) {
  const nombres = {
    coal: 'Carbón',
    iron: 'Hierro',
    gold: 'Oro',
    diamond: 'Diamante',
    emerald: 'Esmeralda',
    redstone: 'Redstone',
    lapis: 'Lapislázuli',
    quartz: 'Cuarzo',
    copper: 'Cobre',
    ancient_debris: 'Escombros antiguos',
    netherite: 'Netherita'
  }
  return nombres[recurso] || recurso
}

handler.help = ['minar', 'mine']
handler.tags = ['economy', 'mine']
handler.command = ['minar', 'mine']
handler.group = true
handler.limit = true

export default handler
