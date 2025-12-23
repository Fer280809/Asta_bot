let handler = async (m, { conn, usedPrefix, command }) => {
  if (!global.db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`🎄 *¡Bosque Congelado!*\n\nUsa *${usedPrefix}economy on* para activar el sistema.`)
  }

  const user = global.db.data.users[m.sender]
  
  // Inicializar usuario
  if (!user) global.db.data.users[m.sender] = {}
  user = global.db.data.users[m.sender]
  
  // Propiedades necesarias
  user.coin = user.coin || 0
  user.exp = user.exp || 0
  user.health = user.health || 100
  user.energy = user.energy || 100
  user.lastchop = user.lastchop || 0
  user.woodcutting = user.woodcutting || 0
  
  // Recursos
  user.wood = user.wood || 0
  user.oak_log = user.oak_log || 0
  user.spruce_log = user.spruce_log || 0
  user.birch_log = user.birch_log || 0
  user.jungle_log = user.jungle_log || 0
  user.acacia_log = user.acacia_log || 0
  user.dark_oak_log = user.dark_oak_log || 0
  user.apple = user.apple || 0
  user.sapling = user.sapling || 0
  
  // Herramientas
  user.axe = user.axe || 0
  user.axeDurability = user.axeDurability || 0

  // Verificar hacha
  if (user.axe === 0 || user.axeDurability <= 0) {
    return conn.reply(m.chat,
      `🪓 *¡Necesitas un hacha!*\n\nSin hacha no puedes talar árboles.\n\n` +
      `🛒 *Hachas disponibles:*\n` +
      `• Madera: ¥2,000 - *${usedPrefix}comprar hacha madera*\n` +
      `• Piedra: ¥5,000 - *${usedPrefix}comprar hacha piedra*\n` +
      `• Hierro: ¥15,000 - *${usedPrefix}comprar hacha hierro*\n` +
      `• Diamante: ¥50,000 - *${usedPrefix}comprar hacha diamante*\n` +
      `• Netherita: ¥100,000 - *${usedPrefix}comprar hacha netherita*\n\n` +
      `⚒️ *O craftea una:* *${usedPrefix}craft hacha*`, m)
  }

  // Verificar energía
  if (user.energy < 15) {
    return conn.reply(m.chat,
      `⚡ *¡Sin energía!*\n\nTu energía es ${user.energy}/100\n\n` +
      `🍎 Usa *${usedPrefix}comida* para recuperar energía\n` +
      `💤 Usa *${usedPrefix}descansar* para descansar`, m)
  }

  // Cooldown
  const cooldown = 3 * 60 * 1000 // 3 minutos
  const now = Date.now()
  
  if (now < user.lastchop) {
    const restante = user.lastchop - now
    return conn.reply(m.chat,
      `⏰ *¡Descansa un poco!*\n\nPuedes talar de nuevo en *${formatTime(restante)}*`, m)
  }

  user.lastchop = now + cooldown
  user.energy -= 15
  user.woodcutting = Math.min((user.woodcutting || 0) + 0.1, 30)
  
  // Reducir durabilidad
  const durabilidadPerdida = Math.max(1, 5 - user.axe)
  user.axeDurability = Math.max(0, user.axeDurability - durabilidadPerdida)

  // Bonus por nivel y hacha
  const bonusSkill = 1 + (user.woodcutting * 0.03)
  const bonusAxe = [0, 1, 1.5, 2, 3, 4][user.axe]
  
  // Tipos de árboles y sus probabilidades
  const arboles = [
    { tipo: 'madera_normal', prob: 0.7, madera: () => Math.floor(Math.random() * 8) + 3 },
    { tipo: 'roble', prob: 0.4, madera: () => Math.floor(Math.random() * 6) + 2 },
    { tipo: 'abeto', prob: 0.3, madera: () => Math.floor(Math.random() * 7) + 3 },
    { tipo: 'abedul', prob: 0.3, madera: () => Math.floor(Math.random() * 6) + 2 },
    { tipo: 'jungla', prob: 0.2, madera: () => Math.floor(Math.random() * 10) + 5 },
    { tipo: 'acacia', prob: 0.2, madera: () => Math.floor(Math.random() * 6) + 2 },
    { tipo: 'roble_oscuro', prob: 0.1, madera: () => Math.floor(Math.random() * 8) + 4 }
  ]

  let recursosObtenidos = {}
  let dineroGanado = 0
  let experienciaGanada = 0
  let arbolEspecial = ''

  // Determinar qué árbol se tala
  arboles.forEach(arbol => {
    if (Math.random() < arbol.prob * bonusSkill * bonusAxe) {
      const cantidad = arbol.madera()
      recursosObtenidos[arbol.tipo] = cantidad
      
      switch(arbol.tipo) {
        case 'madera_normal': user.wood += cantidad; break
        case 'roble': user.oak_log += cantidad; break
        case 'abeto': user.spruce_log += cantidad; break
        case 'abedul': user.birch_log += cantidad; break
        case 'jungla': user.jungle_log += cantidad; break
        case 'acacia': user.acacia_log += cantidad; break
        case 'roble_oscuro': user.dark_oak_log += cantidad; break
      }
      
      arbolEspecial = arbol.tipo
    }
  })

  // Posibilidad de manzanas (5%)
  if (Math.random() < 0.05) {
    const manzanas = Math.floor(Math.random() * 3) + 1
    user.apple += manzanas
    recursosObtenidos.manzanas = manzanas
  }

  // Posibilidad de brotes (10%)
  if (Math.random() < 0.1) {
    const brotes = Math.floor(Math.random() * 2) + 1
    user.sapling += brotes
    recursosObtenidos.brotes = brotes
  }

  // Calcular dinero y experiencia
  const totalMadera = Object.values(recursosObtenidos).reduce((a, b) => a + b, 0)
  dineroGanado = totalMadera * 25 * bonusAxe
  experienciaGanada = Math.floor(totalMadera * 5 * bonusSkill)

  user.coin += dineroGanado
  user.exp += experienciaGanada

  // Construir mensaje
  const nombreHacha = ['Ninguna', 'Madera', 'Piedra', 'Hierro', 'Diamante', 'Netherita'][user.axe]
  const tiposArbol = {
    'madera_normal': 'Madera Normal',
    'roble': 'Roble',
    'abeto': 'Abeto',
    'abedul': 'Abedul',
    'jungla': 'Jungla',
    'acacia': 'Acacia',
    'roble_oscuro': 'Roble Oscuro'
  }

  let resultado = `🪓 *TALANDO CON HACHA DE ${nombreHacha.toUpperCase()}* 🌲\n\n`
  
  if (Object.keys(recursosObtenidos).length > 0) {
    resultado += `🌳 *Árbol talado:* ${tiposArbol[arbolEspecial] || 'Variado'}\n`
    resultado += `📦 *Recursos obtenidos:*\n`
    
    for (const [recurso, cantidad] of Object.entries(recursosObtenidos)) {
      if (recurso === 'manzanas') {
        resultado += `• 🍎 Manzanas: ${cantidad}\n`
      } else if (recurso === 'brotes') {
        resultado += `• 🌱 Brotes: ${cantidad}\n`
      } else if (tiposArbol[recurso]) {
        resultado += `• 🪵 ${tiposArbol[recurso]}: ${cantidad}\n`
      }
    }
  } else {
    resultado += `❌ *El árbol no dio frutos esta vez*\n`
  }
  
  resultado += `\n💰 *Dinero ganado:* ¥${dineroGanado.toLocaleString()}\n`
  resultado += `⭐ *Experiencia:* +${experienciaGanada} XP\n`
  resultado += `⚡ *Energía usada:* -15 (${user.energy}/100)\n`
  resultado += `🔨 *Durabilidad:* -${durabilidadPerdida} (${user.axeDurability})\n`
  resultado += `🪓 *Nivel tala:* ${user.woodcutting.toFixed(1)}/30\n`
  resultado += `⏰ *Próximo tala:* ${formatTime(cooldown)}\n`
  
  if (user.axeDurability <= 0) {
    resultado += `\n💔 *¡Tu hacha se rompió!* Necesitas una nueva.\n`
  }
  
  resultado += `\n━━━━━━━━━━━━━━━━━━━━\n`
  resultado += `💰 *Monedas:* ¥${user.coin.toLocaleString()}\n`
  resultado += `⭐ *Experiencia total:* ${user.exp.toLocaleString()} XP\n`
  resultado += `🪵 *Madera total:* ${user.wood + user.oak_log + user.spruce_log + user.birch_log + user.jungle_log + user.acacia_log + user.dark_oak_log}\n`
  resultado += `🍎 *Manzanas:* ${user.apple}\n`
  resultado += `🌱 *Brotes:* ${user.sapling}`

  await conn.reply(m.chat, resultado, m)
}

handler.help = ['talar', 'chop']
handler.tags = ['economy', 'mine']
handler.command = ['talar', 'chop', 'cortar']
handler.group = true
export default handler
