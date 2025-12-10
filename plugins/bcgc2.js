import { promisify } from 'util'

const cooldown = new Map()

const handler = async (m, { conn, usedPrefix, text, isOwner, mentions }) => {
  if (!isOwner) return m.reply('❌ Solo el owner puede usar este comando.')

  // Extraer imagen, texto y menciones
  let img = m.quoted?.msg?.imageMessage || m.quoted?.msg?.videoMessage || null
  let texto = text || m.quoted?.text || ''
  let mencionados = mentions || []

  if (!texto && !img) return m.reply('❌ Envía imagen + texto o escribe un mensaje.')

  // Cooldown 5 minutos por bot
  const botJid = conn.user.jid
  if (cooldown.has(botJid)) {
    const left = Math.ceil((5 * 60 * 1000 - (Date.now() - cooldown.get(botJid))) / 1000)
    return m.reply(`⏳ Espera ${left}s antes de usar bcgc2 nuevamente.`)
  }

  // Obtener TODOS los bots registrados
  const bots = Object.values(global.conn || {}).filter(c => c?.user?.jid)
  bots.unshift(conn)

  let totalBots = 0
  let totalGrupos = 0
  let enviados = 0

  for (const bot of bots) {
    try {
      const groups = Object.keys(bot.chats || {}).filter(id => id.endsWith('@g.us'))
      totalBots++
      totalGrupos += groups.length

      for (const gid of groups) {
        try {
          // Estilo canal: imagen + texto + menciones
          await bot.sendMessage(gid, {
            image: img ? { url: await conn.downloadMediaMessage(img) } : undefined,
            caption: texto,
            mentions: mencionados,
            footer: `『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡`,
            viewOnce: true,
            headerType: 4,
          }, { quoted: null })

          enviados++
          await new Promise(res => setTimeout(res, 1000)) // 1 s por grupo
        } catch (e) {
          console.log(`[BCGC2] Falló en ${gid}: ${e.message}`)
        }
      }
    } catch (e) {
      console.log(`[BCGC2] Falló bot ${bot.user.jid}: ${e.message}`)
    }
  }

  cooldown.set(botJid, Date.now())

  // Reporte final
  const reporte = `
✅ *BCGC2 FINALIZADO*

📊 *Resumen:*
• Bots alcanzados: *${totalBots}*
• Grupos totales: *${totalGrupos}*
• Mensajes enviados: *${enviados}*
• Tipo: *${img ? 'Imagen + Texto' : 'Solo texto'}*

⏱️ Cooldown activado: 5 minutos
  `.trim()

  await conn.sendMessage(m.chat, { text: reporte }, { quoted: m })
}

handler.command = ['bcgc2']
handler.tags = ['owner']
handler.desc = 'Broadcast estilo canal + imagen + menciones a TODOS los grupos de TODOS los bots (sin excepciones)'
handler.fernando = true

export default handler