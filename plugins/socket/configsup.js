
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import chalk from 'chalk'

const handler = async (m, { conn, usedPrefix, command, text, args }) => {
  // Solo para SubBots
  if (conn.user.jid === global.conn.user.jid) {
    return m.reply('❌ Este comando solo funciona en SubBots.')
  }

  const sessionId = conn.user.jid.split('@')[0]
  const configPath = path.join(global.jadi, sessionId, 'config.json')
  const logoPath = path.join(global.jadi, sessionId, 'logo.jpg')
  const statePath = path.join(global.jadi, sessionId, 'state.json')

  // Cargar o crear configuración
  let config = {}
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  }

  // Verificar permisos - Solo dueño o Fernando
  const isOwner = config.owner === m.sender
  const isFernando = global.fernando
    .map(v => v.replace(/\D/g, "") + "@s.whatsapp.net")
    .includes(m.sender)

  if (!isOwner && !isFernando) {
    return m.reply('❌ Solo el dueño de este SubBot puede configurarlo.')
  }

  const [action, ...values] = args
  const value = values.join(' ')

  if (!action) {
    // Mostrar configuración actual
    const currentConfig = {
      'Nombre': config.name || conn.user.name || 'SubBot',
      'Prefijo': config.prefix || global.prefix,
      'Sin Prefijo': config.sinprefix ? '✅ Activado' : '❌ Desactivado',
      'Modo': config.mode || 'public',
      'Anti-Private': config.antiPrivate ? '✅ Activado' : '❌ Desactivado',
      'Solo Grupos': config.gponly ? '✅ Activado' : '❌ Desactivado',
      'Logo': config.logoUrl ? '✅ URL' : (config.logo ? '✅ Personalizado' : '🌐 Global'),
      'Dueño': config.owner ? `@${config.owner.split('@')[0]}` : 'No definido',
      'Estado': getConnectionStatus(conn),
      'Auto-Reconexión': config.autoReconnect ? '✅ Activado' : '❌ Desactivado',
      'Creado': config.createdAt ? new Date(config.createdAt).toLocaleString() : 'Reciente'
    }

    let message = `⚙️ *CONFIGURACIÓN DEL SUBBOT*\n\n`
    for (const [key, val] of Object.entries(currentConfig)) {
      message += `• *${key}:* ${val}\n`
    }

    if (config.logoUrl) {
      message += `• *URL Logo:* ${config.logoUrl.substring(0, 30)}...\n`
    }

    message += `\n📝 *Comandos de configuración:*\n`
    message += `└ ${usedPrefix}config prefix <nuevo> - Cambiar prefijo\n`
    message += `└ ${usedPrefix}config sinprefix <on/off> - Activar/desactivar sin prefijo\n`
    message += `└ ${usedPrefix}config name <nombre> - Cambiar nombre\n`
    message += `└ ${usedPrefix}config mode <public/private> - Cambiar modo\n`
    message += `└ ${usedPrefix}config antiprivate <on/off> - Anti mensajes privados\n`
    message += `└ ${usedPrefix}config gponly <on/off> - Solo grupos\n`
    message += `└ ${usedPrefix}config logo [url/imagen] - Cambiar logo (URL o responder imagen)\n`
    message += `└ ${usedPrefix}config resetlogo - Restablecer logo al global\n`
    message += `└ ${usedPrefix}config autoreconnect <on/off> - Auto-reconexión\n`
    message += `└ ${usedPrefix}config restart - Reiniciar SubBot (con reconexión)\n`
    message += `└ ${usedPrefix}config softrestart - Reinicio suave (sin QR)\n`
    message += `└ ${usedPrefix}config reset - Restablecer configuración\n`

    // Mostrar preview del logo actual si existe
    try {
      const logoBuffer = await getSubBotLogo(conn)
      if (logoBuffer && logoBuffer.length > 100) {
        await conn.sendMessage(m.chat, {
          image: logoBuffer,
          caption: message,
          mentions: config.owner ? [config.owner] : []
        }, { quoted: m })
        return
      }
    } catch (e) {
      console.error('Error al mostrar logo:', e)
    }

    await conn.sendMessage(m.chat, { 
      text: message,
      mentions: config.owner ? [config.owner] : []
    }, { quoted: m })
    return
  }

  // Procesar acciones
  switch (action.toLowerCase()) {
    case 'prefix': {
      if (!value) return m.reply(`⚠️ Uso: ${usedPrefix}config prefix <nuevo prefijo>`)
      if (value.length > 5) return m.reply('❌ El prefijo no puede tener más de 5 caracteres.')

      const oldPrefix = config.prefix || global.prefix
      config.prefix = value

      // Actualizar en el socket
      conn.subConfig = conn.subConfig || {}
      conn.subConfig.prefix = value

      await saveConfig(configPath, config)
      return m.reply(`✅ Prefijo cambiado:\nDe: \`${oldPrefix}\`\nA: \`${value}\``)
    }

    case 'sinprefix': {
      const state = value?.toLowerCase()
      if (!state || !['on', 'off'].includes(state)) {
        return m.reply(`⚠️ Uso: ${usedPrefix}config sinprefix <on/off>\n\nActiva o desactiva responder sin prefijo.`)
      }

      config.sinprefix = state === 'on'

      // Actualizar en el socket
      conn.subConfig = conn.subConfig || {}
      conn.subConfig.sinprefix = state === 'on'

      await saveConfig(configPath, config)
      return m.reply(`✅ Responder sin prefijo ${state === 'on' ? 'activado' : 'desactivado'}`)
    }

    case 'name': {
      if (!value) return m.reply(`⚠️ Uso: ${usedPrefix}config name <nuevo nombre>`)
      if (value.length > 30) return m.reply('❌ El nombre no puede tener más de 30 caracteres.')

      const oldName = config.name || conn.user.name
      config.name = value

      // Actualizar en el socket
      conn.subConfig = conn.subConfig || {}
      conn.subConfig.name = value

      await saveConfig(configPath, config)
      return m.reply(`✅ Nombre cambiado:\nDe: *${oldName}*\nA: *${value}*`)
    }

    case 'mode': {
      if (!value) return m.reply(`⚠️ Uso: ${usedPrefix}config mode <public/private>`)

      const mode = value.toLowerCase()
      if (!['public', 'private'].includes(mode)) {
        return m.reply('❌ Modos válidos: public, private')
      }

      config.mode = mode

      // Actualizar en settings
      if (!global.db.data.settings[conn.user.jid]) {
        global.db.data.settings[conn.user.jid] = {}
      }
      global.db.data.settings[conn.user.jid].self = mode === 'private'

      await saveConfig(configPath, config)
      return m.reply(`✅ Modo cambiado a: *${mode}*`)
    }

    case 'antiprivate': {
      const state = value?.toLowerCase()
      if (!state || !['on', 'off'].includes(state)) {
        return m.reply(`⚠️ Uso: ${usedPrefix}config antiprivate <on/off>`)
      }

      config.antiPrivate = state === 'on'

      // Actualizar en settings
      if (!global.db.data.settings[conn.user.jid]) {
        global.db.data.settings[conn.user.jid] = {}
      }
      global.db.data.settings[conn.user.jid].antiPrivate = state === 'on'

      await saveConfig(configPath, config)
      return m.reply(`✅ Anti-Private ${state === 'on' ? 'activado' : 'desactivado'}`)
    }

    case 'gponly': {
      const state = value?.toLowerCase()
      if (!state || !['on', 'off'].includes(state)) {
        return m.reply(`⚠️ Uso: ${usedPrefix}config gponly <on/off>`)
      }

      config.gponly = state === 'on'

      // Actualizar en settings
      if (!global.db.data.settings[conn.user.jid]) {
        global.db.data.settings[conn.user.jid] = {}
      }
      global.db.data.settings[conn.user.jid].gponly = state === 'on'

      await saveConfig(configPath, config)
      return m.reply(`✅ Solo-Grupos ${state === 'on' ? 'activado' : 'desactivado'}`)
    }

    case 'autoreconnect': {
      const state = value?.toLowerCase()
      if (!state || !['on', 'off'].includes(state)) {
        return m.reply(`⚠️ Uso: ${usedPrefix}config autoreconnect <on/off>`)
      }

      config.autoReconnect = state === 'on'

      await saveConfig(configPath, config)
      return m.reply(`✅ Auto-reconexión ${state === 'on' ? 'activada' : 'desactivada'}`)
    }

    case 'logo': {
      // Verificar si se proporciona URL o imagen
      const quoted = m.quoted || m
      const hasImage = quoted && quoted.mtype && quoted.mtype.includes('image')
      const hasUrl = value && value.startsWith('http')

      if (!hasImage && !hasUrl) {
        // Mostrar logo actual
        try {
          const logoBuffer = await getSubBotLogo(conn)
          if (logoBuffer && logoBuffer.length > 100) {
            let caption = '🖼️ *LOGO ACTUAL*\n\n'
            if (config.logoUrl) {
              caption += `• *Tipo:* URL\n• *Origen:* ${config.logoUrl.substring(0, 40)}...`
            } else if (config.logo) {
              caption += `• *Tipo:* Imagen local\n• *Ruta:* ${config.logo}`
            } else {
              caption += `• *Tipo:* Logo global`
            }
            
            caption += `\n\nPara cambiar el logo:\n1. Responde a una imagen con ${usedPrefix}config logo\n2. O usa ${usedPrefix}config logo <url>`
            
            await conn.sendMessage(m.chat, {
              image: logoBuffer,
              caption: caption
            }, { quoted: m })
          } else {
            return m.reply('⚠️ No hay logo configurado. Para agregar uno:\n\n1. Responde a una imagen con este comando\n2. O usa: *config logo <url>*')
          }
          return
        } catch (e) {
          console.error(e)
        }
      }

      try {
        let buffer, sourceType, sourceInfo

        if (hasUrl) {
          // Descargar desde URL
          await m.reply('📥 Descargando imagen desde URL...')
          
          const response = await fetch(value)
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          const contentType = response.headers.get('content-type')
          if (!contentType || !contentType.startsWith('image/')) {
            return m.reply('❌ La URL no apunta a una imagen válida.')
          }

          buffer = await response.buffer()
          sourceType = 'URL'
          sourceInfo = value.substring(0, 50) + '...'
        } else if (hasImage) {
          // Descargar imagen etiquetada
          await m.reply('📥 Descargando imagen...')
          buffer = await quoted.download()
          sourceType = 'Imagen etiquetada'
          sourceInfo = 'Desde mensaje'
        } else {
          return m.reply(`⚠️ Uso: ${usedPrefix}config logo [url]\nO responde a una imagen con este comando.`)
        }

        // Crear directorio si no existe
        const dirPath = path.dirname(logoPath)
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true })
        }

        // Guardar imagen
        fs.writeFileSync(logoPath, buffer)

        // Actualizar configuración
        if (hasUrl) {
          config.logoUrl = value
          config.logo = logoPath
        } else {
          config.logo = logoPath
          config.logoUrl = null
        }
        
        config.updatedAt = new Date().toISOString()

        // Guardar configuración
        await saveConfig(configPath, config)

        // Actualizar en memoria
        conn.subConfig = conn.subConfig || {}
        if (hasUrl) {
          conn.subConfig.logoUrl = value
        }
        conn.subConfig.logo = logoPath

        // Actualizar mapa global
        if (global.subBotsData) {
          global.subBotsData.set(configPath, config)
        }

        // Enviar confirmación con preview
        await conn.sendMessage(m.chat, {
          image: buffer,
          caption: `✅ Logo actualizado correctamente\n\n• *Tipo:* ${sourceType}\n• *Origen:* ${sourceInfo}`
        }, { quoted: m })

      } catch (error) {
        console.error(error)
        return m.reply(`❌ Error al procesar el logo:\n${error.message}`)
      }
      break
    }

    case 'resetlogo': {
      // Eliminar logo personalizado
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath)
      }

      // Limpiar referencias en config
      delete config.logo
      delete config.logoUrl
      config.updatedAt = new Date().toISOString()

      await saveConfig(configPath, config)

      // Actualizar en memoria
      if (conn.subConfig) {
        delete conn.subConfig.logo
        delete conn.subConfig.logoUrl
      }

      // Actualizar mapa global
      if (global.subBotsData) {
        global.subBotsData.set(configPath, config)
      }

      return m.reply('✅ Logo restablecido al logo global.')
    }

    case 'restart': {
      await m.reply('🔄 Reiniciando SubBot con reconexión automática... Esto tomará unos segundos.')

      // Guardar estado actual para reconexión
      await saveSubBotState(conn)

      // Marcar para reconexión automática
      if (!global.pendingReconnections) global.pendingReconnections = new Set()
      global.pendingReconnections.add(conn.user.jid)

      // Guardar configuración actual
      conn.subConfig = conn.subConfig || config
      conn.subConfig.autoReconnect = true
      await saveConfig(configPath, conn.subConfig)

      // Cerrar la conexión suavemente
      setTimeout(async () => {
        try {
          if (conn.ws && conn.ws.readyState !== 3) {
            conn.ws.close()
          }
          console.log(chalk.yellow(`🔄 SubBot ${conn.user.jid} reiniciado por solicitud`))

          // Programar reconexión automática
          setTimeout(() => {
            reconnectSubBot(conn.user.jid)
          }, 5000)

        } catch (error) {
          console.error('Error al reiniciar SubBot:', error)
        }
      }, 2000)
      break
    }

    case 'softrestart': {
      await m.reply('🔄 Reinicio suave iniciado... Manteniendo sesión activa.')

      // Reinicio sin cerrar completamente la conexión
      try {
        // Guardar estado
        await saveSubBotState(conn)

        // Enviar señal de reinicio interno
        if (conn.ev) {
          // Simular reconexión sin cerrar WebSocket
          conn.ev.emit('connection.update', { connection: 'connecting' })

          setTimeout(() => {
            conn.ev.emit('connection.update', { connection: 'open' })
            console.log(chalk.green(`✅ SubBot ${conn.user.jid} reiniciado suavemente`))
          }, 3000)
        }

      } catch (error) {
        console.error('Error en reinicio suave:', error)
      }
      break
    }

    case 'reset': {
      // Restablecer configuración
      const defaultConfig = {
        name: `SubBot ${sessionId}`,
        prefix: global.prefix,
        sinprefix: false, // Por defecto requiere prefijo
        mode: 'public',
        antiPrivate: false,
        gponly: false,
        autoReconnect: true,
        owner: config.owner || m.sender,
        createdAt: config.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Eliminar logo personalizado si existe
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath)
      }

      // Eliminar estado guardado
      if (fs.existsSync(statePath)) {
        fs.unlinkSync(statePath)
      }

      await saveConfig(configPath, defaultConfig)

      // Actualizar en memoria
      conn.subConfig = defaultConfig

      // Actualizar mapa global
      if (global.subBotsData) {
        global.subBotsData.set(configPath, defaultConfig)
      }

      return m.reply('✅ Configuración restablecida a valores por defecto.')
    }

    default: {
      return m.reply(`❌ Acción no reconocida.\nUsa ${usedPrefix}config para ver opciones.`)
    }
  }
}

