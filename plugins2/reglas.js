let handler = async (m, { conn, text, usedPrefix, command, isAdmin }) => {
  // Verificar que sea un grupo
  if (!m.isGroup) {
    return m.reply('✧ Este comando solo puede usarse en grupos.')
  }

  const chatId = m.chat
  
  // Inicializar base de datos si no existe
  global.db.data.chats[chatId] = global.db.data.chats[chatId] || {}
  
  // Si hay texto, establecer las reglas (solo admins)
  if (text) {
    if (!isAdmin) {
      return m.reply('✧ Solo los administradores pueden establecer las reglas del grupo.')
    }
    
    global.db.data.chats[chatId].rules = text
    await m.react('✔️')
    return m.reply('✧ Las reglas del grupo han sido establecidas correctamente.')
  }
  
  // Mostrar las reglas
  const rules = global.db.data.chats[chatId].rules
  
  // Obtener la foto del grupo
  let groupMetadata = await conn.groupMetadata(chatId)
  let groupPicture
  try {
    groupPicture = await conn.profilePictureUrl(chatId, 'image')
  } catch {
    groupPicture = 'https://i.imgur.com/8FZ7u8z.png'
  }
  
  if (rules) {
    // Si hay reglas guardadas, mostrarlas
    let mensaje = `╭━━━━━━━━━⬣
┃ *📋 REGLAS DEL GRUPO*
╰━━━━━━━━━⬣\n\n`
    mensaje += rules
    mensaje += `\n\n╭━━━━━━━━━⬣
┃ ⚠️ *Por favor, respeta estas reglas*
╰━━━━━━━━━⬣`
    
    await conn.sendMessage(m.chat, { 
      text: mensaje,
      contextInfo: {
        externalAdReply: {
          title: '📋 Reglas del Grupo',
          body: 'Normativas y conductas',
          thumbnailUrl: groupPicture,
          sourceUrl: '',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })
  } else {
    // Si no hay reglas guardadas, mostrar descripción del grupo
    let descripcion = groupMetadata.desc || 'Sin descripción'
    
    let mensaje = `╭━━━━━━━━━⬣
┃ *📋 INFORMACIÓN DEL GRUPO*
╰━━━━━━━━━⬣\n\n`
    mensaje += `*Descripción:*\n${descripcion}`
    mensaje += `\n\n╭━━━━━━━━━⬣
┃ ℹ️ *Este grupo no tiene reglas establecidas*
┃ 
┃ Los administradores pueden establecerlas usando:
┃ ${usedPrefix + command} [texto de las reglas]
╰━━━━━━━━━⬣`
    
    await conn.sendMessage(m.chat, { 
      text: mensaje,
      contextInfo: {
        externalAdReply: {
          title: '📋 Descripción del Grupo',
          body: 'No hay reglas establecidas',
          thumbnailUrl: groupPicture,
          sourceUrl: '',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })
  }
}

handler.help = ['reglas']
handler.tags = ['group']
handler.command = ['reglas', 'reglasgrupo', 'regla']
handler.group = true

export default handler