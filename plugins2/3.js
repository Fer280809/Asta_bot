let handler = async (m, { conn, usedPrefix, command, text }) => {
  const user = global.db.data.users[m.sender]
  
  // Inicializar usuario si no existe
  if (!user) {
    global.db.data.users[m.sender] = { coin: 0 }
    user = global.db.data.users[m.sender]
  }
  
  user.coin = user.coin || 0

  // Mostrar tienda principal
  if (!text || text === 'menu') {
    const items = [
      { 
        name: '🪓 HACHAS', 
        desc: 'Para talar árboles',
        cmd: 'tienda hachas'
      },
      { 
        name: '🏹 ARCOS', 
        desc: 'Para cazar animales',
        cmd: 'tienda arcos'
      },
      { 
        name: '🎣 CAÑAS', 
        desc: 'Para pescar',
        cmd: 'tienda cañas'
      },
      { 
        name: '⛏️ PICOS', 
        desc: 'Para minar',
        cmd: 'tienda picos'
      },
      { 
        name: '🎯 FLECHAS', 
        desc: 'Munición para cazar',
        cmd: 'tienda flechas'
      },
      { 
        name: '📦 RECURSOS', 
        desc: 'Compra recursos básicos',
        cmd: 'tienda recursos'
      },
      { 
        name: '💰 VENDER', 
        desc: 'Vende tus recursos',
        cmd: 'vender'
      }
    ]

    let message = `🛍️ *TIENDA NAVIDEÑA* 🎄\n\n`
    message += `💰 *Tu saldo:* ¥${user.coin.toLocaleString()}\n\n`
    message += `*Categorías disponibles:*\n\n`

    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`
      message += `   ↳ ${item.desc}\n`
      message += `   ↳ Usa: *${usedPrefix}${item.cmd}*\n\n`
    })

    message += `📌 *Ejemplos:*\n`
    message += `• ${usedPrefix}tienda hachas\n`
    message += `• ${usedPrefix}comprar hacha madera\n`
    message += `• ${usedPrefix}vender madera 10`

    await conn.reply(m.chat, message, m)
    return
  }

  // Mostrar categoría específica
  if (text.startsWith('hachas')) {
    const hachas = [
      { name: 'Hacha de Madera', price: 2000, durabilidad: 50, cmd: 'comprar hacha madera' },
      { name: 'Hacha de Piedra', price: 5000, durabilidad: 100, cmd: 'comprar hacha piedra' },
      { name: 'Hacha de Hierro', price: 15000, durabilidad: 200, cmd: 'comprar hacha hierro' },
      { name: 'Hacha de Diamante', price: 50000, durabilidad: 500, cmd: 'comprar hacha diamante' },
      { name: 'Hacha de Netherita', price: 100000, durabilidad: 1000, cmd: 'comprar hacha netherita' }
    ]

    let message = `🪓 *HACHAS DISPONIBLES* 🎄\n\n`
    hachas.forEach((hacha, index) => {
      message += `${index + 1}. ${hacha.name}\n`
      message += `   ↳ Precio: ¥${hacha.price.toLocaleString()}\n`
      message += `   ↳ Durabilidad: ${hacha.durabilidad}\n`
      message += `   ↳ Comprar: *${usedPrefix}${hacha.cmd}*\n\n`
    })

    await conn.reply(m.chat, message, m)
  }
  
  // ... (añadir más categorías similares)
}

handler.help = ['tienda', 'shop']
handler.tags = ['economy']
handler.command = ['tienda', 'shop', 'comprar']
export default handler