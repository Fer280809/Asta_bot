import translate from '@vitalets/google-translate-api'
import fetch from 'node-fetch'

const handler = async (m, { args, usedPrefix, command }) => {
const defaultLang = 'es'
const msg = `❀ Por favor, ingresé el (idioma) (texto) para traducirlo.`  
if (!args || !args[0]) {
if (m.quoted && m.quoted.text) {
args = [defaultLang, m.quoted.text]
} else {
return m.reply(msg)
}}
let lang = args[0]
let text = args.slice(1).join(' ')
if ((args[0] || '').length !== 2) {
lang = defaultLang
text = args.join(' ')
}
try {
await m.react('🕒')
const result = await translate(`${text}`, { to: lang, autoCorrect: true })
await conn.reply(m.chat, result.text, m)
await m.react('✔️')
} catch (error) {
await m.react('✖️')
await m.reply(`⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${error.message}`, m)
try {
await m.react('🕒')
conn.reply(m.chat, wait, m)
const lol = await fetch(`https://api.lolhuman.xyz/api/translate/auto/${lang}?apikey=${lolkeysapi}&text=${text}`)
const loll = await lol.json()
const result2 = loll.result.translated
await conn.reply(m.chat, result2, m)
await m.react('✔️')
} catch (error) {
await m.react('✖️')
await m.reply(`⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${error.message}`, m)
}}}

handler.help = ['translate']
handler.tags = ['tools']
handler.command = ['translate', 'traducir', 'trad']
handler.group = true
handler.reg = true

export default handler