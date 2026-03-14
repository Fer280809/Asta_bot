let handler = async (m, { conn, usedPrefix }) => {
    const user = global.db.data.users[m.sender]
    
    if (!user || !user.registered) {
        return conn.reply(m.chat, `❌ *No estás registrado*\n\nUsa *${usedPrefix}reg nombre/edad* para registrarte.`, m)
    }
    
    let status = `📋 *ESTADO DE TU REGISTRO*\n\n`
    status += `┌─「 *INFORMACIÓN* 」\n`
    status += `├ ✅ *Registrado:* Sí\n`
    status += `├ 👤 *Nombre:* ${user.name || '❌ No definido'}\n`
    status += `├ 🎂 *Edad:* ${user.age || '❌ No definida'}\n`
    status += `├ ⚥ *Género:* ${user.genre || '❌ No definido'}\n`
    status += `├ 🎉 *Cumpleaños:* ${user.birth || '❌ No definido'}\n`
    status += `├ 🆔 *Serial:* ${user.serial || 'N/A'}\n`
    status += `└────────────────\n\n`
    
    const faltantes = []
    if (!user.name) faltantes.push('Nombre')
    if (!user.age) faltantes.push('Edad')
    if (!user.genre) faltantes.push('Género')
    if (!user.birth) faltantes.push('Cumpleaños')
    
    if (faltantes.length > 0) {
        status += `⚠️ *Datos faltantes:* ${faltantes.join(', ')}\n`
        status += `> Usa *${usedPrefix}reg* para completarlos sin perder tu progreso.`
    } else {
        status += `✨ *¡Registro 100% completo!*`
    }
    
    await conn.reply(m.chat, status, m)
}

handler.help = ['verifyreg']
handler.tags = ['rg']
handler.command = ['verifyreg', 'checkreg', 'miregistro']

export default handler
