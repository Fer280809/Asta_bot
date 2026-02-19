import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`❀ Escribe qué buscar en Pinterest\nEjemplo:\n${usedPrefix}${command} goku`)
  }

  try {
    await m.react('🕒')

    // Usar API alternativa
    const results = await pinterestSearchV2(text)

    if (!results.length) {
      return m.reply('❌ No se encontraron resultados. Intenta con otra búsqueda.')
    }

    // Guardar resultados
    conn.pinterestResults ??= {}
    conn.pinterestResults[m.sender] = results

    // Enviar preview de los primeros 5 resultados directamente
    for (let i = 0; i < Math.min(5, results.length); i++) {
      const item = results[i]
      
      try {
        if (item.isVideo) {
          await conn.sendMessage(m.chat, {
            video: { url: item.url },
            caption: `📌 ${i + 1}. ${item.title || 'Video de Pinterest'}\n\nUsa ${usedPrefix}pinselect ${i} para reenviar`
          }, { quoted: m })
        } else {
          await conn.sendMessage(m.chat, {
            image: { url: item.url },
            caption: `📌 ${i + 1}. ${item.title || 'Imagen de Pinterest'}\n\nUsa ${usedPrefix}pinselect ${i} para reenviar`
          }, { quoted: m })
        }
        // Delay para no saturar
        await new Promise(r => setTimeout(r, 1000))
      } catch (err) {
        console.log(`Error enviando item ${i}:`, err.message)
      }
    }

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('⚠️ Error al buscar. Intenta más tarde.')
  }
}

handler.help = ['pinterest <búsqueda>']
handler.tags = ['download']
handler.command = ['pinterest', 'pin']
handler.group = true

export default handler

// ==========================
// COMANDO PARA SELECCIONAR (REENVÍO)
// ==========================
let handlerSelect = async (m, { conn, args }) => {
  let data = conn.pinterestResults?.[m.sender]
  if (!data) return m.reply('❌ No hay resultados activos. Busca primero con .pinterest')

  let index = parseInt(args[0])
  if (isNaN(index) || !data[index]) {
    return m.reply('❌ Opción inválida. Usa un número del 0 al ' + (data.length - 1))
  }

  let item = data[index]

  try {
    if (item.isVideo) {
      await conn.sendMessage(m.chat, {
        video: { url: item.url },
        caption: '📌 Pinterest Video'
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        image: { url: item.url },
        caption: '📌 Pinterest Imagen'
      }, { quoted: m })
    }
  } catch (err) {
    m.reply('❌ Error al reenviar el archivo')
  }
}

handlerSelect.command = ['pinselect']
export { handlerSelect }

// ==========================
// BUSCADOR V2 - Usando servicios alternativos
// ==========================
async function pinterestSearchV2(query) {
  try {
    // Método 1: Intentar con pinterestdownloader.io API
    try {
      const response = await axios.get(`https://pinterestdownloader.io/api/v1/search`, {
        params: { q: query, limit: 10 },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
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
      console.log('Método 1 falló:', e.message)
    }

    // Método 2: Usar scraping vía RapidAPI (necesitarías API key)
    // Descomenta y configura si tienes RapidAPI
    /*
    const rapidApiResponse = await axios.get('https://pinterest-scraper-api.p.rapidapi.com/search', {
      params: { query: query, limit: '10' },
      headers: {
        'X-RapidAPI-Key': 'TU_API_KEY_AQUI',
        'X-RapidAPI-Host': 'pinterest-scraper-api.p.rapidapi.com'
      }
    })
    */

    // Método 3: Fallback a scraping básico de página de búsqueda (más propenso a bloqueos pero funciona temporalmente)
    const searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}&rs=typed`
    
    const { data: html } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      },
      timeout: 15000
    })

    // Extraer URLs de imágenes del HTML usando regex (método alternativo ya que no tenemos cheerio)
    const results = []
    const pinRegex = /"url":"(https:\/\/i\.pinimg\.com\/[^"]+)"/g
    const videoRegex = /"V_720P":\{"url":"([^"]+)"/g
    
    let match
    
    // Buscar videos primero (mejor calidad)
    while ((match = videoRegex.exec(html)) !== null) {
      if (!results.find(r => r.url === match[1])) {
        results.push({
          url: match[1].replace(/\\u002F/g, '/'),
          isVideo: true,
          title: query
        })
      }
    }
    
    // Buscar imágenes
    while ((match = pinRegex.exec(html)) !== null) {
      const cleanUrl = match[1].replace(/\\u002F/g, '/')
      if (!results.find(r => r.url === cleanUrl) && results.length < 15) {
        results.push({
          url: cleanUrl,
          isVideo: false,
          title: query
        })
      }
    }

    return results.slice(0, 10)

  } catch (error) {
    console.error('Error en pinterestSearchV2:', error.message)
    return []
  }
}
