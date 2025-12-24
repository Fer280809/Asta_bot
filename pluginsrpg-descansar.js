let handler = async (m, { conn, usedPrefix, command }) => {
  const user = global.db.data.users[m.sender]
  
  if (!user) {
    return m.reply('❌ Primero usa algún comando para crear tu perfil.')
  }

  // Inicializar propiedades
  user.coin = user.coin || 0
  user.health = user.health || 100
  user.hunger = user.hunger || 100
  user.energy = user.energy || 100
  user.lastrest = user.lastrest || 0

  // Cooldown de descanso (30 minutos)
  const cooldown = 30 * 60 * 1000
  const now = Date.now()
  
  if (now < user.lastrest) {
    const restante = user.lastrest - now
    return conn.reply(m.chat,
      `⏰ *¡Aún no puedes descansar!*\n\nPodrás descansar de nuevo en *${formatTime(restante)}*`, m)
  }

  user.lastrest = now + cooldown

  // Recuperar estadísticas
  const saludRecuperada = Math.min(100 - user.health, 30)
  const energiaRecuperada = Math.min(100 - user.energy, 40)
  const hambrePerdida = 10 // Descansar consume hambre

  if (user.hunger < hambrePerdida) {
    return conn.reply(m.chat,
      `🍗 *¡Tienes mucha hambre!*\n\nTu hambre es ${user.hunger}/100\n\n` +
      `🍽️ Come algo antes de descansar\n` +
      `🍎 Usa *${usedPrefix}comer*`, m)
  }

  // Aplicar cambios
  user.health += saludRecuperada
  user.energy += energiaRecuperada
  user.hunger -= hambrePerdida

  // Asegurar que no pasen de 100
  user.health = Math.min(100, user.health)
  user.energy = Math.min(100, user.energy)
  user.hunger = Math.max(0, user.hunger)

  let resultado = `💤 *DESCANSANDO* 🛏️\n\n`
  resultado += `Has descansado bien y te sientes renovado.\n\n`
  
  if (saludRecuperada > 0) {
    resultado += `❤️ *Salud recuperada:* +${saludRecuperada} (${user.health}/100)\n`
  }
  if (energiaRecuperada > 0) {
    resultado += `⚡ *Energía recuperada:* +${energiaRecuperada} (${user.energy}/100)\n`
  }
  resultado += `🍗 *Hambre consumida:* -${hambrePerdida} (${user.hunger}/100)\n`
  resultado += `⏰ *Próximo descanso:* ${formatTime(cooldown)}\n\n`
  
  resultado += `💡 *Consejo:* Descansa regularmente para mantener tu salud y energía altas.`

  await conn.reply(m.chat, resultado, m)
}

function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSec / 60)
  const seconds = totalSec % 60
  const partes = []
  if (minutes > 0) partes.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`)
  if (seconds > 0) partes.push(`${seconds} segundo${seconds !== 1 ? 's' : ''}`)
  return partes.join(' ')
}

handler.help = ['descansar', 'rest', 'dormir']
handler.tags = ['economy', 'survival']
handler.command = ['descansar', 'rest', 'dormir', 'sleep']
export default handler
