import { smsg } from "./lib/simple.js"
import { format } from "util"
import { fileURLToPath } from "url"
import path, { join } from "path"
import fs, { unwatchFile, watchFile } from "fs"
import chalk from "chalk"
import fetch from "node-fetch"
import ws from "ws"
import { jidNormalizedUser, areJidsSameUser } from '@whiskeysockets/baileys'

// ============ CONSTANTES Y UTILIDADES ============
const isNumber = x => typeof x === "number" && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

// Cache para metadatos de grupos (evita múltiples consultas)
const groupMetadataCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

// Rate limiting por usuario/chat
const rateLimit = new Map()
const RATE_LIMIT_WINDOW = 3000 // 3 segundos
const MAX_REQUESTS_PER_WINDOW = 5

// ============ FUNCIONES AUXILIARES OPTIMIZADAS ============
const normalizeJid = (conn, jid) => jidNormalizedUser(conn.decodeJid(jid))
const getNumOnly = (jid) => String(jid).split('@')[0].replace(/[^0-9]/g, '')

/**
 * Verifica rate limiting para un usuario
 */
const checkRateLimit = (key) => {
    const now = Date.now()
    const windowStart = now - RATE_LIMIT_WINDOW
    const userRequests = rateLimit.get(key) || []
    
    // Limpia requests antiguas
    const recentRequests = userRequests.filter(time => time > windowStart)
    
    if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
        return false // Demasiadas requests
    }
    
    recentRequests.push(now)
    rateLimit.set(key, recentRequests)
    return true
}

/**
 * Obtiene metadatos de grupo con cache
 */
async function getCachedGroupMetadata(conn, chatId) {
    if (!chatId.endsWith('@g.us')) return null
    
    const cached = groupMetadataCache.get(chatId)
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        return cached.data
    }
    
    try {
        const metadata = await conn.groupMetadata(chatId).catch(() => null)
        if (metadata) {
            groupMetadataCache.set(chatId, {
                data: metadata,
                timestamp: Date.now()
            })
        }
        return metadata
    } catch {
        return null
    }
}

/**
 * Inicializa usuario con valores por defecto optimizados
 */
const initUser = (user) => {
    const defaults = {
        name: '',
        exp: 0,
        coin: 0,
        bank: 0,
        level: 0,
        health: 100,
        genre: '',
        birth: '',
        marry: '',
        description: '',
        packstickers: null,
        premium: false,
        premiumTime: 0,
        banned: false,
        bannedReason: '',
        commands: 0,
        afk: -1,
        afkReason: '',
        warn: 0,
        lastSeen: Date.now()
    }
    
    return Object.assign(defaults, user || {})
}

/**
 * Inicializa chat con valores por defecto
 */
const initChat = (chat) => {
    const defaults = {
        isBanned: false,
        isMute: false,
        welcome: false,
        sWelcome: '',
        sBye: '',
        detect: true,
        primaryBot: null,
        modoadmin: false,
        antiLink: true,
        nsfw: false,
        economy: true,
        gacha: true,
        lastActivity: Date.now()
    }
    
    return Object.assign(defaults, chat || {})
}

/**
 * Inicializa settings
 */
const initSettings = (settings) => {
    const defaults = {
        self: false,
        restrict: true,
        jadibotmd: true,
        antiPrivate: false,
        gponly: false
    }
    
    return Object.assign(defaults, settings || {})
}

/**
 * Detección optimizada de administradores
 */
async function detectAdmins(conn, m) {
    if (!m.isGroup) {
        return {
            userGroup: {},
            botGroup: {},
            isRAdmin: false,
            isAdmin: false,
            isBotAdmin: false,
            participants: [],
            groupMetadata: {}
        }
    }
    
    const groupMetadata = await getCachedGroupMetadata(conn, m.chat) || {}
    const participants = Array.isArray(groupMetadata.participants) ? groupMetadata.participants : []
    
    // Mapa rápido de participantes
    const participantMap = new Map()
    participants.forEach(p => {
        const jid = normalizeJid(conn, p.id || p.jid)
        participantMap.set(jid, p)
        participantMap.set(getNumOnly(jid), p)
    })
    
    // Encuentra usuario y bot en el grupo
    const userJid = normalizeJid(conn, m.sender)
    const botJid = normalizeJid(conn, conn.user.jid || conn.user.id)
    
    const userGroup = participantMap.get(userJid) || participantMap.get(getNumOnly(userJid)) || {}
    const botGroup = participantMap.get(botJid) || participantMap.get(getNumOnly(botJid)) || {}
    
    const isRAdmin = userGroup.admin === 'superadmin'
    const isAdmin = isRAdmin || userGroup.admin === 'admin' || userGroup.admin === true
    const isBotAdmin = botGroup.admin === 'admin' || botGroup.admin === 'superadmin' || botGroup.admin === true
    
    return {
        userGroup,
        botGroup,
        isRAdmin,
        isAdmin,
        isBotAdmin,
        participants,
        groupMetadata
    }
}

