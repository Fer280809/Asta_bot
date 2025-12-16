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

═══ COMANDOS DE OWNER ═══

🔑 *GESTIÓN OWNERS*
• #addowner • #delowner
• #codigo

💾 *ARCHIVOS*
• #backup • #copia
• #cleanfiles • #dsowner
• #cleartmp • #vaciartmp
• #deletefile

💰 *ECONOMÍA*
• #addcoins • #añadircoin
• #userpremium • #addprem
• #delprem • #remove
• #addexp • #añadirxp
• #removecoin • #quitarcoin
• #deletedatauser • #resetuser
• #removexp • #quitarxp

📢 *COMUNICACIÓN*
• #bcgc • #let
• #reunion • #meeting

🚫 *SISTEMA DE BANEOS*
┌─ 🔐 Solo Fernando:
│ • #banned [usuario] [tiempo] [razón]
│ • #unban [usuario]
├─ 👥 Todos los usuarios:
│ • #horaban
└─ 👑 Owners:
  • #checkban [usuario]
  • #banlist
  • #block [usuario]
  • #unblock [usuario]
  • #blocklist

*Ejemplos de uso:*
• #banned @user 7d Spam
• #banned 521234567890 2h 30m Mal comportamiento
• #banned @user Permanente
• #unban @user
• #horaban (ver tu tiempo de baneo)

🤖 *ADMIN AUTO*
• #autoadmin

👥 *GRUPOS*
• #newgc • #creargc
• #grouplist • #listgroup
• #join • #invite
• #leave • #salir

🌐 *WEB*
• #get • #fetch
• #plugin • #getplugin

⚙️ *CONFIGURACIÓN*
• #prefix • #resetprefix
• #reiniciar • #restart
• #setbanner • #setavatar
• #setimage2 • #setpfp2
• #setmoneda • #setname
• #setbio2 • #setstatus2
• #update

💾 *COMANDOS CUSTOM*
• #addcmd • #setcmd
• #delcmd • #cmdlist
• #listcmd • #editarplugin
• #subirplugin • #eliminarplugin
• #saveplugin • #svp
• #descargarplugins • #descargarplugin 

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