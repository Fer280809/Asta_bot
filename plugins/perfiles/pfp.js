let handler = async (m, { conn, text }) => {
  let who
  
  // 1. Si hay una mención directa
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    who = m.mentionedJid[0]
  } 
  // 2. Si está respondiendo a un mensaje
  else if (m.quoted) {
    who = m.quoted.sender
  }
  // 3. Si se envía un número como texto después del comando
  else if (text) {
    // Extraer números del texto
    let num = text.replace(/[^0-9]/g, '')
    if (num.length > 10) {
      // Añadir @c.us al final si no lo tiene
      who = num.replace(/[^0-9]/g, '') + '@c.us'
    } else {
      return conn.sendMessage(m.chat, { text: '❀ Por favor, envía un número de teléfono válido (ejemplo: 521234567890)' }, { quoted: m })
    }
  }
  // 4. Si no hay ninguna de las anteriores
  else {
    who = m.sender // Foto del propio usuario
  }
  
  try {
    let name = await (async () => {
      try {
        const n = await conn.getName(who)
        return typeof n === 'string' && n.trim() ? n : who.split('@')[0]
      } catch {
        return who.split('@')[0]
      }
    })()
    
    let pp = await conn.profilePictureUrl(who, 'image').catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')
    
    await m.react('🕒')
    await conn.sendFile(m.chat, pp, 'profile.jpg', `❀ *Foto de perfil de ${name}*`, m)
    await m.react('✔️')
    
  } catch (error) {
    console.error(error)
    await m.react('❌')
    conn.sendMessage(m.chat, { text: '❀ No se pudo obtener la foto de perfil. El usuario podría no tener foto o el número no está registrado en WhatsApp.' }, { quoted: m })
  }
}

handler.help = ['pfp [@usuario|número|respondiendo]']
handler.tags = ['sticker', 'tools']
handler.command = /^(pfp|getpic|fotoperfil|profilepic)$/i
handler.reg = true

export default handler
