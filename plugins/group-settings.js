let handler = async (m, { conn, command }) => {
    let isClose = { 
        'open': 'not_announcement', 
        'abrir': 'not_announcement', 
        'close': 'announcement', 
        'cerrar': 'announcement', 
    }[command]

    try {
        await conn.groupSettingUpdate(m.chat, isClose)

        if (isClose === 'not_announcement') {
            const textoOpen = `
🔔 *VILLA ABIERTA* 🔔
━━━━━━━━━━━━━━━━━━━━━━━
¡Ho Ho Ho! Las puertas del taller se han abierto. Todos los elfos pueden escribir y compartir su alegría.

❄️ *Estado:* Chat Libre
✨ *Acción:* Todos pueden participar
━━━━━━━━━━━━━━━━━━━━━━━`.trim()
            
            await m.reply(textoOpen)
            await m.react('🔓')

        } else {
            const textoClose = `
🤫 *SILENCIO EN LA VILLA* 🤫
━━━━━━━━━━━━━━━━━━━━━━━
Las puertas se han cerrado. Es hora de trabajar en silencio, solo los **Elfos Mayores** (Admins) pueden hablar.

❄️ *Estado:* Solo Admins
🛡️ *Acción:* Chat Restringido
━━━━━━━━━━━━━━━━━━━━━━━`.trim()

            await m.reply(textoClose)
            await m.react('🔒')
        }
    } catch (e) {
        m.reply(`⚠️ *¡Los cerrojos están trabados!* No se pudo cambiar el estado.\n${e.message}`)
    }
}

handler.help = ['abrir', 'cerrar']
handler.tags = ['grupo']
handler.command = /^(open|abrir|close|cerrar)$/i
handler.admin = true
handler.botAdmin = true
handler.group = true

export default handler
