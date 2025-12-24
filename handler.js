// handler.js - VERSIÓN OPTIMIZADA
import { smsg } from "./lib/simple.js"
import { format } from "util"
import { fileURLToPath } from "url"
import path, { join } from "path"
import fs, { unwatchFile, watchFile } from "fs"
import chalk from "chalk"
import fetch from "node-fetch"
import ws from "ws"

// ============ MÓDULOS OPTIMIZADOS ============
import { UserManager } from './lib/database/userManager.js'
import { ChatManager } from './lib/database/chatManager.js'
import { DatabaseCache } from './lib/database/cacheLayer.js'
import { PermissionManager } from './lib/commandSystem/permissionManager.js'
import { CommandLoader } from './lib/commandSystem/commandLoader.js'
import { CommandExecutor } from './lib/commandSystem/commandExecutor.js'
import { FloodProtection } from './lib/middlewares/antiFlood.js'
import { StatsTracker } from './lib/middlewares/statsTracker.js'

// ============ INICIALIZACIÓN DE MÓDULOS ============
const dbCache = new DatabaseCache()
const floodProtection = new FloodProtection(5, 5000) // 5 requests en 5 segundos
const statsTracker = new StatsTracker()

// ============ FUNCIONES AUXILIARES ============
const isNumber = x => typeof x === "number" && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
    clearTimeout(this)
    resolve()
}, ms))

// ============ HANDLER PRINCIPAL OPTIMIZADO ============
export async function handler(chatUpdate) {
    try {
        // 1. INICIALIZACIÓN BÁSICA
        this.msgqueque = this.msgqueque || []
        this.uptime = this.uptime || Date.now()
        if (!chatUpdate) return
        
        // 2. PROCESAR MENSAJES EN COLA
        await this.pushMessage(chatUpdate.messages).catch(console.error)
        
        // 3. OBTENER ÚLTIMO MENSAJE
        let m = chatUpdate.messages[chatUpdate.messages.length - 1]
        if (!m) return
        
        // 4. CARGAR BASE DE DATOS SI ES NECESARIO
        if (global.db.data == null) await global.loadDatabase()
        
        // 5. CONVERTIR MENSAJE
        m = smsg(this, m) || m
        if (!m) return
        m.exp = 0
        
        // 6. PROTECCIÓN ANTI-FLOOD
        if (!await PermissionManager.isExemptFromFlood(m.sender)) {
            if (!floodProtection.check(m.sender)) {
                console.log(chalk.yellow(`⚠ Flood detectado de ${m.sender}`))
                return
            }
        }
        
        // 7. GESTIÓN DE DATOS DEL USUARIO (OPTIMIZADO)
        const userData = await dbCache.getUser(m.sender, async () => {
            return UserManager.ensureUserSchema(
                global.db.data.users[m.sender] || {},
                m.sender,
                m.pushName || m.name
            )
        })
        
        // 8. GESTIÓN DE DATOS DEL CHAT (OPTIMIZADO)
        const chatData = await dbCache.getChat(m.chat, async () => {
            return ChatManager.ensureChatSchema(
                global.db.data.chats[m.chat] || {},
                m.chat
            )
        })
        
        // 9. GESTIÓN DE CONFIGURACIÓN
        const settings = ChatManager.ensureSettingsSchema(
            global.db.data.settings[this.user.jid] || {}
        )
        
        // 10. ACTUALIZAR NOMBRE DEL USUARIO SI CAMBIÓ
        await UserManager.updateUserName(m.sender, m.pushName || await this.getName(m.sender).catch(() => null))
        
        // 11. VERIFICAR PERMISOS (OPTIMIZADO)
        const permissions = await PermissionManager.checkAll(m, this, {
            userData,
            chatData,
            settings
        })
        
        // 12. VALIDAR ACCESO BÁSICO
        if (settings.self && !permissions.isOwners) return
        if (settings.gponly && !permissions.isOwners && !m.chat.endsWith('g.us')) {
            const allowedCommands = /code|p|ping|qr|estado|status|infobot|botinfo|report|reportar|invite|join|logout|suggest|help|menu/i
            if (!allowedCommands.test(m.text)) return
        }
        
        // 13. SISTEMA DE COLA OPTIMIZADO
        if (opts["queque"] && m.text && !permissions.isPrems) {
            const queque = this.msgqueque
            const time = 1000 * 5
            const previousID = queque[queque.length - 1]
            queque.push(m.id || m.key.id)
            
            setInterval(async function () {
                if (queque.indexOf(previousID) === -1) clearInterval(this)
                await delay(time)
            }, time)
        }
        
        // 14. IGNORAR MENSAJES DEL BOT
        if (m.isBaileys) return
        m.exp += Math.ceil(Math.random() * 10)
        
        // 15. PROCESAR COMANDOS (NUEVO SISTEMA)
        if (m.text) {
            await processCommands(m, this, {
                userData,
                chatData,
                settings,
                permissions
            })
        }
        
        // 16. ACTUALIZAR ESTADÍSTICAS
        await updateStatistics(m, userData)
        
    } catch (error) {
        console.error(chalk.red('❌ Error en handler:'), error)
    } finally {
        // 17. LIMPIAR COLA DE MENSAJES
        cleanupMessageQueue(this, m)
    }
}

