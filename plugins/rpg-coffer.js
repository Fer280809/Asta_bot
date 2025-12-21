
var handler = async (m, { conn, usedPrefix, command }) => {
if (!db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`🎄 Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`)
}
let user = global.db.data.users[m.sender]
let now = Date.now()
let gap = 86400000
user.lastcofre = user.lastcofre || 0
user.coin = user.coin || 0
user.exp = user.exp || 0
if (now < user.lastcofre) {
let wait = formatTime(Math.floor((user.lastcofre - now) / 1000))
return conn.reply(m.chat, `🎅 Debes esperar *${wait}* para usar *${usedPrefix + command}* de nuevo.`, m)
}
let reward = Math.floor(Math.random() * (60000 - 40000 + 1)) + 40000
let expGain = Math.floor(Math.random() * (111)) + 50
user.coin += reward
user.exp += expGain
user.lastcofre = now + gap
conn.reply(m.chat, `🎁 ${pickRandom(cofres)}\n> Has recibido *🎁${reward.toLocaleString()} monedas navideñas*.`, m)
}

handler.help = ['cofre']
handler.tags = ['economía']
handler.command = ['coffer', 'cofre', 'abrircofre', 'cofreabrir']
handler.group = true

export default handler

function formatTime(totalSec) {
const h = Math.floor(totalSec / 3600)
const m = Math.floor((totalSec % 3600) / 60)
const s = totalSec % 60
const txt = []
if (h > 0) txt.push(`${h} hora${h !== 1 ? 's' : ''}`)
if (m > 0 || h > 0) txt.push(`${m} minuto${m !== 1 ? 's' : ''}`)
txt.push(`${s} segundo${s !== 1 ? 's' : ''}`)
return txt.join(' ')
}
function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}
const cofres = [
"Has encontrado un cofre navideño bajo el árbol de Navidad.",
"Descubriste un cofre decorado con luces brillantes y campanitas.",
"Te topaste con un cofre mágico que Santa olvidó en su trineo.",
"Encontraste un cofre de madera con adornos de renos y duendes.",
"Desenterraste un cofre cubierto de nieve en el patio de una casa.",
"Te adentraste en el taller de Santa y hallaste un cofre lleno de juguetes.",
"Un cofre misterioso apareció junto a la chimenea, lleno de dulces navideños.",
"Descubriste un cofre escondido entre los regalos, rebosante de chocolates.",
"Te topaste con un cofre encantado que guarda la historia de las Navidades pasadas.",
"Encontraste un cofre de metal con grabados de bastones de caramelo.",
"Desenterraste un cofre en el jardín que contenía galletas navideñas.",
"Te encontraste con un cofre que, al abrirlo, libera aroma a canela y pino.",
"Hallaste un cofre en el ático, cubierto de polvo y decoraciones antiguas.",
"Te topaste con un cofre que emana una luz cálida y acogedora.",
"Descubriste un cofre de cristal tallado, lleno de estrellas fugaces.",
"Encontraste un cofre en la cocina, repleto de recetas navideñas.",
"Te adentraste en una cabaña y hallaste un cofre lleno de bufandas y gorros.",
"Desenterraste un cofre en el bosque, lleno de piñas y adornos naturales.",
"Te topaste con un cofre que se abre solo al cantar un villancico.",
"Encontraste un cofre de madera noble, lleno de esferas de colores brillantes."
]