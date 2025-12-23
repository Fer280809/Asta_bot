let handler = async (m, { conn, usedPrefix, command }) => {
  // Verificar economía activada
  if (!global.db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`🎄 *¡Bosque Congelado!*\n\nUsa *${usedPrefix}economy on* para activar el sistema.`)
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
      woodcutting: 0,
      wood: 0,
      apple: 0,
      sapling: 0,
      axe: 0,
      axeDurability: 0
    }
    user = global.db.data.users[m.sender]
  }

  // Inicializar propiedades
  user.coin = user.coin || 0
  user.exp = user.exp || 0
  user.health = user.health || 100
  user.hunger = user.hunger || 100
  user.energy = user.energy || 100
  user.woodcutting = user.woodcutting || 0
  user.wood = user.wood || 0
  user.apple = user.apple || 0
  user.sapling = user.sapling || 0
  user.axe = user.axe || 0
  user.axeDurability = user.axeDurability || 0

  // Verificar salud crítica
  if (user.health < 20) {
    return conn.reply(m.chat,
      `💔 *¡Salud crítica!*\n\nTu salud es ${user.health}/100\n\n` +
      `🍎 Come algo usando *${usedPrefix}comer*\n` +
      `💊 Descansa para recuperarte\n` +
      `⚠️ No puedes trabajar con tan poca salud`, m)
  }

  // Verificar hambre crítica
  if (user.hunger < 20) {
    return conn.reply(m.chat,
      `🍗 *¡Mucha hambre!*\n\nTu hambre es ${user.hunger}/100\n\n` +
      `🍽️ Come algo usando *${usedPrefix}comer*\n` +
      `🍎 Busca comida primero\n` +
      `⚠️ No tienes energía para trabajar`, m)
  }

  // Verificar energía
  if (user.energy < 20) {
    return conn.reply(m.chat,
      `⚡ *¡Sin energía!*\n\nTu energía es ${user.energy}/100\n\n` +
      `🍖 Come algo nutritivo\n` +
      `💤 Descansa con *${usedPrefix}descansar*\n` +
      `😴 Necesitas recuperar energía`, m)
  }

  // Verificar hacha
  if (user.axe === 0 || user.axeDurability <= 0) {
    return conn.reply(m.chat,
      `🪓 *¡Necesitas un hacha!*\n\nSin hacha no puedes talar árboles.\n\n` +
      `🛒 *Hachas disponibles:*\n` +
      `• Madera: ¥2,000 - *${usedPrefix}comprar hacha madera*\n` +
      `• Piedra: ¥5,000 - *${usedPrefix}comprar hacha piedra*\n` +
      `• Hierro: ¥15,000 - *${usedPrefix}comprar hacha hierro*\n\n` +
      `⚒️ *O craftea una:* *${usedPrefix}craft hacha*`, m)
  }

  // Cooldown
  const cooldown = 3 * 60 * 1000 // 3 minutos
  const now = Date.now()
  user.lastchop = user.lastchop || 0
  
  if (now < user.lastchop) {
    const restante = user.lastchop - now
    return conn.reply(m.chat,
      `⏰ *¡Descansa un poco!*\n\nPuedes talar de nuevo en *${formatTime(restante)}*`, m)
  }

  // Actualizar tiempo y consumir recursos
  user.lastchop = now + cooldown
  user.hunger = Math.max(0, user.hunger - 15)
  user.energy = Math.max(0, user.energy - 15)
  
  // Posibilidad de perder salud (10%)
  if (Math.random() < 0.1) {
    user.health = Math.max(1, user.health - 5)
  }

  // Mejorar habilidad
  user.woodcutting = Math.min((user.woodcutting || 0) + 0.1, 30)
  
  // Reducir durabilidad
  const durabilidadPerdida = Math.max(1, 5 - user.axe)
  user.axeDurability = Math.max(0, user.axeDurability - durabilidadPerdida)

  // Bonus por nivel y hacha
  const bonusSkill = 1 + (user.woodcutting * 0.03)
  const bonusAxe = [0, 1, 1.5, 2, 3][user.axe]
  
  // Generar recursos
  let madera = Math.floor((Math.random() * 8 + 4) * bonusSkill * bonusAxe)
  let manzanas = Math.random() < 0.2 ? Math.floor(Math.random() * 2) + 1 : 0
  let brotes = Math.random() < 0.1 ? Math.floor(Math.random() * 2) + 1 : 0

  // Aplicar recursos
  user.wood += madera
  if (manzanas > 0) user.apple += manzanas
  if (brotes > 0) user.sapling += brotes

  // Ganar experiencia y dinero
  const experiencia = Math.floor(madera * 2 * bonusSkill)
  const dinero = Math.floor(madera * 15 * bonusAxe)
  
  user.exp += experiencia
  user.coin += dinero

  // Construir mensaje
  const nombreHacha = ['Ninguna', 'Madera', 'Piedra', 'Hierro', 'Diamante'][user.axe]
  
  let resultado = `🪓 *TALANDO CON HACHA DE ${nombreHacha.toUpperCase()}* 🎄\n\n`
  
  resultado += `📦 *Recursos obtenidos:*\n`
  resultado += `• 🪵 Madera: +${madera}\n`
  if (manzanas > 0) resultado += `• 🍎 Manzanas: +${manzanas}\n`
  if (brotes > 0) resultado += `• 🌱 Brotes: +${brotes}\n`
  
  resultado += `\n💰 *Dinero ganado:* ¥${dinero.toLocaleString()}\n`
  resultado += `⭐ *Experiencia:* +${experiencia} XP\n`
  resultado += `🍗 *Hambre consumida:* -15 (${user.hunger}/100)\n`
  resultado += `⚡ *Energía usada:* -15 (${user.energy}/100)\n`
  if (user.health < 100) resultado += `❤️ *Salud:* ${user.health}/100\n`
  resultado += `🔨 *Durabilidad hacha:* -${durabilidadPerdida} (${user.axeDurability})\n`
  resultado += `🪓 *Nivel tala:* ${user.woodcutting.toFixed(1)}/30\n`
  resultado += `⏰ *Próximo tala:* ${formatTime(cooldown)}\n`
  
  if (user.axeDurability <= 0) {
    resultado += `\n💔 *¡Tu hacha se rompió!* Necesitas una nueva.\n`
  }
  
  resultado += `\n━━━━━━━━━━━━━━━━━━━━\n`
  resultado += `💰 *Monedas:* ¥${user.coin.toLocaleString()}\n`
  resultado += `⭐ *Experiencia total:* ${user.exp.toLocaleString()} XP\n`
  resultado += `🪵 *Madera:* ${user.wood}\n`
  resultado += `🍎 *Manzanas:* ${user.apple}\n`
  resultado += `🌱 *Brotes:* ${user.sapling}\n\n`
  
  // Consejos si los niveles son bajos
  if (user.hunger < 30) {
    resultado += `⚠️ *Tu hambre es baja.* Come algo pronto.\n`
  }
  if (user.energy < 30) {
    resultado += `⚠️ *Tu energía es baja.* Descansa pronto.\n`
  }

  await conn.reply(m.chat, resultado, m)
}

function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60
  const partes = []
  if (minutes > 0) partes.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`)
  if (seconds > 0) partes.push(`${seconds} segundo${seconds !== 1 ? 's' : ''}`)
  return partes.join(' ')
}

handler.help = ['talar', 'chop']
handler.tags = ['economy', 'survival']
handler.command = ['talar', 'chop', 'cortar']
handler.group = true
export default handler