// ============ FUNCIONES MODULARES ============

/**
 * Procesa todos los comandos disponibles
 */
async function processCommands(m, conn, context) {
    const { userData, chatData, settings, permissions } = context
    let usedPrefix
    
    // OBTENER METADATOS DEL GRUPO SI ES NECESARIO
    let groupMetadata = {}
    if (m.isGroup) {
        groupMetadata = await getGroupMetadata(m.chat, conn)
    }
    
    // DIRECTORIO DE PLUGINS
    const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "./plugins")
    
    // ITERAR SOBRE TODOS LOS PLUGINS
    for (const name in global.plugins) {
        const plugin = global.plugins[name]
        if (!plugin || plugin.disabled) continue
        
        const __filename = join(___dirname, name)
        
        // EJECUTAR plugin.all() SI EXISTE
        if (typeof plugin.all === "function") {
            try {
                await plugin.all.call(conn, m, {
                    chatUpdate: m,
                    __dirname: ___dirname,
                    __filename,
                    user: userData,
                    chat: chatData,
                    settings
                })
            } catch (err) {
                console.error(chalk.red(`Error en plugin.all de ${name}:`), err)
            }
        }
        
        // SI NO HAY RESTRICCIONES Y ES COMANDO DE ADMIN, CONTINUAR
        if (!opts["restrict"] && plugin.tags && plugin.tags.includes("admin")) {
            continue
        }
        
        // BUSCAR PREFIJO QUE COINCIDA
        const strRegex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")
        const pluginPrefix = plugin.customPrefix || conn.prefix || global.prefix
        
        const match = findPrefixMatch(m.text, pluginPrefix, strRegex)
        if (!match) continue
        
        usedPrefix = match[0] || ""
        
        // EXTRAER COMANDO Y ARGUMENTOS
        const noPrefix = m.text.replace(usedPrefix, "")
        let [command, ...args] = noPrefix.trim().split(" ").filter(v => v)
        args = args || []
        const text = args.join(" ")
        command = (command || "").toLowerCase()
        
        // VALIDAR IDS ESPECIALES DE MENSAJES
        if (isSpecialMessageId(m.id)) return
        
        // VERIFICAR BOT PRINCIPAL
        await checkPrimaryBot(m.chat, conn, chatData)
        
        // VERIFICAR SI EL COMANDO ES ACEPTADO
        if (!isCommandAccepted(plugin, command)) continue
        
        // MARCAR PLUGIN ACTUAL
        m.plugin = name
        
        // INCREMENTAR CONTADOR DE COMANDOS
        if (userData) {
            userData.commands = (userData.commands || 0) + 1
        }
        
        // VERIFICAR RESTRICCIONES DEL CHAT
        if (await isChatRestricted(m, conn, chatData, userData, permissions, usedPrefix)) {
            return
        }
        
        // VERIFICAR PERMISOS DEL COMANDO
        const commandPermissions = await verifyCommandPermissions(plugin, permissions, m, conn)
        if (!commandPermissions.allowed) {
            global.dfail(commandPermissions.failType, m, conn)
            continue
        }
        
        // PREPARAR CONTEXTO DE EJECUCIÓN
        const executionContext = {
            match: match[1],
            usedPrefix,
            noPrefix,
            _args: args,
            args,
            command,
            text,
            conn,
            participants: groupMetadata.participants || [],
            groupMetadata,
            userGroup: permissions.userGroup,
            botGroup: permissions.botGroup,
            isROwner: permissions.isROwner,
            isOwner: permissions.isOwner,
            isRAdmin: permissions.isRAdmin,
            isAdmin: permissions.isAdmin,
            isBotAdmin: permissions.isBotAdmin,
            isPrems: permissions.isPrems,
            chatUpdate: m,
            __dirname: ___dirname,
            __filename,
            user: userData,
            chat: chatData,
            settings
        }
        
        // EJECUTAR COMANDO
        await CommandExecutor.execute(plugin, m, executionContext)
    }
}

