import { fileURLToPath, pathToFileURL } from 'url'
import path from 'path'

const { buildWelcome, buildBye } = await import(
  pathToFileURL(process.cwd() + '/plugins/welcome-event.js').href
)

const handler = async (m, { conn, command, usedPrefix, text, groupMetadata }) => {
  const chat = global.db.data.chats[m.chat]

  if (command === 'setgp') {
    return m.reply(
      '┏━━〔 ⚙️ *CONFIGURACION DE GRUPO* 〕━➣\n' +
      '┃\n' +
      '┃ ✶ *COMANDOS:*\n' +
      '┃\n' +
      '┃ ' + usedPrefix + 'setwelcome <texto>\n' +
      '┃   Configurar mensaje de bienvenida\n' +
      '┃\n' +
      '┃ ' + usedPrefix + 'setbye <texto>\n' +
      '┃   Configurar mensaje de despedida\n' +
      '┃\n' +
      '┃ ' + usedPrefix + 'testwelcome\n' +
      '┃   Probar la bienvenida\n' +
      '┃\n' +
      '┃ ' + usedPrefix + 'testbye\n' +
      '┃   Probar la despedida\n' +
      '┃\n' +
      '┃ ✶ *VARIABLES:*\n' +
      '┃\n' +
      '┃ {usuario} → Menciona al usuario\n' +
      '┃ {grupo}   → Nombre del grupo\n' +
      '┃ {desc}    → Descripcion del grupo\n' +
      '┃ {cantidad}→ Numero de miembros\n' +
      '┃\n' +
      '┃ ✶ *ACTIVAR/DESACTIVAR:*\n' +
      '┃ ' + usedPrefix + 'welcome enable\n' +
      '┃ ' + usedPrefix + 'welcome disable\n' +
      '┃\n' +
      '┗━━━━━━━━━━━━━━━━━━➣'
    )
  }

  if (command === 'setwelcome') {
    if (!text) {
      return m.reply(
        '┏━━〔 ❌ *ERROR* 〕━➣\n' +
        '┃\n' +
        '┃ Falta el mensaje de bienvenida\n' +
        '┃\n' +
        '┃ Ejemplo:\n' +
        '┃ ' + usedPrefix + 'setwelcome Hola {usuario}!\n' +
        '┃ Bienvenido a {grupo}\n' +
        '┃\n' +
        '┗━━━━━━━━━━━━━━━━━━➣'
      )
    }
    chat.sWelcome = text
    chat.welcome  = true
    return m.reply(
      '┏━━〔 ✅ *BIENVENIDA GUARDADA* 〕━➣\n' +
      '┃\n' +
      '┃ Mensaje:\n' +
      '┃ ' + text + '\n' +
      '┃\n' +
      '┃ Pruebalo con: ' + usedPrefix + 'testwelcome\n' +
      '┃\n' +
      '┗━━━━━━━━━━━━━━━━━━➣'
    )
  }

  if (command === 'setbye') {
    if (!text) {
      return m.reply(
        '┏━━〔 ❌ *ERROR* 〕━➣\n' +
        '┃\n' +
        '┃ Falta el mensaje de despedida\n' +
        '┃\n' +
        '┃ Ejemplo:\n' +
        '┃ ' + usedPrefix + 'setbye Adios {usuario}\n' +
        '┃\n' +
        '┗━━━━━━━━━━━━━━━━━━➣'
      )
    }
    chat.sBye    = text
    chat.welcome = true
    return m.reply(
      '┏━━〔 ✅ *DESPEDIDA GUARDADA* 〕━➣\n' +
      '┃\n' +
      '┃ Mensaje:\n' +
      '┃ ' + text + '\n' +
      '┃\n' +
      '┃ Pruebalo con: ' + usedPrefix + 'testbye\n' +
      '┃\n' +
      '┗━━━━━━━━━━━━━━━━━━➣'
    )
  }

  if (command === 'testwelcome') {
    await m.react('🔄')
    if (!chat.sWelcome || chat.sWelcome.trim() === '') {
      await m.reply('Usando diseño predeterminado. Configura con: ' + usedPrefix + 'setwelcome <texto>')
    }
    try {
      const grupoInfo = await conn.groupMetadata(m.chat).catch(() => groupMetadata)
      const { imageBuffer, caption, mentions } = await buildWelcome(conn, m.sender, grupoInfo, chat)
      await conn.sendMessage(m.chat, { image: imageBuffer, caption, mentions }, { quoted: m })
      await m.react('✅')
    } catch (error) {
      console.error('Error en testwelcome:', error)
      await m.reply('Error al generar la vista previa: ' + error.message)
      await m.react('❌')
    }
    return
  }

  if (command === 'testbye') {
    await m.react('🔄')
    if (!chat.sBye || chat.sBye.trim() === '') {
      await m.reply('Usando diseño predeterminado. Configura con: ' + usedPrefix + 'setbye <texto>')
    }
    try {
      const grupoInfo = await conn.groupMetadata(m.chat).catch(() => groupMetadata)
      const { imageBuffer, caption, mentions } = await buildBye(conn, m.sender, grupoInfo, chat)
      await conn.sendMessage(m.chat, { image: imageBuffer, caption, mentions }, { quoted: m })
      await m.react('✅')
    } catch (error) {
      console.error('Error en testbye:', error)
      await m.reply('Error al generar la vista previa: ' + error.message)
      await m.react('❌')
    }
    return
  }
}

handler.help    = ['setwelcome', 'setbye', 'testwelcome', 'testbye', 'setgp']
handler.tags    = ['group']
handler.command = ['setwelcome', 'setbye', 'testwelcome', 'testbye', 'setgp']
handler.admin    = true
handler.group    = true
handler.botAdmin = true

export default handler