import axios from 'axios'

let handler = async (m, { conn, usedPrefix, text }) => {
if (!text) {
return conn.reply(m.chat, `❀ Por favor, ingresa una *IP*.`, m)
}
try {
await m.react('🕒')
const res = await axios.get(`http://ip-api.com/json/${text}?fields=status,message,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,isp,org,as,mobile,hosting,query`)
const data = res.data
if (String(data.status) !== "success") {
throw new Error(data.message || "Falló")
}
let ipsearch = `✧ *I N F O - I P* ✧
» IP : ${data.query}
» País : ${data.country}
» Código de País : ${data.countryCode}
» Provincia : ${data.regionName}
» Código de Provincia : ${data.region}
» Ciudad : ${data.city}
» Distrito : ${data.district}
» Código Postal : ${res.data.zip}
» Zona Horaria : ${data.timezone}
» ISP : ${data.isp}
» Organización : ${data.org}
» AS : ${data.as}
» Mobile : ${data.mobile ? "Si" : "No"}
» Hosting : ${data.hosting ? "Si" : "No"}`.trim()
conn.reply(m.chat, ipsearch, m)
await m.react('✔️')
} catch (error) {
await m.react('✖️')
conn.reply(m.chat, `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${error.message}`, m)
}}

handler.help = ['ip <alamat ip>']
handler.tags = ['owner']
handler.command = ['ip']
handler.reg = true

export default handler