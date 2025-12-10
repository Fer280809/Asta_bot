const handler = async (m, { conn, usedPrefix }) => {
  const logo = 'https://files.catbox.moe/j7gfwf.jpg'

  const body = `╭─◉ 🎉 *BIENVENIDOS A LA ACTUALIZACIÓN 1.3* ◉
│
│ ✨ *¡Aquí encontrarás todas las novedades!*
│
│ 📌 *COMANDOS DE CLANES NUEVOS:*
│
│ • 🏰 #crearclan – Crea tu clan con estilo
│ • 🏹 #unirclan – Solicita unirte a un clan
│ • ✅ #aceptarclan – Acepta invitaciones con botones
│ • 📤 #invitarclan – Invita por mención/número con botones
│ • ⚙️ #veropciones – Menú con botones para activar/desactivar
│ • ⚔️ #misataques – Ver ataques con botones
│ • 🛒 #tiendaclan – Tienda unificada con botones
│ • 🏥 #curarclan – Cura al clan con tu XP
│ • 🔥 #atacarclan – Ataques solo en combate (máx 200 daño)
│
│ 🔧 *OPTIMIZACIONES:*
│
│ • 🔇 #mute – Ahora detecta mención/cita/número
│ • 🛡️ #antispam – Mejorado y sin falsos positivos
│ • ⚙️ #veropciones – Botones dinámicos por opción
│ • 📥 #invitarclan – Botones de aceptar/rechazar en privado
│
│ 💡 *NUEVO:* Todos los comandos de clanes usan tu XP/nivel del sistema global.
│
│ *Explora los clanes y sube de rango con estilo:*
╰─────────────────
  `.trim()

  // Botones de acceso rápido
  const buttons = [
    { buttonId: `${usedPrefix}veropciones`, buttonText: { displayText: '⚙️ Configurar Bot' } },
    { buttonId: `${usedPrefix}listaclanes`, buttonText: { displayText: '🏰 Ver Clanes' } },
    { buttonId: `${usedPrefix}verinfoclan`, buttonText: { displayText: '🛡️ Mi Clan' } },
    { buttonId: `${usedPrefix}tiendaclan`, buttonText: { displayText: '🛒 Tienda' } }
  ]

  await conn.sendMessage(m.chat, {
    image: { url: logo },
    caption: body,
    footer: `『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡`,
    buttons,
    viewOnce: true,
    headerType: 4,
  }, { quoted: m })
}

handler.command = ['actualizaciones', 'novedades', 'nuevos']
handler.tags = ['info']
handler.desc = 'Bienvenida a v1.3 con estilo mejorado (bordes, emojis, espacios)'
handler.register = true

export default handler