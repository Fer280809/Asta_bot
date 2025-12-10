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

let { say } = cfonts
console.log(chalk.magentaBright('\n⚡ Iniciando Sistema...'))
say('Asta Bot', {
  font: 'block',
  align: 'center',
  gradient: ['red', 'magenta']
})
say('Sistema Multi-Plugins Activado', {
  font: 'console',
  align: 'center',
  colors: ['cyan']
})
say('By Fernando', {
  font: 'tiny',
  align: 'center',
  colors: ['yellow', 'green']
})

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

// Base de datos optimizada
global.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : new JSONFile('database.json'))
global.DATABASE = global.db
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) {
    return new Promise((resolve) => setInterval(async function() {
      if (!global.db.READ) {
        clearInterval(this)
        resolve(global.db.data == null ? global.loadDatabase() : global.db.data)
      }
    }, 1 * 1000))
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
loadDatabase()

const { state, saveCreds } = await useMultiFileAuthState(global.sessions)
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
const { version } = await fetchLatestBaileysVersion()
let phoneNumber = global.botNumber
const methodCodeQR = process.argv.includes("qr")
const methodCode = !!phoneNumber || process.argv.includes("code")
const MethodMobile = process.argv.includes("mobile")
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))
let opcion

if (methodCodeQR) {
  opcion = '1'
}
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${sessions}/creds.json`)) {
  do {
    opcion = await question(chalk.bold.white("Seleccione una opción:\n") + chalk.blueBright("1. Con código QR\n") + chalk.cyan("2. Con código de 8 dígitos\n━━━> "))
    if (!/^[1-2]$/.test(opcion)) {
      console.log(chalk.bold.redBright(`❌ No se permiten números que no sean 1 o 2`))
    }
  } while (opcion !== '1' && opcion !== '2' || fs.existsSync(`./${sessions}/creds.json`))
}

console.info = () => {}

// Opciones de conexión optimizadas
const connectionOptions = {
  logger: pino({ level: 'silent' }),
  printQRInTerminal: opcion == '1' ? true : methodCodeQR ? true : false,
  mobile: MethodMobile,
  browser: ["Chrome (Linux)", "", ""],
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
  cachedGroupMetadata: (jid) => globalThis.conn.chats[jid] ?? {},
  version,
  keepAliveIntervalMs: 50000,
  maxIdleTimeMs: 60000,
}

global.conn = makeWASocket(connectionOptions)
conn.ev.on("creds.update", saveCreds)

// ============ SECCIÓN CORREGIDA DEL CÓDIGO ============
if (!fs.existsSync(`./${sessions}/creds.json`)) {
  if (opcion === '2' || methodCode) {
    opcion = '2'
    if (!conn.authState.creds.registered) {
      let addNumber
      if (!!phoneNumber) {
        addNumber = phoneNumber.replace(/[^0-9]/g, '')
      } else {
        do {
          phoneNumber = await question(chalk.bgBlack(chalk.bold.greenBright(`[ 🔐 ] Ingrese el número de WhatsApp.\n${chalk.bold.magentaBright('━━━> ')}`)))
          phoneNumber = phoneNumber.replace(/\D/g, '')
          if (!phoneNumber.startsWith('+')) {
            phoneNumber = `+${phoneNumber}`
          }
        } while (!await isValidPhoneNumber(phoneNumber))
        rl.close()
        addNumber = phoneNumber.replace(/\D/g, '')
      }
      
      // CORRECCIÓN: Esperamos a que la conexión esté lista antes de solicitar el código
      setTimeout(async () => {
        try {
          let codeBot = await conn.requestPairingCode(addNumber)
          codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot
          console.log(chalk.bold.white(chalk.bgMagenta(`\n[ 🔑 ] CÓDIGO DE EMPAREJAMIENTO:`)), chalk.bold.white(chalk.bgGreen(` ${codeBot} `)))
          console.log(chalk.yellow(`\n📱 Ingresa este código en WhatsApp > Dispositivos vinculados > Vincular dispositivo\n`))
        } catch (error) {
          console.error(chalk.red(`❌ Error al solicitar código: ${error.message}`))
        }
      }, 3000)
    }
  }
}
// ============ FIN SECCIÓN CORREGIDA ============

conn.isInit = false
conn.well = false

if (!opts['test']) {
  setInterval(async () => {
    if (global.db.data) await global.db.write().catch(() => {})
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
      console.log(chalk.green.bold(`[ 📱 ] Escanea este código QR`))
    }
  }
  if (connection === "open") {
    const userName = conn.user.name || conn.user.verifiedName || "Usuario"
    await joinChannels(conn).catch(() => {})
    console.log(chalk.bold.greenBright(`\n╔═══════════════════════════════════╗`))
    console.log(chalk.bold.greenBright(`║   ✅ BOT CONECTADO EXITOSAMENTE   ║`))
    console.log(chalk.bold.greenBright(`╚═══════════════════════════════════╝`))
    console.log(chalk.cyan(`👤 Usuario: ${userName}`))
    console.log(chalk.cyan(`📱 Número: ${conn.user.id.split(':')[0]}`))
    console.log(chalk.cyan(`🔥 Estado: Activo y funcionando`))
    console.log(chalk.gray(`⏰ Hora: ${new Date().toLocaleString('es-MX')}\n`))
  }
  let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
  if (connection === "close") {
    if ([401, 440, 428, 405].includes(reason)) {
      console.log(chalk.red(`⚠ (${code}) › Sesión principal cerrada.`))
    }
    console.log(chalk.yellow("⟳ Reconectando el Bot..."))
    await global.reloadHandler(true).catch(console.error)
  }
}

process.on('uncaughtException', console.error)
let isInit = true
let handler = await import('./handler.js')

global.reloadHandler = async function(restatConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error)
    if (Object.keys(Handler || {}).length) handler = Handler
  } catch (e) {
    console.error(e)
  }
  if (restatConn) {
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
  console.error("⚠ Rechazo no manejado:", reason)
})

// SubBots
global.rutaJadiBot = join(__dirname, `./${jadi}`)
if (global.AstaJadibts) {
  if (!existsSync(global.rutaJadiBot)) {
    mkdirSync(global.rutaJadiBot, { recursive: true })
    console.log(chalk.bold.cyan(`✓ Carpeta ${jadi} creada`))
  }
  const readRutaJadiBot = readdirSync(rutaJadiBot)
  if (readRutaJadiBot.length > 0) {
    const creds = 'creds.json'
    for (const gjbts of readRutaJadiBot) {
      const botPath = join(rutaJadiBot, gjbts)
      const readBotPath = readdirSync(botPath)
      if (readBotPath.includes(creds)) {
        AstaJadiBot({ pathAstaJadiBot: botPath, m: null, conn, args: '', usedPrefix: '/', command: 'serbot' })
      }
    }
  }
}

// Sistema de carga de plugins OPTIMIZADO - 5 Carpetas
const pluginFolders = ['./plugins', './plugins2', './plugins3', './plugins4', './plugins5']
const pluginFilter = filename => /\.js$/.test(filename)
global.plugins = {}

async function filesInit() {
  console.log(chalk.bold.cyan('\n╔═══════════════════════════════════╗'))
  console.log(chalk.bold.cyan('║      CARGANDO PLUGINS...          ║'))
  console.log(chalk.bold.cyan('╚═══════════════════════════════════╝\n'))

  const allLoadPromises = []
  const folderStats = {}

  for (const folder of pluginFolders) {
    const folderPath = join(__dirname, folder)
    if (!existsSync(folderPath)) {
      console.log(chalk.gray(`⚠ ${folder} no existe`))
      continue
    }

    folderStats[folder] = 0
    const files = readdirSync(folderPath).filter(pluginFilter)

    for (const filename of files) {
      const file = global.__filename(join(folderPath, filename))
      allLoadPromises.push(
        import(file)
          .then(module => {
            global.plugins[filename] = module.default || module
            folderStats[folder]++
            return { folder, filename, success: true }
          })
          .catch(e => {
            console.error(chalk.red(`❌ ${folder}/${filename}: ${e.message}`))
            delete global.plugins[filename]
            return { folder, filename, success: false }
          })
      )
    }
  }

  await Promise.all(allLoadPromises)

  let total = 0
  for (const [folder, count] of Object.entries(folderStats)) {
    if (count > 0) {
      console.log(chalk.green(`✓ ${folder}: ${count} plugins`))
      total += count
    }
  }

  console.log(chalk.bold.green(`\n╔═══════════════════════════════════╗`))
  console.log(chalk.bold.green(`║  🔥 TOTAL: ${total} PLUGINS 🔥  ║`))
  console.log(chalk.bold.green(`╚═══════════════════════════════════╝\n`))
}

filesInit().catch(console.error)

// Recarga optimizada de plugins
global.reload = async (_ev, filename) => {
  if (!pluginFilter(filename)) return

  for (const folder of pluginFolders) {
    const folderPath = join(__dirname, folder)
    if (!existsSync(folderPath)) continue

    const dir = global.__filename(join(folderPath, filename), true)

    if (existsSync(dir)) {
      const isUpdate = filename in global.plugins

      if (isUpdate) {
        console.log(chalk.yellow(`⟳ ${folder}/${filename}`))
      } else {
        console.log(chalk.green(`✨ ${folder}/${filename}`))
      }

      const err = syntaxerror(readFileSync(dir), filename, {
        sourceType: 'module',
        allowAwaitOutsideFunction: true,
      })

      if (err) {
        console.error(chalk.red(`❌ Syntax error: ${filename}`))
        delete global.plugins[filename]
      } else {
        try {
          const module = await import(`${global.__filename(dir)}?update=${Date.now()}`)
          global.plugins[filename] = module.default || module
        } catch (e) {
          console.error(chalk.red(`❌ ${filename}: ${e.message}`))
          delete global.plugins[filename]
        }
      }
      return
    }
  }

  if (filename in global.plugins) {
    console.log(chalk.red(`🗑 ${filename}`))
    delete global.plugins[filename]
  }
}

Object.freeze(global.reload)

// Observar todas las carpetas
for (const folder of pluginFolders) {
  const folderPath = join(__dirname, folder)
  if (existsSync(folderPath)) {
    watch(folderPath, global.reload)
  }
}

await global.reloadHandler()

// Limpieza de archivos temporales (cada 10 minutos)
setInterval(async () => {
  const tmpDir = join(__dirname, 'tmp')
  try {
    if (existsSync(tmpDir)) {
      const filenames = readdirSync(tmpDir)
      for (const file of filenames) {
        try {
          const filePath = join(tmpDir, file)
          const stats = statSync(filePath)
          const now = Date.now()
          const fileAge = now - stats.mtimeMs
          if (fileAge > 5 * 60 * 1000) {
            unlinkSync(filePath)
          }
        } catch {}
      }
    }
  } catch {}
}, 10 * 60 * 1000)

async function _quickTest() {
  const test = await Promise.all([
    spawn('ffmpeg'),
    spawn('ffprobe'),
    spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
    spawn('convert'),
    spawn('magick'),
    spawn('gm'),
    spawn('find', ['--version']),
  ].map((p) => {
    return Promise.race([
      new Promise((resolve) => {
        p.on('close', (code) => {
          resolve(code !== 127)
        })
      }),
      new Promise((resolve) => {
        p.on('error', (_) => resolve(false))
      })
    ])
  }))
  const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test
  const s = global.support = { ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find }
  Object.freeze(global.support)
}

_quickTest().catch(console.error)

async function isValidPhoneNumber(number) {
  try {
    number = number.replace(/\s+/g, '')
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

async function joinChannels(sock) {
  for (const value of Object.values(global.ch)) {
    if (typeof value === 'string' && value.endsWith('@newsletter')) {
      await sock.newsletterFollow(value).catch(() => {})
    }
  }
}