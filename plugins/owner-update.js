import fetch from "node-fetch"

let handler = async (m, { conn, usedPrefix }) => {
  try {
    // Verificar si es owner
    if (!global.owner.includes(m.sender.split('@')[0])) {
      return m.reply('🚫 Este comando solo está disponible para el owner del bot.')
    }

    await m.react('🕒')
    
    // Mensaje inicial único
    const msgInicial = await conn.sendMessage(m.chat, { 
      text: '🔄 *Iniciando actualización...*\n\n⏳ Esto puede tomar 1-2 minutos...' 
    }, { quoted: m })

    const botDir = process.cwd()
    const backupDir = `${botDir}/backup_update_${Date.now()}`

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

    // Función para actualizar el mensaje en lugar de enviar nuevos
    const actualizarMensaje = async (texto) => {
      try {
        await conn.sendMessage(m.chat, { 
          text: texto, 
          edit: msgInicial.key 
        })
      } catch (e) {
        // Si no se puede editar, no enviar nada
        console.log('No se pudo editar mensaje:', e.message)
      }
    }

    // 1. Crear backup
    await actualizarMensaje('🔄 *Actualizando...*\n\n💾 Creando respaldo de seguridad...')

    const fs = await import('fs')
    const path = await import('path')

    await execCmd(`mkdir -p "${backupDir}"`)

    const backupFiles = ['database.json', 'settings.js', 'sessions']
    for (const file of backupFiles) {
      try {
        await execCmd(`cp -r "${botDir}/${file}" "${backupDir}/${file}" 2>/dev/null || true`)
      } catch (e) {
        console.log(`No se pudo respaldar ${file}:`, e.message)
      }
    }

    // 2. Verificar cambios en GitHub
    await actualizarMensaje('🔄 *Actualizando...*\n\n📥 Verificando actualizaciones en GitHub...')

    try {
      await execCmd('git fetch origin')
    } catch (e) {
      await m.react('❌')
      await actualizarMensaje('❌ *Error de conexión*\n\nNo se pudo conectar con GitHub. Verifica tu internet.')
      return
    }

    // 3. Verificar si hay cambios
    const { stdout: status } = await execCmd('git status -uno')
    if (status.includes('Tu rama está actualizada') || status.includes('Your branch is up to date')) {
      await m.react('✅')
      await actualizarMensaje('✅ *Bot actualizado*\n\nNo hay nuevas actualizaciones disponibles.')
      return
    }

    // 4. Obtener cambios disponibles
    const { stdout: cambios } = await execCmd('git log HEAD..origin/main --oneline --no-merges')
    const listaCambios = cambios.split('\n').filter(l => l).slice(0, 5)

    // 5. Aplicar actualización
    await actualizarMensaje('🔄 *Actualizando...*\n\n⚡ Aplicando actualización y restaurando configuraciones...')

    try {
      await execCmd('git stash')
      const { stdout: pullResult } = await execCmd('git pull origin main --no-rebase')

      if (pullResult.includes('CONFLICT') || pullResult.includes('error:')) {
        await execCmd('git merge --abort')
        await execCmd('git stash pop')
        throw new Error('Conflicto al fusionar cambios')
      }

      // 6. Actualizar dependencias si es necesario
      const packageChanged = pullResult.toLowerCase().includes('package.json')

      if (packageChanged) {
        await actualizarMensaje('🔄 *Actualizando...*\n\n📦 Instalando nuevas dependencias...')
        try {
          await execCmd('npm install --legacy-peer-deps')
        } catch (npmError) {
          await execCmd('npm install --force')
        }
      }

      // 7. Restaurar backups
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

      // 8. Obtener información del commit
      const { stdout: commitHash } = await execCmd('git log -1 --pretty=format:"%h"')
      const { stdout: commitMsg } = await execCmd('git log -1 --pretty=format:"%s"')
      const filesChanged = (pullResult.match(/\| \d+ [+-]+/g) || []).length

      // 9. Mensaje final único
      const mensajeFinal = `
✅ *ACTUALIZACIÓN COMPLETADA*

🔧 *Detalles:*
🆕 Commit: ${commitHash.trim()}
📝 Mensaje: ${commitMsg.trim()}
📄 Archivos: ${filesChanged} modificados
🔧 Dependencias: ${packageChanged ? 'Actualizadas' : 'Sin cambios'}

⚠️ *Para aplicar los cambios:*
• Reinicia el bot manualmente
• O usa el comando *${usedPrefix}reiniciar*

📌 *Cambios aplicados:*
${listaCambios.map((c, i) => `• ${c.substring(8)}`).join('\n')}

💾 Backup guardado en: ${backupDir}
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
      await actualizarMensaje('🔄 *Actualizando...*\n\n⚠️ Error durante la actualización, restaurando versión anterior...')

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
        await execCmd('git reset --hard HEAD')

        await m.react('❌')
        await actualizarMensaje(
          `❌ *Actualización fallida*\n\nSe restauró la versión anterior.\n\nError: ${updateError.message}\n\n📍 Usa *${usedPrefix}report* para informar el problema.`
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

handler.help = ['actualizar', 'update', 'upgrade']
handler.tags = ['owner']
handler.command = ['actualizar', 'update', 'upgrade']
handler.group = false
handler.owner = true
handler.admin = false
handler.botAdmin = false

export default handler