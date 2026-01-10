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
console.log(chalk.magentaBright('\n▶ Iniciando Asta Bot...'))
say('Asta Bot', {
  font: 'block',
  align: 'center',
  gradient: ['red', 'magenta']
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
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${global.sessions}/creds.json`)) {
  do {
    opcion = await question(chalk.bold.white("Seleccione opción:\n") + chalk.blueBright("1. QR\n") + chalk.cyan("2. Código\n▶▶▶ "))
    if (!/^[1-2]$/.test(opcion)) {
      console.log(chalk.bold.redBright(`✖ Solo 1 o 2`))
    }
  } while (opcion !== '1' && opcion !== '2' || fs.existsSync(`./${global.sessions}/creds.json`))
}

console.info = () => {}

const connectionOptions = {
  logger: pino({ level: 'silent' }),
  printQRInTerminal: opcion == '1' ? true : methodCodeQR ? true : false,
  mobile: MethodMobile,
  browser: ["Ubuntu", "Chrome", "20.0.04"],
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
  },
  generateHighQualityLinkPreview: true,
  msgRetryCounterCache,
  userDevicesCache,
  version,
}

global.conn = makeWASocket(connectionOptions)
conn.ev.on("creds.update", saveCreds)

if (!fs.existsSync(`./${global.sessions}/creds.json`)) {
  if (opcion === '2' || methodCode) {
    console.log(chalk.yellow('[⚡] Modo código activado'))
    
    if (!conn.authState.creds.registered) {
      let addNumber
      if (!!phoneNumber) {
        addNumber = phoneNumber.replace(/[^0-9]/g, '')
      } else {
        do {
          phoneNumber = await question(chalk.bgBlack(chalk.bold.greenBright(`[📱] Número WhatsApp:\n▶▶▶ `)))
          phoneNumber = phoneNumber.replace(/\D/g, '')
          if (!phoneNumber.startsWith('+')) phoneNumber = `+${phoneNumber}`
        } while (!await isValidPhoneNumber(phoneNumber))
        rl.close()
        addNumber = phoneNumber.replace(/\D/g, '')
      }

      console.log(chalk.cyan('[⏳] Generando código...'))
      
      try {
        const cleanNumber = addNumber.replace('+', '')
        let codeBot = await conn.requestPairingCode(cleanNumber)
        
        if (codeBot) {
          codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot
          console.log(chalk.bold.white(chalk.bgMagenta(`\n═══════════════════════`)))
          console.log(chalk.bold.white(chalk.bgMagenta(`      📲 CÓDIGO WhatsApp   `)))
          console.log(chalk.bold.white(chalk.bgMagenta(`═══════════════════════`)))
          console.log(chalk.bold.white(chalk.bgGreen(`      ${codeBot}      `)))
        }
      } catch (error) {
        console.error(chalk.red(`✖ Error: ${error.message}`))
      }
    }
  }
}

conn.isInit = false
conn.well = false

if (!opts['test']) {
  setInterval(async () => {
    if (global.db.data) await global.db.write().catch(() => {})
  }, 60 * 1000)
}

async function connectionUpdate(update) {
  const { connection, lastDisconnect } = update
  
  if (connection === "open") {
    const userName = conn.user.name || conn.user.verifiedName || "Usuario"
    console.log(chalk.bold.greenBright(`\n═══════════════════════`))
    console.log(chalk.bold.greenBright(`   ✅ BOT CONECTADO   `))
    console.log(chalk.bold.greenBright(`═══════════════════════`))
    console.log(chalk.cyan(`👤 ${userName}`))
    console.log(chalk.cyan(`📱 ${conn.user.id.split(':')[0]}`))
    console.log(chalk.gray(`🕐 ${new Date().toLocaleString('es-MX')}\n`))
  }
  
  if (connection === "close") {
    const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
    if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
      await global.reloadHandler(true).catch(console.error)
    }
    console.log(chalk.yellow("🔄 Reconectando..."))
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
    try { global.conn.ws.close() } catch {}
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
  console.error("⚠ Error:", reason)
})

function getPluginFiles(dir, baseDir = dir) {
  let results = []
  if (!existsSync(dir)) return results
  
  const items = readdirSync(dir, { withFileTypes: true })
  
  for (const item of items) {
    const fullPath = join(dir, item.name)
    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/')
    
    if (item.isDirectory()) {
      results = results.concat(getPluginFiles(fullPath, baseDir))
    } else if (item.isFile() && /\.js$/.test(item.name)) {
      results.push({
        fullPath,
        relativePath,
        folder: path.relative(__dirname, baseDir).replace(/\\/g, '/'),
        filename: item.name
      })
    }
  }
  
  return results
}

const pluginFolders = ['./plugins', './plugins2', './plugins3', './plugins4', './plugins5']
global.plugins = {}

async function filesInit() {
  console.log(chalk.bold.cyan('\n📦 Cargando plugins...'))

  let total = 0
  
  for (const folder of pluginFolders) {
    const folderPath = join(__dirname, folder)
    if (!existsSync(folderPath)) continue

    const pluginFiles = getPluginFiles(folderPath)
    
    for (const file of pluginFiles) {
      try {
        const module = await import(file.fullPath)
        const pluginKey = `${folder}/${file.relativePath}`
        global.plugins[pluginKey] = module.default || module
        total++
      } catch (e) {
        console.error(chalk.red(`✖ ${folder}/${file.relativePath}`))
      }
    }
    
    if (pluginFiles.length > 0) {
      console.log(chalk.green(`✅ ${folder}: ${pluginFiles.length}`))
    }
  }

  console.log(chalk.bold.green(`\n✨ Total: ${total} plugins\n`))
}

filesInit().catch(console.error)

global.reload = async (_ev, filename) => {
  if (!/\.js$/.test(filename)) return

  for (const folder of pluginFolders) {
    const folderPath = join(__dirname, folder)
    if (!existsSync(folderPath)) continue

    const searchFile = (dir, baseDir = dir) => {
      const items = readdirSync(dir, { withFileTypes: true })
      for (const item of items) {
        const fullPath = join(dir, item.name)
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/')
        
        if (item.isDirectory()) {
          const found = searchFile(fullPath, baseDir)
          if (found) return found
        } else if (item.name === filename) {
          return { fullPath, relativePath }
        }
      }
      return null
    }

    const fileInfo = searchFile(folderPath)
    if (fileInfo) {
      const pluginKey = `${folder}/${fileInfo.relativePath}`
      const isUpdate = pluginKey in global.plugins

      const err = syntaxerror(readFileSync(fileInfo.fullPath), filename, {
        sourceType: 'module',
        allowAwaitOutsideFunction: true,
      })

      if (err) {
        delete global.plugins[pluginKey]
        return
      }

      try {
        const module = await import(`${fileInfo.fullPath}?update=${Date.now()}`)
        global.plugins[pluginKey] = module.default || module
      } catch (e) {
        delete global.plugins[pluginKey]
      }
      return
    }
  }

  const existingKey = Object.keys(global.plugins).find(key => key.endsWith(`/${filename}`))
  if (existingKey) {
    delete global.plugins[existingKey]
  }
}

Object.freeze(global.reload)

for (const folder of pluginFolders) {
  const folderPath = join(__dirname, folder)
  if (existsSync(folderPath)) {
    watch(folderPath, { recursive: true }, global.reload)
  }
}

await global.reloadHandler()

setInterval(() => {
  const tmpDir = join(__dirname, 'tmp')
  if (existsSync(tmpDir)) {
    const files = readdirSync(tmpDir)
    for (const file of files) {
      try {
        const filePath = join(tmpDir, file)
        const stats = statSync(filePath)
        if (Date.now() - stats.mtimeMs > 5 * 60 * 1000) {
          unlinkSync(filePath)
        }
      } catch {}
    }
  }
}, 10 * 60 * 1000)

async function isValidPhoneNumber(number) {
  try {
    number = number.replace(/\s+/g, '')
    if (number.startsWith('+521')) {
      number = number.replace('+521', '+52')
    }
    const parsedNumber = phoneUtil.parseAndKeepRawInput(number)
    return phoneUtil.isValidNumber(parsedNumber)
  } catch {
    return false
  }
}