/**
 * Procesa prefijos de comandos de forma eficiente
 */
function findPrefixMatch(text, prefixes) {
    if (!text || !prefixes) return null
    
    if (Array.isArray(prefixes)) {
        for (const prefix of prefixes) {
            if (prefix instanceof RegExp) {
                const match = prefix.exec(text)
                if (match) return [match, prefix]
            } else if (text.startsWith(prefix)) {
                return [[prefix], new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)]
            }
        }
    } else if (prefixes instanceof RegExp) {
        const match = prefixes.exec(text)
        if (match) return [match, prefixes]
    } else if (typeof prefixes === 'string' && text.startsWith(prefixes)) {
        return [[prefixes], new RegExp(`^${prefixes.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)]
    }
    
    return null
}

// ============ HANDLER PRINCIPAL OPTIMIZADO ============
export async function handler(chatUpdate) {
    // Inicialización optimizada
    this.msgqueque = this.msgqueque || []
    this.uptime = this.uptime || Date.now()
    
    if (!chatUpdate?.messages?.length) return
    this.pushMessage(chatUpdate.messages).catch(() => {})
    
    const m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return
    
    // Carga de base de datos diferida
    if (global.db.data == null) {
        await global.loadDatabase()
    }
    
    try {
        const processedMsg = smsg(this, m) || m
        if (!processedMsg) return
        
        Object.assign(m, processedMsg)
        m.exp = 0
        m.isBaileys = m.isBaileys || false
        
        // Rate limiting básico
        const rateLimitKey = `${m.sender}:${m.chat}`
        if (!checkRateLimit(rateLimitKey) && !(global.owner || []).includes(m.sender.replace(/[^0-9]/g, ""))) {
            return // Ignora mensajes con rate limit excedido
        }
        
        // ============ INICIALIZACIÓN DE DATOS ============
        // Usuario
        if (!global.db.data.users[m.sender]) {
            global.db.data.users[m.sender] = initUser({ name: m.name || m.pushName })
        }
        const user = global.db.data.users[m.sender]
        
        // Actualización rápida del nombre si es necesario
        if (m.pushName && m.pushName.trim() && m.pushName !== user.name) {
            user.name = m.pushName
        }
        
        // Chat
        if (!global.db.data.chats[m.chat]) {
            global.db.data.chats[m.chat] = initChat({})
        }
        const chat = global.db.data.chats[m.chat]
        chat.lastActivity = Date.now()
        
        // Settings
        if (!global.db.data.settings[this.user.jid]) {
            global.db.data.settings[this.user.jid] = initSettings({})
        }
        const settings = global.db.data.settings[this.user.jid]
        
        // ============ VERIFICACIONES DE ACCESO ============
        const isROwner = [...global.owner].map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender)
        const isOwner = isROwner || m.fromMe
        const isPrems = isROwner || 
                       (global.prems || []).map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender) || 
                       user.premium === true
        
        const isOwners = [this.user.jid, ...global.owner.map(v => v + "@s.whatsapp.net")].includes(m.sender)
        
        // Verificaciones de modo self y gponly
        if (settings.self && !isOwners) return
        if (settings.gponly && !isOwners && !m.chat.endsWith('g.us')) {
            const allowedCommands = /code|p|ping|qr|estado|status|infobot|botinfo|report|reportar|invite|join|logout|suggest|help|menu/i
            if (!allowedCommands.test(m.text)) return
        }
        
        // Sistema de queue optimizado
        if (opts["queque"] && m.text && !isPrems) {
            const queque = this.msgqueque
            const time = 5000 // 5 segundos
            
            if (queque.length > 10) { // Limpia queue si es muy grande
                queque.splice(0, queque.length - 5)
            }
            
            queque.push(m.id || m.key.id)
            setTimeout(() => {
                const index = queque.indexOf(m.id || m.key.id)
                if (index > -1) queque.splice(index, 1)
            }, time)
        }
        
        if (m.isBaileys) return
        
        // Experiencia incremental
        m.exp += Math.ceil(Math.random() * 10)
        
        // ============ DETECCIÓN DE ADMINS ============
        const adminData = await detectAdmins(this, m)
        const { isRAdmin, isAdmin, isBotAdmin } = adminData
        
        // ============ PROCESAMIENTO DE PLUGINS ============
        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "./plugins")
        
        for (const [name, plugin] of Object.entries(global.plugins || {})) {
            if (!plugin || plugin.disabled) continue
            
            // Plugin "all" se ejecuta siempre
            if (typeof plugin.all === "function") {
                try {
                    await plugin.all.call(this, m, {
                        chatUpdate,
                        __dirname: ___dirname,
                        __filename: join(___dirname, name),
                        user,
                        chat,
                        settings,
                        ...adminData
                    })
                } catch (err) {
                    console.error(`Error en plugin.all ${name}:`, err)
                }
            }
            
            // Saltar plugins de admin si no hay restrict
            if (!opts["restrict"] && plugin.tags?.includes("admin")) {
                continue
            }
            
            // Búsqueda eficiente de prefijo
            const pluginPrefix = plugin.customPrefix || this.prefix || global.prefix
            const match = findPrefixMatch(m.text || '', pluginPrefix)
            
            if (!match) continue
            
            // Verificación de comando
            const [prefixMatch, prefixRegex] = match
            const usedPrefix = prefixMatch[0] || ''
            const noPrefix = m.text.slice(usedPrefix.length).trim()
            const [command, ...args] = noPrefix.split(/\s+/).filter(Boolean)
            
            if (!command) continue
            
            const commandLower = command.toLowerCase()
            let isAccept = false
            
            if (plugin.command instanceof RegExp) {
                isAccept = plugin.command.test(commandLower)
            } else if (Array.isArray(plugin.command)) {
                isAccept = plugin.command.some(cmd => 
                    cmd instanceof RegExp ? cmd.test(commandLower) : cmd === commandLower
                )
            } else if (typeof plugin.command === "string") {
                isAccept = plugin.command === commandLower
            } else {
                isAccept = false
            }
            
            if (!isAccept) continue
            
            // ============ VERIFICACIONES ANTES DE EJECUTAR ============
            global.comando = commandLower
            
            // Filtro de IDs de mensajes
            if (m.id.startsWith("NJX-") || 
                (m.id.startsWith("BAE5") && m.id.length === 16) || 
                (m.id.startsWith("B24E") && m.id.length === 20)) {
                return
            }
            
            // Verificación de primary bot
            if (chat.primaryBot && chat.primaryBot !== this.user.jid) {
                const primaryBotConn = global.conns?.find(conn => 
                    conn.user.jid === chat.primaryBot && 
                    conn.ws?.socket?.readyState !== ws.CLOSED
                )
                
                if (primaryBotConn) {
                    return // Deja que el primary bot maneje el comando
                } else {
                    chat.primaryBot = null // Limpia si no está conectado
                }
            }
            
            // Verificaciones de baneo
            if (name !== "group-banchat.js") {
                if (chat.isBanned && !isROwner) {
                    const botId = this.user.jid
                    if (!chat.primaryBot || chat.primaryBot === botId) {
                        const aviso = `⚠️ El bot *${global.botname}* está desactivado en este grupo.\n\n> 🔹 Un *administrador* puede activarlo usando:\n> » *${usedPrefix}bot on*`.trim()
                        await m.reply(aviso).catch(() => {})
                        return
                    }
                }
                
                if (user.banned && !isROwner) {
                    if (!chat.primaryBot || chat.primaryBot === this.user.jid) {
                        const mensaje = `🚫 *Acceso Denegado*\nHas sido baneado/a del bot.\n\n> ⚡ Razón: ${user.bannedReason || "No especificada"}`.trim()
                        await m.reply(mensaje).catch(() => {})
                        return
                    }
                }
            }
            
            // Verificaciones de permisos optimizadas
            const permissionChecks = {
                rowner: plugin.rowner && !isROwner,
                owner: plugin.owner && !isOwner,
                premium: plugin.premium && !isPrems,
                group: plugin.group && !m.isGroup,
                botAdmin: plugin.botAdmin && !isBotAdmin,
                admin: plugin.admin && !isAdmin,
                private: plugin.private && m.isGroup,
                modoadmin: chat.modoadmin && !isOwner && m.isGroup && !isAdmin && plugin.admin
            }
            
            const failedPermission = Object.entries(permissionChecks).find(([_, failed]) => failed)
            if (failedPermission) {
                global.dfail(failedPermission[0], m, this)
                continue
            }
            
            // ============ EJECUCIÓN DEL PLUGIN ============
            m.plugin = name
            m.isCommand = true
            user.commands = (user.commands || 0) + 1
            m.exp += isNumber(plugin.exp) ? parseInt(plugin.exp) : 10
            
            const extra = {
                match: prefixMatch,
                usedPrefix,
                noPrefix,
                args,
                command: commandLower,
                text: args.join(' '),
                conn: this,
                isROwner,
                isOwner,
                isRAdmin,
                isAdmin,
                isBotAdmin,
                isPrems,
                chatUpdate,
                __dirname: ___dirname,
                __filename: join(___dirname, name),
                user,
                chat,
                settings,
                ...adminData
            }
            
            try {
                // Before hook
                if (typeof plugin.before === "function") {
                    const beforeResult = await plugin.before.call(this, m, extra)
                    if (beforeResult === true) continue
                }
                
                // Ejecución principal
                if (typeof plugin === "function") {
                    await plugin.call(this, m, extra)
                }
                
                // After hook
                if (typeof plugin.after === "function") {
                    await plugin.after.call(this, m, extra)
                }
                
            } catch (err) {
                m.error = err
                console.error(`Error ejecutando plugin ${name}:`, err)
            }
        }
        
    } catch (err) {
        console.error("Error en handler principal:", err)
    } finally {
        // Limpieza final optimizada
        try {
            // Limpia queue
            if (opts["queque"] && m?.text) {
                const quequeIndex = this.msgqueque.indexOf(m.id || m.key?.id)
                if (quequeIndex > -1) {
                    this.msgqueque.splice(quequeIndex, 1)
                }
            }
            
            // Añade experiencia
            if (m?.sender && global.db.data.users[m.sender]) {
                global.db.data.users[m.sender].exp += m.exp || 0
            }
            
            // Print final
            if (!opts["noprint"] && m) {
                try {
                    const printModule = await import("./lib/print.js")
                    await printModule.default(m, this)
                } catch (err) {
                    console.warn("Error en print:", err)
                }
            }
            
        } catch (finalErr) {
            console.error("Error en finally block:", finalErr)
        }
    }
}

// ============ DFail OPTIMIZADO ============
global.dfail = (type, m, conn) => {
    const messages = {
        rowner: `🎅 *¡ACCESO DENEGADO!*\n\nEste comando es exclusivo para los creadores del bot.`,
        owner: `🎁 *¡RESERVADO PARA SANTA!*\n\nSolo los desarrolladores pueden usar este comando.`,
        mods: `⛄ *¡PERMISO INSUFICIENTE!*\n\nNecesitas ser moderador del bot.`,
        premium: `✨ *¡EXCLUSIVO PREMIUM!*\n\nEste comando está reservado para usuarios premium.`,
        group: `🏭 *¡SOLO EN TALLERES!*\n\nEste comando solo funciona en grupos.`,
        private: `✉️ *¡SOLO EN CARTAS!*\n\nEste comando solo se puede usar en chat privado.`,
        admin: `🎄 *¡ELFO MAYOR REQUERIDO!*\n\nNecesitas ser administrador del grupo.`,
        botAdmin: `🎅 *¡SANTA NECESITA PODERES!*\n\nEl bot debe ser administrador del grupo.`,
        restrict: `❄️ *¡REGALO CONGELADO!*\n\nEsta función está temporalmente deshabilitada.`
    }
    
    const msg = messages[type]
    if (msg) {
        conn.reply(m.chat, msg, m).catch(() => {})
        m.react?.('✖️').catch(() => {})
    }
}

// ============ WATCH FILE OPTIMIZADO ============
const file = global.__filename(import.meta.url, true)
let fileWatcher = null

function setupFileWatcher() {
    if (fileWatcher) {
        unwatchFile(file)
    }
    
    watchFile(file, async () => {
        console.log(chalk.magenta("🔄 Se actualizó 'handler.js'"))
        
        // Limpia caché
        groupMetadataCache.clear()
        rateLimit.clear()
        
        // Recarga
        if (global.reloadHandler) {
            try {
                await global.reloadHandler()
            } catch (err) {
                console.error("Error recargando handler:", err)
            }
        }
        
        // Reconfigura watcher
        setTimeout(setupFileWatcher, 1000)
    })
    
    fileWatcher = true
}

setupFileWatcher()
