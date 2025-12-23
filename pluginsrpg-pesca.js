let handler = async (m, { conn, usedPrefix, command }) => {
  if (!global.db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`🎣 *¡Lago Congelado!*\n\nUsa *${usedPrefix}economy on* para activar el sistema.`)
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
  user.lastfish = user.lastfish || 0
  user.fishing = user.fishing || 0
  
  // Recursos de pesca
  user.raw_fish = user.raw_fish || 0
  user.raw_salmon = user.raw_salmon || 0
  user.clownfish = user.clownfish || 0
  user.pufferfish = user.pufferfish || 0
  user.nautilus = user.nautilus || 0
  user.cod = user.cod || 0
  user.tropical_fish = user.tropical_fish || 0
  user.squid = user.squid || 0
  user.kelp = user.kelp || 0
  user.seaweed = user.seaweed || 0
  user.pearl = user.pearl || 0
  user.treasure = user.treasure || 0
  
  // Herramientas
  user.fishing_rod = user.fishing_rod || 0
  user.rodDurability = user.rodDurability || 0

  // Verificar caña
  if (user.fishing_rod === 0 || user.rodDurability <= 0) {
    return conn.reply(m.chat,
      `🎣 *¡Necesitas una caña!*\n\nSin caña no puedes pescar.\n\n` +
      `🛒 *Cañas disponibles:*\n` +
      `• Básica: ¥2,500 - *${usedPrefix}comprar caña*\n` +
      `• Mejorada: ¥8,000 - *${usedPrefix}comprar caña mejorada*\n` +
      `• Encantada: ¥20,000 - *${usedPrefix}comprar caña encantada*\n\n` +
      `⚒️ *O craftea una:* *${usedPrefix}craft caña*`, m)
  }

  // Verificar energía
  if (user.energy < 10) {
    return conn.reply(m.chat,
      `⚡ *¡Sin energía!*\n\nTu energía es ${user.energy}/100\n\n` +
      `🍣 Usa *${usedPrefix}comida* para recuperar energía`, m)
  }

  // Cooldown
  const cooldown = 4 * 60 * 1000 // 4 minutos
  const now = Date.now()
  
  if (now < user.lastfish) {
    const restante = user.lastfish - now
    return conn.reply(m.chat,
      `⏰ *¡Paciencia pescador!*\n\nPuedes pescar de nuevo en *${formatTime(restante)}*`, m)
  }

  user.lastfish = now + cooldown
  user.energy -= 10
  user.fishing = Math.min((user.fishing || 0) + 0.1, 35)
  
  // Reducir durabilidad
  const durabilidadPerdida = Math.max(1, 2 - Math.floor(user.fishing / 10))
  user.rodDurability = Math.max(0, user.rodDurability - durabilidadPerdida)

  // Bonus por nivel y caña
  const bonusSkill = 1 + (user.fishing * 0.05)
  const bonusRod = [0, 1, 1.6, 2.4][user.fishing_rod]
  
  // Tipos de peces y sus probabilidades
  const peces = [
    { 
      tipo: 'pescado', 
      prob: 0.8, 
      recursos: () => ({ 
        raw_fish: Math.floor(Math.random() * 3) + 1 
      }) 
    },
    { 
      tipo: 'salmón', 
      prob: 0.5, 
      recursos: () => ({ 
        raw_salmon: Math.floor(Math.random() * 2) + 1 
      }) 
    },
    { 
      tipo: 'bacalao', 
      prob: 0.4, 
      recursos: () => ({ 
        cod: Math.floor(Math.random() * 2) + 1 
      }) 
    },
    { 
      tipo: 'pez_payas
      }) 
    },
    { 
      tipo: 'pez_globo', 
      prob: 0.2, 
      recursos: () => ({ 
        pufferfish: 1 
      }) 
    },
    { 
      tipo: 'pez_payaso', 
      prob: 0.15, 
      recursos: () => ({ 
        clownfish: 1 
      }) 
    },
    { 
      tipo: 'pez_tropical', 
      prob: 0.25, 
      recursos: () => ({ 
        tropical_fish: Math.floor(Math.random() * 2) + 1 
      }) 
    },
    { 
      tipo: 'calamar', 
      prob: 0.3, 
      recursos: () => ({ 
        squid: Math.floor(Math.random() * 2) + 1 
      }) 
    },
    { 
      tipo: 'algas', 
      prob: 0.6, 
      recursos: () => ({ 
        kelp: Math.floor(Math.random() * 4) + 2,
        seaweed: Math.floor(Math.random() * 3) + 1 
      }) 
    }
  ]

  let recursosObtenidos = {}
  let dineroGanado = 0
  let experienciaGanada = 0
  let pezObtenido = ''
  let pescaExitosa = Math.random() < (0.85 * bonusSkill * bonusRod) // Mayor probabilidad base

  if (pescaExitosa) {
    // Seleccionar pez aleatorio
    const pezAleatorio = peces[Math.floor(Math.random() * peces.length)]
    pezObtenido = pezAleatorio.tipo
    const recursos = pezAleatorio.recursos()
    
    // Aplicar recursos
    for (const [recurso, cantidad] of Object.entries(recursos)) {
      recursosObtenidos[recurso] = cantidad
      user[recurso] = (user[recurso] || 0) + cantidad
    }

    // Posibilidad de tesoros (3%)
    if (Math.random() < 0.03) {
      const tesoros = [
        { recurso: 'nautilus', cantidad: 1, valor: 1000 },
        { recurso: 'pearl', cantidad: 1, valor: 5000 },
        { recurso: 'treasure', cantidad: 1, valor: 10000 }
      ]
      const tesoro = tesoros[Math.floor(Math.random() * tesoros.length)]
      recursosObtenidos[tesoro.recurso] = tesoro.cantidad
      user[tesoro.recurso] = (user[tesoro.recurso] || 0) + tesoro.cantidad
    }

    // Calcular dinero y experiencia
    const totalRecursos = Object.values(recursosObtenidos).reduce((a, b) => a + b, 0)
    dineroGanado = totalRecursos * 30 * bonusRod
    experienciaGanada = Math.floor(totalRecursos * 6 * bonusSkill)

    user.coin += dineroGanado
    user.exp += experienciaGanada
  } else {
    // Pesca fallida, pero a veces se obtienen algas
    if (Math.random() < 0.3) {
      const algas = Math.floor(Math.random() * 2) + 1
      recursosObtenidos['kelp'] = algas
      user.kelp += algas
    }
  }

  // Construir mensaje
  const nombreCaña = ['Ninguna', 'Básica', 'Mejorada', 'Encantada'][user.fishing_rod]
  const nombresPeces = {
    'pescado': 'Pescado 🐟',
    'salmón': 'Salmón 🍣',
    'bacalao': 'Bacalao 🐠',
    'pez_globo': 'Pez Globo 🐡',
    'pez_payaso': 'Pez Payaso 🤡',
    'pez_tropical': 'Pez Tropical 🐠',
    'calamar': 'Calamar 🦑',
    'algas': 'Algas 🌿'
  }

  let resultado = `🎣 *PESCANDO CON CAÑA ${nombreCaña.toUpperCase()}* 🎄\n\n`
  
  if (pescaExitosa && Object.keys(recursosObtenidos).length > 0) {
    resultado += `🎣 *¡Pesca exitosa!*\n`
    if (pezObtenido) resultado += `🐟 *Pez:* ${nombresPeces[pezObtenido] || pezObtenido}\n\n`
    resultado += `📦 *Recursos obtenidos:*\n`
    
    for (const [recurso, cantidad] of Object.entries(recursosObtenidos)) {
      const emojis = {
        raw_fish: '🐟', raw_salmon: '🍣', cod: '🐠', pufferfish: '🐡',
        clownfish: '🤡', tropical_fish: '🐠', squid: '🦑', kelp: '🌿',
        seaweed: '🌱', nautilus: '🐚', pearl: '💎', treasure: '🏆'
      }
      const nombres = {
        raw_fish: 'Pescado', raw_salmon: 'Salmón', cod: 'Bacalao', pufferfish: 'Pez Globo',
        clownfish: 'Pez Payaso', tropical_fish: 'Pez Tropical', squid: 'Calamar', kelp: 'Algas',
        seaweed: 'Algas marinas', nautilus: 'Nautilus', pearl: 'Perla', treasure: 'Tesoro'
      }
      resultado += `• ${emojis[recurso] || '📦'} ${nombres[recurso] || recurso}: ${cantidad}\n`
    }
    
    if (dineroGanado > 0) {
      resultado += `\n💰 *Dinero ganado:* ¥${dineroGanado.toLocaleString()}\n`
      resultado += `⭐ *Experiencia:* +${experienciaGanada} XP\n`
    }
  } else {
    resultado += `❌ *¡No pescaste nada!*\n`
    if (Object.keys(recursosObtenidos).length > 0) {
      resultado += `🌿 *Pero obtuviste algas:* ${recursosObtenidos['kelp'] || 0}\n`
    }
  }
  
  resultado += `\n⚡ *Energía usada:* -10 (${user.energy}/100)\n`
  resultado += `🎣 *Durabilidad:* -${durabilidadPerdida} (${user.rodDurability})\n`
  resultado += `🎖️ *Nivel pesca:* ${user.fishing.toFixed(1)}/35\n`
  resultado += `⏰ *Próxima pesca:* ${formatTime(cooldown)}\n`
  
  if (user.rodDurability <= 0) {
    resultado += `\n💔 *¡Tu caña se rompió!* Necesitas una nueva.\n`
  }
  
  resultado += `\n━━━━━━━━━━━━━━━━━━━━\n`
  resultado += `💰 *Monedas:* ¥${user.coin.toLocaleString()}\n`
  resultado += `⭐ *Experiencia total:* ${user.exp.toLocaleString()} XP\n`
  resultado += `🐟 *Pescado total:* ${user.raw_fish + user.raw_salmon + user.cod + user.clownfish + user.pufferfish + user.tropical_fish}\n`
  resultado += `🦑 *Calamar:* ${user.squid}\n`
  resultado += `🌿 *Algas:* ${user.kelp + user.seaweed}`

  await conn.reply(m.chat, resultado, m)
}

handler.help = ['pescar', 'fish']
handler.tags = ['economy', 'mine']
handler.command = ['pescar', 'fish']
handler.group = true
export default handler
