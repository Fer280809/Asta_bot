import ws from "ws"
import fs from "fs"
import path from "path"

const handler = async (m, { conn, command, usedPrefix, participants }) => {
  try {
    const mainBot = global.conn.user.jid
    const subBots = global.conns
      .filter(c => c?.user && c.ws?.socket?.readyState !== ws.CLOSED)
      .map(c => c.user.jid)
    
    const allBots = [mainBot, ...new Set(subBots)]
    
    const formatUptime = (ms) => {
      const days = Math.floor(ms / (1000 * 60 * 60 * 24))
      const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((ms % (1000 * 60)) / 1000)
      
      let result = ""
      if (days) result += `${days}d `
      if (hours) result += `${hours}h `
      if (minutes) result += `${minutes}m `
      if (seconds) result += `${seconds}s`
      return result || "0s"
    }
    
    const groupBots = allBots.filter(bot => 
      participants.some(p => p.id === bot)
    )
    
    let message = `*🤖 BOTS ACTIVOS*\n\n`
    message += `🌟 *Principal:* 1\n`
    message += `🌿 *SubBots:* ${allBots.length - 1}\n`
    message += `📍 *En este grupo:* ${groupBots.length}\n\n`
    
    if (groupBots.length > 0) {
      message += `*LISTA DE BOTS:*\n`
      for (const botJid of groupBots) {
        const isMain = botJid === mainBot
        const sock = isMain ? global.conn : global.conns.find(c => c.user.jid === botJid)
        
        let botName = sock?.user?.name || "Bot"
        let botPrefix = global.prefix
        let botMode = "Público"
        
        if (sock?.subConfig) {
          botName = sock.subConfig.name || botName
          botPrefix = sock.subConfig.prefix || botPrefix
          botMode = sock.subConfig.mode === 'private' ? 'Privado' : 'Público'
        }
        
        const uptime = sock?.uptime ? formatUptime(Date.now() - sock.uptime) : "Reciente"
        const type = isMain ? "🤖 Principal" : "💠 SubBot"
        
        message += `\n@${botJid.split('@')[0]}\n`
        message += `• *Nombre:* ${botName}\n`
        message += `• *Tipo:* ${type}\n`
        message += `• *Prefijo:* ${botPrefix}\n`
        message += `• *Modo:* ${botMode}\n`
        message += `• *Uptime:* ${uptime}\n`
      }
    } else {
      message += `ℹ️ No hay bots en este grupo.\n`
    }
    
    message += `\n─────────────────\n`
    message += `📌 *Comandos útiles:*\n`
    
    // Mostrar comandos según el bot que ejecuta
    if (conn.user.jid === mainBot) {
      message += `• ${usedPrefix}qr - Crear SubBot\n`
      message += `• ${usedPrefix}code - Crear SubBot con código\n`
    } else {
      message += `• ${usedPrefix}subcmd - Ver comandos disponibles\n`
      message += `• ${usedPrefix}subconfig - Configurar tu SubBot\n`
    }
    
    await conn.sendMessage(m.chat, {
      text: message,
      mentions: groupBots
    }, { quoted: m })
    
  } catch (error) {
    console.error(error)
    m.reply(`❌ Error: ${error.message}`)
  }
}

handler.tags = ["serbot"]
handler.help = ["botlist", "bots"]
handler.command = ["botlist", "listabots", "bots", "sockets", "socket"]
handler.group = true

export default handler