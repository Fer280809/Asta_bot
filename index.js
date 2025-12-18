process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'
import './settings.js'
import './plugins/_allfake.js'
import cfonts from 'cfonts'
import { createRequire } from 'module'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import fs, { readdirSync, statSync, unlinkSync, existsSync, mkdirSync, readFileSync, rmSync, watch } from 'fs'
import yargs from 'yargs'
import { spawn } from 'child_process'
import lodash from 'lodash'
import { AstaJadiBot } from './plugins/sockets-serbot.js'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import pino from 'pino'
import Pino from 'pino'
import path, { join } from 'path'
import { Boom } from '@hapi/boom'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import { Low, JSONFile } from 'lowdb'
import store from './lib/store.js'
const { proto } = (await import('@whiskeysockets/baileys')).default
import pkg from 'google-libphonenumber'
const { PhoneNumberUtil } = pkg
const phoneUtil = PhoneNumberUtil.getInstance()
const { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser } = await import('@whiskeysockets/baileys')
import readline from 'readline'
import NodeCache from 'node-cache'
const { CONNECTING } = ws
const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

// ============ FUNCIONES AUXILIARES OPTIMIZADAS ============

/**
 * Limpia y valida número de teléfono
 */
function cleanPhoneNumber(number) {
    if (!number) return ''
    let cleaned = number.replace(/\D/g, '')
    
    // Corrige números mexicanos
    if (cleaned.startsWith('521')) {
        cleaned = '52' + cleaned.slice(3)
    }
    
    return cleaned.startsWith('+') ? cleaned.slice(1) : cleaned
}

/**
 * Verifica si un número es válido
 */
async function isValidPhoneNumber(number) {
    try {
        number = number.replace(/\s+/g, '')
        
        // Corrección para números mexicanos
        if (number.startsWith('+521')) {
            number = number.replace('+521', '+52')
        } else if (number.startsWith('+52') && number[4] === '1') {
            number = number.replace('+52 1', '+52')
        }
        
        const parsedNumber = phoneUtil.parseAndKeepRawInput(number)
        return phoneUtil.isValidNumber(parsedNumber)
    } catch {
        return false
    }
}

/**
 * Crea directorios necesarios
 */
function ensureDirectories() {
    const dirs = [global.sessions || 'Sessions/Principal', global.jadi || 'Sessions/SubBot', 'tmp']
    
    for (const dir of dirs) {
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true })
            console.log(chalk.gray(`📁 Carpeta creada: ${dir}`))
        }
    }
}

/**
 * Carga optimizada de plugins
 */
async function loadPluginsOptimized() {
    console.log(chalk.bold.cyan('\n' + '═'.repeat(50)))
    console.log(chalk.bold.cyan('   CARGANDO PLUGINS...'))
    console.log(chalk.bold.cyan('═'.repeat(50) + '\n'))

    global.plugins = {}
    const pluginFolders = ['./plugins', './plugins2', './plugins3', './plugins4', './plugins5']
    const pluginFilter = filename => /\.js$/.test(filename)
    
    let totalPlugins = 0
    const folderStats = {}

    // Carga paralela optimizada
    const loadPromises = []
    
    for (const folder of pluginFolders) {
        const folderPath = join(__dirname, folder)
        
        if (!existsSync(folderPath)) {
            console.log(chalk.gray(`   ${folder} → No existe`))
            continue
        }

        const files = readdirSync(folderPath).filter(pluginFilter)
        folderStats[folder] = files.length
        
        for (const filename of files) {
            const filePath = join(folderPath, filename)
            const fileUrl = global.__filename(filePath)
            
            loadPromises.push(
                import(fileUrl)
                    .then(module => {
                        global.plugins[filename] = module.default || module
                        return { success: true, folder, filename }
                    })
                    .catch(error => {
                        console.error(chalk.red(`   ✗ ${folder}/${filename}: ${error.message}`))
                        return { success: false, folder, filename, error }
                    })
            )
        }
    }

    // Espera todas las cargas
    const results = await Promise.allSettled(loadPromises)
    
    // Estadísticas
    let loaded = 0
    let failed = 0
    
    for (const folder of pluginFolders) {
        if (folderStats[folder] > 0) {
            console.log(chalk.green(`   ✓ ${folder}: ${folderStats[folder]} plugins`))
            totalPlugins += folderStats[folder]
        }
    }
    
    console.log(chalk.bold.green('\n' + '═'.repeat(50)))
    console.log(chalk.bold.green(`   ✅ TOTAL: ${totalPlugins} PLUGINS`))
    console.log(chalk.bold.green('═'.repeat(50) + '\n'))
    
    return totalPlugins
}

