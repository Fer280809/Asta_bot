import axios from 'axios'

const handler = async (m, { conn, usedPrefix }) => {
  try {
    await m.react('🎄')

    // Lista de búsquedas navideñas aleatorias
    const busquedasNavidenas = [
      'jingle bells christmas',
      'feliz navidad villancico',
      'santa claus dancing',
      'noche de paz christmas',
      'white christmas song',
      'all i want for christmas',
      'rudolph reindeer',
      'deck the halls',
      'silent night navidad',
      'we wish you merry christmas',
      'frosty snowman',
      'let it snow christmas',
      'winter wonderland',
      'o holy night',
      'hark herald angels',
      'little drummer boy',
      'twelve days christmas',
      'rockin around christmas tree',
      'holly jolly christmas',
      'carol of the bells',
      'mary did you know',
      'feliz navidad jose feliciano',
      'last christmas wham',
      'santa baby',
      'sleigh ride christmas',
      'blue christmas',
      'its beginning look christmas',
      'santa claus coming town',
      'chestnuts roasting',
      'have yourself merry christmas',
      'baby its cold outside',
      'silver bells christmas',
      'navidad sin ti',
      'mi burrito sabanero',
      'los peces en el rio',
      'campana sobre campana',
      'noche de paz letra',
      'arbolito de navidad',
      'blanca navidad',
      'rodolfo el reno',
      'tamborilero navidad'
    ]

    // Seleccionar búsqueda aleatoria
    const busquedaAleatoria = busquedasNavidenas[Math.floor(Math.random() * busquedasNavidenas.length)]

    // Buscar videos en TikTok
    const res = await axios({ 
      method: 'POST', 
      url: 'https://tikwm.com/api/feed/search', 
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' 
      }, 
      data: { 
        keywords: busquedaAleatoria, 
        count: 30,
        cursor: 0, 
        HD: 1 
      }
    })

    const videos = res.data?.data?.videos || []
    
    if (videos.length === 0) {
      return conn.reply(m.chat, 
        `❄️ *¡Los renos no encontraron videos!* 🦌\n\n` +
        `Intenta de nuevo con *${usedPrefix}villancico*`, 
        m
      )
    }

    // Palabras clave navideñas para filtrar
    const palabrasNavidenas = [
      'navidad', 'christmas', 'villancico', 'noel', 'santa', 
      'papa noel', 'santa claus', 'reno', 'reindeer', 'trineo',
      'arbol', 'tree', 'regalo', 'gift', 'nieve', 'snow',
      'feliz', 'merry', 'jingle', 'bells', 'cascabel',
      'noche de paz', 'silent night', 'rodolfo', 'rudolph',
      'xmas', 'navideño', 'frosty', 'winter', 'wonderland',
      'carol', 'feliciano', 'wham', 'mariah', 'carey'
    ]

    // Filtrar videos navideños
    const videosNavidenos = videos.filter(v => {
      if (!v.play) return false
      
      const titulo = (v.title || '').toLowerCase()
      const descripcion = (v.desc || '').toLowerCase()
      const autor = (v.author?.nickname || '').toLowerCase()
      const textoCompleto = `${titulo} ${descripcion} ${autor}`
      
      return palabrasNavidenas.some(palabra => textoCompleto.includes(palabra.toLowerCase()))
    })

    if (videosNavidenos.length === 0) {
      return conn.reply(m.chat, 
        `🎅 *¡No encontré videos navideños!* ❄️\n\n` +
        `Intenta de nuevo con *${usedPrefix}villancico*`, 
        m
      )
    }

    // Mezclar videos aleatoriamente y seleccionar 6-10
    const videosAleatorios = videosNavidenos.sort(() => Math.random() - 0.5)
    const cantidadEnviar = Math.min(Math.floor(Math.random() * 5) + 6, videosAleatorios.length)
    const videosSeleccionados = videosAleatorios.slice(0, cantidadEnviar)

    // Crear mensajes con videos (SIN caption)
    const medias = videosSeleccionados.map(v => ({
      type: 'video',
      data: { url: v.play },
      caption: '' // Sin caption, solo el video
    }))

    // Mensaje inicial
    await conn.reply(m.chat, 
      `🎄 *¡Ho-Ho-Ho! Videos navideños encontrados* 🎅\n\n` +
      `🎁 Enviando *${videosSeleccionados.length}* videos navideños...\n` +
      `❄️ Preparando la magia navideña...`, 
      m
    )

    // Enviar videos
    await conn.sendSylphy(m.chat, medias, { quoted: m })

    // Reacción de éxito
    await m.react('🎁')

  } catch (e) {
    await m.react('❌')
    await conn.reply(m.chat, 
      `⚠️ *¡El Grinch bloqueó la señal navideña!* 🎄\n\n` +
      `Error: ${e.message}\n\n` +
      `🎅 Usa *${usedPrefix}report* para informar este problema.`, 
      m
    )
    console.error('Error en comando villancico:', e)
  }
}

handler.help = ['villancico', 'videonavi', 'ttnavi']
handler.tags = ['downloader', 'navidad']
handler.command = ['villancico', 'villancicos', 'videonavi', 'ttnavi', 'navidadtt']
handler.group = false

export default handler