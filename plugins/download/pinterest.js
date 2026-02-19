import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`❀ Escribe qué buscar en Pinterest\nEjemplo:\n${usedPrefix}${command} goku`)
  }

  try {
    await m.react('🕒')

    // Intentar múltiples métodos hasta que uno funcione
    let results = await pinterestSearchMain(text)
    
    if (!results.length) {
      // Si falla, intentar con método alternativo
      results = await pinterestSearchFallback(text)
    }

    if (!results.length) {
      return m.reply('❌ No se encontraron resultados. Intenta con otra búsqueda o más tarde.')
    }

    // Guardar resultados
    conn.pinterestResults ??= {}
    conn.pinterestResults[m.sender] = results

    // Crear lista visual
    let sections = [{
      title: '📌 Resultados encontrados',
      rows: results.slice(0, 10).map((item, i) => ({
        title: `${item.isVideo ? '🎥' : '🖼️'} Resultado ${i + 1}`,
        description: item.title?.substring(0, 50) || (item.isVideo ? 'Video' : 'Imagen'),
        rowId: `${usedPrefix}pinselect ${i}`
      }))
    }]

    await conn.sendMessage(m.chat, {
      text: `🔍 *Resultados para:* ${text}\n\n✅ Se encontraron *${results.length}* archivos\n\nSelecciona uno para descargar:`,
      footer: 'Pinterest Search',
      title: '📌 Pinterest Downloader',
      buttonText: 'Ver resultados',
      sections
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error('Error en handler:', e)
    await m.react('❌')
    m.reply('⚠️ Error al buscar. El servicio puede estar caído o bloqueado.')
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
  if (!data) return m.reply('❌ No hay resultados activos. Busca primero con .pinterest')

  let index = parseInt(args[0])
  if (isNaN(index) || index < 0 || index >= data.length) {
    return m.reply(`❌ Opción inválida. Usa un número del 0 al ${data.length - 1}`)
  }

  let item = data[index]
  
  await m.react('🕒')

  try {
    if (item.isVideo) {
      await conn.sendMessage(m.chat, {
        video: { url: item.url },
        caption: `📌 *Video de Pinterest*\n📝 ${item.title || 'Sin título'}`
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        image: { url: item.url },
        caption: `📌 *Imagen de Pinterest*\n📝 ${item.title || 'Sin título'}`
      }, { quoted: m })
    }
    await m.react('✅')
  } catch (err) {
    console.error('Error enviando archivo:', err)
    await m.react('❌')
    m.reply('❌ Error al descargar el archivo. Puede haber expirado el enlace.')
  }
}

handlerSelect.command = ['pinselect']
export { handlerSelect }

// ==========================
// MÉTODO PRINCIPAL - Scraping directo mejorado
// ==========================
async function pinterestSearchMain(query) {
  try {
    // Lista de User Agents rotativos
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
    ]
    
    const ua = userAgents[Math.floor(Math.random() * userAgents.length)]
    
    // Intentar obtener datos del feed de búsqueda de Pinterest
    const searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}&rs=typed`
    
    const { data: html } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': ua,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'Cookie': '_auth=1; _b="AXGj2xvjD5xNVL0BX6j1JHDP7OW9sGz5j4C0qP9/2R5j2Z0tGz5j4C0qP9="'
      },
      timeout: 15000,
      maxRedirects: 5
    })

    const results = []
    
    // Buscar datos JSON embebidos en el HTML (Pinterest carga datos en <script> tags)
    const jsonDataRegex = /<script id="initial-state" type="application\/json">(.*?)<\/script>/s
    const jsonMatch = html.match(jsonDataRegex)
    
    if (jsonMatch) {
      try {
        const jsonData = JSON.parse(jsonMatch[1])
        const resources = jsonData?.resources?.data || {}
        
        // Extraer pins de los recursos
        Object.values(resources).forEach(resource => {
          if (resource?.data?.images) {
            const img = resource.data.images
            const origUrl = img.orig?.url || img['736x']?.url
            
            if (origUrl && !results.find(r => r.url === origUrl)) {
              results.push({
                url: origUrl,
                isVideo: false,
                title: resource.data.description || resource.data.title || query
              })
            }
          }
          
          // Buscar videos
          if (resource?.data?.videos?.video_list) {
            const videos = resource.data.videos.video_list
            const videoUrl = videos.V_720P?.url || videos.V_480P?.url || videos.V_360P?.url
            
            if (videoUrl && !results.find(r => r.url === videoUrl)) {
              results.push({
                url: videoUrl,
                isVideo: true,
                title: resource.data.description || query
              })
            }
          }
        })
      } catch (e) {
        console.log('Error parseando JSON:', e.message)
      }
    }
    
    // Si no encontró nada en JSON, buscar con regex en el HTML crudo
    if (results.length === 0) {
      // Buscar URLs de imágenes de Pinterest
      const imgRegex = /https:\/\/i\.pinimg\.com\/[a-z0-9]+\/[a-f0-9]+\/[a-f0-9]+\/[a-f0-9]+\/[a-f0-9]+\/[a-z0-9_]+\.[a-z]+/gi
      const matches = html.match(imgRegex) || []
      
      matches.forEach(url => {
        if (!results.find(r => r.url === url)) {
          results.push({
            url: url,
            isVideo: false,
            title: query
          })
        }
      })
    }

    return results.slice(0, 15)

  } catch (error) {
    console.error('Error método principal:', error.message)
    return []
  }
}

// ==========================
// MÉTODO ALTERNATIVO - Usar servicios de descarga externos
// ==========================
async function pinterestSearchFallback(query) {
  try {
    // Método A: Intentar con savepin.app (tiene API no documentada)
    try {
      const response = await axios.get(`https://api.savepin.app/search`, {
        params: { q: query, limit: 10 },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        },
        timeout: 10000
      })
      
      if (response.data?.data?.length) {
        return response.data.data.map(item => ({
          url: item.media_url,
          isVideo: item.type === 'video',
          title: item.title || query
        }))
      }
    } catch (e) {
      console.log('Savepin falló:', e.message)
    }

    // Método B: Intentar con otras APIs de terceros
    try {
      const response = await axios.get(`https://pinterest-video-api.vercel.app/search`, {
        params: { query: query },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      })
      
      if (response.data?.results?.length) {
        return response.data.results.map(item => ({
          url: item.url,
          isVideo: item.type === 'video',
          title: item.title || query
        }))
      }
    } catch (e) {
      console.log('API alternativa falló:', e.message)
    }

    // Método C: Último recurso - Buscar en Google Images (similar a Pinterest)
    try {
      const googleResponse = await axios.get(`https://www.google.com/search`, {
        params: {
          q: query + ' pinterest',
          tbm: 'isch',
          hl: 'es'
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      })
      
      // Extraer URLs de imágenes de Google (básico)
      const imgRegex = /https:\/\/[^"\s]+\.pinterest\.com\/[^"\s]+\.(?:jpg|jpeg|png|gif)/gi
      const matches = googleResponse.data.match(imgRegex) || []
      
      return matches.slice(0, 10).map(url => ({
        url: url,
        isVideo: false,
        title: query + ' (Google)'
      }))
    } catch (e) {
      console.log('Google fallback falló:', e.message)
    }

    return []
  } catch (error) {
    console.error('Error método fallback:', error.message)
    return []
  }
}
