const handler = async (m, { conn, text, command, usedPrefix }) => {
  // Verificar si la economía está activada en el grupo
  if (!db.data.chats[m.chat].economy && m.isGroup) return conn.reply(m.chat, 
    `🎅 *¡Sistema de Economía Navideña!* 🎄\n\nLos comandos de *Economía* están desactivados en este grupo.\n\nUn *Elfo Administrador* puede activarlos con:\n» *${usedPrefix}economy on*`, m)
  
  const user = global.db.data.users[m.sender]
  
  // Si no hay texto, mostrar ayuda navideña
  if (!text) return conn.reply(m.chat, 
    `🎁 *¡Juego de Moneda Navideña!* ❄️\n\nDebes apostar una cantidad de *${currency}* y elegir cara o cruz.\n\nEjemplo: *${usedPrefix + command} 500 regalo* (cara)\nEjemplo: *${usedPrefix + command} 500 trineo* (cruz)\n\n*🎄 Opciones navideñas:*\n• *regalo* 🎁 (equivale a cara)\n• *trineo* 🛷 (equivale a cruz)`, m)
  
  const args = text.trim().split(/\s+/)
  
  // Validar formato
  if (!args[0] || !args[1]) return conn.reply(m.chat, 
    `❄️ *Formato incorrecto, duendecillo!* 🎅\n\nDebes poner la cantidad y luego tu elección navideña.\nEjemplo: *${usedPrefix + command} 300 regalo*\nEjemplo: *${usedPrefix + command} 300 trineo*`, m)
  
  const cantidad = parseFloat(args[0])
  const eleccionOriginal = args[1].toLowerCase()
  
  // Convertir opciones navideñas a estándar
  let eleccion = eleccionOriginal
  if (eleccion === 'regalo' || eleccion === '🎁') eleccion = 'cara'
  if (eleccion === 'trineo' || eleccion === '🛷') eleccion = 'cruz'
  
  // Validaciones
  if (isNaN(cantidad)) return conn.reply(m.chat, 
    `🦌 *¡Cantidad inválida!* 🎄\nIngresa un número mágico válido.\nEjemplo: *${usedPrefix + command} 200 trineo*`, m)
  
  if (Math.abs(cantidad) < 100) return conn.reply(m.chat, 
    `⭐ *¡Apuesta mínima!* ✨\nLa cantidad mínima para apostar es *100 ${currency}*.\n(¡Santa necesita galletas para trabajar!)`, m)
  
  if (!['cara', 'cruz', 'regalo', 'trineo', '🎁', '🛷'].includes(eleccionOriginal)) return conn.reply(m.chat, 
    `🎅 *¡Elección mágica inválida!* ❄️\nSolo puedes elegir:\n• *regalo* 🎁 (para cara)\n• *trineo* 🛷 (para cruz)`, m)
  
  if (cantidad > user.coin) return conn.reply(m.chat, 
    `🎄 *¡Oh oh! No tienes suficientes ${currency}* 🦌\n\nTienes: *${currency}${user.coin.toLocaleString()}*\nNecesitas: *${currency}${cantidad.toLocaleString()}*\n\n*Sugerencia de Santa:* Trabaja más para ganar ${currency}`, m)
  
  // Efecto especial navideño (10% de chance de bonus)
  const esNavidad = new Date().getMonth() === 11 // Diciembre
  const bonusNavidad = esNavidad && Math.random() < 0.1
  const multiplicadorBonus = bonusNavidad ? 1.5 : 1
  
  // Lanzar la moneda navideña
  const resultado = Math.random() < 0.5 ? 'cara' : 'cruz'
  const acierto = resultado === eleccion
  let cambio = acierto ? cantidad * multiplicadorBonus : -cantidad
  
  // Aplicar bonus navideño si corresponde
  if (bonusNavidad && acierto) {
    cambio = Math.floor(cantidad * 1.5)
  }
  
  // Actualizar monedas del usuario
  user.coin += cambio
  if (user.coin < 0) user.coin = 0
  
  // Preparar mensaje navideño
  let mensaje = ''
  const emojiResultado = resultado === 'cara' ? '🎁' : '🛷'
  const nombreResultado = resultado === 'cara' ? 'REGALO' : 'TRINEO'
  const nombreEleccion = eleccionOriginal === 'regalo' || eleccionOriginal === '🎁' ? 'REGALO' : 
                        eleccionOriginal === 'trineo' || eleccionOriginal === '🛷' ? 'TRINEO' : 
                        eleccionOriginal.toUpperCase()
  
  if (acierto) {
    mensaje = `🎄 *¡FELICIDADES!* 🎅\n\n`
    mensaje += `*${emojiResultado} La moneda navideña cayó en: ${nombreResultado}*\n`
    mensaje += `*Tu elección fue: ${nombreEleccion}*\n\n`
    mensaje += `✨ *¡Has ganado ${bonusNavidad ? 'un BONUS NAVIDEÑO de ' : ''}${currency}${Math.abs(cambio).toLocaleString()}!*\n`
    if (bonusNavidad) {
      mensaje += `🎁 *¡Bonus especial de Navidad! (x1.5)* 🎄\n`
    }
    mensaje += `\n*💰 Nuevo saldo: ${currency}${user.coin.toLocaleString()}*\n`
    mensaje += `🦌 ¡Los renos están celebrando contigo!`
  } else {
    mensaje = `❄️ *¡Oh oh!* 🎅\n\n`
    mensaje += `*${emojiResultado} La moneda navideña cayó en: ${nombreResultado}*\n`
    mensaje += `*Tu elección fue: ${nombreEleccion}*\n\n`
    mensaje += `🦌 *Has perdido ${currency}${Math.abs(cambio).toLocaleString()}*\n`
    mensaje += `\n*💰 Saldo restante: ${currency}${user.coin.toLocaleString()}*\n`
    mensaje += `✨ *No te rindas, intenta de nuevo!*\n`
    mensaje += `💡 *Consejo:* ¡Santa siempre da segundas oportunidades!`
  }
  
  // Añadir footer navideño
  mensaje += `\n\n━━━━━━━━━━━━━━━━━━━━\n`
  mensaje += `🎅 *¡Feliz Navidad de parte del equipo del bot!* 🎄\n`
  mensaje += `🕯️ Usa *${usedPrefix}daily* para tu regalo diario`
  
  // Enviar mensaje con posibilidad de sticker navideño
  await conn.reply(m.chat, mensaje, m)
  
  // Opcional: Enviar sticker navideño aleatorio (si el bot tiene stickers)
  if (Math.random() < 0.3) { // 30% de chance
    const stickersNavidenos = [
      '🎄', '🎅', '🦌', '🎁', '❄️', '⭐', '✨', '🔔'
    ]
    const stickerAleatorio = stickersNavidenos[Math.floor(Math.random() * stickersNavidenos.length)]
    await conn.sendMessage(m.chat, { 
      text: `${stickerAleatorio} *¡Espíritu navideño!* ${stickerAleatorio}` 
    }, { quoted: m })
  }
}

// Información del comando
handler.help = ['cf <cantidad> <regalo/trineo>', 'coinflip']
handler.tags = ['economy', 'navidad', 'juegos']
handler.command = ['cf', 'suerte', 'coinflip', 'flip']
handler.group = true
handler.limit = true // Para evitar spam

// Función auxiliar para capitalizar
function capitalize(txt) {
  return txt.charAt(0).toUpperCase() + txt.slice(1)
}

// Exportar handler
export default handler