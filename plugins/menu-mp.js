import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix }) => {
  try {
    const totalUsers = Object.keys(global.db?.data?.users || {}).length || 0
    const totalCommands = Object.values(global.plugins || {}).filter(v => v.help && v.tags).length || 0
    const isSubBot = conn.user?.jid !== global.conn?.user?.jid
    const botConfig = conn.subConfig || {}

    const botName = botConfig.name || (isSubBot ? `SubBot ${conn.user.jid.split('@')[0].slice(-4)}` : global.botname || 'ᴀsᴛᴀ-ʙᴏᴛ')
    const botPrefix = botConfig.prefix || (typeof global.prefix === 'string' ? global.prefix : '#')
    const botMode = isSubBot ? (botConfig.mode || 'public') : 'private'
    const version = global.vs || '1.5'

    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)

    // ========== OBTENER IMAGEN ==========
    let imageBuffer = null
    let imageUrl = null

    // 1. Intentar usar logo del SubBot (archivo local)
    if (isSubBot && botConfig.logo) {
      try {
        const logoPath = path.resolve(botConfig.logo)
        if (fs.existsSync(logoPath)) {
          imageBuffer = fs.readFileSync(logoPath)
        }
      } catch (e) {
        console.log('Error leyendo logo local:', e.message)
      }
    }

    // 2. Intentar usar logo URL del SubBot
    if (!imageBuffer && isSubBot && botConfig.logoUrl) {
      imageUrl = botConfig.logoUrl
    }

    // 3. Usar logo global (icono)
    if (!imageBuffer && !imageUrl && global.icono) {
      imageUrl = global.icono
    }

    // 4. Fallback a URL por defecto
    if (!imageBuffer && !imageUrl) {
      imageUrl = 'https://raw.githubusercontent.com/Fer280809/Asta_bot/main/lib/catalogo.jpg'
    }

    const infoText = `> . ﹡ ﹟ 🎭 ׄ ⬭ *¡ʜᴏʟᴀ!* @${m.sender.split('@')[0]}

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜⚡* ㅤ֢ㅤ⸱ㅤᯭִ*
ㅤ𓏸𓈒ㅤׄ *sᴏʏ* :: *${botName.toUpperCase()}*
ׅㅤ𓏸𓈒ㅤׄ *ᴛʏᴘᴇ* :: ${isSubBot ? '𝗦𝘂𝗯-𝗕𝗼𝘁 🅑' : '𝗣𝗿𝗶𝗻𝗰𝗶𝗽𝗮𝗹 🅥'}
ׅㅤ𓏸𓈒ㅤׄ *ᴅᴇᴠᴇʟᴏᴘᴇʀ* :: ${global.etiqueta || '𝕱𝖊𝖗𝖓𝖆𝖓𝖉𝖔 👑'}
ׅㅤ𓏸𓈒ㅤׄ *ᴠᴇʀsɪᴏɴ* :: ${version}
ׅㅤ𓏸𓈒ㅤׄ *sᴇʀᴠɪᴅᴏʀ* :: México 🇲🇽 
ׅㅤ𓏸𓈒ㅤׄ *ᴜᴘᴛɪᴍᴇ* :: ${uptime}

> ## \`𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖢𝖨𝖮́𝖭 ⚔️\`

ׅㅤ𓏸𓈒ㅤׄ *ᴘʀᴇғɪᴊᴏ* :: ${botPrefix} 
ׅㅤ𓏸𓈒ㅤׄ *ᴄᴏᴍᴀɴᴅᴏs* :: ${totalCommands}   
ׅㅤ𓏸𓈒ㅤׄ *ᴍᴏᴅᴏ* :: ${botMode === 'private' ? '𝗣𝗿𝗶𝘃𝗮𝗱𝗼 🔐' : '𝗣𝘂́𝗯𝗹𝗶𝗰𝗼 🔓'}
ׅㅤ𓏸𓈒ㅤׄ *ᴜsᴜᴀʀɪᴏs* :: ${totalUsers.toLocaleString()}
ㅤ𓏸𓈒ㅤׄ *ᴘɪɴɢ* :: ${Date.now() - m.timestamp}ms
ׅㅤ𓏸𓈒ㅤׄ *ʟɪʙʀᴇʀɪᴀ* :: ${global.libreria || 'Baileys Multi Device'} 


📌 *sᴇʟᴇᴄᴄɪᴏɴᴀ ᴜɴᴀ ᴄᴀᴛᴇɢᴏʀɪ́ᴀ:*`

    const buttons = [
      { 
        buttonId: `${usedPrefix}menu-descargas`, 
        buttonText: { displayText: '📥 Descargas & Utils' }, 
        type: 1 
      },
      { 
        buttonId: `${usedPrefix}menu-juegos`, 
        buttonText: { displayText: '🎮 Economía & Gacha' }, 
        type: 1 
      },
      { 
        buttonId: `${usedPrefix}menu-grupos`, 
        buttonText: { displayText: '👥 Grupos & Perfil' }, 
        type: 1 
      },
      { 
        buttonId: `${usedPrefix}menu-extras`, 
        buttonText: { displayText: '🎌 Anime & Más' }, 
        type: 1 
      }
    ]

    const messageOptions = {
      caption: infoText,
      footer: `${botName} • v${version} • By ${global.etiqueta || 'ғᴇʀɴᴀɴᴅᴏ'}`,
      buttons: buttons,
      headerType: 4,
      mentions: [m.sender]
    }

    // Agregar imagen según el tipo disponible
    if (imageBuffer) {
      messageOptions.image = imageBuffer
    } else {
      messageOptions.image = { url: imageUrl }
    }

    await conn.sendMessage(m.chat, messageOptions, { quoted: m })

  } catch (error) {
    console.error('❌ Error menú principal:', error)
    await conn.reply(m.chat, `❌ Error al cargar el menú. Usa ${usedPrefix}menu2`, m)
  }
}

handler.help = ['mp']
handler.tags = ['main']
handler.command = ['mp', 'r']

export default handler



function clockString(ms) {
    let seconds = Math.floor((ms / 1000) % 60)
    let minutes = Math.floor((ms / (1000 * 60)) % 60)
    let hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
    return `${hours}h ${minutes}m ${seconds}s`
}