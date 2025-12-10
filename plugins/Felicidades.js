const handler = async (m, { conn }) => {
  const img = 'https://files.catbox.moe/pbmulh.jpg'
  const texto = `🎉 ¡Felicidades! 🎉`

  await conn.sendMessage(m.chat, {
    image: { url: img },
    caption: texto
  }, { quoted: m })
}

handler.command = ['felicidades', 'FELICIDADES', 'Felicidades']
export default handler
