let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!global.db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`⚒️ *¡Taller Cerrado!*\n\nUsa *${usedPrefix}economy on* para activar el sistema.`)
  }

  const user = global.db.data.users[m.sender]
  if (!user) global.db.data.users[m.sender] = {}
  user = global.db.data.users[m.sender]

  // Inicializar todos los recursos necesarios
  const recursosNecesarios = [
    'wood', 'cobblestone', 'stick', 'coal', 'iron', 'gold',
    'diamond', 'emerald', 'redstone', 'lapis', 'quartz', 'copper',
    'string', 'leather', 'feather', 'wool', 'egg'
  ]
  
  recursosNecesarios.forEach(recurso => {
    user[recurso] = user[recurso] || 0
  })

  // Recetas de crafteo
  const recetas = {
    // Herramientas
    'hacha_madera': {
      nombre: 'Hacha de Madera',
      materiales: { wood: 3, stick: 2 },
      resultado: { tipo: 'axe', nivel: 1, durabilidad: 50 }
    },
    'hacha_piedra': {
      nombre: 'Hacha de Piedra',
      materiales: { cobblestone: 3, stick: 2 },
      resultado: { tipo: 'axe', nivel: 2, durabilidad: 100 }
    },
    'hacha_hierro': {
      nombre: 'Hacha de Hierro',
      materiales: { iron: 3, stick: 2 },
      resultado: { tipo: 'axe', nivel: 3, durabilidad: 200 }
    },
    'hacha_diamante': {
      nombre: 'Hacha de Diamante',
      materiales: { diamond: 3, stick: 2 },
      resultado: { tipo: 'axe', nivel: 4, durabilidad: 500 }
    },
    'hacha_netherita': {
      nombre: 'Hacha de Netherita',
      materiales: { netherite: 3, stick: 2 },
      resultado: { tipo: 'axe', nivel: 5, durabilidad: 1000 }
    },
    
    'pico_madera': {
      nombre: 'Pico de Madera',
      materiales: { wood: 3, stick: 2 },
      resultado: { tipo: 'pickaxe', nivel: 1, durabilidad: 50 }
    },
    'pico_piedra': {
      nombre: 'Pico de Piedra',
      materiales: { cobblestone: 3, stick: 2 },
      resultado: { tipo: 'pickaxe', nivel: 2, durabilidad: 100 }
    },
    'pico_hierro': {
      nombre: 'Pico de Hierro',
      materiales: { iron: 3, stick: 2 },
      resultado: { tipo: 'pickaxe', nivel: 3, durabilidad: 200 }
    },
    'pico_diamante': {
      nombre: 'Pico de Diamante',
      materiales: { diamond: 3, stick: 2 },
      resultado: { tipo: 'pickaxe', nivel: 4, durabilidad: 500 }
    },
    'pico_netherita': {
      nombre: 'Pico de Netherita',
      materiales: { netherite: 3, stick: 2 },
      resultado: { tipo: 'pickaxe', nivel: 5, durabilidad: 1000 }
    },
    
    'arco': {
      nombre: 'Arco',
      materiales: { stick: 3, string: 3 },
      resultado: { tipo: 'bow', nivel: 1, durabilidad: 100 }
    },
    'arco_potente': {
      nombre: 'Arco Potente',
      materiales: { stick: 3, string: 3, iron: 1 },
      resultado: { tipo: 'bow', nivel: 2, durabilidad: 200 }
    },
    'arco_elfico': {
      nombre: 'Arco Élfico',
      materiales: { stick: 3, string: 3, diamond: 1 },
      resultado: { tipo: 'bow', nivel: 3, durabilidad: 300 }
    },
    
    'caña': {
      nombre: 'Caña de Pescar',
      materiales: { stick: 3, string: 2 },
      resultado: { tipo: 'fishing_rod', nivel: 1, durabilidad: 80 }
    },
    'caña_mejorada': {
      nombre: 'Caña Mejorada',
      materiales: { stick: 3, string: 2, iron: 1 },
      resultado: { tipo: 'fishing_rod', nivel: 2, durabilidad: 160 }
    },
    'caña_encantada': {
      nombre: 'Caña Encantada',
      materiales: { stick: 3, string: 2, diamond: 1 },
      resultado: { tipo: 'fishing_rod', nivel: 3, durabilidad: 240 }
    },
    
    // Flechas
    'flecha': {
      nombre: 'Flecha (4)',
      materiales: { stick: 1, feather: 1, iron: 1 },
      resultado: { tipo: 'arrow', cantidad: 4 }
    },
    
    // Bloques
    'madera': {
      nombre: 'Madera (4)',
      materiales: { wood: 1 },
      resultado: { tipo: 'wood', cantidad: 4 }
    },
    'palos': {
      nombre: 'Palos (4)',
      materiales: { wood: 2 },
      resultado: { tipo: 'stick', cantidad: 4 }
    },
    'antorcha': {
      nombre: 'Antorcha (4)',
      materiales: { stick: 1, coal: 1 },
      resultado: { tipo: 'torch', cantidad: 4 }
    },
    
    // Equipamiento
    'casco_cuero': {
      nombre: 'Casco de Cuero',
      materiales: { leather: 5 },
      resultado: { tipo: 'helmet', material: 'leather' }
    },
    'pechera_cuero': {
      nombre: 'Pechera de Cuero',
      materiales: { leather: 8 },
      resultado: { tipo: 'chestplate', material: 'leather' }
    },
    'pantalones_cuero': {
      nombre: 'Pantalones de Cuero',
      materiales: { leather: 7 },
      resultado: { tipo: 'leggings', material: 'leather' }
    },
    'botas_cuero': {
      nombre: 'Botas de Cuero',
      materiales: { leather: 4 },
      resultado: { tipo: 'boots', material: 'leather' }
    }
  }

  // Mostrar recetas si no se especifica
  if (!text) {
    let mensaje = `⚒️ *TALLER DE CRAFTEO NAVIDEÑO* 🎄\n\n`
    mensaje += `📋 *Recetas disponibles:*\n\n`
    
    // Herramientas
    mensaje += `🛠️ *HERRAMIENTAS:*\n`
    mensaje += `• hacha_madera (3 madera + 2 palos)\n`
    mensaje += `• hacha_piedra (3 piedra + 2 palos)\n`
    mensaje += `• hacha_hierro (3 hierro + 2 palos)\n`
    mensaje += `• hacha_diamante (3 diamante + 2 palos)\n`
    mensaje += `• hacha_netherita (3 netherita + 2 palos)\n`
    mensaje += `• pico_madera (3 madera + 2 palos)\n`
    mensaje += `• pico_piedra (3 piedra + 2 palos)\n`
    mensaje += `• pico_hierro (3 hierro + 2 palos)\n`
    mensaje += `• pico_diamante (3 diamante + 2 palos)\n`
    mensaje += `• pico_netherita (3 netherita + 2 palos)\n`
    mensaje += `• arco (3 palos + 3 hilo)\n`
    mensaje += `• arco_potente (3 palos + 3 hilo + 1 hierro)\n`
    mensaje += `• arco_elfico (3 palos + 3 hilo + 1 diamante)\n`
    mensaje += `• caña (3 palos + 2 hilo)\n`
    mensaje += `• caña_mejorada (3 palos + 2 hilo + 1 hierro)\n`
    mensaje += `• caña_encantada (3 palos + 2 hilo + 1 diamante)\n\n`
    
    // Otros
    mensaje += `📦 *OTROS:*\n`
    mensaje += `• flecha (1 palo + 1 pluma + 1 hierro) → 4 flechas\n`
    mensaje += `• madera (1 madera) → 4 madera\n`
    mensaje += `• palos (2 madera) → 4 palos\n`
    mensaje += `• antorcha (1 palo + 1 carbón) → 4 antorchas\n\n`
    
    mensaje += `👕 *EQUIPAMIENTO:*\n`
    mensaje += `• casco_cuero (5 cuero)\n`
    mensaje += `• pechera_cuero (8 cuero)\n`
    mensaje += `• pantalones_cuero (7 cuero)\n`
    mensaje += `• botas_cuero (4 cuero)\n\n`
    
    mensaje += `🛠️ *Usa:*\n`
    mensaje += `*${usedPrefix}craft [item]*\n`
    mensaje += `Ejemplo: *${usedPrefix}craft hacha_madera*`

    return conn.reply(m.chat, mensaje, m)
  }

  const itemKey = text.toLowerCase()
  const receta = recetas[itemKey]

  if (!receta) {
    return conn.reply(m.chat,
      `❌ *Receta no encontrada*\n\n` +
      `Usa *${usedPrefix}craft* para ver todas las recetas.\n\n` +
      `⚒️ *Ejemplo:*\n` +
      `*${usedPrefix}craft hacha_madera*`, m)
  }

  // Verificar materiales
  let materialesFaltantes = []
  for (const [material, cantidad] of Object.entries(receta.materiales)) {
    if ((user[material] || 0) < cantidad) {
      materialesFaltantes.push({ material, cantidad, tiene: user[material] || 0 })
    }
  }

  if (materialesFaltantes.length > 0) {
    let mensajeError = `❌ *Materiales insuficientes*\n\n`
    mensajeError += `Para craftear *${receta.nombre}* necesitas:\n`
    
    materialesFaltantes.forEach(falta => {
      const nombresMateriales = {
        'wood': 'Madera', 'cobblestone': 'Piedra', 'stick': 'Palos',
        'coal': 'Carbón', 'iron': 'Hierro', 'gold': 'Oro',
        'diamond': 'Diamante', 'emerald': 'Esmeralda', 'netherite': 'Netherita',
        'string': 'Hilo', 'leather': 'Cuero', 'feather': 'Plumas'
      }
      const nombre = nombresMateriales[falta.material] || falta.material
      mensajeError += `• ${nombre}: ${falta.tiene}/${falta.cantidad}\n`
    })
    
    mensajeError += `\n💡 *Consejo:* Consigue los materiales faltantes minando, talando o cazando.`
    
    return conn.reply(m.chat, mensajeError, m)
  }

  // Consumir materiales
  for (const [material, cantidad] of Object.entries(receta.materiales)) {
    user[material] -= cantidad
  }

  // Dar el resultado
  let mensajeExito = `⚒️ *¡Crafteo exitoso!* 🎄\n\n`
  mensajeExito += `✨ *Has crafteado:* ${receta.nombre}\n\n`
  
  if (receta.resultado.tipo === 'axe' || receta.resultado.tipo === 'pickaxe' || 
      receta.resultado.tipo === 'bow' || receta.resultado.tipo === 'fishing_rod') {
    
    user[receta.resultado.tipo] = receta.resultado.nivel
    user[`${receta.resultado.tipo}Durability`] = receta.resultado.durabilidad
    
    mensajeExito += `🔨 *Durabilidad:* ${receta.resultado.durabilidad}\n`
    mensajeExito += `📊 *Nivel:* ${receta.resultado.nivel}\n\n`
    
    if (receta.resultado.tipo === 'axe') {
      mensajeExito += `🪓 *Ahora puedes usar:* *${usedPrefix}talar*\n`
    } else if (receta.resultado.tipo === 'pickaxe') {
      mensajeExito += `⛏️ *Ahora puedes usar:* *${usedPrefix}minar*\n`
    } else if (receta.resultado.tipo === 'bow') {
      mensajeExito += `🏹 *Ahora puedes usar:* *${usedPrefix}cazar*\n`
    } else if (receta.resultado.tipo === 'fishing_rod') {
      mensajeExito += `🎣 *Ahora puedes usar:* *${usedPrefix}pescar*\n`
    }
    
  } else if (receta.resultado.tipo === 'arrow') {
    user.arrow = (user.arrow || 0) + receta.resultado.cantidad
    mensajeExito += `🎯 *Flechas obtenidas:* ${receta.resultado.cantidad}\n`
    mensajeExito += `🎯 *Flechas totales:* ${user.arrow}\n`
    
  } else if (receta.resultado.tipo === 'wood') {
    user.wood += receta.resultado.cantidad
    mensajeExito += `🪵 *Madera obtenida:* ${receta.resultado.cantidad}\n`
    mensajeExito += `🪵 *Madera total:* ${user.wood}\n`
    
  } else if (receta.resultado.tipo === 'stick') {
    user.stick += receta.resultado.cantidad
    mensajeExito += `🪵 *Palos obtenidos:* ${receta.resultado.cantidad}\n`
    mensajeExito += `🪵 *Palos totales:* ${user.stick}\n`
    
  } else if (receta.resultado.tipo === 'torch') {
    user.torch = (user.torch || 0) + receta.resultado.cantidad
    mensajeExito += `🕯️ *Antorchas obtenidas:* ${receta.resultado.cantidad}\n`
    mensajeExito += `🕯️ *Antorchas totales:* ${user.torch}\n`
    
  } else if (receta.resultado.tipo === 'helmet') {
    user.helmet = receta.resultado.material
    mensajeExito += `⛑️ *Casco de ${receta.resultado.material} equipado*\n`
  } else if (receta.resultado.tipo === 'chestplate') {
    user.chestplate = receta.resultado.material
    mensajeExito += `🦺 *Pechera de ${receta.resultado.material} equipada*\n`
  } else if (receta.resultado.tipo === 'leggings') {
    user.leggings = receta.resultado.material
    mensajeExito += `👖 *Pantalones de ${receta.resultado.material} equipados*\n`
  } else if (receta.resultado.tipo === 'boots') {
    user.boots = receta.resultado.material
    mensajeExito += `👢 *Botas de ${receta.resultado.material} equipadas*\n`
  }

  // Mostrar materiales usados
  mensajeExito += `\n📦 *Materiales usados:*\n`
  for (const [material, cantidad] of Object.entries(receta.materiales)) {
    const nombresMateriales = {
      'wood': 'Madera', 'cobblestone': 'Piedra', 'stick': 'Palos',
      'coal': 'Carbón', 'iron': 'Hierro', 'gold': 'Oro',
      'diamond': 'Diamante', 'emerald': 'Esmeralda', 'netherite': 'Netherita',
      'string': 'Hilo', 'leather': 'Cuero', 'feather': 'Plumas'
    }
    const nombre = nombresMateriales[material] || material
    mensajeExito += `• ${nombre}: ${cantidad}\n`
  }

  await conn.reply(m.chat, mensajeExito, m)
}

handler.help = ['craft [item]']
handler.tags = ['economy']
handler.command = ['craft', 'craftear', 'crear']
handler.group = true
export default handler
