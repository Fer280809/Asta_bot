import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix }) => {
  try {
    const isSubBot = conn.user?.jid !== global.conn?.user?.jid
    const botConfig = conn.subConfig || {}
    const botPrefix = botConfig.prefix || (typeof global.prefix === 'string' ? global.prefix : '#')

    // Verificar si NSFW está activado en el grupo
    const chat = global.db?.data?.chats?.[m.chat]
    if (m.isGroup && chat && !chat.nsfw && !m.isOwner) {
      return conn.reply(m.chat, `⚠️ Los comandos NSFW están desactivados en este grupo.\n\n> Un administrador debe usar:\n> *${botPrefix}nsfw on*`, m)
    }

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

    const text = `🔞 *MENÚ +18 - COMANDOS NSFW*

⚠️ *ADVERTENCIA:* Estos comandos son solo para mayores de edad.

┏━━━━━━━━━━━━━━┓
*🔞 COMANDOS +18*  
┗━━━━━━━━━━━━━━┛

╰┈➤ *#anal* + [@mención]
╰┈➤ *#waifu* → Waifu aleatoria
╰┈➤ *#bath* + [@mención]
╰┈➤ *#blowjob / #mamada / #bj* + [@mención]
╰┈➤ *#boobjob* + [@mención]
╰┈➤ *#cum* + [@mención]
╰┈➤ *#fap* + [@mención]
╰┈➤ *#ppcouple / #ppcp* → Imágenes parejas
╰┈➤ *#footjob* + [@mención]
╰┈➤ *#fuck / #coger* + [@mención]
╰┈➤ *#coffee / #cafe*
╰┈➤ *#violar / #perra* + [@mención]
╰┈➤ *#grabbobs* + [@mención]
╰┈➤ *#grop* + [@mención]
╰┈➤ *#lickpussy* + [@mención]
╰┈➤ *#rule34 / #r34* + [tags]
╰┈➤ *#sixnine / #69* + [@mención]
╰┈➤ *#spank / #nalgada* + [@mención]
╰┈➤ *#suckboobs* + [@mención]
╰┈➤ *#undress / #encuerar* + [@mención]
╰┈➤ *#yuri / #tijeras* + [@mención]

┏━━━━━━━━━━━━━━┓
*🎥 DESCARGAS +18*
┗━━━━━━━━━━━━━━┛
╰┈➤ *#xvideos / #xvideosdl* + [Link]
╰┈➤ *#xnxx / #xnxxdl* + [Link]
╰┈➤ *#mamada* → Video aleatorio

┏━━━━━━━━━━━━━━┓
*🔍 BÚSQUEDA +18*
┗━━━━━━━━━━━━━━┛
╰┈➤ *#rule34 / #r34* + [tags]
╰┈➤ *#danbooru* + [tags]
╰┈➤ *#gelbooru* + [tags]

*Nota:* Algunos comandos requieren mencionar a un usuario.
Ejemplo: ${botPrefix}fuck @usuario`

    const buttons = [
      { 
        buttonId: `${usedPrefix}menu`, 
        buttonText: { displayText: '⬅️ Menú Principal' }, 
        type: 1 
      },
      { 
        buttonId: `${usedPrefix}menu-extras`, 
        buttonText: { displayText: '⬅️ Menú Extras' }, 
        type: 1 
      },
      { 
        buttonId: `${usedPrefix}nsfw off`, 
        buttonText: { displayText: '🔒 Desactivar NSFW' }, 
        type: 1 
      }
    ]

    const messageOptions = {
      caption: text,
      footer: `Usa ${botPrefix}menu para volver • Solo mayores de edad`,
      buttons: buttons,
      headerType: 4,
      mentions: [m.sender]
    }

    if (imageBuffer) messageOptions.image = imageBuffer
    else messageOptions.image = { url: imageUrl }

    await conn.sendMessage(m.chat, messageOptions, { quoted: m })

  } catch (error) {
    console.error('❌ Error menú 18:', error)
    await conn.reply(m.chat, '❌ Error al cargar el menú +18', m)
  }
}

handler.help = ['menu18', 'menu+', 'menunsfw']
handler.tags = ['nsfw', 'main']
handler.command = ['menu+', 'menú+', 'menu18', 'menunsfw']

export default handler
    