/**
 * Limpieza automática de archivos temporales
 */
function setupTempCleanup() {
    const tmpDir = join(__dirname, 'tmp')
    
    setInterval(() => {
        try {
            if (existsSync(tmpDir)) {
                const files = readdirSync(tmpDir)
                const now = Date.now()
                const maxAge = 5 * 60 * 1000 // 5 minutos
                
                for (const file of files) {
                    try {
                        const filePath = join(tmpDir, file)
                        const stats = statSync(filePath)
                        
                        if (now - stats.mtimeMs > maxAge) {
                            unlinkSync(filePath)
                        }
                    } catch {}
                }
            }
        } catch {}
    }, 10 * 60 * 1000) // Cada 10 minutos
}

/**
 * Configura watchers para recarga en caliente
 */
function setupPluginWatchers() {
    const pluginFolders = ['./plugins', './plugins2', './plugins3', './plugins4', './plugins5']
    const pluginFilter = filename => /\.js$/.test(filename)
    
    global.reload = async (_ev, filename) => {
        if (!pluginFilter(filename)) return
        
        let pluginFound = false
        
        for (const folder of pluginFolders) {
            const folderPath = join(__dirname, folder)
            if (!existsSync(folderPath)) continue
            
            const filePath = join(folderPath, filename)
            const fullPath = global.__filename(filePath, true)
            
            if (existsSync(fullPath)) {
                pluginFound = true
                const isUpdate = filename in global.plugins
                
                console.log(chalk.yellow(`   🔄 ${isUpdate ? 'Actualizando' : 'Cargando'}: ${folder}/${filename}`))
                
                // Verifica sintaxis
                const err = syntaxerror(readFileSync(fullPath), filename, {
                    sourceType: 'module',
                    allowAwaitOutsideFunction: true,
                })
                
                if (err) {
                    console.error(chalk.red(`   ✗ Error de sintaxis: ${filename}`))
                    delete global.plugins[filename]
                } else {
                    try {
                        const module = await import(`${fullPath}?update=${Date.now()}`)
                        global.plugins[filename] = module.default || module
                    } catch (e) {
                        console.error(chalk.red(`   ✗ ${filename}: ${e.message}`))
                        delete global.plugins[filename]
                    }
                }
                break
            }
        }
        
        if (!pluginFound && filename in global.plugins) {
            console.log(chalk.red(`   🗑️  Eliminando: ${filename}`))
            delete global.plugins[filename]
        }
    }
    
    Object.freeze(global.reload)
    
    // Configura watchers
    for (const folder of pluginFolders) {
        const folderPath = join(__dirname, folder)
        if (existsSync(folderPath)) {
            watch(folderPath, global.reload)
        }
    }
}

/**
 * Inicializa sub-bots de forma optimizada
 */
function initializeSubBots() {
    if (!global.AstaJadibts) return
    
    global.rutaJadiBot = join(__dirname, global.jadi || 'Sessions/SubBot')
    
    if (!existsSync(global.rutaJadiBot)) {
        mkdirSync(global.rutaJadiBot, { recursive: true })
        console.log(chalk.cyan(`   📁 Carpeta creada: ${global.jadi}`))
    }
    
    const readRutaJadiBot = readdirSync(global.rutaJadiBot)
    
    if (readRutaJadiBot.length > 0) {
        const creds = 'creds.json'
        
        for (const gjbts of readRutaJadiBot) {
            const botPath = join(global.rutaJadiBot, gjbts)
            
            if (existsSync(botPath)) {
                const readBotPath = readdirSync(botPath)
                
                if (readBotPath.includes(creds)) {
                    // Inicializa en segundo plano sin bloquear
                    setTimeout(() => {
                        try {
                            AstaJadiBot({
                                pathAstaJadiBot: botPath,
                                m: null,
                                conn,
                                args: '',
                                usedPrefix: '/',
                                command: 'serbot'
                            })
                        } catch (error) {
                            console.error(chalk.red(`   ✗ Error iniciando sub-bot ${gjbts}:`, error.message))
                        }
                    }, 1000)
                }
            }
        }
    }
}

/**
 * Test rápido de dependencias optimizado
 */
