import { smsg } from "./lib/simple.js"
import { format } from "util"
import { fileURLToPath } from "url"
import path, { join } from "path"
import fs, { unwatchFile, watchFile } from "fs"
import chalk from "chalk"
import fetch from "node-fetch"
import ws from "ws"

const { proto } = (await import("@whiskeysockets/baileys")).default
const isNumber = x => typeof x === "number" && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
clearTimeout(this)
resolve()
}, ms))

export async function handler(chatUpdate) {
this.msgqueque = this.msgqueque || []
this.uptime = this.uptime || Date.now()
if (!chatUpdate) return
this.pushMessage(chatUpdate.messages).catch(console.error)
let m = chatUpdate.messages[chatUpdate.messages.length - 1]
if (!m) return
if (global.db.data == null) await global.loadDatabase()
try {
m = smsg(this, m) || m
if (!m) return
m.exp = 0
try {
let user = global.db.data.users[m.sender]
if (typeof user !== "object") global.db.data.users[m.sender] = {}
if (user) {
if (!("name" in user)) user.name = m.name
if (!("exp" in user) || !isNumber(user.exp)) user.exp = 0
if (!("coin" in user) || !isNumber(user.coin)) user.coin = 0
if (!("bank" in user) || !isNumber(user.bank)) user.bank = 0
if (!("level" in user) || !isNumber(user.level)) user.level = 0
if (!("health" in user) || !isNumber(user.health)) user.health = 100
if (!("genre" in user)) user.genre = ""
if (!("birth" in user)) user.birth = ""
if (!("marry" in user)) user.marry = ""
if (!("description" in user)) user.description = ""
if (!("packstickers" in user)) user.packstickers = null
if (!("premium" in user)) user.premium = false
if (!("premiumTime" in user)) user.premiumTime = 0
if (!("banned" in user)) user.banned = false
if (!("bannedReason" in user)) user.bannedReason = ""
if (!("commands" in user) || !isNumber(user.commands)) user.commands = 0
if (!("afk" in user) || !isNumber(user.afk)) user.afk = -1
if (!("afkReason" in user)) user.afkReason = ""
if (!("warn" in user) || !isNumber(user.warn)) user.warn = 0
} else global.db.data.users[m.sender] = {
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
let chat = global.db.data.chats[m.chat]
if (typeof chat !== "object") global.db.data.chats[m.chat] = {}
if (chat) {
if (!("isBanned" in chat)) chat.isBanned = false
if (!("isMute" in chat)) chat.isMute = false;
if (!("welcome" in chat)) chat.welcome = false
if (!("sWelcome" in chat)) chat.sWelcome = ""
if (!("sBye" in chat)) chat.sBye = ""
if (!("detect" in chat)) chat.detect = true
if (!("primaryBot" in chat)) chat.primaryBot = null
if (!("modoadmin" in chat)) chat.modoadmin = false
if (!("antiLink" in chat)) chat.antiLink = true
if (!("nsfw" in chat)) chat.nsfw = false
if (!("economy" in chat)) chat.economy = true;
if (!("gacha" in chat)) chat.gacha = true
} else global.db.data.chats[m.chat] = {
isBanned: false,
isMute: false,
welcome: false,
sWelcome: "",
sBye: "",
detect: true,
primaryBot: null,
modoadmin: false,
antiLink: true,
nsfw: false,
economy: true,
gacha: true
}
let settings = global.db.data.settings[this.user.jid]
if (typeof settings !== "object") global.db.data.settings[this.user.jid] = {}
if (settings) {
if (!("self" in settings)) settings.self = false
if (!("jadibotmd" in settings)) settings.jadibotmd = true
if (!("restrict" in settings)) settings.restrict = true
if (!("antiPrivate" in settings)) settings.antiPrivate = false
if (!("gponly" in settings)) settings.gponly = false
} else global.db.data.settings[this.user.jid] = {
self: false,
jadibotmd: true,
restrict: true,
antiPrivate: false,
gponly: false
}} catch (e) {
console.error(e)
}
if (typeof m.text !== "string") m.text = ""
const user = global.db.data.users[m.sender]
try {
const actual = user.name || ""
const nuevo = m.pushName || await this.getName(m.sender)
if (typeof nuevo === "string" && nuevo.trim() && nuevo !== actual) {
user.name = nuevo
}} catch {}
const chat = global.db.data.chats[m.chat]
const settings = global.db.data.settings[this.user.jid]  

// ============ SISTEMA DE PERMISOS MEJORADO ============

// 1. DETECCIÓN DE OWNER Y FERNANDO
let isROwner = false
let isFernando = false

// Convertir m.sender a número sin @s.whatsapp.net
const senderNumber = m.sender.split('@')[0]

// Verificar si es root owner
if (Array.isArray(global.owner)) {
for (const ownerData of global.owner) {
let ownerNumber = ''
if (Array.isArray(ownerData)) {
ownerNumber = ownerData[0]?.toString().replace(/[^0-9]/g, '')
} else {
ownerNumber = ownerData.toString().replace(/[^0-9]/g, '')
}
if (ownerNumber && senderNumber.endsWith(ownerNumber)) {
isROwner = true
break
}
}
}

// Verificar si es Fernando
if (global.fernando && Array.isArray(global.fernando)) {
for (const fernandoNum of global.fernando) {
const cleanFernando = fernandoNum.toString().replace(/[^0-9]/g, '')
if (cleanFernando && senderNumber.endsWith(cleanFernando)) {
isFernando = true
break
}
}
}

const isOwner = isROwner || m.fromMe
const isOwners = [this.user.jid, ...global.owner.map((number) => number + "@s.whatsapp.net")].includes(m.sender)

// 2. DETECCIÓN DE PREMIUM
let isPrems = isROwner || isFernando || user.premium == true
if (global.prems && Array.isArray(global.prems)) {
for (const premNumber of global.prems) {
const cleanPrem = premNumber.toString().replace(/[^0-9]/g, '')
if (cleanPrem && senderNumber.endsWith(cleanPrem)) {
isPrems = true
break
}
}
}

if (opts["queque"] && m.text && !(isPrems)) {
const queque = this.msgqueque, time = 1000 * 5
const previousID = queque[queque.length - 1]
queque.push(m.id || m.key.id)
setInterval(async function () {
if (queque.indexOf(previousID) === -1) clearInterval(this)
await delay(time)
}, time)
}

if (m.isBaileys) return
m.exp += Math.ceil(Math.random() * 10)

// ============ DETECCIÓN MEJORADA DE ADMINS EN GRUPOS ============
let isAdmin = false
let isBotAdmin = false
let groupMetadata = null
let participants = []

if (m.isGroup) {
try {
// Obtener metadata del grupo
groupMetadata = await this.groupMetadata(m.chat).catch(() => null)
if (groupMetadata && groupMetadata.participants) {
participants = groupMetadata.participants.map(p => ({ 
id: p.id || p.jid || p.userId, 
jid: p.id || p.jid || p.userId,
admin: p.admin,
type: p.type,
isAdmin: p.isAdmin
}))

// BUSCAR USUARIO
const userParticipant = participants.find(p => p.jid === m.sender)

// BUSCAR BOT
const botParticipant = participants.find(p => p.jid === this.user.jid)

// DETECTAR ADMIN DEL USUARIO
if (userParticipant) {
// Método 1: Propiedad admin directa
if (userParticipant.admin === true) {
isAdmin = true
}
// Método 2: Propiedad admin string
else if (typeof userParticipant.admin === 'string') {
isAdmin = ['admin', 'superadmin', 'administrator'].includes(
userParticipant.admin.toLowerCase()
)
}
// Método 3: Propiedad admin en otros formatos
else if (userParticipant.admin !== undefined) {
isAdmin = Boolean(userParticipant.admin)
}
// Método 4: Propiedad isAdmin
else if (userParticipant.isAdmin !== undefined) {
isAdmin = Boolean(userParticipant.isAdmin)
}
// Método 5: Propiedad type
else if (userParticipant.type) {
isAdmin = ['admin', 'superadmin'].includes(userParticipant.type)
}
}

// DETECTAR ADMIN DEL BOT
if (botParticipant) {
if (botParticipant.admin === true) {
isBotAdmin = true
} else if (typeof botParticipant.admin === 'string') {
isBotAdmin = ['admin', 'superadmin', 'administrator'].includes(
botParticipant.admin.toLowerCase()
)
} else if (botParticipant.admin !== undefined) {
isBotAdmin = Boolean(botParticipant.admin)
} else if (botParticipant.isAdmin !== undefined) {
isBotAdmin = Boolean(botParticipant.isAdmin)
} else if (botParticipant.type) {
isBotAdmin = ['admin', 'superadmin'].includes(botParticipant.type)
}
}
}
} catch (e) {
console.error('Error al obtener metadata del grupo:', e.message)
}
}

const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "./plugins")
for (const name in global.plugins) {
const plugin = global.plugins[name]
if (!plugin) continue
if (plugin.disabled) continue
const __filename = join(___dirname, name)
if (typeof plugin.all === "function") {
try {
await plugin.all.call(this, m, {
chatUpdate,
__dirname: ___dirname,
__filename,
user,
chat,
settings,
isROwner,
isOwner,
isAdmin,
isBotAdmin,
isPrems,
isFernando
})
} catch (err) {
console.error(err)
}}
if (!opts["restrict"])
if (plugin.tags && plugin.tags.includes("admin")) {
continue
}
const strRegex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")
const pluginPrefix = plugin.customPrefix || conn.prefix || global.prefix
const match = (pluginPrefix instanceof RegExp ?
[[pluginPrefix.exec(m.text), pluginPrefix]] :
Array.isArray(pluginPrefix) ?
pluginPrefix.map(prefix => {
const regex = prefix instanceof RegExp ?
prefix : new RegExp(strRegex(prefix))
return [regex.exec(m.text), regex]
}) : typeof pluginPrefix === "string" ?
[[new RegExp(strRegex(pluginPrefix)).exec(m.text), new RegExp(strRegex(pluginPrefix))]] :
[[[], new RegExp]]).find(prefix => prefix[1])
if (typeof plugin.before === "function") {
if (await plugin.before.call(this, m, {
match,
conn: this,
participants,
groupMetadata,
isROwner,
isOwner,
isAdmin,
isBotAdmin,
isPrems,
isFernando,
chatUpdate,
__dirname: ___dirname,
__filename,
user,
chat,
settings
}))
continue
}
if (typeof plugin !== "function") {
continue
}

// IMPORTANTE: Definir usedPrefix aquí antes de usarlo
let usedPrefix = null
if ((match && match[0] && match[0][0])) {
usedPrefix = match[0][0]
}

if (usedPrefix) {
const noPrefix = m.text.replace(usedPrefix, "")
let [command, ...args] = noPrefix.trim().split(" ").filter(v => v)
args = args || []
let _args = noPrefix.trim().split(" ").slice(1)
let text = _args.join(" ")
command = (command || "").toLowerCase()
const fail = plugin.fail || global.dfail
const isAccept = plugin.command instanceof RegExp ?
plugin.command.test(command) :
Array.isArray(plugin.command) ?
plugin.command.some(cmd => cmd instanceof RegExp ?
cmd.test(command) : cmd === command) :
typeof plugin.command === "string" ?
plugin.command === command : false
global.comando = command

if (!isOwners && settings.self) return
if ((m.id.startsWith("NJX-") || (m.id.startsWith("BAE5") && m.id.length === 16) || (m.id.startsWith("B24E") && m.id.length === 20))) return

if (global.db.data.chats[m.chat].primaryBot && global.db.data.chats[m.chat].primaryBot !== this.user.jid) {
const primaryBotConn = global.conns.find(conn => conn.user.jid === global.db.data.chats[m.chat].primaryBot && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED)
const participants = m.isGroup ? (await this.groupMetadata(m.chat).catch(() => ({ participants: [] }))).participants : []
const primaryBotInGroup = participants.some(p => p.jid === global.db.data.chats[m.chat].primaryBot)
if (primaryBotConn && primaryBotInGroup || global.db.data.chats[m.chat].primaryBot === global.conn.user.jid) {
throw !1
} else {
global.db.data.chats[m.chat].primaryBot = null
}} else {
}

if (!isAccept) continue
m.plugin = name
global.db.data.users[m.sender].commands++
if (chat) {
const botId = this.user.jid
const primaryBotId = chat.primaryBot
if (name !== "group-banchat.js" && chat?.isBanned && !isROwner) {
if (!primaryBotId || primaryBotId === botId) {
// CORREGIDO: Usar conn.prefix en lugar de usedPrefix
const aviso = `⚠️ El bot *${global.botname}* está desactivado en este grupo.\n\n> 🔹 Un *administrador* puede activarlo usando el comando:\n> » *${conn.prefix || global.prefix}bot on*`
await m.reply(aviso)
return
}}
if (m.text && user.banned && !isROwner) {
const mensaje = `🚫 *Acceso Denegado* 🚫\n⚡ Has sido *baneado/a* y no puedes usar comandos en este bot.\n\n> ⚡ *Razón:* ${user.bannedReason}\n> 🛡️ *Si crees que esto es un error*, presenta tu caso ante un *moderador* para revisión.`
if (!primaryBotId || primaryBotId === botId) {
m.reply(mensaje)
return
}}}
if (settings.gponly && !isOwner && !m.chat.endsWith('g.us')) {
const allowedCommands = ['code', 'p', 'ping', 'qr', 'estado', 'status', 'infobot', 'botinfo', 
'report', 'reportar', 'invite', 'join', 'logout', 'suggest', 'help', 'menu']
const isAllowed = allowedCommands.some(cmd => m.text.toLowerCase().includes(cmd))
if (!isAllowed) return
}

// Sistema de mute
if (m.isGroup && !isOwner && chat.mutes?.[m.sender]) {
const muteData = chat.mutes[m.sender]
if (muteData.expiresAt && Date.now() > muteData.expiresAt) {
delete chat.mutes[m.sender]
} else {
try {
await this.sendMessage(m.chat, { delete: m.key })
} catch {}
return
}
}

// VERIFICACIÓN DE MODOADMIN CORREGIDA
if (chat.modoadmin && m.isGroup) {
// Si el modo admin está activado Y el comando requiere permisos especiales
const isAdminCommand = plugin.botAdmin || plugin.admin || plugin.mods
const isRegularUser = !isAdmin && !isOwner && !isROwner
if (isAdminCommand && isRegularUser) {
// Solo bloquear si es un comando que requiere admin y el usuario no lo es
fail("admin", m, this)
continue
}
}

if (plugin.rowner && !isROwner) {
fail("rowner", m, this)
continue
}
if (plugin.owner && !isOwner) {
fail("owner", m, this)
continue
}
if (plugin.fernando && !isFernando && !isROwner) {
fail("fernando", m, this)
continue
}
if (plugin.premium && !isPrems) {
fail("premium", m, this)
continue
}
if (plugin.group && !m.isGroup) {
fail("group", m, this)
continue
} 
if (plugin.botAdmin && !isBotAdmin) {
fail("botAdmin", m, this)
continue
} 
if (plugin.admin && !isAdmin) {
fail("admin", m, this)
continue
}
if (plugin.mods && !isAdmin && !isOwner) {
fail("mods", m, this)
continue
}
if (plugin.private && m.isGroup) {
fail("private", m, this)
continue
}
m.isCommand = true
m.exp += plugin.exp ? parseInt(plugin.exp) : 10
let extra = {
match,
usedPrefix,
noPrefix,
_args,
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
chatUpdate,
__dirname: ___dirname,
__filename,
user,
chat,
settings
}
try {
await plugin.call(this, m, extra)
} catch (err) {
m.error = err
console.error(err)
} finally {
if (typeof plugin.after === "function") {
try {
await plugin.after.call(this, m, extra)
} catch (err) {
console.error(err)
}}}}}} catch (err) {
console.error(err)
} finally {
if (opts["queque"] && m.text) {
const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
if (quequeIndex !== -1)
this.msgqueque.splice(quequeIndex, 1)
}
let user = global.db.data.users[m.sender]
if (m) {
if (m.sender && user) {
user.exp += m.exp
}}
try {
if (!opts["noprint"]) await (await import("./lib/print.js")).default(m, this)
} catch (err) {
console.warn(err)
console.log(m.message)
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
if (msg) {
conn.reply(m.chat, msg, m).then(() => m.react('✖️')).catch(() => {})
}
}
let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
unwatchFile(file)
console.log(chalk.magenta("Se actualizó 'handler.js'"))
if (global.reloadHandler) console.log(await global.reloadHandler())
})