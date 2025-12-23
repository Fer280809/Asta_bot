let handler = async (m, { conn, usedPrefix, command }) => {
  if (!global.db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`🦌 *¡Bosque Cerrado!*\n\nUsa *${usedPrefix}economy on* para activar el sistema.`)
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
  user.lasthunt = user.lasthunt || 0
  user.hunting = user.hunting || 0
  
  // Recursos de caza
  user.meat = user.meat || 0
  user.leather = user.leather || 0
  user.feather = user.feather || 0
  user.wool = user.wool || 0
  user.egg = user.egg || 0
  user.string = user.string || 0
  user.bone = user.bone || 0
  user.rotten_flesh = user.rotten_flesh || 0
  user.gunpowder = user.gunpowder || 0
  user.ender_pearl = user.ender_pearl || 0
  user.blaze_rod = user.blaze_rod || 0
  user.ghast_tear = user.ghast_tear || 0
  user.spider_eye = user.spider_eye || 0
  
  // Herramientas
  user.bow = user.bow || 0
  user.bowDurability = user.bowDurability || 0
  user.arrow = user.arrow || 0

  // Verificar arco
  if (user.bow === 0 || user.bowDurability <= 0) {
    return conn.reply(m.chat,
      `🏹 *¡Necesitas un arco!*\n\nSin arco no puedes cazar.\n\n` +
      `🛒 *Arcos disponibles:*\n` +
      `• Básico: ¥3,000 - *${usedPrefix}comprar arco*\n` +
      `• Potente: ¥10,000 - *${usedPrefix}comprar arco potente*\n` +
      `• Élfico: ¥25,000 - *${usedPrefix}comprar arco élfico*\n\n` +
      `⚒️ *O craftea uno:* *${usedPrefix}craft arco*`, m)
  }

  // Verificar flechas
  if (user.arrow < 5) {
    return conn.reply(m.chat,
      `🎯 *¡Flechas insuficientes!*\n\nNecesitas al menos 5 flechas.\n\n` +
      `🛒 *Compra flechas:*\n` +
      `• Paquete (16): ¥500 - *${usedPrefix}comprar flechas*\n` +
      `• Paquete (32): ¥900 - *${usedPrefix}comprar flechas32*\n` +
      `• Paquete (64): ¥1,700 - *${usedPrefix}comprar flechas64*\n\n` +
      `⚒️ *O craftea flechas:* *${usedPrefix}craft flecha*`, m)
  }

  // Verificar energía
  if (user.energy < 20) {
    return conn.reply(m.chat,
      `⚡ *¡Sin energía!*\n\nTu energía es ${user.energy}/100\n\n` +
      `🍖 Usa *${usedPrefix}comida* para recuperar energía`, m)
  }

  // Cooldown
  const cooldown = 5 * 60 * 1000 // 5 minutos
  const now = Date.now()
  
  if (now < user.lasthunt) {
    const restante = user.lasthunt - now
    return conn.reply(m.chat,
      `⏰ *¡Espera!*\n\nPuedes cazar de nuevo en *${formatTime(restante)}*`, m)
  }

  user.lasthunt = now + cooldown
  user.energy -= 20
  user.arrow -= 5
  user.hunting = Math.min((user.hunting || 0) + 0.15, 25)
  
  // Reducir durabilidad
  const durabilidadPerdida = Math.max(1, 3 - Math.floor(user.hunting / 5))
  user.bowDurability = Math.max(0, user.bowDurability - durabilidadPerdida)

  // Bonus por nivel y arco
  const bonusSkill = 1 + (user.hunting * 0.04)
  const bonusBow = [0, 1, 1.8, 2.5][user.bow]
  
  // Animales y sus probabilidades
  const animales = [
    { 
      tipo: 'vaca', 
      prob: 0.7, 
      recursos: () => ({ 
        meat: Math.floor(Math.random() * 3) + 2,
        leather: Math.floor(Math.random() * 2) + 1 
      }) 
    },
    { 
      tipo: 'oveja', 
      prob: 0.6, 
      recursos: () => ({ 
        wool: Math.floor(Math.random() * 2) + 1,
        meat: Math.floor(Math.random() * 2) + 1 
      }) 
    },
    { 
      tipo: 'cerdo', 
      prob: 0.6, 
      recursos: () => ({ 
        meat: Math.floor(Math.random() * 3) + 2 
      }) 
    },
    { 
      tipo: 'pollo', 
      prob: 0.8, 
      recursos: () => ({ 
        meat: Math.floor(Math.random() * 2) + 1,
        feather: Math.floor(Math.random() * 2) + 1,
        egg: Math.floor(Math.random() * 3) + 1 
      }) 
    },
    { 
      tipo: 'conejo', 
      prob: 0.5, 
      recursos: () => ({ 
        meat: Math.floor(Math.random() * 2) + 1,
        leather: Math.floor(Math.random() * 1) + 1 
      }) 
    },
    { 
      tipo: 'zorro', 
      prob: 0.4, 
      recursos: () => ({ 
        meat: Math.floor(Math.random() * 2) + 1,
        leather: Math.floor(Math.random() * 2) + 1 
      }) 
    },
    { 
      tipo: 'oso', 
      prob: 0.3, 
      recursos: () => ({ 
        meat: Math.floor(Math.random() * 5) + 3,
        leather: Math.floor(Math.random() * 3) + 2 
      }) 
    },
    { 
      tipo: 'ciervo', 
      prob: 0.4, 
      recursos: () => ({ 
        meat: Math.floor(Math.random() * 4) + 2,
        leather: Math.floor(Math.random() * 2) + 1 
      }) 
    }
  ]

  let recursosObtenidos = {}
  let dineroGanado = 0
  let experienciaGanada = 0
  let animalCazado = ''
  let cazaExitosa = Math.random() < (0.7 * bonusSkill * bonusBow)

  if (cazaExitosa) {
    // Seleccionar animal aleatorio
    const animalAleatorio = animales[Math.floor(Math.random() * animales.length)]
    animalCazado = animalAleatorio.tipo
    const recursos = animalAleatorio.recursos()
    
    // Aplicar recursos
    for (const [recurso, cantidad] of Object.entries(recursos)) {
      recursosObtenidos[recurso] = cantidad
      user[recurso] = (user[recurso] || 0) + cantidad
    }

    // Posibilidad de rarezas (5%)
    if (Math.random() < 0.05) {
      const rarezas = [
        { recurso: 'string', cantidad: 1 },
        { recurso: 'bone', cantidad: 1 },
        { recurso: 'rotten_flesh', cantidad: 1 },
        { recurso: 'gunpowder', cantidad: 1 },
        { recurso: 'ender_pearl', cantidad: 1 },
        { recurso: 'blaze_rod', cantidad: 1 },
        { recurso: 'ghast_tear', cantidad: 1 },
        { recurso: 'spider_eye', cantidad: 1 }
      ]
      const rareza = rarezas[Math.floor(Math.random() * rarezas.length)]
      recursosObtenidos[rareza.recurso] = rareza.cantidad
      user[rareza.recurso] = (user[rareza.recurso] || 0) + rareza.cantidad
    }

    // Calcular dinero y experiencia
    const totalRecursos = Object.values(recursosObtenidos).reduce((a, b) => a + b, 0)
    dineroGanado = totalRecursos * 40 * bonusBow
    experienciaGanada = Math.floor(totalRecursos * 8 * bonusSkill)

    user.coin += dineroGanado
    user.exp += experienciaGanada
  }

  // Construir mensaje
  const nombreArco = ['Ninguno', 'Básico', 'Potente', 'Élfico'][user.bow]
  const nombresAnimales = {
    'vaca': 'Vaca 🐄',
    'oveja': 'Oveja 🐑',
    'cerdo': 'Cerdo 🐷',
    'pollo': 'Pollo 🐔',
    'conejo': 'Conejo 🐰',
    'zorro': 'Zorro 🦊',
    'oso': 'Oso 🐻',
    'ciervo': 'Ciervo 🦌'
  }

  let resultado = `🏹 *CAZANDO CON ARCO ${nombreArco.toUpperCase()}* 🦌\n\n`
  
  if (cazaExitosa && Object.keys(recursosObtenidos).length > 0) {
    resultado += `🎯 *Caza exitosa!*\n`
    resultado += `🐾 *Animal:* ${nombresAnimales[animalCazado] || animalCazado}\n\n`
    resultado += `📦 *Recursos obtenidos:*\n`
    
    for (const [recurso, cantidad] of Object.entries(recursosObtenidos)) {
      const emojis = {
        meat: '🍖', leather: '🧵', wool: '🧶', feather: '🪶',
        egg: '🥚', string: '🧵', bone: '🦴', rotten_flesh: '🧟',
        gunpowder: '💥', ender_pearl: '🔮', blaze_rod: '🔥',
        ghast_tear: '👁️', spider_eye: '🕷️'
      }
      const nombres = {
        meat: 'Carne', leather: 'Cuero', wool: 'Lana', feather: 'Plumas',
        egg: 'Huevos', string: 'Cuerda', bone: 'Huesos', rotten_flesh: 'Carne podrida',
        gunpowder: 'Pólvora', ender_pearl: 'Perla de ender', blaze_rod: 'Vara de blaze',
        ghast_tear: 'Lágrima de ghast', spider_eye: 'Ojo de araña'
      }
      resultado += `• ${emojis[recurso] || '📦'} ${nombres[recurso] || recurso}: ${cantidad}\n`
    }
    
    resultado += `\n💰 *Dinero ganado:* ¥${dineroGanado.toLocaleString()}\n`
    resultado += `⭐ *Experiencia:* +${experienciaGanada} XP\n`
  } else {
    resultado += `❌ *¡Fallaste la caza!*\n`
    resultado += `🎯 *Flechas usadas:* 5\n`
    resultado += `💔 *El animal escapó*\n`
    resultado += `💸 *Pérdida:* ¥1,000\n`
    user.coin = Math.max(0, user.coin - 1000)
  }
  
  resultado += `\n⚡ *Energía usada:* -20 (${user.energy}/100)\n`
  resultado += `🎯 *Flechas restantes:* ${user.arrow}\n`
  resultado += `🏹 *Durabilidad:* -${durabilidadPerdida} (${user.bowDurability})\n`
  resultado += `🎖️ *Nivel caza:* ${user.hunting.toFixed(1)}/25\n`
  resultado += `⏰ *Próxima caza:* ${formatTime(cooldown)}\n`
  
  if (user.bowDurability <= 0) {
    resultado += `\n💔 *¡Tu arco se rompió!* Necesitas uno nuevo.\n`
  }
  
  resultado += `\n━━━━━━━━━━━━━━━━━━━━\n`
  resultado += `💰 *Monedas:* ¥${user.coin.toLocaleString()}\n`
  resultado += `⭐ *Experiencia total:* ${user.exp.toLocaleString()} XP\n`
  resultado += `🍖 *Carne total:* ${user.meat}\n`
  resultado += `🧵 *Cuero total:* ${user.leather}\n`
  resultado += `🎯 *Flechas:* ${user.arrow}`

  await conn.reply(m.chat, resultado, m)
}

handler.help = ['cazar', 'hunt']
handler.tags = ['economy', 'mine']
handler.command = ['cazar', 'hunt']
handler.group = true
export default handler
