import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`❀ Escribe qué buscar en Pinterest\nEjemplo:\n${usedPrefix}${command} goku`)
  }

  // Mensaje de "buscando" inmediato
  await m.reply('🔍 Buscando en Pinterest...')

  try {
    await m.react('🕒')

    // Usar API alternativa confiable
    const results = await searchPinterestFast(text)

    if (!results || results.length === 0) {
      await m.react('❌')
      return m.reply('❌ No se encontraron resultados.\n💡 Tip: Intenta con términos más simples como "anime", "carros", "paisajes"')
    }

    // Guardar resultados
    conn.pinterestResults ??= {}
    conn.pinterestResults[m.sender] = results

    // Enviar resultados directamente (más confiable que botones)
    let caption = `📌 *Resultados para:* ${text}\n\n`
    caption += `✅ Encontrados: ${results.length} archivos\n\n`
    caption += `📥 *Para descargar usa:*\n`
    caption += results.slice(0, 5).map((_, i) => `${usedPrefix}pinselect ${i}`).join('\n')

    // Enviar primera imagen como preview
    try {
      await conn.sendMessage(m.chat, {
        image: { url: results[0].url },
        caption: caption
      }, { quoted: m })
    } catch (e) {
      // Si falla la imagen, enviar solo texto
      await conn.sendMessage(m.chat, {
        text: caption
      }, { quoted: m })
    }

    await m.react('✅')

  } catch (e) {
    console.error('Error completo:', e)
    await m.react('❌')
    m.reply('⚠️ Error: ' + (e.message || 'Servicio no disponible'))
  }
}

handler.help = ['pinterest <búsqueda>']
handler.tags = ['download']
handler.command = ['pinterest', 'pin']
handler.group = true

export default handler

// ==========================
// COMANDO PARA SELECCIONAR
// ==========================
let handlerSelect = async (m, { conn, args }) => {
  let data = conn.pinterestResults?.[m.sender]
  if (!data) return m.reply('❌ Primero busca algo con .pinterest <término>')

  let index = parseInt(args[0])
  if (isNaN(index) || index < 0 || index >= data.length) {
    return m.reply(`❌ Usa un número del 0 al ${data.length - 1}`)
  }

  let item = data[index]
  
  await m.react('🕒')

  try {
    if (item.isVideo) {
      await conn.sendMessage(m.chat, {
        video: { url: item.url },
        caption: `📌 ${item.title || 'Video'}`
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        image: { url: item.url },
        caption: `📌 ${item.title || 'Imagen'}`
      }, { quoted: m })
    }
    await m.react('✅')
  } catch (err) {
    console.error('Error al enviar:', err)
    await m.react('❌')
    m.reply('❌ Error al descargar. El enlace puede haber expirado.')
  }
}

handlerSelect.command = ['pinselect']
export { handlerSelect }

// ==========================
// BUSCADOR RÁPIDO - APIs Alternativas
// ==========================
async function searchPinterestFast(query) {
  const results = []
  
  // MÉTODO 1: API de savepin (más estable)
  try {
    console.log('Intentando método 1: savepin...')
    const response = await axios.get('https://api.savepin.app/search', {
      params: { 
        q: query, 
        limit: 10 
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://savepin.app',
        'Referer': 'https://savepin.app/'
      },
      timeout: 8000 // 8 segundos máximo
    })
    
    if (response.data?.data && Array.isArray(response.data.data)) {
      response.data.data.forEach(item => {
        if (item.media_url) {
          results.push({
            url: item.media_url,
            isVideo: item.type === 'video' || item.media_url.includes('.mp4'),
            title: item.title || query
          })
        }
      })
      console.log(`Método 1 exitoso: ${results.length} resultados`)
      if (results.length > 0) return results
    }
  } catch (e) {
    console.log('Método 1 falló:', e.message)
  }

  // MÉTODO 2: API de pintodown (alternativa)
  try {
    console.log('Intentando método 2: pintodown...')
    const response = await axios.get('https://pintodown.com/api/search', {
      params: { query: query },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      timeout: 8000
    })
    
    if (response.data?.results) {
      response.data.results.forEach(item => {
        results.push({
          url: item.url,
          isVideo: item.isVideo || false,
          title: item.title || query
        })
      })
      console.log(`Método 2 exitoso: ${results.length} resultados`)
      if (results.length > 0) return results
    }
  } catch (e) {
    console.log('Método 2 falló:', e.message)
  }

  // MÉTODO 3: Scraping simple a Pinterest (último recurso)
  try {
    console.log('Intentando método 3: scraping directo...')
    const searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`
    
    const { data: html } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 10000,
      maxRedirects: 3
    })

    // Extraer imágenes del HTML
    const imgRegex = /https:\/\/i\.pinimg\.com\/[a-z0-9]+\/[a-f0-9]{2}\/[a-f0-9]{2}\/[a-f0-9]{2}\/[a-f0-9]{2}\/[a-f0-9]{2}\/[a-z0-9_]+\.[a-z]+/gi
    const matches = [...html.matchAll(imgRegex)]
    
    // Eliminar duplicados
    const uniqueUrls = [...new Set(matches.map(m => m[0]))]
    
    uniqueUrls.slice(0, 10).forEach(url => {
      results.push({
        url: url,
        isVideo: false,
        title: query
      })
    })
    
    console.log(`Método 3 exitoso: ${results.length} resultados`)
    if (results.length > 0) return results
    
  } catch (e) {
    console.log('Método 3 falló:', e.message)
  }

  // MÉTODO 4: Google Images (garantizado que funciona)
  try {
    console.log('Intentando método 4: Google Images...')
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`
    
    const { data } = await axios.get(googleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 8000
    })
    
    // Extraer URLs de imágenes de Google
    const regex = /"https:\/\/([^"]+\.(?:jpg|jpeg|png|gif))"/g
    let match
    const foundUrls = []
    
    while ((match = regex.exec(data)) !== null) {
      const cleanUrl = 'https://' + match[1].replace(/\\x3d/g, '=').replace(/\\x26/g, '&')
      if (!foundUrls.includes(cleanUrl)) {
        foundUrls.push(cleanUrl)
        results.push({
          url: cleanUrl,
          isVideo: false,
          title: query + ' (Google)'
        })
      }
      if (foundUrls.length >= 10) break
    }
    
    console.log(`Método 4 exitoso: ${results.length} resultados`)
    
  } catch (e) {
    console.log('Método 4 falló:', e.message)
  }

  return results
}
