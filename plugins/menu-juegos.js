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

    const text = `🎮 *MENÚ DE ECONOMÍA Y GACHA*

┏━━━━━━━━━━━━━━┓
*💰 ECONOMY*  
┗━━━━━━━━━━━━━━┛
╰┈➤ *#work / #w* → Trabajar
╰┈➤ *#slut* → Ganar coins rápido
╰┈➤ *#crime* → Cometer crimen
╰┈➤ *#coinflip / #cf* + [cantidad] [cara/cruz]
╰┈➤ *#roulette / #rt* + [red/black] [cantidad]
╰┈➤ *#casino / #slot* + [cantidad]
╰┈➤ *#balance / #bal* → Ver tu dinero
╰┈➤ *#deposit / #dep* + [cantidad]
╰┈➤ *#withdraw / #with* + [cantidad]
╰┈➤ *#daily / #diario* → Recompensa diaria
╰┈➤ *#weekly / #semanal* → Recompensa semanal
╰┈➤ *#rob / #steal* + [@usuario]
╰┈➤ *#adventure / #aventura* → Aventuras
╰┈➤ *#hunt / #cazar* → Cazar animales
╰┈➤ *#fish / #pescar* → Pescar
╰┈➤ *#dungeon / #mazmorra* → Explorar
╰┈➤ *#tienda / #shop* → Tienda de items

┏━━━━━━━━━━━━━━┓
*🎴 GACHA*  
┗━━━━━━━━━━━━━━┛
╰┈➤ *#rollwaifu / #rw / #roll* → Personaje aleatorio
╰┈➤ *#claim / #c* + {citar personaje}
╰┈➤ *#harem / #waifus* → Ver colección
╰┈➤ *#charinfo* + [nombre] → Info personaje
╰┈➤ *#givechar* + [@usuario] [nombre]
╰┈➤ *#sell* + [precio] [nombre]
╰┈➤ *#buychar* + [nombre]
╰┈➤ *#trade* + [tu personaje] / [otro]
╰┈➤ *#robwaifu* + [@usuario]
╰┈➤ *#vote* + [nombre] → Votar personaje
╰┈➤ *#waifustop / #wtop* → Top personajes
╰┈➤ *#favtop* → Favoritos top
╰┈➤ *#serieinfo* + [nombre] → Info anime
╰┈➤ *#animelist* → Lista de series`

    const buttons = [
      { 
        buttonId: `${usedPrefix}menu`, 
        buttonText: { displayText: '⬅️ Menú Principal' }, 
        type: 1 
      },
      { 
        buttonId: `${usedPrefix}menu-descargas`, 
        buttonText: { displayText: '⬅️ Descargas' }, 
        type: 1 
      },
      { 
        buttonId: `${usedPrefix}menu-grupos`, 
        buttonText: { displayText: '➡️ Grupos & Perfil' }, 
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

handler.help = ['menujuegos']
handler.tags = ['main']
handler.command = ['menu-juegos', 'menueco', 'juegos', 'economia']

export default handler
    
