let handler = async (m, { conn, usedPrefix, command, text }) => {
  const user = global.db.data.users[m.sender]
  
  // Inicializar usuario si no existe
  if (!user) {
    global.db.data.users[m.sender] = {
      coin: 0,
      // Herramientas
      pickaxe: 0, axe: 0, bow: 0, fishing_rod: 0,
      // Recursos básicos para vender (inicializar algunos para prueba)
      wood: 0, coal: 0, iron: 0, gold: 0, diamond: 0,
      raw_fish: 0, meat: 0, apple: 0,
      // Estadísticas
      health: 100, hunger: 100, energy: 100
    }
    user = global.db.data.users[m.sender]
  }

  // Inicializar propiedades necesarias
  user.coin = user.coin || 0
  user.health = user.health || 100
  user.hunger = user.hunger || 100
  user.energy = user.energy || 100

  // Si no hay argumento, mostrar el menú principal de la tienda
  if (!text || text === 'menu') {
    let message = `🛒 *TIENDA NAVIDEÑA* 🎄\n\n`
    message += `💰 *Tu saldo:* ¥${user.coin.toLocaleString()}\n`
    message += `❤️ *Salud:* ${user.health}/100\n`
    message += `🍗 *Hambre:* ${user.hunger}/100\n`
    message += `⚡ *Energía:* ${user.energy}/100\n\n`
    
    message += `📁 *Categorías disponibles:*\n\n`
    message += `1. ⛏️ *PICOS* - Para minar minerales\n`
    message += `   Usa: *${usedPrefix}tienda picos*\n\n`
    message += `2. 🪓 *HACHAS* - Para talar árboles\n`
    message += `   Usa: *${usedPrefix}tienda hachas*\n\n`
    message += `3. 🏹 *ARCOS* - Para cazar animales\n`
    message += `   Usa: *${usedPrefix}tienda arcos*\n\n`
    message += `4. 🎣 *CAÑAS* - Para pescar\n`
    message += `   Usa: *${usedPrefix}tienda cañas*\n\n`
    message += `5. 🎯 *FLECHAS* - Munición para cazar\n`
    message += `   Usa: *${usedPrefix}tienda flechas*\n\n`
    message += `6. 📦 *VENDER RECURSOS* - Vende lo que obtienes\n`
    message += `   Usa: *${usedPrefix}vender [recurso] [cantidad]*\n\n`
    message += `7. 🛠️ *CRAFTEO* - Crea herramientas y más\n`
    message += `   Usa: *${usedPrefix}craft*\n\n`
    message += `📌 *Ejemplos de compra:*\n`
    message += `• ${usedPrefix}comprar pico madera\n`
    message += `• ${usedPrefix}comprar hacha piedra\n`
    message += `• ${usedPrefix}comprar arco\n`
    message += `• ${usedPrefix}comprar caña\n`
    message += `• ${usedPrefix}comprar flechas 16\n\n`
    message += `📌 *Ejemplos de venta:*\n`
    message += `• ${usedPrefix}vender madera 10\n`
    message += `• ${usedPrefix}vender hierro 5\n`
    message += `• ${usedPrefix}vender pescado 3`

    await conn.reply(m.chat, message, m)
    return
  }

  // Si el argumento es "picos", mostrar picos disponibles
  if (text === 'picos') {
    const picos = [
      { nombre: 'Pico de Madera', precio: 2000, durabilidad: 50, comando: 'comprar pico madera' },
      { nombre: 'Pico de Piedra', precio: 5000, durabilidad: 100, comando: 'comprar pico piedra' },
      { nombre: 'Pico de Hierro', precio: 15000, durabilidad: 200, comando: 'comprar pico hierro' },
      { nombre: 'Pico de Diamante', precio: 50000, durabilidad: 500, comando: 'comprar pico diamante' },
      { nombre: 'Pico de Netherita', precio: 100000, durabilidad: 1000, comando: 'comprar pico netherita' }
    ]

    let message = `⛏️ *PICOS DISPONIBLES* 🎄\n\n`
    message += `💰 *Tu saldo:* ¥${user.coin.toLocaleString()}\n\n`
    
    picos.forEach((pico, index) => {
      message += `${index + 1}. ${pico.nombre}\n`
      message += `   ↳ Precio: ¥${pico.precio.toLocaleString()}\n`
      message += `   ↳ Durabilidad: ${pico.durabilidad}\n`
      message += `   ↳ Comando: *${usedPrefix}${pico.comando}*\n\n`
    })

    await conn.reply(m.chat, message, m)
    return
  }

  // Si el argumento es "hachas", mostrar hachas disponibles
  if (text === 'hachas') {
    const hachas = [
      { nombre: 'Hacha de Madera', precio: 2000, durabilidad: 50, comando: 'comprar hacha madera' },
      { nombre: 'Hacha de Piedra', precio: 5000, durabilidad: 100, comando: 'comprar hacha piedra' },
      { nombre: 'Hacha de Hierro', precio: 15000, durabilidad: 200, comando: 'comprar hacha hierro' },
      { nombre: 'Hacha de Diamante', precio: 50000, durabilidad: 500, comando: 'comprar hacha diamante' },
      { nombre: 'Hacha de Netherita', precio: 100000, durabilidad: 1000, comando: 'comprar hacha netherita' }
    ]

    let message = `🪓 *HACHAS DISPONIBLES* 🎄\n\n`
    message += `💰 *Tu saldo:* ¥${user.coin.toLocaleString()}\n\n`
    
    hachas.forEach((hacha, index) => {
      message += `${index + 1}. ${hacha.nombre}\n`
      message += `   ↳ Precio: ¥${hacha.precio.toLocaleString()}\n`
      message += `   ↳ Durabilidad: ${hacha.durabilidad}\n`
      message += `   ↳ Comando: *${usedPrefix}${hacha.comando}*\n\n`
    })

    await conn.reply(m.chat, message, m)
    return
  }

  // Si el argumento es "arcos", mostrar arcos disponibles
  if (text === 'arcos') {
    const arcos = [
      { nombre: 'Arco Básico', precio: 3000, durabilidad: 100, comando: 'comprar arco' },
      { nombre: 'Arco Potente', precio: 10000, durabilidad: 200, comando: 'comprar arco potente' },
      { nombre: 'Arco Élfico', precio: 25000, durabilidad: 400, comando: 'comprar arco élfico' }
    ]

    let message = `🏹 *ARCOS DISPONIBLES* 🎄\n\n`
    message += `💰 *Tu saldo:* ¥${user.coin.toLocaleString()}\n\n`
    
    arcos.forEach((arco, index) => {
      message += `${index + 1}. ${arco.nombre}\n`
      message += `   ↳ Precio: ¥${arco.precio.toLocaleString()}\n`
      message += `   ↳ Durabilidad: ${arco.durabilidad}\n`
      message += `   ↳ Comando: *${usedPrefix}${arco.comando}*\n\n`
    })

    await conn.reply(m.chat, message, m)
    return
  }

  // Si el argumento es "cañas", mostrar cañas disponibles
  if (text === 'cañas') {
    const cañas = [
      { nombre: 'Caña Básica', precio: 2500, durabilidad: 80, comando: 'comprar caña' },
      { nombre: 'Caña Mejorada', precio: 8000, durabilidad: 200, comando: 'comprar caña mejorada' },
      { nombre: 'Caña Encantada', precio: 20000, durabilidad: 400, comando: 'comprar caña encantada' }
    ]

    let message = `🎣 *CAÑAS DISPONIBLES* 🎄\n\n`
    message += `💰 *Tu saldo:* ¥${user.coin.toLocaleString()}\n\n`
    
    cañas.forEach((caña, index) => {
      message += `${index + 1}. ${caña.nombre}\n`
      message += `   ↳ Precio: ¥${caña.precio.toLocaleString()}\n`
      message += `   ↳ Durabilidad: ${caña.durabilidad}\n`
      message += `   ↳ Comando: *${usedPrefix}${caña.comando}*\n\n`
    })

    await conn.reply(m.chat, message, m)
    return
  }

  // Si el argumento es "flechas", mostrar flechas disponibles
  if (text === 'flechas') {
    const flechas = [
      { nombre: '16 Flechas', precio: 500, cantidad: 16, comando: 'comprar flechas' },
      { nombre: '32 Flechas', precio: 900, cantidad: 32, comando: 'comprar flechas32' },
      { nombre: '64 Flechas', precio: 1700, cantidad: 64, comando: 'comprar flechas64' }
    ]

    let message = `🎯 *FLECHAS DISPONIBLES* 🎄\n\n`
    message += `💰 *Tu saldo:* ¥${user.coin.toLocaleString()}\n\n`
    
    flechas.forEach((flecha, index) => {
      message += `${index + 1}. ${flecha.nombre}\n`
      message += `   ↳ Precio: ¥${flecha.precio.toLocaleString()}\n`
      message += `   ↳ Cantidad: ${flecha.cantidad} flechas\n`
      message += `   ↳ Comando: *${usedPrefix}${flecha.comando}*\n\n`
    })

    await conn.reply(m.chat, message, m)
    return
  }

  // Si no es ninguno de los anteriores, mostrar mensaje de ayuda
  await conn.reply(m.chat, 
    `❌ *Categoría no encontrada*\n\nUsa *${usedPrefix}tienda* para ver las categorías disponibles.`, 
    m
  )
}

handler.help = ['tienda', 'shop']
handler.tags = ['economy']
handler.command = ['tienda', 'shop']
export default handler
