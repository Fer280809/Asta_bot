import { promises as fs } from 'fs'

// Convierte milisegundos a formato legible navideño
function formatTime(ms) {
  if (!ms || ms <= 0 || isNaN(ms)) return '🎁 ¡Ahora mismo!'
  const totalSeconds = Math.ceil(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts = []
  if (days) parts.push(`🎄 ${days} día${days !== 1 ? 's' : ''}`)
  if (hours) parts.push(`⏰ ${hours} hora${hours !== 1 ? 's' : ''}`)
  if (minutes) parts.push(`❄️ ${minutes} minuto${minutes !== 1 ? 's' : ''}`)
  parts.push(`🕯️ ${seconds} segundo${seconds !== 1 ? 's' : ''}`)
  return parts.join(' ')
}

// Función para obtener emoji de actividad navideña
function getChristmasEmoji(activity) {
  const emojiMap = {
    'Work': '🎅',
    'Slut': '🎄',
    'Crime': '🦌',
    'Steal': '🎁',
    'Daily': '🗓️',
    'Weekly': '📅',
    'Monthly': '🗓️',
    'Cofre': '🎁',
    'Adventure': '🛷',
    'Dungeon': '🎄',
    'Fish': '🎣',
    'Hunt': '🏹',
    'Mine': '⛏️',
    'Heal': '❤️',
    'Cookies': '🍪',
    'Decorate': '✨',
    'Carols': '🎶',
    'Gift': '🎁'
  }
  return emojiMap[activity] || '⭐'
}

// Función para obtener nombre navideño de actividad
function getChristmasActivityName(key) {
  const names = {
    'Work': '🎅 Trabajar en el Taller de Santa',
    'Slut': '🎄 Cantar Villancicos',
    'Crime': '🦌 Hornear Galletas',
    'Steal': '🎁 Intercambiar Regalos',
    'Daily': '🗓️ Regalo Diario',
    'Weekly': '📅 Regalo Semanal',
    'Monthly': '🗓️ Regalo Mensual',
    'Cofre': '🎁 Cofre Navideño',
    'Adventure': '🛷 Aventura Navideña',
    'Dungeon': '🎄 Taller de Santa',
    'Fish': '🎣 Pescar en el Lago Congelado',
    'Hunt': '🏹 Cazar para la Cena',
    'Mine': '⛏️ Minar Carbón para Santa',
    'Heal': '❤️ Recuperar Alegría',
    'Cookies': '🍪 Hornear Galletas Especiales',
    'Decorate': '✨ Decorar el Árbol',
    'Carols': '🎶 Cantar con los Elfos',
    'Gift': '🎁 Preparar Regalos'
  }
  return names[key] || key
}

let handler = async (m, { conn }) => {
  const userData = global.db.data.users[m.sender]
  if (!userData) return conn.reply(m.chat, 
    `🎅 *¡No hay datos navideños!* 🎄\n\nParece que aún no tienes datos de economía navideña.\n\nComienza con:\n• *${usedPrefix}work* - Para trabajar en el taller\n• *${usedPrefix}daily* - Para tu regalo diario\n• *${usedPrefix}cf* - Para jugar cara o cruz navideño`, m)

  // Verificar si es diciembre para bonus visual
  const esNavidad = new Date().getMonth() === 11
  
  // Define los cooldowns / últimas acciones con nombres navideños
  const times = {
    'Work': userData.lastwork,
    'Slut': userData.lastslut,
    'Crime': userData.lastcrime,
    'Steal': userData.lastrob,
    'Daily': userData.lastDaily,
    'Weekly': userData.lastweekly,
    'Monthly': userData.lastmonthly,
    'Cofre': userData.lastcofre,
    'Adventure': userData.lastAdventure,
    'Dungeon': userData.lastDungeon,
    'Fish': userData.lastFish,
    'Hunt': userData.lastHunt,
    'Mine': userData.lastmine,
    'Heal': userData.lastheal || 0,
    'Cookies': userData.lastcookies || 0,
    'Decorate': userData.lastdecorate || 0
  }

  const now = Date.now()

  // Procesar cooldowns con estilo navideño
  const cooldowns = Object.entries(times)
    .filter(([_, value]) => value && typeof value === 'number')
    .map(([key, value]) => {
      const remaining = value - now
      const emoji = getChristmasEmoji(key)
      const activityName = getChristmasActivityName(key)
      return `${emoji} *${activityName}*: ${formatTime(remaining)}`
    })

  // Calcular totales
  const totalCoins = ((userData.coin || 0) + (userData.bank || 0)).toLocaleString()
  const christmasSpirit = userData.christmasSpirit || 0
  
  // Obtener nombre del usuario con estilo navideño
  const username = await (async () => {
    try {
      const name = await conn.getName(m.sender)
      return `🎅 *${name}*` || m.sender.split('@')[0]
    } catch {
      return `🎅 *${m.sender.split('@')[0]}*`
    }
  })()

  // Determinar rango navideño basado en espíritu navideño
  let christmasRank = '🎄 Principiante Navideño'
  if (christmasSpirit >= 100) christmasRank = '🌟 Espíritu Navideño'
  if (christmasSpirit >= 500) christmasRank = '✨ Ayudante de Santa'
  if (christmasSpirit >= 1000) christmasRank = '🎅 Asistente de Santa'
  if (christmasSpirit >= 5000) christmasRank = '🦌 Reno Principal'

  // Crear mensaje navideño
  let message = ``
  
  // Encabezado navideño
  if (esNavidad) {
    message += `🎄 *¡FELIZ NAVIDAD!* 🎅\n`
    message += `✨ *INFORMACIÓN ECONÓMICA NAVIDEÑA* ✨\n\n`
  } else {
    message += `🎁 *INFORMACIÓN ECONÓMICA NAVIDEÑA* 🎄\n\n`
  }

  // Información del usuario
  message += `👤 *Usuario:* ${username}\n`
  message += `🎯 *Rango Navideño:* ${christmasRank}\n`
  if (christmasSpirit > 0) {
    message += `✨ *Espíritu Navideño:* ${christmasSpirit.toLocaleString()}\n`
  }
  
  message += `\n${'─'.repeat(30)}\n`
  message += `📊 *ESTADÍSTICAS DE ACTIVIDAD* 📊\n\n`

  // Agregar cooldowns
  if (cooldowns.length > 0) {
    message += `*⏰ Tiempos de Espera:*\n`
    message += cooldowns.join('\n')
  } else {
    message += `🎁 *¡Todas las actividades están disponibles!*\n`
    message += `Comienza tu aventura navideña ahora. 🎄\n`
  }

  message += `\n${'─'.repeat(30)}\n`
  
  // Sección financiera
  message += `💰 *FINANZAS NAVIDEÑAS* 💰\n\n`
  message += `🎁 *Cartera (Regalos):* ${currency}${(userData.coin || 0).toLocaleString()}\n`
  message += `🏦 *Banco de Santa:* ${currency}${(userData.bank || 0).toLocaleString()}\n`
  message += `💎 *Total Acumulado:* ${currency}${totalCoins}\n`
  
  // Experiencia y salud
  if (userData.exp || userData.health) {
    message += `\n⭐ *Experiencia:* ${(userData.exp || 0).toLocaleString()} XP\n`
    message += `❤️ *Alegría Navideña:* ${userData.health || 100}/100\n`
  }

  // Bonus de diciembre
  if (esNavidad) {
    message += `\n🎅 *BONUS DE DICIEMBRE:*\n`
    message += `• Recompensas aumentadas x1.5\n`
    message += `• Depósitos con 5% de bonus\n`
    message += `• Eventos especiales navideños\n`
  }

  message += `\n${'─'.repeat(30)}\n`
  
  // Consejos navideños aleatorios
  const consejos = [
    '🎁 Deposita en el banco para proteger tus regalos',
    '🦌 Los renos trabajan mejor con espíritu navideño alto',
    '🎄 Decora tu perfil con /profile para más recompensas',
    '✨ Santa recompensa a los jugadores más activos',
    '❄️ Juega cara o cruz navideño para ganar rápido',
    '🎅 Ayuda a los elfos en el taller para experiencia extra',
    '🛷 Explora el taller de Santa cada 15 minutos',
    '🍪 Hornea galletas para aumentar tu alegría navideña'
  ]
  
  const consejoAleatorio = consejos[Math.floor(Math.random() * consejos.length)]
  message += `💡 *Consejo Navideño:* ${consejoAleatorio}\n`
  
  message += `\n${'*'.repeat(35)}\n`
  message += `🎄 *¡Que la magia de la Navidad te acompañe!* 🎅`

  // Enviar mensaje con estilo
  await conn.reply(m.chat, message.trim(), m)
  
  // Opcional: Agregar sticker navideño aleatorio
  if (Math.random() < 0.4) {
    const stickers = ['🎅', '🎄', '🦌', '🎁', '❄️', '⭐', '✨', '🔔']
    const sticker = stickers[Math.floor(Math.random() * stickers.length)]
    setTimeout(() => {
      conn.sendMessage(m.chat, { 
        text: `${sticker} *¡Consulta exitosa!* ${sticker}\nTu información navideña está actualizada.` 
      }, { quoted: m })
    }, 500)
  }
}

// Configuración del handler
handler.tags = ['economy', 'navidad', 'info']
handler.help = ['economy', 'infoeconomy', 'econavidad', 'navidadinfo', 'estadisticasnavidenas']
handler.command = ['economy', 'infoeconomy', 'einfo', 'econavidad', 'navidadinfo', 'misdatosnavidenos', 'estadisticas']
handler.owner = false
handler.group = true
handler.limit = false

export default handler