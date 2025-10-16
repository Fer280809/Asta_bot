import moment from 'moment-timezone'

let handler = async (m, { conn, args }) => {
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

╭─═⊰ 📡 𝐄𝐒𝐓𝐀𝐃𝐎 𝐀𝐂𝐓𝐈𝐕𝐎 ⊰═─╮
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
╰────────────────╯                                                                                                                                                                                                                                                                                                                                                                                                                    

COMANDOS DE OWNER

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
• #delprem #remove
• #addexp • #añadirxp
• #removecoin • #quitarcoin
• #deletedatauser • #resetuser
• #removexp • #quitarxp

📢 *COMUNICACIÓN*
• #bcgc • #let
• #reunion • #meeting

🚫 *BANEOS*
• #listban • #banlist
• #banned • #unban
• #block • #unblock
• #listblock • #blocklist

🤖 *ADMIN AUTO*
• #autoadmin
• #spam2

👥 *GRUPOS*
• #newgc #creargc
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
• #setimage • #setpfp
• #setmoneda • #setname
• #setbio • #setstatus
• #update

💾 *COMANDOS CUSTOM*
• #addcmd • #setcmd
• #delcmd • #cmdlist
• #listcmd • #savejs
• #savefile • #saveplugin

╭────────────────────
│ ✨ Usa con responsabilidad
╰────── 👑 OWNER 👑

`

    try {
        await conn.sendMessage(m.chat, {
            image: { url: menuImage },
            caption: txt,
            mentions: [userId]
        })
    } catch (error) {
        console.error('Error al enviar la imagen:', error)
        await conn.sendMessage(m.chat, { 
            text: txt,
            mentions: [userId]
        })
    }
}

handler.help = ['mods'];
handler.tags = ['main'];
handler.command = ['dev', 'owners'];
handler.rowner = true;

export default handler

function clockString(ms) {
    let seconds = Math.floor((ms / 1000) % 60)
    let minutes = Math.floor((ms / (1000 * 60)) % 60)
    let hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
    return `${hours}h ${minutes}m ${seconds}s`
}