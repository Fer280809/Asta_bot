
let handler = async (m, { conn, usedPrefix }) => {
if (!db.data.chats[m.chat].economy && m.isGroup) {
  return m.reply(
    `🎄 *¡Economía navideña desactivada!* 🎅\n\nLos comandos de economía están desactivados en este grupo.\n\n🎁 *Un administrador* puede activarlos con:\n» *${usedPrefix}economy on*`
  )
}

let mentionedJid = await m.mentionedJid
let who = mentionedJid[0] ? mentionedJid[0] : m.quoted ? await m.quoted.sender : m.sender

// Obtener nombre de usuario
let name = await (async () => 
  global.db.data.users[who].name ||
  (async () => { 
    try { 
      const n = await conn.getName(who); 
      return typeof n === 'string' && n.trim() ? n : who.split('@')[0] 
    } catch { 
      return who.split('@')[0] 
    } 
  })()
)()

if (!(who in global.db.data.users)) return m.reply(`🎅 *¡El usuario no está registrado en mi base de datos navideña!* ✨`)

let user = global.db.data.users[who]
let coin = user.coin || 0
let bank = user.bank || 0
let total = coin + bank

const texto = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓
     🎄 *BALANCE NAVIDEÑO* 🎅
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛

⛄ *Usuario:* ${name}
🎄 *Cartera:* ¥${coin.toLocaleString()} ${currency}
🎅 *Banco:* ¥${bank.toLocaleString()} ${currency}
🎁 *Total:* ¥${total.toLocaleString()} ${currency}

✨ *Consejo del elfo:* Protege tu dinero navideño depositándolo en el banco:
» *${usedPrefix}deposit cantidad*
`

await conn.reply(m.chat, texto, m)
}

handler.help = ['bal']
handler.tags = ['rpg']
handler.command = ['bal', 'balance', 'bank']
handler.group = true

export default handler