const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = (await import("@whiskeysockets/baileys"))
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import * as ws from 'ws'
import { makeWASocket } from '../../lib/simple.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const imagenSerBot = 'https://files.catbox.moe/gptlxc.jpg'

let rtx = `╭─〔 💻 𝘼𝙎𝙏𝘼 𝘽𝙊𝙏 • 𝙈𝙊𝘿𝙊 𝙌𝙍 〕─╮
│
│  📲 Escanea este *QR* desde otro celular o PC
│  para convertirte en un *Sub-Bot Temporal* de Asta.
│
│  1️⃣  Pulsa los ⋮ tres puntos arriba a la derecha
│  2️⃣  Ve a *Dispositivos vinculados*
│  3️⃣  Escanea el QR y ¡listo! ⚡
│
│  ⏳  *Expira en 45 segundos.*
╰───────────────────────`

let rtx2 = `╭─[ 💻 𝘼𝙎𝙏𝘼 𝘽𝙊𝙏 • 𝙈𝙊𝘿𝙊 𝘾𝙊𝘿𝙀 ]─╮
│
│  🧠  Este es el *Modo CODE* de Asta Bot.
│  Escanea el *QR* desde otro celular o PC
│  para convertirte en un *Sub-Bot Temporal*.
│
│  1️⃣  Pulsa los ⋮ tres puntos arriba a la derecha
│  2️⃣  Entra en *Dispositivos vinculados*
│  3️⃣  Escanea el QR y ¡listo! ⚡
│
│  ⏳  *Expira en 45 segundos.*
╰────────────────────────╯`

// ============= INICIALIZAR VARIABLES GLOBALES =============
if (!global.conns || !Array.isArray(global.conns)) {
    global.conns = []
}
if (!global.activeSubBots) global.activeSubBots = new Map()
if (!global.subBotsData) global.subBotsData = new Map()
if (!global.subBotReconnectAttempts) global.subBotReconnectAttempts = new Map()
// NUEVO: Map para controlar si ya se envió código/QR por usuario
if (!global.sentCodes) global.sentCodes = new Map()

// ============= FUNCIÓN PARA VERIFICAR CONEXIÓN =============
function isSubBotConnected(jid) {
    if (!global.conns || !Array.isArray(global.conns)) return false
    const targetJid = jid.split("@")[0]

    return global.conns.some(sock => {
        try {
            if (!sock || !sock.user || !sock.user.jid) return false
            const sockId = sock.user.jid.split("@")[0]
            const isMatch = sockId === targetJid
            const isConnected = sock.ws && (sock.ws.readyState === 1 || sock.ws.readyState === 0)
            return isMatch && isConnected
        } catch (e) {
            return false
        }
    })
}

