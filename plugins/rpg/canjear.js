import fs from 'fs'

let handler = async (m, { conn, usedPrefix, args }) => {
  const code = args[0]
  if (!code) return m.reply(`🎟️ Ingresa un código válido:\n> *${usedPrefix}canjear <código>*`)

  const dbPath = './lib/economy_codes.json'
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '{}')
  const codes = JSON.parse(fs.readFileSync(dbPath))

  if (!codes[code]) return m.reply('❌ El código ingresado no existe o ya expiró.')
  if (codes[code].usedBy.includes(m.sender)) return m.reply('⚠️ Ya has usado este código anteriormente.')

  if (codes[code].usedBy.length >= codes[code].maxUses) {
    delete codes[code]
    fs.writeFileSync(dbPath, JSON.stringify(codes, null, 2))
    return m.reply('🚫 Este código ya alcanzó su límite de usos y ha expirado.')
  }

  let user = global.db.data.users[m.sender]
  user.coin = (user.coin || 0) + codes[code].amount
  codes[code].usedBy.push(m.sender)
  fs.writeFileSync(dbPath, JSON.stringify(codes, null, 2))

  return m.reply(`🎉 ¡Felicidades!\nHas canjeado el código *${code}* y obtuviste 💰 *${codes[code].amount.toLocaleString()} Coins*`)
}

handler.help = ['canjear <código>']
handler.tags = ['economy']
handler.command = ['canjear']
handler.group = true

export default handler