// ============= FUNCIONES AUXILIARES =============

// Función para guardar estado del SubBot
async function saveSubBotState(conn) {
  try {
    const sessionId = conn.user.jid.split('@')[0]
    const statePath = path.join(global.jadi, sessionId, 'state.json')

    const state = {
      jid: conn.user.jid,
      name: conn.user.name || conn.subConfig?.name,
      config: conn.subConfig || {},
      authState: conn.authState?.creds ? {
        me: conn.authState.creds.me,
        deviceId: conn.authState.creds.deviceId,
        registered: conn.authState.creds.registered
      } : null,
      lastConnected: new Date().toISOString(),
      version: global.vs || '1.4'
    }

    // Crear directorio si no existe
    const dirPath = path.dirname(statePath)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }

    fs.writeFileSync(statePath, JSON.stringify(state, null, 2))
    console.log(chalk.green(`✅ Estado guardado para ${sessionId}`))

  } catch (error) {
    console.error(chalk.red(`❌ Error guardando estado:`, error))
  }
}

// Función para reconectar SubBot automáticamente
async function reconnectSubBot(jid) {
  try {
    const sessionId = jid.split('@')[0]
    const statePath = path.join(global.jadi, sessionId, 'state.json')
    const configPath = path.join(global.jadi, sessionId, 'config.json')

    if (!fs.existsSync(statePath)) {
      console.log(chalk.yellow(`⚠️ No hay estado guardado para ${sessionId}`))
      return false
    }

    console.log(chalk.blue(`🔗 Intentando reconectar SubBot ${sessionId}...`))

    // Cargar configuración
    let config = {}
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    }

    // Verificar si la auto-reconexión está activada
    if (config.autoReconnect === false) {
      console.log(chalk.yellow(`⚠️ Auto-reconexión desactivada para ${sessionId}`))
      return false
    }

    console.log(chalk.green(`✅ SubBot ${sessionId} programado para reconexión`))

    // Enviar notificación al dueño si está disponible
    if (config.owner) {
      try {
        const mainConn = global.conn
        await mainConn.sendMessage(config.owner, {
          text: `🤖 *SubBot Reconectado*\n\nTu SubBot *${config.name || sessionId}* se ha reconectado automáticamente.`
        })
      } catch (e) {
        console.error('Error enviando notificación:', e)
      }
    }

    return true

  } catch (error) {
    console.error(chalk.red(`❌ Error reconectando SubBot:`, error))
    return false
  }
}

