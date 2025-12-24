let handler = async (m, { conn, usedPrefix, command, text }) => {
  const user = global.db.data.users[m.sender]
  
  if (!user) return m.reply('❌ Primero usa algún comando para crear tu perfil.')
  
  user.coin = user.coin || 0
  
  if (!text) {
    return m.reply(
      `🛒 *COMPRAR ITEMS*\n\n` +
      `Usa: *${usedPrefix}comprar [item] [cantidad?]*\n\n` +
      `📋 *Items disponibles:*\n` +
      `• pico [tipo] - Comprar pico (madera, piedra, hierro, diamante, netherita)\n` +
      `• hacha [tipo] - Comprar hacha (madera, piedra, hierro, diamante, netherita)\n` +
      `• arco [tipo?] - Comprar arco (básico, potente, élfico)\n` +
      `• caña [tipo?] - Comprar caña (básica, mejorada, encantada)\n` +
      `• flechas [cantidad?] - Comprar flechas (16, 32, 64)\n\n` +
      `📌 *Ejemplos:*\n` +
      `• ${usedPrefix}comprar pico madera\n` +
      `• ${usedPrefix}comprar hacha piedra\n` +
      `• ${usedPrefix}comprar arco\n` +
      `• ${usedPrefix}comprar caña mejorada\n` +
      `• ${usedPrefix}comprar flechas 32\n\n` +
      `💰 *Tu saldo:* ¥${user.coin.toLocaleString()}`
    )
  }
  
  const args = text.toLowerCase().split(' ')
  const tipoItem = args[0]
  const subTipo = args[1] || 'básico'
  
  // Definir precios y propiedades de los items
  const items = {
    // PICOS
    'pico_madera': { nombre: 'Pico de Madera', precio: 2000, durabilidad: 50, tipo: 'pickaxe', nivel: 1 },
    'pico_piedra': { nombre: 'Pico de Piedra', precio: 5000, durabilidad: 100, tipo: 'pickaxe', nivel: 2 },
    'pico_hierro': { nombre: 'Pico de Hierro', precio: 15000, durabilidad: 200, tipo: 'pickaxe', nivel: 3 },
    'pico_diamante': { nombre: 'Pico de Diamante', precio: 50000, durabilidad: 500, tipo: 'pickaxe', nivel: 4 },
    'pico_netherita': { nombre: 'Pico de Netherita', precio: 100000, durabilidad: 1000, tipo: 'pickaxe', nivel: 5 },
    
    // HACHAS
    'hacha_madera': { nombre: 'Hacha de Madera', precio: 2000, durabilidad: 50, tipo: 'axe', nivel: 1 },
    'hacha_piedra': { nombre: 'Hacha de Piedra', precio: 5000, durabilidad: 100, tipo: 'axe', nivel: 2 },
    'hacha_hierro': { nombre: 'Hacha de Hierro', precio: 15000, durabilidad: 200, tipo: 'axe', nivel: 3 },
    'hacha_diamante': { nombre: 'Hacha de Diamante', precio: 50000, durabilidad: 500, tipo: 'axe', nivel: 4 },
    'hacha_netherita': { nombre: 'Hacha de Netherita', precio: 100000, durabilidad: 1000, tipo: 'axe', nivel: 5 },
    
    // ARCOS
    'arco_básico': { nombre: 'Arco Básico', precio: 3000, durabilidad: 100, tipo: 'bow', nivel: 1 },
    'arco_potente': { nombre: 'Arco Potente', precio: 10000, durabilidad: 200, tipo: 'bow', nivel: 2 },
    'arco_élfico': { nombre: 'Arco Élfico', precio: 25000, durabilidad: 400, tipo: 'bow', nivel: 3 },
    
    // CAÑAS
    'caña_básica': { nombre: 'Caña Básica', precio: 2500, durabilidad: 80, tipo: 'fishing_rod', nivel: 1 },
    'caña_mejorada': { nombre: 'Caña Mejorada', precio: 8000, durabilidad: 200, tipo: 'fishing_rod', nivel: 2 },
    'caña_encantada': { nombre: 'Caña Encantada', precio: 20000, durabilidad: 400, tipo: 'fishing_rod', nivel: 3 },
    
    // FLECHAS (paquetes)
    'flechas_16': { nombre: '16 Flechas', precio: 500, cantidad: 16, tipo: 'arrow' },
    'flechas_32': { nombre: '32 Flechas', precio: 900, cantidad: 32, tipo: 'arrow' },
    'flechas_64': { nombre: '64 Flechas', precio: 1700, cantidad: 64, tipo: 'arrow' }
  }
  
  // Determinar qué item se quiere comprar
  let itemKey = ''
  
  if (tipoItem === 'pico') {
    itemKey = `pico_${subTipo}`
  } else if (tipoItem === 'hacha') {
    itemKey = `hacha_${subTipo}`
  } else if (tipoItem === 'arco') {
    itemKey = `arco_${subTipo}`
  } else if (tipoItem === 'caña') {
    itemKey = `caña_${subTipo}`
  } else if (tipoItem === 'flechas') {
    const cantidad = parseInt(subTipo) || 16
    if (cantidad === 64) itemKey = 'flechas_64'
    else if (cantidad === 32) itemKey = 'flechas_32'
    else itemKey = 'flechas_16'
  } else {
    return m.reply(`❌ Item no válido. Usa *${usedPrefix}comprar* para ver opciones.`)
  }
  
  const item = items[itemKey]
  
  if (!item) {
    return m.reply(`❌ Variante no encontrada. Usa *${usedPrefix}tienda* para ver opciones.`)
  }
  
  // Verificar si tiene suficiente dinero
  if (user.coin < item.precio) {
    return m.reply(`❌ No tienes suficiente dinero. Necesitas ¥${item.precio.toLocaleString()}, tienes ¥${user.coin.toLocaleString()}`)
  }
  
  // Realizar la compra
  user.coin -= item.precio
  
  // Aplicar el item comprado
  if (item.tipo === 'pickaxe') {
    user.pickaxe = item.nivel
    user.pickaxeDurability = item.durabilidad
  } else if (item.tipo === 'axe') {
    user.axe = item.nivel
    user.axeDurability = item.durabilidad
  } else if (item.tipo === 'bow') {
    user.bow = item.nivel
    user.bowDurability = item.durabilidad
  } else if (item.tipo === 'fishing_rod') {
    user.fishing_rod = item.nivel
    user.rodDurability = item.durabilidad
  } else if (item.tipo === 'arrow') {
    user.arrow = (user.arrow || 0) + item.cantidad
  }
  
  // Mensaje de confirmación
  let message = `✅ *¡Compra exitosa!*\n\n`
  message += `🛒 *Item comprado:* ${item.nombre}\n`
  message += `💰 *Precio pagado:* ¥${item.precio.toLocaleString()}\n`
  
  if (item.durabilidad) {
    message += `🔨 *Durabilidad:* ${item.durabilidad}\n`
  }
  if (item.cantidad) {
    message += `🎯 *Cantidad:* ${item.cantidad} flechas\n`
  }
  
  message += `📦 *Nuevo saldo:* ¥${user.coin.toLocaleString()}\n\n`
  
  // Añadir instrucciones de uso
  if (item.tipo === 'pickaxe') {
    message += `⛏️ *Ahora puedes usar:* ${usedPrefix}minar`
  } else if (item.tipo === 'axe') {
    message += `🪓 *Ahora puedes usar:* ${usedPrefix}talar`
  } else if (item.tipo === 'bow') {
    message += `🏹 *Ahora puedes usar:* ${usedPrefix}cazar (necesitas flechas)`
  } else if (item.tipo === 'fishing_rod') {
    message += `🎣 *Ahora puedes usar:* ${usedPrefix}pescar`
  } else if (item.tipo === 'arrow') {
    message += `🎯 *Flechas totales:* ${user.arrow}\n`
    message += `🏹 *Ahora puedes cazar con:* ${usedPrefix}cazar`
  }
  
  await conn.reply(m.chat, message, m)
}

handler.help = ['comprar']
handler.tags = ['economy']
handler.command = ['comprar', 'buy']
export default handler
