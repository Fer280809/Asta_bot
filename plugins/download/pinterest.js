import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`❀ Escribe qué buscar en Pinterest\nEjemplo:\n${usedPrefix}${command} paisajes`)
  }

  try {
    await m.react('🕒')

    const results = await pinterestSearch(text)

    if (!results.length) {
      return m.reply('❌ No se encontraron resultados.')
    }

    // Guardar resultados temporalmente
    conn.pinterestResults ??= {}
    conn.pinterestResults[m.sender] = results

    // Crear lista
    let sections = [{
      title: '📌 Resultados de Pinterest',
      rows: results.slice(0, 10).map((item, i) => ({
        title: `Resultado ${i + 1}`,
        description: item.isVideo ? '🎥 Video' : '🖼 Imagen',
        rowId: `${usedPrefix}pinselect ${i}`
      }))
    }]

    await conn.sendMessage(m.chat, {
      text: `🔍 Resultados para: *${text}*\n\nElige uno:`,
      footer: 'Pinterest Downloader',
      title: '📌 Pinterest',
      buttonText: 'Ver resultados',
      sections
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('⚠️ Error al buscar en Pinterest.')
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
  if (!data) return m.reply('❌ No hay resultados activos.')

  let index = parseInt(args[0])
  if (isNaN(index) || !data[index]) {
    return m.reply('❌ Opción inválida.')
  }

  let item = data[index]

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
}

handlerSelect.command = ['pinselect']
export { handlerSelect }

// ==========================
// BUSCADOR CORREGIDO
// ==========================
async function pinterestSearch(query) {
  try {
    // ✅ URL sin espacios, estructura correcta
    const params = {
      source_url: `/search/pins/?q=${encodeURIComponent(query)}`,
      data: JSON.stringify({
        options: {
          isPrefetch: false,
          query: query,
          scope: "pins",
          no_fetch_context_on_resource: false
        },
        context: {}
      }),
      _: Date.now()
    }

    const url = `https://www.pinterest.com/resource/BaseSearchResource/get/?` + 
      Object.entries(params)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&')

    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.pinterest.com/',
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 15000
    })

    let res = []

    // ✅ Verificación más segura de la respuesta
    const results = data?.resource_response?.data?.results || []
    
    results.forEach(v => {
      // Videos
      if (v?.videos?.video_list) {
        const videoQualities = ['V_720P', 'V_480P', 'V_360P', 'V_HLSV4']
        for (const quality of videoQualities) {
          if (v.videos.video_list[quality]?.url) {
            res.push({
              url: v.videos.video_list[quality].url,
              isVideo: true,
              title: v.title || query
            })
            break
          }
        }
      } 
      // Imágenes
      else if (v?.images?.orig?.url) {
        res.push({
          url: v.images.orig.url,
          isVideo: false,
          title: v.title || query
        })
      }
    })

    return res.slice(0, 15)

  } catch (error) {
    console.error('Pinterest Search Error:', error.message)
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Data:', error.response.data)
    }
    return []
  }
}
