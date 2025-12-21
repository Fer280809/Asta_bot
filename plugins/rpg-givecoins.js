async function handler(m, { conn, args, usedPrefix, command }) {
  // Verificar economía activada con temática navideña
  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`🎅 *¡Regalos Navideños Cancelados!* 🎄\n\nLos comandos de *Economía Navideña* están desactivados en este grupo.\n\nUn *Elfo Administrador* puede activarlos con:\n» *${usedPrefix}economy on*\n\n🦌 *¡Así podrás compartir el espíritu navideño!* ❄️`)
  }
  
  // Obtener mención/jid del destinatario
  let mentionedJid = await m.mentionedJid
  const who = m.quoted ? await m.quoted.sender : 
              (mentionedJid && mentionedJid[0]) || 
              (args[1] ? (args[1].replace(/[@ .+-]/g, '') + '@s.whatsapp.net') : '')
  
  // Validaciones iniciales con estilo navideño
  if (!args[0]) {
    return m.reply(`🎁 *¡Regala Alegría Navideña!* 🎄\n\nDebes especificar cuántos *${currency}* deseas regalar.\n\n*❄️ Ejemplos:*\n• *${usedPrefix + command} 5000 @amigo*\n• *${usedPrefix + command} 10000 @elfo*\n• *${usedPrefix + command} all @santa* (envía todo)\n\n🎅 *Consejo:* ¡Compartir es el verdadero espíritu de la Navidad!`)
  }
  
  // Validar formato
  if (!isNumber(args[0]) && args[0].startsWith('@')) {
    return m.reply(`🦌 *¡Formato incorrecto, duendecillo!* ❄️\n\nPrimero indica la cantidad, luego menciona a la persona.\n\n*🎄 Ejemplo correcto:*\n*${usedPrefix + command} 1000 @amigo*\n\n✨ *Opciones especiales:*\n• *all* - Envía todo tu dinero\n• *half* - Envía la mitad\n• *quarter* - Envía un cuarto`)
  }
  
  if (!who) {
    return m.reply(`🎅 *¡Falta alguien importante!* 🎄\n\nDebes mencionar a quién quieres hacerle un regalo navideño.\n\n*❄️ Cómo mencionar:*\n1. Escribe @ y selecciona el contacto\n2. O responde a un mensaje de la persona\n3. O escribe su número: *${usedPrefix + command} 5000 521234567890*`)
  }
  
  if (!(who in global.db.data.users)) {
    return m.reply(`🧊 *¡Usuario no encontrado en el Polo Norte!* 🎄\n\nEsta persona no está registrada en la base de datos navideña.\n\n*✨ Sugerencias:*\n1. Pídele que use *${usedPrefix}start* para registrarse\n2. Asegúrate de que esté en el grupo\n3. Verifica que hayas escrito correctamente`)
  }
  
  // Obtener datos de usuarios
  let user = global.db.data.users[m.sender]
  let recipient = global.db.data.users[who]
  
  // Verificar si es diciembre para bonus especial
  const esNavidad = new Date().getMonth() === 11
  const bonusNavidad = esNavidad && Math.random() < 0.15 // 15% de bonus en diciembre
  
  // Determinar cantidad a enviar
  let cantidadBruta = args[0].toLowerCase()
  let cantidadFinal = 0
  
  if (cantidadBruta === 'all' || cantidadBruta === 'todo') {
    cantidadFinal = user.bank || 0
  } else if (cantidadBruta === 'half' || cantidadBruta === 'mitad') {
    cantidadFinal = Math.floor((user.bank || 0) / 2)
  } else if (cantidadBruta === 'quarter' || cantidadBruta === 'cuarto') {
    cantidadFinal = Math.floor((user.bank || 0) / 4)
  } else {
    cantidadFinal = parseInt(args[0])
  }
  
  // Validar cantidad
  if (!isNumber(cantidadFinal) || cantidadFinal < 10) {
    return m.reply(`❄️ *¡Cantidad inválida!* 🎅\n\nLa cantidad mínima para regalar es *10 ${currency}*.\n\n*💰 Tu saldo en el banco:* ${currency}${(user.bank || 0).toLocaleString()}\n\n✨ *Puedes enviar:*\n• Un número: *${usedPrefix + command} 1000 @amigo*\n• *all*: Todo tu dinero\n• *half*: La mitad\n• *quarter*: Un cuarto`)
  }
  
  // Validar fondos
  if (!user.bank || user.bank < cantidadFinal) {
    const falta = cantidadFinal - (user.bank || 0)
    return m.reply(`🎄 *¡Fondos insuficientes en el Banco de Santa!* 🏦\n\n*💰 Tienes:* ${currency}${(user.bank || 0).toLocaleString()}\n*🎁 Quieres enviar:* ${currency}${cantidadFinal.toLocaleString()}\n*❄️ Te faltan:* ${currency}${falta.toLocaleString()}\n\n*✨ Soluciones:*\n1. Deposita más: *${usedPrefix}deposit*\n2. Envía menos cantidad\n3. Usa *${usedPrefix + command} half @amigo*`)
  }
  
  // Aplicar límite máximo (opcional, para evitar errores)
  const maxTransfer = 1000000
  if (cantidadFinal > maxTransfer) {
    return m.reply(`🎅 *¡Regalo demasiado grande!* 🎄\n\nEl regalo máximo permitido es *${currency}${maxTransfer.toLocaleString()}*.\n\n*🦌 Razón:* Santa quiere asegurar que todos tengan oportunidades de dar y recibir.`)
  }
  
  // Verificar que no sea auto-regalo
  if (who === m.sender) {
    return m.reply(`🎁 *¡No puedes hacerte regalos a ti mismo!* 🎄\n\nEl espíritu navideño es compartir con *otros*.\n\n*✨ Sugerencias:*\n• Regala a un amigo\n• Deposita en tu banco: *${usedPrefix}deposit*\n• Compra algo especial: *${usedPrefix}shop*`)
  }
  
  // Realizar la transferencia con posibles bonus
  let cantidadEnviada = cantidadFinal
  let mensajeBonus = ''
  
  if (bonusNavidad) {
    // Bonus: Santa añade un 10% extra
    const extra = Math.floor(cantidadFinal * 0.1)
    cantidadEnviada += extra
    mensajeBonus = `\n✨ *¡Bonus Navideño de Santa!* +${currency}${extra.toLocaleString()}`
  }
  
  // Descontar del remitente y añadir al destinatario
  user.bank -= cantidadFinal
  if (!recipient.bank) recipient.bank = 0
  recipient.bank += cantidadEnviada
  
  // Asegurar que no haya números negativos
  if (user.bank < 0) user.bank = 0
  
  // Obtener nombre del destinatario con estilo navideño
  let name = await (async () => {
    try {
      const n = await conn.getName(who)
      return n || who.split('@')[0]
    } catch {
      return who.split('@')[0]
    }
  })()
  
  // Preparar mensaje de éxito
  const nombresRegalos = [
    'regalo navideño', 'bolsa de alegría', 'caja de felicidad', 'saco de sorpresas',
    'envoltorio mágico', 'paquete festivo', 'obsequio brillante', 'detalle especial'
  ]
  const nombreRegalo = pickRandom(nombresRegalos)
  
  let mensajeExito = `🎄 *¡Regalo Navideño Enviado!* 🎁\n\n`
  mensajeExito += `🎅 *De:* Tú (${m.sender.split('@')[0]})\n`
  mensajeExito += `🦌 *Para:* ${name}\n`
  mensajeExito += `✨ *${capitalize(nombreRegalo)}:* ${currency}${cantidadEnviada.toLocaleString()}\n`
  
  if (mensajeBonus) {
    mensajeExito += mensajeBonus
  }
  
  mensajeExito += `\n📊 *Estadísticas:*\n`
  mensajeExito += `💰 *Tu nuevo saldo:* ${currency}${user.bank.toLocaleString()}\n`
  mensajeExito += `🏦 *Saldo del destinatario:* ${currency}${recipient.bank.toLocaleString()}\n`
  
  // Determinar tipo de regalo basado en cantidad
  if (cantidadEnviada >= 10000) {
    mensajeExito += `\n⭐ *¡Regalo Generoso!* Los renos están impresionados.\n`
  }
  
  if (cantidadBruta === 'all') {
    mensajeExito += `\n🎅 *¡Regalaste todo!* Eso es el verdadero espíritu navideño.\n`
  }
  
  // Footer con mensaje navideño
  mensajeExito += `\n${'─'.repeat(35)}\n`
  mensajeExito += `💝 *"La Navidad no es un momento ni una estación, sino un estado de la mente."*\n`
  mensajeExito += `🎶 *¡Feliz Navidad para ambos!* 🎄`
  
  // Enviar mensaje principal
  await m.reply(mensajeExito, null, { mentions: [who] })
  
  // Enviar notificación al destinatario (si está en el mismo chat)
  setTimeout(async () => {
    try {
      const mensajeDestinatario = `🎁 *¡Has recibido un regalo navideño!* 🎄\n\n` +
        `✨ *De:* ${m.sender.split('@')[0]}\n` +
        `💰 *Cantidad:* ${currency}${cantidadEnviada.toLocaleString()}\n` +
        `🏦 *Tu nuevo saldo:* ${currency}${recipient.bank.toLocaleString()}\n\n` +
        `🦌 *Mensaje:* "${getMensajeNavideno()}"\n\n` +
        `🎅 *¡Disfruta tu regalo y comparte la alegría!* ❄️`
      
      await conn.sendMessage(m.chat, {
        text: mensajeDestinatario,
        mentions: [who]
      }, { quoted: m })
    } catch (e) {
      console.log('Error al notificar al destinatario:', e)
    }
  }, 1000)
  
  // Registrar transferencia para estadísticas (opcional)
  if (!user.transferHistory) user.transferHistory = []
  user.transferHistory.push({
    to: who,
    amount: cantidadEnviada,
    timestamp: Date.now(),
    christmas: esNavidad
  })
}

// Configuración del handler
handler.help = ['pay <cantidad/all/half> @usuario', 'regalar', 'give', 'transferir']
handler.tags = ['economy', 'navidad', 'regalos']
handler.command = ['pay', 'regalar', 'give', 'transferir', 'gift']
handler.group = true
handler.limit = true

export default handler

// Funciones auxiliares
function isNumber(x) {
  return !isNaN(x) && !isNaN(parseFloat(x))
}

function capitalize(txt) {
  return txt.charAt(0).toUpperCase() + txt.slice(1)
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function getMensajeNavideno() {
  const mensajes = [
    'Que la magia de la Navidad llene tu corazón de alegría',
    'Que esta temporada traiga paz y felicidad a tu vida',
    'Los mejores regalos no vienen en paquetes, vienen del corazón',
    'Que la luz de la Navidad brille en ti todo el año',
    'Feliz Navidad y próspero año nuevo lleno de bendiciones',
    'Que el espíritu navideño te acompañe siempre',
    'Que Santa te traiga todo lo que has deseado',
    'La Navidad es tiempo de compartir, ¡disfruta tu regalo!',
    'Que los ángeles de la Navidad velen por ti',
    'Que esta Navidad sea tan especial como tú'
  ]
  return pickRandom(mensajes)
}