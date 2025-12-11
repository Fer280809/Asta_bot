# Reemplaza el archivo update.js
cat > ./plugins/update.js << 'EOF'
import fetch from "node-fetch"

let handler = async (m, { conn, usedPrefix }) => {
  try {
    // Verificar si es owner
    if (!global.owner.includes(m.sender.split('@')[0])) {
      return m.reply('🚫 Este comando solo está disponible para el owner del bot.')
    }

    await m.react('🕒')
    const statusMsg = await m.reply('🔄 *Iniciando actualización...*\n⏳ Esto puede tomar 1-2 minutos...')

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

    // Importar módulos
    const fs = await import('fs')

    // 1. Verificar cambios en GitHub
    try {
      await execCmd('git fetch origin')
    } catch (e) {
      await m.react('❌')
      return m.reply('❌ *Error de conexión*\nNo se pudo conectar con GitHub. Verifica tu internet.')
    }

    // 2. Verificar si hay cambios
    const { stdout: status } = await execCmd('git status -uno')
    if (status.includes('Tu rama está actualizada') || status.includes('Your branch is up to date')) {
      await m.react('✅')
      return m.reply('✅ *Bot actualizado*\nNo hay nuevas actualizaciones disponibles.')
    }

    // 3. Crear backup (solo archivos críticos)
    await execCmd(`mkdir -p "${backupDir}"`)
    await execCmd(`cp -r "${botDir}/database.json" "${backupDir}/" 2>/dev/null || true`)
    await execCmd(`cp -r "${botDir}/sessions" "${backupDir}/" 2>/dev/null || true`)

    // 4. Obtener cambios disponibles
    const { stdout: cambios } = await execCmd('git log HEAD..origin/main --oneline --no-merges')
    const listaCambios = cambios.split('\n').filter(l => l).slice(0, 3)

    // 5. Aplicar actualización
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
        try {
          await execCmd('npm install --legacy-peer-deps')
        } catch (npmError) {
          await execCmd('npm install --force')
        }
      }

      // 7. Restaurar backups
      try {
        await execCmd(`cp "${backupDir}/database.json" "${botDir}/" 2>/dev/null || true`)
        await execCmd(`rm -rf "${botDir}/sessions" 2>/dev/null || true`)
        await execCmd(`cp -r "${backupDir}/sessions" "${botDir}/" 2>/dev/null || true`)
      } catch (e) {
        // Continuar si no se pueden restaurar
      }

      // 8. Obtener información del commit
      const { stdout: commitHash } = await execCmd('git log -1 --pretty=format:"%h"')
      const { stdout: commitMsg } = await execCmd('git log -1 --pretty=format:"%s"')

      // 9. Enviar resumen final
      const mensajeFinal = `
✅ *ACTUALIZACIÓN COMPLETADA*

🔧 *Detalles:*
🆕 Commit: ${commitHash.trim()}
📝 Mensaje: ${commitMsg.trim()}
🔧 Dependencias: ${packageChanged ? 'Actualizadas' : 'Sin cambios'}

📌 *Cambios aplicados:*
${listaCambios.map((c, i) => `• ${c.substring(8)}`).join('\n')}

⚠️ *Reinicia el bot con:* ${usedPrefix}reiniciar
      `.trim()

      await m.react('✅')
      await m.reply(mensajeFinal)

      // 10. Limpiar backup después de 30 segundos
      setTimeout(async () => {
        try {
          await execCmd(`rm -rf "${backupDir}"`)
        } catch (e) {}
      }, 30000)

    } catch (updateError) {
      // Restaurar desde backup en caso de error
      try {
        await execCmd(`cp "${backupDir}/database.json" "${botDir}/" 2>/dev/null || true`)
        await execCmd(`rm -rf "${botDir}/sessions" 2>/dev/null || true`)
        await execCmd(`cp -r "${backupDir}/sessions" "${botDir}/" 2>/dev/null || true`)
        await execCmd('git reset --hard HEAD')
      } catch (e) {}

      await m.react('❌')
      await m.reply(`❌ *Actualización fallida*\n\nSe restauró la versión anterior.\n\nError: ${updateError.message}`)
    }

  } catch (error) {
    await m.react('✖️')
    await m.reply(`⚠️ *Error inesperado*\n${error.message}`)
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
EOF