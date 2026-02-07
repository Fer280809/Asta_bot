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

    const text = `👥 *MENÚ DE GRUPOS, PERFIL Y SOCKETS*

┏━━━━━━━━━━━━━━┓
*🔌 SOCKETS*  
┗━━━━━━━━━━━━━━┛
╰┈➤ *#qr / #code* → Crear Sub-Bot
╰┈➤ *#bots / #botlist* → Bots activos
╰┈➤ *#status / #estado* → Estado del bot
╰┈➤ *#ping* → Velocidad
╰┈➤ *#join* + [link] → Unir a grupo
╰┈➤ *#leave* → Salir del grupo
╰┈➤ *#config* → Configurar bot

┏━━━━━━━━━━━━━━┓
*👤 PROFILES*  
┗━━━━━━━━━━━━━━┛
╰┈➤ *#profile* → Ver perfil
╰┈➤ *#level / #lvl* → Tu nivel
╰┈➤ *#leaderboard / #top* → Ranking
╰┈➤ *#marry* + [@usuario] → Casarse
╰┈➤ *#divorce* → Divorciarse
╰┈➤ *#setbirth* + [fecha] → Cumpleaños
╰┈➤ *#setgenre* + [Hombre/Mujer]
╰┈➤ *#setdescription* + [texto]
╰┈➤ *#setfavourite* + [personaje]
╰┈➤ *#prem / #vip* → Comprar premium

┏━━━━━━━━━━━━━━┓
*👥 GROUPS*  
┗━━━━━━━━━━━━━━┛
╰┈➤ *#tag / #hidetag* + [mensaje]
╰┈➤ *#antilink* + [on/off]
╰┈➤ *#welcome* + [on/off]
╰┈➤ *#detect* + [on/off]
╰┈➤ *#bot* + [on/off]
╰┈➤ *#economy* + [on/off]
╰┈➤ *#gacha* + [on/off]
╰┈➤ *#promote / #demote* + [@user]
╰┈➤ *#kick* + [@user]
╰┈➤ *#add* + [número]
╰┈➤ *#close / #open* → Grupo
╰┈➤ *#setwelcome / #setbye* + [texto]
╰┈➤ *#link* → Link del grupo
╰┈➤ *#warn / #unwarn* + [@user]
╰┈➤ *#advlist* → Lista de advertidos
╰┈➤ *#inactivos* → Ver inactivos
╰┈➤ *#gpname / #gpdesc* + [texto]
╰┈➤ *#gpbanner* + {imagen}
╰┈➤ *#infogrupo* → Info del grupo`

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
        buttonText: { displayText: '⬅️ Economía' }, 
        type: 1 
      },
      { 
        buttonId: `${usedPrefix}menu-extras`, 
        buttonText: { displayText: '➡️ Anime & Más' }, 
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

handler.help = ['menugrupos']
handler.tags = ['main']
handler.command = ['menu-grupos', 'menugp', 'grupos', 'menugrupo']

export default handler