/**
 * Obtiene metadatos del grupo con caché
 */
async function getGroupMetadata(chatId, conn) {
    try {
        if (global.cachedGroupMetadata) {
            return await global.cachedGroupMetadata(chatId).catch(() => ({}))
        }
        return await conn.groupMetadata(chatId).catch(() => ({}))
    } catch {
        return {}
    }
}

/**
 * Encuentra coincidencia de prefijo
 */
function findPrefixMatch(text, pluginPrefix, strRegex) {
    if (pluginPrefix instanceof RegExp) {
        return [[pluginPrefix.exec(text), pluginPrefix]]
    }
    
    if (Array.isArray(pluginPrefix)) {
        return pluginPrefix.map(prefix => {
            const regex = prefix instanceof RegExp ? 
                prefix : new RegExp(strRegex(prefix))
            return [regex.exec(text), regex]
        }).find(prefix => prefix[0])
    }
    
    if (typeof pluginPrefix === "string") {
        const regex = new RegExp(strRegex(pluginPrefix))
        const exec = regex.exec(text)
        return exec ? [[exec, regex]] : null
    }
    
    return null
}

/**
 * Verifica si es un ID de mensaje especial
 */
function isSpecialMessageId(messageId) {
    return (
        messageId.startsWith("NJX-") ||
        (messageId.startsWith("BAE5") && messageId.length === 16) ||
        (messageId.startsWith("B24E") && messageId.length === 20)
    )
}

/**
 * Verifica el bot principal del grupo
 */
async function checkPrimaryBot(chatId, conn, chatData) {
    const botId = conn.user.jid
    const primaryBotId = chatData.primaryBot
    
    if (primaryBotId && primaryBotId !== botId) {
        const primaryBotConn = global.conns?.find(conn => 
            conn.user.jid === primaryBotId && 
            conn.ws.socket && 
            conn.ws.socket.readyState !== ws.CLOSED
        )
        
        if (primaryBotConn) {
            const participants = await conn.groupMetadata(chatId).catch(() => ({ participants: [] }))
            const primaryBotInGroup = participants.participants?.some(p => p.jid === primaryBotId)
            
            if (primaryBotInGroup || primaryBotId === conn.user.jid) {
                throw new Error("Bot secundario - redirigiendo a bot principal")
            } else {
                chatData.primaryBot = null
            }
        }
    }
}

/**
 * Verifica si el comando es aceptado por el plugin
 */
function isCommandAccepted(plugin, command) {
    if (plugin.command instanceof RegExp) {
        return plugin.command.test(command)
    }
    
    if (Array.isArray(plugin.command)) {
        return plugin.command.some(cmd => 
            cmd instanceof RegExp ? cmd.test(command) : cmd === command
        )
    }
    
    if (typeof plugin.command === "string") {
        return plugin.command === command
    }
    
    return false
}

/**
 * Verifica restricciones del chat
 */
async function isChatRestricted(m, conn, chatData, userData, permissions, usedPrefix) {
    const botId = conn.user.jid
    const primaryBotId = chatData.primaryBot
    
    // 1. Verificar si el chat está baneado
    if (m.plugin !== "group-banchat.js" && chatData?.isBanned && !permissions.isROwner) {
        if (!primaryBotId || primaryBotId === botId) {
            const aviso = `⚠️ El bot *${global.botname}* está desactivado en este grupo.\n\n> 🔹 Un *administrador* puede activarlo usando el comando:\n> » *${usedPrefix}bot on*`.trim()
            await m.reply(aviso)
            return true
        }
    }
    
    // 2. Verificar si el usuario está baneado
    if (m.text && userData.banned && !permissions.isROwner) {
        if (!primaryBotId || primaryBotId === botId) {
            const mensaje = `🚫 *Acceso Denegado* 🚫\nꕙ Has sido *baneado/a* y no puedes usar comandos en este bot.\n\n> ⚡ *Razón:* ${userData.bannedReason}\n> 🛡️ *Si crees que esto es un error*, y el bot es oficial, presenta tu caso ante un *moderador* para revisión.`.trim()
            await m.reply(mensaje)
            return true
        }
    }
    
    return false
}

