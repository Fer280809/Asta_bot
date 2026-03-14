
let handler = async (m, { conn, text, command, usedPrefix }) => {

if (command === 'testspeed' || command === 'testvelocidad') {
const start = Date.now()
await m.reply('⏱️ Midiendo velocidad de respuesta...')
const end = Date.now()
const responseTime = end - start

let speedMsg = `📊 *TEST DE VELOCIDAD*\n\n`
speedMsg += `⚡ Tiempo de respuesta: *${responseTime}ms*\n\n`

if (responseTime < 1000) {
speedMsg += `✅ *EXCELENTE* - Bot muy rápido`
} else if (responseTime < 3000) {
speedMsg += `⚠️ *ACEPTABLE* - Bot normal`  
} else if (responseTime < 7000) {
speedMsg += `🐌 *LENTO* - Hay problemas de rendimiento`
} else {
speedMsg += `❌ *MUY LENTO* - Problema crítico detectado`
}

speedMsg += `\n\n💡 *Causa probable:*\n`
if (responseTime > 7000) speedMsg += `• Base de datos corrupta\n• Demasiados grupos\n• Falta de memoria\n• Plugins problemáticos`

await m.reply(speedMsg)
}

if (command === 'fixbot' || command === 'arreglarbot') {
await m.reply('🔧 *REPARACIÓN AUTOMÁTICA INICIADA*\n\n⏳ Aplicando todas las correcciones...')

let fixes = []

try {
// 1. DESACTIVAR QUEUE (causa común de lentitud)
if (global.opts) {
global.opts['queque'] = false
global.opts['restrict'] = false
fixes.push('✅ Queue desactivado')
}

// 2. LIMPIAR MENSAJES PENDIENTES
if (conn.msgqueque) {
conn.msgqueque = []
fixes.push('✅ Cola de mensajes limpiada')
}

// 3. LIMPIAR METADATA EN MEMORIA
let metaCleared = 0
if (conn.chats) {
for (let chat in conn.chats) {
if (conn.chats[chat].metadata) {
delete conn.chats[chat].metadata
metaCleared++
}
if (conn.chats[chat].messages) {
conn.chats[chat].messages = []
}}}
fixes.push(`✅ ${metaCleared} metadata limpiadas`)

// 4. LIMPIAR USUARIOS VACÍOS
let usersClean = 0
if (global.db?.data?.users) {
for (let user in global.db.data.users) {
const u = global.db.data.users[user]
if (u.exp === 0 && u.level === 0 && u.coin === 0 && !u.premium && u.banned === false) {
delete global.db.data.users[user]
usersClean++
}}}
fixes.push(`✅ ${usersClean} usuarios vacíos eliminados`)

// 5. LIMPIAR CHATS INEXISTENTES
let chatsClean = 0
if (global.db?.data?.chats && conn.chats) {
const existingChats = Object.keys(conn.chats)
for (let chat in global.db.data.chats) {
if (!existingChats.includes(chat)) {
delete global.db.data.chats[chat]
chatsClean++
}}}
fixes.push(`✅ ${chatsClean} chats inexistentes eliminados`)

// 6. FORZAR GARBAGE COLLECTION
if (global.gc) {
global.gc()
fixes.push('✅ Garbage collector ejecutado')
}

// 7. GUARDAR BASE DE DATOS
if (global.db?.write) {
await global.db.write()
fixes.push('✅ Base de datos guardada')
}

await new Promise(resolve => setTimeout(resolve, 2000))

let fixMsg = `✅ *REPARACIÓN COMPLETADA*\n\n`
fixMsg += `📋 *Correcciones aplicadas:*\n`
fixes.forEach(f => fixMsg += `${f}\n`)
fixMsg += `\n⚡ *El bot debería estar más rápido*\n\n`
fixMsg += `🔄 *Recomendación:* Reinicia el bot con *${usedPrefix}restart*`

await m.reply(fixMsg)

} catch (e) {
console.error('Error en fixbot:', e)
await m.reply('❌ *Error durante la reparación*\n\n' + e.message)
}}

if (command === 'botinfo' || command === 'infobot') {
try {
const totalChats = Object.keys(conn.chats || {}).length
const groups = Object.keys(conn.chats || {}).filter(v => v.endsWith('@g.us')).length
const privates = totalChats - groups
const totalUsers = Object.keys(global.db?.data?.users || {}).length
const totalPlugins = Object.keys(global.plugins || {}).length
const activePlugins = Object.values(global.plugins || {}).filter(p => !p.disabled).length

const memUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
const memTotal = (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)

const uptime = process.uptime()
const hours = Math.floor(uptime / 3600)
const minutes = Math.floor((uptime % 3600) / 60)

let infoMsg = `🤖 *INFORMACIÓN DEL BOT*\n\n`
infoMsg += `*📊 Estadísticas:*\n`
infoMsg += `• Chats totales: ${totalChats}\n`
infoMsg += `• Grupos: ${groups}\n`
infoMsg += `• Privados: ${privates}\n`
infoMsg += `• Usuarios registrados: ${totalUsers}\n`
infoMsg += `• Plugins activos: ${activePlugins}/${totalPlugins}\n\n`

infoMsg += `*💾 Recursos:*\n`
infoMsg += `• Memoria: ${memUsed}MB / ${memTotal}MB\n`
infoMsg += `• Uptime: ${hours}h ${minutes}m\n\n`

if (groups > 50) infoMsg += `⚠️ *ADVERTENCIA:* Demasiados grupos (${groups})\n`
if (memUsed > 500) infoMsg += `⚠️ *ADVERTENCIA:* Uso alto de memoria\n`
if (totalUsers > 5000) infoMsg += `⚠️ *ADVERTENCIA:* Base de datos muy grande\n`

await m.reply(infoMsg)

} catch (e) {
console.error('Error en botinfo:', e)
await m.reply('❌ Error obteniendo información')
}}

if (command === 'listgroups' || command === 'listargrupos') {
try {
const groups = Object.keys(conn.chats || {}).filter(v => v.endsWith('@g.us'))
  
if (groups.length === 0) {
return m.reply('📭 El bot no está en ningún grupo')
}

let groupList = `📊 *GRUPOS DEL BOT* (${groups.length})\n\n`
  
for (let i = 0; i < Math.min(groups.length, 50); i++) {
const groupId = groups[i]
try {
const metadata = await conn.groupMetadata(groupId).catch(() => null)
if (metadata) {
groupList += `${i + 1}. ${metadata.subject}\n`
groupList += `   • ID: ${groupId.split('@')[0]}\n`
groupList += `   • Participantes: ${metadata.participants?.length || 0}\n\n`
}
} catch {}
}

if (groups.length > 50) {
groupList += `\n... y ${groups.length - 50} grupos más`
}

await m.reply(groupList)

} catch (e) {
console.error('Error en listgroups:', e)
await m.reply('❌ Error listando grupos')
}}

if (command === 'leavegroup' || command === 'salirgrupo') {
if (!m.isGroup) return m.reply('👥 Este comando solo funciona en grupos')
  
await m.reply('👋 Adiós! El bot saldrá del grupo...')
await new Promise(resolve => setTimeout(resolve, 2000))
await conn.groupLeave(m.chat)
}

if (command === 'disableplugin' || command === 'desactivarplugin') {
if (!text) return m.reply(`📝 *Uso:* ${usedPrefix + command} <nombre del plugin>\n\n*Ejemplo:* ${usedPrefix + command} downloader-tiktok.js`)

const pluginName = text.trim()
if (!global.plugins[pluginName]) {
return m.reply(`❌ Plugin *${pluginName}* no encontrado\n\n💡 Usa *${usedPrefix}listplugins* para ver todos`)
}

global.plugins[pluginName].disabled = true
await m.reply(`✅ Plugin *${pluginName}* desactivado correctamente\n\n🔄 Reinicia el bot para aplicar cambios`)
}

if (command === 'listplugins' || command === 'listarplugins') {
const plugins = Object.keys(global.plugins || {})
const active = plugins.filter(p => !global.plugins[p].disabled)
const disabled = plugins.filter(p => global.plugins[p].disabled)

let listMsg = `🔌 *PLUGINS DEL BOT*\n\n`
listMsg += `📊 *Estadísticas:*\n`
listMsg += `• Total: ${plugins.length}\n`
listMsg += `• Activos: ${active.length}\n`
listMsg += `• Desactivados: ${disabled.length}\n\n`

if (disabled.length > 0) {
listMsg += `⛔ *Plugins desactivados:*\n`
disabled.forEach(p => listMsg += `• ${p}\n`)
}

await m.reply(listMsg)
}
}

handler.help = ['testspeed', 'fixbot', 'botinfo', 'listgroups', 'leavegroup', 'disableplugin', 'listplugins']
handler.tags = ['owner']
handler.command = /^(testspeed|testvelocidad|fixbot|arreglarbot|botinfo|infobot|listgroups|listargrupos|leavegroup|salirgrupo|disableplugin|desactivarplugin|listplugins|listarplugins)$/i
handler.fernando = true

export default handler