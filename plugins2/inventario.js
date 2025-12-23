let handler = async (m, { conn, usedPrefix, command, text }) => {
  const user = global.db.data.users[m.sender]
  if (!user) return m.reply('❌ Primero usa algún comando para crear tu perfil.')

  // Categorías del inventario
  const categorias = {
    'dinero': ['coin'],
    'experiencia': ['exp', 'miningSkill', 'woodcutting', 'fishing', 'hunting'],
    'salud': ['health', 'energy'],
    'herramientas': ['pickaxe', 'axe', 'bow', 'fishing_rod', 'pickaxeDurability', 'axeDurability', 'bowDurability', 'rodDurability'],
    'maderas': ['wood', 'oak_log', 'spruce_log', 'birch_log', 'jungle_log', 'acacia_log', 'dark_oak_log', 'sapling'],
    'minerales': ['coal', 'iron', 'gold', 'diamond', 'emerald', 'redstone', 'lapis', 'quartz', 'copper', 'ancient_debris', 'netherite'],
    'caza': ['meat', 'leather', 'feather', 'wool', 'egg', 'string', 'bone', 'rotten_flesh', 'gunpowder', 'ender_pearl', 'blaze_rod', 'ghast_tear', 'spider_eye'],
    'pesca': ['raw_fish', 'raw_salmon', 'clownfish', 'pufferfish', 'nautilus', 'cod', 'tropical_fish', 'squid', 'kelp', 'seaweed', 'pearl', 'treasure'],
    'comida': ['apple'],
    'otros': ['arrow']
  }

  // Función para formatear nombres
  function formatearNombre(key) {
    const nombres = {
      coin: '💰 Monedas',
      exp: '⭐ Experiencia',
      health: '❤️ Salud',
      energy: '⚡ Energía',
      miningSkill: '⛏️ Nivel Minería',
      woodcutting: '🪓 Nivel Tala',
      fishing: '🎣 Nivel Pesca',
      hunting: '🏹 Nivel Caza',
      pickaxe: '⛏️ Pico',
      axe: '🪓 Hacha',
      bow: '🏹 Arco',
      fishing_rod: '🎣 Caña',
      pickaxeDurability: '⛏️ Durabilidad Pico',
      axeDurability: '🪓 Durabilidad Hacha',
      bowDurability: '🏹 Durabilidad Arco',
      rodDurability: '🎣 Durabilidad Caña',
      wood: '🪵 Madera',
      oak_log: '🪵 Tronco Roble',
      spruce_log: '🪵 Tronco Abeto',
      birch_log: '🪵 Tronco Abedul',
      jungle_log: '🪵 Tronco Jungla',
      acacia_log: '🪵 Tronco Acacia',
      dark_oak_log: '🪵 Tronco Roble Oscuro',
      sapling: '🌱 Brote',
      coal: '⚫ Carbón',
      iron: '🔘 Hierro',
      gold: '🟡 Oro',
      diamond: '💎 Diamante',
      emerald: '🟢 Esmeralda',
      redstone: '🔴 Redstone',
      lapis: '🔵 Lapislázuli',
      quartz: '⚪ Cuarzo',
      copper: '🟠 Cobre',
      ancient_debris: '♨️ Escombros Antiguos',
      netherite: '🔥 Netherita',
      meat: '🍖 Carne',
      leather: '🧵 Cuero',
      feather: '🪶 Plumas',
      wool: '🧶 Lana',
      egg: '🥚 Huevos',
      string: '🧶 Cuerda',
      bone: '🦴 Huesos',
      rotten_flesh: '🧟 Carne Podrida',
      gunpowder: '💥 Pólvora',
      ender_pearl: '🔮 Perla de Ender',
      blaze_rod: '🔥 Vara de Blaze',
      ghast_tear: '👁️ Lágrima de Ghast',
      spider_eye: '🕷️ Ojo de Araña',
      raw_fish: '🐟 Pescado Crudo',
      raw_salmon: '🐟 Salmón Crudo',
      clownfish: '🐠 Pez Payaso',
      pufferfish: '🐡 Pez Globo',
      nautilus: '🐚 Nautilo',
      cod: '🐟 Bacalao',
      tropical_fish: '🐠 Pez Tropical',
      squid: '🦑 Calamar',
      kelp: '🌿 Alga',
      seaweed: '🌿 Alga Marina',
      pearl: '💎 Perla',
      treasure: '🏆 Tesoro',
      apple: '🍎 Manzanas',
      arrow: '🎯 Flechas'
    }
    
    return nombres[key] || key
  }

  // Mostrar inventario completo
  if (!text || text === 'todo') {
    let message = `🎒 *INVENTARIO COMPLETO* 🎄\n\n`
    message += `👤 *Jugador:* @${m.sender.split('@')[0]}\n`
    message += `💰 *Monedas:* ¥${(user.coin || 0).toLocaleString()}\n`
    message += `⭐ *Experiencia:* ${(user.exp || 0).toLocaleString()} XP\n\n`
    
    let totalItems = 0
    
    // Mostrar por categorías
    for (const [categoria, items] of Object.entries(categorias)) {
      let tieneItems = false
      let itemsCategoria = ''
      
      for (const item of items) {
        if (user[item] !== undefined && user[item] > 0) {
          tieneItems = true
          totalItems++
          itemsCategoria += `• ${formatearNombre(item)}: ${user[item]}\n`
        }
      }
      
      if (tieneItems) {
        const nombresCategorias = {
          'dinero': '💰 DINERO',
          'experiencia': '⭐ EXPERIENCIA',
          'salud': '❤️ SALUD',
          'herramientas': '🛠️ HERRAMIENTAS',
          'maderas': '🪵 MADERAS',
          'minerales': '💎 MINERALES',
          'caza': '🏹 CAZA',
          'pesca': '🎣 PESCA',
          'comida': '🍎 COMIDA',
          'otros': '📦 OTROS'
        }
        
        message += `${nombresCategorias[categoria]}:\n${itemsCategoria}\n`
      }
    }
    
    if (totalItems === 0) {
      message += `📭 *Inventario vacío*\n`
      message += `✨ Consigue recursos con:\n`
      message += `• ${usedPrefix}talar - Para madera\n`
      message += `• ${usedPrefix}cazar - Para carne/cuero\n`
      message += `• ${usedPrefix}pescar - Para pescado\n`
      message += `• ${usedPrefix}minar - Para minerales\n`
    } else {
      message += `📊 *Total de items:* ${totalItems}\n`
    }
    
    message += `\n📌 *Ver categorías específicas:*\n`
    message += `• ${usedPrefix}inventario dinero\n`
    message += `• ${usedPrefix}inventario minerales\n`
    message += `• ${usedPrefix}inventario herramientas\n`
    message += `• ${usedPrefix}inventario comida`
    
    await conn.reply(m.chat, message, m, { mentions: [m.sender] })
    return
  }

  // Mostrar categoría específica
  const categoria = text.toLowerCase()
  if (categorias[categoria]) {
    let message = `🎒 *INVENTARIO - ${categoria.toUpperCase()}* 🎄\n\n`
    
    let tieneItems = false
    for (const item of categorias[categoria]) {
      if (user[item] !== undefined) {
        tieneItems = true
        message += `• ${formatearNombre(item)}: ${user[item]}\n`
      }
    }
    
    if (!tieneItems) {
      message += `📭 *No tienes items en esta categoría*\n`
    }
    
    await conn.reply(m.chat, message, m)
  } else {
    m.reply(`❌ Categoría no válida. Categorías disponibles: ${Object.keys(categorias).join(', ')}`)
  }
}

handler.help = ['inventario', 'inv', 'inventory']
handler.tags = ['economy']
handler.command = ['inventario2', 'inv2', 'inventory2']
export default handler