async function quickDependencyTest() {
    const dependencies = [
        { cmd: ['ffmpeg'], name: 'ffmpeg' },
        { cmd: ['ffprobe'], name: 'ffprobe' },
        { cmd: ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-'], name: 'ffmpeg-webp' },
        { cmd: ['convert'], name: 'imagemagick' },
        { cmd: ['magick'], name: 'magick' },
        { cmd: ['gm'], name: 'graphicsmagick' },
        { cmd: ['find', '--version'], name: 'find' }
    ]
    
    const testPromises = dependencies.map(({ cmd, name }) => {
        return new Promise(resolve => {
            const process = spawn(cmd[0], cmd.slice(1), { stdio: 'ignore' })
            
            const timeout = setTimeout(() => {
                process.kill()
                resolve({ name, available: false })
            }, 5000)
            
            process.on('close', (code) => {
                clearTimeout(timeout)
                resolve({ name, available: code !== 127 })
            })
            
            process.on('error', () => {
                clearTimeout(timeout)
                resolve({ name, available: false })
            })
        })
    })
    
    const results = await Promise.all(testPromises)
    const support = {}
    
    results.forEach(({ name, available }) => {
        support[name] = available
        const status = available ? chalk.green('✓') : chalk.red('✗')
        console.log(chalk.gray(`   ${status} ${name}`))
    })
    
    global.support = support
    Object.freeze(global.support)
}

// ============ INICIALIZACIÓN PRINCIPAL ============
let { say } = cfonts

// Encabezado visual optimizado
console.clear()
console.log(chalk.magentaBright('\n⚡ Iniciando Asta Bot...\n'))

say('Asta Bot', {
    font: 'block',
    align: 'center',
    gradient: ['red', 'magenta'],
    space: false
})

say('Sistema Multi-Plugins', {
    font: 'console',
    align: 'center',
    colors: ['cyan'],
    space: false
})

say('By Fernando', {
    font: 'tiny',
    align: 'center',
    colors: ['yellow'],
    space: false
})

console.log()

// Configuración global
protoType()
serialize()

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
    return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString()
}

global.__dirname = function dirname(pathURL) {
    return path.dirname(global.__filename(pathURL, true))
}

global.__require = function require(dir = import.meta.url) {
    return createRequire(dir)
}

global.timestamp = { start: new Date }
const __dirname = global.__dirname(import.meta.url)
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.prefix = new RegExp('^[#!./-]')

// Asegura directorios
ensureDirectories()

// Base de datos optimizada
global.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : new JSONFile('database.json'))
global.DATABASE = global.db

global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) {
        return new Promise((resolve) => {
            const checkInterval = setInterval(async function() {
                if (!global.db.READ) {
                    clearInterval(checkInterval)
                    resolve(global.db.data == null ? global.loadDatabase() : global.db.data)
                }
            }, 1000)
        })
    }
    
    if (global.db.data !== null) return
    
    global.db.READ = true
    await global.db.read().catch(console.error)
    global.db.READ = null
    global.db.data = {
        users: {},
        chats: {},
        settings: {},
        ...(global.db.data || {})
    }
    global.db.chain = chain(global.db.data)
}

await loadDatabase()

// ============ CONEXIÓN PRINCIPAL ============
const { state, saveCreds } = await useMultiFileAuthState(global.sessions || 'Sessions/Principal')
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
const { version } = await fetchLatestBaileysVersion()

let phoneNumber = global.botNumber
const methodCodeQR = process.argv.includes("qr")
const methodCode = !!phoneNumber || process.argv.includes("code")
const MethodMobile = process.argv.includes("mobile")

const rl = readline.createInterface({ 
    input: process.stdin, 
    output: process.stdout 
})
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))

let opcion

// Selección de método de conexión optimizada
if (methodCodeQR) {
    opcion = '1'
}

if (!methodCodeQR && !methodCode && !fs.existsSync(`${global.sessions || 'Sessions/Principal'}/creds.json`)) {
    do {
        console.log(chalk.bold.white("\nSeleccione método de conexión:\n"))
        console.log(chalk.blueBright("   1. Con código QR"))
        console.log(chalk.cyan("   2. Con código de 8 dígitos\n"))
        
        opcion = await question(chalk.bold.magentaBright("   → Opción: "))
        
        if (!/^[1-2]$/.test(opcion)) {
            console.log(chalk.red("\n   ✗ Opción inválida. Solo 1 o 2"))
        }
    } while (opcion !== '1' && opcion !== '2')
}

console.info = () => {}

