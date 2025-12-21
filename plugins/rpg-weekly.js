var handler = async (m, { conn, usedPrefix }) => {
if (!db.data.chats[m.chat].economy && m.isGroup) return m.reply(`🎄 *¡Oh no!* Los regalos económicos están *congelados* en este grupo navideño.\n\n🎅 Un *elfo administrador* puede descongelarlos con:\n» *${usedPrefix}economy on*`)

let user = global.db.data.users[m.sender]
const gap = 604800000
const now = Date.now()
user.weeklyStreak = user.weeklyStreak || 0
user.lastWeeklyGlobal = user.lastWeeklyGlobal || 0
user.coin = user.coin || 0
user.exp = user.exp || 0
user.lastweekly = user.lastweekly || 0

if (now < user.lastweekly) {
const wait = formatTime(Math.floor((user.lastweekly - now) / 1000))
return conn.reply(m.chat, `🎁 *¡Calma, pequeño elfo!* Ya abriste tu regalo semanal.\n🕐 Vuelve en *${wait}* cuando Papá Noel prepare nuevos obsequios`, m)
}

const lost = user.weeklyStreak >= 1 && now - user.lastWeeklyGlobal > gap * 1.5
if (lost) user.weeklyStreak = 0

const canClaimWeeklyGlobal = now - user.lastWeeklyGlobal >= gap
if (canClaimWeeklyGlobal) {
user.weeklyStreak = Math.min(user.weeklyStreak + 1, 30)
user.lastWeeklyGlobal = now
}

const coins = Math.min(40000 + (user.weeklyStreak - 1) * 5000, 185000)
const expRandom = Math.floor(Math.random() * (200 - 50 + 1)) + 50
user.coin += coins
user.exp += expRandom
user.lastweekly = now + gap

let nextReward = Math.min(40000 + user.weeklyStreak * 5000, 185000).toLocaleString()
let msg = `> 🎄 *Semana ${user.weeklyStreak + 1}* » *+¥${nextReward}* de regalo`
if (lost) msg += `\n> ❄️ *¡Se derritió tu racha de semanas navideñas!*`

conn.reply(m.chat, `🎅 *¡Feliz Navidad!* 🎁\n\nHas recibido tu regalo semanal:\n*¥${coins.toLocaleString()} ${currency}* (Semana *${user.weeklyStreak}*)\n${msg}\n\n✨ *¡Que la magia navideña te acompañe!*`, m)
}

handler.help = ['weekly', 'semanal']
handler.tags = ['rpg']
handler.command = ['weekly', 'semanal']
handler.group = true

export default handler

function formatTime(t) {
const d = Math.floor(t / 86400)
const h = Math.floor((t % 86400) / 3600)
const m = Math.floor((t % 3600) / 60)
const s = t % 60
if (d) return `${d} día${d !== 1 ? 's' : ''} ${h} hora${h !== 1 ? 's' : ''} ${m} minuto${m !== 1 ? 's' : ''}`
if (h) return `${h} hora${h !== 1 ? 's' : ''} ${m} minuto${m !== 1 ? 's' : ''} ${s} segundo${s !== 1 ? 's' : ''}`
if (m) return `${m} minuto${m !== 1 ? 's' : ''} ${s} segundo${s !== 1 ? 's' : ''}`
return `${s} segundo${s !== 1 ? 's' : ''}`
}