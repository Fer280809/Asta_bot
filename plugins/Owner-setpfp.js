import Jimp from 'jimp'
import { promisify } from 'util'
import fs from 'fs'

const sleep = promisify(setTimeout)

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    // Verificar que haya una imagen
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (!mime.startsWith('image/')) {
      return m.reply(`⚠️ *Uso incorrecto*\n\n` +
        `Debes responder a una imagen o enviarla con el comando.\n\n` +
        `*Ejemplos:*\n` +
        `1. Responde a una imagen con:\n   ${usedPrefix}${command}\n\n` +
        `2. Con número de bot:\n   ${usedPrefix}${command} 5214181450063\n\n` +
        `3. Mencionando al bot:\n   ${usedPrefix}${command} @bot`)
    }
    
    await m.reply('⏳ Descargando y procesando imagen...')
    
    // Descargar la imagen
    let img = await q.download()
    
    if (!img) {
      return m.reply('❌ No se pudo descargar la imagen.')
    }
    
    // Determinar qué bot cambiar
    let targetBot = null
    let targetJid = null
    let botName = ''
    
    if (text) {
      // Verificar si es una mención
      if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetJid = m.mentionedJid[0]
      } else {
        // Limpiar el número
        let numero = text.replace(/[^0-9]/g, '')
        if (!numero) {
          return m.reply('❌ Número inválido.')
        }
        targetJid = numero + '@s.whatsapp.net'
      }
      
      // Buscar el bot en los subbots
      if (global.conns && global.conns.length > 0) {
        targetBot = global.conns.find(bot => bot.user && bot.user.jid === targetJid)
      }
      
      // Si no es un subbot, verificar si es el bot principal
      if (!targetBot && conn.user.jid === targetJid) {
        targetBot = conn
      }
      
      if (!targetBot) {
        return m.reply(`❌ No se encontró ningún bot con ese número.\n\nVerifica que:\n• El número sea correcto\n• El bot esté conectado`)
      }
      
      botName = targetBot.user?.name || targetJid.split('@')[0]
      
    } else {
      targetBot = conn
      targetJid = conn.user.jid
      botName = conn.user?.name || 'Bot Principal'
    }
    
    await m.reply(`🖼️ Ajustando imagen para *${botName}*...`)
    
    try {
      // PROCESAR LA IMAGEN CON MÚLTIPLES INTENTOS
      let processedImages = []
      
      // Leer imagen con Jimp
      const image = await Jimp.read(img)
      
      // OPCIÓN 1: 640x640 calidad alta
      const img1 = await image.clone()
        .cover(640, 640)
        .quality(100)
        .getBufferAsync(Jimp.MIME_JPEG)
      processedImages.push(img1)
      
      // OPCIÓN 2: 320x320 calidad media
      const img2 = await image.clone()
        .cover(320, 320)
        .quality(95)
        .getBufferAsync(Jimp.MIME_JPEG)
      processedImages.push(img2)
      
      // OPCIÓN 3: 96x96 calidad estándar
      const img3 = await image.clone()
        .cover(96, 96)
        .quality(90)
        .getBufferAsync(Jimp.MIME_JPEG)
      processedImages.push(img3)
      
      // OPCIÓN 4: Imagen original redimensionada
      const img4 = await image.clone()
        .resize(640, Jimp.AUTO)
        .quality(95)
        .getBufferAsync(Jimp.MIME_JPEG)
      processedImages.push(img4)
      
      await m.reply(`🔄 Aplicando foto de perfil...`)
      
      let success = false
      let lastError = null
      
      // INTENTAR CON CADA VERSIÓN DE LA IMAGEN
      for (let i = 0; i < processedImages.length; i++) {
        try {
          console.log(`Intentando con imagen versión ${i + 1}...`)
          
          await targetBot.updateProfilePicture(targetJid, processedImages[i])
          
          success = true
          console.log(`✓ Éxito con imagen versión ${i + 1}`)
          break
          
        } catch (err) {
          console.log(`✗ Falló versión ${i + 1}:`, err.message)
          lastError = err
          await sleep(1000) // Esperar 1 segundo entre intentos
          continue
        }
      }
      
      // Si no funcionó con las imágenes procesadas, intentar con la original
      if (!success) {
        try {
          console.log('Intentando con imagen original...')
          await targetBot.updateProfilePicture(targetJid, img)
          success = true
          console.log('✓ Éxito con imagen original')
        } catch (err) {
          console.log('✗ Falló imagen original:', err.message)
          lastError = err
        }
      }
      
      // MÉTODO ALTERNATIVO: Usar query directamente
      if (!success) {
        try {
          console.log('Intentando método alternativo con query...')
          
          const imgBuffer = processedImages[0]
          
          await targetBot.query({
            tag: 'iq',
            attrs: {
              to: targetJid,
              type: 'set',
              xmlns: 'w:profile:picture'
            },
            content: [
              {
                tag: 'picture',
                attrs: { type: 'image' },
                content: imgBuffer
              }
            ]
          })
          
          success = true
          console.log('✓ Éxito con método query')
          
        } catch (err) {
          console.log('✗ Falló método query:', err.message)
          lastError = err
        }
      }
      
      // ÚLTIMO INTENTO: Guardar temporal y usar ruta
      if (!success) {
        try {
          console.log('Intentando con archivo temporal...')
          
          const tempPath = `./${Date.now()}_temp.jpg`
          fs.writeFileSync(tempPath, processedImages[0])
          
          await targetBot.updateProfilePicture(targetJid, { url: tempPath })
          
          fs.unlinkSync(tempPath)
          success = true
          console.log('✓ Éxito con archivo temporal')
          
        } catch (err) {
          console.log('✗ Falló archivo temporal:', err.message)
          lastError = err
          
          // Limpiar archivo temporal si existe
          try {
            const tempPath = `./${Date.now()}_temp.jpg`
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath)
          } catch {}
        }
      }
      
      if (success) {
        await m.reply(`✅ *¡Foto de perfil actualizada exitosamente!*\n\n` +
          `🤖 Bot: *${botName}*\n` +
          `📱 Número: ${targetJid.split('@')[0]}\n\n` +
          `✨ La foto puede tardar unos minutos en sincronizarse con todos los contactos.`)
      } else {
        throw lastError || new Error('No se pudo actualizar la foto después de múltiples intentos')
      }
      
    } catch (error) {
      console.error('❌ Error final:', error)
      
      await m.reply(`❌ *No se pudo cambiar la foto de perfil*\n\n` +
        `🤖 Bot: *${botName}*\n` +
        `📱 Número: ${targetJid.split('@')[0]}\n\n` +
        `⚠️ Error: ${error.message}\n\n` +
        `*Intenta lo siguiente:*\n` +
        `1. Usa una imagen diferente\n` +
        `2. Asegúrate de que el bot esté bien conectado\n` +
        `3. Verifica que el número del bot sea correcto\n` +
        `4. Reinicia el bot y vuelve a intentar\n\n` +
        `Si el problema persiste, puede ser una limitación de WhatsApp.`)
    }
    
  } catch (err) {
    console.error('❌ Error crítico:', err)
    m.reply(`❌ Error: ${err.message}`)
  }
}

handler.help = ['setppbot', 'cambiarfotobot', 'ppbot', 'fotoperfilbot']
handler.tags = ['fernando']
handler.command = ['setppbot', 'cambiarfotobot', 'ppbot', 'fotoperfilbot']
handler.fernando = true

export default handler