// Configuración de conexión optimizada
const connectionOptions = {
    logger: pino({ level: 'silent' }),
    printQRInTerminal: opcion == '1' ? true : methodCodeQR ? true : false,
    mobile: MethodMobile,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
    },
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    getMessage: async (key) => {
        try {
            let jid = jidNormalizedUser(key.remoteJid)
            let msg = await store.loadMessage(jid, key.id)
            return msg?.message || ""
        } catch {
            return ""
        }
    },
    msgRetryCounterCache,
    userDevicesCache,
    defaultQueryTimeoutMs: undefined,
    cachedGroupMetadata: (jid) => globalThis.conn?.chats?.[jid] ?? {},
    version,
    keepAliveIntervalMs: 30000,
    maxIdleTimeMs: 45000,
    connectTimeoutMs: 30000,
}

global.conn = makeWASocket(connectionOptions)
conn.ev.on("creds.update", saveCreds)

// ============ SISTEMA DE CÓDIGO DE EMPAREJAMIENTO (MANTENIENDO COMPATIBILIDAD) ============
if (!fs.existsSync(`${global.sessions || 'Sessions/Principal'}/creds.json`)) {
    if (opcion === '2' || methodCode) {
        console.log(chalk.yellow('\n   🔐 Modo código de emparejamiento activado'))
        
        if (!conn.authState.creds.registered) {
            let addNumber
            
            if (!!phoneNumber) {
                addNumber = cleanPhoneNumber(phoneNumber)
            } else {
                do {
                    phoneNumber = await question(chalk.bold.greenBright('\n   📱 Ingrese número de WhatsApp (ej: 5213312345678):\n   → '))
                    phoneNumber = phoneNumber.replace(/\D/g, '')
                    
                    if (!phoneNumber.startsWith('+')) {
                        phoneNumber = `+${phoneNumber}`
                    }
                } while (!await isValidPhoneNumber(phoneNumber))
                
                rl.close()
                addNumber = cleanPhoneNumber(phoneNumber)
            }
            
            // Espera optimizada para conexión
            console.log(chalk.cyan('\n   ⏳ Preparando conexión...'))
            
            let connected = false
            for (let attempt = 1; attempt <= 10; attempt++) {
                if (conn.authState.creds.registered) {
                    connected = true
                    break
                }
                await delay(1000)
                
                if (attempt % 3 === 0) {
                    console.log(chalk.yellow(`   ⏱️  Esperando... (${attempt}/10)`))
                }
            }
            
            if (!connected) {
                console.log(chalk.red('\n   ✗ No se pudo establecer conexión'))
                console.log(chalk.yellow('\n   💡 Soluciones:'))
                console.log(chalk.cyan('   1. Reinicia el bot: npm start'))
                console.log(chalk.cyan('   2. Usa método QR (Opción 1)'))
                console.log(chalk.cyan('   3. Verifica conexión a internet\n'))
                process.exit(1)
            }
            
            // Generación de código optimizada
            let codeGenerated = false
            let attempts = 0
            const maxRetries = 3
            
            while (!codeGenerated && attempts < maxRetries) {
                attempts++
                
                try {
                    console.log(chalk.yellow(`   🔄 Generando código (Intento ${attempts}/${maxRetries})...`))
                    
                    const cleanNumber = addNumber.replace('+', '')
                    let codeBot = await conn.requestPairingCode(cleanNumber)
                    
                    if (!codeBot || codeBot.trim() === '') {
                        throw new Error('Código vacío')
                    }
                    
                    // Formato del código
                    codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot
                    
                    console.log(chalk.bold.white('\n' + '═'.repeat(50)))
                    console.log(chalk.bold.white('   🔗 CÓDIGO DE VINCULACIÓN'))
                    console.log(chalk.bold.white('═'.repeat(50)))
                    console.log(chalk.bold.green(`\n        ${codeBot}\n`))
                    console.log(chalk.white('═'.repeat(50)))
                    
                    console.log(chalk.yellow('\n   📋 Instrucciones:'))
                    console.log(chalk.cyan('   1. Abre WhatsApp en tu teléfono'))
                    console.log(chalk.cyan('   2. Ve a Ajustes → Dispositivos vinculados'))
                    console.log(chalk.cyan('   3. Toca "Vincular un dispositivo"'))
                    console.log(chalk.cyan(`   4. Ingresa: ${codeBot}`))
                    console.log(chalk.green('\n   ⏰ El código expira en 5 minutos\n'))
                    
                    codeGenerated = true
                    
                } catch (error) {
                    console.error(chalk.red(`   ✗ Intento ${attempts} falló: ${error.message}`))
                    
                    if (attempts < maxRetries) {
                        await delay(5000)
                    } else {
                        console.log(chalk.red('\n   ✗ No se pudo generar código'))
                        console.log(chalk.yellow('\n   💡 Prueba:'))
                        console.log(chalk.cyan('   1. Método QR (Opción 1)'))
                        console.log(chalk.cyan('   2. Verifica el número'))
                        console.log(chalk.cyan('   3. Espera 10 minutos\n'))
                    }
                }
            }
        }
    }
}