/**
 * Verifica permisos del comando
 */
async function verifyCommandPermissions(plugin, permissions, m, conn) {
    const { isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems } = permissions
    
    // Modo solo admin en grupo
    const adminMode = permissions.chat?.modoadmin || false
    const requiresAdmin = plugin.botAdmin || plugin.admin || plugin.group
    
    if (adminMode && !isOwner && m.isGroup && !isAdmin && requiresAdmin) {
        return { allowed: false, failType: "admin" }
    }
    
    // Verificar permisos específicos del comando
    if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) {
        return { allowed: false, failType: "owner" }
    }
    if (plugin.rowner && !isROwner) {
        return { allowed: false, failType: "rowner" }
    }
    if (plugin.owner && !isOwner) {
        return { allowed: false, failType: "owner" }
    }
    if (plugin.premium && !isPrems) {
        return { allowed: false, failType: "premium" }
    }
    if (plugin.group && !m.isGroup) {
        return { allowed: false, failType: "group" }
    }
    if (plugin.botAdmin && !isBotAdmin) {
        return { allowed: false, failType: "botAdmin" }
    }
    if (plugin.admin && !isAdmin) {
        return { allowed: false, failType: "admin" }
    }
    if (plugin.private && m.isGroup) {
        return { allowed: false, failType: "private" }
    }
    
    return { allowed: true }
}

/**
 * Actualiza estadísticas del usuario
 */
async function updateStatistics(m, userData) {
    try {
        if (m && m.sender && userData) {
            userData.exp += m.exp || 0
            await statsTracker.trackCommand(m.sender, m.command || m.plugin)
        }
    } catch (error) {
        console.error('Error actualizando estadísticas:', error)
    }
}

/**
 * Limpia la cola de mensajes
 */
function cleanupMessageQueue(conn, m) {
    try {
        if (opts["queque"] && m && m.text) {
            const quequeIndex = conn.msgqueque.indexOf(m.id || m.key.id)
            if (quequeIndex !== -1) {
                conn.msgqueque.splice(quequeIndex, 1)
            }
        }
    } catch (error) {
        console.error('Error limpiando cola:', error)
    }
}

// ============ FUNCIÓN dfail ACTUALIZADA ============
global.dfail = (type, m, conn) => {
    const messages = {
        rowner: `🎅 *¡ACCESO DENEGADO!*\n\nEste comando es exclusivo para los creadores del bot.\n\n🎄 ¡Feliz Navidad! 🎁`,
        owner: `🎁 *¡RESERVADO PARA SANTA!*\n\nSolo los desarrolladores del bot pueden usar este comando.\n\n🦌 ¡Solo para la lista buena! ❄️`,
        mods: `⛄ *¡PERMISO INSUFICIENTE!*\n\nNecesitas ser moderador del bot para usar este comando.\n\n❄️ ¡Vuelve cuando seas un reno! 🦌`,
        premium: `✨ *¡EXCLUSIVO PREMIUM!*\n\nEste comando está reservado para usuarios premium.\n\n🎁 ¡Santa te espera! 🎅`,
        group: `🏭 *¡SOLO EN TALLERES!*\n\nEste comando solo funciona en grupos.\n\n🛠️ ¡Únete a un taller! 🔨`,
        private: `✉️ *¡SOLO EN CARTAS!*\n\nEste comando solo se puede usar en chat privado.\n\n📮 ¡Escribe a Santa! 🎅`,
        admin: `🎄 *¡ELFO MAYOR REQUERIDO!*\n\nNecesitas ser administrador del grupo.\n\n🧝 ¡Pídele a Santa el ascenso! ⭐`,
        botAdmin: `🎅 *¡SANTA NECESITA PODERES!*\n\nEl bot debe ser administrador del grupo.\n\n🧝‍♂️ ¡Hazme supervisor! 🔑`,
        restrict: `❄️ *¡REGALO CONGELADO!*\n\nEsta función está temporalmente deshabilitada.\n\n🛷 ¡Vuelve en Año Nuevo! ⏳`
    }
    
    if (messages[type]) {
        return conn.reply(m.chat, messages[type], m).then(_ => m.react?.('✖️'))
    }
}

// ============ WATCHFILE PARA RECARGA EN CALIENTE ============
let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.magenta("🔄 Se actualizó 'handler.js'"))
    if (global.reloadHandler) {
        console.log(await global.reloadHandler())
    }
})
