let handler = async (m, { args, usedPrefix, command }) => {
  // Verificar economía activada con temática navideña
  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`🎅 *¡Taller de Santa cerrado!* 🎄\n\nLos comandos de *Economía Navideña* están desactivados en este grupo.\n\nUn *Elfo Administrador* puede activarlos con:\n» *${usedPrefix}economy on*\n\n✨ *¡Así podrás guardar tus regalos en el banco!* 🎁`)
  }
  
  let user = global.db.data.users[m.sender]
  
  // Si no se especifica cantidad
  if (!args[0]) {
    return m.reply(`🎄 *¡Deposita tus Regalos!* 🎁\n\nIngresa la cantidad de *${currency}* que deseas depositar en el *Banco de Santa*.\n\n*❄️ Ejemplos:*\n• *${usedPrefix}d 5000* (deposita 5000)\n• *${usedPrefix}d all* (deposita todo)\n• *${usedPrefix}d mitad* (deposita la mitad)\n\n*💰 En tu cartera:* ${currency}${user.coin ? user.coin.toLocaleString() : '0'}\n*🏦 En el banco:* ${currency}${user.bank ? user.bank.toLocaleString() : '0'}`)
  }
  
  // Convertir argumentos especiales
  let depositAmount = 0
  let arg = args[0].toLowerCase()
  
  if (arg === 'all' || arg === 'todo') {
    depositAmount = parseInt(user.coin)
  } else if (arg === 'mitad' || arg === 'half') {
    depositAmount = Math.floor(parseInt(user.coin) / 2)
  } else if (arg === 'tercio' || arg === 'third') {
    depositAmount = Math.floor(parseInt(user.coin) / 3)
  } else {
    depositAmount = parseInt(args[0])
  }
  
  // Validaciones navideñas
  if (isNaN(depositAmount) || depositAmount < 1) {
    return m.reply(`🦌 *¡Cantidad mágica inválida!* ❄️\n\nDebes ingresar una cantidad positiva de *${currency}*.\n\n*🎁 Ejemplos válidos:*\n• *${usedPrefix}d 10000*\n• *${usedPrefix}d all*\n• *${usedPrefix}d mitad*`)
  }
  
  // Verificar si tiene monedas
  if (!user.coin || user.coin < 1) {
    return m.reply(`🎅 *¡Cartera vacía!* 🎄\n\nNo tienes *${currency}* en tu cartera para depositar.\n\n*✨ Sugerencias de Santa:*\n1. Usa *${usedPrefix}work* para trabajar\n2. Usa *${usedPrefix}daily* para tu regalo diario\n3. Juega *${usedPrefix}cf* para ganar más`)
  }
  
  // Verificar si tiene suficiente
  if (user.coin < depositAmount) {
    return m.reply(`❄️ *¡Fondos insuficientes!* 🎁\n\nSolo tienes *${currency}${user.coin.toLocaleString()}* en tu cartera.\n\n*💰 Disponible:* ${currency}${user.coin.toLocaleString()}\n*🎯 Intentaste depositar:* ${currency}${depositAmount.toLocaleString()}\n*📊 Te faltan:* ${currency}${(depositAmount - user.coin).toLocaleString()}\n\n🦌 *Consejo:* Deposita menos o usa '*${usedPrefix}d all*'`)
  }
  
  // Bonus especial navideño (5% chance de deposito extra)
  const esNavidad = new Date().getMonth() === 11 // Diciembre
  const bonusDeposito = esNavidad && Math.random() < 0.05
  
  // Realizar el depósito
  user.coin -= depositAmount
  let depositoFinal = depositAmount
  
  // Aplicar bonus si hay
  if (bonusDeposito) {
    depositoFinal = Math.floor(depositAmount * 1.1) // 10% extra
    const extra = depositoFinal - depositAmount
    m.reply(`✨ *¡BONUS NAVIDEÑO!* 🎅\n\n¡Santa te ha dado un *10% extra* por depositar en diciembre!\n*+${currency}${extra.toLocaleString()}* depositados gratis.`)
  }
  
  user.bank = (user.bank || 0) + depositoFinal
  
  // Preparar mensaje de éxito
  let mensajeExito = `🎄 *¡Depósito Exitoso!* 🎁\n\n`
  mensajeExito += `*🦌 Has depositado:* ${currency}${depositoFinal.toLocaleString()}\n`
  
  if (bonusDeposito) {
    mensajeExito += `*✨ Bonus navideño:* +${currency}${(depositoFinal - depositAmount).toLocaleString()}\n`
  }
  
  mensajeExito += `\n*💰 Cartera actual:* ${currency}${user.coin.toLocaleString()}\n`
  mensajeExito += `*🏦 Banco de Santa:* ${currency}${user.bank.toLocaleString()}\n\n`
  
  // Consejos navideños
  if (depositoFinal >= 10000) {
    mensajeExito += `⭐ *¡Gran depósito!* Los renos están impresionados.\n`
  }
  
  if (user.coin === 0) {
    mensajeExito += `🎅 *¡Depositaste todo!* Ahora tus ${currency} están seguros en el Banco de Santa.\n`
  }
  
  mensajeExito += `\n*🛷 Tu dinero está seguro:*\n• 🎅 Santa lo guarda en el Polo Norte\n• ❄️ Protegido por elfos y renos\n• 🎁 Ganarás interés navideño\n\n`
  mensajeExito += `━━━━━━━━━━━━━━━━━━━━\n`
  mensajeExito += `💡 *Consejo:* Usa *${usedPrefix}withdraw* para retirar cuando necesites comprar regalos.`
  
  // Enviar mensaje
  await m.reply(mensajeExito)
  
  // Efecto especial: Pequeña animación si es un depósito grande
  if (depositoFinal >= 5000) {
    setTimeout(() => {
      m.reply(`🎅 *¡Santa está feliz con tu depósito!*\nLos elfos están organizando tus ${currency} en el taller. 🎄`)
    }, 1000)
  }
}

// Información del comando
handler.help = ['depositar <cantidad/all/mitad>', 'deposit', 'd']
handler.tags = ['economy', 'navidad', 'banco']
handler.command = ['deposit', 'depositar', 'd', 'dep', 'guardar', 'ahorrar', 'navideposito', 'regalobanco']
handler.group = true
handler.limit = true

// Exportar handler
export default handler