// ============ CONFIGURACIÓN RESTANTE (IGUAL PERO ORGANIZADA) ============
conn.isInit = false
conn.well = false

if (!opts['test']) {
    setInterval(async () => {
        if (global.db.data) {
            await global.db.write().catch(() => {})
        }
    }, 60 * 1000)
}

async function connectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin } = update
    global.stopped = connection
    
    if (isNewLogin) conn.isInit = true
    
    const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
    
    if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
        await global.reloadHandler(true).catch(console.error)
        global.timestamp.connect = new Date
    }
    
    if (global.db.data == null) loadDatabase()
    
    if (update.qr != 0 && update.qr != undefined || methodCodeQR) {
        if (opcion == '1' || methodCodeQR) {
            console.log(chalk.green.bold(`\n   📱 Escanea el código QR`))
        }
    }
    
    if (connection === "open") {
        const userName = conn.user.name || conn.user.verifiedName || "Usuario"
        
        console.log(chalk.bold.green('\n' + '═'.repeat(50)))
        console.log(chalk.bold.green('   ✅ BOT CONECTADO EXITOSAMENTE'))
        console.log(chalk.bold.green('═'.repeat(50)))
        console.log(chalk.cyan(`   👤 Usuario: ${userName}`))
        console.log(chalk.cyan(`   📞 Número: ${conn.user.id.split(':')[0]}`))
        console.log(chalk.cyan(`   🟢 Estado: Activo y funcionando`))
        console.log(chalk.gray(`   🕐 Hora: ${new Date().toLocaleString('es-MX')}`))
        console.log(chalk.bold.green('═'.repeat(50) + '\n'))
    }
    
    let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
    if (connection === "close") {
        if ([401, 440, 428, 405].includes(reason)) {
            console.log(chalk.red(`   ⚠️ Sesión principal cerrada (Código: ${code})`))
        }
        console.log(chalk.yellow("\n   🔄 Reconectando..."))
        await global.reloadHandler(true).catch(console.error)
    }
}

process.on('uncaughtException', console.error)

let isInit = true
let handler = await import('./handler.js')

global.reloadHandler = async function(restartConn) {
    try {
        const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error)
        if (Object.keys(Handler || {}).length) handler = Handler
    } catch (e) {
        console.error(e)
    }
    
    if (restartConn) {
        const oldChats = global.conn.chats
        try {
            global.conn.ws.close()
        } catch {}
        
        conn.ev.removeAllListeners()
        global.conn = makeWASocket(connectionOptions, { chats: oldChats })
        isInit = true
    }
    
    if (!isInit) {
        conn.ev.off('messages.upsert', conn.handler)
        conn.ev.off('connection.update', conn.connectionUpdate)
        conn.ev.off('creds.update', conn.credsUpdate)
    }
    
    conn.handler = handler.handler.bind(global.conn)
    conn.connectionUpdate = connectionUpdate.bind(global.conn)
    conn.credsUpdate = saveCreds.bind(global.conn, true)
    
    conn.ev.on('messages.upsert', conn.handler)
    conn.ev.on('connection.update', conn.connectionUpdate)
    conn.ev.on('creds.update', conn.credsUpdate)
    
    isInit = false
    return true
}

process.on('unhandledRejection', (reason) => {
    console.error(chalk.red("   ⚠️ Error no manejado:"), reason)
})

// ============ INICIALIZACIÓN FINAL ============

// Inicia sub-bots
initializeSubBots()

// Carga plugins
await loadPluginsOptimized()

// Configura watchers
setupPluginWatchers()

// Limpieza automática
setupTempCleanup()

// Test de dependencias
await quickDependencyTest().catch(console.error)

// Último paso: cargar handler
await global.reloadHandler()

console.log(chalk.bold.green('\n' + '═'.repeat(50)))
console.log(chalk.bold.green('   🚀 ASTA BOT INICIADO CORRECTAMENTE'))
console.log(chalk.bold.green('═'.repeat(50) + '\n'))
