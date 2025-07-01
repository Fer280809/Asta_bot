let handler = async (m, { conn, args, usedPrefix, command }) => {
  // Solo owners pueden usar este comando
  let senderNum = m.sender.replace(/[^0-9]/g, '')
  // Busca entre todos los owners (soporta formato array de arrays)
  let isOwner = Array.isArray(global.owner)
    ? global.owner.some(o => Array.isArray(o) ? o[0] === senderNum : o === senderNum)
    : false
  if (!isOwner) {
    return m.reply('⛔ Solo los owners pueden usar este comando.')
  }

  // Si no hay argumentos, mostrar límite actual
  if (!args[0]) {
    const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
    const subBotsCount = subBots.length
    const currentLimit = global.maxSubBots || 25 // Límite por defecto
    
    let info = [
      `🤖 *Estado actual de Sub-Bots*`,
      `• Sub-Bots activos: ${subBotsCount}`,
      `• Límite máximo: ${currentLimit}`,
      `• Espacios disponibles: ${currentLimit - subBotsCount}`,
      ``,
      `📝 *Para cambiar el límite:*`,
      `${usedPrefix}${command} <nuevo_límite>`,
      ``,
      `💡 *Ejemplo:* ${usedPrefix}${command} 50`
    ].join('\n')
    
    return m.reply(info)
  }

  // Validar que el argumento sea un número
  let newLimit = parseInt(args[0])
  if (isNaN(newLimit) || newLimit < 1) {
    return m.reply('❌ Ingresa un número válido mayor a 0.')
  }

  // Obtener cantidad actual de Sub-Bots
  const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
  const subBotsCount = subBots.length
  const oldLimit = global.maxSubBots || 25

  // Validar que el nuevo límite no sea menor a los Sub-Bots activos
  if (newLimit < subBotsCount) {
    return m.reply(`❌ No puedes establecer un límite (${newLimit}) menor a los Sub-Bots actualmente activos (${subBotsCount}).`)
  }

  // Establecer el nuevo límite
  global.maxSubBots = newLimit

  // Mensaje de confirmación
  let confirmMsg = [
    `✅ *Límite de Sub-Bots actualizado*`,
    ``,
    `📊 *Cambios realizados:*`,
    `• Límite anterior: ${oldLimit}`,
    `• Límite nuevo: ${newLimit}`,
    `• Sub-Bots activos: ${subBotsCount}`,
    `• Espacios disponibles: ${newLimit - subBotsCount}`,
    ``,
    `🎯 *Estado:* ${newLimit > oldLimit ? 'Límite aumentado' : 'Límite reducido'}`
  ].join('\n')

  m.reply(confirmMsg)

  // Log en consola para seguimiento
  console.log(`🤖 Límite de Sub-Bots cambiado de ${oldLimit} a ${newLimit} por ${m.pushname || m.sender}`)
}

handler.help = ['setlimitbot <número>', 'limitbot']
handler.tags = ['owner', 'serbot']
handler.command = ['setlimitbot', 'limitbot', 'maxsubbot', 'limitebot']
handler.owner = true
handler.group = false

export default handler
