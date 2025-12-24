let handler = async (m, { conn, usedPrefix, command, text }) => {
  const user = global.db.data.users[m.sender]
  
  if (!user) return m.reply('❌ Primero usa algún comando para crear tu perfil.')
  
  // Inicializar recursos necesarios
  const recursos = ['wood', 'coal', 'iron', 'gold', 'diamond', 'emerald', 'redstone', 'lapis', 'quartz', 'copper', 'ancient_debris', 'netherite', 'obsidian', 'glowstone', 'raw_fish', 'meat', 'apple', 'string', 'bone', 'rotten_flesh', 'gunpowder', 'ender_pearl', 'blaze_rod', 'ghast_tear', 'spider_eye', 'feather', 'wool', 'egg']
  
  recursos.forEach(recurso => {
    user[recurso] = user[recurso] || 0
  })
  
  // Si no hay argumento, mostrar menú de crafteo
  if (!text || text === 'menu') {
    const recetas = [
      { nombre: '🗡️ Espada de Madera', comando: 'espada madera', ingredientes: { wood: 2, stick: 1 } },
      { nombre: '🪓 Hacha de Madera', comando: 'hacha madera', ingredientes: { wood: 3, stick: 2 } },
      { nombre: '⛏️ Pico de Madera', comando: 'pico madera', ingredientes: { wood: 3, stick: 2 } },
      { nombre: '🪚 Pala de Madera', comando: 'pala madera', ingredientes: { wood: 1, stick: 2 } },
      { nombre: '🥄 Azada de Madera', comando: 'azada madera', ingredientes: { wood: 2, stick: 2 } },
      { nombre: '🏹 Arco', comando: 'arco', ingredientes: { stick: 3, string: 3 } },
      { nombre: '🎯 Flechas (x4)', comando: 'flechas', ingredientes: { stick: 1, feather: 1, flint: 1 } },
      { nombre: '🪣 Cubo', comando: 'cubo', ingredientes: { iron: 3 } },
      { nombre: '🧭 Brújula', comando: 'brujula', ingredientes: { iron: 4, redstone: 1 } },
      { nombre: '⏰ Reloj', comando: 'reloj', ingredientes: { gold: 4, redstone: 1 } },
      { nombre: '🎣 Caña de pescar', comando: 'caña', ingredientes: { stick: 3, string: 2 } },
      { nombre: '🔥 Mechero', comando: 'mechero', ingredientes: { iron: 1, flint: 1 } },
      { nombre: '🗺️ Mapa', comando: 'mapa', ingredientes: { paper: 8, compass: 1 } },
      { nombre: '📦 Cofre', comando: 'cofre', ingredientes: { wood: 8 } },
      { nombre: '🛌 Cama', comando: 'cama', ingredientes: { wood: 3, wool: 3 } },
      { nombre: '🎨 Mesa de crafteo', comando: 'mesa crafteo', ingredientes: { wood: 4 } },
      { nombre: '🔥 Horno', comando: 'horno', ingredientes: { cobblestone: 8 } },
      { nombre: '🧰 Yunque', comando: 'yunque', ingredientes: { iron: 3, iron_block: 4 } },
      { nombre: '💎 Bloque de diamante', comando: 'bloque diamante', ingredientes: { diamond: 9 } },
      { nombre: '🟡 Bloque de oro', comando: 'bloque oro', ingredientes: { gold: 9 } },
      { nombre: '🔘 Bloque de hierro', comando: 'bloque hierro', ingredientes: { iron: 9 } },
      { nombre: '⚫ Bloque de carbón', comando: 'bloque carbon', ingredientes: { coal: 9 } },
      { nombre: '💎 Pico de diamante', comando: 'pico diamante', ingredientes: { diamond: 3, stick: 2 } },
      { nombre: '🟡 Pico de oro', comando: 'pico oro', ingredientes: { gold: 3, stick: 2 } },
      { nombre: '🔘 Pico de hierro', comando: 'pico hierro', ingredientes: { iron: 3, stick: 2 } },
      { nombre: '🪨 Pico de piedra', comando: 'pico piedra', ingredientes: { cobblestone: 3, stick: 2 } },
      { nombre: '🪵 Pico de madera', comando: 'pico madera', ingredientes: { wood: 3, stick: 2 } }
    ]

    let message = `⚒️ *SISTEMA DE CRAFTEO* 🛠️\n\n`
    message += `📦 *Tus recursos disponibles:*\n`
    
    // Mostrar solo recursos que el usuario tiene
    let tieneRecursos = false
    for (const recurso of recursos) {
      if (user[recurso] > 0) {
        tieneRecursos = true
        const emojis = {
          wood: '🪵', coal: '⚫', iron: '🔘', gold: '🟡', diamond: '💎',
          emerald: '🟢', redstone: '🔴', lapis: '🔵', quartz: '⚪',
          copper: '🟠', ancient_debris: '♨️', netherite: '🔥',
          obsidian: '🪨', glowstone: '✨', raw_fish: '🐟',
          meat: '🍖', apple: '🍎', string: '🧵', bone: '🦴',
          rotten_flesh: '🧟', gunpowder: '💥', ender_pearl: '🔮',
          blaze_rod: '🔥', ghast_tear: '👁️', spider_eye: '🕷️',
          feather: '🪶', wool: '🧶', egg: '🥚'
        }
        const nombres = {
          wood: 'Madera', coal: 'Carbón', iron: 'Hierro', gold: 'Oro',
          diamond: 'Diamante', emerald: 'Esmeralda', redstone: 'Redstone',
          lapis: 'Lapislázuli', quartz: 'Cuarzo', copper: 'Cobre',
          ancient_debris: 'Escombros antiguos', netherite: 'Netherita',
          obsidian: 'Obsidiana', glowstone: 'Piedra luminosa',
          raw_fish: 'Pescado crudo', meat: 'Carne', apple: 'Manzana',
          string: 'Cuerda', bone: 'Hueso', rotten_flesh: 'Carne podrida',
          gunpowder: 'Pólvora', ender_pearl: 'Perla de ender',
          blaze_rod: 'Vara de blaze', ghast_tear: 'Lágrima de ghast',
          spider_eye: 'Ojo de araña', feather: 'Pluma', wool: 'Lana',
          egg: 'Huevo'
        }
        message += `${emojis[recurso] || '📦'} ${nombres[recurso] || recurso}: ${user[recurso]}\n`
      }
    }
    
    if (!tieneRecursos) {
      message += `📭 *No tienes recursos aún*\n`
      message += `✨ Consigue recursos con:\n`
      message += `• ${usedPrefix}talar - Para madera\n`
      message += `• ${usedPrefix}cazar - Para carne/plumas\n`
      message += `• ${usedPrefix}pescar - Para pescado\n`
      message += `• ${usedPrefix}minar - Para minerales\n`
    }
    
    message += `\n📋 *Recetas disponibles:*\n\n`
    
    // Mostrar algunas recetas básicas
    const recetasMostrar = recetas.slice(0, 10) // Mostrar solo 10 para no saturar
    recetasMostrar.forEach((receta, index) => {
      message += `${index + 1}. ${receta.nombre}\n`
      message += `   ↳ Ingredientes: `
      const ingredientes = []
      for (const [ing, cant] of Object.entries(receta.ingredientes)) {
        ingredientes.push(`${cant}x ${ing}`)
      }
      message += ingredientes.join(', ') + '\n'
      message += `   ↳ Comando: *${usedPrefix}craft ${receta.comando}*\n\n`
    })
    
    message += `📌 *Ejemplos:*\n`
    message += `• ${usedPrefix}craft pico madera\n`
    message += `• ${usedPrefix}craft hacha piedra\n`
    message += `• ${usedPrefix}craft arco\n`
    message += `• ${usedPrefix}craft flechas\n\n`
    message += `🔍 *Para ver todas las recetas:* ${usedPrefix}recetas`

    await conn.reply(m.chat, message, m)
    return
  }

  // Si se proporciona una receta específica
  const recetas = {
    // Herramientas de madera
    'pico_madera': {
      nombre: '⛏️ Pico de Madera',
      ingredientes: { wood: 3, stick: 2 },
      resultado: { tipo: 'pickaxe', nivel: 1, durabilidad: 50 }
    },
    'hacha_madera': {
      nombre: '🪓 Hacha de Madera',
      ingredientes: { wood: 3, stick: 2 },
      resultado: { tipo: 'axe', nivel: 1, durabilidad: 50 }
    },
    'espada_madera': {
      nombre: '🗡️ Espada de Madera',
      ingredientes: { wood: 2, stick: 1 },
      resultado: { tipo: 'sword', nivel: 1, durabilidad: 50 }
    },
    
    // Herramientas de piedra
    'pico_piedra': {
      nombre: '⛏️ Pico de Piedra',
      ingredientes: { cobblestone: 3, stick: 2 },
      resultado: { tipo: 'pickaxe', nivel: 2, durabilidad: 100 }
    },
    'hacha_piedra': {
      nombre: '🪓 Hacha de Piedra',
      ingredientes: { cobblestone: 3, stick: 2 },
      resultado: { tipo: 'axe', nivel: 2, durabilidad: 100 }
    },
    
    // Herramientas de hierro
    'pico_hierro': {
      nombre: '⛏️ Pico de Hierro',
      ingredientes: { iron: 3, stick: 2 },
      resultado: { tipo: 'pickaxe', nivel: 3, durabilidad: 200 }
    },
    'hacha_hierro': {
      nombre: '🪓 Hacha de Hierro',
      ingredientes: { iron: 3, stick: 2 },
      resultado: { tipo: 'axe', nivel: 3, durabilidad: 200 }
    },
    
    // Herramientas de diamante
    'pico_diamante': {
      nombre: '⛏️ Pico de Diamante',
      ingredientes: { diamond: 3, stick: 2 },
      resultado: { tipo: 'pickaxe', nivel: 4, durabilidad: 500 }
    },
    'hacha_diamante': {
      nombre: '🪓 Hacha de Diamante',
      ingredientes: { diamond: 3, stick: 2 },
      resultado: { tipo: 'axe', nivel: 4, durabilidad: 500 }
    },
    
    // Otros items
    'arco': {
      nombre: '🏹 Arco',
      ingredientes: { stick: 3, string: 3 },
      resultado: { tipo: 'bow', nivel: 1, durabilidad: 100 }
    },
    'flechas': {
      nombre: '🎯 Flechas (x4)',
      ingredientes: { stick: 1, feather: 1, flint: 1 },
      resultado: { tipo: 'arrow', cantidad: 4 }
    },
    'caña': {
      nombre: '🎣 Caña de pescar',
      ingredientes: { stick: 3, string: 2 },
      resultado: { tipo: 'fishing_rod', nivel: 1, durabilidad: 80 }
    },
    'cofre': {
      nombre: '📦 Cofre',
      ingredientes: { wood: 8 },
      resultado: { tipo: 'chest', cantidad: 1 }
    }
  }

  const recetaKey = text.toLowerCase().replace(' ', '_')
  const receta = recetas[recetaKey]

  if (!receta) {
    return m.reply(`❌ Receta no encontrada. Usa *${usedPrefix}craft* para ver recetas disponibles.`)
  }

  // Verificar si tiene todos los ingredientes
  for (const [ingrediente, cantidad] of Object.entries(receta.ingredientes)) {
    if (!user[ingrediente] || user[ingrediente] < cantidad) {
      const nombres = {
        wood: 'madera', stick: 'palos', cobblestone: 'piedra',
        iron: 'hierro', diamond: 'diamante', string: 'cuerda',
        feather: 'plumas', flint: 'pedernal'
      }
      return m.reply(`❌ Te faltan ${cantidad} ${nombres[ingrediente] || ingrediente}.`)
    }
  }

  // Consumir ingredientes
  for (const [ingrediente, cantidad] of Object.entries(receta.ingredientes)) {
    user[ingrediente] -= cantidad
  }

  // Aplicar resultado
  let mensajeResultado = `✅ *¡Crafteo exitoso!*\n\n`
  mensajeResultado += `🛠️ *Item crafteado:* ${receta.nombre}\n\n`
  
  if (receta.resultado.tipo === 'pickaxe') {
    user.pickaxe = receta.resultado.nivel
    user.pickaxeDurability = receta.resultado.durabilidad
    mensajeResultado += `⛏️ *Ahora puedes minar con:* ${usedPrefix}minar\n`
  } else if (receta.resultado.tipo === 'axe') {
    user.axe = receta.resultado.nivel
    user.axeDurability = receta.resultado.durabilidad
    mensajeResultado += `🪓 *Ahora puedes talar con:* ${usedPrefix}talar\n`
  } else if (receta.resultado.tipo === 'bow') {
    user.bow = receta.resultado.nivel
    user.bowDurability = receta.resultado.durabilidad
    mensajeResultado += `🏹 *Ahora puedes cazar con:* ${usedPrefix}cazar\n`
  } else if (receta.resultado.tipo === 'fishing_rod') {
    user.fishing_rod = receta.resultado.nivel
    user.rodDurability = receta.resultado.durabilidad
    mensajeResultado += `🎣 *Ahora puedes pescar con:* ${usedPrefix}pescar\n`
  } else if (receta.resultado.tipo === 'arrow') {
    user.arrow = (user.arrow || 0) + receta.resultado.cantidad
    mensajeResultado += `🎯 *Flechas obtenidas:* +${receta.resultado.cantidad}\n`
    mensajeResultado += `🎯 *Flechas totales:* ${user.arrow}\n`
  } else if (receta.resultado.tipo === 'chest') {
    user.chest = (user.chest || 0) + 1
    mensajeResultado += `📦 *Cofres obtenidos:* +1\n`
    mensajeResultado += `📦 *Cofres totales:* ${user.chest}\n`
  }

  mensajeResultado += `\n📦 *Recursos restantes:*\n`
  for (const [ingrediente, cantidad] of Object.entries(receta.ingredientes)) {
    mensajeResultado += `• ${ingrediente}: ${user[ingrediente]}\n`
  }

  await conn.reply(m.chat, mensajeResultado, m)
}

handler.help = ['craft', 'craftear', 'crear']
handler.tags = ['economy']
handler.command = ['craft', 'craftear', 'crear']
export default handler
