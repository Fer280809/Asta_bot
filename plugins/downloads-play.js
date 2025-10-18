import fetch from "node-fetch"
import yts from "yt-search"
import Jimp from "jimp"
import axios from "axios"
import crypto from "crypto"

// Límites aumentados
const MAX_FILE_SIZE = 2000 * 1024 * 1024 // 2 GB
const VIDEO_THRESHOLD = 100 * 1024 * 1024 // 100 MB (para enviar como doc)
const AUDIO_THRESHOLD = 50 * 1024 * 1024 // 50 MB

async function resizeImage(buffer, size = 300) {
  try {
    const image = await Jimp.read(buffer)
    return image.resize(size, size).getBufferAsync(Jimp.MIME_JPEG)
  } catch {
    return buffer
  }
}

const savetube = {
  api: {
    base: "https://media.savetube.me/api",
    info: "/v2/info",
    download: "/download",
    cdn: "/random-cdn"
  },
  headers: {
    accept: "*/*",
    "content-type": "application/json",
    origin: "https://yt.savetube.me",
    referer: "https://yt.savetube.me/",
    "user-agent": "Postify/1.0.0"
  },
  crypto: {
    hexToBuffer: (hexString) => {
      const matches = hexString.match(/.{1,2}/g)
      return Buffer.from(matches.join(""), "hex")
    },
    decrypt: async (enc) => {
      const secretKey = "C5D58EF67A7584E4A29F6C35BBC4EB12"
      const data = Buffer.from(enc, "base64")
      const iv = data.slice(0, 16)
      const content = data.slice(16)
      const key = savetube.crypto.hexToBuffer(secretKey)
      const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv)
      let decrypted = decipher.update(content)
      decrypted = Buffer.concat([decrypted, decipher.final()])
      return JSON.parse(decrypted.toString())
    }
  },
  isUrl: (str) => {
    try {
      new URL(str)
      return /youtube.com|youtu.be/.test(str)
    } catch {
      return false
    }
  },
  youtube: (url) => {
    const patterns = [
      /youtube.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtube.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtu.be\/([a-zA-Z0-9_-]{11})/
    ]
    for (let pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  },
  request: async (endpoint, data = {}, method = "post") => {
    try {
      const { data: response } = await axios({
        method,
        url: `${endpoint.startsWith("http") ? "" : savetube.api.base}${endpoint}`,
        data: method === "post" ? data : undefined,
        params: method === "get" ? data : undefined,
        headers: savetube.headers,
        timeout: 60000
      })
      return { status: true, code: 200, data: response }
    } catch (error) {
      return { status: false, code: error.response?.status || 500, error: error.message }
    }
  },
  getCDN: async () => {
    const response = await savetube.request(savetube.api.cdn, {}, "get")
    if (!response.status) return response
    return { status: true, code: 200, data: response.data.cdn }
  },
  download: async (link, type = "audio") => {
    if (!savetube.isUrl(link)) return { status: false, code: 400, error: "URL inválida" }
    const id = savetube.youtube(link)
    if (!id) return { status: false, code: 400, error: "No se pudo obtener el ID del video" }
    try {
      const cdnx = await savetube.getCDN()
      if (!cdnx.status) return cdnx
      const cdn = cdnx.data
      const videoInfo = await savetube.request(`https://${cdn}${savetube.api.info}`, { url: `https://www.youtube.com/watch?v=${id}` })
      if (!videoInfo.status || !videoInfo.data?.data) return { status: false, code: 500, error: "No se pudo obtener información del video" }
      const decrypted = await savetube.crypto.decrypt(videoInfo.data.data)
      
      // Para videos, intentar con menor calidad si es muy grande
      let quality = type === "audio" ? "mp3" : "720p"
      
      const downloadData = await savetube.request(
        `https://${cdn}${savetube.api.download}`,
        { id, downloadType: type === "audio" ? "audio" : "video", quality: quality, key: decrypted.key }
      )
      if (!downloadData?.data?.data?.downloadUrl) return { status: false, code: 500, error: "No se pudo obtener link de descarga" }
      return {
        status: true,
        code: 200,
        result: {
          title: decrypted.title || "Desconocido",
          author: decrypted.channel || "Desconocido",
          views: decrypted.viewCount || "Desconocido",
          timestamp: decrypted.lengthSeconds || "0",
          ago: decrypted.uploadedAt || "Desconocido",
          format: type === "audio" ? "mp3" : "mp4",
          download: downloadData.data.data.downloadUrl,
          thumbnail: decrypted.thumbnail || null
        }
      }
    } catch (error) {
      return { status: false, code: 500, error: error.message }
    }
  }
}

