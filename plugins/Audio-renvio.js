import { proto } from "@whiskeysockets/baileys"
import { writeFileSync, unlinkSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"

const handler = async (m, { conn }) => {
  if (!m.quoted) return conn.reply(m.chat, "❗ Responde a un audio naranja.", m)

  const type = Object.keys(m.quoted.message)[0]
  if (type !== 'audioMessage') return conn.reply(m.chat, "❗ El mensaje respondido no es un audio.", m)

  await m.react('⏳')

  try {
    // 1. Descargar el audio
    const buffer = await conn.downloadMediaMessage(m.quoted.message.audioMessage)

    // 2. Guardar temporalmente
    const tmpFile = join(tmpdir(), `audio_${Date.now()}.opus`)
    writeFileSync(tmpFile, buffer)

    // 3. Volver a enviar como archivo NUEVO (sin metadata de reenvío)
    await conn.sendMessage(m.chat, {
      audio: { url: tmpFile },
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true // nota de voz
    })

    // 4. Borrar temporal
    unlinkSync(tmpFile)

    m.react('✅')
  } catch (e) {
    m.react('❌')
    conn.reply(m.chat, `❌ Error: ${e.message}`, m)
  }
}

handler.command = ['fixvoice', 'vozverde', 'audioverde', 'av']
handler.tags = ['utilidad']
handler.group = false

export default handler
