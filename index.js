process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'
import './settings.js'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'
import { createRequire } from 'module'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import fs, { readdirSync, statSync, unlinkSync, existsSync, mkdirSync, readFileSync, rmSync, watch } from 'fs'
import yargs from 'yargs'
import { spawn } from 'child_process'
import lodash from 'lodash'
import { yukiJadiBot } from './plugins/jadibot-serbot.js'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import { tmpdir } from 'os'
import { format } from 'util'
import boxen from 'boxen'
import P from 'pino'
import pino from 'pino'
import Pino from 'pino'
import path, { join, dirname } from 'path'
import { Boom } from '@hapi/boom'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import { Low, JSONFile } from 'lowdb'
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js'
import store from './lib/store.js'
const { proto } = (await import('@whiskeysockets/baileys')).default
import pkg from 'google-libphonenumber'
const { PhoneNumberUtil } = pkg
const phoneUtil = PhoneNumberUtil.getInstance()
const { DisconnectReason, useMultiFileAuthState, MessageRetryMap, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser } = await import('@whiskeysockets/baileys')
import readline, { createInterface } from 'readline'
import NodeCache from 'node-cache'
const { CONNECTING } = ws
const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

let { say } = cfonts

console.log(chalk.bold.cyan('\n═══════════════════════════════════════════════════════════'))
console.log(chalk.bold.white('               ✨ BIENVENIDO A ASTA BOT ✨'))
console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════════'))

say('Asta-Bot', {
  font: 'block',
  align: 'center',
  colors: ['magentaBright']
})

say(`Desarrollado por • Fernando`, {
  font: 'console',
  align: 'center',
  colors: ['blueBright']
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

global.API = (name, path = '/', query = {}, apikeyqueryname) =>
  (name in global.APIs ? global.APIs[name] : name) +
  path +
  (query || apikeyqueryname
    ? '?' +
      new URLSearchParams(
        Object.entries({
          ...query,
          ...(apikeyqueryname
            ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] }
            : {}),
        })
      )
    : '')

global.timestamp = { start: new Date }

const __dirname = global.__dirname(import.meta.url)

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.prefix = new RegExp('^[#/!.]')

global.sessions = 'session'
const nameqr = 'AstaBot'

global.db = new Low(
  /https?:\/\//.test(opts['db'] || '')
    ? new cloudDBAdapter(opts['db'])
    : new JSONFile('./src/database/database.json')


global.DATABASE = global.db
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) {
    return new Promise((resolve) =>
      setInterval(async function () {
        if (!global.db.READ) {
          clearInterval(this)
          resolve(global.db.data == null ? global.loadDatabase() : global.db.data)
        
      }, 1 * 1000)
    
  }
  if (global.db.data !== null) return
  global.db.READ = true
  await global.db.read().catch(console.error)
  global.db.READ = null
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(global.db.data || {}),
  }
  global.db.chain = chain(global.db.data)
}
loadDatabase()

const { state, saveState, saveCreds } = await useMultiFileAuthState(global.sessions)
const msgRetryCounterMap = (MessageRetryMap) => {}
const msgRetryCounterCache = new NodeCache()
const { version } = await fetchLatestBaileysVersion()
let phoneNumber = global.botNumber

const methodCodeQR = process.argv.includes('qr')
const methodCode = !!phoneNumber || process.argv.includes('code')
const MethodMobile = process.argv.includes('mobile')
const colores = chalk.bgMagenta.white
const opcionQR = chalk.bold.green
const opcionTexto = chalk.bold.cyan
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))

