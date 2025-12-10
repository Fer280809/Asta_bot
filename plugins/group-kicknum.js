// Sistema para iniciar/parar el comando kicknum
global.kicknumRunning = global.kicknumRunning || {}

const handler = async (m, { conn, args, participants, usedPrefix, command, isBotAdmin }) => {
  try {
    const bot = global.db.data.settings[conn.user.jid] || {}

    // Comando para detener
    if (command === 'stopkicknum') {
      if (!global.kicknumRunning[m.chat]) 
        return m.reply('⚠️ No hay ningún proceso de kicknum en ejecución.')
      global.kicknumRunning[m.chat] = false
      return m.reply('🛑 Proceso de eliminación detenido correctamente.')
    }

    // Validaciones para el comando kicknum y listnum
    if (!args[0]) return conn.reply(m.chat, `❀ Ingrese algún prefijo de un país.\nEjemplo: ${usedPrefix + command} 212`, m)
    if (isNaN(args[0])) return conn.reply(m.chat, `ꕥ Prefijo inválido. Solo números.`, m)

    const lol = args[0].replace(/[+]/g, '')
    const ps = participants.map(u => u.id).filter(v => v !== conn.user.jid && v.startsWith(lol))

    if (ps.length === 0) return m.reply(`ꕥ No hay ningún número con el prefijo +${lol} en este grupo.`)

    const numeros = ps.map(v => '⭔ @' + v.replace(/@.+/, ''))
    const delay = ms => new Promise(res => setTimeout(res, ms))

    switch (command) {
      case 'listanum':
      case 'listnum':
        return conn.reply(m.chat, `❀ Lista de números con el prefijo +${lol}:\n\n${numeros.join('\n')}`, m, { mentions: ps })

      case 'kicknum': {
        if (!isBotAdmin) return m.reply('⚠️ El bot necesita ser administrador para usar este comando.')
        if (!bot.restrict) return m.reply('⚠️ El modo restricción está desactivado en la configuración.')

        if (global.kicknumRunning[m.chat]) 
          return m.reply('⚠️ Ya hay un proceso de eliminación activo en este grupo.\nUsa *stopkicknum* para detenerlo.')

        global.kicknumRunning[m.chat] = true
        m.reply(`🚨 Iniciando eliminación de usuarios con prefijo +${lol}...\nUsa *${usedPrefix}stopkicknum* para detener el proceso.`)

        for (const user of ps) {
          if (!global.kicknumRunning[m.chat]) {
            m.reply('🛑 Proceso detenido por el administrador.')
            break
          }

          try {
            await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
            await delay(3000) // Espera 3s entre expulsiones
          } catch (err) {
            console.error(err)
          }
        }

        global.kicknumRunning[m.chat] = false
        m.reply('✅ Proceso finalizado.')
        break
      }
    }

  } catch (e) {
    console.error(e)
    m.reply(`⚠️ Error: ${e.message}`)
  }
}

// Definición de comandos
handler.command = ['kicknum', 'listnum', 'listanum', 'stopkicknum']
handler.group = true
handler.botAdmin = true
handler.admin = true
handler.fail = null

export default handler