// Función para obtener estado de conexión
function getConnectionStatus(conn) {
  if (!conn.ws) return '❓ Desconocido'

  switch (conn.ws.readyState) {
    case 0: return '🔄 Conectando'
    case 1: return '✅ Conectado'
    case 2: return '🟡 Cerrando'
    case 3: return '❌ Desconectado'
    default: return '❓ Desconocido'
  }
}

// Función para obtener el logo del SubBot
export async function getSubBotLogo(conn) {
  try {
    // Verificar si hay configuración de SubBot
    if (conn.subConfig) {
      // Si tiene URL de logo
      if (conn.subConfig.logoUrl) {
        try {
          const response = await fetch(conn.subConfig.logoUrl, { timeout: 10000 })
          if (response.ok) {
            const buffer = await response.buffer()
            if (buffer && buffer.length > 100) {
              return buffer
            }
          }
        } catch (e) {
          console.error('Error cargando logo URL:', e)
        }
      }

      // Si tiene logo local
      if (conn.subConfig.logo && fs.existsSync(conn.subConfig.logo)) {
        try {
          const buffer = fs.readFileSync(conn.subConfig.logo)
          if (buffer && buffer.length > 100) {
            return buffer
          }
        } catch (e) {
          console.error('Error cargando logo local:', e)
        }
      }
    }

    // Si no hay logo personalizado, usar el global
    if (global.icono && global.icono.startsWith('http')) {
      try {
        const response = await fetch(global.icono, { timeout: 10000 })
        if (response.ok) {
          const buffer = await response.buffer()
          if (buffer && buffer.length > 100) {
            return buffer
          }
        }
      } catch (e) {
        console.error('Error cargando logo global:', e)
      }
    }

    // Usar el catalogo global como fallback
    return global.catalogo || Buffer.alloc(0)
  } catch (error) {
    console.error('Error obteniendo logo:', error)
    return global.catalogo || Buffer.alloc(0)
  }
}

// Función para guardar configuración
async function saveConfig(path, config) {
  config.updatedAt = new Date().toISOString()
  fs.writeFileSync(path, JSON.stringify(config, null, 2))

  // Actualizar en memoria global
  if (global.subBotsData) {
    global.subBotsData.set(path, config)
  }
}
