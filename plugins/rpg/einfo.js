import { promises as fs } from 'fs'

// Convierte milisegundos a formato legible
function formatTime(ms) {
  if (!ms || ms <= 0 || isNaN(ms)) return 'Ahora'
  const totalSeconds = Math.ceil(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts = []
  if (days) parts.push(`📅 ${days} día${days !== 1 ? 's' : ''}`)
  if (hours) parts.push(`⏰ ${hours} hora${hours !== 1 ? 's' : ''}`)
  if (minutes) parts.push(`🕐 ${minutes} minuto${minutes !== 1 ? 's' : ''}`)
  parts.push(`⏱ ${seconds} segundo${seconds !== 1 ? 's' : ''}`)
  return parts.join(' ')
}

let handler = async (m, { conn }) => {
  const userData = global.db.data.users[m.sender]
  if (!userData) return conn.reply(m.chat, 'ꕥ No se encontraron datos de economía para este usuario.', m)

  // Inicializar campos de economía
  userData.coin = userData.coin || 0
  userData.bank = userData.bank || 0

  // Define los cooldowns / últimas acciones
  const times = {
    Work: userData.lastwork,
    Slut: userData.lastslut,
    Crime: userData.lastcrime,
    Steal: userData.lastrob,
    Daily: userData.lastDaily,
    Weekly: userData.lastweekly,
    Monthly: userData.lastmonthly,
    Cofre: userData.lastcofre,
    Adventure: userData.lastAdventure,
    Dungeon: userData.lastDungeon,
    Fish: userData.lastFish,
    Hunt: userData.lastHunt,
    Mine: userData.lastmine
  }

  const now = Date.now()

  const cooldowns = Object.entries(times).map(([key, value]) => {
    const remaining = typeof value === 'number' ? value - now : 0
    return `🔹 *${key}*: ${formatTime(remaining)}`
  })

  const totalCoins = (userData.coin + userData.bank).toLocaleString()

  // Obtener nombre del usuario
  const username = await (async () => {
    try {
      const name = await conn.getName(m.sender)
      return name || m.sender.split('@')[0]
    } catch {
      return m.sender.split('@')[0]
    }
  })()

  const message = `*「 💰 𝗘𝗖𝗢𝗡𝗢𝗠𝗬 𝗜𝗡𝗙𝗢 」*\n
👤 Usuario: *${username}*

${cooldowns.join('\n')}

─────────────────
💎 Coins totales: *¥ ${totalCoins}*`

  await conn.reply(m.chat, message.trim(), m)
}

handler.tags = ['economy']
handler.help = ['economy', 'infoeconomy']
handler.command = ['economy', 'infoeconomy', 'einfo']
handler.owner = false

export default handler