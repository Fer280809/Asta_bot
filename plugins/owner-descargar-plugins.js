import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, args, isOwner }) => {
  try {
    if (!isOwner) return m.reply('💠 Acceso denegado: Solo los *creadores* pueden usar este comando.')

    if (!args[0]) return m.reply('💡 Debes indicar el nombre del plugin que deseas descargar.')

    let nombre = args[0]
    if (!nombre.endsWith('.js')) nombre += '.js'

    let numeroCarpeta = args[1] ? args[1] : '1'
    const carpetas = {
      '1': 'plugins',
      '2': 'plugins2',
      '3': 'plugins3',
      '4': 'plugins4',
      '5': 'plugins5'
    }

    let carpeta = carpetas[numeroCarpeta]
    if (!carpeta) return m.reply('💡 Carpeta inválida. Elige un número del 1 al 5.')

    let ruta = path.join('./', carpeta, nombre)

    if (!fs.existsSync(ruta)) return m.reply(`❌ No existe el plugin *${nombre}* en la carpeta *${carpeta}*.`)

    await conn.sendFile(m.chat, ruta, nombre, `📦 Aquí tienes el plugin *${nombre}* desde *${carpeta}*`, m)
  } catch (err) {
    console.error(err)
    m.reply(`❌ Ocurrió un error al descargar el plugin: ${err.message}`)
  }
}

handler.help = ['descargarplugin <nombre> <num carpeta>']
handler.tags = ['owner']
handler.command = ['descargarplugin', 'getplugin', 'dlplugin']
handler.rowner = true

export default handler
