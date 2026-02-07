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

    const text = `🎌 *MENÚ EXTRAS: ANIME, NSFW Y OWNER*

┏━━━━━━━━━━━━━━┓
*🎌 ANIME REACTIONS*  
┗━━━━━━━━━━━━━━┛
╰┈➤ *#hug / #abrazar* + [@user]
╰┈➤ *#kiss / #muak* + [@user]
╰┈➤ *#slap / #bofetada* + [@user]
╰┈➤ *#pat* + [@user]
╰┈➤ *#poke / #picar* + [@user]
╰┈➤ *#cuddle* + [@user]
╰┈➤ *#cry / #llorar* + [@user]
╰┈➤ *#blush / #sonrojarse*
╰┈➤ *#happy / #feliz*
╰┈➤ *#dance / #bailar*
╰┈➤ *#kill / #matar* + [@user]
╰┈➤ *#waifu* → Waifu aleatoria
╰┈➤ *#ppcouple / #ppcp* → Parejas
╰┈➤ *#coffee / #cafe*
╰┈➤ *#smoke / #fumar*
╰┈➤ *#smug / #presumir*
╰┈➤ *#bully / #bullying* + [@user]
╰┈➤ *#handhold* + [@user]
╰┈➤ *#highfive* + [@user]
╰┈➤ *#wave / #hola*
╰┈➤ *#cringe / #avergonzarse*

┏━━━━━━━━━━━━━━┓
*🔞 NSFW* (Activar con #nsfw on)
┗━━━━━━━━━━━━━━┛
╰┈➤ *#menu+ / #menu18* → Menú +18 completo
╰┈➤ *#rule34 / #r34* + [tags]
╰┈➤ *#danbooru* + [tags]
╰┈➤ *#gelbooru* + [tags]

┏━━━━━━━━━━━━━━┓
*👑 OWNER ONLY*
┗━━━━━━━━━━━━━━┛
╰┈➤ *#menuowner / #dev2* → Menú completo owner
╰┈➤ *#broadcast / #bc* + [texto]
╰┈➤ *#restart / #reiniciar*
╰┈➤ *#addcoins / #addprem*
╰┈➤ *#banned / #unban* + [@user]
╰┈➤ *#join* + [link]
╰┈➤ *#leavegc* + [link]
╰┈➤ *#backup* → Copia de seguridad`

    const buttons = [
      { 
        buttonId: `${usedPrefix}menu`, 
        buttonText: { displayText: '⬅️ Menú Principal' }, 
        type: 1 
      },
      { 
        buttonId: `${usedPrefix}menu-grupos`, 
        buttonText: { displayText: '⬅️ Grupos' }, 
        type: 1 
      },
      { 
        buttonId: `${usedPrefix}menu+`, 
        buttonText: { displayText: '🔞 Menú +18' }, 
        type: 1 
      },
      { 
        buttonId: `${usedPrefix}serbot`, 
        buttonText: { displayText: '🤖 Crear Sub-Bot' }, 
        type: 1 
      }
    ]

    const messageOptions = {
      caption: text,
      footer: `Usa ${botPrefix}menu para volver • ${botPrefix}menuowner para owner`,
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

handler.help = ['menuextras']
handler.tags = ['main']
handler.command = ['menu-extras', 'menuextra', 'extras']

export default handler
        
