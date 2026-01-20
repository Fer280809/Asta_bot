const handler = async (m, { conn, usedPrefix }) => {
  const logo = 'https://files.catbox.moe/j7gfwf.jpg'
  const body = `╭─◉ 🎉 *BIENVENIDOS A LA ACTUALIZACIÓN 1.3* ◉
│
│ ✨ *¡Aquí encontrarás todas las novedades!*
│
│ 🆕 *NUEVO COMANDO:*
│
│ • 📱 #estados – Descarga estados de WhatsApp
│   └ Usa: mención, número o responde a mensaje
│
│ 🔧 *OPTIMIZACIONES Y MEJORAS:*
│
│ • 🐛 Múltiples bugs corregidos para mejor estabilidad
│ • ⚡ Rendimiento optimizado en comandos generales
│ • 🛠️ Mejoras en la funcionalidad de varios comandos
│
│ *¡Disfruta de la nueva versión mejorada!*
╰─────────────────
  `.trim()

  await conn.sendMessage(m.chat, {
    image: { url: logo },
    caption: body,
    footer: `『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡`
  }, { quoted: m })
}

handler.command = ['actualizaciones', 'novedades', 'nuevos']
handler.tags = ['info']
handler.desc = 'Actualización v1.3 - Nuevo comando de estados, bugs corregidos y optimizaciones'
handler.register = true

export default handler