function formatSize(bytes) {
  if (!bytes || isNaN(bytes)) return 'Desconocido'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  bytes = Number(bytes)
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024
    i++
  }
  return `${bytes.toFixed(2)} ${units[i]}`
}

async function getSize(url) {
  try {
    const res = await axios.head(url, { timeout: 15000 })
    const size = parseInt(res.headers['content-length'], 10)
    return size || 0
  } catch {
    return 0
  }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  // Si es comando de descarga directa
  if (['ytmp3', 'ytmp4', 'ytmp3doc', 'ytmp4doc'].includes(command)) {
    return await handleDownload(m, conn, text, command)
  }
  
  // Comando play principal
  if (!text?.trim()) {
    return conn.reply(m.chat, `❗ Por favor ingresa un texto para buscar.\nEjemplo: ${usedPrefix + command} Nombre del video`, m)
  }
  
  await m.react('🔍')
  
  try {
    const search = await yts(text)
    const videoInfo = search.all?.[0]
    
    if (!videoInfo) {
      throw '❗ No se encontraron resultados para tu búsqueda.'
    }
    
    const { title, thumbnail, timestamp, views, ago, url, author } = videoInfo
    const vistas = views?.toLocaleString?.() || 'Desconocido'
    
    const body = `╭─━━━━━━━━━━━━━━━─╮
│ 📹 *${title}*
╰─━━━━━━━━━━━━━━━─╯

> 👤 Canal: ${author.name}
> 👁️ Vistas: ${vistas}
> ⏱️ Duración: ${timestamp}
> 📅 Publicado: ${ago}
> 🔗 Link: ${url}

*Elige una opción para descargar:*`

    await conn.sendMessage(
      m.chat,
      {
        image: { url: thumbnail },
        caption: body,
        footer: `『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡`,
        buttons: [
          { buttonId: `${usedPrefix}ytmp3 ${url}`, buttonText: { displayText: '🎧 Audio' } },
          { buttonId: `${usedPrefix}ytmp4 ${url}`, buttonText: { displayText: '📽️ Video' } },
          { buttonId: `${usedPrefix}ytmp3doc ${url}`, buttonText: { displayText: '💿 Audio Doc' } },
          { buttonId: `${usedPrefix}ytmp4doc ${url}`, buttonText: { displayText: '🎥 Video Doc' } },
        ],
        viewOnce: true,
        headerType: 4,
      },
      { quoted: m }
    )
    
    m.react('✅')
  } catch (e) {
    await m.react('❌')
    return conn.reply(m.chat, typeof e === 'string' ? e : `⚠️ Error: ${e.message}`, m)
  }
}

