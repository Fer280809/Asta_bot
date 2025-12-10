import { smsg } from "./lib/simple.js"
import { format } from "util"
import { fileURLToPath } from "url"
import path, { join } from "path"
import fs, { unwatchFile, watchFile } from "fs"
import chalk from "chalk"
import fetch from "node-fetch"

const { proto } = (await import("@whiskeysockets/baileys")).default
const isNumber = x => typeof x === "number" && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
clearTimeout(this)
resolve()
}, ms))

export async function handler(chatUpdate) {
// Validaciones ultrarrápidas
if (!chatUpdate?.messages?.length) return
let m = chatUpdate.messages[chatUpdate.messages.length - 1]
if (!m || !m.message) return
if (m.key?.remoteJid === 'status@broadcast') return

// Cargar DB solo si no existe
if (!global.db.data) await global.loadDatabase()

try {
// Procesar mensaje
m = smsg(this, m) || m
if (!m) return
if (m.isBaileys) return
if (m.id?.startsWith("BAE5") || m.id?.startsWith("B24E") || m.id?.startsWith("NJX-")) return

m.exp = 0

// Inicializar usuario (simplificado)
let user = global.db.data.users[m.sender]
if (!user) {
global.db.data.users[m.sender] = {
name: m.name,
exp: 0,
coin: 0,
bank: 0,
level: 0,
health: 100,
genre: "",
birth: "",
marry: "",
description: "",
packstickers: null,
premium: false,
premiumTime: 0,
banned: false,
bannedReason: "",
commands: 0,
afk: -1,
afkReason: "",
warn: 0
}
user = global.db.data.users[m.sender]
}

// Actualizar nombre solo si cambió
if (m.pushName && user.name !== m.pushName) user.name = m.pushName

// Inicializar chat (simplificado)
let chat = global.db.data.chats[m.chat]
if (!chat) {
global.db.data.chats[m.chat] = {
isBanned: false,
isMute: false,
mutes: {},
welcome: false,
sWelcome: "",
sBye: "",
detect: true,
modoadmin: false,
antiLink: true,
nsfw: false,
economy: true,
gacha: true
}
chat = global.db.data.chats[m.chat]
}

// Inicializar settings (simplificado)
let settings = global.db.data.settings[this.user.jid]
if (!settings) {
global.db.data.settings[this.user.jid] = {
self: false,
jadibotmd: true,
restrict: true,
antiPrivate: false,
gponly: false
}
settings = global.db.data.settings[this.user.jid]
}

if (typeof m.text !== "string") m.text = ""

// Permisos (optimizado)
const isROwner = global.owner.some(([number]) => (number + '@s.whatsapp.net') === m.sender)
const isOwner = isROwner || m.fromMe
const isPrems = isROwner || global.prems.some(v => (v.replace(/[^0-9]/g, "") + '@s.whatsapp.net') === m.sender) || user.premium
const isFernando = global.fernando?.some(v => (v.replace(/[^0-9]/g, "") + '@s.whatsapp.net') === m.sender)

// Verificaciones rápidas
if (!isOwner && settings.self) return
if (settings.gponly && !isOwner && !m.chat.endsWith('g.us') && !/code|p|ping|qr|estado|status|infobot|botinfo|report|reportar|invite|join|logout|suggest|help|menu/i.test(m.text)) return

// Sistema de mute (solo si es necesario)
if (m.isGroup && !isOwner && chat.mutes?.[m.sender]) {
const muteData = chat.mutes[m.sender]
if (muteData.expiresAt && Date.now() > muteData.expiresAt) {
delete chat.mutes[m.sender]
} else {
try {
await this.sendMessage(m.chat, { delete: m.key })
} catch {}
return
}}

m.exp += Math.ceil(Math.random() * 10)

// Metadata solo cuando es necesario
let groupMetadata = {}, participants = [], isAdmin = false, isBotAdmin = false
if (m.isGroup) {
groupMetadata = conn.chats[m.chat]?.metadata || await this.groupMetadata(m.chat).catch(() => ({}))
participants = groupMetadata.participants || []
const userGroup = participants.find(u => u.id === m.sender || u.jid === m.sender)
const botGroup = participants.find(u => (u.id || u.jid) === this.user.jid)
isAdmin = userGroup?.admin === "admin" || userGroup?.admin === "superadmin"
isBotAdmin = !!botGroup?.admin
}

// Procesar plugins
const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "./plugins")
for (const name in global.plugins) {
const plugin = global.plugins[name]
if (!plugin || plugin.disabled) continue

const __filename = join(___dirname, name)

// Plugin.all
if (typeof plugin.all === "function") {
try {
await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename, user, chat, settings })
} catch (e) {
console.error(e)
}}

// Verificar si tiene comandos
if (typeof plugin !== "function") continue

// Procesar prefijo
const pluginPrefix = plugin.customPrefix || conn.prefix || global.prefix
let usedPrefix, command

