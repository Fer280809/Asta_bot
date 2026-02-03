import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

var handler = async (m, { usedPrefix, command }) => {
try {
await m.react('🕒')
conn.sendPresenceUpdate('composing', m.chat)

// Mostrar información de depuración primero
let debugInfo = `🔍 *Información de depuración:*\n`
debugInfo += `• Directorio actual: ${process.cwd()}\n`
debugInfo += `• Ubicación del handler: ${__dirname}\n\n`

// Primero intentar con rutas comunes
const baseDir = process.cwd() // Directorio donde se ejecuta el bot
const pluginsDir = path.join(baseDir, 'plugins')

debugInfo += `• Buscando en: ${pluginsDir}\n`

// Verificar si existe la carpeta plugins
if (!fs.existsSync(pluginsDir)) {
debugInfo += `❌ La carpeta 'plugins' NO existe en esa ruta\n\n`
debugInfo += `📂 Contenido de ${baseDir}:\n`
try {
const files = fs.readdirSync(baseDir)
files.forEach(file => {
const fullPath = path.join(baseDir, file)
const stats = fs.statSync(fullPath)
debugInfo += `• ${file} ${stats.isDirectory() ? '(carpeta)' : '(archivo)'}\n`
})
} catch (e) {
debugInfo += `No se pudo leer el directorio: ${e.message}\n`
}

await conn.reply(m.chat, debugInfo, m)
await m.react('❌')
return
}

// Si llegamos aquí, la carpeta existe
debugInfo += `✅ Carpeta 'plugins' encontrada\n\n`

// Función recursiva para buscar archivos .js
function getAllJSFiles(dir, baseDir = dir) {
let results = []
try {
const items = fs.readdirSync(dir)
  
for (const item of items) {
const fullPath = path.join(dir, item)
const relativePath = path.relative(baseDir, fullPath)
    
try {
const stat = fs.statSync(fullPath)
    
if (stat.isDirectory()) {
// Excluir ciertas carpetas
if (!item.includes('node_modules') && !item.startsWith('.') && item !== 'tmp' && item !== 'temp') {
results = results.concat(getAllJSFiles(fullPath, baseDir))
}
} else if (stat.isFile() && item.endsWith('.js')) {
// Solo archivos .js
results.push({
fullPath,
relativePath,
fileName: item
})
}
} catch (e) {
// Ignorar errores en archivos/carpetas específicos
}
}
} catch (e) {
console.error(`Error al leer ${dir}:`, e.message)
}
return results
}

// Obtener todos los archivos .js
const allFiles = getAllJSFiles(pluginsDir)
const totalFiles = allFiles.length

debugInfo += `📊 Encontrados ${totalFiles} archivos .js\n`
await m.react('🔍')

if (totalFiles === 0) {
await conn.reply(m.chat, debugInfo + '\n⚠️ No se encontraron archivos .js para verificar', m)
return
}

// Iniciar verificación
let response = `❀ *Revisión de Syntax Errors:*\n\n`
response += `📁 *Directorio:* ${pluginsDir}\n`
response += `📄 *Archivos a verificar:* ${totalFiles}\n\n`

let hasErrors = false
let filesWithErrors = 0
let filesChecked = 0
const checkMessages = []

// Verificar archivos en lotes para no saturar
for (const fileInfo of allFiles) {
filesChecked++
const { fullPath, relativePath, fileName } = fileInfo
const displayPath = `plugins/${relativePath}`

// Mostrar progreso cada 10 archivos
if (filesChecked % 10 === 0 || filesChecked === totalFiles) {
await conn.sendPresenceUpdate('composing', m.chat)
}

try {
// Formatear la ruta para import
let importPath = fullPath
// Asegurar que la ruta sea absoluta
if (!path.isAbsolute(importPath)) {
importPath = path.resolve(importPath)
}

// Intentar cargar el módulo
await import(`file://${importPath}`)
// Si llega aquí, no hay error de sintaxis
checkMessages.push(`✅ ${displayPath}`)

} catch (error) {
hasErrors = true
filesWithErrors++
// Limpiar mensaje de error
let errorMsg = error.message
// Acortar mensajes largos
if (errorMsg.length > 150) {
errorMsg = errorMsg.substring(0, 150) + '...'
}
// Remover rutas largas
errorMsg = errorMsg.replace(process.cwd(), '').replace(__dirname, '')

checkMessages.push(`❌ ${displayPath}`)
response += `⚠️ *Error en:* ${displayPath}\n`
response += `   ↳ ${errorMsg}\n\n`
}
}

// Agregar resumen
response += `\n📊 *RESUMEN FINAL:*\n`
response += `• Directorio base: ${path.basename(baseDir)}\n`
response += `• Archivos totales: ${totalFiles}\n`
response += `• Verificados: ${filesChecked}\n`
response += `• Con errores: ${filesWithErrors}\n`
response += `• Sin errores: ${totalFiles - filesWithErrors}\n\n`

if (!hasErrors) {
response += '🎉 *¡TODO CORRECTO!* Todos los archivos están libres de errores de sintaxis.'
await m.react('✅')
} else {
response += `⚠️ *ATENCIÓN:* Se encontraron ${filesWithErrors} archivos con errores.`
await m.react('⚠️')
}

// Si hay muchos mensajes, dividir en partes
if (response.length > 3000) {
const parts = []
let currentPart = ''
const lines = response.split('\n')

for (const line of lines) {
if ((currentPart + line + '\n').length > 3000) {
parts.push(currentPart)
currentPart = line + '\n'
} else {
currentPart += line + '\n'
}
}
if (currentPart) parts.push(currentPart)

for (let i = 0; i < parts.length; i++) {
await conn.reply(m.chat, `${parts[i]}\n[Parte ${i + 1}/${parts.length}]`, m)
await new Promise(resolve => setTimeout(resolve, 500))
}
} else {
await conn.reply(m.chat, response, m)
}

} catch (err) {
console.error('Error crítico en comando syntax:', err)
await m.react('💥')
await conn.reply(m.chat, 
`💥 *ERROR CRÍTICO*\n\n` +
`*Mensaje:* ${err.message}\n` +
`*Tipo:* ${err.name}\n` +
`*Stack:* ${err.stack?.split('\n')[0] || 'No disponible'}\n\n` +
`Por favor, usa *${usedPrefix}report* para informar este error.`, 
m)
}}

handler.command = ['syntax', 'detectar', 'errores', 'syntaxcheck', 'check', 'verificar']
handler.help = ['syntax']
handler.tags = ['tools']
handler.rowner = true

export default handler