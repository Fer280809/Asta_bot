const handler = async (m, { conn, usedPrefix }) => {
  const logo = 'https://files.catbox.moe/nqvhaq.jpg'

  const body = `╭─◉ 🎄 *¡ACTUALIZACIÓN NAVIDEÑA 1.5!* ◉─╮
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
│ 🎄 *NUEVOS COMANDOS NAVIDEÑOS:*
│
│ 🍪 *${usedPrefix}receta*
│ • Recetas navideñas paso a paso
│ • Incluye enlace a video tutorial
│ • Diferentes recetas cada día
│
│ 🎵 *${usedPrefix}ttnavi* o *${usedPrefix}villancico*
│ • Escucha villancicos navideños
│ • Recibe audio + foto de la canción
│ • Colección completa de villancicos
│
│ 🍩 *${usedPrefix}rascadona*
│ • Rasca una dona y gana premios
│ • Premios diarios disponibles
│ • Recompensas aleatorias
│
│ 📅 *${usedPrefix}calendario*
│ • Reclama recompensa diaria
│ • Bonos por racha consecutiva
│ • Premios especiales navideños
│
│ 😂 *${usedPrefix}chiste*
│ • Chistes navideños y bromas
│ • Diferente chiste cada vez
│ • Perfecto para reír en familia
│
│ 📜 *${usedPrefix}reglas* o *${usedPrefix}regla*
│ • Muestra las reglas del grupo
│ • Agrega nuevas reglas
│ • Edita o elimina reglas existentes
│ • Solo administradores pueden modificar
│
│ ⚡ *¿CÓMO EMPEZAR?*
│ 1. Compra una herramienta básica
│ 2. Usa el comando de la actividad
│ 3. Junta recursos
│ 4. Mejora tus herramientas
│ 5. Participa en eventos
│
│ 🎁 *Recompensa diaria:*
│ • Usa *${usedPrefix}calendario* cada día
│ • Acumula días para premios mayores
│ • No pierdas tu racha
│
╰─────────────────────────────────╯
`.trim()

  const buttons = [
    { buttonId: `${usedPrefix}tienda`, buttonText: { displayText: '🛍️ Tienda' }, type: 1 },
    { buttonId: `${usedPrefix}calendario`, buttonText: { displayText: '📅 Calendario' }, type: 1 },
    { buttonId: `${usedPrefix}rascadona`, buttonText: { displayText: '🍩 Rascar Dona' }, type: 1 },
    { buttonId: `${usedPrefix}villancico`, buttonText: { displayText: '🎵 Villancicos' }, type: 1 },
    { buttonId: `${usedPrefix}reglas`, buttonText: { displayText: '📜 Reglas' }, type: 1 },
    { buttonId: `${usedPrefix}tutorial`, buttonText: { displayText: '📚 Ayuda' }, type: 1 }
  ]

  try {
    await conn.sendMessage(m.chat, {
      image: { url: logo },
      caption: body,
      footer: '🎅 ASTA-BOT - VERSIÓN NAVIDEÑA 1.5',
      buttons: buttons,
      headerType: 4
    }, { quoted: m })
  } catch (error) {
    // Fallback sin imagen
    await conn.sendMessage(m.chat, {
      text: body,
      footer: '🎅 ASTA-BOT - VERSIÓN NAVIDEÑA 1.5',
      buttons: buttons
    }, { quoted: m })
  }
}

handler.help = ['actualizaciones', 'novedades', 'update']
handler.tags = ['info']
handler.command = ['actualizaciones', 'novedades', 'nuevo']
export default handler
