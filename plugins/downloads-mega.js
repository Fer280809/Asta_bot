import path from "path"
import { File } from "megajs"

const handler = async (m, { conn, args, usedPrefix, command, text }) => {
if (!text) return conn.reply(m.chat, `🎁 ¡Ho-ho-ho! Envía un link de MEGA para que los renos traigan tu archivo.`, m)
try {
await m.react('🎁')
const file = File.fromURL(text)
await file.loadAttributes()
let maxSize = 300 * 1024 * 1024;
if (file.size >= maxSize) {
return conn.reply(m.chat, `❄️ ¡Uff! Este regalo pesa más de 300MB, el trineo no puede con tanto.`, m)
}
let cap = `*🎄 ¡MEGA - X-MAS DOWNLOADER! 乂*\n\n🎁 Nombre : ${file.name}\n⚖️ Peso : ${formatBytes(file.size)}\n🔗 Trineo : ${text}`
m.reply(cap)
const data = await file.downloadBuffer()
const fileExtension = path.extname(file.name).toLowerCase()
const mimeTypes = { ".mp4": "video/mp4", ".pdf": "application/pdf", ".zip": "application/zip", ".rar": "application/x-rar-compressed", ".7z": "application/x-7z-compressed", ".jpg": "image/jpeg", ".png": "image/png" }
let mimetype = mimeTypes[fileExtension] || "application/octet-stream"
await conn.sendFile(m.chat, data, file.name, "", m, null, { mimetype, asDocument: true })
await m.react('🌟')
} catch (e) {
await m.react('✖️')
return conn.reply(m.chat, `⚠︎ El Grinch bloqueó la descarga de Mega.\n> Usa *${usedPrefix}report* para informarlo.`, m)
}}

handler.help = ['mega']
handler.tags = ['descargas']
handler.command = ['mega']
export default handler

function formatBytes(bytes, decimals = 2) {
if (bytes === 0) return '0 Bytes'
const k = 1024
const dm = decimals < 0 ? 0 : decimals
const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
const i = Math.floor(Math.log(bytes) / Math.log(k))
return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
