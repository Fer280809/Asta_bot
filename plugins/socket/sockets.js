import path from 'path'
import fs from 'fs'

// Configuración por defecto para SubBots (sincronizada con settings.js)
const defaultConfig = {
  name: null,           // Nombre personalizado
  prefix: null,         // null = usar global.prefix
  sinprefix: false,     // Modo sin prefijo
  mode: 'public',       // public o private
  antiPrivate: false,   // Anti mensajes privados
  gponly: false,        // Solo grupos
  logo: null,           // Ruta logo local
  logoUrl: null,        // URL logo
  allowedGroups: [],    // Grupos permitidos (modo private)
  blockedGroups: [],    // Grupos bloqueados (modo public)
  welcomeStyle: 'modern', // modern, classic, neon
  goodbyeStyle: 'modern',
  language: 'es',       // es, en, pt
  autoRead: false,      // Leer mensajes automáticamente
  typingEffect: false,  // Efecto escribiendo
  antiSpam: true,       // Anti spam
  cooldown: 3000,       // Cooldown comandos (ms)
  bio: null,            // Bio personalizada
  reactions: true,      // Reacciones automáticas
  autoStatus: false,    // Ver estados automáticamente
  downloadMedia: true   // Auto-descargar media
}

const handler = async (m, { conn, command, usedPrefix, text, args }) => {
  // ========== VERIFICACIÓN DE PERMISOS (Solo Fernando y Owner del SubBot) ==========
  const isSubBot = conn.user?.jid !== global.conn?.user?.jid
  
  // Verificar si es el owner del SubBot (quien lo vinculó)
  const subBotData = global.activeSubBots?.get(conn.user?.jid)
  const isSubBotOwner = subBotData?.socket?.subConfig?.owner === m.sender
  
  // Verificar si es Fernando (global owner hardcoded de settings.js)
  const isFernando = global.fernando
    ?.map(v => v.replace(/\D/g, "") + "@s.whatsapp.net")
    .includes(m.sender)

  // Solo permitir: Owner del SubBot o Fernando
  if (!isSubBotOwner && !isFernando) {
    return m.reply(`❌ *Solo el owner de este SubBot puede usar este comando.*\n\n👤 Tu JID: @${m.sender.split('@')[0]}\n🔑 Owner registrado: @${(subBotData?.socket?.subConfig?.owner || 'desconocido').split('@')[0]}`, null, {
      mentions: [m.sender, subBotData?.socket?.subConfig?.owner].filter(Boolean)
    })
  }

  // Solo funciona en SubBots
  if (!isSubBot) {
    return m.reply(`❌ *Este comando solo está disponible para SubBots.*\n\n💡 Usa los comandos de configuración global para el bot principal.`)
  }

  try {
    // Obtener ruta de configuración (sincronizada con serbot.js)
    const userId = conn.user.jid.split('@')[0]
    const sessionPath = path.join(`./${global.jadi || 'Sessions/SubBot'}/`, userId)
    const configPath = path.join(sessionPath, 'config.json')
    
    // Cargar configuración actual
    let currentConfig = {}
    try {
      if (fs.existsSync(configPath)) {
        currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      }
    } catch (e) {
      console.error('Error leyendo config:', e)
    }

    // Merge con defaults
    const displayConfig = { ...defaultConfig, ...currentConfig }

    // ========== SIN ARGUMENTOS: MOSTRAR MENÚ ==========
    if (!text && !args[0]) {
      const statusIcons = (status) => status ? '✅' : '❌'
      
      const configText = `╭─〔 ⚙️ *CONFIGURACIÓN SUBBOT* 〕─╮
│
│  🤖 *Bot:* ${conn.user?.name || 'SubBot'}
│  📱 *Número:* ${userId}
│  👤 *Owner:* @${(subBotData?.socket?.subConfig?.owner || m.sender).split('@')[0]}
│  🕐 *Creado:* ${new Date(currentConfig.createdAt || Date.now()).toLocaleDateString()}
│
├─═⊰ 📝 *CONFIGURACIÓN ACTUAL*
│
│  📛 *Nombre:* ${displayConfig.name || 'Por defecto'}
│  🔣 *Prefijo:* ${displayConfig.prefix || `Global (${global.prefix?.toString().replace(/\\/g, '').replace(/^\^/,'').replace(/\?$/,'') || '.'})`}
│  🎭 *Modo:* ${displayConfig.mode === 'private' ? '🔐 Privado' : '🔓 Público'}
│  🔇 *Sin Prefijo:* ${statusIcons(displayConfig.sinprefix)}
│  🚫 *Anti-Privado:* ${statusIcons(displayConfig.antiPrivate)}
│  👥 *Solo Grupos:* ${statusIcons(displayConfig.gponly)}
│  🎨 *Estilo:* ${displayConfig.welcomeStyle}
│  🖼️ *Logo:* ${displayConfig.logo ? '📁 Local' : displayConfig.logoUrl ? '🔗 URL' : '❌ Por defecto'}
│  🌐 *Idioma:* ${displayConfig.language.toUpperCase()}
│  ⚡ *Auto-Read:* ${statusIcons(displayConfig.autoRead)}
│  ✍️ *Typing:* ${statusIcons(displayConfig.typingEffect)}
│  🛡️ *Anti-Spam:* ${statusIcons(displayConfig.antiSpam)}
│  ⏱️ *Cooldown:* ${displayConfig.cooldown}ms
│  👁️ *Auto-Status:* ${statusIcons(displayConfig.autoStatus)}
│  🎭 *Reacciones:* ${statusIcons(displayConfig.reactions)}
│
├─═⊰ 🎮 *COMANDOS*
│
│  *${usedPrefix}config nombre <texto>*
│  *${usedPrefix}config prefix <símbolo|reset>*
│  *${usedPrefix}config modo <public/private>*
│  *${usedPrefix}config sinprefix <on/off>*
│  *${usedPrefix}config antiprivado <on/off>*
│  *${usedPrefix}config sologrupos <on/off>*
│  *${usedPrefix}config estilo <modern/classic/neon>*
│  *${usedPrefix}config logo <ruta/url/none>*
│  *${usedPrefix}config idioma <es/en/pt>*
│  *${usedPrefix}config autoread <on/off>*
│  *${usedPrefix}config typing <on/off>*
│  *${usedPrefix}config antispam <on/off>*
│  *${usedPrefix}config cooldown <ms>*
│  *${usedPrefix}config allowgroup <jid>*
│  *${usedPrefix}config blockgroup <jid>*
│
├─═⊰ 🔄 *GESTIÓN*
│
│  *${usedPrefix}config reset* - Reiniciar todo
│  *${usedPrefix}config reload* - Recargar desde disco
│  *${usedPrefix}config view* - Ver JSON completo
│
╰────────────────────────╯

💡 *Ejemplos:*
• ${usedPrefix}config nombre AstaBot Pro
• ${usedPrefix}config prefix !
• ${usedPrefix}config modo private
• ${usedPrefix}config reset`

      return await conn.sendMessage(m.chat, {
        text: configText,
        mentions: [m.sender, subBotData?.socket?.subConfig?.owner].filter(Boolean)
      }, { quoted: m })
    }

    // ========== PROCESAR COMANDOS ==========
    const action = args[0]?.toLowerCase()
    const value = args.slice(1).join(' ').trim()

    // Función auxiliar para booleanos
    const parseBoolean = (val) => {
      const trues = ['on', 'enable', 'true', '1', 'si', 'sí', 'activar', 'yes']
      const falses = ['off', 'disable', 'false', '0', 'no', 'desactivar']
      if (trues.includes(val.toLowerCase())) return true
      if (falses.includes(val.toLowerCase())) return false
      return null
    }

    // Función para guardar config
    const saveConfig = (newConfig) => {
      const configToSave = {
        ...currentConfig,
        ...newConfig,
        updatedAt: new Date().toISOString(),
        owner: currentConfig.owner || m.sender,
        createdAt: currentConfig.createdAt || new Date().toISOString(),
        jid: currentConfig.jid || conn.user.jid
      }
      
      // Asegurar que existe el directorio
      if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath, { recursive: true })
      }
      
      fs.writeFileSync(configPath, JSON.stringify(configToSave, null, 2))
      
      // Actualizar en memoria inmediatamente
      if (conn.subConfig) {
        Object.assign(conn.subConfig, configToSave)
      }
      
      // Actualizar también en activeSubBots
      if (global.activeSubBots.has(conn.user.jid)) {
        const subBotEntry = global.activeSubBots.get(conn.user.jid)
        if (subBotEntry.socket) {
          subBotEntry.socket.subConfig = configToSave
        }
      }
      
      return configToSave
    }

    switch (action) {
      // ========== NOMBRE ==========
      case 'nombre': case 'name': case 'botname': {
        if (!value) return m.reply(`❌ *Uso:* ${usedPrefix}config nombre <texto>\n\n📝 Ejemplo: ${usedPrefix}config nombre AstaBot Pro`)
        
        const newName = value.slice(0, 25)
        saveConfig({ name: newName })
        
        return m.reply(`✅ *Nombre actualizado:*\n📛 ${newName}\n\n🔄 El cambio se aplicará inmediatamente en el menú.`)
      }

      // ========== PREFIJO ==========
      case 'prefix': case 'prefijo': {
        if (!value) {
          const currentPrefix = displayConfig.prefix || global.prefix?.toString().replace(/\\/g, '').replace(/^\^/,'').replace(/\?$/,'') || '.'
          return m.reply(`🔣 *Prefijo actual:* \`${currentPrefix}\`\n\n❌ *Uso:* ${usedPrefix}config prefix <símbolo>\n📝 Ejemplos:\n• ${usedPrefix}config prefix .\n• ${usedPrefix}config prefix !\n• ${usedPrefix}config prefix #\n• ${usedPrefix}config prefix reset (usar global)`)
        }
        
        if (['reset', 'default', 'global', 'none'].includes(value.toLowerCase())) {
          saveConfig({ prefix: null })
          return m.reply(`✅ *Prefijo reiniciado al global:* \`${global.prefix?.toString().replace(/\\/g, '').replace(/^\^/,'').replace(/\?$/,'') || '.'}\``)
        }
        
        const newPrefix = value.charAt(0)
        // Validar que no sea alfanumérico
        if (/[a-zA-Z0-9]/.test(newPrefix)) {
          return m.reply(`⚠️ *Prefijo inválido*\n\nNo puedes usar letras o números como prefijo.\n\n✅ Ejemplos válidos: . ! # / * $ % &`)
        }
        
        saveConfig({ prefix: newPrefix })
        return m.reply(`✅ *Prefijo actualizado:* \`${newPrefix}\`\n\n💡 Prueba ahora: ${newPrefix}menu`)
      }

      // ========== MODO ==========
      case 'modo': case 'mode': {
        if (!value || !['public', 'private'].includes(value.toLowerCase())) {
          return m.reply(`🎭 *Modo actual:* ${displayConfig.mode}\n\n❌ *Uso:* ${usedPrefix}config modo <public/private>\n\n📖 *Public:* Funciona en todos los grupos excepto bloqueados\n📖 *Private:* Solo funciona en grupos de la lista allowgroup`)
        }
        
        const newMode = value.toLowerCase()
        saveConfig({ mode: newMode })
        
        const extraInfo = newMode === 'private' 
          ? `\n\n⚠️ *Importante:* Ahora debes agregar grupos permitidos:\n*${usedPrefix}config allowgroup <número>*\n\nEjemplo: ${usedPrefix}config allowgroup 123456789` 
          : ''
        
        return m.reply(`✅ *Modo actualizado:* ${newMode === 'private' ? '🔐 PRIVADO' : '🔓 PÚBLICO'}${extraInfo}`)
      }

      // ========== SIN PREFIJO ==========
      case 'sinprefix': case 'noprefix': {
        const bool = parseBoolean(value)
        if (bool === null) {
          return m.reply(`🔇 *Sin Prefijo:* ${displayConfig.sinprefix ? '✅ ON' : '❌ OFF'}\n\n❌ *Uso:* ${usedPrefix}config sinprefix <on/off>\n\n⚠️ *Advertencia:* Activar esto puede causar respuestas accidentales a palabras comunes.`)
        }
        
        saveConfig({ sinprefix: bool })
        return m.reply(`✅ *Sin Prefijo:* ${bool ? '✅ ACTIVADO' : '❌ DESACTIVADO'}\n\n${bool ? '⚠️ El bot responderá a comandos sin prefijo.\n💡 Ejemplo: escribe "menu" en lugar de ".menu"' : '💡 Se requiere prefijo nuevamente.'}`)
      }

      // ========== ANTI-PRIVADO ==========
      case 'antiprivado': case 'antiprivate': case 'privado': {
        const bool = parseBoolean(value)
        if (bool === null) {
          return m.reply(`🚫 *Anti-Privado:* ${displayConfig.antiPrivate ? '✅ ON' : '❌ OFF'}\n\n❌ *Uso:* ${usedPrefix}config antiprivado <on/off>\n\n📖 Bloquea mensajes en privado (excepto el owner).`)
        }
        
        saveConfig({ antiPrivate: bool })
        return m.reply(`✅ *Anti-Privado:* ${bool ? '✅ ACTIVADO' : '❌ DESACTIVADO'}\n\n${bool ? '🔒 Solo el owner puede escribir al privado.\n🚫 Otros usuarios serán ignorados.' : '🔓 Todos pueden escribir al privado.'}`)
      }

      // ========== SOLO GRUPOS ==========
      case 'sologrupos': case 'gponly': case 'sologp': case 'gruposonly': {
        const bool = parseBoolean(value)
        if (bool === null) {
          return m.reply(`👥 *Solo Grupos:* ${displayConfig.gponly ? '✅ ON' : '❌ OFF'}\n\n❌ *Uso:* ${usedPrefix}config sologrupos <on/off>\n\n📖 Si está ON, ignora completamente los mensajes privados.`)
        }
        
        saveConfig({ gponly: bool })
        return m.reply(`✅ *Solo Grupos:* ${bool ? '✅ ACTIVADO' : '❌ DESACTIVADO'}\n\n${bool ? '👥 Solo respondo en grupos.\n🚫 Ignorando mensajes privados.' : '💬 Respondo en grupos y privado.'}`)
      }

      // ========== ESTILO BIENVENIDA ==========
      case 'estilo': case 'style': case 'bienvenida': case 'welcome': {
        const validStyles = ['modern', 'classic', 'neon']
        if (!value || !validStyles.includes(value.toLowerCase())) {
          return m.reply(`🎨 *Estilo actual:* ${displayConfig.welcomeStyle}\n\n❌ *Uso:* ${usedPrefix}config estilo <modern/classic/neon>\n\n🖼️ *Modern:* Diseño actual con canvas\n🖼️ *Classic:* Estilo tradicional\n🖼️ *Neon:* Efectos brillantes y modernos`)
        }
        
        const style = value.toLowerCase()
        saveConfig({ welcomeStyle: style, goodbyeStyle: style })
        return m.reply(`✅ *Estilo actualizado:* ${style.charAt(0).toUpperCase() + style.slice(1)}\n\n🎨 Aplica para mensajes de bienvenida y despedida.`)
      }

      // ========== LOGO ==========
      case 'logo': case 'icono': case 'imagen': {
        if (!value || ['none', 'default', 'remove', 'quitar', 'eliminar'].includes(value.toLowerCase())) {
          saveConfig({ logo: null, logoUrl: null })
          return m.reply(`✅ *Logo reiniciado*\n\n🖼️ Se usará el logo global por defecto:\n${global.icono || 'No configurado'}`)
        }
        
        const isUrl = value.startsWith('http://') || value.startsWith('https://')
        
        if (isUrl) {
          saveConfig({ logo: null, logoUrl: value })
          return m.reply(`✅ *Logo URL actualizado*\n\n🔗 ${value.slice(0, 60)}${value.length > 60 ? '...' : ''}\n\n🖼️ Se usará en menú y bienvenidas.`)
        } else {
          const logoPath = path.resolve(value)
          if (!fs.existsSync(logoPath)) {
            return m.reply(`❌ *Archivo no encontrado:*\n📁 ${value}\n\n💡 *Opciones:*\n1. Usa una ruta absoluta: \`/home/user/bot/logo.jpg\`\n2. Usa ruta relativa: \`./media/logo.jpg\`\n3. Usa una URL: \`https://ejemplo.com/logo.jpg\`\n4. Escribe \`none\` para quitar logo personalizado`)
          }
          
          // Verificar que sea imagen
          const ext = path.extname(logoPath).toLowerCase()
          if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
            return m.reply(`⚠️ *Formato no válido:* ${ext}\n\n✅ Formatos permitidos: .jpg .jpeg .png .webp`)
          }
          
          saveConfig({ logo: value, logoUrl: null })
          return m.reply(`✅ *Logo local actualizado*\n\n📁 ${value}\n📏 Tamaño: ${(fs.statSync(logoPath).size / 1024).toFixed(2)} KB\n\n🖼️ Se usará en menú y bienvenidas.`)
        }
      }

      // ========== IDIOMA ==========
      case 'idioma': case 'language': case 'lang': {
        const validLangs = ['es', 'en', 'pt']
        if (!value || !validLangs.includes(value.toLowerCase())) {
          return m.reply(`🌐 *Idioma actual:* ${displayConfig.language.toUpperCase()}\n\n❌ *Uso:* ${usedPrefix}config idioma <es/en/pt>\n\n🇪🇸 es - Español\n🇺🇸 en - English\n🇧🇷 pt - Português`)
        }
        
        saveConfig({ language: value.toLowerCase() })
        return m.reply(`✅ *Idioma actualizado:* ${value.toUpperCase()}\n\n🌐 Algunos mensajes cambiarán de idioma inmediatamente.`)
      }

      // ========== AUTO-READ ==========
      case 'autoread': case 'autoleer': case 'read': {
        const bool = parseBoolean(value)
        if (bool === null) {
          return m.reply(`⚡ *Auto-Read:* ${displayConfig.autoRead ? '✅ ON' : '❌ OFF'}\n\n❌ *Uso:* ${usedPrefix}config autoread <on/off>\n\n📖 Marca automáticamente los mensajes como leídos (doble check azul).`)
        }
        
        saveConfig({ autoRead: bool })
        return m.reply(`✅ *Auto-Read:* ${bool ? '✅ ACTIVADO' : '❌ DESACTIVADO'}\n\n${bool ? '👁️ Los mensajes se marcarán como leídos automáticamente.' : '👁️ Debes leer los mensajes manualmente.'}`)
      }

      // ========== TYPING EFFECT ==========
      case 'typing': case 'escribiendo': case 'type': {
        const bool = parseBoolean(value)
        if (bool === null) {
          return m.reply(`✍️ *Typing Effect:* ${displayConfig.typingEffect ? '✅ ON' : '❌ OFF'}\n\n❌ *Uso:* ${usedPrefix}config typing <on/off>\n\n📖 Muestra "escribiendo..." antes de responder (más natural).`)
        }
        
        saveConfig({ typingEffect: bool })
        return m.reply(`✅ *Typing Effect:* ${bool ? '✅ ACTIVADO' : '❌ DESACTIVADO'}\n\n${bool ? '✍️ Mostraré "escribiendo..." antes de responder.' : '⚡ Responderé inmediatamente sin efecto.'}`)
      }

      // ========== ANTI-SPAM ==========
      case 'antispam': case 'antiflood': {
        const bool = parseBoolean(value)
        if (bool === null) {
          return m.reply(`🛡️ *Anti-Spam:* ${displayConfig.antiSpam ? '✅ ON' : '❌ OFF'}\n\n❌ *Uso:* ${usedPrefix}config antispam <on/off>\n\n📖 Protege contra flood de comandos.`)
        }
        
        saveConfig({ antiSpam: bool })
        return m.reply(`✅ *Anti-Spam:* ${bool ? '✅ ACTIVADO' : '❌ DESACTIVADO'}\n\n${bool ? '🛡️ Protección contra spam activada.\n⏱️ Cooldown: ' + displayConfig.cooldown + 'ms' : '⚠️ Sin protección contra spam.'}`)
      }

      // ========== COOLDOWN ==========
      case 'cooldown': case 'cd': case 'delay': {
        const ms = parseInt(value)
        if (isNaN(ms) || ms < 0 || ms > 60000) {
          return m.reply(`⏱️ *Cooldown actual:* ${displayConfig.cooldown}ms\n\n❌ *Uso:* ${usedPrefix}config cooldown <milisegundos>\n\n📝 Ejemplos:\n• 0 - Sin cooldown\n• 1000 - 1 segundo\n• 3000 - 3 segundos (default)\n• 5000 - 5 segundos\n\n⚠️ Máximo: 60000ms (1 minuto)`)
        }
        
        saveConfig({ cooldown: ms })
        return m.reply(`✅ *Cooldown actualizado:* ${ms}ms (${(ms/1000).toFixed(1)}s)\n\n⏱️ Tiempo de espera entre comandos.`)
      }

      // ========== GRUPOS PERMITIDOS ==========
      case 'allowgroup': case 'permitirgrupo': case 'allow': {
        if (!value) {
          const groups = displayConfig.allowedGroups || []
          const list = groups.length 
            ? groups.map(g => `• ${g.replace('@g.us', '')}`).join('\n')
            : 'Ninguno (todos permitidos en modo private)'
          
          return m.reply(`📋 *Grupos Permitidos (${groups.length}):*\n${list}\n\n❌ *Uso:* ${usedPrefix}config allowgroup <número>\n📝 Ejemplo: ${usedPrefix}config allowgroup 123456789\n\n💡 Escribe el mismo número para quitarlo de la lista.`)
        }
        
        const groupJid = value.includes('@g.us') ? value : value.replace(/\D/g, '') + '@g.us'
        const currentGroups = [...(displayConfig.allowedGroups || [])]
        
        if (currentGroups.includes(groupJid)) {
          const newGroups = currentGroups.filter(g => g !== groupJid)
          saveConfig({ allowedGroups: newGroups })
          return m.reply(`✅ *Grupo removido de permitidos:*\n👥 ${groupJid.replace('@g.us', '')}`)
        } else {
          saveConfig({ allowedGroups: [...currentGroups, groupJid] })
          return m.reply(`✅ *Grupo agregado a permitidos:*\n👥 ${groupJid.replace('@g.us', '')}\n\n🔐 En modo *private*, el bot funcionará aquí.`)
        }
      }

      // ========== GRUPOS BLOQUEADOS ==========
      case 'blockgroup': case 'bloqueargrupo': case 'block': {
        if (!value) {
          const groups = displayConfig.blockedGroups || []
          const list = groups.length 
            ? groups.map(g => `• ${g.replace('@g.us', '')}`).join('\n')
            : 'Ninguno'
          
          return m.reply(`📋 *Grupos Bloqueados (${groups.length}):*\n${list}\n\n❌ *Uso:* ${usedPrefix}config blockgroup <número>\n📝 Ejemplo: ${usedPrefix}config blockgroup 123456789`)
        }
        
        const groupJid = value.includes('@g.us') ? value : value.replace(/\D/g, '') + '@g.us'
        const currentGroups = [...(displayConfig.blockedGroups || [])]
        
        if (currentGroups.includes(groupJid)) {
          const newGroups = currentGroups.filter(g => g !== groupJid)
          saveConfig({ blockedGroups: newGroups })
          return m.reply(`✅ *Grupo desbloqueado:*\n👥 ${groupJid.replace('@g.us', '')}`)
        } else {
          saveConfig({ blockedGroups: [...currentGroups, groupJid] })
          return m.reply(`✅ *Grupo bloqueado:*\n👥 ${groupJid.replace('@g.us', '')}\n\n🚫 En modo *public*, el bot ignorará este grupo.`)
        }
      }

      // ========== AUTO-STATUS ==========
      case 'autostatus': case 'verstatus': case 'status': {
        const bool = parseBoolean(value)
        if (bool === null) {
          return m.reply(`👁️ *Auto-Status:* ${displayConfig.autoStatus ? '✅ ON' : '❌ OFF'}\n\n❌ *Uso:* ${usedPrefix}config autostatus <on/off>\n\n📖 Ve automáticamente los estados de tus contactos.`)
        }
        
        saveConfig({ autoStatus: bool })
        return m.reply(`✅ *Auto-Status:* ${bool ? '✅ ACTIVADO' : '❌ DESACTIVADO'}\n\n${bool ? '👁️ Veré automáticamente los estados.' : '👁️ No veré estados automáticamente.'}`)
      }

      // ========== REACCIONES ==========
      case 'reacciones': case 'reactions': case 'react': {
        const bool = parseBoolean(value)
        if (bool === null) {
          return m.reply(`🎭 *Reacciones:* ${displayConfig.reactions ? '✅ ON' : '❌ OFF'}\n\n❌ *Uso:* ${usedPrefix}config reacciones <on/off>\n\n📖 Reacciona automáticamente a ciertos mensajes.`)
        }
        
        saveConfig({ reactions: bool })
        return m.reply(`✅ *Reacciones:* ${bool ? '✅ ACTIVADO' : '❌ DESACTIVADO'}`)
      }

      // ========== REINICIAR CONFIGURACIÓN ==========
      case 'reset': case 'default': case 'reiniciar': {
        const confirmText = args[1]?.toLowerCase()
        
        if (confirmText !== 'confirmar' && confirmText !== 'confirm' && confirmText !== 'si') {
          return m.reply(`⚠️ *¿REINICIAR CONFIGURACIÓN?*\n\n🗑️ Esto eliminará TODA tu configuración personalizada:\n• Nombre personalizado\n• Prefijo personalizado\n• Modo, anti-privado, grupos permitidos...\n• Logo, estilos, idioma...\n\n✅ *Para confirmar:*\n${usedPrefix}config reset confirmar\n\n❌ *Para cancelar:* ignora este mensaje.`)
        }
        
        // Preservar datos esenciales
        const essentialData = {
          owner: currentConfig.owner || m.sender,
          createdAt: currentConfig.createdAt || new Date().toISOString(),
          jid: currentConfig.jid || conn.user.jid,
          ...defaultConfig
        }
        
        fs.writeFileSync(configPath, JSON.stringify(essentialData, null, 2))
        
        // Actualizar en memoria
        if (conn.subConfig) {
          Object.assign(conn.subConfig, essentialData)
        }
        
        return m.reply(`🔄 *CONFIGURACIÓN REINICIADA*\n\n✅ Todos los valores han vuelto a los predeterminados:\n\n📛 Nombre: Por defecto\n🔣 Prefijo: Global (${global.prefix?.toString().replace(/\\/g, '').replace(/^\^/,'').replace(/\?$/,'') || '.'})\n🎭 Modo: Público\n🔇 Sin Prefijo: OFF\n🚫 Anti-Privado: OFF\n👥 Solo Grupos: OFF\n🎨 Estilo: Modern\n🌐 Idioma: ES\n⚡ Auto-Read: OFF\n✍️ Typing: OFF\n🛡️ Anti-Spam: ON\n⏱️ Cooldown: 3000ms\n\n🔄 Los cambios se aplican inmediatamente.`)
      }

      // ========== RECARGAR CONFIGURACIÓN ==========
      case 'reload': case 'recargar': case 'refresh': {
        try {
          if (fs.existsSync(configPath)) {
            const freshConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
            if (conn.subConfig) {
              Object.assign(conn.subConfig, freshConfig)
            }
            
            // Actualizar en activeSubBots también
            if (global.activeSubBots.has(conn.user.jid)) {
              const subBotEntry = global.activeSubBots.get(conn.user.jid)
              if (subBotEntry.socket) {
                subBotEntry.socket.subConfig = freshConfig
              }
            }
            
            return m.reply(`✅ *Configuración recargada*\n\n📁 ${configPath}\n🕐 Última modificación: ${new Date(freshConfig.updatedAt || Date.now()).toLocaleString()}`)
          } else {
            return m.reply(`❌ *No se encontró archivo de configuración*\n\n📁 ${configPath}\n\n💡 Usa ${usedPrefix}config para crear uno nuevo.`)
          }
        } catch (e) {
          return m.reply(`❌ *Error recargando:* ${e.message}`)
        }
      }

      // ========== VER CONFIG ==========
      case 'view': case 'ver': case 'json': case 'raw': {
        return m.reply(`📄 *Configuración Actual (JSON):*\n\n\`\`\`json\n${JSON.stringify(displayConfig, null, 2)}\n\`\`\`\n\n📁 Ubicación: ${configPath}`)
      }

      // ========== BIO ==========
      case 'bio': case 'status': case 'descripcion': {
        if (!value || ['none', 'remove', 'quitar'].includes(value.toLowerCase())) {
          saveConfig({ bio: null })
          return m.reply(`✅ *Bio reiniciada*\n\n📝 Se usará la descripción por defecto.`)
        }
        
        if (value.length > 139) {
          return m.reply(`⚠️ *Bio muy larga*\n\n📝 Máximo 139 caracteres.\n📊 Actual: ${value.length} caracteres.`)
        }
        
        saveConfig({ bio: value })
        
        // Actualizar bio en WhatsApp si es posible
        try {
          await conn.updateProfileStatus(value)
          return m.reply(`✅ *Bio actualizada*\n\n📝 ${value}\n\n👁️ Se actualizó en tu perfil de WhatsApp.`)
        } catch (e) {
          return m.reply(`✅ *Bio guardada*\n\n📝 ${value}\n\n⚠️ No se pudo actualizar en WhatsApp automáticamente, pero se aplicará al reiniciar.`)
        }
      }

      default:
        return m.reply(`❌ *Opción no reconocida:* "${action}"\n\n📋 Usa *${usedPrefix}config* para ver todas las opciones disponibles.`)
    }

  } catch (error) {
    console.error('Error en config:', error)
    return m.reply(`❌ *Error:* ${error.message}\n\n🔧 Si persiste, reporta a: ${global.fernando?.[0] || 'Owner'}`)
  }
}

handler.help = ['config - Configuración del SubBot']
handler.tags = ['serbot', 'owner']
handler.command = ['config', 'serbotconfig', 'subconfig', 'botconfig', 'cfg']
handler.private = false // Funciona en grupos y privado

export default handler
