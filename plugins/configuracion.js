const handler = async (m, { conn, usedPrefix }) => {
  console.log('=== MENÚ OPCIONES ABIERTO ===')
  
  const chat = global.db.data.chats[m.chat] || {}
  
  const defaults = {
    welcome: false,
    modoadmin: false,
    detect: false,
    antilink: false,
    nsfw: false,
    economy: false,
    rpg: false,
    antispam: false
  }
  
  for (const [key, value] of Object.entries(defaults)) {
    if (chat[key] === undefined) chat[key] = value
  }
  
  const opciones = [
    { nombre: 'welcome', titulo: 'Bienvenida', estado: chat.welcome },
    { nombre: 'modoadmin', titulo: 'Modo Admin', estado: chat.modoadmin },
    { nombre: 'detect', titulo: 'Alertas', estado: chat.detect },
    { nombre: 'antilink', titulo: 'Anti-Enlaces', estado: chat.antilink },
    { nombre: 'nsfw', titulo: 'NSFW', estado: chat.nsfw },
    { nombre: 'economy', titulo: 'Economía', estado: chat.economy },
    { nombre: 'rpg', titulo: 'RPG/Gacha', estado: chat.rpg },
    { nombre: 'antispam', titulo: 'Anti-Spam', estado: chat.antispam }
  ]
  
  let lista = opciones.map((op, i) => {
    const icon = op.estado ? '✅' : '❌'
    return `${i + 1}. ${icon} *${op.titulo}*`
  }).join('\n')
  
  let buttons = opciones.map(op => {
    const nuevoEstado = op.estado ? 'off' : 'on'
    const textoBoton = op.estado ? '🔴 Apagar' : '🟢 Prender'
    const buttonId = `${usedPrefix}${op.nombre}${nuevoEstado}`
    
    console.log('🔘 Botón creado:', buttonId)
    
    return {
      buttonId: buttonId,
      buttonText: { displayText: `${textoBoton} ${op.titulo}` },
      type: 1
    }
  })
  
  const txt = `╭─◉ ⚙️ *OPCIONES DEL BOT* ◉
│
│ 📊 Estado actual de las funciones:
│
${lista}
│
│ 💡 Presiona un botón para cambiar:
│
│ ℹ️ Para Anti-Privado usa: ${usedPrefix}antiprivate
╰─────────────────`
  
  await conn.sendMessage(m.chat, {
    text: txt,
    footer: `『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡`,
    buttons: buttons,
    viewOnce: false,
    headerType: 1
  }, { quoted: m })
}

handler.command = ['veropciones', 'opciones', 'settings', 'config']
handler.tags = ['config']
handler.help = ['opciones']
handler.desc = 'Ver y controlar todas las opciones del bot con botones'
handler.register = true
handler.group = true

export default handler