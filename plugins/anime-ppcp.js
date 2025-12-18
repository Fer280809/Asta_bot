import fetch from "node-fetch"

let handler = async (m, { conn, usedPrefix }) => {
try {
await m.react('🎄')
let data = await (await fetch('https://raw.githubusercontent.com/ShirokamiRyzen/WAbot-DB/main/fitur_db/ppcp.json')).json()
let cita = data[Math.floor(Math.random() * data.length)]
let cowi = await (await fetch(cita.cowo)).buffer()
await conn.sendFile(m.chat, cowi, '', '🎅 *Reno Masculino* 🦌', m)
let ciwi = await (await fetch(cita.cewe)).buffer()
await conn.sendFile(m.chat, ciwi, '', '🎀 *Elfa Femenina* 🎁', m)
await m.react('✨')
} catch (error) {
await m.react('❄️')
await conn.reply(m.chat, `🎄 *¡Oh no!* Algo salió mal en el taller.\n> Usa *${usedPrefix}report* para informar a Santa.\n\n${error.message}`, m)
}}

handler.help = ['ppcouple']
handler.tags = ['anime']
handler.command = ['ppcp', 'ppcouple']
handler.group = true

export default handler
