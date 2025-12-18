import fs from 'fs'
import FormData from 'form-data'
import fetch from 'node-fetch'

const handler = async (m, { conn }) => {
  try {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''
    
    if (!mime) throw '🎄 ¡Menciona o responde a una *imagen navideña* para subirla! 🎅'
    
    if (!mime.startsWith('image')) throw '🎅 ¡Solo puedo subir *imágenes navideñas*! Por favor, envía una foto. 🎄'
    
    m.react('⏳')
    
    // Descargar imagen en la mejor calidad disponible
    let media
    try {
      media = await q.download?.()
      if (!media || media.length === 0) {
        media = await q.downloadMedia?.()
      }
    } catch (downloadError) {
      console.error('Error descargando:', downloadError)
      throw '🎄 ¡No pude descargar la imagen navideña! Intenta con otra imagen. 🎅'
    }
    
    if (!media || media.length === 0) {
      throw '🎅 ¡La imagen navideña está vacía o no se pudo descargar! 🎄'
    }
    
    const filePath = `./temp_navidad_${Date.now()}.jpg`
    
    // Guardar la imagen
    try {
      fs.writeFileSync(filePath, media)
    } catch (writeError) {
      console.error('Error guardando archivo:', writeError)
      throw '🎄 ¡Error al guardar la imagen navideña temporalmente! 🎅'
    }
    
    // Verificar que el archivo existe y tiene tamaño
    if (!fs.existsSync(filePath)) {
      throw '🎅 ¡El archivo navideño no se creó correctamente! 🎄'
    }
    
    const fileStats = fs.statSync(filePath)
    if (fileStats.size === 0) {
      fs.unlinkSync(filePath)
      throw '🎄 ¡La imagen navideña está vacía! Intenta con otra. 🎅'
    }
    
    // Subir a uguu.se con timeout
    const form = new FormData()
    form.append('file', fs.createReadStream(filePath))
    
    let result
    try {
      // Crear un timeout para la subida
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('⏰ Tiempo de espera navideño agotado')), 30000)
      )
      
      const uploadPromise = fetch('https://uguu.se/upload.php', {
        method: 'POST',
        body: form,
        headers: form.getHeaders? form.getHeaders() : { 'Content-Type': 'multipart/form-data' }
      })
      
      const res = await Promise.race([uploadPromise, timeoutPromise])
      
      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status} ${res.statusText}`)
      }
      
      result = await res.json()
    } catch (uploadError) {
      console.error('Error subiendo:', uploadError)
      fs.unlinkSync(filePath)
      
      if (uploadError.message.includes('Tiempo de espera')) {
        throw '🎅 ¡La subida navideña tardó demasiado! Intenta con una imagen más pequeña. 🎄'
      } else if (uploadError.message.includes('HTTP')) {
        throw '🎄 ¡El servidor navideño está teniendo problemas! Intenta más tarde. 🎅'
      } else {
        throw `🎅 ¡Error al subir la imagen navideña! Detalles: ${uploadError.message} 🎄`
      }
    }
    
    // Verificar que tenemos URL
    if (!result || !result.url) {
      fs.unlinkSync(filePath)
      throw '🎄 ¡El servidor navideño no devolvió un enlace válido! 🎅'
    }
    
    // Enviar resultado con estilo navideño
    const mensajeExito = `🎁 *¡Imagen navideña subida exitosamente!* 🎄\n\n` +
                        `✨ *Enlace directo:*\n\`\`\`${result.url}\`\`\`\n\n` +
                        `🎅 ¡Comparte la magia navideña con tus amigos!\n` +
                        `⛄ Tamaño: ${formatBytes(fileStats.size)}\n` +
                        `🦌 Servidor: uguu.se\n\n` +
                        `📎 *Copia y pega el enlace para compartir*`
    
    await conn.sendMessage(m.chat, {
      text: mensajeExito
    }, { quoted: m })
    
    // Limpiar archivo temporal
    fs.unlinkSync(filePath)
    m.react('✅')
    
  } catch (error) {
    console.error('Error general:', error)
    
    let mensajeError = '🎄 ¡Error al procesar la imagen navideña! 🎅\n\n'
    
    if (typeof error === 'string') {
      mensajeError += error
    } else if (error.message) {
      mensajeError += `Detalles: ${error.message}`
    } else {
      mensajeError += 'Intenta con otra imagen navideña o vuelve a intentarlo más tarde.'
    }
    
    m.reply(mensajeError)
    m.react('❌')
  }
}

// Función para formatear bytes a tamaño legible
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Comandos con descripción navideña
handler.help = ['uguu', 'hd']
handler.tags = ['tools']
handler.command = ['uguu', 'hd', 'subirnavidad']
handler.owner = false
handler.limit = false

export default handler