import axios from "axios"
import fetch from "node-fetch"

const MAX_DIRECT_SIZE = 50 * 1024 * 1024   // 50 MB
const MAX_FILE_SIZE   = 2 * 1024 * 1024 * 1024 // 2 GB

/* ---------- obtén datos reales ---------- */
async function getTeraBoxInfo(url) {
  const api = `https://terabox-dl.qtlfp.repl.co/api?url=${encodeURIComponent(url)}`
  const { data } = await axios.get(api, {
    timeout: 15000,
    headers: { "User-Agent": "Mozilla/5.0" }
  })

  if (!data || !data.download_url) throw new Error("API no pudo obtener el enlace real")

  const size = await getFileSize(data.download_url)

  return {
    title: data.title || "Sin título",
    thumbnail: data.thumbnail || "",
    downloadLink: data.download_url,
    size
  }
}

/* ---------- tamaño del archivo ---------- */
async function getFileSize(url) {
  try {
    const res = await axios.head(url)
    return parseInt(res.headers["content-length"]) || 0
  } catch {
    return 0
  }
}

/* ---------- formato bonito ---------- */
function formatSize(bytes) {
  if (!bytes || isNaN(bytes)) return "Desconocido"
  const units = ["B", "KB", "MB", "GB"]
  let i = 0
  bytes = Number(bytes)
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024
    i++
  }
  return `${bytes.toFixed(2)} ${units[i]}`
}

/* ---------- comando principal ---------- */
const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text?.trim()) {
    return conn.reply(m.chat,
      `❗ Ingresa un enlace de TeraBox.\n` +
      `Ejemplo: ${usedPrefix + command} https://terabox.com/s/xxxxxx`, m)
  }

  await m.react("🔍")

  try {
    const info = await getTeraBoxInfo(text.trim())
    const { title, thumbnail, downloadLink, size } = info
    const isBig = size > MAX_DIRECT_SIZE

    const body =
      `╭─━━━━━━━━━━━━━━━─╮\n` +
      `│ 📁 *${title}*\n` +
      `╰─━━━━━━━━━━━━━━━─╯\n` +
      `> 📦 Tamaño: ${formatSize(size)}\n\n` +
      `*Elige una opción:*`

    const buttons = []

    if (!isBig) {
      buttons.push(
        { buttonId: `teradownload|${downloadLink}|audio|false`, buttonText: { displayText: "🎧 Audio" } },
        { buttonId: `teradownload|${downloadLink}|video|false`, buttonText: { displayText: "📽️ Video" } }
      )
    }

    buttons.push(
      { buttonId: `teradownload|${downloadLink}|audio|true`, buttonText: { displayText: "💿 Audio Doc" } },
      { buttonId: `teradownload|${downloadLink}|video|true`, buttonText: { displayText: "🎥 Video Doc" } }
    )

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: body,
      footer: "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡",
      buttons,
      viewOnce: true,
      headerType: 4
    }, { quoted: m })

    m.react("✅")
  } catch (e) {
    m.react("❌")
    conn.reply(m.chat, `❌ Error: ${e.message}`, m)
  }
}

/* ---------- manejador de botones ---------- */
handler.before = async (m, { conn }) => {
  if (!m.buttonId?.startsWith("teradownload|")) return

  const [_, url, type, asDoc] = m.buttonId.split("|")
  const isDoc = asDoc === "true"
  const mime = type === "audio" ? "audio/mpeg" : "video/mp4"
  const ext   = type === "audio" ? "mp3" : "mp4"

  await m.react("⏳")

  try {
    if (isDoc) {
      await conn.sendMessage(m.chat, {
        document: { url },
        mimetype: mime,
        fileName: `archivo.${ext}`,
        caption: `📦 Archivo TeraBox (${ext.toUpperCase()})`
      }, { quoted: m })
    } else {
      if (type === "audio") {
        await conn.sendMessage(m.chat, {
          audio: { url },
          mimetype: "audio/mpeg",
          fileName: "audio.mp3"
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, {
          video: { url },
          mimetype: "video/mp4",
          caption: "🎥 Video desde TeraBox"
        }, { quoted: m })
      }
    }
    m.react("✅")
  } catch {
    m.react("❌")
    conn.reply(m.chat, "❌ Error al enviar el archivo", m)
  }
}

handler.command = ["teraplay"]
handler.tags = ["descargas"]
handler.group = false
handler.reg = true  

export default handler
