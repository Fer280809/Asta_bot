let handler = async (m, { conn, text }) => {
let id = m.chat
conn.math = conn.math ? conn.math : {}
if (id in conn.math) {
clearTimeout(conn.math[id][3])
delete conn.math[id]
m.reply('.... ')
}
if (!text) {
return m.reply(`❀ Por favor, ingresa una ecuación.`)
}
let val = text.replace(/[^0-9\-\/+*×÷πEe()piPI/]/g, '').replace(/×/g, '*').replace(/÷/g, '/').replace(/π|pi/gi, 'Math.PI').replace(/e/gi, 'Math.E').replace(/\/+/g, '/').replace(/\++/g, '+').replace(/-+/g, '-')
let format = val.replace(/Math\.PI/g, 'π').replace(/Math\.E/g, 'e').replace(/\//g, '÷').replace(/\*×/g, '×')
try {
await m.react('🕒')
let result = (new Function('return ' + val))()
if (!result) throw result
await m.reply(`❀ Ejercicio: *${format}* = _${result}_`)
await m.react('✔️')
} catch (e) {
await m.react('✖️')
return m.reply(`ꕥ Formato incorrecto, solo 0-9 y símbolo -, +, *, /, ×, ÷, π, e, (, ) que puedes usar.`)
}}

handler.help = ['cal']
handler.tags = ['tools']
handler.command = ['cal', 'calc', 'calcular', 'calculadora']
handler.group = true
handler.exp = 5
handler.reg = true

export default handler
