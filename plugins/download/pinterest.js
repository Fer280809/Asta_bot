import axios from 'axios'
import cheerio from 'cheerio'

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
// BUSCADOR
// ==========================
async function pinterestSearch(query) {
  try {
    const url = `https://www.pinterest.com/resource/BaseSearchResource/get/?data=${encodeURIComponent(JSON.stringify({
      options: { query, scope: "pins" },
      context: {}
    }))}`

    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })

    let res = []

    data.resource_response?.data?.results?.forEach(v => {
      if (v.videos?.video_list?.V_720P) {
        res.push({
          url: v.videos.video_list.V_720P.url,
          isVideo: true
        })
      } else if (v.images?.orig?.url) {
        res.push({
          url: v.images.orig.url,
          isVideo: false
        })
      }
    })

    return res.slice(0, 10)
  } catch {
    return []
  }
}