if (pluginPrefix instanceof RegExp) {
const match = pluginPrefix.exec(m.text)
if (match) {
usedPrefix = match[0]
const noPrefix = m.text.replace(usedPrefix, "")
command = noPrefix.trim().split(" ")[0]?.toLowerCase()
}
} else if (Array.isArray(pluginPrefix)) {
for (const prefix of pluginPrefix) {
const regex = prefix instanceof RegExp ? prefix : new RegExp(`^${prefix.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")}`)
const match = regex.exec(m.text)
if (match) {
usedPrefix = match[0]
const noPrefix = m.text.replace(usedPrefix, "")
command = noPrefix.trim().split(" ")[0]?.toLowerCase()
break
}
}
} else if (typeof pluginPrefix === "string") {
if (m.text.startsWith(pluginPrefix)) {
usedPrefix = pluginPrefix
const noPrefix = m.text.replace(usedPrefix, "")
command = noPrefix.trim().split(" ")[0]?.toLowerCase()
}
}

if (!usedPrefix || !command) continue

// Verificar comando
const isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) :
Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
typeof plugin.command === "string" ? plugin.command === command : false

if (!isAccept) continue

global.comando = command
m.plugin = name
user.commands = (user.commands || 0) + 1

// Verificaciones de chat
if (!isROwner) {
if (name !== "group-banchat.js" && chat?.isBanned) {
await m.reply(`⚠️ El bot *${global.botname}* está desactivado en este grupo.\n\n> 🔹 Un *administrador* puede activarlo usando el comando:\n> » *${usedPrefix}bot on*`)
return
}
if (user.banned) {
await m.reply(`🚫 *Acceso Denegado* 🚫\n⚡ Has sido *baneado/a* y no puedes usar comandos en este bot.\n\n> ⚡ *Razón:* ${user.bannedReason}\n> 🛡️ *Si crees que esto es un error*, presenta tu caso ante un *moderador* para revisión.`)
return
}}

// Verificar admin mode
if (chat.modoadmin && !isOwner && m.isGroup && !isAdmin && (plugin.botAdmin || plugin.admin || plugin.group)) continue

// Verificar permisos
const fail = plugin.fail || global.dfail
if (plugin.rowner && !isROwner) { fail("rowner", m, this); continue }
if (plugin.owner && !isOwner) { fail("owner", m, this); continue }
if (plugin.fernando && !isFernando && !isROwner) { fail("fernando", m, this); continue }
if (plugin.premium && !isPrems) { fail("premium", m, this); continue }
if (plugin.group && !m.isGroup) { fail("group", m, this); continue }
if (plugin.botAdmin && !isBotAdmin) { fail("botAdmin", m, this); continue }
if (plugin.admin && !isAdmin) { fail("admin", m, this); continue }
if (plugin.private && m.isGroup) { fail("private", m, this); continue }

// Ejecutar plugin
m.isCommand = true
m.exp += plugin.exp || 10

const noPrefix = m.text.replace(usedPrefix, "")
const args = noPrefix.trim().split(" ").slice(1)
const text = args.join(" ")

try {
await plugin.call(this, m, {
usedPrefix,
noPrefix,
args,
command,
text,
conn: this,
participants,
groupMetadata,
isROwner,
isOwner,
isAdmin,
isBotAdmin,
isPrems,
isFernando,
user,
chat,
settings
})
} catch (e) {
m.error = e
console.error(e)
}}

// Actualizar experiencia
if (m.sender) user.exp += m.exp

} catch (e) {
console.error(e)
} finally {
// Imprimir mensaje
try {
if (!opts["noprint"]) await (await import("./lib/print.js")).default(m, this)
} catch (e) {
console.log(m)
}}}

global.dfail = (type, m, conn) => {
const msg = {
rowner: `💠 *Acceso denegado* 💠\nEl comando *${global.comando}* solo puede ser usado por los *creadores del bot*.`, 
owner: `💠 *Acceso denegado* 💠\nEl comando *${global.comando}* solo puede ser usado por los *desarrolladores del bot*.`, 
mods: `🛡️ *Permiso insuficiente* 🛡️\nEl comando *${global.comando}* solo puede ser usado por los *moderadores del bot*.`, 
fernando: `🔐 *ACCESO RESTRINGIDO* 🔐\nEl comando *${global.comando}* es *exclusivo* para el desarrollador principal *Fernando*.\n\n> 🛡️ Solo Fernando puede ejecutar este comando.\n> 🔒 Acceso denegado para otros usuarios.`,
premium: `⭐ *Exclusivo Premium* ⭐\nEl comando *${global.comando}* solo puede ser usado por *usuarios premium*.`, 
group: `👥 *Solo en grupos* 👥\nEl comando *${global.comando}* solo puede ejecutarse dentro de un *grupo*.`,
private: `📩 *Solo privado* 📩\nEl comando *${global.comando}* solo puede usarse en *chat privado* con el bot.`,
admin: `⚠️ *Requiere permisos de admin* ⚠️\nEl comando *${global.comando}* solo puede ser usado por los *administradores del grupo*.`, 
botAdmin: `🤖 *Necesito permisos* 🤖\nPara ejecutar *${global.comando}*, el bot debe ser *administrador del grupo*.`,
restrict: `⛔ *Funcionalidad desactivada* ⛔\nEsta característica está *temporalmente deshabilitada*.`
}[type]
if (msg) conn.reply(m.chat, msg, m, global.rcanal).then(() => m.react('✖️')).catch(() => {})
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
unwatchFile(file)
console.log(chalk.magenta("Se actualizo 'handler.js'"))
if (global.reloadHandler) console.log(await global.reloadHandler())
})