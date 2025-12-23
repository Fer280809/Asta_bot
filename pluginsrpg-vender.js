let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!global.db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`💰 *¡Venta Bloqueada!*\n\nUsa *${usedPrefix}economy on* para activar la economía.`)
  }

  const user = global.db.data.users[m.sender]
  if (!user) global.db.data.users[m.sender] = {}
  user = global.db.data.users[m.sender]
  user.coin = user.coin || 0

  if (!text) {
    return conn.reply(m.chat,
      `💰 *VENDER RECURSOS*\n\n` +
      `Usa: *${usedPrefix}vender [recurso] [cantidad]*\n\n` +
      `📋 *Recursos que puedes vender:*\n` +
      `• madera, piedra, carbón, hierro, oro\n` +
      `• diamante, esmeralda, redstone, lapis\n` +
      `• cuarzo, cobre, carne, pescado, cuero\n` +
      `• lana, plumas, huevos, hilo, etc.\n\n` +
      `📦 *Ejemplos:*\n` +
      `• *${usedPrefix}vender madera 64*\n` +
      `• *${usedPrefix}vender diamante 1*\n` +
      `• *${usedPrefix}vender carne 16*\n\n` +
      `🛒 *Ver precios:* *${usedPrefix}precios*`, m)
  }

  const args = text.split(' ')
  const recurso = args[0].toLowerCase()
  let cantidad = parseInt(args[1]) || 1

  // Precios de venta (70% del precio de compra)
  const preciosVenta = {
    // Recursos
    'wood': 5, 'madera': 5,
    'cobblestone': 10, 'piedra': 10,
    'coal': 15, 'carbon': 15,
    'iron': 40, 'hierro': 40,
    'gold': 80, 'oro': 80,
    'diamond': 150, 'diamante': 150,
    'emerald': 200, 'esmeralda': 200,
    'redstone': 20, 'redstone': 20,
    'lapis': 30, 'lapis': 30,
    'quartz': 25, 'cuarzo': 25,
    'copper': 15, 'cobre': 15,
    
    // Recursos de caza
    'meat': 25, 'carne': 25,
    'leather': 40, 'cuero': 40,
    'feather': 20, 'pluma': 20,
    'wool': 30, 'lana': 30,
    'egg': 15, 'huevo': 15,
    'string': 30, 'hilo': 30,
    'bone': 25, 'hueso': 25,
    'rotten_flesh': 10, 'carne_podrida': 10,
    'gunpowder': 50, 'polvora': 50,
    'ender_pearl': 200, 'perla_ender': 200,
    'blaze_rod': 300, 'vara_blaze': 300,
    'ghast_tear': 400, 'lagrima_ghast': 400,
    'spider_eye': 60, 'ojo_aranya': 60,
    
    // Recursos de pesca
    'raw_fish': 20, 'pescado': 20,
    'raw_salmon': 30, 'salmon': 30,
    'cod': 25, 'bacalao': 25,
    'pufferfish': 100, 'pez_globo': 100,
    'clownfish': 80, 'pez_payaso': 80,
    'tropical_fish': 60, 'pez_tropical': 60,
    'squid': 40, 'calamar': 40,
    'kelp': 10, 'algas': 10,
    'seaweed': 8, 'algas_marinas': 8,
    'nautilus': 500, 'nautilus': 500,
    'pearl': 2000, 'perla': 2000,
    'treasure': 5000, 'tesoro': 5000,
    
    // Maderas especiales
    'oak_log': 8, 'roble': 8,
    'spruce_log': 8, 'abeto': 8,
    'birch_log': 8, 'abedul': 8,
    'jungle_log': 10, 'jungla': 10,
    'acacia_log': 10, 'acacia': 10,
    'dark_oak_log': 12, 'roble_oscuro': 12,
    
    // Otros
    'apple': 30, 'manzana': 30,
    'sapling': 50, 'brote': 50,
    'ancient_debris': 1000, 'escombros_antiguos': 1000,
    'netherite': 5000, 'netherita': 5000
  }

  // Verificar si el recurso existe en los precios
  if (!preciosVenta[recurso]) {
    return conn.reply(m.chat,
      `❌ *Recurso no válido*\n\n` +
      `No puedes vender "${recurso}".\n` +
      `Usa *${usedPrefix}vender* para ver la lista de recursos.`, m)
  }

  // Verificar si tiene suficiente cantidad
  const cantidadDisponible = user[recurso] || 0
  if (cantidadDisponible < cantidad) {
    return conn.reply(m.chat,
      `❌ *Cantidad insuficiente*\n\n` +
      `Solo tienes ${cantidadDisponible} de ${recurso}.\n` +
      `Quieres vender ${cantidad}.`, m)
  }

  // Calcular ganancia
  const precioUnitario = preciosVenta[recurso]
  const ganancia = precioUnitario * cantidad

  // Realizar la venta
  user[recurso] -= cantidad
  user.coin += ganancia

  // Obtener nombre bonito del recurso
  const nombresBonitos = {
    'wood': 'Madera', 'madera': 'Madera',
    'coal': 'Carbón', 'carbon': 'Carbón',
    'iron': 'Hierro', 'hierro': 'Hierro',
    'gold': 'Oro', 'oro': 'Oro',
    'diamond': 'Diamante', 'diamante': 'Diamante',
    'meat': 'Carne', 'carne': 'Carne',
    'leather': 'Cuero', 'cuero': 'Cuero',
    // ... agregar más según sea necesario
  }

  const nombreRecurso = nombresBonitos[recurso] || recurso

  let mensaje = `💰 *¡Venta exitosa!*\n\n`
  mensaje += `📦 *Recurso:* ${nombreRecurso}\n`
  mensaje += `📊 *Cantidad:* ${cantidad}\n`
  mensaje += `💵 *Precio unitario:* ¥${precioUnitario}\n`
  mensaje += `💰 *Ganancia total:* ¥${ganancia.toLocaleString()}\n\n`
  mensaje += `💰 *Nuevo saldo:* ¥${user.coin.toLocaleString()}\n`
  mensaje += `📦 *${nombreRecurso} restante:* ${user[recurso]}`

  await conn.reply(m.chat, mensaje, m)
}

handler.help = ['vender <recurso> [cantidad]']
handler.tags = ['economy']
handler.command = ['vender', 'sell']
handler.group = true
export default handler
