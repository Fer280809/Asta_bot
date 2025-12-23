const handler = async (m, { conn, usedPrefix }) => {
  const logo = 'https://files.catbox.moe/j7gfwf.jpg'

  const body = `╭─◉ 🎄 *¡ACTUALIZACIÓN NAVIDEÑA 1.4!* ◉─╮
│
│ ❄️ *¡Santa trajo nuevos sistemas para ti!*
│
│ 🪓 *NUEVO: SISTEMA DE TALAR*
│ • Usa: *${usedPrefix}talar*
│ • Corta árboles navideños
│ • Consigue madera, manzanas, brotes
│ • Necesitas hacha (compra o craftea)
│
│ 🏹 *NUEVO: SISTEMA DE CAZAR*
│ • Usa: *${usedPrefix}cazar*
│ • Caza animales invernales
│ • Consigue carne, cuero, plumas
│ • Necesitas arco y flechas
│
│ 🎣 *NUEVO: SISTEMA DE PESCAR*
│ • Usa: *${usedPrefix}pescar*
│ • Pesca en lagos congelados
│ • Consigue pescado, tesoros, perlas
│ • Necesitas caña de pescar
│
│ ⛏️ *MINERÍA MEJORADA*
│ • Usa: *${usedPrefix}minar*
│ • 5 tipos de picos mejorados
│ • Carbón, hierro, oro, diamantes
│ • Sistema de durabilidad
│
│ 🛍️ *TIENDA NAVIDEÑA*
│ • Usa: *${usedPrefix}tienda*
│ • Compra herramientas
│ • Vende recursos por monedas
│ • Precios especiales navideños
│
│ ⚒️ *SISTEMA DE CRAFTEO*
│ • Usa: *${usedPrefix}craft*
│ • Crea herramientas
│ • Mejora equipos
│ • Recetas navideñas
│
│ 🎒 *INVENTARIO MEJORADO*
│ • Usa: *${usedPrefix}inventario*
│ • Ver todos tus recursos
│ • Organizado por categorías
│ • Sistema de almacenamiento
│
│ 🎁 *MECÁNICAS NUEVAS:*
│ • Energía y salud
│ • Durabilidad de herramientas
│ • Niveles de habilidad
│ • Eventos diarios navideños
│
│ ⚡ *¿CÓMO EMPEZAR?*
│ 1. Compra una herramienta básica
│ 2. Usa el comando de la actividad
│ 3. Junta recursos
│ 4. Mejora tus herramientas
│ 5. Participa en eventos
│
╰─────────────────────────────────╯
`.trim()

  const buttons = [
    { buttonId: `${usedPrefix}tienda`, buttonText: { displayText: '🛍️ Tienda' }, type: 1 },
    { buttonId: `${usedPrefix}craft`, buttonText: { displayText: '⚒️ Crafteo' }, type: 1 },
    { buttonId: `${usedPrefix}inventario`, buttonText: { displayText: '🎒 Inventario' }, type: 1 },
    { buttonId: `${usedPrefix}tutorial`, buttonText: { displayText: '📚 Ayuda' }, type: 1 }
  ]

  try {
    await conn.sendMessage(m.chat, {
      image: { url: logo },
      caption: body,
      footer: '🎅 ASTA-BOT - VERSIÓN NAVIDEÑA 1.4',
      buttons: buttons,
      headerType: 4
    }, { quoted: m })
  } catch (error) {
    // Fallback sin imagen
    await conn.sendMessage(m.chat, {
      text: body,
      footer: '🎅 ASTA-BOT - VERSIÓN NAVIDEÑA 1.4',
      buttons: buttons
    }, { quoted: m })
  }
}

handler.help = ['actualizaciones', 'novedades', 'update']
handler.tags = ['info']
handler.command = ['actualizaciones', 'novedades', 'update', 'nuevo']
export default handler
