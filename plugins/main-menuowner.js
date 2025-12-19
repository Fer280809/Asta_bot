import moment from 'moment-timezone'

let handler = async (m, { conn, args }) => {
    // Evitar envío duplicado
    if (m.id.startsWith('NJX-') || (m.id.startsWith('BAE5') && m.id.length === 16) || (m.id.startsWith('B24E') && m.id.length === 20)) {
        return
    }

    let userId = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
    let user = global.db.data.users[userId]
    let name = conn.getName(userId)
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)
    let totalreg = Object.keys(global.db.data.users).length
    let totalCommands = Object.values(global.plugins).filter((v) => v.help && v.tags).length
    
    // URL de la imagen del menú
    let menuImage = 'https://files.catbox.moe/lajq7h.jpg'
    
    let txt = `👑 *${botname} - PANEL OWNER* 👑

╔════════════════════════╗
     📡 *ESTADO DEL SISTEMA*
╚════════════════════════╝

┌─🤖 *Estado:* ${(conn.user.jid == global.conn.user.jid ? '🟢 PREMIUM' : '🔗 PREM-BOT')}
├─⚡ *Activo:* ${uptime}
├─👥 *Usuarios:* ${totalreg}
├─🛠️ *Comandos:* ${totalCommands}
├─📅 *Fecha:* ${moment().tz('America/Mexico_City').format('DD/MM/YYYY')}
├─🕐 *Hora:* ${moment().tz('America/Mexico_City').format('HH:mm:ss')}
├─🌍 *Servidor:* México 🇲🇽
├─📡 *Ping:* Online ✅
├─💾 *Memoria:* Estable 📊
└─🔒 *Modo:* Privado 🔐

╔════════════════════════╗
     🔑 *GESTIÓN OWNERS*
╚════════════════════════╝

┌─🔸 *#addowner* [@usuario]
│  ╰─ Agregar nuevo owner
├─🔸 *#delowner* [@usuario]
│  ╰─ Eliminar owner
└─🔸 *#codigo*
   ╰─ Generar código de sub-bot

╔════════════════════════╗
     💾 *ARCHIVOS Y DATOS*
╚════════════════════════╝

┌─🔹 *#backup* / *#copia*
│  ╰─ Crear copia de seguridad
├─🔹 *#cleanfiles* / *#dsowner*
│  ╰─ Limpiar archivos temporales
├─🔹 *#cleartmp* / *#vaciartmp*
│  ╰─ Vaciar carpeta temporal
├─🔹 *#deletefile* [nombre]
│  ╰─ Eliminar archivo específico
└─🔹 *#deletedatauser* [@usuario]
   ╰─ Resetear datos de usuario

╔════════════════════════╗
     💰 *ECONOMÍA Y PREMIUM*
╚════════════════════════╝

┌─🔸 *#addcoins* [@usuario] [cantidad]
│  ╰─ Agregar coins a usuario
├─🔸 *#añadircoin* [@usuario] [cantidad]
│  ╰─ Alternativa para agregar coins
├─🔸 *#removecoin* / *#quitarcoin* [@usuario] [cantidad]
│  ╰─ Quitar coins a usuario
├─🔸 *#addexp* [@usuario] [cantidad]
│  ╰─ Agregar experiencia
├─🔸 *#removexp* / *#quitarxp* [@usuario] [cantidad]
│  ╰─ Quitar experiencia
├─🔸 *#addprem* [@usuario] [tiempo]
│  ╰─ Agregar premium a usuario
├─🔸 *#delprem* / *#remove* [@usuario]
│  ╰─ Quitar premium a usuario
└─🔸 *#userpremium* [@usuario]
   ╰─ Ver estado premium

╔════════════════════════╗
     📢 *COMUNICACIÓN*
╚════════════════════════╝

┌─🔹 *#bcgc* [mensaje]
│  ╰─ Broadcast a todos los grupos
├─🔹 *#let* [mensaje]
│  ╰─ Enviar mensaje como anuncio
├─🔹 *#reunion* [link]
│  ╰─ Crear reunión/conferencia
└─🔹 *#meeting* [link]
   ╰─ Alternativa para reunión

╔════════════════════════╝
     🚫 *SISTEMA DE BANEOS*
╚════════════════════════╗

┌─🔐 *Solo Fernando:*
│ ├─🔸 *#banned* [usuario] [tiempo] [razón]
│ │  ╰─ Banear usuario (tiempo: 1h, 2d, permanente)
│ ├─🔸 *#unban* [usuario]
│ │  ╰─ Desbanear usuario
│ └─🔸 *#horaban*
│    ╰─ Ver tu tiempo de baneo
├─👥 *Todos los usuarios:*
│ └─🔸 *#horaban*
│    ╰─ Ver tu tiempo de baneo
└─👑 *Owners:*
   ├─🔸 *#checkban* [usuario]
   │  ╰─ Revisar ban de usuario
   ├─🔸 *#banlist*
   │  ╰─ Lista de baneos
   ├─🔸 *#block* [usuario]
   │  ╰─ Bloquear usuario en el bot
   ├─🔸 *#unblock* [usuario]
   │  ╰─ Desbloquear usuario
   └─🔸 *#blocklist*
      ╰─ Lista de bloqueados

*📌 Ejemplos de uso:*
• *#banned @usuario 7d Spam*
• *#banned 521234567890 2h 30m Mal comportamiento*
• *#banned @usuario permanente*
• *#unban @usuario*
• *#horaban* (ver tu tiempo de baneo)

╔════════════════════════╗
    🤖 *AUTOMATIZACIÓN*
╚════════════════════════╝

┌─🔸 *#autoadmin*
│  ╰─ Activar/desactivar auto-admin
└─🔸 *#resetuser* [@usuario]
   ╰─ Resetear usuario completamente

╔════════════════════════╗
  👥 *GESTIÓN DE GRUPOS*
╚════════════════════════╝

┌─🔹 *#newgc* / *#creargc*
│  ╰─ Crear nuevo grupo
├─🔹 *#grouplist* / *#listgroup*
│  ╰─ Lista de grupos del bot
├─🔹 *#join* [invitación]
│  ╰─ Unir bot a un grupo
└─🔹 *#leave* / *#salir*
   ╰─ Sacar bot de un grupo

╔════════════════════════╗
    🌐 *WEB Y PLUGINS*
╚════════════════════════╝

┌─🔸 *#get* [url]
│  ╰─ Obtener contenido de URL
├─🔸 *#fetch* [url]
│  ╰─ Alternativa para obtener URL
├─🔸 *#plugin* [nombre]
│  ╰─ Obtener plugin por nombre
└─🔸 *#getplugin* [nombre]
   ╰─ Alternativa para obtener plugin

╔════════════════════════╗
   ⚙️ *CONFIGURACIÓN*
╚════════════════════════╝

┌─🔹 *#prefix* [nuevo]
│  ╰─ Cambiar prefijo del bot
├─🔹 *#resetprefix*
│  ╰─ Restablecer prefijo por defecto
├─🔹 *#reiniciar* / *#restart*
│  ╰─ Reiniciar el bot
├─🔹 *#setbanner* [imagen]
│  ╰─ Establecer banner del bot
├─🔹 *#setavatar* / *#setpfp2* [imagen]
│  ╰─ Cambiar avatar del bot
├─🔹 *#setimage2* [imagen]
│  ╰─ Establecer imagen del menú
├─🔹 *#setmoneda* [símbolo]
│  ╰─ Cambiar símbolo de moneda
├─🔹 *#setname* [nombre]
│  ╰─ Cambiar nombre del bot
├─🔹 *#setbio2* / *#setstatus2* [texto]
│  ╰─ Cambiar biografía del bot
└─🔹 *#update*
   ╰─ Actualizar el bot

╔════════════════════════╗
  💾 *COMANDOS CUSTOM*
╚════════════════════════╝

┌─🔸 *#addcmd* / *#setcmd* [nombre] [texto]
│  ╰─ Agregar comando personalizado
├─🔸 *#delcmd* [nombre]
│  ╰─ Eliminar comando personalizado
├─🔸 *#cmdlist* / *#listcmd*
│  ╰─ Listar comandos personalizados
├─🔸 *#editarplugin* [nombre]
│  ╰─ Editar plugin existente
├─🔸 *#subirplugin* [nombre]
│  ╰─ Subir nuevo plugin
├─🔸 *#eliminarplugin* [nombre]
│  ╰─ Eliminar plugin
├─🔸 *#saveplugin* / *#svp* [nombre]
│  ╰─ Guardar plugin
├─🔸 *#descargarplugins* / *#descargarplugin*
│  ╰─ Descargar todos los plugins
└─🔸 *#updateplugin*
   ╰─ Actualizar plugin específico

╭─────────────────────────╮
│ ✨ *Usa con responsabilidad*
│ 🔒 *Sistema de baneos mejorado*
│ ⏱️ *Soporta baneos temporales*
╰─────────👑 OWNER 👑─────╯`

    try {
        await conn.sendMessage(m.chat, {
            image: { url: menuImage },
            caption: txt,
            mentions: [userId]
        }, { quoted: m })
    } catch (error) {
        console.error('Error al enviar la imagen:', error)
        await conn.sendMessage(m.chat, { 
            text: txt,
            mentions: [userId]
        }, { quoted: m })
    }
}

handler.help = ['mods']
handler.tags = ['main']
handler.command = ['dev', 'owners']
handler.rowner = true

export default handler

function clockString(ms) {
    let seconds = Math.floor((ms / 1000) % 60)
    let minutes = Math.floor((ms / (1000 * 60)) % 60)
    let hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
    return `${hours}h ${minutes}m ${seconds}s`
}
