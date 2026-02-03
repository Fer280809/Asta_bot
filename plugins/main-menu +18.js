let handler = async (m, { conn, usedPrefix }) => {
  try {
    const totalUsers = Object.keys(global.db.data.users || {}).length || 0
    const totalCommands = Object.values(global.plugins || {}).filter(v => v.help && v.tags).length || 0
    const isSubBot = conn.user.jid !== global.conn.user.jid
    const botConfig = conn.subConfig || {}

    const botName = botConfig.name || 
                   (isSubBot ? `SubBot ${conn.user.jid.split('@')[0].slice(-4)}` : 
                   global.botname || 'ᴀsᴛᴀ-ʙᴏᴛ')

    const botPrefix = typeof global.prefix === 'string' ? global.prefix : 
                     (botConfig.prefix || '#')

    const botMode = isSubBot ? (botConfig.mode || 'public') : 'private'

    const version = botConfig.version || global.vs || '1.5'
    const libreria = global.libreria || 'Baileys Multi Device'
    const creadorNombre = botConfig.creador || global.etiqueta || '𝕱𝖊𝖗𝖓𝖆𝖓𝖉𝖔 '
    const creadorNumero = botConfig.creadorNumero || global.creador || ''
    const moneda = botConfig.currency || global.currency || '¥enes'
    
    let botIcon
    if (isSubBot && botConfig.logoUrl) {
      botIcon = { url: botConfig.logoUrl }
    } 
    else if (isSubBot && botConfig.logo) {
      try {
        const fs = await import('fs')
        if (fs.existsSync(botConfig.logo)) {
          botIcon = fs.readFileSync(botConfig.logo)
        }
      } catch (e) {
        console.error('Error leyendo logo local:', e)
      }
    }
    else if (global.icono) {
      botIcon = { url: global.icono }
    }
    else {
      botIcon = { url: 'https://raw.githubusercontent.com/Fer280809/Asta_bot/main/lib/catalogo.jpg' }
    }

    const infoText = `
╭━━━━━━━━━━━━━━━━━━╮
│  🎭 *${botName.toUpperCase()}* ⚡
╰━━━━━━━━━━━━━━━━━━╯

👋 ¡Hola @${m.sender.split('@')[0]}!

╭─═⊰ 📡 *ESTADO ACTIVO*
│ 🤖 *Tipo:* ${isSubBot ? '🔗 SUB-BOT' : '🟢 BOT PRINCIPAL'}
│ ⚙️ *Prefijo:* ${botPrefix}
│ 🔧 *Modo:* ${botMode === 'private' ? '🔐 PRIVADO' : '🔓 PÚBLICO'}
│ 👥 *Usuarios:* ${totalUsers.toLocaleString()}
│ 🛠️ *Comandos:* ${totalCommands}
│ 📚 *Librería:* ${libreria}
│ 🌍 *Servidor:* México 🇲🇽
│ ⚡ *Ping:* ✅Online
│ 🔄 *Versión:* ${version}
╰───────────────────



*🤖 PON #code O #qr PARA HACERTE SUBBOT DEL ASTA-BOT-MD 📡*



ᰔᩚ *#𝑎𝑛𝑎𝑙* + <𝑚𝑒𝑛𝑐𝑖𝑜𝑛>
> ✦ 𝐻𝑎𝑐𝑒𝑟 𝑢𝑛 𝑎𝑛𝑎𝑙
ᰔᩚ *#𝑤𝑎𝑖𝑓𝑢*
> ✦ 𝐵𝑢𝑠𝑐𝑎 𝑢𝑛𝑎 𝑤𝑎𝑖𝑓𝑢 𝑎𝑙𝑒𝑎𝑡𝑜𝑟𝑖𝑜.
ᰔᩚ *#𝑏𝑎𝑡ℎ* + <𝑚𝑒𝑛𝑐𝑖𝑜𝑛>
> ✦ 𝐵𝑎ñ𝑎𝑟𝑠𝑒
ᰔᩚ *#𝑏𝑙𝑜𝑤𝑗𝑜𝑏 • #𝑚𝑎𝑚𝑎𝑑𝑎 • #𝑏𝑗* + <𝑚𝑒𝑛𝑐𝑖𝑜𝑛>
> ✦ 𝐷𝑎𝑟 𝑢𝑛𝑎 𝑚𝑎𝑚𝑎𝑑𝑎
ᰔᩚ *#𝑏𝑜𝑜𝑏𝑗𝑜𝑏* + <𝑚𝑒𝑛𝑐𝑖𝑜𝑛>
> ✦ 𝐻𝑎𝑐𝑒𝑟 𝑢𝑛𝑎 𝑟𝑢𝑠𝑎
ᰔᩚ *#𝑐𝑢𝑚* + <𝑚𝑒𝑛𝑐𝑖𝑜𝑛>
> ✦ 𝑉𝑒𝑛𝑖𝑟𝑠𝑒 𝑒𝑛 𝑎𝑙𝑔𝑢𝑖𝑒𝑛.
ᰔᩚ *#𝑓𝑎𝑝* + <𝑚𝑒𝑛𝑐𝑖𝑜𝑛>
> ✦ 𝐻𝑎𝑐𝑒𝑟𝑠𝑒 𝑢𝑛𝑎 𝑝𝑎𝑗𝑎
ᰔᩚ *#𝑝𝑝𝑐𝑜𝑢𝑝𝑙𝑒 • #𝑝𝑝𝑐𝑝*
> ✦ 𝐺𝑒𝑛𝑒𝑟𝑎 𝑖𝑚𝑎𝑔𝑒𝑛𝑒𝑠 𝑝𝑎𝑟𝑎 𝑎𝑚𝑖𝑠𝑡𝑎𝑑𝑒𝑠 𝑜 𝑝𝑎𝑟𝑒𝑗𝑎𝑠.
ᰔᩚ *#𝑓𝑜𝑜𝑡𝑗𝑜𝑏* + <𝑚𝑒𝑛𝑐𝑖𝑜𝑛>
> ✦ 𝐻𝑎𝑐𝑒𝑟 𝑢𝑛𝑎 𝑝𝑎𝑗𝑎 𝑐𝑜𝑛 𝑙𝑜𝑠 𝑝𝑖𝑒𝑠
ᰔᩚ *#𝑓𝑢𝑐𝑘 • #𝑐𝑜𝑔𝑒𝑟 • #𝑓𝑢𝑐𝑘2* + <𝑚𝑒𝑛𝑐𝑖𝑜𝑛>
> ✦ 𝐹𝑜𝑙𝑙𝑎𝑟𝑡𝑒 𝑎 𝑎𝑙𝑔𝑢𝑖𝑒𝑛
ᰔᩚ *#𝑐𝑎𝑓𝑒 • #𝑐𝑜𝑓𝑓𝑒*
> ✦ 𝑇𝑜𝑚𝑎𝑡𝑒 𝑢𝑛 𝑐𝑎𝑓𝑒𝑐𝑖𝑡𝑜 𝑐𝑜𝑛 𝑎𝑙𝑔𝑢𝑖𝑒𝑛
ᰔᩚ *#𝑣𝑖𝑜𝑙𝑎𝑟 • #𝑝𝑒𝑟𝑟𝑎 + <𝑚𝑒𝑛𝑐𝑖𝑜𝑛>
> ✦ 𝑉𝑖𝑜𝑙𝑎 𝑎 𝑎𝑙𝑔𝑢𝑖𝑒𝑛
ᰔᩚ *#𝑔𝑟𝑎𝑏𝑏𝑜𝑜𝑏𝑠* + <𝑚𝑒𝑛𝑐𝑖𝑜𝑛>
> ✦ 𝐴𝑔𝑎𝑟𝑟𝑟𝑎𝑟 𝑡𝑒𝑡𝑎𝑠
ᰔᩚ *#𝑔𝑟𝑜𝑝* + <𝑚𝑒𝑛𝑐𝑖𝑜𝑛>
> ✦ 𝑀𝑎𝑛𝑜𝑠𝑒𝑎𝑟 𝑎 𝑎𝑙𝑔𝑢𝑖𝑒𝑛
ᰔᩚ *#𝑙𝑖𝑐𝑘𝑝𝑢𝑠𝑠𝑦* + <𝑚𝑒𝑛𝑐𝑖𝑜𝑛>
> ✦ 𝐿𝑎𝑚𝑒𝑟 𝑢𝑛 𝑐𝑜ñ𝑜
ᰔᩚ *#𝑟𝑢𝑙𝑒34 • #𝑟34* + [𝑇𝑎𝑔𝑠]
> ✦ 𝐵𝑢𝑠𝑐𝑎𝑟 𝑖𝑚𝑎𝑔𝑒𝑛𝑒𝑠 𝑒𝑛 𝑅𝑢𝑙𝑒34
ᰔᩚ *#𝑠𝑖𝑥𝑛𝑖𝑛𝑒 • #69* + <𝑚𝑒𝑛𝑐𝑖𝑜𝑛>
> ✦ 𝐻𝑎𝑧 𝑢𝑛 69 𝑐𝑜𝑛 𝑎𝑙𝑔𝑢𝑖𝑒𝑛
ᰔᩚ *#𝑠𝑝𝑎𝑛𝑘 • #𝑛𝑎𝑙𝑔𝑎𝑑𝑎* + <𝑚𝑒𝑛𝑐𝑖𝑜𝑛>
> ✦ 𝐷𝑎𝑟 𝑢𝑛𝑎 𝑛𝑎𝑙𝑔𝑎𝑑𝑎
ᰔᩚ *#𝑠𝑢𝑐𝑘𝑏𝑜𝑜𝑏𝑠* + <𝑚𝑒𝑛𝑐𝑖𝑜𝑛>
> ✦ 𝐶ℎ𝑢𝑝𝑎𝑟 𝑡𝑒𝑡𝑎𝑠
ᰔᩚ *#𝑢𝑛𝑑𝑟𝑒𝑠𝑠 • #𝑒𝑛𝑐𝑢𝑒𝑟𝑎𝑟* + <𝑚𝑒𝑛𝑐𝑖𝑜𝑛>
> ✦ 𝐷𝑒𝑠𝑛𝑢𝑑𝑎𝑟 𝑎 𝑎𝑙𝑔𝑢𝑖𝑒𝑛
ᰔᩚ *#𝑦𝑢𝑟𝑖 • #𝑡𝑖𝑗𝑒𝑟𝑎𝑠* + <𝑚𝑒𝑛𝑐𝑖𝑜𝑛>
> ✦ 𝐻𝑎𝑐𝑒𝑟 𝑡𝑖𝑗𝑒𝑟𝑎𝑠. `

    const buttons = [
      { 
        buttonId: `${botPrefix}menu2`, 
        buttonText: { displayText: '📜 MENÚ PRINCIPAL' }, 
        type: 1 
      }
    ]

    const messageOptions = {
      caption: infoText,
      footer: `${botName} • v${version}`,
      buttons: buttons,
      headerType: 4,
      mentions: [m.sender]
    }

    if (Buffer.isBuffer(botIcon)) {
      messageOptions.image = botIcon
    } else {
      messageOptions.image = botIcon
    }

    await conn.sendMessage(m.chat, messageOptions, { quoted: m })

  } catch (error) {
    console.error('❌ Error en el menú:', error)

    const fallbackText = `🎭 *${global.botname || 'ASTA-BOT'}*\n\n` +
      `¡Hola! Soy ${global.botname || 'Asta Bot'}.\n` +
      `🚀 Usa ${typeof global.prefix === 'string' ? global.prefix : '#'}menu2 para ver el menú completo\n` +
      `🤖 Usa ${typeof global.prefix === 'string' ? global.prefix : '#'}serbot para crear un Sub-Bot\n\n` +
      `👑 Creador: ${global.etiqueta || 'ғᴇʀɴᴀɴᴅᴏ'}\n` +
      `🔧 Versión: ${global.vs || '1.3'}`

    await conn.sendMessage(m.chat, { 
      text: fallbackText,
      mentions: [m.sender]
    }, { quoted: m })
  }
}

handler.help = ['menu+', 'menú+', 'help+', 'menu18']
handler.tags = ['main']
handler.command = ['menu+', 'menú+', 'help+', 'menu18']

export default handler

