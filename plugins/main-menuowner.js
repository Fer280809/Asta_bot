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
    
    // ==============================================
    // SISTEMA DE TEMAS FESTIVOS PARA OWNER
    // ==============================================
    
    function getFestiveTheme() {
        const now = new Date()
        const month = now.getMonth() + 1
        const day = now.getDate()
        const year = now.getFullYear()
        
        // 🎄 Navidad (1-26 Diciembre)
        if (month === 12 && day >= 1 && day <= 26) {
            return {
                name: 'navidad',
                crown: '🎅',  // Corona navideña
                badge: '🎄',   // Emblema principal
                frame: '❄️',   // Marco/separador
                highlight: '🎁', // Destacado
                warning: '🔔',  // Advertencia/alerta
                footerCrown: '🦌', // Corona del pie
                title: `🎄 ${botname} 🎄`,
                greeting: '🎅 ¡Felices Fiestas, Developer! 🎅',
                specialText: '🎁 *MODO NAVIDEÑO ACTIVADO* 🎁\nComandos especiales disponibles',
                banner: 'https://files.catbox.moe/lajq7h.jpg' // Cambia por banner navideño owner
            }
        }
        
        // 🎆 Año Nuevo (27-31 Dic y 1-5 Ene)
        if ((month === 12 && day >= 27) || (month === 1 && day <= 5)) {
            return {
                name: 'año_nuevo',
                crown: '👑',
                badge: '🎆',
                frame: '✨',
                highlight: '🥂',
                warning: '⏳',
                footerCrown: '🌟',
                title: `🎆 ${botname} ${year} 🎆`,
                greeting: `✨ ¡Feliz ${year}, Developer! ✨`,
                specialText: `🥂 *Nuevo Año, Nuevas Funciones* 🥂\nSistema actualizado para ${year}`,
                banner: 'https://files.catbox.moe/lajq7h.jpg'
            }
        }
        
        // ❤️ San Valentín (10-15 Febrero)
        if (month === 2 && day >= 10 && day <= 15) {
            return {
                name: 'san_valentin',
                crown: '💝',
                badge: '❤️',
                frame: '💘',
                highlight: '💌',
                warning: '💔',
                footerCrown: '💑',
                title: `❤️ ${botname} ❤️`,
                greeting: '💝 ¡Feliz San Valentín, Developer! 💝',
                specialText: '💞 *Modo Amor para el Bot* 💞\nConfiguración especial activada',
                banner: 'https://files.catbox.moe/lajq7h.jpg'
            }
        }
        
        // 🎃 Halloween (25-31 Octubre)
        if (month === 10 && day >= 25 && day <= 31) {
            return {
                name: 'halloween',
                crown: '👻',
                badge: '🎃',
                frame: '🕷️',
                highlight: '🍬',
                warning: '🦇',
                footerCrown: '🕸️',
                title: `🎃 ${botname} 🎃`,
                greeting: '👻 ¡Feliz Halloween, Developer! 👻',
                specialText: '🦇 *Modo Espeluznante Activado* 🦇\nFunciones especiales disponibles',
                banner: 'https://files.catbox.moe/lajq7h.jpg'
            }
        }
        
        // Tema normal para developers/owners
        return {
            name: 'normal',
            crown: '👑',
            badge: '⚡',
            frame: '✨',
            highlight: '💎',
            warning: '⚠️',
            footerCrown: '🤖',
            title: `⚡ ${botname} ⚡`,
            greeting: '🎭 ¡Hola, Developer! 🎭',
            specialText: null,
            banner: 'https://files.catbox.moe/lajq7h.jpg'
        }
    }
    
    const theme = getFestiveTheme()
    
    // ==============================================
    // CONSTRUCCIÓN DEL MENÚ OWNER
    // ==============================================
    
    // Encabezado dinámico
    let header = `
${theme.badge.repeat(3)} ${theme.title} ${theme.badge.repeat(3)}

${theme.greeting} @${userId.split('@')[0]} ${theme.crown}
`
    
    // Texto especial si hay festividad
    if (theme.specialText) {
        header += `\n${theme.specialText}\n`
    }
    
    // Información de estado (con emojis temáticos)
    let statusInfo = `
${theme.frame} *ESTADO DEL SISTEMA* ${theme.frame}

${theme.badge} Estado: ${(conn.user.jid == global.conn.user.jid ? '🟢 PREMIUM ' : '🔗 SUB-BOT')}
${theme.frame} Activo: 『${uptime}』
${theme.highlight} Usuarios: 『${totalreg}』
${theme.badge} Comandos: 『${totalCommands}』
${theme.frame} Fecha: ${moment().tz('America/Mexico_City').format('DD/MM/YYYY')}
${theme.highlight} Hora: ${moment().tz('America/Mexico_City').format('HH:mm:ss')}
${theme.badge} Servidor: México 🇲🇽
${theme.frame} Memoria: Estable
${theme.highlight} Modo: ${theme.crown} PRIVADO ${theme.crown}
${theme.badge} Tema: ${theme.name.toUpperCase()} ${theme.badge}
`
    
    // Sección de comandos OWNER (estructura fija, emojis dinámicos)
    let commandsSection = `
${theme.crown}═══ ${theme.badge} COMANDOS DE OWNER ${theme.badge} ═══${theme.crown}

${theme.highlight}🔑 *GESTIÓN OWNERS*
${theme.frame} • ${usedPrefix}addowner • ${usedPrefix}delowner
${theme.frame} • ${usedPrefix}codigo

${theme.highlight}💾 *ARCHIVOS*
${theme.frame} • ${usedPrefix}backup • ${usedPrefix}copia
${theme.frame} • ${usedPrefix}cleanfiles • ${usedPrefix}dsowner
${theme.frame} • ${usedPrefix}cleartmp • ${usedPrefix}vaciartmp
${theme.frame} • ${usedPrefix}deletefile

${theme.highlight}💰 *ECONOMÍA*
${theme.frame} • ${usedPrefix}addcoins • ${usedPrefix}añadircoin
${theme.frame} • ${usedPrefix}userpremium • ${usedPrefix}addprem
${theme.frame} • ${usedPrefix}delprem • ${usedPrefix}remove
${theme.frame} • ${usedPrefix}addexp • ${usedPrefix}añadirxp
${theme.frame} • ${usedPrefix}removecoin • ${usedPrefix}quitarcoin
${theme.frame} • ${usedPrefix}deletedatauser • ${usedPrefix}resetuser
${theme.frame} • ${usedPrefix}removexp • ${usedPrefix}quitarxp

${theme.highlight}📢 *COMUNICACIÓN*
${theme.frame} • ${usedPrefix}bcgc • ${usedPrefix}let
${theme.frame} • ${usedPrefix}reunion • ${usedPrefix}meeting

${theme.highlight}🚫 *SISTEMA DE BANEOS*
${theme.frame}┌─ ${theme.crown} Solo Fernando:
${theme.frame}│ • ${usedPrefix}banned [usuario] [tiempo] [razón]
${theme.frame}│ • ${usedPrefix}unban [usuario]
${theme.frame}├─ 👥 Todos los usuarios:
${theme.frame}│ • ${usedPrefix}horaban
${theme.frame}└─ ${theme.crown} Owners:
${theme.frame}  • ${usedPrefix}checkban [usuario]
${theme.frame}  • ${usedPrefix}banlist
${theme.frame}  • ${usedPrefix}block [usuario]
${theme.frame}  • ${usedPrefix}unblock [usuario]
${theme.frame}  • ${usedPrefix}blocklist

${theme.warning}*Ejemplos de uso:*
${theme.frame}• ${usedPrefix}banned @user 7d Spam
${theme.frame}• ${usedPrefix}banned 521234567890 2h 30m Mal comportamiento
${theme.frame}• ${usedPrefix}banned @user Permanente
${theme.frame}• ${usedPrefix}unban @user
${theme.frame}• ${usedPrefix}horaban (ver tu tiempo de baneo)

${theme.highlight}🤖 *ADMIN AUTO*
${theme.frame} • ${usedPrefix}autoadmin

${theme.highlight}👥 *GRUPOS*
${theme.frame} • ${usedPrefix}newgc • ${usedPrefix}creargc
${theme.frame} • ${usedPrefix}grouplist • ${usedPrefix}listgroup
${theme.frame} • ${usedPrefix}join • ${usedPrefix}invite
${theme.frame} • ${usedPrefix}leave • ${usedPrefix}salir

${theme.highlight}🌐 *WEB*
${theme.frame} • ${usedPrefix}get • ${usedPrefix}fetch
${theme.frame} • ${usedPrefix}plugin • ${usedPrefix}getplugin

${theme.highlight}⚙️ *CONFIGURACIÓN*
${theme.frame} • ${usedPrefix}prefix • ${usedPrefix}resetprefix
${theme.frame} • ${usedPrefix}reiniciar • ${usedPrefix}restart
${theme.frame} • ${usedPrefix}setbanner • ${usedPrefix}setavatar
${theme.frame} • ${usedPrefix}setimage2 • ${usedPrefix}setpfp2
${theme.frame} • ${usedPrefix}setmoneda • ${usedPrefix}setname
${theme.frame} • ${usedPrefix}setbio2 • ${usedPrefix}setstatus2
${theme.frame} • ${usedPrefix}update

${theme.highlight}💾 *COMANDOS CUSTOM*
${theme.frame} • ${usedPrefix}addcmd • ${usedPrefix}setcmd
${theme.frame} • ${usedPrefix}delcmd • ${usedPrefix}cmdlist
${theme.frame} • ${usedPrefix}listcmd • ${usedPrefix}editarplugin
${theme.frame} • ${usedPrefix}subirplugin • ${usedPrefix}eliminarplugin
${theme.frame} • ${usedPrefix}saveplugin • ${usedPrefix}svp
${theme.frame} • ${usedPrefix}descargarplugins • ${usedPrefix}descargarplugin 
`
    
    // Pie de página dinámico
    let footer = `
${theme.frame}╭────────────────────
${theme.frame}│ ${theme.highlight}Usa con responsabilidad
${theme.frame}│ ${theme.warning}Sistema de baneos mejorado
${theme.frame}│ ${theme.badge}Soporta baneos temporales
${theme.frame}╰────── ${theme.crown} OWNER ${theme.crown} ${theme.footerCrown}
`
    
    // Texto final combinado
    let txt = header + statusInfo + commandsSection + footer

    // ==============================================
    // ENVÍO DEL MENSAJE
    // ==============================================
    
    try {
        await conn.sendMessage(m.chat, {
            image: { url: theme.banner },
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

// Configuración del handler
handler.help = ['mods']
handler.tags = ['main']
handler.command = ['dev', 'owners']
handler.rowner = true

export default handler

// Función auxiliar para formato de tiempo
function clockString(ms) {
    let seconds = Math.floor((ms / 1000) % 60)
    let minutes = Math.floor((ms / (1000 * 60)) % 60)
    let hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
    return `${hours}h ${minutes}m ${seconds}s`
}

// Nota: Se mantiene usedPrefix como referencia, 
// aunque en el código original no estaba definido.
// Si usas prefijo dinámico, asegúrate de pasarlo en los parámetros.
