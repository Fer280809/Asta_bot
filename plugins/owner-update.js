import fetch from "node-fetch"

let handler = async (m, { conn, usedPrefix }) => {
  try {
    // Verificar si es owner
    if (!global.owner.includes(m.sender.split('@')[0])) {
      return m.reply('🚫 Este comando solo está disponible para el owner del bot.')
    }
    
    await m.react('🕒')
    await m.reply('🔄 *Iniciando actualización...*\n\n⏳ Esto puede tomar 1-2 minutos...')

    const botDir = process.cwd()
    const backupDir = `${botDir}/backup_update_${Date.now()}`
    
    // 1. Crear backup
    await conn.sendMessage(m.chat, { text: '💾 *Creando respaldo de seguridad...*' }, { quoted: m })
    
    // Función para ejecutar comandos
    const execCmd = (cmd) => new Promise((resolve, reject) => {
      require('child_process').exec(cmd, { cwd: botDir }, (error, stdout, stderr) => {
        if (error) reject(error)
        else resolve({ stdout, stderr })
      })
    })

    // Crear directorio de backup
    await execCmd(`mkdir -p "${backupDir}"`)
    
    // Backup de archivos críticos
    const backupFiles = ['database.json', 'settings.js', 'sessions']
    for (const file of backupFiles) {
      try {
        await execCmd(`cp -r "${botDir}/${file}" "${backupDir}/${file}" 2>/dev/null || true`)
      } catch (e) {}
    }

    // 2. Verificar cambios en GitHub
    await conn.sendMessage(m.chat, { text: '📥 *Verificando actualizaciones...*' }, { quoted: m })
    
    try {
      await execCmd('git fetch origin')
    } catch (e) {
      await m.react('❌')
      return conn.sendMessage(m.chat, { 
        text: '❌ *Error de conexión*\n\nNo se pudo conectar con GitHub. Verifica tu internet.' 
      }, { quoted: m })
    }

    // 3. Verificar si hay cambios
    const { stdout: status } = await execCmd('git status -uno')
    if (status.includes('Tu rama está actualizada') || status.includes('Your branch is up to date')) {
      await m.react('✅')
      return conn.sendMessage(m.chat, { 
        text: '✅ *Bot actualizado*\n\nNo hay nuevas actualizaciones disponibles.' 
      }, { quoted: m })
    }

    // 4. Obtener cambios disponibles
    const { stdout: cambios } = await execCmd('git log HEAD..origin/main --oneline --no-merges')
    const listaCambios = cambios.split('\n').filter(l => l).slice(0, 5)
    
    let infoCambios = '📝 *Cambios disponibles:*\n'
    listaCambios.forEach((cambio, i) => {
      infoCambios += `\n${i+1}. ${cambio.substring(8)}`
    })
    
    await conn.sendMessage(m.chat, { text: infoCambios }, { quoted: m })

    // 5. Aplicar actualización
    await conn.sendMessage(m.chat, { text: '⚡ *Aplicando actualización...*' }, { quoted: m })
    
    try {
      // Guardar cambios locales
      await execCmd('git stash')
      
      // Hacer pull
      const { stdout: pullResult } = await execCmd('git pull origin main --no-rebase')
      
      // Verificar conflictos
      if (pullResult.includes('CONFLICT') || pullResult.includes('error:')) {
        await execCmd('git merge --abort')
        await execCmd('git stash pop')
        throw new Error('Conflicto al fusionar cambios')
      }
      
      // 6. Verificar si package.json cambió
      const packageChanged = pullResult.toLowerCase().includes('package.json')
      
      if (packageChanged) {
        await conn.sendMessage(m.chat, { text: '📦 *Actualizando dependencias...*' }, { quoted: m })
        
        try {
          await execCmd('npm install --legacy-peer-deps')
        } catch (npmError) {
          await execCmd('npm install --force')
        }
      }

      // 7. Restaurar backups
      await conn.sendMessage(m.chat, { text: '♻️ *Restaurando configuraciones...*' }, { quoted: m })
      
      // Restaurar database.json si existe
      if (await execCmd(`test -f "${backupDir}/database.json" && echo "exists"`).catch(() => {})) {
        await execCmd(`cp "${backupDir}/database.json" "${botDir}/database.json"`)
      }
      
      // Restaurar settings.js si existe
      if (await execCmd(`test -f "${backupDir}/settings.js" && echo "exists"`).catch(() => {})) {
        await execCmd(`cp "${backupDir}/settings.js" "${botDir}/settings.js"`)
      }
      
      // Restaurar sessions si existe
      if (await execCmd(`test -d "${backupDir}/sessions" && echo "exists"`).catch(() => {})) {
        await execCmd(`rm -rf "${botDir}/sessions" 2>/dev/null || true`)
        await execCmd(`cp -r "${backupDir}/sessions" "${botDir}/"`)
      }

      // 8. Obtener información del commit
      const { stdout: commitHash } = await execCmd('git log -1 --pretty=format:"%h"')
      const { stdout: commitMsg } = await execCmd('git log -1 --pretty=format:"%s"')
      
      // Contar archivos cambiados
      const filesChanged = (pullResult.match(/\| \d+ [+-]+/g) || []).length

      // 9. Enviar resumen
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

💾 *Backup guardado en:* ${backupDir}
      `.trim()

      await m.react('✅')
      await conn.sendMessage(m.chat, { text: mensajeFinal }, { quoted: m })

      // 10. Limpiar backup antiguo (opcional)
      setTimeout(async () => {
        try {
          await execCmd(`rm -rf "${backupDir}"`)
        } catch (e) {}
      }, 60000) // Eliminar después de 1 minuto

    } catch (updateError) {
      // Restaurar desde backup en caso de error
      await conn.sendMessage(m.chat, { text: '⚠️ *Error durante la actualización*' }, { quoted: m })
      
      // Intentar restaurar todo
      try {
        await execCmd(`cp "${backupDir}/database.json" "${botDir}/database.json" 2>/dev/null || true`)
        await execCmd(`cp "${backupDir}/settings.js" "${botDir}/settings.js" 2>/dev/null || true`)
        await execCmd(`rm -rf "${botDir}/sessions" 2>/dev/null || true`)
        await execCmd(`cp -r "${backupDir}/sessions" "${botDir}/" 2>/dev/null || true`)
        
        // Revertir cambios de git
        await execCmd('git reset --hard HEAD')
        
        await m.react('❌')
        await conn.sendMessage(m.chat, { 
          text: `❌ *Actualización fallida*\n\nSe restauró la versión anterior.\n\nError: ${updateError.message}\n\n📍 Usa *${usedPrefix}report* para informar el problema.` 
        }, { quoted: m })
      } catch (restoreError) {
        await m.react('💀')
        await conn.sendMessage(m.chat, { 
          text: `💀 *Error crítico*\n\nNo se pudo restaurar el backup.\n\nContacta al desarrollador.\n\nBackup en: ${backupDir}` 
        }, { quoted: m })
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
handler.rowner = true
handler.admin = false
handler.botAdmin = false

export default handler