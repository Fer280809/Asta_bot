import fs from 'fs'

let handler = async (m, { conn, usedPrefix, args, isOwner }) => {
  if (!isOwner) return m.reply('🚫 Solo los *Owners* pueden crear códigos.')

  const amount = parseInt(args[0])
  const maxUses = parseInt(args[1]) || 50
  if (isNaN(amount) || amount <= 0) return m.reply(`⚠️ Uso correcto:\n*${usedPrefix}codigocrear <monto> <usos>*\nEjemplo:\n*${usedPrefix}codigocrear 5000 20*`)

  const dbPath = './lib/economy_codes.json'
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '{}')
  const codes = JSON.parse(fs.readFileSync(dbPath))

  const code = generarCodigo(10)
  codes[code] = { amount, maxUses, usedBy: [] }
  fs.writeFileSync(dbPath, JSON.stringify(codes, null, 2))

  const moneda = '💸 Coins'
  const msg = `
¡𝐻𝑜𝑙𝑎 𝑞𝑢𝑒𝑟𝑖𝑑𝑎 𝑐𝑜𝑚𝑢𝑛𝑖𝑑𝑎𝑑! 𝐻𝑒 𝑔𝑒𝑛𝑒𝑟𝑎𝑑𝑜 𝑢𝑛 𝑛𝑢𝑒𝑣𝑜 𝑐𝑜́𝑑𝑖𝑔𝑜 𝑒𝑠𝑝𝑒𝑐𝑖𝑎𝑙 𝑝𝑎𝑟𝑎 𝑡𝑜𝑑𝑜𝑠 𝑢𝑠𝑡𝑒𝑑𝑒𝑠.

꧁𓊈𒆜𝗗𝗲𝘁𝗮𝗹𝗹𝗲𝘀 𝗱𝗲𝗹 𝗖𝗼́𝗱𝗶𝗴𝗼𒆜𓊉꧂
🎁 *𝐶𝑜́𝑑𝑖𝑔𝑜:* \`${code}\`
💰 *𝑃𝑟𝑒𝑚𝑖𝑜:* ${amount.toLocaleString()} ${moneda}
👥 *𝑈𝑠𝑜𝑠 𝑑𝑖𝑠𝑝𝑜𝑛𝑖𝑏𝑙𝑒𝑠:* ${maxUses} personas
⏰ *𝐸𝑠𝑡𝑎𝑑𝑜:* Activo y listo para usar

꧁𓊈𒆜¿𝗖𝗼́𝗺𝗼 𝗰𝗮𝗻𝗷𝗲𝗮𝗿?𒆜𓊉꧂
Usa el comando:
★ *${usedPrefix}canjear ${code}*

*¡GRACIAS POR APOYAR AL BOT Y SER PARTE DE LA COMUNIDAD! 💫*
  `.trim()

  return m.reply(msg)
}

handler.help = ['codigo <monto> <usos>']
handler.tags = ['economy']
handler.command = ['codigo']
handler.group = true
handler.fernando = true

export default handler

function generarCodigo(length) {
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
