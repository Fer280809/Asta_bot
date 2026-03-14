import util from 'util'
import path from 'path'

let user = a => '@' + a.split('@')[0]
let toM = a => '@' + a.split('@')[0]
let pickRandom = list => list[Math.floor(Math.random() * list.length)]
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const handler = async (m, { groupMetadata, command, conn, text, usedPrefix, args }) => {
if (!global.db.data.chats[m.chat].gacha && m.isGroup) return m.reply(`《✦》Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}gacha on*`)
try {
let ps = groupMetadata.participants.map(v => v.id)
if (command == 'top') {
let cantidad = 10
let texto = text
if (!isNaN(parseInt(args[0]))) {
cantidad = Math.min(Math.max(parseInt(args[0]), 1), 10)
texto = args.slice(1).join(' ')
}
if (!texto) return conn.reply(m.chat, `❀ Por favor, ingrese un texto luego del número para hacer un Top *cantidad texto*`, m)
if (ps.length < cantidad) return conn.reply(m.chat, `ꕥ No hay suficientes miembros para hacer un Top ${cantidad}`, m)
let seleccionados = []
while (seleccionados.length < cantidad) {
let candidato = ps[Math.floor(Math.random() * ps.length)]
if (!seleccionados.includes(candidato)) seleccionados.push(candidato)
}
let x = pickRandom(['🤓','😅','😂','😳','😎','🥵','😱','🤑','🙄','💩','🍑','🤨','🥴','🔥','👇🏻','😔','👀','🌚'])
let top = `*${x} Top ${cantidad} ${texto} ${x}*\n\n`
seleccionados.forEach((u, i) => {
top += `${i + 1}. ${user(u)}\n`
})
return m.reply(top.trim(), null, { mentions: seleccionados })
}
if (command == 'sorteo') {
if (!text) return conn.reply(m.chat, `❀ Por favor ingresa lo que deseas sortear.`, m)
let cantidad = 1
let premio = text
if (!isNaN(parseInt(args[0]))) {
cantidad = Math.min(Math.max(parseInt(args[0]), 1), 10)
premio = args.slice(1).join(' ')
}
if (!premio) return conn.reply(m.chat, `❀ Por favor, ingrese un texto luego del número para hacer el sorteo.`, m)
if (ps.length < cantidad) return conn.reply(m.chat, `ꕥ No hay suficientes miembros para seleccionar ${cantidad} ganador(es).`, m)
let seleccionados = []
while (seleccionados.length < cantidad) {
let candidato = ps[Math.floor(Math.random() * ps.length)]
if (!seleccionados.includes(candidato)) seleccionados.push(candidato)
}
let mensaje = cantidad === 1 ? `✦ ＦＥＬＩＣＩＤＡＤＥＳ ✦\n\n❀ ${user(seleccionados[0])}\n○ Haz ganado un *${premio}*` : `✦ ＦＥＬＩＣＩＤＡＤＥＳ ✦\n\n` + seleccionados.map((u, i) => `${i + 1}. ${user(u)}`).join('\n') + `\n\n○ Han ganado un *${premio}*`
return await conn.sendMessage(m.chat, { text: mensaje.trim(), mentions: seleccionados }, { quoted: m, ephemeralExpiration: 24 * 60 * 100, disappearingMessagesInChat: 24 * 60 * 100 })
}
if (command == 'ship' || command == 'shippear') {
if (!text) return conn.reply(m.chat, `❀ Escribe tu nombre y el nombre de la otra personas para calcular su amor.`, m)
let [text1, ...text2] = text.split(' ')
text2 = (text2 || []).join(' ')
if (!text2) return conn.reply(m.chat, `ꕥ Escribe el nombre de la segunda persona.`, m)
let love = `❤️ *${text1}* tu oportunidad de enamorarte de *${text2}* es de ${Math.floor(Math.random() * 100)}% 👩🏻‍❤️‍👨🏻`
return m.reply(love, null, { mentions: conn.parseMention(love) })
}
if (command == 'afk') {
const user = global.db.data.users[m.sender]
user.afk = Date.now()
user.afkReason = text
return await conn.reply(m.chat, `❀ *El Usuario ${await conn.getName(m.sender)} Estará AFK*\n○ *Motivo${text ? ': ' + text : ': Sin Especificar!'}*`, m)
}
if (command == 'personalidad') {
let mentionedJid = await m.mentionedJid
let userId = mentionedJid?.[0] || (m.quoted && await m.quoted.sender) || conn.parseMention(text)?.[0] || text || null
let nombre = !userId?.includes('@s.whatsapp.net') ? userId : global.db.data.users[userId].name || (await conn.getName(userId).catch(() => userId.split('@')[0])) || userId.split('@')[0]
let userName = userId?.includes('@s.whatsapp.net') ? `*${nombre}*` : `*${userId}*`
if (!userId) return conn.reply(m.chat, `❀ Por favor, ingrese el nombre de alguna persona.`, m)
let personalidad = `> • Nombre » ${userName}\n> • Buena Moral » ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98,3%','99,7%','99,9%','1%','2,9%','0%','0,4%'])}\n> • Mala Moral : ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98,3%','99,7%','99,9%','1%','2,9%','0%','0,4%'])}\n> • Tipo de persona » ${pickRandom(['De buen corazón','Arrogante','Tacaño','Generoso','Humilde','Tímido','Cobarde','Entrometido','Cristal','No binarie XD', 'Pendejo'])}\n> • Siempre » ${pickRandom(['Pesado','De malas','Distraido','De molestoso','Chismoso','Pasa jalandosela','De compras','Viendo anime','Chatea en WhatsApp porque esta soltero','Acostado bueno para nada','De mujeriego','En el celular'])}\n> • Inteligencia » ${pickRandom(['9%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98,3%','99,7%','99,9%','1%','2,9%','0%','0,4%'])}\n> • Pendejo(a) » ${pickRandom(['9%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98,3%','99,7%','99,9%','1%','2,9%','0%','0,4%'])}\n> • Morosidad » ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98,3%','99,7%','99,9%','1%','2,9%','0%','0,4%'])}\n> • Coraje » ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98,3%','99,7%','99,9%','1%','2,9%','0%','0,4%'])}\n> • Miedo » ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98,3%','99,7%','99,9%','1%','2,9%','0%','0,4%'])}\n> • Fama » ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98,3%','99,7%','99,9%','1%','2,9%','0%','0,4%'])}\n> • Género » ${pickRandom(['Hombre', 'Mujer', 'Homosexual', 'Bisexual', 'Pansexual', 'Feminista', 'Heterosexual', 'Macho alfa', 'Mujerzona', 'Marimacha', 'Palosexual', 'PlayStationSexual', 'Sr. Manuela', 'Pollosexual'])}`
return await conn.reply(m.chat, personalidad, m)
}
if (command == 'formarpareja') {
let R = Math.random
let Fl = Math.floor
const frases = ["Esta pareja está destinada a estar junta 💙", "Dos pequeños tortolitos enamorados ✨", "Ya hasta familia deberían tener 🤱🧑‍🍼", "Se casaron en secreto 💍", "Están de luna de miel ✨🥵😍❤️", "Son inseparables como el café y la arepa ☕🥙", "Su química es de otro planeta 🌌", "Pareja explosiva que enciende el grupo 🔥", "Amor que ni el tiempo puede borrar ⏳❤️", "Se miran y el mundo desaparece 🌍💫", "Romance digno de novela 📖💘", "Pareja que todos envidian 😍👀", "Son el alma del grupo juntos 🎉💑", "Amor que nació en los stickers 💬💞", "Pareja que comparte hasta los datos móviles 📱❤️", "Su conexión es más fuerte que el WiFi 📶💘", "Pareja que se entiende con solo emojis 😘😎", "Amor que ni el bot puede ignorar 🤖💓", "Pareja que merece su propio comando 🧾💑", "Son tan dulces que suben el azúcar 🍭💕"]
let cantidad = Math.min(Math.max(parseInt(args[0]) || 1, 1), 10)
let ps = groupMetadata.participants.map(v => v.id)
if (ps.length < cantidad * 2) return m.reply(`ꕥ No hay miembros suficientes para formar ${cantidad} pareja${cantidad === 1 ? '' : 's'}`)
let usados = new Set()
let parejas = []
let menciones = []
for (let i = 0; i < cantidad; i++) {
let a, b
do a = ps[Fl(R() * ps.length)]
while (usados.has(a))
usados.add(a)
do b = ps[Fl(R() * ps.length)]
while (b === a || usados.has(b))
usados.add(b)
parejas.push({a, b})
menciones.push(a, b)
}
let texto = cantidad === 1 ? `*😍 _La mejor pareja del grupo_ 😍*\n\n` : `*😍 _Las ${cantidad} mejores parejas del grupo_ 😍*\n\n`
parejas.forEach((p, i) => {
texto += `${i + 1}.- ${toM(p.a)} y ${toM(p.b)}\n${frases[i % frases.length]}\n\n`
})
return m.reply(texto.trim(), null, { mentions: menciones })
}
if (['gay','lesbiana','pajero','pajera','puto','puta','manco','manca','rata','prostituto','prostituta'].includes(command)) {
const mentionedJid = await m.mentionedJid
const usser = mentionedJid?.[0] || (m.quoted && await m.quoted.sender) || conn.parseMention(text)?.[0] || text || null
const userId = usser?.includes('@s.whatsapp.net') ? `@${usser.split('@')[0]}` : `*${usser}*`
if (!usser) return conn.reply(m.chat, `❀ Por favor, mensiona a un Usuario para comprobar su test.`, m)
const percentages = (500).getRandom()
let emoji = ''
let description = ''
switch (command) {
case 'gay':
emoji = '🏳️‍🌈'
description = percentages < 50 ? `💙 Los cálculos han arrojado que ${userId} es *${percentages}%* Gay ${emoji}\n> ✰ Eso es bajo, ¡Tú eres Joto, no Gay!` : percentages > 100 ? `💜 Los cálculos han arrojado que ${userId} es *${percentages}%* Gay ${emoji}\n> ✰ ¡Incluso más gay de lo que pensábamos!` : `🖤 Los cálculos han arrojado que ${userId} es *${percentages}%* Gay ${emoji}\n> ✰ Lo tuyo, lo tuyo es que eres Gay.`
break
case 'lesbiana':
emoji = '🏳️‍🌈'
description = percentages < 50 ? `👻 Los cálculos han arrojado que ${userId} es *${percentages}%* ${command} ${emoji}\n✰ Quizás necesites más películas románticas en tu vida.` : percentages > 100 ? `❣️ Los cálculos han arrojado que ${userId} es *${percentages}%* ${command} ${emoji}\n> ✰ ¡Eso es un amor extremo por las Chicas!` : `💗 Los cálculos han arrojado que ${userId} es *${percentages}%* ${command} ${emoji}\n> ✰ Mantén el amor floreciendo!`
break
case 'pajero': case 'pajera':
emoji = '😏💦'
description = percentages < 50 ? `🧡 Los cálculos han arrojado que ${userId} es *${percentages}%* ${command} ${emoji}\n> ✰ Tal vez necesites más hobbies!` : percentages > 100 ? `💕 Los cálculos han arrojado que ${userId} es *${percentages}%* ${command} ${emoji}\n> ✰ Eso es una resistencia admirable!` : `💞 Los cálculos han arrojado que ${userId} es *${percentages}%* ${command} ${emoji}\n> ✰ Mantén el buen trabajo (en solitario).`
break
case 'puto': case 'puta':
emoji = '🔥🥵'
description = percentages < 50 ? `😼 Los cálculos han arrojado que ${userId} es *${percentages}%* ${command} ${emoji}\n> ✧ ¡Más suerte en tu próxima conquista!` : percentages > 100 ? `😻 Los cálculos han arrojado que ${userId} es *${percentages}%* ${command} ${emoji}\n> ✰ ¡Estás en llamas!` : `😺 Los cálculos han arrojado que ${userId} es *${percentages}%* ${command} ${emoji}\n> ✰ Mantén ese encanto ardiente!`
break
case 'manco': case 'manca':
emoji = '💩'
description = percentages < 50 ? `🌟 Los cálculos han arrojado que ${userId} es *${percentages}%* ${command} ${emoji}\n> ✰ ¡No eres el único en ese club!` : percentages > 100 ? `💌 Los cálculos han arrojado que ${userId} es *${percentages}%* ${command} ${emoji}\n> ✰ ¡Tienes un talento muy especial!` : `🥷 Los cálculos han arrojado que ${userId} es *${percentages}%* ${command} ${emoji}\n> ✰ Mantén esa actitud valiente!`
break
case 'rata':
emoji = '🐁'
description = percentages < 50 ? `💥 Los cálculos han arrojado que ${userId} es *${percentages}%* ${command} ${emoji}\n> ✰ Nada de malo en disfrutar del queso!` : percentages > 100 ? `💖 Los cálculos han arrojado que ${userId} es *${percentages}%* ${command} ${emoji}\n> ✰ Un auténtico ratón de lujo!` : `👑 Los cálculos han arrojado que ${userId} es *${percentages}%* ${command} ${emoji}\n> ✰ Come queso con responsabilidad!`
break
case 'prostituto': case 'prostituta':
emoji = '🫦👅'
description = percentages < 50 ? `❀ Los cálculos han arrojado que ${userId} es *${percentages}%* ${command} ${emoji}\n> ✰ El mercado está en auge!` : percentages > 100 ? `💖 Los cálculos han arrojado que ${userId} es *${percentages}%* ${command} ${emoji}\n> ✰ Un/a verdadero/a profesional!` : `✨️ Los cálculos han arrojado que ${userId} es *${percentages}%* ${command} ${emoji}\n> ✰ Siempre es hora de negocios!`
break
}
const responses = ["El universo ha hablado.", "Los científicos lo confirman.", "¡Sorpresa!"]
const response = responses[Math.floor(Math.random() * responses.length)]
const cal = `ꕥ *CALCULADORA*\n\n${description}\n\n➤ ${response}`.trim()
const hawemod = ["《 █▒▒▒▒▒▒▒▒▒▒▒》10%", "《 ████▒▒▒▒▒▒▒▒》30%", "《 ███████▒▒▒▒▒》50%", "《 ██████████▒▒》80%", "《 ████████████》100%"]
let { key } = await conn.sendMessage(m.chat, { text: `ꕥ ¡Calculando Porcentaje!`, mentions: conn.parseMention(cal) }, { quoted: fkontak })
for (let i = 0; i < hawemod.length; i++) {
await new Promise(resolve => setTimeout(resolve, 1000))
await conn.sendMessage(m.chat, { text: hawemod[i], edit: key, mentions: conn.parseMention(cal) }, { quoted: fkontak })
}
return await conn.sendMessage(m.chat, { text: cal, edit: key, mentions: conn.parseMention(cal) }, { quoted: fkontak })
}
if (['doxear','doxxeo','doxeo'].includes(command)) {
let mentionedJid = await m.mentionedJid
let userId = mentionedJid && mentionedJid.length ? mentionedJid[0] : m.quoted && await m.quoted.sender ? await m.quoted.sender : null
let userName = await (async () => global.db.data.users[userId].name || (async () => { try { const n = await conn.getName(userId); return typeof n === 'string' && n.trim() ? n : userId.split('@')[0] } catch { return userId.split('@')[0] } })())()
if (!userId) return conn.reply(m.chat, `❀ Por favor, ingrese el tag de algún usuario o responda a un mensaje.`, m)
let start = `ꕥ *Iniciando doxeo*...`
let boost = `*${pickRandom(['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20'])}%*`
let boost2 = `*${pickRandom(['21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40'])}%*`
let boost3 = `*${pickRandom(['41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60'])}%*`
let boost4 = `*${pickRandom(['61','62','63','64','65','66','67','68','69','70','71','72','73','74','75','76','77','78','79','80'])}%*`
let boost5 = `*${pickRandom(['81','82','83','84','85','86','87','88','89','90','91','92','93','94','95','96','97','98','99','100'])}%*`
const { key } = await conn.sendMessage(m.chat, { text: `${start}` }, { quoted: m })
await delay(1000)
await conn.sendMessage(m.chat, { text: `${boost}`, edit: key })
await delay(1000)
await conn.sendMessage(m.chat, { text: `${boost2}`, edit: key })
await delay(1000)
await conn.sendMessage(m.chat, { text: `${boost3}`, edit: key })
await delay(1000)
await conn.sendMessage(m.chat, { text: `${boost4}`, edit: key })
await delay(1000)
await conn.sendMessage(m.chat, { text: `${boost5}`, edit: key })
let doxeo = `❀ *Persona doxeada*\n\n✦ ${new Date().toLocaleDateString()}\n✧ ${new Date().toLocaleTimeString()}\n\n✰ Resultados:\n\n*Nombre:* ${userName}\n*Ip:* 92.28.211.234\n*N:* 43 7462\n*W:* 12.4893\n*SS NUMBER:* 6979191519182016\n*IPV6:* fe80::5dcd::ef69::fb22::d9888%12\n*UPNP:* Enabled\n*DMZ:* 10.112.42.15\n*MAC:* 5A:78:3E:7E:00\n*ISP:* Ucom universal \n*DNS:* 8.8.8.8\n*ALT DNS:* 1.1.1.1 \n*DNS SUFFIX:* Dlink\n*WAN:* 100.23.10.15\n*WAN TYPE:* private nat\n*GATEWAY:* 192.168.0.1\n*SUBNET MASK:* 255.255.0.255\n*UDP OPEN PORTS:* 8080, 80\n*TCP OPEN PORTS:* 443\n*ROUTER VENDEDOR:* ERICCSON\n*DEVICE VENDEDOR:* WIN32-X\n*CONNECTION TYPE:* TPLINK COMPANY\n*ICMPHOPS:* 192.168.0.1, 192.168.1.1, 100.73.43.4\nhost-132.12.32.167.ucom.com\nhost-132.12.111.ucom.com\n36.134.67.189, 216.239.78.11\nSof02s32inf14.1e100.net\n*HTTP:* 192.168.3.1:433-->92.28.211.234:80\n*Http:* 192.168.625-->92.28.211.455:80\n*Http:* 192.168.817-->92.28.211.8:971\n*Upd:* 192.168.452-->92.28.211:7265288\n*Tcp:* 192.168.682-->92.28.211:62227.7\n*Tcp:* 192.168.725-->92.28.211:67wu2\n*Tcp:* 192.168.629-->92.28.211.167:8615\n*EXTERNAL MAC:* 6U:77:89:ER:O4\n*MODEM JUMPS:* 64`
await conn.sendMessage(m.chat, { text: doxeo, edit: key, mentions: conn.parseMention(doxeo) }, { quoted: m })
}} catch (error) {
await m.react('✖️')
conn.reply(m.chat, `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${error.message}`, m)
}}

handler.help = ['top', 'sorteo', 'ship', 'shippear', 'afk', 'personalidad', 'formarpareja', 'gay', 'lesbiana', 'pajero', 'pajera', 'puto', 'puta', 'manco', 'manca', 'rata', 'prostituto', 'prostituta', 'doxear', 'doxeo', 'doxxeo']
handler.tags = ['fun']
handler.command = handler.help
handler.group = true
handler.reg = true

export default handler
