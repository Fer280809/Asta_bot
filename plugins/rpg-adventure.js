let handler = async (m, { conn, command, usedPrefix }) => {
if (!global.db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`🎄 Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`)
}
let user = global.db.data.users[m.sender]
if (!user) global.db.data.users[m.sender] = user = { coin: 0, exp: 0, health: 100, lastAdventure: 0 }
if (user.coin == null) user.coin = 0
if (user.exp == null) user.exp = 0
if (user.health == null) user.health = 100
if (user.lastAdventure == null) user.lastAdventure = 0
if (user.health < 5)
return conn.reply(m.chat, `🎁 No tienes suficiente salud para ir de *aventura navideña*.\n> Usa *"${usedPrefix}heal"* para curarte con chocolate caliente.`, m)
const cooldown = 20 * 60 * 1000
const now = Date.now()
if (now < user.lastAdventure) {
const restante = user.lastAdventure - now
const wait = formatTime(restante)
return conn.reply(m.chat, `⛄ Debes esperar *${wait}* para usar *${usedPrefix + command}* de nuevo.`, m)
}
user.lastAdventure = now + cooldown
const evento = pickRandom(aventuras)
let monedas, experiencia, salud
if (evento.tipo === 'victoria') {
monedas = Math.floor(Math.random() * 3001) + 15000
experiencia = Math.floor(Math.random() * 81) + 40
salud = Math.floor(Math.random() * 6) + 10
user.coin += monedas
user.exp += experiencia
user.health -= salud
} else if (evento.tipo === 'derrota') {
monedas = Math.floor(Math.random() * 2001) + 7000
experiencia = Math.floor(Math.random() * 41) + 40
salud = Math.floor(Math.random() * 6) + 10
user.coin -= monedas
user.exp -= experiencia
user.health -= salud
if (user.coin < 0) user.coin = 0
if (user.exp < 0) user.exp = 0
} else {
experiencia = Math.floor(Math.random() * 61) + 30
user.exp += experiencia
}
if (user.health < 0) user.health = 0
const resultado = `🎄 ${evento.mensaje} ${evento.tipo === 'neutro' ? '' : evento.tipo === 'victoria' ? `ganaste. *🎁${monedas.toLocaleString()} monedas navideñas*` : `perdiste. *🎁${monedas.toLocaleString()} monedas navideñas*`}`
await conn.reply(m.chat, resultado, m)
await global.db.write()
}

handler.tags = ['rpg']
handler.help = ['adventure', 'aventura']
handler.command = ['adventure', 'aventura']
handler.group = true

export default handler

function formatTime(ms) {
const totalSec = Math.ceil(ms / 1000)
const min = Math.floor((totalSec % 3600) / 60)
const sec = totalSec % 60
const txt = []
if (min > 0) txt.push(`${min} minuto${min !== 1 ? 's' : ''}`)
txt.push(`${sec} segundo${sec !== 1 ? 's' : ''}`)
return txt.join(' ')
}
function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}
const aventuras = [
{ tipo: 'victoria', mensaje: 'Derrotaste al Grinch que intentaba robar los regalos,' },
{ tipo: 'victoria', mensaje: 'Ayudaste a Santa a entregar todos los regalos a tiempo,' },
{ tipo: 'victoria', mensaje: 'Rescataste un saco de regalos del abominable hombre de nieve,' },
{ tipo: 'victoria', mensaje: 'Ganaste el concurso de decoración de árboles navideños,' },
{ tipo: 'victoria', mensaje: 'Salvaste la cena navideña cocinando el mejor pavo,' },
{ tipo: 'victoria', mensaje: 'Encontraste el trineo perdido de Santa en la tormenta de nieve,' },
{ tipo: 'victoria', mensaje: 'Decoraste toda la aldea con luces navideñas mágicas,' },
{ tipo: 'victoria', mensaje: 'Derrotaste a los duendes traviesos que escondían los regalos,' },
{ tipo: 'victoria', mensaje: 'Rescataste a los renos atrapados en la nieve,' },
{ tipo: 'victoria', mensaje: 'Horneaste las galletas navideñas más deliciosas del pueblo,' },
{ tipo: 'derrota', mensaje: 'El Grinch te robó todos los adornos del árbol,' },
{ tipo: 'derrota', mensaje: 'Te caíste del trineo de Santa y perdiste algunos regalos,' },
{ tipo: 'derrota', mensaje: 'Los duendes traviesos escondieron tus regalos navideños,' },
{ tipo: 'derrota', mensaje: 'Se te quemó el pavo navideño en el horno,' },
{ tipo: 'derrota', mensaje: 'Una ventisca congeló tus luces navideñas,' },
{ tipo: 'neutro', mensaje: 'Ayudaste a los duendes a envolver regalos en el taller.' },
{ tipo: 'neutro', mensaje: 'Cantaste villancicos con los aldeanos toda la noche.' },
{ tipo: 'neutro', mensaje: 'Bebiste chocolate caliente junto a la chimenea.' }
]