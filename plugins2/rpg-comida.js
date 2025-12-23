let handler = async (m, { conn, usedPrefix, command, text }) => {
  const user = global.db.data.users[m.sender]
  
  // Inicializar usuario
  if (!user) {
    global.db.data.users[m.sender] = {
      coin: 100,
      health: 100,
      hunger: 100,
      energy: 100,
      level: 1,
      exp: 0
    }
    user = global.db.data.users[m.sender]
  }

  // Inicializar estadísticas
  user.coin = user.coin || 100
  user.health = user.health || 100
  user.hunger = user.hunger || 100
  user.energy = user.energy || 100
  user.level = user.level || 1
  user.exp = user.exp || 0
  
  // Recursos de comida
  user.apple = user.apple || 0
  user.meat = user.meat || 0
  user.raw_fish = user.raw_fish || 0
  user.bread = user.bread || 0
  user.cooked_meat = user.cooked_meat || 0
  user.cooked_fish = user.cooked_fish || 0
  user.steak = user.steak || 0
  user.cake = user.cake || 0
  user.cookie = user.cookie || 0
  user.golden_apple = user.golden_apple || 0
  
  // Recursos básicos
  user.wheat = user.wheat || 0
  user.milk = user.milk || 0
  user.egg = user.egg || 0
  user.sugar = user.sugar || 0
  user.cocoa = user.cocoa || 0

  // Mostrar menú de comida
  if (!text || text === 'menu') {
    let message = `🍽️ *SISTEMA DE ALIMENTACIÓN* 🎄\n\n`
    message += `❤️ *Salud:* ${user.health}/100\n`
    message += `🍗 *Hambre:* ${user.hunger}/100\n`
    message += `⚡ *Energía:* ${user.energy}/100\n`
    message += `💰 *Monedas:* ¥${user.coin.toLocaleString()}\n\n`
    
    message += `📋 *ALIMENTOS BÁSICOS:*\n`
    message += `🍎 Manzana: ${user.apple} (Hambre: +15)\n`
    message += `🍖 Carne cruda: ${user.meat} (Hambre: +25)\n`
    message += `🐟 Pescado crudo: ${user.raw_fish} (Hambre: +20)\n`
    message += `🍞 Pan: ${user.bread} (Hambre: +30)\n\n`
    
    message += `🔥 *COMIDA COCINADA:*\n`
    message += `🍖 Carne cocida: ${user.cooked_meat} (Hambre: +40, Salud: +10)\n`
    message += `🐟 Pescado cocido: ${user.cooked_fish} (Hambre: +35, Salud: +8)\n`
    message += `🥩 Filete: ${user.steak} (Hambre: +50, Salud: +15)\n`
    message += `🍰 Pastel: ${user.cake} (Hambre: +60, Salud: +20)\n`
    message += `🍪 Galleta: ${user.cookie} (Hambre: +20, Energía: +10)\n`
    message += `🍏 Manzana dorada: ${user.golden_apple} (Hambre: +30, Salud: +50)\n\n`
    
    message += `🔧 *RECURSOS PARA COCINAR:*\n`
    message += `🌾 Trigo: ${user.wheat}\n`
    message += `🥛 Leche: ${user.milk}\n`
    message += `🥚 Huevo: ${user.egg}\n`
    message += `🍬 Azúcar: ${user.sugar}\n`
    message += `🍫 Cacao: ${user.cocoa}\n\n`
    
    message += `📌 *COMANDOS DISPONIBLES:*\n`
    message += `• ${usedPrefix}comer [alimento] - Consumir alimento\n`
    message += `• ${usedPrefix}cocinar [receta] - Cocinar alimentos\n`
    message += `• ${usedPrefix}recetas - Ver recetas disponibles\n`
    message += `• ${usedPrefix}cultivar - Cultivar trigo\n`
    message += `• ${usedPrefix}ordeñar - Ordeñar vacas\n\n`
    
    message += `⚠️ *ADVERTENCIA:* Si tu hambre llega a 0, perderás salud lentamente.`

    await conn.reply(m.chat, message, m)
    return
  }

  // Comer alimento
  if (text.startsWith('comer') || command === 'comer') {
    const alimento = text.split(' ')[1]?.toLowerCase()
    if (!alimento) return m.reply(`❌ Especifica qué quieres comer.\nEjemplo: ${usedPrefix}comer manzana`)

    const alimentos = {
      'manzana': { nombre: '🍎 Manzana', recurso: 'apple', hambre: 15, salud: 0, energia: 0, mensaje: '🍎 Crujiente y refrescante!' },
      'carne': { nombre: '🍖 Carne cruda', recurso: 'meat', hambre: 25, salud: -5, energia: 5, mensaje: '🍖 Carne cruda... no es muy saludable.' },
      'pescado': { nombre: '🐟 Pescado crudo', recurso: 'raw_fish', hambre: 20, salud: -3, energia: 8, mensaje: '🐟 Fresco del río.' },
      'pan': { nombre: '🍞 Pan', recurso: 'bread', hambre: 30, salud: 5, energia: 15, mensaje: '🍞 Pan recién horneado!' },
      'carne_cocida': { nombre: '🍖 Carne cocida', recurso: 'cooked_meat', hambre: 40, salud: 10, energia: 20, mensaje: '🍖 Deliciosa carne a la parrilla!' },
      'pescado_cocido': { nombre: '🐟 Pescado cocido', recurso: 'cooked_fish', hambre: 35, salud: 8, energia: 18, mensaje: '🐟 Pescado perfectamente cocido.' },
      'filete': { nombre: '🥩 Filete', recurso: 'steak', hambre: 50, salud: 15, energia: 25, mensaje: '🥩 Un filete jugoso y tierno!' },
      'pastel': { nombre: '🍰 Pastel', recurso: 'cake', hambre: 60, salud: 20, energia: 30, mensaje: '🍰 ¡Dulce y esponjoso!' },
      'galleta': { nombre: '🍪 Galleta', recurso: 'cookie', hambre: 20, salud: 5, energia: 25, mensaje: '🍪 Galleta con chispas de chocolate.' },
      'manzana_dorada': { nombre: '🍏 Manzana dorada', recurso: 'golden_apple', hambre: 30, salud: 50, energia: 40, mensaje: '🍏 ¡Manzana mágica dorada!' }
    }

    const comida = alimentos[alimento]
    if (!comida) {
      return m.reply(`❌ Alimento no encontrado. Usa ${usedPrefix}comida para ver opciones.`)
    }

    // Verificar si tiene el alimento
    if (!user[comida.recurso] || user[comida.recurso] <= 0) {
      return m.reply(`❌ No tienes ${comida.nombre}.`)
    }

    // Verificar si ya está lleno
    if (user.hunger >= 100) {
      return m.reply('❌ Ya estás lleno. No puedes comer más.')
    }

    // Consumir alimento
    user[comida.recurso] -= 1
    
    // Aplicar efectos
    user.hunger = Math.min(100, user.hunger + comida.hambre)
    user.health = Math.min(100, user.health + comida.salud)
    user.energy = Math.min(100, user.energy + comida.energia)

    let message = `${comida.mensaje}\n\n`
    message += `✅ *Comiste ${comida.nombre}*\n\n`
    message += `🍗 *Hambre:* +${comida.hambre} (${user.hunger}/100)\n`
    if (comida.salud > 0) {
      message += `❤️ *Salud:* +${comida.salud} (${user.health}/100)\n`
    } else if (comida.salud < 0) {
      message += `💔 *Salud:* ${comida.salud} (${user.health}/100)\n`
    }
    if (comida.energia > 0) {
      message += `⚡ *Energía:* +${comida.energia} (${user.energy}/100)\n`
    }
    message += `📦 *${comida.nombre} restantes:* ${user[comida.recurso]}`

    await conn.reply(m.chat, message, m)
    return
  }

  // Cocinar recetas
  if (text.startsWith('cocinar') || command === 'cocinar') {
    const receta = text.split(' ')[1]?.toLowerCase()
    if (!receta) {
      // Mostrar recetas disponibles
      const recetas = [
        { nombre: 'Pan', ingredientes: { wheat: 3 }, resultado: 'bread', cantidad: 1 },
        { nombre: 'Carne cocida', ingredientes: { meat: 1 }, resultado: 'cooked_meat', cantidad: 1, requiere_fogata: true },
        { nombre: 'Pescado cocido', ingredientes: { raw_fish: 1 }, resultado: 'cooked_fish', cantidad: 1, requiere_fogata: true },
        { nombre: 'Filete', ingredientes: { cooked_meat: 2, bread: 1 }, resultado: 'steak', cantidad: 1 },
        { nombre: 'Pastel', ingredientes: { wheat: 3, milk: 3, egg: 2, sugar: 2 }, resultado: 'cake', cantidad: 1 },
        { nombre: 'Galleta', ingredientes: { wheat: 2, cocoa: 1, sugar: 1 }, resultado: 'cookie', cantidad: 8 },
        { nombre: 'Manzana dorada', ingredientes: { apple: 1, gold: 8 }, resultado: 'golden_apple', cantidad: 1 }
      ]

      let message = `👨‍🍳 *RECETAS DE COCINA* 🎄\n\n`
      recetas.forEach((r, i) => {
        message += `${i + 1}. ${r.nombre}\n`
        message += `   ↳ Ingredientes:\n`
        for (const [ing, cant] of Object.entries(r.ingredientes)) {
          const nombreIng = {
            wheat: '🌾 Trigo', meat: '🍖 Carne', raw_fish: '🐟 Pescado',
            milk: '🥛 Leche', egg: '🥚 Huevo', sugar: '🍬 Azúcar',
            cocoa: '🍫 Cacao', apple: '🍎 Manzana', gold: '🟡 Lingotes de oro',
            bread: '🍞 Pan', cooked_meat: '🍖 Carne cocida'
          }[ing] || ing
          message += `      ${nombreIng}: ${cant}\n`
        }
        message += `   ↳ Resultado: ${r.cantidad}x ${r.nombre}\n`
        if (r.requiere_fogata) message += `   ↳ Requiere: 🔥 Fogata\n`
        message += `   ↳ Comando: *${usedPrefix}cocinar ${r.nombre.toLowerCase().replace(' ', '_')}*\n\n`
      })

      await conn.reply(m.chat, message, m)
      return
    }

    // Procesar receta específica
    const recetas = {
      'pan': {
        ingredientes: { wheat: 3 },
        resultado: 'bread',
        cantidad: 1,
        mensaje: '🍞 Pan recién horneado listo.'
      },
      'carne_cocida': {
        ingredientes: { meat: 1 },
        resultado: 'cooked_meat',
        cantidad: 1,
        requiere_fogata: true,
        mensaje: '🍖 Carne perfectamente cocida.'
      },
      'pescado_cocido': {
        ingredientes: { raw_fish: 1 },
        resultado: 'cooked_fish',
        cantidad: 1,
        requiere_fogata: true,
        mensaje: '🐟 Pescado cocido al punto.'
      },
      'filete': {
        ingredientes: { cooked_meat: 2, bread: 1 },
        resultado: 'steak',
        cantidad: 1,
        mensaje: '🥩 Filete gourmet preparado.'
      },
      'pastel': {
        ingredientes: { wheat: 3, milk: 3, egg: 2, sugar: 2 },
        resultado: 'cake',
        cantidad: 1,
        mensaje: '🍰 ¡Un delicioso pastel!'
      },
      'galleta': {
        ingredientes: { wheat: 2, cocoa: 1, sugar: 1 },
        resultado: 'cookie',
        cantidad: 8,
        mensaje: '🍪 Galletas recién horneadas.'
      },
      'manzana_dorada': {
        ingredientes: { apple: 1, gold: 8 },
        resultado: 'golden_apple',
        cantidad: 1,
        mensaje: '🍏 ¡Manzana dorada mágica!'
      }
    }

    const receta = recetas[receta]
    if (!receta) {
      return m.reply(`❌ Receta no encontrada. Usa ${usedPrefix}cocinar para ver recetas.`)
    }

    // Verificar fogata si es necesario
    if (receta.requiere_fogata && !user.fogata) {
      return m.reply('❌ Necesitas una fogata para cocinar esto. Usa *craft fogata* para crear una.')
    }

    // Verificar ingredientes
    for (const [ingrediente, cantidad] of Object.entries(receta.ingredientes)) {
      if (!user[ingrediente] || user[ingrediente] < cantidad) {
        const nombres = {
          wheat: 'trigo', meat: 'carne', raw_fish: 'pescado crudo',
          milk: 'leche', egg: 'huevo', sugar: 'azúcar',
          cocoa: 'cacao', apple: 'manzana', gold: 'lingotes de oro',
          bread: 'pan', cooked_meat: 'carne cocida'
        }
        return m.reply(`❌ Te falta ${cantidad} ${nombres[ingrediente] || ingrediente}.`)
      }
    }

    // Consumir ingredientes
    for (const [ingrediente, cantidad] of Object.entries(receta.ingredientes)) {
      user[ingrediente] -= cantidad
    }

    // Añadir resultado
    user[receta.resultado] = (user[receta.resultado] || 0) + receta.cantidad

    // Consumir energía por cocinar
    user.energy = Math.max(0, user.energy - 10)

    let message = `${receta.mensaje}\n\n`
    message += `✅ *¡Cocinas exitosamente!*\n\n`
    message += `📦 *Obtuviste:* ${receta.cantidad}x ${formatearNombre(receta.resultado)}\n`
    message += `⚡ *Energía usada:* -10 (${user.energy}/100)\n\n`
    message += `🍳 *Ahora puedes comerlo usando:*\n`
    message += `*${usedPrefix}comer ${receta.resultado.replace('_', ' ')}*`

    await conn.reply(m.chat, message, m)
  }
}

// Función para formatear nombres
function formatearNombre(item) {
  const nombres = {
    'bread': '🍞 Pan',
    'cooked_meat': '🍖 Carne cocida',
    'cooked_fish': '🐟 Pescado cocido',
    'steak': '🥩 Filete',
    'cake': '🍰 Pastel',
    'cookie': '🍪 Galleta',
    'golden_apple': '🍏 Manzana dorada'
  }
  return nombres[item] || item
}

handler.help = ['comida', 'comer', 'cocinar', 'recetas']
handler.tags = ['economy', 'survival']
handler.command = ['comida', 'comer', 'cocinar', 'recetas', 'cook']
export default handler
