import path from 'path'
import fs from 'fs'

// Configuración por defecto
const defaultConfig = {
  name: null,
  prefix: null,
  sinprefix: false,
  mode: 'public',
  antiPrivate: false,
  gponly: false,
  antiSpam: true,
  cooldown: 3000,
  language: 'es',
  autoRead: false,
  typingEffect: false,
  reactions: true,
  logo: null,
  logoUrl: null
}

const handler = async (m, { conn, command, usedPrefix, text, args }) => {
  // ========== VERIFICACIÓN DE PERMISOS ==========
  const isSubBot = conn.user?.jid !== global.conn?.user?.jid

  // Verificar si es el owner del SubBot
  const subBotData = global.activeSubBots?.get(conn.user?.jid)
  const isSubBotOwner = subBotData?.socket?.subConfig?.owner === m.sender

  // Verificar si es Fernando (global.fernando de settings.js)
  const isFernando = global.fernando
    ?.map(v => v.replace(/\D/g, "") + "@s.whatsapp.net")
    .includes(m.sender)

  // Solo SubBot owner o Fernando
  if (!isSubBotOwner && !isFernando) {
    return m.reply(`❌ *Solo el owner de este SubBot puede usar este comando.*`)
  }

  // Solo funciona en SubBots
  if (!isSubBot) {
    return m.reply(`❌ *Este comando solo está disponible para SubBots.*`)
  }

  try {
    const userId = conn.user.jid.split('@')[0]
    const sessionPath = path.join(`./${global.jadi || 'Sessions/SubBot'}/`, userId)
    const configPath = path.join(sessionPath, 'config.json')

    // Cargar config
    let currentConfig = {}
    try {
      if (fs.existsSync(configPath)) {
        currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      }
    } catch (e) {
      console.error('Error leyendo config:', e)
    }

    const displayConfig = { ...defaultConfig, ...currentConfig }

    // Función para guardar
    const saveConfig = (newConfig) => {
      const configToSave = {
        ...currentConfig,
        ...newConfig,
        updatedAt: new Date().toISOString(),
        owner: currentConfig.owner || m.sender,
        createdAt: currentConfig.createdAt || new Date().toISOString(),
        jid: currentConfig.jid || conn.user.jid
      }

      if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath, { recursive: true })
      }

      fs.writeFileSync(configPath, JSON.stringify(configToSave, null, 2))

      if (conn.subConfig) {
        Object.assign(conn.subConfig, configToSave)
      }

      if (global.activeSubBots.has(conn.user.jid)) {
        const subBotEntry = global.activeSubBots.get(conn.user.jid)
        if (subBotEntry.socket) {
          subBotEntry.socket.subConfig = configToSave
        }
      }

      return configToSave
    }

    // Parsear booleano
    const parseBoolean = (val) => {
      if (!val) return null
      const trues = ['on', 'enable', 'true', '1', 'si', 'sí', 'activar', 'yes']
      const falses = ['off', 'disable', 'false', '0', 'no', 'desactivar']
      if (trues.includes(val.toLowerCase())) return true
      if (falses.includes(val.toLowerCase())) return false
      return null
    }

    // ========== MANEJO DE COMANDOS ==========
    switch (command) {

      // ============= CONFIG GENERAL =============
      case 'config': {
        if (!args[0]) {
          return m.reply(`╭─〔 ⚙️ *CONFIG SUBBOT* 〕─╮
│
│ 📛 *Nombre:* ${displayConfig.name || 'Por defecto'}
│ 🔣 *Prefijo:* ${displayConfig.prefix || 'Global'}
│ 🔇 *Sin Prefijo:* ${displayConfig.sinprefix ? '✅' : '❌'}
│ 🎭 *Modo:* ${displayConfig.mode}
│ 🚫 *Anti-Privado:* ${displayConfig.antiPrivate ? '✅' : '❌'}
│ 🛡️ *Anti-Spam:* ${displayConfig.antiSpam ? '✅' : '❌'}
│ ⏱️ *Cooldown:* ${displayConfig.cooldown}ms
│ 🖼️ *Logo:* ${displayConfig.logo ? '📁 Local' : displayConfig.logoUrl ? '🔗 URL' : '❌ Por defecto'}
│
├─ *COMANDOS:*
│ • ${usedPrefix}config nombre <texto>
│ • ${usedPrefix}config prefix <símbolo>
│ • ${usedPrefix}config sinprefix <on/off>
│ • ${usedPrefix}config modo <public/private>
│ • ${usedPrefix}config logo <ruta/url/none>
│ • ${usedPrefix}antiprivado <on/off>
│ • ${usedPrefix}antispam <on/off>
│ • ${usedPrefix}config cooldown <ms>
│ • ${usedPrefix}config reset
╰───────────────────`)
        }

        const action = args[0]?.toLowerCase()
        const value = args.slice(1).join(' ').trim()

        switch (action) {
          case 'nombre': {
            if (!value) return m.reply(`❌ Uso: ${usedPrefix}config nombre <texto>`)
            const newName = value.slice(0, 25)
            saveConfig({ name: newName })
            return m.reply(`✅ *Nombre:* ${newName}`)
          }

          case 'prefix': case 'prefijo': {
            if (!value) return m.reply(`❌ Uso: ${usedPrefix}config prefix <símbolo|reset>`)
            if (['reset', 'default', 'none'].includes(value.toLowerCase())) {
              saveConfig({ prefix: null })
              return m.reply(`✅ *Prefijo reiniciado al global*`)
            }
            const newPrefix = value.charAt(0)
            if (/[a-zA-Z0-9]/.test(newPrefix)) {
              return m.reply(`⚠️ No uses letras o números. Ejemplos: . ! # /`)
            }
            saveConfig({ prefix: newPrefix })
            return m.reply(`✅ *Prefijo:* \`${newPrefix}\``)
          }

          case 'sinprefix': case 'sinprefijo': {
            const bool = parseBoolean(value)
            if (bool === null) {
              return m.reply(`❌ Uso: ${usedPrefix}config sinprefix <on/off>`)
            }
            saveConfig({ sinprefix: bool })
            return m.reply(`${bool ? '✅' : '❌'} *Sin Prefijo* ${bool ? 'ACTIVADO' : 'DESACTIVADO'}\n\n${bool ? '💡 Ahora puedes usar comandos sin prefijo.\n⚠️ Ejemplo: escribe "menu" en lugar de ".menu"' : '💡 Se requiere prefijo nuevamente.'}`)
          }

          case 'modo': {
            if (!['public', 'private'].includes(value?.toLowerCase())) {
              return m.reply(`❌ Uso: ${usedPrefix}config modo <public/private>`)
            }
            saveConfig({ mode: value.toLowerCase() })
            return m.reply(`✅ *Modo:* ${value.toLowerCase()}`)
          }

          case 'logo': case 'icono': case 'foto': {
            if (!value || ['none', 'default', 'remove', 'quitar', 'eliminar'].includes(value.toLowerCase())) {
              saveConfig({ logo: null, logoUrl: null })
              return m.reply(`✅ *Logo reiniciado*\n🖼️ Se usará el logo global por defecto.`)
            }

            const isUrl = value.startsWith('http://') || value.startsWith('https://')

            if (isUrl) {
              saveConfig({ logo: null, logoUrl: value })
              return m.reply(`✅ *Logo URL actualizado*\n🔗 ${value.slice(0, 60)}${value.length > 60 ? '...' : ''}`)
            } else {
              const logoPath = path.resolve(value)
              if (!fs.existsSync(logoPath)) {
                return m.reply(`❌ *Archivo no encontrado:* ${value}\n\n💡 Opciones:\n1. Ruta: ./media/logo.jpg\n2. URL: https://ejemplo.com/logo.jpg\n3. "none" para quitar`)
              }

              const ext = path.extname(logoPath).toLowerCase()
              if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                return m.reply(`⚠️ *Formato no válido:* ${ext}\n✅ Usa: .jpg .jpeg .png .webp`)
              }

              saveConfig({ logo: value, logoUrl: null })
              return m.reply(`✅ *Logo local actualizado*\n📁 ${value}\n📏 ${(fs.statSync(logoPath).size / 1024).toFixed(2)} KB`)
            }
          }

          case 'cooldown': case 'cd': {
            const ms = parseInt(value)
            if (isNaN(ms) || ms < 0 || ms > 60000) {
              return m.reply(`❌ Uso: ${usedPrefix}config cooldown <0-60000>`)
            }
            saveConfig({ cooldown: ms })
            return m.reply(`✅ *Cooldown:* ${ms}ms`)
          }

          case 'reset': {
            const confirm = args[1]?.toLowerCase()
            if (confirm !== 'confirmar' && confirm !== 'si') {
              return m.reply(`⚠️ ¿Reiniciar todo?\n✅ Confirma: ${usedPrefix}config reset confirmar`)
            }
            const essentialData = {
              owner: currentConfig.owner || m.sender,
              createdAt: currentConfig.createdAt || new Date().toISOString(),
              jid: currentConfig.jid || conn.user.jid,
              ...defaultConfig
            }
            fs.writeFileSync(configPath, JSON.stringify(essentialData, null, 2))
            if (conn.subConfig) Object.assign(conn.subConfig, essentialData)
            return m.reply(`🔄 *Configuración reiniciada*`)
          }

          default:
            return m.reply(`❌ Opción desconocida: ${action}`)
        }
      }

      // ============= ANTI PRIVADO =============
      case 'antiprivado': case 'antiprivate': {
        const bool = parseBoolean(text || args[0])

        if (bool === null) {
          return m.reply(`🚫 *Anti-Privado:* ${displayConfig.antiPrivate ? '✅ ACTIVADO' : '❌ DESACTIVADO'}

📖 *Función:* Bloquea mensajes en privado (excepto el owner)

✅ *Activar:* ${usedPrefix}antiprivado on
❌ *Desactivar:* ${usedPrefix}antiprivado off`)
        }

        saveConfig({ antiPrivate: bool })

        return m.reply(`${bool ? '✅' : '❌'} *Anti-Privado* ${bool ? 'ACTIVADO' : 'DESACTIVADO'}

${bool ? '🔒 Ahora solo el owner puede escribir al privado.\n🚫 Otros usuarios serán ignorados.' : '🔓 Todos pueden escribir al privado.'}`)
      }

      // ============= ANTI SPAM =============
      case 'antispam': case 'antiflood': {
        const bool = parseBoolean(text || args[0])

        if (bool === null) {
          return m.reply(`🛡️ *Anti-Spam:* ${displayConfig.antiSpam ? '✅ ACTIVADO' : '❌ DESACTIVADO'}

📖 *Función:* Protege contra flood de comandos
⏱️ *Cooldown actual:* ${displayConfig.cooldown}ms

✅ *Activar:* ${usedPrefix}antispam on
❌ *Desactivar:* ${usedPrefix}antispam off

💡 *Cambiar cooldown:* ${usedPrefix}config cooldown <ms>`)
        }

        saveConfig({ antiSpam: bool })

        return m.reply(`${bool ? '✅' : '❌'} *Anti-Spam* ${bool ? 'ACTIVADO' : 'DESACTIVADO'}

${bool ? `🛡️ Protección contra spam activada.\n⏱️ Cooldown: ${displayConfig.cooldown}ms` : '⚠️ Sin protección contra spam.'}`)
      }

      default:
        return m.reply(`❌ Comando no reconocido`)
    }

  } catch (error) {
    console.error('Error:', error)
    return m.reply(`❌ Error: ${error.message}`)
  }
}

handler.help = [
  'config - Configuración general',
  'antiprivado <on/off> - Bloquear mensajes privados',
  'antispam <on/off> - Protección contra spam'
]
handler.tags = ['serbot', 'owner']
handler.command = ['config', 'antiprivado', 'antiprivate', 'antispam', 'antiflood']
handler.group = false      // Funciona en grupos
handler.private = false    // Funciona en privado

export default handler
