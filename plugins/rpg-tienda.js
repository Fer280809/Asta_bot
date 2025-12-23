let handler = async (m, { conn, usedPrefix, command, text }) => {
  // Verificar economía activada
  if (!global.db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`🎁 *¡Tienda Cerrada!*\n\nUsa *${usedPrefix}economy on* para activar la economía.`)
  }

  const user = global.db.data.users[m.sender]
  if (!user) global.db.data.users[m.sender] = {}
  user = global.db.data.users[m.sender]
  user.coin = user.coin || 0

  // Categorías de la tienda
  const categorias = {
    herramientas: {
      nombre: '🛠️ HERRAMIENTAS',
      items: [
        { id: 'hacha_madera', nombre: 'Hacha de Madera', precio: 2000, tipo: 'axe', nivel: 1, durabilidad: 50 },
        { id: 'hacha_piedra', nombre: 'Hacha de Piedra', precio: 5000, tipo: 'axe', nivel: 2, durabilidad: 100 },
        { id: 'hacha_hierro', nombre: 'Hacha de Hierro', precio: 15000, tipo: 'axe', nivel: 3, durabilidad: 200 },
        { id: 'hacha_diamante', nombre: 'Hacha de Diamante', precio: 50000, tipo: 'axe', nivel: 4, durabilidad: 500 },
        { id: 'hacha_netherita', nombre: 'Hacha de Netherita', precio: 100000, tipo: 'axe', nivel: 5, durabilidad: 1000 },
        { id: 'pico_madera', nombre: 'Pico de Madera', precio: 2000, tipo: 'pickaxe', nivel: 1, durabilidad: 50 },
        { id: 'pico_piedra', nombre: 'Pico de Piedra', precio: 5000, tipo: 'pickaxe', nivel: 2, durabilidad: 100 },
        { id: 'pico_hierro', nombre: 'Pico de Hierro', precio: 15000, tipo: 'pickaxe', nivel: 3, durabilidad: 200 },
        { id: 'pico_diamante', nombre: 'Pico de Diamante', precio: 50000, tipo: 'pickaxe', nivel: 4, durabilidad: 500 },
        { id: 'pico_netherita', nombre: 'Pico de Netherita', precio: 100000, tipo: 'pickaxe', nivel: 5, durabilidad: 1000 },
        { id: 'arco_basico', nombre: 'Arco Básico', precio: 3000, tipo: 'bow', nivel: 1, durabilidad: 100 },
        { id: 'arco_potente', nombre: 'Arco Potente', precio: 10000, tipo: 'bow', nivel: 2, durabilidad: 200 },
        { id: 'arco_elfico', nombre: 'Arco Élfico', precio: 25000, tipo: 'bow', nivel: 3, durabilidad: 300 },
        { id: 'caña_basica', nombre: 'Caña Básica', precio: 2500, tipo: 'fishing_rod', nivel: 1, durabilidad: 80 },
        { id: 'caña_mejorada', nombre: 'Caña Mejorada', precio: 8000, tipo: 'fishing_rod', nivel: 2, durabilidad: 160 },
        { id: 'caña_encantada', nombre: 'Caña Encantada', precio: 20000, tipo: 'fishing_rod', nivel: 3, durabilidad: 240 }
      ]
    },
    recursos: {
      nombre: '📦 RECURSOS BÁSICOS',
      items: [
        { id: 'madera', nombre: 'Madera (64)', precio: 500, cantidad: 64 },
        { id: 'piedra', nombre: 'Piedra (64)', precio: 1000, cantidad: 64 },
        { id: 'carbon', nombre: 'Carbón (64)', precio: 1500, cantidad: 64 },
        { id: 'hierro', nombre: 'Hierro (32)', precio: 3000, cantidad: 32 },
        { id: 'oro', nombre: 'Oro (16)', precio: 5000, cantidad: 16 },
        { id: 'diamante', nombre: 'Diamante (8)', precio: 10000, cantidad: 8 },
        { id: 'esmeralda', nombre: 'Esmeralda (4)', precio: 15000, cantidad: 4 },
        { id: 'redstone', nombre: 'Redstone (64)', precio: 2000, cantidad: 64 },
        { id: 'lapis', nombre: 'Lapislázuli (32)', precio: 2500, cantidad: 32 },
        { id: 'cuarzo', nombre: 'Cuarzo (32)', precio: 1800, cantidad: 32 },
        { id: 'cobre', nombre: 'Cobre (64)', precio: 1200, cantidad: 64 }
      ]
    },
    comida: {
      nombre: '🍖 COMIDA',
      items: [
        { id: 'manzana', nombre: 'Manzana (16)', precio: 800, cantidad: 16, salud: 5 },
        { id: 'pan', nombre: 'Pan (16)', precio: 600, cantidad: 16, salud: 8 },
        { id: 'carne_cocida', nombre: 'Carne Cocida (16)', precio: 1200, cantidad: 16, salud: 12 },
        { id: 'pescado_cocido', nombre: 'Pescado Cocido (16)', precio: 1000, cantidad: 16, salud: 10 },
        { id: 'tarta', nombre: 'Tarta', precio: 5000, cantidad: 1, salud: 30 },
        { id: 'sopa', nombre: 'Sopa', precio: 3000, cantidad: 1, salud: 20 },
        { id: 'zanahoria', nombre: 'Zanahoria (16)', precio: 700, cantidad: 16, salud: 6 },
        { id: 'patata', nombre: 'Patata (16)', precio: 600, cantidad: 16, salud: 5 },
        { id: 'patata_horneada', nombre: 'Patata Horneada (16)', precio: 900, cantidad: 16, salud: 10 }
      ]
    },
    otros: {
      nombre: '🎁 OTROS ITEMS',
      items: [
        { id: 'flechas', nombre: 'Flechas (16)', precio: 500, cantidad: 16 },
        { id: 'flechas32', nombre: 'Flechas (32)', precio: 900, cantidad: 32 },
        { id: 'flechas64', nombre: 'Flechas (64)', precio: 1700, cantidad: 64 },
        { id: 'huevo', nombre: 'Huevo (16)', precio: 400, cantidad: 16 },
        { id: 'perla_ender', nombre: 'Perla de Ender', precio: 5000, cantidad: 1 },
        { id: 'vara_blaze', nombre: 'Vara de Blaze', precio: 8000, cantidad: 1 },
        { id: 'polvora', nombre: 'Pólvora (16)', precio: 3000, cantidad: 16 },
        { id: 'hilo', nombre: 'Hilo (16)', precio: 800, cantidad: 16 },
        { id: 'pluma', nombre: 'Pluma (16)', precio: 600, cantidad: 16 },
        { id: 'cuero', nombre: 'Cuero (16)', precio: 1000, cantidad: 16 },
        { id: 'lana', nombre: 'Lana (16)', precio: 800, cantidad: 16 }
      ]
    }
  }

  // Mostrar categorías si no se especifica
  if (!text) {
    let mensaje = `🎄 *TIENDA NAVIDEÑA* 🛒\n\n`
    mensaje += `💰 *Tu saldo:* ¥${user.coin.toLocaleString()}\n\n`
    mensaje += `📂 *Categorías disponibles:*\n`
    mensaje += `• *${usedPrefix}tienda herramientas* - Herramientas para trabajar\n`
    mensaje += `• *${usedPrefix}tienda recursos* - Recursos básicos\n`
    mensaje += `• *${usedPrefix}tienda comida* - Comida para recuperar salud\n`
    mensaje += `• *${usedPrefix}tienda otros* - Otros items útiles\n\n`
    mensaje += `🛒 *Para comprar:*\n`
    mensaje += `*${usedPrefix}comprar [item]*\n`
    mensaje += `Ejemplo: *${usedPrefix}comprar hacha_madera*\n\n`
    mensaje += `💰 *Para vender:*\n`
    mensaje += `*${usedPrefix}vender [item] [cantidad]*\n`
    mensaje += `Ejemplo: *${usedPrefix}vender madera 64*`

    return conn.reply(m.chat, mensaje, m)
  }

  // Mostrar items de una categoría
  const categoria = categorias[text.toLowerCase()]
  if (categoria) {
    let mensaje = `🎄 *TIENDA NAVIDEÑA - ${categoria.nombre}* 🛒\n\n`
    mensaje += `💰 *Tu saldo:* ¥${user.coin.toLocaleString()}\n\n`
    mensaje += `📋 *Items disponibles:*\n`

    categoria.items.forEach(item => {
      const precioFormateado = item.precio.toLocaleString()
      if (item.cantidad) {
        mensaje += `• *${item.id}* - ${item.nombre} - ¥${precioFormateado}\n`
      } else {
        mensaje += `• *${item.id}* - ${item.nombre} - ¥${precioFormateado} (Durabilidad: ${item.durabilidad})\n`
      }
    })

    mensaje += `\n🛒 *Para comprar:*\n`
    mensaje += `*${usedPrefix}comprar [item]*\n`
    mensaje += `Ejemplo: *${usedPrefix}comprar ${categoria.items[0].id}*`

    return conn.reply(m.chat, mensaje, m)
  }

  // Si no es una categoría válida
  return conn.reply(m.chat, 
    `❌ *Categoría no encontrada*\n\n` +
    `Categorías válidas:\n` +
    `• herramientas\n` +
    `• recursos\n` +
    `• comida\n` +
    `• otros\n\n` +
    `Usa: *${usedPrefix}tienda [categoría]*`, m)
}

handler.help = ['tienda [categoría]']
handler.tags = ['economy']
handler.command = ['tienda', 'shop']
handler.group = true
export default handler
