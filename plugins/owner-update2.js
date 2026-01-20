import fetch from "node-fetch"

let handler = async (m, { conn, usedPrefix, text }) => {
  try {
    // Verificar si es owner
    if (!global.owner.includes(m.sender.split('@')[0])) {
      return m.reply('🚫 Este comando solo está disponible para el owner del bot.')
    }

    const botDir = process.cwd()

    // Función para ejecutar comandos
    const execCmd = (cmd) => {
      return new Promise((resolve, reject) => {
        import('child_process').then(child_process => {
          child_process.exec(cmd, { cwd: botDir }, (error, stdout, stderr) => {
            if (error) reject(error)
            else resolve({ stdout, stderr })
          })
        }).catch(reject)
      })
    }

    // Si no hay argumento, mostrar ramas disponibles
    if (!text || text.trim() === '') {
      await m.react('🔍')
      
      try {
        // Obtener rama actual
        const { stdout: ramaActual } = await execCmd('git branch --show-current')
        
        // Obtener todas las ramas remotas
        await execCmd('git fetch origin --prune')
        const { stdout: ramasRemotas } = await execCmd('git branch -r')
        
        // Procesar ramas remotas
        const ramas = ramasRemotas
          .split('\n')
          .map(r => r.trim())
          .filter(r => r && !r.includes('HEAD') && r.startsWith('origin/'))
          .map(r => r.replace('origin/', ''))
        
        if (ramas.length === 0) {
          return m.reply('❌ No se encontraron ramas remotas.')
        }

        // Obtener último commit de cada rama
        let listaRamas = `🌿 *RAMAS DISPONIBLES*\n\n`
        listaRamas += `📍 *Rama actual:* \`${ramaActual.trim()}\`\n\n`
        
        for (const rama of ramas) {
          try {
            const { stdout: lastCommit } = await execCmd(`git log origin/${rama} -1 --pretty=format:"%s" 2>/dev/null`)
            const { stdout: commitDate } = await execCmd(`git log origin/${rama} -1 --pretty=format:"%cr" 2>/dev/null`)
            const esActual = rama === ramaActual.trim()
            
            listaRamas += `${esActual ? '🔹' : '▫️'} *${rama}*\n`
            listaRamas += `   📝 ${lastCommit.trim()}\n`
            listaRamas += `   🕐 ${commitDate.trim()}\n\n`
          } catch (e) {
            listaRamas += `${rama === ramaActual.trim() ? '🔹' : '▫️'} *${rama}*\n\n`
          }
        }

        listaRamas += `\n💡 *Uso:*\n`
        listaRamas += `• \`${usedPrefix}update\` - Ver ramas\n`
        listaRamas += `• \`${usedPrefix}update ${ramaActual.trim()}\` - Actualizar rama actual\n`
        listaRamas += `• \`${usedPrefix}update <rama>\` - Cambiar y actualizar`

        await m.react('✅')
        return m.reply(listaRamas)

      } catch (error) {
        await m.react('❌')
        return m.reply(`❌ *Error al obtener ramas*\n\n${error.message}`)
      }
    }

    // Si hay argumento, proceder con la actualización
    const ramaDeseada = text.trim()
    
    await m.react('🕒')
    
    const msgInicial = await conn.sendMessage(m.chat, { 
      text: `🔄 *Iniciando actualización a rama: ${ramaDeseada}*\n\n⏳ Esto puede tomar 1-2 minutos...` 
    }, { quoted: m })

    const backupDir = `${botDir}/backup_update_${Date.now()}`
    const fs = await import('fs')
    const path = await import('path')

    // Función para actualizar el mensaje
    const actualizarMensaje = async (texto) => {
      try {
        await conn.sendMessage(m.chat, { 
          text: texto, 
          edit: msgInicial.key 
        })
      } catch (e) {
        console.log('No se pudo editar mensaje:', e.message)
      }
    }

    // Función para contar archivos en una carpeta
    const contarArchivos = async (carpeta) => {
      try {
        const rutaCarpeta = path.default.join(botDir, carpeta)
        if (!fs.default.existsSync(rutaCarpeta)) return 0
        const archivos = fs.default.readdirSync(rutaCarpeta)
        return archivos.filter(f => f.endsWith('.js')).length
      } catch (e) {
        return 0
      }
    }

    // Función para crear carpetas de plugins si no existen
    const crearCarpetasPlugins = async () => {
      const carpetas = ['plugins', 'plugins2', 'plugins3', 'plugins4', 'plugins5']
      for (const carpeta of carpetas) {
        const rutaCarpeta = path.default.join(botDir, carpeta)
        if (!fs.default.existsSync(rutaCarpeta)) {
          fs.default.mkdirSync(rutaCarpeta, { recursive: true })
          console.log(`Carpeta ${carpeta} creada`)
        }
      }
    }

    // Función para encontrar en qué carpeta está un plugin
    const encontrarPlugin = async (nombreArchivo) => {
      const carpetas = ['plugins', 'plugins2', 'plugins3', 'plugins4', 'plugins5']
      for (const carpeta of carpetas) {
        const rutaArchivo = path.default.join(botDir, carpeta, nombreArchivo)
        if (fs.default.existsSync(rutaArchivo)) {
          return carpeta
        }
      }
      return null
    }

    // Función para encontrar la carpeta con espacio disponible
    const encontrarCarpetaDisponible = async () => {
      const carpetas = ['plugins', 'plugins2', 'plugins3', 'plugins4', 'plugins5']
      for (const carpeta of carpetas) {
        const count = await contarArchivos(carpeta)
        // Si tiene menos de 250, tiene espacio disponible
        // Si tiene 250 o más, ya está llena y se salta
        if (count < 250) {
          return carpeta
        }
      }
      // Si todas están llenas o superan 250, crear/usar la siguiente disponible
      return 'plugins5'
    }

    // Función para distribuir plugins nuevos
    const distribuirPluginsNuevos = async (archivosNuevos) => {
      let distribucion = {
        agregados: 0,
        movidos: 0,
        mantenidos: 0,
        carpetas: {}
      }

      await crearCarpetasPlugins()

      for (const archivo of archivosNuevos) {
        // Si el archivo ya existe en alguna carpeta, dejarlo ahí
        const carpetaExistente = await encontrarPlugin(archivo)
        
        if (carpetaExistente) {
          // El plugin ya existe, se actualiza en su carpeta actual
          // IMPORTANTE: Aunque tenga más de 250 archivos, se mantiene ahí
          const countActual = await contarArchivos(carpetaExistente)
          
          if (!distribucion.carpetas[carpetaExistente]) {
            distribucion.carpetas[carpetaExistente] = []
          }
          distribucion.carpetas[carpetaExistente].push(archivo)
          distribucion.mantenidos++
          
          console.log(`Plugin ${archivo} se mantiene en ${carpetaExistente} (${countActual} archivos)`)
        } else {
          // Es un plugin nuevo, encontrar carpeta disponible (con menos de 250)
          const carpetaDestino = await encontrarCarpetaDisponible()
          const origen = path.default.join(botDir, 'plugins', archivo)
          const destino = path.default.join(botDir, carpetaDestino, archivo)

          // Si el archivo está en plugins temporal y la carpeta destino no es plugins
          if (fs.default.existsSync(origen) && carpetaDestino !== 'plugins') {
            try {
              // Mover el archivo a la carpeta con espacio
              fs.default.renameSync(origen, destino)
              distribucion.movidos++
              console.log(`Plugin nuevo ${archivo} movido a ${carpetaDestino}`)
            } catch (e) {
              console.log(`Error moviendo ${archivo}:`, e.message)
            }
          } else {
            distribucion.agregados++
            console.log(`Plugin nuevo ${archivo} agregado en ${carpetaDestino}`)
          }

          if (!distribucion.carpetas[carpetaDestino]) {
            distribucion.carpetas[carpetaDestino] = []
          }
          distribucion.carpetas[carpetaDestino].push(archivo)
        }
      }

      return distribucion
    }

    // Verificar que la rama existe en remoto
    await actualizarMensaje(`🔄 *Actualizando a: ${ramaDeseada}*\n\n🔍 Verificando rama en GitHub...`)
    
    try {
      await execCmd('git fetch origin --prune')
      const { stdout: ramasRemotas } = await execCmd('git branch -r')
      const ramaExiste = ramasRemotas.includes(`origin/${ramaDeseada}`)
      
      if (!ramaExiste) {
        await m.react('❌')
        await actualizarMensaje(`❌ *Rama no encontrada*\n\nLa rama \`${ramaDeseada}\` no existe en GitHub.\n\nUsa \`${usedPrefix}update\` para ver las ramas disponibles.`)
        return
      }
    } catch (e) {
      await m.react('❌')
      await actualizarMensaje('❌ *Error de conexión*\n\nNo se pudo conectar con GitHub. Verifica tu internet.')
      return
    }

    // Obtener rama actual
    const { stdout: ramaActual } = await execCmd('git branch --show-current')
    const cambioRama = ramaActual.trim() !== ramaDeseada

    // 1. Crear backup
    await actualizarMensaje(`🔄 *Actualizando a: ${ramaDeseada}*\n\n💾 Creando respaldo de seguridad...`)

    await execCmd(`mkdir -p "${backupDir}"`)

    const backupFiles = ['database.json', 'settings.js', 'sessions']
    for (const file of backupFiles) {
      try {
        await execCmd(`cp -r "${botDir}/${file}" "${backupDir}/${file}" 2>/dev/null || true`)
      } catch (e) {
        console.log(`No se pudo respaldar ${file}:`, e.message)
      }
    }

    // Backup de todas las carpetas de plugins
    const carpetasPlugins = ['plugins', 'plugins2', 'plugins3', 'plugins4', 'plugins5']
    for (const carpeta of carpetasPlugins) {
      try {
        await execCmd(`cp -r "${botDir}/${carpeta}" "${backupDir}/${carpeta}" 2>/dev/null || true`)
      } catch (e) {
        console.log(`No se pudo respaldar ${carpeta}:`, e.message)
      }
    }

    // 2. Verificar cambios disponibles
    await actualizarMensaje(`🔄 *Actualizando a: ${ramaDeseada}*\n\n📊 Analizando cambios disponibles...`)

    const { stdout: cambios } = await execCmd(`git log HEAD..origin/${ramaDeseada} --oneline --no-merges`)
    const listaCambios = cambios.split('\n').filter(l => l).slice(0, 5)

    if (listaCambios.length === 0 && !cambioRama) {
      await m.react('✅')
      await actualizarMensaje(`✅ *Bot actualizado*\n\nLa rama \`${ramaDeseada}\` ya está actualizada.\n\nNo hay nuevos cambios disponibles.`)
      await execCmd(`rm -rf "${backupDir}"`)
      return
    }

    // 3. Aplicar actualización
    await actualizarMensaje(`🔄 *Actualizando a: ${ramaDeseada}*\n\n⚡ ${cambioRama ? 'Cambiando de rama y actualizando' : 'Aplicando actualización'}...`)

    try {
      // Guardar cambios locales
      await execCmd('git stash')

      // Cambiar de rama si es necesario
      if (cambioRama) {
        try {
          const { stdout: ramasLocales } = await execCmd('git branch')
          const ramaLocalExiste = ramasLocales.includes(ramaDeseada)

          if (ramaLocalExiste) {
            await execCmd(`git checkout ${ramaDeseada}`)
          } else {
            await execCmd(`git checkout -b ${ramaDeseada} origin/${ramaDeseada}`)
          }
        } catch (checkoutError) {
          throw new Error(`No se pudo cambiar a la rama ${ramaDeseada}: ${checkoutError.message}`)
        }
      }

      // Hacer pull de la rama
      const { stdout: pullResult } = await execCmd(`git pull origin ${ramaDeseada} --no-rebase`)

      if (pullResult.includes('CONFLICT') || pullResult.includes('error:')) {
        await execCmd('git merge --abort')
        await execCmd(`git checkout ${ramaActual.trim()}`)
        await execCmd('git stash pop')
        throw new Error('Conflicto al fusionar cambios')
      }

      // 4. Gestión inteligente de plugins
      await actualizarMensaje(`🔄 *Actualizando a: ${ramaDeseada}*\n\n📦 Organizando plugins en carpetas...`)

      // Crear carpetas si no existen
      await crearCarpetasPlugins()

      // Obtener lista de plugins actualizados/nuevos
      const { stdout: archivosModificados } = await execCmd(`git diff --name-only HEAD@{1} HEAD`)
      const pluginsModificados = archivosModificados
        .split('\n')
        .filter(f => f.startsWith('plugins/') && f.endsWith('.js'))
        .map(f => path.default.basename(f))

      let distribucion = null
      if (pluginsModificados.length > 0) {
        distribucion = await distribuirPluginsNuevos(pluginsModificados)
      }

      // Contar plugins en cada carpeta
      const conteos = {}
      for (const carpeta of carpetasPlugins) {
        conteos[carpeta] = await contarArchivos(carpeta)
      }

      // 5. Actualizar dependencias si es necesario
      const packageChanged = pullResult.toLowerCase().includes('package.json')

      if (packageChanged) {
        await actualizarMensaje(`🔄 *Actualizando a: ${ramaDeseada}*\n\n📦 Instalando nuevas dependencias...`)
        try {
          await execCmd('npm install --legacy-peer-deps')
        } catch (npmError) {
          await execCmd('npm install --force')
        }
      }

      // 6. Restaurar backups de configuración
      const checkBackup = async (file) => {
        try {
          const { stdout } = await execCmd(`[ -e "${backupDir}/${file}" ] && echo "exists"`)
          return stdout.includes('exists')
        } catch {
          return false
        }
      }

      if (await checkBackup('database.json')) {
        await execCmd(`cp "${backupDir}/database.json" "${botDir}/database.json"`)
      }

      if (await checkBackup('settings.js')) {
        await execCmd(`cp "${backupDir}/settings.js" "${botDir}/settings.js"`)
      }

      if (await checkBackup('sessions')) {
        await execCmd(`rm -rf "${botDir}/sessions" 2>/dev/null || true`)
        await execCmd(`cp -r "${backupDir}/sessions" "${botDir}/"`)
      }

      // 7. Obtener información del commit
      const { stdout: commitHash } = await execCmd('git log -1 --pretty=format:"%h"')
      const { stdout: commitMsg } = await execCmd('git log -1 --pretty=format:"%s"')
      const { stdout: commitAuthor } = await execCmd('git log -1 --pretty=format:"%an"')
      const { stdout: ramaFinal } = await execCmd('git branch --show-current')
      const filesChanged = (pullResult.match(/\| \d+ [+-]+/g) || []).length

      // 8. Mensaje final
      let infoPlugins = ''
      if (distribucion && pluginsModificados.length > 0) {
        infoPlugins += `\n🔌 *Gestión de plugins:*\n`
        if (distribucion.mantenidos > 0) {
          infoPlugins += `♻️ Actualizados en su carpeta: ${distribucion.mantenidos}\n`
        }
        if (distribucion.movidos > 0) {
          infoPlugins += `📁 Nuevos movidos a carpetas disponibles: ${distribucion.movidos}\n`
        }
        if (distribucion.agregados > 0) {
          infoPlugins += `✨ Nuevos agregados: ${distribucion.agregados}\n`
        }
        infoPlugins += `\n📊 *Distribución actual:*\n`
        for (const [carpeta, count] of Object.entries(conteos)) {
          if (count > 0) {
            // Si tiene 250 o más, mostrar que está llena
            // Si tiene menos de 250, mostrar porcentaje y barra
            if (count >= 250) {
              infoPlugins += `   ${carpeta}: ${count} archivos [LLENA ✓] No acepta nuevos\n`
            } else {
              const porcentaje = Math.round((count / 250) * 100)
              const barra = '█'.repeat(Math.floor(porcentaje / 10)) + '░'.repeat(10 - Math.floor(porcentaje / 10))
              infoPlugins += `   ${carpeta}: ${count}/250 [${barra}] ${porcentaje}%\n`
            }
          }
        }
      }

      const mensajeFinal = `
✅ *ACTUALIZACIÓN COMPLETADA*

🌿 *Rama:* \`${ramaFinal.trim()}\` ${cambioRama ? '(cambiada)' : ''}
${cambioRama ? `   Desde: \`${ramaActual.trim()}\`\n` : ''}
🔧 *Detalles:*
🆕 Commit: ${commitHash.trim()}
👤 Autor: ${commitAuthor.trim()}
📝 Mensaje: ${commitMsg.trim()}
📄 Archivos: ${filesChanged} modificados
🔧 Dependencias: ${packageChanged ? 'Actualizadas' : 'Sin cambios'}
${infoPlugins}
⚠️ *Para aplicar los cambios:*
• Reinicia el bot manualmente
• O usa el comando *${usedPrefix}reiniciar*

${listaCambios.length > 0 ? `📌 *Últimos cambios aplicados:*\n${listaCambios.map((c, i) => `• ${c.substring(8)}`).join('\n')}` : ''}

💾 Backup guardado temporalmente
      `.trim()

      await m.react('✅')
      await actualizarMensaje(mensajeFinal)

      // Limpiar backup después de 1 minuto
      setTimeout(async () => {
        try {
          await execCmd(`rm -rf "${backupDir}"`)
        } catch (e) {
          console.log('No se pudo eliminar backup:', e.message)
        }
      }, 60000)

    } catch (updateError) {
      await actualizarMensaje(`🔄 *Actualizando a: ${ramaDeseada}*\n\n⚠️ Error durante la actualización, restaurando versión anterior...`)

      try {
        const restoreFile = async (file) => {
          try {
            const { stdout } = await execCmd(`[ -e "${backupDir}/${file}" ] && echo "exists"`)
            const exists = stdout.includes('exists')
            
            if (exists) {
              if (file === 'sessions') {
                await execCmd(`rm -rf "${botDir}/sessions" 2>/dev/null || true`)
                await execCmd(`cp -r "${backupDir}/sessions" "${botDir}/"`)
              } else {
                await execCmd(`cp "${backupDir}/${file}" "${botDir}/${file}"`)
              }
            }
          } catch (e) {}
        }

        await restoreFile('database.json')
        await restoreFile('settings.js')
        await restoreFile('sessions')
        
        // Restaurar carpetas de plugins
        for (const carpeta of carpetasPlugins) {
          try {
            const backupCarpeta = path.default.join(backupDir, carpeta)
            if (fs.default.existsSync(backupCarpeta)) {
              await execCmd(`rm -rf "${botDir}/${carpeta}"`)
              await execCmd(`cp -r "${backupDir}/${carpeta}" "${botDir}/"`)
            }
          } catch (e) {
            console.log(`Error restaurando ${carpeta}:`, e.message)
          }
        }
        
        // Volver a la rama original si hubo cambio
        if (cambioRama) {
          await execCmd(`git checkout ${ramaActual.trim()}`)
        }
        await execCmd('git reset --hard HEAD')

        await m.react('❌')
        await actualizarMensaje(
          `❌ *Actualización fallida*\n\nSe restauró la versión anterior en la rama \`${ramaActual.trim()}\`.\n\nError: ${updateError.message}\n\n📍 Usa *${usedPrefix}report* para informar el problema.`
        )
      } catch (restoreError) {
        await m.react('💀')
        await actualizarMensaje(
          `💀 *Error crítico*\n\nNo se pudo restaurar el backup.\n\nContacta al desarrollador.\n\nBackup en: ${backupDir}`
        )
      }
    }

  } catch (error) {
    await m.react('✖️')
    await conn.sendMessage(m.chat, { 
      text: `⚠️ *Error inesperado*\n\n${error.message}\n\n📍 Usa *${usedPrefix}report* para informar.` 
    }, { quoted: m })
  }
}

handler.help = ['actualizar2', 'update2', 'upgrade2']
handler.tags = ['owner']
handler.command = ['actualizar2', 'update2', 'upgrade2']
handler.group = false
handler.owner = true
handler.admin = false
handler.botAdmin = false

export default handler