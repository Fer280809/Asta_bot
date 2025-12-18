import { cpus as _cpus, totalmem, freemem, platform, hostname } from 'os'
import { execSync } from 'child_process'
import { sizeFormatter } from 'human-readable'

let format = sizeFormatter({ std: 'JEDEC', decimalPlaces: 2, keepTrailingZeroes: false, render: (literal, symbol) => `${literal} ${symbol}B` })
let handler = async (m, { conn }) => {
let totalUsers = Object.keys(global.db.data.users).length
let totalChats = Object.keys(global.db.data.chats).length
let totalPlugins = Object.values(global.plugins).filter((v) => v.help && v.tags).length
let totalBots = global.conns.filter(conn => conn.user && conn.ws.socket && conn.ws.socket.readyState !== 3).length
let totalCommands = Object.values(global.db.data.users).reduce((acc, user) => acc + (user.commands || 0), 0)

let system = `
🎄 *¡ESTADO NAVIDEÑO DEL BOT!* 🎅

━━━━━━━━━━━━━━━━━━━
❄️ *MIS DATOS FESTIVOS* ❄️

🎁 Comandos ejecutados » ${toNum(totalCommands)}
👥 Usuarios registrados » ${totalUsers.toLocaleString()}
👨‍👩‍👧‍👦 Grupos registrados » ${totalChats.toLocaleString()}
✨ Plugins mágicos » ${totalPlugins}
🤖 Bots activos » ${totalBots}

━━━━━━━━━━━━━━━━━━━
🦌 *ESTADO DEL SERVIDOR* 🛷

🎅 Sistema » ${platform()}
⭐ CPU » ${_cpus().length} núcleos
🎄 RAM Total » ${format(totalmem())}
🎁 RAM Usada » ${format(totalmem() - freemem())}
❄️ Arquitectura » ${process.arch}
🔔 Host ID » ${hostname().slice(0, 8)}...

━━━━━━━━━━━━━━━━━━━
🎀 *USO DE MEMORIA* 🎀

🧦 RAM Utilizada » ${format(process.memoryUsage().rss)}
🧤 Heap Reservado » ${format(process.memoryUsage().heapTotal)}
🎁 Heap Usado » ${format(process.memoryUsage().heapUsed)}
🦌 Módulos Nativos » ${format(process.memoryUsage().external)}
⭐ Buffers de Datos » ${format(process.memoryUsage().arrayBuffers)}

━━━━━━━━━━━━━━━━━━━
*¡Feliz Navidad y Próspero Año Nuevo!* 🎄🎆
*Que la magia de la Navidad llene tu corazón* 💖
`

await conn.reply(m.chat, system.trim(), m, rcanal)
}

handler.help = ['estado']
handler.tags = ['info']
handler.command = ['estado', 'status', 'estadonavideño']

export default handler

function toNum(number) {
if (number >= 1000 && number < 1000000) {
return (number / 1000).toFixed(1) + 'k'
} else if (number >= 1000000) {
return (number / 1000000).toFixed(1) + 'M'
} else {
return number.toString()
}
}