// ============= HANDLER PRINCIPAL =============
let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) {
        return m.reply(`ꕥ El Comando *${command}* está desactivado temporalmente.`)
    }

    // Contar activos correctamente
    const activeSubBotsCount = global.conns.filter(sock => {
        try {
            return sock?.user?.jid && 
                   sock.user.jid !== global.conn.user.jid &&
                   sock.ws?.readyState === 1
        } catch { return false }
    }).length

    const maxLimit = global.supConfig?.maxSubBots || 100

    if (activeSubBotsCount >= maxLimit) {
        return m.reply(
            `⚠️ *LÍMITE ALCANZADO*\n` +
            `• Activos: ${activeSubBotsCount}/${maxLimit}\n` +
            `📋 *${usedPrefix}listjadibot* - Ver lista\n` +
            `🗑️ *${usedPrefix}killall* - Limpiar inactivos`
        )
    }

    // Cooldown
    const userData = global.db.data.users[m.sender]
    const lastSub = userData?.Subs || 0
    const timeLeft = 120000 - (Date.now() - lastSub)

    if (timeLeft > 0) {
        return m.reply(`⏳ Espera ${msToTime(timeLeft)} para vincular otro Sub-Bot.`)
    }

    const userId = m.sender.split('@')[0]

    if (isSubBotConnected(m.sender)) {
        return m.reply(
            `⚠️ Ya tienes un SubBot activo.\n\n` +
            `• *${usedPrefix}kill ${userId}* - Eliminar\n` +
            `• *${usedPrefix}restartbot ${userId}* - Reiniciar`
        )
    }

    const pathAstaJadiBot = path.join(`./${global.jadi || 'Sessions/SubBot'}/`, userId)

    // Limpiar sesión anterior corrupta
    if (fs.existsSync(pathAstaJadiBot)) {
        try {
            fs.rmSync(pathAstaJadiBot, { recursive: true, force: true })
            await delay(1000) // Esperar limpieza
        } catch (e) {
            console.error('Error limpiando sesión:', e)
        }
    }

    fs.mkdirSync(pathAstaJadiBot, { recursive: true })

    // NUEVO: Resetear la bandera de código enviado al iniciar nueva solicitud
    global.sentCodes.delete(userId)

    // Iniciar SubBot con manejo de reconexión
    await AstaJadiBot({
        pathAstaJadiBot,
        m,
        conn,
        args,
        usedPrefix,
        command,
        userId,
        maxReconnectAttempts: 3
    })

    global.db.data.users[m.sender].Subs = Date.now()
}

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']
export default handler

