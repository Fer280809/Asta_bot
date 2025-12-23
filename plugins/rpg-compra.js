let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!global.db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`🎁 *¡Compra Bloqueada!*\n\nUsa *${usedPrefix}economy on* para activar la economía.`)
  }

  const user = global.db.data.users[m.sender]
  if (!user) global.db.data.users[m.sender] = {}
  user = global.db.data.users[m.sender]
  user.coin = user.coin || 0

  if (!text) {
    return conn.reply(m.chat,
      `🎁 *COMPRAR ITEMS*\n\n` +
      `Usa: *${usedPrefix}comprar [item]*\n\n` +
      `📋 *Ejemplos:*\n` +
      `• *${usedPrefix}comprar hacha_madera*\n` +
      `• *${usedPrefix}comprar madera*\n` +
      `• *${usedPrefix}comprar manzana*\n\n` +
      `🛒 *Ver tienda:* *${usedPrefix}tienda*`, m)
  }

  // Buscar el item en todas las categorías
  const items = {
    // Herramientas
    'hacha_madera': { nombre: 'Hacha de Madera', precio: 2000, tipo: 'axe', nivel: 1, durabilidad: 50 },
    'hacha_piedra': { nombre: 'Hacha de Piedra', precio: 5000, tipo: 'axe', nivel: 2, durabilidad: 100 },
    'hacha_hierro': { nombre: 'Hacha de Hierro', precio: 15000, tipo: 'axe', nivel: 3, durabilidad: 200 },
    'hacha_diamante': { nombre: 'Hacha de Diamante', precio: 50000, tipo: 'axe', nivel: 4, durabilidad: 500 },
    'hacha_netherita': { nombre: 'Hacha de Netherita', precio: 100000, tipo: 'axe', nivel: 5, durabilidad: 1000 },
    
    'pico_madera': { nombre: 'Pico de Madera', precio: 2000, tipo: 'pickaxe', nivel: 1, durabilidad: 50 },
    'pico_piedra': { nombre: 'Pico de Piedra', precio: 5000, tipo: 'pickaxe', nivel: 2, durabilidad: 100 },
    'pico_hierro': { nombre: 'Pico de Hierro', precio: 15000, tipo: 'pickaxe', nivel: 3, durabilidad: 200 },
    'pico_diamante': { nombre: 'Pico de Diamante', precio: 50000, tipo: 'pickaxe', nivel: 4, durabilidad: 500 },
    'pico_netherita': { nombre: 'Pico de Netherita', precio: 100000, tipo: 'pickaxe', nivel: 5, durabilidad: 1000 },
    
    'arco_basico': { nombre: 'Arco Básico', precio: 3000, tipo: 'bow', nivel: 1, durabilidad: 100 },
    'arco_potente': { nombre: 'Arco Potente', precio: 10000, tipo: 'bow', nivel: 2, durabilidad: 200 },
    'arco_elfico': { nombre: 'Arco Élfico', precio: 25000, tipo: 'bow', nivel: 3, durabilidad: 300 },
    
    'caña_basica': { nombre: 'Caña Básica', precio: 2500, tipo: 'fishing_rod', nivel: 1, durabilidad: 80 },
    'caña_mejorada': { nombre: 'Caña Mejorada', precio: 8000, tipo: 'fishing_rod', nivel: 2, durabilidad: 160 },
    'caña_encantada': { nombre: 'Caña Encantada', precio: 20000, tipo: 'fishing_rod', nivel: 3, durabilidad: 240 },
    
    // Recursos
    'madera': { nombre: 'Madera', precio: 500, cantidad: 64 },
    'piedra': { nombre: 'Piedra', precio: 1000, cantidad: 64 },
    'carbon': { nombre: 'Carbón', precio: 1500, cantidad: 64 },
    'hierro': { nombre: 'Hierro', precio: 3000, cantidad: 32 },
    'oro': { nombre: 'Oro', precio: 5000, cantidad: 16 },
    'diamante': { nombre: 'Diamante', precio: 10000, cantidad: 8 },
    'esmeralda': { nombre: 'Esmeralda', precio: 15000, cantidad: 4 },
    'redstone': { nombre: 'Redstone', precio: 2000, cantidad: 64 },
    'lapis': { nombre: 'Lapislázuli', precio: 2500, cantidad: 32 },
    'cuarzo': { nombre: 'Cuarzo', precio: 1800, cantidad: 32 },
    'cobre': { nombre: 'Cobre', precio: 1200, cantidad: 64 },
    
    // Comida
    'manzana': { nombre: 'Manzana', precio: 800, cantidad: 16, salud: 5 },
    'pan': { nombre: 'Pan', precio: 600, cantidad: 16, salud: 8 },
    'carne_cocida': { nombre: 'Carne Cocida', precio: 1200, cantidad: 16, salud: 12 },
    'pescado_cocido': { nombre: 'Pescado Cocido', precio: 1000, cantidad: 16, salud: 10 },
    'tarta': { nombre: 'Tarta', precio: 5000, cantidad: 1, salud: 30 },
    'sopa': { nombre: 'Sopa', precio: 3000, cantidad: 1, salud: 20 },
    'zanahoria': { nombre: 'Zanahoria', precio: 700, cantidad: 16, salud: 6 },
    'patata': { nombre: 'Patata', precio: 600, cantidad: 16, salud: 5 },
    'patata_horneada': { nombre: 'Patata Horneada', precio: 900, cantidad: 16, salud: 10 },
    
    // Otros
    'flechas': { nombre: 'Flechas', precio: 500, cantidad: 16 },
    'flechas32': { nombre: 'Flechas', precio: 900, cantidad: 32 },
    'flechas64': { nombre: 'Flechas', precio: 1700, cantidad: 64 },
    'huevo': { nombre: 'Huevo', precio: 400, cantidad: 16 },
    'perla_ender': { nombre: 'Perla de Ender', precio: 5000, cantidad: 1 },
    'vara_blaze': { nombre: 'Vara de Blaze', precio: 8000, cantidad: 1 },
    'polvora': { nombre: 'Pólvora', precio: 3000, cantidad: 16 },
    'hilo': { nombre: 'Hilo', precio: 800, cantidad: 16 },
    'pluma': { nombre: 'Pluma', precio: 600, cantidad: 16 },
    'cuero': { nombre: 'Cuero', precio: 1000, cantidad: 16 },
    'lana': { nombre: 'Lana', precio: 800, cantidad: 16 }
  }

  const itemKey = text.toLowerCase()
  const item = items[itemKey]

  if (!item) {
    return conn.reply(m.chat,
      `❌ *Item no encontrado*\n\n` +
      `Usa *${usedPrefix}tienda* para ver los items disponibles.\n\n` +
      `🛒 *Ejemplo:*\n` +
      `*${usedPrefix}comprar hacha_madera*`, m)
  }

  // Verificar si tiene suficiente dinero
  if (user.coin < item.precio) {
    return conn.reply(m.chat,
      `❌ *Dinero insuficiente*\n\n` +
      `Necesitas ¥${item.precio.toLocaleString()} para comprar *${item.nombre}*\n` +
      `💰 *Tu saldo:* ¥${user.coin.toLocaleString()}\n\n` +
      `💡 *Consejo:* Trabaja más para ganar dinero.`, m)
  }

  // Realizar la compra
  user.coin -= item.precio

  // Aplicar el item comprado
  if (item.tipo) {
    // Es una herramienta
    user[item.tipo] = item.nivel
    user[`${item.tipo}Durability`] = item.durabilidad
    
    let mensaje = `🎁 *¡Compra exitosa!*\n\n`
    mensaje += `🛒 *Item:* ${item.nombre}\n`
    mensaje += `💰 *Precio:* ¥${item.precio.toLocaleString()}\n`
    mensaje += `🔨 *Durabilidad:* ${item.durabilidad}\n`
    mensaje += `📊 *Nivel:* ${item.nivel}\n\n`
    mensaje += `💰 *Saldo restante:* ¥${user.coin.toLocaleString()}\n\n`
    
    if (item.tipo === 'axe') {
      mensaje += `🪓 *Ahora puedes usar:* *${usedPrefix}talar*\n`
    } else if (item.tipo === 'pickaxe') {
      mensaje += `⛏️ *Ahora puedes usar:* *${usedPrefix}minar*\n`
    } else if (item.tipo === 'bow') {
      mensaje += `🏹 *Ahora puedes usar:* *${usedPrefix}cazar*\n`
      // Dar flechas básicas si compra un arco
      user.arrow = (user.arrow || 0) + 16
      mensaje += `🎯 *Flechas incluidas:* 16\n`
    } else if (item.tipo === 'fishing_rod') {
      mensaje += `🎣 *Ahora puedes usar:* *${usedPrefix}pescar*\n`
    }
    
    await conn.reply(m.chat, mensaje, m)
    
  } else {
    // Es un recurso, comida u otro
    const propiedad = itemKey
    const cantidad = item.cantidad || 1
    
    user[propiedad] = (user[propiedad] || 0) + cantidad
    
    let mensaje = `🎁 *¡Compra exitosa!*\n\n`
    mensaje += `🛒 *Item:* ${item.nombre} (x${cantidad})\n`
    mensaje += `💰 *Precio:* ¥${item.precio.toLocaleString()}\n`
    
    if (item.salud) {
      mensaje += `❤️ *Salud que recupera:* ${item.salud}\n`
    }
    
    mensaje += `\n💰 *Saldo restante:* ¥${user.coin.toLocaleString()}\n`
    mensaje += `📦 *Total ${item.nombre}:* ${user[propiedad]}\n\n`
    
    if (propiedad === 'flechas' || propiedad === 'flechas32' || propiedad === 'flechas64') {
      user.arrow = (user.arrow || 0) + cantidad
      mensaje += `🎯 *Flechas totales:* ${user.arrow}\n`
    }
    
    await conn.reply(m.chat, mensaje, m)
  }
}

handler.help = ['comprar <item>']
handler.tags = ['economy']
handler.command = ['comprar', 'buy']
handler.group = true
export default handler
