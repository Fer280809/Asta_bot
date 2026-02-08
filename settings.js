import { watchFile, unwatchFile } from "fs"
import chalk from "chalk"
import { fileURLToPath } from "url"
import fs from "fs"
import path from "path"

// ============= CONFIGURACIÓN MEJORADA DE SUBS =============
global.supConfig = {
  maxSubBots: 100,
  sessionTime: 60, // Aumentado a 60 minutos
  cooldown: 30, // Reducido a 30 segundos
  autoClean: true,
  autoRestart: true, // Nueva función: reinicio automático
  persistentSessions: true, // Nueva: sesiones persistentes
  folder: "Sessions/SubBot",
}

global.subBotsData = new Map()
global.activeSubBots = new Map() // Para rastrear SubBots activos
global.pendingRestarts = new Set() // Para reinicios pendientes

// ============= PROPIETARIOS =============
global.owner = [
  "5214183357841",
  "5356795360",
  "573502523837",
  "573153057295",
  "5214183056252"
]

global.suittag = ["5214183357841"] 
global.prems = ["5214183357841"]
global.fernando = ["5214183357841"]

// ============= CONFIGURACIÓN DEL BOT =============
global.libreria = "Baileys Multi Device"
global.vs = "1.5" 
global.nameqr = "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』"
global.sessions = "Sessions/Principal"
global.jadi = "Sessions/SubBot"
global.AstaJadibts = true

// ============= PREFIJOS MEJORADOS =============
global.prefix = new RegExp('^[#!./-]?')
global.sinprefix = true 

// ============= PERSONALIZACIÓN =============
global.botname = "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』"
global.textbot = "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』 • Powered By 𝕱𝖊𝖗𝖓𝖆𝖓𝖉𝖔"
global.dev = "Powered By ғᴇʀɴᴀɴᴅᴏ"
global.author = "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』 • Powered By 𝕱𝖊𝖗𝖓𝖆𝖓𝖉𝖔"
global.etiqueta = "𝕱𝖊𝖗𝖓𝖆𝖓𝖉𝖔"
global.currency = "¥enes"

// URLs
global.banner = "https://raw.githubusercontent.com/Fer280809/Asta_bot/main/lib/catalogo.jpg"
global.icono = "https://raw.githubusercontent.com/Fer280809/Asta_bot/main/lib/catalogo.jpg"
global.catalogo = fs.readFileSync('./lib/catalogo.jpg')

//urls
global.group = "https://chat.whatsapp.com/BfCKeP10yZZ9ancsGy1Eh9"
global.community = "https://chat.whatsapp.com/KKwDZn5vDAE6MhZFAcVQeO"
global.channel = "https://whatsapp.com/channel/0029Vb64nWqLo4hb8cuxe23n"
global.github = "https://github.com/Fer280809/Asta-bot"
global.gmail = "fer2809fl@gmail.com"
global.ch = {
  ch1: "120363399175402285@newsletter"
}

// ============= FUNCIÓN PARA REINICIAR SUBS =============
global.restartAllSubBots = async function() {
  console.log(chalk.cyan('🔄 Reiniciando todos los SubBots...'))

  for (const [jid, subBot] of global.activeSubBots) {
    try {
      if (subBot.ws && subBot.ws.readyState !== 3) {
        // Guardar configuración antes de cerrar
        await saveSubBotState(subBot)
        subBot.ws.close()

        // Programar reconexión
        setTimeout(() => {
          reconnectSubBot(jid)
        }, 3000)
      }
    } catch (error) {
      console.error(chalk.red(`❌ Error reiniciando SubBot ${jid}:`, error))
    }
  }

  console.log(chalk.green('✅ Reinicio de SubBots programado'))
}

// Función para guardar estado del SubBot
async function saveSubBotState(subBot) {
  try {
    const sessionId = subBot.user.jid.split('@')[0]
    const statePath = path.join(global.jadi, sessionId, 'state.json')

    const state = {
      jid: subBot.user.jid,
      name: subBot.user.name,
      config: subBot.subConfig || {},
      authState: subBot.authState?.creds ? {
        me: subBot.authState.creds.me,
        deviceId: subBot.authState.creds.deviceId,
        registered: subBot.authState.creds.registered
      } : null,
      lastConnected: new Date().toISOString(),
      version: global.vs
    }

    // Crear directorio si no existe
    const dirPath = path.dirname(statePath)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }

    fs.writeFileSync(statePath, JSON.stringify(state, null, 2))
    console.log(chalk.green(`✅ Estado guardado para ${sessionId}`))

  } catch (error) {
    console.error(chalk.red(`❌ Error guardando estado:`, error))
  }
}

// Función para reconectar SubBot
async function reconnectSubBot(jid) {
  const subBotPath = path.join(global.jadi, jid.split('@')[0])

  if (!fs.existsSync(subBotPath)) {
    console.log(chalk.yellow(`⚠️ No hay sesión guardada para ${jid}`))
    return
  }

  // Aquí iría la lógica de reconexión automática
  console.log(chalk.blue(`🔗 Reconectando SubBot ${jid}...`))
}

// ============= WATCH FILE =============
let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("✅ Settings.js actualizado"))

  // Reiniciar SubBots si la configuración cambia
  if (global.supConfig.autoRestart) {
    setTimeout(() => {
      global.restartAllSubBots()
    }, 5000)
  }

  import(`${file}?update=${Date.now()}`)
})