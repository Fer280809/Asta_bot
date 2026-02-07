import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix }) => {
  try {
    const isSubBot = conn.user?.jid !== global.conn?.user?.jid
    const botConfig = conn.subConfig || {}
    const botPrefix = botConfig.prefix || (typeof global.prefix === 'string' ? global.prefix : '#')
    
    // ========== OBTENER IMAGEN ==========
    let imageBuffer = null
    let imageUrl = null

    if (isSubBot && botConfig.logo) {
      try {
        const logoPath = path.resolve(botConfig.logo)
        if (fs.existsSync(logoPath)) imageBuffer = fs.readFileSync(logoPath)
      } catch (e) {}
    }

    if (!imageBuffer && isSubBot && botConfig.logoUrl) imageUrl = botConfig.logoUrl
    if (!imageBuffer && !imageUrl && global.icono) imageUrl = global.icono
    if (!imageBuffer && !imageUrl) imageUrl = 'https://raw.githubusercontent.com/Fer280809/Asta_bot/main/lib/catalogo.jpg'

    const text = `📥 *MENÚ DE DESCARGAS Y UTILIDADES*

┏━━━━━━━━━━━━━━┓
*📥 DOWNLOAD*  
┗━━━━━━━━━━━━━━┛
╰┈➤ *#tiktok / #tt* + [Link]
╰┈➤ *#mediafire / #mf* + [Link]
╰┈➤ *#mega / #mg* + [Link]
╰┈➤ *#play / #ytmp3 / #ytmp4* + [Canción/Link]
╰┈➤ *#facebook / #fb* + [Link]
╰┈➤ *#twitter / #x* + [Link]
╰┈➤ *#instagram / #ig* + [Link]
╰┈➤ *#pinterest / #pin* + [Búsqueda]
╰┈➤ *#apk / #modapk* + [Nombre]
╰┈➤ *#xvideos / #xnxx* + [Link] 🔞

┏━━━━━━━━━━━━━━┓
*🛠️ UTILITIES*  
┗━━━━━━━━━━━━━━┛
╰┈➤ *#sticker / #s* + {imagen/video}
╰┈➤ *#toimg / #img* + {sticker}
╰┈➤ *#brat / #qc* + [texto]
╰┈➤ *#enhance / #hd* + {imagen}
╰┈➤ *#translate / #trad* + [texto]
╰┈➤ *#ia / #gemini* + [pregunta]
╰┈➤ *#dalle / #flux* + [prompt]
╰┈➤ *#tourl / #catbox* + {media}
╰┈➤ *#ssweb* + [URL]
╰┈➤ *#calcular* + [operación]`

    const buttons = [
      { 
        buttonId: `${usedPrefix}menu`, 
        buttonText: { displayText: '⬅️ Menú Principal' }, 
        type: 1 
      },
      { 
        buttonId: `${usedPrefix}serbot`, 
        buttonText: { displayText: '🤖 Crear Sub-Bot' }, 
        type: 1 
      },
      { 
        buttonId: `${usedPrefix}menu-juegos`, 
        buttonText: { displayText: '➡️ Economía & Gacha' }, 
        type: 1 
      }
    ]

    const messageOptions = {
      caption: text,
      footer: `Usa ${botPrefix}menu para volver`,
      buttons: buttons,
      headerType: 4,
      mentions: [m.sender]
    }

    if (imageBuffer) messageOptions.image = imageBuffer
    else messageOptions.image = { url: imageUrl }

    await conn.sendMessage(m.chat, messageOptions, { quoted: m })

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

handler.help = ['menudescargas']
handler.tags = ['main']
handler.command = ['menu-descargas', 'menudl', 'descargas']

export default handler
