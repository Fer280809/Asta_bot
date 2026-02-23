// ============= SISTEMA DE VALIDACIÓN DE CRÉDITOS CIFRADO =============
// ORIGINAL CREATORS: Fer280809 (Fernando)
// PROYECTO: 『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』
// PROTECCIÓN ANTI-FORK NO AUTORIZADO

import crypto from 'crypto'
import chalk from 'chalk'

// ============= CREDENCIALES CIFRADAS =============
// Generadas automáticamente - NO MODIFICAR
const ENCRYPTED_CREDENTIALS = '7b2270726f6a656374223a22e38bb1e38abbefb989e3839ee3839be3839ae38ab8222b226372656174657222e38b8fe382b1e382b2e382aae382b9e382a82066726e6e6e646f222e323032362e327d'

// ============= HASH DE VALIDACIÓN =============
// Se verifica automáticamente al iniciar
const VALIDATION_HASH = 'e8f3d5b9c1a4f7e2d6b8c2a9e5f1d7c3a8b6e4f2d5c8a1b9e3f6d2c7a4b5'

// ============= ENCRIPTADOR/DESENCRIPTADOR =============
function decryptCredentials(encrypted, hash) {
  try {
    // Validar integridad
    const computedHash = crypto.createHash('sha256').update(encrypted).digest('hex')
    if (computedHash !== hash) {
      throw new Error('CREDENCIALES CORROMPIDAS O MODIFICADAS')
    }

    // Desencriptar
    const algorithm = 'aes-256-cbc'
    const key = crypto.createHash('sha256').update('Asta-Bot-Protection-System-2026').digest()
    
    const encryptedBuffer = Buffer.from(encrypted, 'hex')
    const iv = encryptedBuffer.slice(0, 16)
    const encrypted_text = encryptedBuffer.slice(16)
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    let decrypted = decipher.update(encrypted_text)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    
    return decrypted.toString()
  } catch (error) {
    return null
  }
}

// ============= VALIDACIÓN PRINCIPAL =============
export async function validateCredits() {
  try {
    const credentials = decryptCredentials(ENCRYPTED_CREDENTIALS, VALIDATION_HASH)
    
    if (!credentials) {
      console.log('\n' + chalk.red.bold('╔════════════════════════════════════════════════════════╗'))
      console.log(chalk.red.bold('║') + chalk.red('  ⚠️  VALIDACIÓN DE CRÉDITOS FALLÓ - BOT DETENIDO  ⚠️  ') + chalk.red.bold('║'))
      console.log(chalk.red.bold('╚════════════════════════════════════════════════════════╝'))
      process.exit(1)
    }

    const credData = JSON.parse(credentials)
    
    console.log('\n' + chalk.green.bold('╔════════════════════════════════════════════════════════╗'))
    console.log(chalk.green.bold('║') + chalk.cyan('     ✅ VALIDACIÓN DE CRÉDITOS EXITOSA ✅') + chalk.green.bold('║'))
    console.log(chalk.green.bold('╠════════════════════════════════════════════════════════╣'))
    console.log(chalk.green.bold('║') + chalk.yellow.bold(`  PROYECTO: ${credData.project}`) + chalk.green.bold('║').slice(0, -1) + ' '.repeat(58 - credData.project.length - 2) + chalk.green.bold('║'))
    console.log(chalk.green.bold('║') + chalk.yellow.bold(`  CREADOR: ${credData.creator}`) + chalk.green.bold('║').slice(0, -1) + ' '.repeat(58 - credData.creator.length - 2) + chalk.green.bold('║'))
    console.log(chalk.green.bold('║') + chalk.yellow.bold(`  VERSIÓN: ${credData.version}`) + chalk.green.bold('║').slice(0, -1) + ' '.repeat(58 - credData.version.length - 2) + chalk.green.bold('║'))
    console.log(chalk.green.bold('║') + chalk.yellow.bold(`  GITHUB: ${credData.github}`) + chalk.green.bold('║').slice(0, -1) + ' '.repeat(58 - credData.github.length - 2) + chalk.green.bold('║'))
    console.log(chalk.green.bold('║') + chalk.yellow.bold(`  EMAIL: ${credData.email}`) + chalk.green.bold('║').slice(0, -1) + ' '.repeat(58 - credData.email.length - 2) + chalk.green.bold('║'))
    console.log(chalk.green.bold('╠════════════════════════════════════════════════════════╣'))
    console.log(chalk.green.bold('║') + chalk.cyan('  ⚠️  NO REMOVER ESTE SISTEMA - BOT SE DETENDRÁ  ⚠️') + chalk.green.bold('║'))
    console.log(chalk.green.bold('╚════════════════════════════════════════════════════════╝\n'))

    return credData
  } catch (error) {
    console.log('\n' + chalk.red.bold('╔════════════════════════════════════════════════════════╗'))
    console.log(chalk.red.bold('║') + chalk.red('  ❌ ERROR EN VALIDACIÓN - BOT DETENIDO ❌') + chalk.red.bold('║'))
    console.log(chalk.red.bold('║') + chalk.yellow(`  Error: ${error.message}`) + chalk.red.bold('║').slice(0, -1) + ' '.repeat(58 - error.message.length - 2) + chalk.red.bold('║'))
    console.log(chalk.red.bold('╚════════════════════════════════════════════════════════╝\n'))
    process.exit(1)
  }
}

// ============= VALIDACIÓN PERIÓDICA (cada 30 min) =============
export function startCreditsMonitoring() {
  setInterval(() => {
    const credentials = decryptCredentials(ENCRYPTED_CREDENTIALS, VALIDATION_HASH)
    if (!credentials) {
      console.log(chalk.red.bold('\n⚠️  SISTEMA DE CRÉDITOS COMPROMETIDO - DETENIENDO BOT...\n'))
      process.exit(1)
    }
  }, 30 * 60 * 1000) // cada 30 minutos
}

export default { validateCredits, startCreditsMonitoring }
