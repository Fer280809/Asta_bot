let handler = async (m, { conn, usedPrefix, command }) => {
if (!db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`🎄 *¡Oh no!* Los regalos económicos están *congelados* en este grupo navideño.\n\n🎅 Un *elfo administrador* puede descongelarlos con:\n» *${usedPrefix}economy on*`)
}
let user = global.db.data.users[m.sender]
const cooldown = 2 * 60 * 1000
user.lastwork = user.lastwork || 0
if (Date.now() < user.lastwork) {
const tiempoRestante = formatTime(user.lastwork - Date.now())
return conn.reply(m.chat, `⛄ *¡Calma!* Debes esperar *${tiempoRestante}* para volver a ayudar en los preparativos navideños.`, m)
}
user.lastwork = Date.now() + cooldown
let rsl = Math.floor(Math.random() * 1501) + 2000
await conn.reply(m.chat, `🎄 ${pickRandom(trabajo)} *¥${rsl.toLocaleString()} ${currency}*.`, m)
user.coin += rsl
}

handler.help = ['trabajar']
handler.tags = ['economy']
handler.command = ['w', 'work', 'chambear', 'chamba', 'trabajar']
handler.group = true

export default handler

function formatTime(ms) {
const totalSec = Math.ceil(ms / 1000)
const minutes = Math.floor((totalSec % 3600) / 60)
const seconds = totalSec % 60
const parts = []
if (minutes > 0) parts.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`)
parts.push(`${seconds} segundo${seconds !== 1 ? 's' : ''}`)
return parts.join(' ')
}
function pickRandom(list) {
return list[Math.floor(list.length * Math.random())]
}
const trabajo = [
"Ayudas a Papá Noel a envolver regalos y ganas",
"Trabajas como elfo fabricante de juguetes y ganas",
"Decoras el árbol de Navidad de una familia y ganas",
"Preparas galletas navideñas en el taller y ganas",
"Repartes regalos con los renos y recibes",
"Limpias el trineo de Papá Noel y encuentras",
"Colocas luces navideñas en las casas y ganas",
"Cantas villancicos por el pueblo y te dan",
"Preparas chocolate caliente en el taller y ganas",
"Envuelves cientos de regalos y obtienes",
"Construyes muñecos de nieve para decorar y ganas",
"Organizas el correo navideño del Polo Norte y ganas",
"Ayudas a los renos a prepararse y recibes",
"Creas adornos navideños artesanales y vendes por",
"Preparas el saco mágico de Papá Noel y ganas",
"Reparas juguetes rotos en el taller y ganas",
"Guías el trineo por una noche y recibes",
"Clasificas las cartas de los niños y ganas",
"Preparas la ruta de entrega de regalos y ganas",
"Empaquetas caramelos navideños y recibes",
"Decoras la fachada del taller y ganas",
"Preparas la comida para los renos y obtienes",
"Vigilas que los duendes no se distraigan y ganas",
"Organizas el almacén de juguetes y encuentras",
"Preparas el carbón para los niños traviesos y ganas",
"Limpias los establos de los renos y recibes",
"Ayudas a la Sra. Claus en la cocina y ganas",
"Probaste los juguetes para asegurar calidad y ganas",
"Preparaste el mapa de entregas mundial y recibiste",
"Decoraste el salón del taller y ganas",
"Preparaste los arneses de los renos y ganas",
"Enviaste los regalos especiales y recibiste"
]