import { WAMessageStubType } from '@whiskeysockets/baileys'
import chalk from 'chalk'
import { watchFile } from 'fs'

const terminalImage = global.opts['img'] ? require('terminal-image') : ''
const urlRegex = (await import('url-regex-safe')).default({ strict: false })

export default async function (m, conn = { user: {} }) {
  let _name = await conn.getName(m.sender)
  let sender = '+' + m.sender.replace('@s.whatsapp.net', '') + (_name ? ' ~ ' + _name : '')
  let chat = await conn.getName(m.chat)
  let img

  try {
    if (global.opts['img'])
      img = /sticker|image/gi.test(m.mtype) ? await terminalImage.buffer(await m.download()) : false
  } catch (e) { console.error(e) }

  let filesize = (m.msg ?
    m.msg.vcard ? m.msg.vcard.length :
    m.msg.fileLength ? m.msg.fileLength.low || m.msg.fileLength :
    m.msg.axolotlSenderKeyDistributionMessage ? m.msg.axolotlSenderKeyDistributionMessage.length :
    m.text ? m.text.length :
    0
    : m.text ? m.text.length : 0) || 0

  let user = global.db.data.users[m.sender]
  let chatName = chat ? (m.isGroup ? 'Grupo ~ ' + chat : 'Privado ~ ' + chat) : ''
  let me = '+' + (conn.user?.jid || '').replace('@s.whatsapp.net', '')
  const userName = conn.user.name || conn.user.verifiedName || "Desconocido"
  if (m.sender === conn.user?.jid) return

  const date = new Date(m.messageTimestamp ? 1000 * (m.messageTimestamp.low || m.messageTimestamp) : Date.now())
  const formattedDate = date.toLocaleString("es-ES", { timeZone: "America/Mexico_City", day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  // ==== ESTILO FUTURISTA ====
  console.log(chalk.hex('#00FFE0').bold('╭─[ BOT LOG ⚡ FUTURE ]───────────────────────────────'))
  console.log(`${chalk.hex('#00FFE0')('│')} Bot: ${chalk.cyanBright(me)} ~ ${chalk.magentaBright(userName)}`)
  console.log(`${chalk.hex('#00FFE0')('│')} Fecha: ${chalk.yellowBright(formattedDate)}`)
  console.log(`${chalk.hex('#00FFE0')('│')} Tipo Evento: ${chalk.redBright(m.messageStubType ? WAMessageStubType[m.messageStubType] : 'Ninguno')}`)
  console.log(`${chalk.hex('#00FFE0')('│')} Tamaño: ${chalk.greenBright(filesize + ' B')} (${chalk.cyanBright((filesize / 1024).toFixed(2) + ' KB')})`)
  console.log(`${chalk.hex('#00FFE0')('│')} Remitente: ${chalk.blueBright(sender)}`)
  console.log(`${chalk.hex('#00FFE0')('│')} Chat: ${chalk.magentaBright(chatName)}`)
  console.log(`${chalk.hex('#00FFE0')('│')} Tipo Mensaje: ${chalk.yellowBright(m.mtype ? m.mtype.replace(/message$/i,'').replace('audio', m.msg?.ptt ? 'PTT' : 'audio').replace(/^./, v => v.toUpperCase()) : 'Desconocido')}`)
  console.log(chalk.hex('#00FFE0').bold('╰───────────────────────────────────────────────'))

  if (img) console.log(img.trimEnd())

  // ==== FORMATO DE TEXTO MODERNIZADO ====
  if (typeof m.text === 'string' && m.text) {
    let log = m.text.replace(/\u200e+/g, '')
    log = log.split('\n').map(line => {
      if (line.trim().startsWith('>')) return chalk.bgGray.black('┃ ' + line.replace(/^>/, ''))
      if (/^([1-9]|[1-9][0-9])\./.test(line.trim())) return chalk.cyan(line)
      if (/^[-*]\s/.test(line.trim())) return chalk.green('• ' + line.replace(/^[*-]\s?/, ''))
      return line
    }).join('\n')

    // Destacar URLs
    log = log.replace(urlRegex, url => chalk.blueBright.underline(url))

    console.log(m.error != null ? chalk.red(log) : m.isCommand ? chalk.yellowBright(log) : log)
  }

  // ==== DOCUMENTOS Y CONTACTOS ====
  if (/document/i.test(m.mtype)) console.log(chalk.magenta(`🝮 ${m.msg.fileName || m.msg.displayName || 'Documento'}`))
  if (/contact/i.test(m.mtype)) console.log(chalk.cyan(`✎ ${m.msg.displayName || 'Contacto'}`))
  if (/audio/i.test(m.mtype)) {
    const duration = m.msg.seconds
    console.log(`${m.msg.ptt ? '☄ PTT' : '𝄞 AUDIO'} ${Math.floor(duration / 60).toString().padStart(2,0)}:${(duration % 60).toString().padStart(2,0)}`)
  }

  console.log() // espacio final
  watchFile(global.__filename(import.meta.url), () => console.log(chalk.redBright("Update 'lib/print.js'")))
}
