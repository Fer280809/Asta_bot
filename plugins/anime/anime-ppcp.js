import fetch from "node-fetch"

let handler = async (m, { conn }) => {
try {
await m.react('🕒')
let data = await (await fetch('https://raw.githubusercontent.com/ShirokamiRyzen/WAbot-DB/main/fitur_db/ppcp.json')).json()
let cita = data[Math.floor(Math.random() * data.length)]
let cowi = await (await fetch(cita.cowo)).buffer()
await conn.sendFile(m.chat, cowi, '', '*Masculino* ♂', m)
let ciwi = await (await fetch(cita.cewe)).buffer()
await conn.sendFile(m.chat, ciwi, '', '*Femenina* ♀', m)
await m.react('✔️')
} catch (error) {
await m.react('✖️')
await conn.reply(m.chat, `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${error.message}`, m)
}}

handler.help = ['ppcouple']
handler.tags = ['anime']
handler.command = ['ppcp', 'ppcouple']
handler.group = true
handler.reg = true 

export default handler
