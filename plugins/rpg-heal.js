let handler = async (m, { conn, usedPrefix, command }) => {
  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(
      `⚠️ *Economía desactivada* en este grupo.\n\nUn *administrador* puede activarla con:\n» *${usedPrefix}economy on*`
    )
  }

  let user = global.db.data.users[m.sender]
  if (!user) return conn.reply(m.chat, `❌ Usuario no registrado en la base de datos.`, m)
  
  // Inicializar campos de economía
  user.coin = user.coin || 0
  user.bank = user.bank || 0
  user.health = user.health || 100
  
  if (user.health >= 100) return conn.reply(m.chat, `💉 Tu salud ya está al máximo.`, m)
  if (user.coin <= 0) return conn.reply(m.chat, `💰 No tienes suficientes ${currency} para curarte.`, m)

  const faltante = 100 - user.health
  const disponible = Math.floor(user.coin / 50)
  const curable = Math.min(faltante, disponible)

  user.health += curable
  user.coin -= curable * 50
  user.lastHeal = Date.now()

  const info = `
╔═══════════════════════╗
║       💊 𝗖𝗨𝗥𝗔𝗥 💊
╠═══════════════════════╣
║ 🩺 Salud recuperada : +${curable} punto${curable !== 1 ? 's' : ''}
║ 💎 ${currency} restantes : ¥${user.coin.toLocaleString()}
║ ❤️ Salud actual    : ${user.health}/100
╚═══════════════════════╝
`

  await conn.sendMessage(m.chat, { text: info }, { quoted: m })
}

handler.help = ['heal']
handler.tags = ['rpg']
handler.command = ['heal', 'curar']
handler.group = true

export default handler