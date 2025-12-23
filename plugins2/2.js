let handler = async (m, { conn, usedPrefix, command }) => {
  let message = `📚 *TUTORIAL - SISTEMA DE SUPERVIVENCIA* 🎄\n\n`
  
  message += `🎯 *¿CÓMO EMPEZAR?*\n`
  message += `1. Compra una herramienta básica en la tienda\n`
  message += `2. Usa el comando de la actividad\n`
  message += `3. Junta recursos\n`
  message += `4. Mejora tus herramientas\n`
  message += `5. Vende lo que no necesites\n\n`
  
  message += `🛠️ *HERRAMIENTAS NECESARIAS:*\n`
  message += `• 🪓 Talar → Necesitas Hacha\n`
  message += `• 🏹 Cazar → Necesitas Arco y Flechas\n`
  message += `• 🎣 Pescar → Necesitas Caña\n`
  message += `• ⛏️ Minar → Necesitas Pico\n\n`
  
  message += `💎 *SISTEMA DE NIVELES:*\n`
  message += `• Cada actividad tiene su nivel\n`
  message += `• Subes nivel usando la actividad\n`
  message += `• Nivel alto = Mejores recompensas\n\n`
  
  message += `⚡ *ENERGÍA Y SALUD:*\n`
  message += `• Cada acción consume energía\n`
  message += `• Algunas acciones reducen salud\n`
  message += `• Usa comida para recuperar\n\n`
  
  message += `🛒 *ECONOMÍA:*\n`
  message += `• Vende recursos en ${usedPrefix}vender\n`
  message += `• Compra en ${usedPrefix}tienda\n`
  message += `• Administra tu ${usedPrefix}inventario\n\n`
  
  message += `🔧 *COMANDOS PRINCIPALES:*\n`
  message += `• ${usedPrefix}talar - Talar árboles\n`
  message += `• ${usedPrefix}cazar - Cazar animales\n`
  message += `• ${usedPrefix}pescar - Pescar\n`
  message += `• ${usedPrefix}minar - Minar minerales\n`
  message += `• ${usedPrefix}tienda - Comprar/vender\n`
  message += `• ${usedPrefix}craft - Craftear items\n`
  message += `• ${usedPrefix}inventario - Ver recursos\n\n`
  
  message += `❓ *¿PROBLEMAS?*\n`
  message += `• Verifica que tengas la herramienta\n`
  message += `• Revisa tu energía/salud\n`
  message += `• Usa ${usedPrefix}inventario para ver recursos`

  await conn.reply(m.chat, message, m)
}

handler.help = ['tutorial', 'ayuda', 'help', 'guia']
handler.tags = ['info']
handler.command = ['tutorial', 'ayuda', 'help', 'guia']
export default handler