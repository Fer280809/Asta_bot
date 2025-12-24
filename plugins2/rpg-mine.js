let handler = async (m, { conn, usedPrefix, command }) => {
  // Verificar economía activada
  if (!global.db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`⛏️ *¡Minas Cerradas!*\n\nUsa *${usedPrefix}economy on* para activar el sistema.`)
  }

  const user = global.db.data.users[m.sender]
  
  // Inicializar usuario
  if (!user) {
    global.db.data.users[m.sender] = {
      coin: 0,
      exp: 0,
      health: 100,
      hunger: 100,
      energy: 100,
      miningSkill: 0,
      // Recursos mineros
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
      // Materiales especiales
      obsidian: 0,
      glowstone: 0,
      // Herramientas
      pickaxe: 0,
      pickaxeDurability: 0,
      pickaxeLevel: 0
    }
    user = global.db.data.users[m.sender]
  }

  // Inicializar propiedades
  user.coin = user.coin || 0
  user.exp = user.exp || 0
  user.health = user.health || 100
  user.hunger = user.hunger || 100
  user.energy = user.energy || 100
  user.miningSkill = user.miningSkill || 0
  
  // Recursos mineros
  user.coal = user.coal || 0
  user.iron = user.iron || 0
  user.gold = user.gold || 0
  user.diamond = user.diamond || 0
  user.emerald = user.emerald || 0
  user.redstone = user.redstone || 0
  user.lapis = user.lapis || 0
  user.quartz = user.quartz || 0
  user.copper = user.copper || 0
  user.ancient_debris = user.ancient_debris || 0
  user.netherite = user.netherite || 0
  user.obsidian = user.obsidian || 0
  user.glowstone = user.glowstone || 0
  
  // Herramientas
  user.pickaxe = user.pickaxe || 0
  user.pickaxeDurability = user.pickaxeDurability || 0
  user.pickaxeLevel = user.pickaxeLevel || 0

  // Verificar salud crítica
  if (user.health < 25) {
    return conn.reply(m.chat,
      `💔 *¡Salud peligrosa!*\n\nTu salud es ${user.health}/100\n\n` +
      `🍖 Come comida nutritiva con *${usedPrefix}comer*\n` +
      `💊 Descansa con *${usedPrefix}descansar*\n` +
      `⚠️ Minar ahora sería muy peligroso`, m)
  }

  // Verificar hambre crítica
  if (user.hunger < 25) {
    return conn.reply(m.chat,
      `🍗 *¡Necesitas comer!*\n\nTu hambre es ${user.hunger}/100\n\n` +
      `🍽️ Usa *${usedPrefix}comer [alimento]*\n` +
      `⚡ Sin comida no tienes energía\n` +
      `⚠️ Te desmayarías en las minas`, m)
  }

  // Verificar energía
  if (user.energy < 25) {
    return conn.reply(m.chat,
      `⚡ *¡Agotado!*\n\nTu energía es ${user.energy}/100\n\n` +
      `💤 Usa *${usedPrefix}descansar*\n` +
      `🍰 Come algo energético\n` +
      `😴 Necesitas recuperar energía`, m)
  }

  // Verificar pico
  if (user.pickaxe === 0 || user.pickaxeDurability <= 0) {
    return conn.reply(m.chat,
      `⛏️ *¡Necesitas un pico!*\n\nSin pico no puedes minar.\n\n` +
      `🛒 *Picos disponibles:*\n` +
      `• Madera: ¥2,000 - *${usedPrefix}comprar pico madera*\n` +
      `• Piedra: ¥5,000 - *${usedPrefix}comprar pico piedra*\n` +
      `• Hierro: ¥15,000 - *${usedPrefix}comprar pico hierro*\n` +
      `• Diamante: ¥50,000 - *${usedPrefix}comprar pico diamante*\n` +
      `• Netherita: ¥100,000 - *${usedPrefix}comprar pico netherita*\n\n` +
      `⚒️ *O craftea uno:* *${usedPrefix}craft pico*`, m)
  }

  // Cooldown basado en el pico (mejor pico = menos cooldown)
  const cooldowns = {
    1: 5 * 60 * 1000,    // Madera: 5 minutos
    2: 4 * 60 * 1000,    // Piedra: 4 minutos
    3: 3 * 60 * 1000,    // Hierro: 3 minutos
    4: 2 * 60 * 1000,    // Diamante: 2 minutos
    5: 1 * 60 * 1000     // Netherita: 1 minuto
  }

  const cooldown = cooldowns[user.pickaxe] || 5 * 60 * 1000
  const now = Date.now()
  user.lastmine = user.lastmine || 0
  
  if (now < user.lastmine) {
    const restante = user.lastmine - now
    return conn.reply(m.chat,
      `⏰ *¡Minas en ventilación!*\n\nPuedes minar de nuevo en *${formatTime(restante)}*`, m)
  }

  // Actualizar tiempo y consumir recursos
  user.lastmine = now + cooldown
  user.hunger = Math.max(0, user.hunger - 25)
  user.energy = Math.max(0, user.energy - 25)
  
  // Posibilidad de perder salud por accidente (15-25%)
  const chanceAccidente = 0.25 - (user.miningSkill * 0.005)
  if (Math.random() < chanceAccidente) {
    const dano = Math.floor(Math.random() * 15) + 5
    user.health = Math.max(1, user.health - dano)
  }

  // Mejorar habilidad de minería
  user.miningSkill = Math.min((user.miningSkill || 0) + 0.15, 50)
  
  // Reducir durabilidad
  const durabilidadPerdida = Math.max(1, 6 - user.pickaxe)
  user.pickaxeDurability = Math.max(0, user.pickaxeDurability - durabilidadPerdida)

  // Bonus por nivel y pico
  const bonusSkill = 1 + (user.miningSkill * 0.04)
  const bonusPickaxe = [0, 1, 1.2, 1.5, 2, 3][user.pickaxe]
  
  // Tablas de recursos por nivel de pico
  const recursosPorPico = {
    1: [ // Madera (solo piedra y carbón básico)
      { nombre: 'coal', min: 1, max: 3, prob: 0.8, emoji: '⚫' },
      { nombre: 'copper', min: 1, max: 2, prob: 0.3, emoji: '🟠' }
    ],
    2: [ // Piedra
      { nombre: 'coal', min: 2, max: 5, prob: 0.85, emoji: '⚫' },
      { nombre: 'iron', min: 1, max: 3, prob: 0.4, emoji: '🔘' },
      { nombre: 'copper', min: 1, max: 3, prob: 0.5, emoji: '🟠' },
      { nombre: 'lapis', min: 1, max: 2, prob: 0.2, emoji: '🔵' }
    ],
    3: [ // Hierro
      { nombre: 'coal', min: 3, max: 7, prob: 0.9, emoji: '⚫' },
      { nombre: 'iron', min: 2, max: 5, prob: 0.6, emoji: '🔘' },
      { nombre: 'gold', min: 1, max: 2, prob: 0.3, emoji: '🟡' },
      { nombre: 'redstone', min: 1, max: 4, prob: 0.5, emoji: '🔴' },
      { nombre: 'lapis', min: 1, max: 3, prob: 0.4, emoji: '🔵' },
      { nombre: 'diamond', min: 1, max: 1, prob: 0.1, emoji: '💎' }
    ],
    4: [ // Diamante
      { nombre: 'coal', min: 5, max: 10, prob: 0.9, emoji: '⚫' },
      { nombre: 'iron', min: 3, max: 7, prob: 0.7, emoji: '🔘' },
      { nombre: 'gold', min: 2, max: 4, prob: 0.5, emoji: '🟡' },
      { nombre: 'diamond', min: 1, max: 2, prob: 0.2, emoji: '💎' },
      { nombre: 'emerald', min: 1, max: 1, prob: 0.15, emoji: '🟢' },
      { nombre: 'redstone', min: 2, max: 6, prob: 0.6, emoji: '🔴' },
      { nombre: 'lapis', min: 2, max: 5, prob: 0.5, emoji: '🔵' },
      { nombre: 'quartz', min: 1, max: 4, prob: 0.4, emoji: '⚪' },
      { nombre: 'obsidian', min: 1, max: 1, prob: 0.05, emoji: '🪨' }
    ],
    5: [ // Netherita
      { nombre: 'coal', min: 8, max: 15, prob: 0.9, emoji: '⚫' },
      { nombre: 'iron', min: 5, max: 10, prob: 0.8, emoji: '🔘' },
      { nombre: 'gold', min: 3, max: 6, prob: 0.6, emoji: '🟡' },
      { nombre: 'diamond', min: 1, max: 3, prob: 0.3, emoji: '💎' },
      { nombre: 'emerald', min: 1, max: 2, prob: 0.2, emoji: '🟢' },
      { nombre: 'redstone', min: 3, max: 8, prob: 0.7, emoji: '🔴' },
      { nombre: 'lapis', min: 3, max: 7, prob: 0.6, emoji: '🔵' },
      { nombre: 'quartz', min: 2, max: 6, prob: 0.5, emoji: '⚪' },
      { nombre: 'ancient_debris', min: 1, max: 1, prob: 0.1, emoji: '♨️' },
      { nombre: 'netherite', min: 1, max: 1, prob: 0.05, emoji: '🔥' },
      { nombre: 'obsidian', min: 1, max: 2, prob: 0.1, emoji: '🪨' },
      { nombre: 'glowstone', min: 1, max: 3, prob: 0.4, emoji: '✨' }
    ]
  }

  // Generar recursos
  let recursosObtenidos = {}
  let totalRecursos = 0
  const tablaRecursos = recursosPorPico[user.pickaxe] || recursosPorPico[1]
  
  tablaRecursos.forEach(recurso => {
    if (Math.random() < recurso.prob * bonusSkill * bonusPickaxe) {
      const cantidad = Math.floor(Math.random() * (recurso.max - recurso.min + 1)) + recurso.min
      recursosObtenidos[recurso.nombre] = (recursosObtenidos[recurso.nombre] || 0) + cantidad
      totalRecursos += cantidad
      
      // Actualizar inventario
      user[recurso.nombre] = (user[recurso.nombre] || 0) + cantidad
    }
  })

  // Si no obtuvo nada, dar mínimo de carbón
  if (Object.keys(recursosObtenidos).length === 0) {
    const carbonMinimo = Math.floor(Math.random() * 2) + 1
    user.coal += carbonMinimo
    recursosObtenidos.coal = carbonMinimo
    totalRecursos = carbonMinimo
  }

  // Calcular dinero y experiencia
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
    netherite: 1000,
    obsidian: 100,
    glowstone: 40
  }

  let dineroGanado = 0
  for (const [recurso, cantidad] of Object.entries(recursosObtenidos)) {
    if (valores[recurso]) {
      dineroGanado += cantidad * valores[recurso] * bonusPickaxe
    }
  }

  const experienciaGanada = Math.floor(totalRecursos * 8 * bonusSkill * bonusPickaxe)

  user.coin += dineroGanado
  user.exp += experienciaGanada

  // Determinar tipo de mina encontrada
  let tipoMina = 'mina común'
  if (Object.keys(recursosObtenidos).includes('diamond') || Object.keys(recursosObtenidos).includes('emerald')) {
    tipoMina = '💎 VETA DE GEMAS'
  } else if (Object.keys(recursosObtenidos).includes('ancient_debris') || Object.keys(recursosObtenidos).includes('netherite')) {
    tipoMina = '🔥 MINA DEL NETHER'
  } else if (Object.keys(recursosObtenidos).includes('gold')) {
    tipoMina = '🟡 MINA DE ORO'
  }

  // Construir mensaje
  const nombrePico = ['Ninguno', 'Madera', 'Piedra', 'Hierro', 'Diamante', 'Netherita'][user.pickaxe]
  
  let resultado = `⛏️ *MINANDO CON PICOS DE ${nombrePico.toUpperCase()}* ⛰️\n\n`
  resultado += `📍 *Tipo de mina:* ${tipoMina}\n\n`
  
  if (Object.keys(recursosObtenidos).length > 0) {
    resultado += `📦 *Recursos obtenidos:*\n`
    for (const [recurso, cantidad] of Object.entries(recursosObtenidos)) {
      const emojis = {
        coal: '⚫', iron: '🔘', gold: '🟡', diamond: '💎',
        emerald: '🟢', redstone: '🔴', lapis: '🔵', quartz: '⚪',
        copper: '🟠', ancient_debris: '♨️', netherite: '🔥',
        obsidian: '🪨', glowstone: '✨'
      }
      const nombres = {
        coal: 'Carbón', iron: 'Hierro', gold: 'Oro', diamond: 'Diamante',
        emerald: 'Esmeralda', redstone: 'Redstone', lapis: 'Lapislázuli',
        quartz: 'Cuarzo', copper: 'Cobre', ancient_debris: 'Escombros antiguos',
        netherite: 'Netherita', obsidian: 'Obsidiana', glowstone: 'Piedra luminosa'
      }
      resultado += `• ${emojis[recurso] || '📦'} ${nombres[recurso] || recurso}: ${cantidad}\n`
    }
    
    resultado += `\n💰 *Dinero ganado:* ¥${dineroGanado.toLocaleString()}\n`
    resultado += `⭐ *Experiencia:* +${experienciaGanada} XP\n`
  } else {
    resultado += `❌ *No encontraste recursos esta vez*\n`
  }
  
  resultado += `🍗 *Hambre consumida:* -25 (${user.hunger}/100)\n`
  resultado += `⚡ *Energía usada:* -25 (${user.energy}/100)\n`
  if (user.health < 100) resultado += `❤️ *Salud:* ${user.health}/100\n`
  resultado += `🔨 *Durabilidad pico:* -${durabilidadPerdida} (${user.pickaxeDurability})\n`
  resultado += `⛏️ *Nivel minería:* ${user.miningSkill.toFixed(1)}/50\n`
  resultado += `⏰ *Próxima minería:* ${formatTime(cooldown)}\n`
  
  if (user.pickaxeDurability <= 0) {
    resultado += `\n💔 *¡Tu pico se rompió!* Necesitas uno nuevo.\n`
  }
  
  resultado += `\n━━━━━━━━━━━━━━━━━━━━\n`
  resultado += `💰 *Monedas:* ¥${user.coin.toLocaleString()}\n`
  resultado += `⭐ *Experiencia total:* ${user.exp.toLocaleString()} XP\n`
  
  // Mostrar recursos más importantes
  if (user.coal > 0) resultado += `⚫ *Carbón:* ${user.coal}\n`
  if (user.iron > 0) resultado += `🔘 *Hierro:* ${user.iron}\n`
  if (user.gold > 0) resultado += `🟡 *Oro:* ${user.gold}\n`
  if (user.diamond > 0) resultado += `💎 *Diamante:* ${user.diamond}\n`
  if (user.emerald > 0) resultado += `🟢 *Esmeralda:* ${user.emerald}\n`
  if (user.netherite > 0) resultado += `🔥 *Netherita:* ${user.netherite}\n\n`
  
  // Consejos según estado
  if (user.hunger < 30) {
    resultado += `⚠️ *Tu hambre es baja.* Come algo pronto.\n`
  }
  if (user.energy < 30) {
    resultado += `⚠️ *Tu energía es baja.* Descansa pronto.\n`
  }
  if (user.health < 50) {
    resultado += `⚠️ *Tu salud es media.* Considera descansar.\n`
  }
  
  // Consejo especial para mejorar
  if (user.miningSkill > 30 && user.pickaxe < 5) {
    resultado += `\n💡 *Consejo:* Ya tienes suficiente nivel para un pico de netherita. ¡Mejora tu pico!`
  }

  await conn.reply(m.chat, resultado, m)
  
  // Efecto especial si encontró algo muy valioso
  if (Object.keys(recursosObtenidos).includes('diamond') || 
      Object.keys(recursosObtenidos).includes('emerald') || 
      Object.keys(recursosObtenidos).includes('netherite')) {
    
    setTimeout(async () => {
      await conn.sendMessage(m.chat, {
        text: `💎 *¡ENCONTRASTE UN TESORO RARO!*\n¡Has descubierto recursos valiosos en la mina!`
      }, { quoted: m })
    }, 1500)
  }
}

// Función para formatear tiempo
function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSec / 60)
  const seconds = totalSec % 60
  const partes = []
  if (minutes > 0) partes.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`)
  if (seconds > 0) partes.push(`${seconds} segundo${seconds !== 1 ? 's' : ''}`)
  return partes.join(' ')
}

handler.help = ['minar', 'mine', 'mineria']
handler.tags = ['economy', 'survival']
handler.command = ['minar', 'mine', 'mineria']
handler.group = true
export default handler