let opcion
if (methodCodeQR) {
  opcion = '1'
}
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${global.sessions}/creds.json`)) {
  do {
    console.log(chalk.bold.cyan('\n═══════════════════════════════════════════════════════════'))
    console.log(chalk.bold.white('              🔗 MÉTODO DE VINCULACIÓN - ASTA BOT 🔗'))
    console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════════'))
    opcion = await question(
      colores('\n📱 Selecciona tu método de vinculación:\n\n') +
        opcionQR('   1️⃣  Escanear Código QR (Rápido y seguro)\n') +
        chalk.gray('       └─ Abre WhatsApp y escanea el QR mostrado\n\n') +
        opcionTexto('   2️⃣  Código de 8 dígitos\n') +
        chalk.gray('       └─ Recibe un código para vincular tu número\n\n') +
        chalk.bold.magenta('🔹 Ingresa tu opción (1 o 2): ')
    )
    if (!/^[1-2]$/.test(opcion)) {
      console.log(chalk.bold.red('\n❌ Opción inválida. Solo se permiten 1 o 2.'))
      console.log(chalk.bold.yellow('ℹ️  Por favor elige una opción válida.\n'))
    }
  } while (opcion !== '1' && opcion !== '2' || fs.existsSync(`./${global.sessions}/creds.json`))
}

console.info = () => {}
console.debug = () => {}

const connectionOptions = {
  logger: pino({ level: 'silent' }),
  printQRInTerminal: opcion == '1',
  mobile: MethodMobile,
  browser: opcion == '1'
    ? [nameqr, 'Edge', '20.0.04']
    : ['Ubuntu', 'Edge', '110.0.1587.56'],
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(
      state.keys,
      Pino({ level: 'fatal' }).child({ level: 'fatal' })
    ),
  },
  markOnlineOnConnect: true,
  generateHighQualityLinkPreview: true,
  getMessage: async (clave) => {
    let jid = jidNormalizedUser(clave.remoteJid)
    let msg = await store.loadMessage(jid, clave.id)
    return msg?.message || ''
  },
  msgRetryCounterCache,
  msgRetryCounterMap,
  defaultQueryTimeoutMs: undefined,
  version,
}

global.conn = makeWASocket(connectionOptions)
conn.ev.on('connection.update', connectionUpdate)

if (!fs.existsSync(`./${global.sessions}/creds.json`)) {
  if (opcion === '2' || methodCode) {
    opcion = '2'
    if (!conn.authState.creds.registered) {
      let addNumber
      if (!!phoneNumber) {
        addNumber = phoneNumber.replace(/[^0-9]/g, '')
      } else {
        do {
          console.log(chalk.bold.cyan('\n═══════════════════════════════════════════════════════════'))
          console.log(chalk.bold.white('            📞 CONFIGURACIÓN DE NÚMERO TELEFÓNICO 📞'))
          console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════════'))
          phoneNumber = await question(
            chalk.bgGreen.black.bold('\n📱 Ingresa tu número de WhatsApp completo (ej: 573211234567):\n\n') +
              chalk.bold.yellow('💡 México: 521234567890\n') +
              chalk.bold.yellow('💡 Colombia: 573123456789\n') +
              chalk.bold.yellow('💡 España: 34612345678\n\n') +
              chalk.bold.cyan('🔹 Tu número: ')
          )
          phoneNumber = phoneNumber.replace(/\D/g, '')
          if (!phoneNumber.startsWith('+')) {
            phoneNumber = `+${phoneNumber}`
          }
        } while (!(await isValidPhoneNumber(phoneNumber)))
        rl.close()
        addNumber = phoneNumber.replace(/\D/g, '')
        setTimeout(async () => {
          let codeBot = await conn.requestPairingCode(addNumber)
          codeBot = codeBot?.match(/.{1,4}/g)?.join('-') || codeBot
          console.log(chalk.bold.cyan('\n═══════════════════════════════════════════════════════════'))
          console.log(chalk.bold.white('                🔐 CÓDIGO DE VINCULACIÓN 🔐'))
          console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════════'))
          console.log(chalk.bold.green('\n🎯 Tu código de vinculación es: '))
          console.log(chalk.bold.white.bgMagenta(` ${codeBot} `))
          console.log(chalk.bold.yellow('\n📋 Instrucciones:'))
          console.log(chalk.bold.white('   1️⃣  Abre WhatsApp en tu teléfono'))
          console.log(chalk.bold.white('   2️⃣  Ve a Configuración > Dispositivos vinculados'))
          console.log(chalk.bold.white('   3️⃣  Toca "Vincular un dispositivo"'))
          console.log(chalk.bold.white('   4️⃣  Selecciona "Vincular con número de teléfono"'))
          console.log(chalk.bold.white(`   5️⃣  Ingresa el código: ${chalk.bold.magenta(codeBot)}`))
          console.log(chalk.bold.cyan('\n═══════════════════════════════════════════════════════════\n'))
        }, 3000)
      }
    }
  }
}

conn.isInit = false
conn.well = false

if (!opts['test']) {
  if (global.db)
    setInterval(async () => {
      if (global.db.data) await global.db.write()
      if (opts['autocleartmp'] && (global.support || {}).find)
        (tmp = [tmpdir(), 'tmp', `${jadi}`]),
          tmp.forEach((filename) =>
            cp.spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete'])
          )
    }, 30 * 1000)
}

async function connectionUpdate(update) {
  const { connection, lastDisconnect, isNewLogin, qr } = update
  global.stopped = connection
  if (isNewLogin) conn.isInit = true
  const code =
    lastDisconnect?.error?.output?.statusCode ||
    lastDisconnect?.error?.output?.payload?.statusCode
  if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
    await global.reloadHandler(true).catch(console.error)
    global.timestamp.connect = new Date()
  }
  if (global.db.data == null) loadDatabase()
  if (qr) {
    if (opcion == '1') {
      console.log(chalk.bold.cyan('\n═══════════════════════════════════════════════════════════'))
      console.log(chalk.bold.white('                   📱 CÓDIGO QR - WHATSAPP 📱'))
      console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════════'))
      console.log(chalk.bold.yellow('\n📸 ESCANEA EL CÓDIGO QR CON TU WHATSAPP'))
      console.log(chalk.bold.red('⏰ El código expira en 45 segundos'))
      console.log(chalk.bold.white('\n📋 Instrucciones:'))
      console.log(chalk.bold.white('   1️⃣  Abre WhatsApp en tu teléfono'))
      console.log(chalk.bold.white('   2️⃣  Ve a Configuración (⚙️) > Dispositivos vinculados'))
      console.log(chalk.bold.white('   3️⃣  Toca "Vincular un dispositivo" (+)'))
      console.log(chalk.bold.white('   4️⃣  Apunta la cámara hacia el código QR de abajo'))
      console.log(chalk.bold.cyan('\n═══════════════════════════════════════════════════════════\n'))
    }
  }
  if (connection == 'open') {
    console.log(chalk.bold.cyan('\n═══════════════════════════════════════════════════════════'))
    console.log(chalk.bold.white('                    🎉 CONEXIÓN EXITOSA 🎉'))
    console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════════'))
    console.log(chalk.bold.green('\n✅ ¡Asta Bot se ha conectado exitosamente a WhatsApp!'))
    console.log(chalk.bold.yellow('🚀 El bot está listo para recibir mensajes'))
    console.log(chalk.bold.blue('💡 Todos los sistemas están operativos'))
    console.log(chalk.bold.cyan('\n═══════════════════════════════════════════════════════════\n'))
  }
  let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
  if (connection === 'close') {
    if (reason === DisconnectReason.badSession) {
      console.log(chalk.bold.red('\n❌ SESIÓN CORRUPTA'))
      console.log(chalk.bold.yellow(`💡 Solución: Elimina la carpeta '${global.sessions}' y vuelve a vincular`))
    } else if (reason === DisconnectReason.connectionClosed) {
      console.log(chalk.bold.yellow('\n⚠️  CONEXIÓN CERRADA'))
      console.log(chalk.bold.blue('🔄 Reconectando automáticamente...'))
      await global.reloadHandler(true).catch(console.error)
    } else if (reason === DisconnectReason.connectionLost) {
      console.log(chalk.bold.red('\n📡 CONEXIÓN PERDIDA CON EL SERVIDOR'))
      console.log(chalk.bold.blue('🔄 Intentando reconectar...'))
      await global.reloadHandler(true).catch(console.error)
    } else if (reason === DisconnectReason.connectionReplaced) {
      console.log(chalk.bold.red('\n🔄 CONEXIÓN REEMPLAZADA'))
      console.log(chalk.bold.yellow('⚠️  Se detectó otra sesión activa. Cierra las otras sesiones primero.'))
    } else if (reason === DisconnectReason.loggedOut) {
      console.log(chalk.bold.red('\n🚪 SESIÓN CERRADA'))
      console.log(chalk.bold.yellow(`💡 Solución: Elimina la carpeta '${global.sessions}' y vuelve a vincular`))
      await global.reloadHandler(true).catch(console.error)
    } else if (reason === DisconnectReason.restartRequired) {
      console.log(chalk.bold.blue('\n🔄 REINICIO REQUERIDO'))
      console.log(chalk.bold.yellow('📡 Conectando al servidor...'))
      await global.reloadHandler(true).catch(console.error)
    } else if (reason === DisconnectReason.timedOut) {
      console.log(chalk.bold.yellow('\n⏱️  TIEMPO DE CONEXIÓN AGOTADO'))
      console.log(chalk.bold.blue('🔄 Reintentando conexión...'))
      await global.reloadHandler(true).catch(console.error)
    } else {
      console.log(chalk.bold.red('\n❓ DESCONEXIÓN DESCONOCIDA'))
      console.log(chalk.bold.white(`🔍 Razón: ${reason || 'No identificada'} | Estado: ${connection || 'Desconocido'}`))
    }
  }
}
process.on('uncaughtException', console.error)

let isInit = true
let handler = await import('./handler.js')
global.reloadHandler = async function (restatConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error)
    if (Object.keys(Handler || {}).length) handler = Handler
  } catch (e) {
    console.error(e

    const oldChats = global.conn.chats
    try {
      global.conn.ws.close()
    } catch {}
    conn.ev.removeAllListeners()
    global.conn = makeWASocket(connectionOptions, { chats: oldChats })
    isInit = true
  
  if (!isInit) {
    conn.ev.off('messages.upsert', conn.handler)
    conn.ev.off('connection.update', conn.connectionUpdate)
    conn.ev.off('creds.update', conn.credsUpdate)
  }
  conn.handler = handler.handler.bind(global.conn)
  conn.connectionUpdate = connectionUpdate.bind(global.conn)
  conn.credsUpdate = saveCreds.bind(global.conn, true)

  const currentDateTime = new Date()
  const messageDateTime = new Date(conn.ev)
  if (currentDateTime >= messageDateTime) {
    const chats = Object.entries(conn.chats)
      .filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats)
      .map((v) => v[0])
  } else {
    const chats = Object.entries(conn.chats)
      .filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats)
      .map((v) => v[0])
  }
  conn.ev.on('messages.upsert', conn.handler)
  conn.ev.on('connection.update', conn.connectionUpdate)
  conn.ev.on('creds.update', conn.credsUpdate)
  isInit = false
  return true
}

//Arranque nativo para subbots by - ReyEndymion >> https://github.com/ReyEndymion

global.rutaJadiBot = join(__dirname, './JadiBots')

if (global.yukiJadibts) {
  if (!existsSync(global.rutaJadiBot)) {
    mkdirSync(global.rutaJadiBot, { recursive: true })
    console.log(chalk.bold.cyan(`La carpeta: ${jadi} se creó correctamente.`))
  } else {
    console.log(chalk.bold.cyan(`La carpeta: ${jadi} ya está creada.`))
  }

  const readRutaJadiBot = readdirSync(rutaJadiBot)
  if (readRutaJadiBot.length > 0) {
    const creds = 'creds.json'
    for (const gjbts of readRutaJadiBot) {
      const botPath = join(rutaJadiBot, gjbts)
      const readBotPath = readdirSync(botPath)
      if (readBotPath.includes(creds)) {
        yukiJadiBot({ pathYukiJadiBot: botPath, m: null, conn, args: '', usedPrefix: '/', command: 'serbot' })
      }
    }
  }
}

const pluginFolder = global.__dirname(join(__dirname, './plugins/index'))
const pluginFilter = (filename) => /\.js$/.test(filename)
global.plugins = {}
async function filesInit() {
  for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const file = global.__filename(join(pluginFolder, filename))
      const module = await import(file)
      global.plugins[filename] = module.default || module
    } catch (e) {
      conn.logger.error(e)
      delete global.plugins[filename]
    }
  }
}
filesInit().then((_) => Object.keys(global.plugins)).catch(console.error)

global.reload = async (_ev, filename) => {
  if (pluginFilter(filename)) {
    const dir = global.__filename(join(pluginFolder, filename), true)
    if (filename in global.plugins) {
      if (existsSync(dir)) conn.logger.info(` updated plugin - '${filename}'`)
      else {
        conn.logger.warn(`deleted plugin - '${filename}'`)
        return delete global.plugins[filename]
      }
    } else conn.logger.info(`new plugin - '${filename}'`)
    const err = syntaxerror(readFileSync(dir), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true,
    })
    if (err) conn.logger.error(`syntax error while loading '${filename}'\n${format(err)}`)
    else {
      try {
        const module = await import(`${global.__filename(dir)}?update=${Date.now()}`)
        global.plugins[filename] = module.default || module
      } catch (e) {
        conn.logger.error(`error require plugin '${filename}\n${format(e)}'`)
      } finally {
        global.plugins = Object.fromEntries(
          Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b))
        )
      }
    }
  }
}
Object.freeze(global.reload)
watch(pluginFolder, global.reload)
await global.reloadHandler()

async function _quickTest() {
  const test = await Promise.all(
    [
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
        }),
      ])
    })
  )
  const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test
  const s = (global.support = { ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find })
  Object.freeze(global.support)
}

function clearTmp() {
  const tmpDir = join(__dirname, 'tmp')
  const filenames = readdirSync(tmpDir)
  filenames.forEach((file) => {
    const filePath = join(tmpDir, file)
    unlinkSync(filePath)
  })
}

function purgeSession() {
  let prekey = []
  let directorio = readdirSync(`./${sessions}`)
  let filesFolderPreKeys = directorio.filter((file) => {
    return file.startsWith('pre-key-')
  })
  prekey = [...prekey, ...filesFolderPreKeys]
  filesFolderPreKeys.forEach((files) => {
    unlinkSync(`./${sessions}/${files}`)
  })
}

function purgeSessionSB() {
  try {
    const listaDirectorios = readdirSync(`./${jadi}/`)
    let SBprekey = []
    listaDirectorios.forEach((directorio) => {
      if (statSync(`./${jadi}/${directorio}`).isDirectory()) {
        const DSBPreKeys = readdirSync(`./${jadi}/${directorio}`).filter((fileInDir) => {
          return fileInDir.startsWith('pre-key-')
        })
        SBprekey = [...SBprekey, ...DSBPreKeys]
        DSBPreKeys.forEach((fileInDir) => {
          if (fileInDir !== 'creds.json') {
            unlinkSync(`./${jadi}/${directorio}/${fileInDir}`)
          }
        })
      }
    })
    if (SBprekey.length === 0) {
      console.log(
        chalk.bold.green(
          `\n╭» ❍ ${jadi} ❍\n│→ 🧹 No hay archivos temporales que eliminar.\n╰───────────────────────────────────────────────♻️`
        )
      )
    } else {
      console.log(
        chalk.bold.cyanBright(
          `\n╭» ❍ ${jadi} ❍\n│→ 🧹 Archivos temporales innecesarios eliminados correctamente.\n╰───────────────────────────────────────────────♻️`
        )
      )
    }
  } catch (err) {
    console.log(
      chalk.bold.red(
        `\n╭» ❍ ${jadi} ❍\n│→ ⚠️ Ocurrió un error al limpiar archivos temporales.\n╰───────────────────────────────────────────────🛑\n` +
          err
      )
    )
  }
}

function purgeOldFiles() {
  const directories = [`./${sessions}/`, `./${jadi}/`]
  directories.forEach((dir) => {
    readdirSync(dir, (err, files) => {
      if (err) throw err
      files.forEach((file) => {
        if (file !== 'creds.json') {
          const filePath = path.join(dir, file)
          unlinkSync(filePath, (err) => {
            if (err) {
              console.log(
                chalk.bold.red(
                  `\n╭» ❍ ARCHIVO ❍\n│→ ❌ No se pudo eliminar el archivo: ${file}\n╰──────────────────────────────🛑\n` +
                    err
                )
              )
            } else {
              console.log(
                chalk.bold.green(
                  `\n╭» ❍ ARCHIVO ❍\n│→ 🗑️ Archivo eliminado exitosamente: ${file}\n╰──────────────────────────────♻️`
                )
              )
            }
          })
        }
      })
    })
  })
}

function redefineConsoleMethod(methodName, filterStrings) {
  const originalConsoleMethod = console[methodName]
  console[methodName] = function () {
    const message = arguments[0]
    if (
      typeof message === 'string' &&
      filterStrings.some((filterString) => message.includes(atob(filterString)))
    ) {
      arguments[0] = ''
    }
    originalConsoleMethod.apply(console, arguments)
  }
}

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn.user) return
  await clearTmp()
  console.log(
    chalk.bold.cyanBright(
      `\n╭» ❍ MULTIMEDIA ❍\n│→ 🧹 Archivos temporales de la carpeta TMP eliminados correctamente.\n╰───────────────────────────────────────────────♻️`
    )
  )
}, 1000 * 60 * 4) // 4 min

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn.user) return
  await purgeSession()
  console.log(
    chalk.bold.cyanBright(
      `\n╭» ❍ ${global.sessions} ❍\n│→ 🗑️ Sesiones no esenciales eliminadas.\n╰───────────────────────────────────────────────♻️`
    )
  )
}, 1000 * 60 * 10) // 10 min

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn.user) return
  await purgeSessionSB()
}, 1000 * 60 * 10)

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn.user) return
  await purgeOldFiles()
  console.log(
    chalk.bold.cyanBright(
      `\n╭» ❍ ARCHIVOS ❍\n│→ 🧹 Archivos residuales eliminados correctamente.\n╰───────────────────────────────────────────────♻️`
    )
  )
}, 1000 * 60 * 10)

_quickTest()
  .then(() => conn.logger.info(chalk.bold(`✦  H E C H O\n`.trim())))
  .catch(console.error)

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
  } catch (error) {
    return false
  }
}

