var handler = async (m, { conn, usedPrefix, command }) => {
    if (!db.data.chats[m.chat].economy && m.isGroup) {
        return m.reply(`《✦》Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`)
    }

    const user = global.db.data.users[m.sender]
    if (!user) return
    user.lastmine = user.lastmine || 0
    user.coin = user.coin || 0
    user.exp = user.exp || 0
    user.health = user.health || 100
    user.pickaxedurability = user.pickaxedurability || 100
    user.gems = user.gems || 0
    user.inventory = user.inventory || []

    if (user.health < 5)
        return conn.reply(m.chat, `💀 No tienes suficiente salud para minar.\n> Usa *"${usedPrefix}heal"* para curarte.`, m)

    const gap = 10 * 60 * 1000
    const now = Date.now()
    if (now < user.lastmine) {
        const restante = user.lastmine - now
        return conn.reply(m.chat, `⏳ Debes esperar *${formatTime(restante)}* para usar *${usedPrefix + command}* de nuevo.`, m)
    }

    user.lastmine = now + gap
    const evento = pickRandom(eventos)

    let monedas = 0, experiencia = 0, salud = 0, gemas = 0, objeto = null

    if (evento.tipo === 'victoria') {
        monedas = Math.floor(Math.random() * 2001) + 7000
        experiencia = Math.floor(Math.random() * 91) + 10
        salud = Math.floor(Math.random() * 3) + 1
        gemas = Math.floor(Math.random() * 2) // 0 a 1 gemas
        if (Math.random() < 0.3) objeto = pickRandom(objetosRaros) // 30% de chance de objeto raro
        user.coin += monedas
        user.exp += experiencia
        user.health -= salud
        user.gems += gemas
        if (objeto) user.inventory.push(objeto)
    } else {
        monedas = Math.floor(Math.random() * 2001) + 3000
        experiencia = Math.floor(Math.random() * 41) + 10
        salud = Math.floor(Math.random() * 5) + 1
        user.coin -= monedas
        user.exp -= experiencia
        user.health -= salud
        if (user.coin < 0) user.coin = 0
        if (user.exp < 0) user.exp = 0
    }

    if (user.health < 0) user.health = 0

    const mensaje = `
⛏️ *¡Minado completado!* ⛏️

💎 ${evento.mensaje}

💰 *Coins obtenidos:* ¥${monedas.toLocaleString()} ${currency}
✨ *EXP ganada:* ${experiencia}
❤️ *Salud perdida:* ${salud}
💎 *Gemas obtenidas:* ${gemas}
${objeto ? `🎁 *Objeto raro encontrado:* ${objeto}` : ''}

────────────────────────
🔹 ¡Sigue minando y descubre más tesoros ocultos!
⚡ Tip: Usa *${usedPrefix}heal* si tu salud está baja.
`
    await conn.reply(m.chat, mensaje, m)
}

handler.help = ['minar']
handler.tags = ['economy']
handler.command = ['minar', 'miming', 'mine']
handler.group = true

export default handler

// ---------------- FUNCIONES ----------------
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
    return list[Math.floor(Math.random() * list.length)]
}

// ---------------- EVENTOS ----------------
const eventos = [
    { tipo: 'victoria', mensaje: 'Descubriste una veta de oro entre rocas inestables y lograste extraerla con éxito, ganaste.' },
    { tipo: 'victoria', mensaje: 'Hallaste una cámara secreta con gemas ocultas por siglos. Ganaste.' },
    { tipo: 'victoria', mensaje: 'Te cruzaste con un minero anciano que compartió herramientas y conocimientos valiosos, ganaste.' },
    { tipo: 'victoria', mensaje: 'Excavaste un túnel olvidado y encontraste un cofre de minerales raros, ganaste.' },
    { tipo: 'victoria', mensaje: 'Encontraste una cueva iluminada por cristales naturales que revelaban un tesoro oculto. Ganaste.' },
    { tipo: 'victoria', mensaje: 'Un golem de piedra te dio acceso a una sala de esmeraldas tras superar su acertijo, ganaste.' },
    { tipo: 'victoria', mensaje: 'Minaste junto a otros exploradores y compartieron contigo los beneficios de una fuente mágica, ganaste.' },
    { tipo: 'victoria', mensaje: 'Tras horas de excavación, hallaste una cámara sellada repleta de piedras lunares, ganaste.' },
    { tipo: 'victoria', mensaje: 'Tu pico tocó una superficie metálica: era un cofre con monedas antiguas de gran valor, ganaste.' },
    { tipo: 'victoria', mensaje: 'Siguiendo un mapa maltratado, diste con una cavidad llena de rubíes, ganaste.' },
    { tipo: 'derrota', mensaje: 'Tus herramientas se rompieron justo antes de descubrir un filón valioso. Te retiraste con las manos vacías, perdiste.' },
    { tipo: 'derrota', mensaje: 'Una explosión de gas te sorprendió y te hizo perder parte del botín mientras escapabas, perdiste.' },
    { tipo: 'derrota', mensaje: 'La cueva colapsó parcialmente y tus minerales quedaron enterrados, perdiste.' },
    { tipo: 'derrota', mensaje: 'Te atacaron murciélagos cegadores y saliste herido sin completar la recolección. Perdiste.' },
    { tipo: 'derrota', mensaje: 'Una trampa antigua se activó y dañó tu mochila, perdiendo varias gemas, perdiste.' }
]

// ---------------- OBJETOS RAROS ----------------
const objetosRaros = [
    'Diamante', 'Esmeralda', 'Rubí', 'Zafiro', 'Topacio',
    'Lápiz de Oro', 'Cristal de Energía', 'Pico Legendario', 'Mapa del Tesoro', 'Cofre Misterioso'
]
