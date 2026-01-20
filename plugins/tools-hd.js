import fs from 'fs'
import FormData from 'form-data'
import fetch from 'node-fetch'

const handler = async (m, { conn }) => {
  try {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''
    if (!mime) throw '⚠️ Menciona o responde a una *imagen* para subirla.'

    m.react('⏳') // reacción opcional mientras sube

    // Descargar imagen en alta calidad
    const media = await q.download?.() || await q.downloadMedia?.()
    const filePath = `./temp_${Date.now()}.jpg`
    fs.writeFileSync(filePath, media)

    // Subir a uguu.se
    const form = new FormData()
    form.append('file', fs.createReadStream(filePath))

    const res = await fetch('https://uguu.se/upload.php', {
      method: 'POST',
      body: form
    })

    const result = await res.json().catch(() => ({}))
    if (!result.url) throw '❌ No se pudo subir la imagen a uguu.se'

    // Enviar link al chat
    await conn.sendMessage(m.chat, {
      text: `✅ *Imagen subida exitosamente*\n\n🌐 Enlace directo:\n${result.url}`
    }, { quoted: m })

    fs.unlinkSync(filePath) // borrar temporal
    m.react('✅')

  } catch (e) {
    console.error(e)
    m.reply('⚠️ Error al subir la imagen, inténtalo de nuevo.')
  }
}

// 💬 Comando
handler.help = ['uguu', 'hd']
handler.tags = ['tools']
handler.command = ['uguu', 'hd'] // <<-- AQUÍ el nuevo formato
handler.owner = false
handler.limit = false

export default handler
