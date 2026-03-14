const handler = async (m, { conn, usedPrefix }) => {
  const logo = 'https://files.catbox.moe/r5ah9z.jpg'
  const body = `╭─◉ 🎉 *ACTUALIZACIÓN 1.5 - SISTEMA COMPLETO* ◉
│
│ ✨ *¡Nuevas funciones y mejoras importantes!*
│
│ 💰 *SISTEMA DE ECONOMÍA COMPLETO:*
│
│ 🛒 Comando #shop - Tienda principal con categorías
│ 🔨 Comando #craft - Sistema de crafteo para crear items
│ 🎒 Comando #inv - Ver tu inventario de recursos
│ ⛏️ Comando #minar - Minar minerales y gemas
│ 🌲 Comando #talar - Talar árboles para obtener madera
│ 🎣 Comando #pescar - Pescar diferentes tipos de peces
│ 🌾 Comando #cultivar - Cultivar plantas y alimentos
│ 🔍 Comando #buscar - Buscar recursos especiales
│
│ 📊 *CATEGORÍAS DISPONIBLES:*
│ • Minerales: Hierro, Oro, Diamante, Esmeralda
│ • Herramientas: Picos, Hachas, Cañas de pescar
│ • Pociones: Velocidad, Suerte, Regeneración
│ • Cebos y semillas
│ • Equipo y decoraciones
│
│ 🤖 *BOT EDITABLE (SUBBOTS):*
│
│ 🔧 Comando #config - Configurar tu SubBot personal
│ 🎨 Cambiar nombre, prefijo y logo
│ ⚙️ Modos: público/privado, solo grupos
│ 🔄 Auto-reconexión automática
│ 🖼️ Logo personalizado con URL o imágenes
│ 🔒 Sistema de permisos por dueño
│
│ ⚡ *CONFIGURACIONES DISPONIBLES:*
│ • #config prefix <nuevo> - Cambiar prefijo
│ • #config name <nombre> - Cambiar nombre del bot
│ • #config logo [url] - Cambiar logo (URL o imagen)
│ • #config mode <public/private> - Cambiar modo
│ • #config gponly <on/off> - Solo grupos
│ • #config antiprivate <on/off> - Anti mensajes privados
│ • #config autoreconnect <on/off> - Auto-reconexión
│ • #config restart - Reiniciar SubBot
│ • #config reset - Restablecer configuración
│
│ 🛠️ *OTRAS MEJORAS:*
│
│ • 📈 Sistema de niveles para actividades
│ • 🏆 Logros y recompensas por progreso
│ • 🔄 Reciclaje de items para materiales
│ • 📊 Estadísticas detalladas
│ • 🎁 Cajas sorpresa con recursos
│ • ⚡ Mayor estabilidad y rendimiento
│ • 🐛 Corrección de múltiples errores
│
│ *¡Más funciones y actualizaciones próximamente!*
╰─────────────────
  `.trim()

  // Botones interactivos
  const buttons = [
    { buttonId: `${usedPrefix}shop`, buttonText: { displayText: '🛒 TIENDA' }, type: 1 },
    { buttonId: `${usedPrefix}craft`, buttonText: { displayText: '🔨 CRAFT' }, type: 1 },
    { buttonId: `${usedPrefix}inv`, buttonText: { displayText: '🎒 INVENTARIO' }, type: 1 },
    { buttonId: `${usedPrefix}minar`, buttonText: { displayText: '⛏️ MINAR' }, type: 1 },
    { buttonId: `${usedPrefix}config`, buttonText: { displayText: '⚙️ CONFIG' }, type: 1 },
    { buttonId: `${usedPrefix}menu`, buttonText: { displayText: '📋 MENÚ' }, type: 1 }
  ]

  await conn.sendMessage(m.chat, {
    image: { url: logo },
    caption: body,
    footer: `『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡ | v1.5`,
    buttons: buttons,
    headerType: 1
  }, { quoted: m })
}

handler.command = ['actualizaciones', 'novedades', 'nuevos', 'updateinfo', 'news', 'actualización']
handler.tags = ['info']
handler.desc = 'Actualización 1.5 - Sistema de economía completo + Bot editable'
handler.register = true

export default handler