import fs from 'fs'
import { exec } from 'child_process'
import { promisify } from 'util'
import { join } from 'path'
import chalk from 'chalk'

const execAsync = promisify(exec)

export async function before(m, { conn, args, usedPrefix, command }) {
  // Verificar si es owner
  if (!global.owner.includes(m.sender.split('@')[0])) {
    return m.reply('🚫 Este comando solo está disponible para el owner del bot.')
  }

  // Obtener directorio base
  const botDir = process.cwd()
  const backupDir = join(botDir, 'backup_astra')
  const dbFile = join(botDir, 'database.json')
  const settingsFile = join(botDir, 'settings.js')
  
  await m.reply('🔄 *Iniciando actualización automática...*\n\n⏳ Esto puede tomar unos minutos.')
  
  try {
    // Crear directorio de backup si no existe
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    // 1. Respaldar archivos críticos
    await m.reply('💾 *Respaldando archivos importantes...*')
    
    const backups = []
    if (fs.existsSync(dbFile)) {
      fs.copyFileSync(dbFile, join(backupDir, 'database.json'))
      backups.push('✅ Base de datos')
    }
    
    if (fs.existsSync(settingsFile)) {
      fs.copyFileSync(settingsFile, join(backupDir, 'settings.js'))
      backups.push('✅ Configuración')
    }
    
    // Respaldar sesiones si existen
    const sessionsDir = join(botDir, 'sessions')
    if (fs.existsSync(sessionsDir)) {
      const sessionBackup = join(backupDir, 'sessions_backup')
      if (!fs.existsSync(sessionBackup)) {
        fs.mkdirSync(sessionBackup, { recursive: true })
      }
      // Copiar contenido de sessions
      const sessionFiles = fs.readdirSync(sessionsDir)
      sessionFiles.forEach(file => {
        fs.copyFileSync(
          join(sessionsDir, file),
          join(sessionBackup, file)
        )
      })
      backups.push('✅ Sesiones activas')
    }

    // 2. Obtener cambios del repositorio
    await m.reply('📥 *Verificando actualizaciones en GitHub...*')
    
    const { stdout: fetchOutput } = await execAsync('git fetch origin', { cwd: botDir })
    
    // Verificar si hay cambios
    const { stdout: statusOutput } = await execAsync('git status -uno', { cwd: botDir })
    
    if (statusOutput.includes('Your branch is up to date')) {
      await m.reply('✅ *El bot ya está actualizado*\n\nNo hay cambios disponibles en el repositorio.')
      return
    }

    // 3. Mostrar cambios disponibles
    const { stdout: logOutput } = await execAsync(
      'git log HEAD..origin/main --oneline --no-merges',
      { cwd: botDir }
    )
    
    const changes = logOutput.trim().split('\n').filter(line => line).slice(0, 5)
    let changelog = '*📝 Cambios disponibles:*\n'
    changes.forEach((change, i) => {
      changelog += `\n${i+1}. ${change.substring(8)}`
    })

    await m.reply(`${changelog}\n\n🔄 *Procediendo con la actualización...*`)

    // 4. Aplicar actualización (stash cambios locales primero)
    await execAsync('git stash', { cwd: botDir })
    const { stdout: pullOutput } = await execAsync('git pull origin main', { cwd: botDir })
    
    // Verificar si hubo conflictos
    if (pullOutput.includes('CONFLICT') || pullOutput.includes('error:')) {
      // Revertir en caso de conflicto
      await execAsync('git merge --abort', { cwd: botDir })
      await execAsync('git stash pop', { cwd: botDir })
      throw new Error('Conflicto al fusionar cambios. Actualización abortada.')
    }

    // 5. Verificar si hay cambios en package.json
    const packageChanged = pullOutput.toLowerCase().includes('package.json')
    
    if (packageChanged) {
      await m.reply('📦 *Actualizando dependencias...*\n\nEsto puede tardar unos minutos.')
      
      // Instalar dependencias
      const { stdout: npmOutput } = await execAsync('npm install --legacy-peer-deps', { cwd: botDir })
      
      // Verificar si hay errores críticos
      if (npmOutput.includes('ERR!') && npmOutput.includes('critical')) {
        // Reintentar con force
        await execAsync('npm install --force', { cwd: botDir })
      }
    }

    // 6. Restaurar archivos respaldados
    await m.reply('♻️ *Restaurando configuraciones...*')
    
    if (fs.existsSync(join(backupDir, 'database.json'))) {
      fs.copyFileSync(join(backupDir, 'database.json'), dbFile)
    }
    
    if (fs.existsSync(join(backupDir, 'settings.js'))) {
      fs.copyFileSync(join(backupDir, 'settings.js'), settingsFile)
    }

    // 7. Preparar mensaje final
    const commitHash = (await execAsync('git log -1 --pretty=format:"%h"', { cwd: botDir })).stdout.trim()
    const commitMessage = (await execAsync('git log -1 --pretty=format:"%s"', { cwd: botDir })).stdout.trim()
    const filesChanged = pullOutput.match(/\| \d+ [+-]+/g) || []
    
    const updateSummary = `
✅ *ACTUALIZACIÓN COMPLETADA*

📊 *Resumen:*
🆕 Commit: ${commitHash}
📝 Mensaje: ${commitMessage}
📄 Archivos: ${filesChanged.length} modificados
🔧 Dependencias: ${packageChanged ? 'Actualizadas' : 'Sin cambios'}

💾 *Backups realizados:*
${backups.join('\n')}

⚠️ *Reinicia el bot para aplicar cambios:*
• \`#reiniciar\` - Reiniciar ahora
• \`#detener\` y \`#iniciar\` - Control manual

📌 *Cambios aplicados:*
${changes.map(c => `• ${c.substring(8)}`).join('\n')}
    `.trim()

    await m.reply(updateSummary)

    // 8. Registrar actualización en logs
    const logEntry = `[${new Date().toISOString()}] Actualización completada - Commit: ${commitHash} - User: ${m.sender}\n`
    fs.appendFileSync(join(botDir, 'update_log.txt'), logEntry)

  } catch (error) {
    console.error('Error en actualización:', error)
    
    // Mensaje de error detallado
    const errorMsg = `
❌ *ERROR EN ACTUALIZACIÓN*

🔍 Detalles:
${error.message}

💡 Soluciones:
1. Verifica tu conexión a internet
2. Comprueba que GitHub esté accesible
3. Ejecuta manualmente en Termux:
   \`\`\`
   cd ~/Asta_bot
   git pull origin main
   \`\`\`

⚠️ Los archivos de respaldo se mantienen en:
${backupDir}
    `.trim()
    
    await m.reply(errorMsg)
  }
}

// Metadata del comando
export const command = ['actualizar', 'update', 'upgrade']
export const desc = 'Actualizar el bot desde GitHub (Owner only)'
export const category = 'Owner'
export const owner = true
export const admin = false
export const botAdmin = false