// ============= FUNCIÓN PRINCIPAL MEJORADA =============
export async function AstaJadiBot(options) {
    let { 
        pathAstaJadiBot, 
        m, 
        conn, 
        args, 
        usedPrefix, 
        command, 
        userId,
        maxReconnectAttempts = 3,
        isReconnect = false 
    } = options

    let reconnectAttempts = global.subBotReconnectAttempts.get(userId) || 0

    if (isReconnect) {
        reconnectAttempts++
        global.subBotReconnectAttempts.set(userId, reconnectAttempts)
        console.log(chalk.yellow(`🔄 Reintento ${reconnectAttempts}/${maxReconnectAttempts} para ${userId}`))

        if (reconnectAttempts > maxReconnectAttempts) {
            console.log(chalk.red(`❌ Máximos reintentos alcanzados para ${userId}`))
            await m.reply?.(`❌ No se pudo reconectar el SubBot después de ${maxReconnectAttempts} intentos. Elimina la sesión y vuelve a vincular.`)
            global.subBotReconnectAttempts.delete(userId)
            return cleanupSession(pathAstaJadiBot, userId)
        }

        // Esperar antes de reconectar
        await delay(5000 * reconnectAttempts)
    }

    // Configurar modo code
    if (command === 'code') {
        command = 'qr'
        args.unshift('code')
    }

    const mcode = args.some(arg => /^(--code|code)$/.test(arg?.trim()))

    // Limpiar args de flags
    args = args.map(arg => arg.replace(/^--code$|^code$/, '').trim()).filter(Boolean)

    // Cargar credenciales si se proporcionan en base64
    const pathCreds = path.join(pathAstaJadiBot, "creds.json")

    if (args[0] && !isReconnect) {
        try {
            const credsData = JSON.parse(Buffer.from(args[0], "base64").toString("utf-8"))
            fs.writeFileSync(pathCreds, JSON.stringify(credsData, null, 2))
            console.log(chalk.green('✅ Credenciales cargadas desde argumento'))
        } catch (e) {
            console.error('Error decodificando credenciales:', e)
            return m.reply?.(`❌ Credenciales inválidas. Usa ${usedPrefix + command} sin argumentos.`)
        }
    }

    // Configuración de Baileys
    const { version } = await fetchLatestBaileysVersion()
    const msgRetryCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
    const { state, saveCreds } = await useMultiFileAuthState(pathAstaJadiBot)

    const connectionOptions = {
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
        },
        msgRetryCounterCache: msgRetryCache,
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        version,
        generateHighQualityLinkPreview: true,
        defaultQueryTimeoutMs: 60000,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
        emitOwnEvents: true,
        fireInitQueries: true
    }

    let sock = makeWASocket(connectionOptions)

    // Referencia estable para el socket
    const sockRef = { current: sock }

    // Configuración del SubBot
    const defaultConfig = {
        name: `SubBot-${userId}`,
        prefix: global.prefix?.toString() || '^[#./]',
        sinprefix: false,
        mode: 'public',
        antiPrivate: false,
        gponly: false,
        owner: m.sender,
        createdAt: new Date().toISOString(),
        sessionPath: pathAstaJadiBot
    }

    const configPath = path.join(pathAstaJadiBot, 'config.json')

    // Cargar o crear config
    let subBotConfig
    try {
        if (fs.existsSync(configPath)) {
            subBotConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        } else {
            subBotConfig = defaultConfig
            fs.writeFileSync(configPath, JSON.stringify(subBotConfig, null, 2))
        }
    } catch {
        subBotConfig = defaultConfig
    }

    sock.subConfig = subBotConfig
    sock.userId = userId

    // Timers para limpieza
    let qrTimer = null
    let connectionTimer = null
    let messageRetryTimer = null
    // NUEVO: Variable local para controlar si ya se envió código en esta instancia
    let codeSent = false

    // Función de limpieza segura
    const cleanup = async (fullCleanup = false) => {
        if (qrTimer) clearTimeout(qrTimer)
        if (connectionTimer) clearTimeout(connectionTimer)
        if (messageRetryTimer) clearInterval(messageRetryTimer)

        try {
            sock.ev.removeAllListeners()
            if (sock.ws?.readyState === 1) {
                sock.ws.close()
            }
        } catch (e) {
            console.error('Error en cleanup:', e)
        }

        if (fullCleanup) {
            await cleanupSession(pathAstaJadiBot, userId)
            global.subBotReconnectAttempts.delete(userId)
            // NUEVO: Limpiar bandera de código enviado al hacer cleanup completo
            global.sentCodes.delete(userId)
        }
    }

    // Timer de espera inicial (solo si no es reconexión)
    if (!isReconnect) {
        connectionTimer = setTimeout(async () => {
            if (!sock.user) {
                console.log(chalk.yellow(`⏰ Timeout de conexión para ${userId}`))
                await cleanup(true)
                await m.reply?.('⏰ Tiempo de espera agotado. Intenta nuevamente.')
            }
        }, 120000) // 2 minutos para escanear
    }

    // ============= MANEJO DE CONEXIÓN =============
    async function connectionUpdate(update) {
        const { connection, lastDisconnect, qr, isNewLogin } = update

        if (isNewLogin) {
            console.log(chalk.blue(`🆕 Nueva sesión detectada: ${userId}`))
        }

        // Manejar QR - NUEVA LÓGICA: Solo enviar una vez
        if (qr) {
            // NUEVO: Verificar si ya se envió código/QR para este usuario
            if (global.sentCodes.has(userId) || codeSent) {
                console.log(chalk.yellow(`⚠️ Código/QR ya enviado previamente a ${userId}, ignorando...`))
                return
            }

            // Marcar como enviado tanto local como globalmente
            codeSent = true
            global.sentCodes.set(userId, {
                timestamp: Date.now(),
                type: mcode ? 'code' : 'qr'
            })

            if (mcode) {
                // Modo código
                try {
                    const secret = await sock.requestPairingCode(userId)
                    const formattedCode = secret.match(/.{1,4}/g)?.join("-") || secret

                    await conn.sendMessage(m.chat, {
                        image: { url: imagenSerBot },
                        caption: rtx2
                    }, { quoted: m })

                    const codeMsg = await m.reply(`\`${formattedCode}\``)

                    // Auto-eliminar código
                    setTimeout(() => {
                        conn.sendMessage(m.sender, { delete: codeMsg.key }).catch(() => {})
                        // NUEVO: Limpiar bandera después de 45 segundos para permitir nueva solicitud
                        global.sentCodes.delete(userId)
                    }, 45000)

                } catch (e) {
                    console.error('Error pairing code:', e)
                    // NUEVO: Si hay error, limpiar bandera para permitir reintento
                    global.sentCodes.delete(userId)
                    codeSent = false
                    await m.reply?.('❌ Error generando código. Intenta con QR: ' + usedPrefix + 'qr')
                }
            } else {
                // Modo QR
                try {
                    const qrBuffer = await qrcode.toBuffer(qr, { 
                        scale: 8, 
                        margin: 2,
                        errorCorrectionLevel: 'H'
                    })

                    const qrMsg = await conn.sendMessage(m.chat, {
                        image: qrBuffer,
                        caption: rtx.trim()
                    }, { quoted: m })

                    // Auto-eliminar QR
                    qrTimer = setTimeout(() => {
                        conn.sendMessage(m.sender, { delete: qrMsg.key }).catch(() => {})
                        // NUEVO: Limpiar bandera después de 45 segundos
                        global.sentCodes.delete(userId)
                    }, 45000)

                } catch (e) {
                    console.error('Error generando QR:', e)
                    // NUEVO: Si hay error, limpiar bandera
                    global.sentCodes.delete(userId)
                    codeSent = false
                }
            }
            return
        }

        // Conexión exitosa
        if (connection === 'open') {
            // Limpiar timers
            if (connectionTimer) clearTimeout(connectionTimer)
            global.subBotReconnectAttempts.delete(userId)
            // NUEVO: Limpiar bandera de código enviado al conectar exitosamente
            global.sentCodes.delete(userId)

            // Guardar estado
            const sessionData = {
                jid: sock.user.jid,
                name: sock.user.name || 'SubBot',
                userId: userId,
                owner: m.sender,
                connectedAt: new Date().toISOString(),
                config: sock.subConfig
            }

            fs.writeFileSync(
                path.join(pathAstaJadiBot, 'session.json'),
                JSON.stringify(sessionData, null, 2)
            )

            // Registrar en globales
            if (!global.conns.includes(sock)) {
                global.conns.push(sock)
            }

            global.activeSubBots.set(sock.user.jid, {
                socket: sock,
                userId: userId,
                connectedAt: Date.now(),
                config: sock.subConfig
            })

            // Actualizar config con JID real
            sock.subConfig.jid = sock.user.jid
            sock.subConfig.updatedAt = new Date().toISOString()
            fs.writeFileSync(configPath, JSON.stringify(sock.subConfig, null, 2))

            console.log(chalk.green.bold(
                `\n✅ SUBBOT CONECTADO\n` +
                `├─ User: ${sock.user.name}\n` +
                `├─ JID: ${sock.user.jid}\n` +
                `└─ Path: ${pathAstaJadiBot}\n`
            ))

            // Notificar solo en primera conexión (no en reconexiones)
            if (!isReconnect && m?.chat) {
                await conn.sendMessage(m.chat, {
                    text: `✅ *SubBot Conectado!*\n\n` +
                          `🤖 ${sock.user.name}\n` +
                          `📱 ${sock.user.jid.split('@')[0]}\n` +
                          `👤 Owner: @${m.sender.split('@')[0]}\n\n` +
                          `⚙️ Config: ${usedPrefix}config\n` +
                          `🗑️ Eliminar: ${usedPrefix}kill ${userId}`,
                    mentions: [m.sender]
                }).catch(() => {})
            }

            // Unirse a newsletters
            if (global.ch) {
                for (const ch of Object.values(global.ch)) {
                    if (ch?.endsWith('@newsletter')) {
                        await sock.newsletterFollow(ch).catch(() => {})
                    }
                }
            }
        }

        // Manejar desconexión
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode || 
                              lastDisconnect?.error?.output?.payload?.statusCode

            console.log(chalk.yellow(`🔌 Desconexión ${userId}: ${statusCode}`))

            const shouldReconnect = ![
                DisconnectReason.loggedOut,
                DisconnectReason.badSession,
                401, 405
            ].includes(statusCode)

            const shouldCleanup = [
                DisconnectReason.loggedOut,
                DisconnectReason.badSession,
                401, 405, 403
            ].includes(statusCode)

            // Limpiar de globales
            const index = global.conns.indexOf(sock)
            if (index > -1) global.conns.splice(index, 1)
            global.activeSubBots.delete(sock.user?.jid)

            if (shouldCleanup) {
                console.log(chalk.red(`🗑️ Sesión inválida, limpiando: ${userId}`))
                await cleanup(true)
                await m.reply?.(`❌ Sesión inválida. Vuelve a vincular con ${usedPrefix}qr`)
                return
            }

            if (shouldReconnect && reconnectAttempts < maxReconnectAttempts) {
                console.log(chalk.blue(`🔄 Reconectando ${userId}...`))
                await cleanup(false)

                // Reconexión con delay exponencial
                await delay(Math.min(1000 * Math.pow(2, reconnectAttempts), 30000))

                await AstaJadiBot({
                    ...options,
                    isReconnect: true
                })
            } else if (reconnectAttempts >= maxReconnectAttempts) {
                await cleanup(true)
                await m.reply?.(`❌ SubBot desconectado permanentemente tras ${maxReconnectAttempts} intentos.`)
            }
        }
    }

    // ============= CARGAR HANDLER CON RECARGA SEGURA =============
    let handlerModule
    try {
        handlerModule = await import('../../handler.js')
    } catch (e) {
        console.error('Error cargando handler:', e)
    }

    const creloadHandler = async function (restartConn) {
        try {
            const Handler = await import(`../../handler.js?update=${Date.now()}`)
                .catch(() => null)

            if (Handler && Object.keys(Handler).length) {
                handlerModule = Handler
            }
        } catch (e) {
            console.error('Error recargando handler:', e)
        }

        if (restartConn && sockRef.current) {
            const oldChats = { ...sockRef.current.chats }

            try {
                if (sockRef.current.ws?.readyState === 1) {
                    sockRef.current.ws.close()
                }
            } catch {}

            sockRef.current.ev.removeAllListeners()

            // Crear nueva conexión preservando chats
            const newSock = makeWASocket({
                ...connectionOptions,
                chats: oldChats
            })

            sockRef.current = newSock
            sock = newSock
            sock.subConfig = subBotConfig
            sock.userId = userId

            // Re-registrar listeners
            setupListeners()
        }

        setupListeners()
        return true
    }

    const setupListeners = () => {
        if (handlerModule?.handler) {
            sock.handler = handlerModule.handler.bind(sock)
            sock.connectionUpdate = connectionUpdate.bind(sock)
            sock.credsUpdate = saveCreds.bind(sock)

            sock.ev.on("messages.upsert", sock.handler)
            sock.ev.on("connection.update", sock.connectionUpdate)
            sock.ev.on("creds.update", sock.credsUpdate)
        }
    }

    setupListeners()

    // Health check cada 30 segundos
    messageRetryTimer = setInterval(() => {
        if (sock.ws?.readyState === 3) { // CLOSED
            console.log(chalk.red(`💔 WebSocket cerrado detectado: ${userId}`))
            clearInterval(messageRetryTimer)
            connectionUpdate({ 
                connection: 'close', 
                lastDisconnect: { error: { output: { statusCode: 440 } } } 
            })
        }
    }, 30000)
}

// ============= FUNCIONES AUXILIARES =============
async function cleanupSession(sessionPath, userId) {
    try {
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true })
            console.log(chalk.green(`🗑️ Sesión eliminada: ${userId}`))
        }
    } catch (e) {
        console.error('Error eliminando sesión:', e)
    }

    global.subBotsData.delete(userId)
    // NUEVO: También limpiar la bandera de código enviado
    global.sentCodes.delete(userId)
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function msToTime(duration) {
    const seconds = Math.floor((duration / 1000) % 60)
    const minutes = Math.floor((duration / (1000 * 60)) % 60)
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
}