async function handleDownload(m, conn, text, command) {
  if (!text?.trim()) {
    return conn.reply(m.chat, "❌ Proporciona una URL de YouTube", m)
  }
  
  await m.react('⏳')
  
  try {
    let url, title, thumbnail, author, vistas, timestamp, ago
    
    if (savetube.isUrl(text)) {
      const id = savetube.youtube(text)
      const search = await yts({ videoId: id })
      url = text
      title = search.title || "Desconocido"
      thumbnail = search.thumbnail
      author = search.author?.name || "Desconocido"
      vistas = search.views?.toLocaleString?.() || "Desconocido"
      timestamp = search.timestamp || "Desconocido"
      ago = search.ago || "Desconocido"
    } else {
      const search = await yts.search({ query: text, pages: 1 })
      if (!search.videos.length) return m.reply("❌ No se encontraron resultados")
      const videoInfo = search.videos[0]
      url = videoInfo.url
      title = videoInfo.title
      thumbnail = videoInfo.thumbnail
      author = videoInfo.author?.name || "Desconocido"
      vistas = videoInfo.views?.toLocaleString?.() || "Desconocido"
      timestamp = videoInfo.timestamp || "Desconocido"
      ago = videoInfo.ago || "Desconocido"
    }
    
    console.log(`🔍 Descargando: ${title}`)
    console.log(`🎯 Comando: ${command}`)
    
    const thumbResized = await resizeImage(await (await fetch(thumbnail)).buffer(), 300)
    
    // YTMP3 - Audio normal
    if (command === 'ytmp3') {
      await conn.reply(m.chat, `⏳ Descargando audio: *${title}*\n> Esto puede tardar unos segundos...`, m)
      const dl = await savetube.download(url, "audio")
      if (!dl.status) throw dl.error
      
      console.log(`✅ Audio obtenido: ${dl.result.download}`)
      
      await conn.sendMessage(m.chat, {
        audio: { url: dl.result.download },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`
      }, { quoted: m })
      
      await m.react('✅')
      return
    }
    
    // YTMP4 - Video normal
    if (command === 'ytmp4') {
      await conn.reply(m.chat, `⏳ Descargando video: *${title}*\n> Esto puede tardar unos minutos...`, m)
      const dl = await savetube.download(url, "video")
      if (!dl.status) throw dl.error
      
      console.log(`✅ Video obtenido: ${dl.result.download}`)
      
      const size = await getSize(dl.result.download)
      console.log(`📦 Tamaño del archivo: ${formatSize(size)}`)
      
      if (size > MAX_FILE_SIZE) {
        throw `📦 El archivo es demasiado grande (${formatSize(size)}). Intenta con un video más corto o usa el formato de documento.`
      }
      
      // Siempre enviar videos grandes como documento
      if (size >= VIDEO_THRESHOLD || size === 0) {
        await conn.reply(m.chat, `📦 Archivo grande detectado (${formatSize(size)}), enviando como documento...`, m)
        
        await conn.sendMessage(m.chat, {
          document: { url: dl.result.download },
          mimetype: 'video/mp4',
          fileName: `${title}.mp4`,
          caption: `🎬 *${title}*\n\n> 📦 Tamaño: ${formatSize(size)}\n> 『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡`,
          jpegThumbnail: thumbResized
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, {
          video: { url: dl.result.download },
          mimetype: 'video/mp4',
          fileName: `${title}.mp4`,
          caption: `🎬 *${title}*\n\n> 『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡`
        }, { quoted: m })
      }
      
      await m.react('✅')
      return
    }
    
    // YTMP3DOC - Audio como documento
    if (command === 'ytmp3doc') {
      await conn.reply(m.chat, `⏳ Descargando audio como documento: *${title}*`, m)
      const dl = await savetube.download(url, "audio")
      if (!dl.status) throw dl.error
      
      await conn.sendMessage(m.chat, {
        document: { url: dl.result.download },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`,
        caption: `💿 *${title}*\n\n> 『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡`,
        jpegThumbnail: thumbResized
      }, { quoted: m })
      
      await m.react('✅')
      return
    }
    
    // YTMP4DOC - Video como documento
    if (command === 'ytmp4doc') {
      await conn.reply(m.chat, `⏳ Descargando video como documento: *${title}*\n> Archivos grandes pueden tardar varios minutos...`, m)
      const dl = await savetube.download(url, "video")
      if (!dl.status) throw dl.error
      
      const size = await getSize(dl.result.download)
      console.log(`📦 Tamaño del archivo: ${formatSize(size)}`)
      
      if (size > MAX_FILE_SIZE) {
        throw `📦 El archivo es demasiado grande (${formatSize(size)}). El límite es 2GB. Intenta con un video más corto.`
      }
      
      if (size > 500 * 1024 * 1024) {
        await conn.reply(m.chat, `⚠️ Archivo muy grande (${formatSize(size)}), esto puede tardar varios minutos. Ten paciencia...`, m)
      }
      
      await conn.sendMessage(m.chat, {
        document: { url: dl.result.download },
        mimetype: "video/mp4",
        fileName: `${title}.mp4`,
        jpegThumbnail: thumbResized,
        caption: `🎥 *${title}*\n\n> 📦 Tamaño: ${formatSize(size)}\n> 『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡`
      }, { quoted: m })
      
      await m.react('✅')
      return
    }
    
  } catch (e) {
    await m.react('❌')
    console.error('❌ Error completo:', e)
    return conn.reply(m.chat, `❌ Error: ${typeof e === 'string' ? e : e.message}`, m)
  }
}

handler.command = ['play', 'play2', 'ytmp3', 'ytmp4', 'ytmp3doc', 'ytmp4doc']
handler.tags = ['descargas']
handler.group = true

export default handler
