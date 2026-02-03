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
    
    let txt = `🌟⭐ *${botname}* ⭐🌟
   
╭─━━━━━━━━━━━━━━━─╮
│ 🎭 ¡Hola @${userId.split('@')[0]}! 💖
╰─━━━━━━━━━━━━━━━─╯

╭─═⊰ 📡 𝐄𝐒𝐓𝐀𝐃𝐎 𝐀𝐂𝐓𝐈𝐕𝐎
│ 🤖 Estado: ${(conn.user.jid == global.conn.user.jid ? '🟢 PREMIUM ' : '🔗 prem-ʙᴏᴛ')}
│ ⚡ Activo: 『${uptime}』
│ 👥 Users: 『${totalreg}』🔥
│ 🛠️ Comandos: 『${totalCommands}』⚙️
│ 📅 Fecha: ${moment().tz('America/Mexico_City').format('DD/MM/YYYY')}
│ 🕐 Hora: ${moment().tz('America/Mexico_City').format('HH:mm:ss')}
│ 🌍 Servidor: México 🇲🇽
│ 📡 Ping: Online ✅
│ 💾 Memoria: Estable 📊
│ 🔒 Modo: Privado 🔐
╰───────────────╯

═══════ 📋 *MENÚ OWNER* 📋 ═══════

╭─⊷ *👑 GESTIÓN DE OWNERS*
│ • addowner - Añadir nuevo owner
│ • delowner - Eliminar owner
│ • codigo - Crear códigos de recompensa
╰─⊷

╭─⊷ *💰 ECONOMÍA*
│ • addcoins - Añadir coins a usuario
│ • añadircoin - Alias de addcoins
│ • userpremium - Añadir usuario premium
│ • addprem - Alias de userpremium
│ • delprem - Eliminar premium de usuario
│ • remove - Alias de delprem
│ • addexp - Añadir experiencia a usuario
│ • añadirxp - Alias de addexp
│ • removecoin - Quitar coins a usuario
│ • quitarcoin - Alias de removecoin
│ • deletedatauser - Eliminar datos de usuario
│ • resetuser - Resetear usuario
│ • removexp - Quitar experiencia a usuario
│ • quitarxp - Alias de removexp
│ • chetar - Dar recursos máximos a usuario
│ • deschetar - Quitar todos los recursos
│ • ownerpay - Transferir coins entre usuarios
╰─⊷

╭─⊷ *🚫 SISTEMA DE BANEOS*
│ • banned - Banear usuario (solo Fernando)
│ • unban - Desbanear usuario (solo Fernando)
│ • horaban - Ver tiempo restante de baneo
│ • checkban - Verificar estado de baneo
│ • banlist - Lista de usuarios baneados
│ • block - Bloquear usuario en WhatsApp
│ • unblock - Desbloquear usuario en WhatsApp
│ • blocklist - Lista de bloqueados
╰─⊷

╭─⊷ *👥 GESTIÓN DE GRUPOS*
│ • creargc - Crear nuevo grupo
│ • newgc - Alias de creargc
│ • grouplist - Listar grupos del bot
│ • listgroup - Alias de grouplist
│ • leave - Salir del grupo
│ • salir - Alias de leave
│ • leavegc - Alias de leave
│ • deleteuser - Eliminar mensajes de usuario
│ • deluser - Alias de deleteuser
╰─⊷

╭─⊷ *⚙️ CONFIGURACIÓN DEL BOT*
│ • prefix - Cambiar prefijo del bot
│ • resetprefix - Restablecer prefijo
│ • restart - Reiniciar el bot
│ • reiniciar - Alias de restart
│ • setpfpbot - Cambiar foto de perfil del bot
│ • setppbot - Alias de setpfpbot
│ • setstatus2 - Cambiar biografía del bot
│ • setbio2 - Alias de setstatus2
│ • setmoneda - Cambiar nombre de la moneda
│ • update - Actualizar el bot desde GitHub
│ • actualizar - Alias de update
╰─⊷

╭─⊷ *💾 ARCHIVOS Y SISTEMA*
│ • backup - Crear copia de seguridad
│ • copia - Alias de backup
│ • cleanfiles - Limpiar archivos temporales
│ • cleartmp - Alias de cleanfiles
│ • vaciartmp - Alias de cleartmp
│ • delai - Eliminar archivos de sesión
│ • dsowner - Alias de delai
│ • borrartmp - Alias de cleartmp
╰─⊷

╭─⊷ *📢 COMUNICACIÓN*
│ • aviso - Enviar broadcast a todos los grupos
│ • broadcast - Alias de aviso
│ • bc - Alias de aviso
│ • reunion - Notificar reunión a owners
│ • meeting - Alias de reunion
│ • spam2 - Enviar spam a un grupo
╰─⊷

╭─⊷ *🔧 COMANDOS CUSTOM*
│ • setcmd - Añadir comando a sticker
│ • addcmd - Alias de setcmd
│ • cmdset - Alias de setcmd
│ • cmdadd - Alias de setcmd
╰─⊷

╭─⊷ *🛠️ HERRAMIENTAS VARIAS*
│ • autoadmin - Autopromoverse como admin
│ • get - Obtener contenido de una URL
│ • fetch - Alias de get
│ • inspect - Inspeccionar enlaces de grupos/canales
│ • inspeccionar - Alias de inspect
│ • seguircanal - Seguir canal de WhatsApp
│ • noseguircanal - Dejar de seguir canal
│ • silenciarcanal - Silenciar notificaciones de canal
│ • nosilenciarcanal - Activar notificaciones de canal
│ • nuevafotochannel - Cambiar foto de canal
│ • eliminarfotochannel - Eliminar foto de canal
│ • nuevonombrecanal - Cambiar nombre de canal
│ • nuevadescchannel - Cambiar descripción de canal
│ • avisoschannel - Recibir notificaciones de canal
│ • resiviravisos - Alias de avisoschannel
│ • reactioneschannel - Configurar reacciones en canal
│ • reaccioneschannel - Alias de reactioneschannel
│ • addcharacter - Añadir personaje a la base de datos
│ • addrw - Alias de addcharacter
│ • restrict - Restringir funciones del bot
│ • restringir - Alias de restrict
│ • jadibot - Gestionar modo sub-bot
│ • serbot - Alias de jadibot
╰─⊷

╭────────────────────
│ ✨ Usa con responsabilidad
│ 🔒 Sistema de baneos mejorado
│ ⏱️ Soporta baneos temporales
╰────── 👑 OWNER 👑
`

    try {
        // Enviar solo una vez con validación
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

handler.help = ['menuowner', 'owner']
handler.tags = ['main']
handler.command = ['dev2', 'fer', 'menud']
handler.rowner = true

export default handler

function clockString(ms) {
    let seconds = Math.floor((ms / 1000) % 60)
    let minutes = Math.floor((ms / (1000 * 60)) % 60)
    let hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
    return `${hours}h ${minutes}m ${seconds}s`
}