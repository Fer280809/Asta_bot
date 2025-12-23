let handler = async (m, { conn, usedPrefix, command, text }) => {
  const user = global.db.data.users[m.sender]
  if (!user) return m.reply('❌ Primero usa algún comando para crear tu perfil.')

  // Precios de venta
  const precios = {
    // Maderas
    wood: 15,
    oak_log: 20,
    spruce_log: 25,
    birch_log: 20,
    jungle_log: 30,
    acacia_log: 25,
    dark_oak_log: 35,
    
    // Minerales
    coal: 10,
    iron: 40,
    gold: 80,
    diamond: 200,
    emerald: 300,
    redstone: 15,
    lapis: 25,
    quartz: 35,
    copper: 20,
    ancient_debris: 500,
    netherite: 1000,
    
    // Caza
    meat: 25,
    leather: 30,
    feather: 10,
    wool: 15,
    egg: 5,
    
    // Pesca
    raw_fish: 30,
    raw_salmon: 40,
    clownfish: 100,
    pufferfish: 150,
    nautilus: 200,
    cod: 35,
    tropical_fish: 120,
    squid: 45,
    kelp: 10,
    seaweed: 8,
    pearl: 500,
    treasure: 1000,
    
    // Especiales
    apple: 20,
    sapling: 50,
    string: 10,
    bone: 15,
    rotten_flesh: 5,
    gunpowder: 40,
    ender_pearl: 150,
    blaze_rod: 200,
    ghast_tear: 300,
    spider_eye: 25
  }

  if (!text) {
    let message = `💰 *VENDER RECURSOS* 🎄\n\n`
    message += `📋 *Formato:* ${usedPrefix}vender [recurso] [cantidad]\n`
    message += `📋 *Ejemplo:* ${usedPrefix}vender madera 10\n\n`
    message += `📦 *Recursos que puedes vender:*\n\n`
    
    // Mostrar recursos que el usuario tiene
    let tieneRecursos = false
    for (const [recurso, precio] of Object.entries(precios)) {
      if (user[recurso] > 0) {
        tieneRecursos = true
        const valorTotal = user[recurso] * precio
        message += `• ${formatearNombre(recurso)}: ${user[recurso]} (¥${valorTotal.toLocaleString()})\n`
      }
    }
    
    if (!tieneRecursos) {
      message += `❌ *No tienes recursos para vender*\n`
      message += `✨ Consigue recursos con:\n`
      message += `• ${usedPrefix}talar - Para madera\n`
      message += `• ${usedPrefix}cazar - Para carne/cuero\n`
      message += `• ${usedPrefix}pescar - Para pescado\n`
      message += `• ${usedPrefix}minar - Para minerales\n`
    }
    
    await conn.reply(m.chat, message, m)
    return
  }

  // Procesar venta
  const args = text.toLowerCase().split(' ')
  if (args.length < 2) {
    return m.reply(`❌ Formato incorrecto. Usa: ${usedPrefix}vender [recurso] [cantidad]\nEjemplo: ${usedPrefix}vender madera 10`)
  }

  const recurso = args[0]
  let cantidad = parseInt(args[1])
  
  if (isNaN(cantidad) || cantidad <= 0) {
    return m.reply('❌ Cantidad inválida. Debe ser un número mayor a 0.')
  }

  // Verificar si el recurso existe
  if (!precios[recurso]) {
    return m.reply(`❌ Recurso no válido. Usa ${usedPrefix}vender para ver recursos disponibles.`)
  }

  // Verificar si tiene suficiente
  if (!user[recurso] || user[recurso] < cantidad) {
    return m.reply(`❌ No tienes suficiente ${formatearNombre(recurso)}. Tienes: ${user[recurso] || 0}`)
  }

  // Calcular ganancia
  const ganancia = cantidad * precios[recurso]
  
  // Realizar venta
  user[recurso] -= cantidad
  user.coin += ganancia
  
  // Mensaje de confirmación
  let message = `💰 *VENTA EXITOSA* 🎄\n\n`
  message += `📦 *Recurso vendido:* ${formatearNombre(recurso)}\n`
  message += `📊 *Cantidad:* ${cantidad} unidades\n`
  message += `💵 *Precio unitario:* ¥${precios[recurso]}\n`
  message += `💰 *Ganancia total:* ¥${ganancia.toLocaleString()}\n`
  message += `🎯 *Nuevo saldo:* ¥${user.coin.toLocaleString()}\n`
  message += `📦 *${formatearNombre(recurso)} restante:* ${user[recurso]}`

  await conn.reply(m.chat, message, m)
}

function formatearNombre(recurso) {
  const nombres = {
    wood: 'Madera',
    oak_log: 'Tronco de Roble',
    spruce_log: 'Tronco de Abeto',
    birch_log: 'Tronco de Abedul',
    jungle_log: 'Tronco de Jungla',
    acacia_log: 'Tronco de Acacia',
    dark_oak_log: 'Tronco de Roble Oscuro',
    coal: 'Carbón',
    iron: 'Hierro',
    gold: 'Oro',
    diamond: 'Diamante',
    emerald: 'Esmeralda',
    redstone: 'Redstone',
    lapis: 'Lapislázuli',
    quartz: 'Cuarzo',
    copper: 'Cobre',
    ancient_debris: 'Escombros Antiguos',
    netherite: 'Netherita',
    meat: 'Carne',
    leather: 'Cuero',
    feather: 'Plumas',
    wool: 'Lana',
    egg: 'Huevos',
    raw_fish: 'Pescado Crudo',
    raw_salmon: 'Salmón Crudo',
    clownfish: 'Pez Payaso',
    pufferfish: 'Pez Globo',
    nautilus: 'Nautilo',
    cod: 'Bacalao',
    tropical_fish: 'Pez Tropical',
    squid: 'Calamar',
    kelp: 'Alga',
    seaweed: 'Alga Marina',
    pearl: 'Perla',
    treasure: 'Tesoro',
    apple: 'Manzana',
    sapling: 'Brote',
    string: 'Cuerda',
    bone: 'Hueso',
    rotten_flesh: 'Carne Podrida',
    gunpowder: 'Pólvora',
    ender_pearl: 'Perla de Ender',
    blaze_rod: 'Vara de Blaze',
    ghast_tear: 'Lágrima de Ghast',
    spider_eye: 'Ojo de Araña'
  }
  
  return nombres[recurso] || recurso
}

handler.help = ['vender', 'sell']
handler.tags = ['economy']
handler.command = ['vender', 'sell']
export default handler