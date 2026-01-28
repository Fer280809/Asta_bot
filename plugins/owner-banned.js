const handler = async (m, { conn, text, usedPrefix, command, args, isROwner, isOwner, isFernando }) => {
    const bot = conn.user.jid.split('@')[0]
    const users = global.db.data.users
    const chats = global.db.data.chats
    
    function no(number) { 
        return number.replace(/\s/g, '').replace(/([@+-])/g, '') 
    }

    // Verificar si un usuario es protegido (Global Owner o ROwner)
    function isProtectedUser(jid) {
        const number = jid.split('@')[0]
        return global.owner.some(([x]) => jid === x + '@s.whatsapp.net') || 
               global.owner.some(num => (num + '@s.whatsapp.net') === jid)
    }

    // Función para parsear el tiempo
    function parseTime(timeString) {
        if (!timeString) return null
        
        const regex = /(\d+)\s*(s|seg|segundo|segundos|m|min|minuto|minutos|h|hora|horas|d|día|dias|dia|dias|mes|meses|y|año|años|ano|anos)/gi
        const matches = [...timeString.matchAll(regex)]
        
        if (matches.length === 0) return null
        
        let totalMs = 0
        
        for (const match of matches) {
            const value = parseInt(match[1])
            const unit = match[2].toLowerCase()
            
            if (unit.startsWith('s')) {
                totalMs += value * 1000
            } else if (unit.startsWith('m') && !unit.includes('mes')) {
                totalMs += value * 60 * 1000
            } else if (unit.startsWith('h')) {
                totalMs += value * 60 * 60 * 1000
            } else if (unit.startsWith('d')) {
                totalMs += value * 24 * 60 * 60 * 1000
            } else if (unit.includes('mes')) {
                totalMs += value * 30 * 24 * 60 * 60 * 1000
            } else if (unit.startsWith('y') || unit.startsWith('a')) {
                totalMs += value * 365 * 24 * 60 * 60 * 1000
            }
        }
        
        return totalMs
    }

    // Función para formatear tiempo restante detallado
    function formatTimeDetailed(ms) {
        if (ms <= 0) return '0 segundos'
        
        let remaining = ms
        
        const years = Math.floor(remaining / (365 * 24 * 60 * 60 * 1000))
        remaining -= years * 365 * 24 * 60 * 60 * 1000
        
        const months = Math.floor(remaining / (30 * 24 * 60 * 60 * 1000))
        remaining -= months * 30 * 24 * 60 * 60 * 1000
        
        const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
        remaining -= days * 24 * 60 * 60 * 1000
        
        const hours = Math.floor(remaining / (60 * 60 * 1000))
        remaining -= hours * 60 * 60 * 1000
        
        const minutes = Math.floor(remaining / (60 * 1000))
        remaining -= minutes * 60 * 1000
        
        const seconds = Math.floor(remaining / 1000)

        let parts = []
        if (years > 0) parts.push(`${years} año${years > 1 ? 's' : ''}`)
        if (months > 0) parts.push(`${months} mes${months > 1 ? 'es' : ''}`)
        if (days > 0) parts.push(`${days} día${days > 1 ? 's' : ''}`)
        if (hours > 0) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`)
        if (minutes > 0) parts.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`)
        if (seconds > 0) parts.push(`${seconds} segundo${seconds > 1 ? 's' : ''}`)

        return parts.length > 0 ? parts.join(', ') : '0 segundos'
    }

    // Función para formatear tiempo restante simple
    function formatTimeRemaining(ms) {
        if (ms <= 0) return '0 segundos'
        
        const seconds = Math.floor(ms / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)
        const months = Math.floor(days / 30)
        const years = Math.floor(days / 365)

        if (years > 0) return `${years} año${years > 1 ? 's' : ''}`
        if (months > 0) return `${months} mes${months > 1 ? 'es' : ''}`
        if (days > 0) return `${days} día${days > 1 ? 's' : ''}`
        if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''}`
        if (minutes > 0) return `${minutes} minuto${minutes > 1 ? 's' : ''}`
        return `${seconds} segundo${seconds > 1 ? 's' : ''}`
    }

    // Verificar baneos temporales expirados
    function checkExpiredBans() {
        const now = Date.now()
        Object.keys(users).forEach(jid => {
            if (users[jid].banned && users[jid].bannedUntil) {
                if (now >= users[jid].bannedUntil) {
                    users[jid].banned = false
                    users[jid].bannedUntil = null
                    users[jid].bannedReason = ''
                    users[jid].bannedBy = ''
                }
            }
        })
    }

    try {
        checkExpiredBans()

        // Comando .horaban - accesible para TODOS
        if (command === 'horaban') {
            const userJid = m.sender
            
            if (!users[userJid] || !users[userJid].banned) {
                return conn.reply(m.chat, `✅ No estás baneado. Puedes usar el bot libremente.`, m)
            }

            const name = await conn.getName(userJid)
            const reason = users[userJid].bannedReason || 'Sin Especificar'
            const bannedBy = users[userJid].bannedBy || 'Administrador'
            
            if (users[userJid].bannedUntil) {
                const timeLeft = users[userJid].bannedUntil - Date.now()
                if (timeLeft <= 0) {
                    users[userJid].banned = false
                    users[userJid].bannedUntil = null
                    users[userJid].bannedReason = ''
                    users[userJid].bannedBy = ''
                    return conn.reply(m.chat, `╭━〔✅ *BANEO EXPIRADO* ✅〕━╮
 ┃
 ┃ ${name}, tu baneo ha terminado.
 ┃ Ya puedes usar el bot libremente.
 ╰━━━━━━━━━━━━╯`, m)
                }
                
                return conn.reply(m.chat, `╭━〔⏱️ *TU ESTADO DE BANEO* ⏱️〕━╮
 ┃
 ┃ 👤 Usuario: ${name}
 ┃ 🚫 Baneado por: ${bannedBy}
 ┃ 📝 Razón: ${reason}
 ┃
 ┃ ⏰ Tiempo restante:
 ┃ ${formatTimeDetailed(timeLeft)}
 ┃
 ┃ 💡 Usa .horaban para verificar
 ┃ tu tiempo restante en cualquier momento.
 ╰━━━━━━━━━━━━╯`, m)
            } else {
                return conn.reply(m.chat, `╭━〔🔒 *BANEO PERMANENTE* 🔒〕━╮
 ┃
 ┃ 👤 Usuario: ${name}
 ┃ 🚫 Baneado por: ${bannedBy}
 ┃ 📝 Razón: ${reason}
 ┃
 ┃ ⚠️ Este es un baneo permanente.
 ┃ Contacta a un administrador.
 ╰━━━━━━━━━━━━╯`, m)
            }
        }

        // Verificar permisos para comandos de administración
        if (command === 'banned' || command === 'unban') {
            if (!isFernando && !isOwner) {
                return conn.reply(m.chat, `🔐 *ACCESO RESTRINGIDO* 🔐\nEl comando *${command}* es *exclusivo* para el desarrollador principal *Fernando*.\n\n> 🛡️ Solo Fernando puede ejecutar este comando.\n> 🔒 Acceso denegado para otros usuarios.`, m)
            }
        }
        
        if (command !== 'horaban' && command !== 'banned' && command !== 'unban') {
            if (!isOwner) {
                return conn.reply(m.chat, `💠 *Acceso denegado* 💠\nEl comando *${command}* solo puede ser usado por los *propietarios del bot*.`, m)
            }
        }

        let mentionedJid = m.mentionedJid || []
        let who = mentionedJid[0] 
            ? mentionedJid[0] 
            : m.quoted 
                ? m.quoted.sender 
                : text 
                    ? no(text.split(' ')[0]) + '@s.whatsapp.net' 
                    : false

        switch (command) {
            case 'banned': {
                if (!who) return conn.reply(m.chat, `❌ *ASTA-BOT* ❌\n> Por favor, etiqueta, cita o escribe el número del usuario que quieres banear del Bot.\n\n*Uso:*\n${usedPrefix}banned @usuario [tiempo] [razón]\n${usedPrefix}banned 521234567890 [tiempo] [razón]\n\n*Ejemplos:*\n${usedPrefix}banned @user 7d Spam\n${usedPrefix}banned 521234567890 2h 30m Mal comportamiento\n${usedPrefix}banned @user 1mes 3d 5h Advertencia\n${usedPrefix}banned @user Permanente`, m)

                if (who === conn.user.jid) {
                    return conn.reply(m.chat, `⚠️ @${bot} no puede ser baneado.`, m, { mentions: [who] })
                }

                if (isProtectedUser(who)) {
                    return conn.reply(m.chat, `⚠️ No puedes banear a @${who.split('@')[0]} porque es Global Owner o ROwner.`, m, { mentions: [who] })
                }

                let argsText = args.join(' ')
                if (mentionedJid && mentionedJid[0]) {
                    argsText = argsText.replace(/@\d+/g, '').trim()
                } else if (m.quoted) {
                    // Los args ya están sin el número
                } else if (text) {
                    argsText = text.trim().replace(/^\d+\s*/, '')
                }

                const timeMs = parseTime(argsText)
                let reason = 'Sin Especificar'
                let bannedUntil = null

                if (timeMs) {
                    bannedUntil = Date.now() + timeMs
                    reason = argsText.replace(/\d+\s*(s|seg|segundo|segundos|m|min|minuto|minutos|h|hora|horas|d|día|dias|dia|dias|mes|meses|y|año|años|ano|anos)/gi, '').trim() || 'Sin Especificar'
                } else {
                    reason = argsText.trim() || 'Sin Especificar'
                }

                if (!users[who]) users[who] = {}
                if (users[who].banned) {
                    if (users[who].bannedUntil) {
                        const timeLeft = users[who].bannedUntil - Date.now()
                        return conn.reply(m.chat, `❗ @${who.split('@')[0]} ya está baneado.\n⏱️ Tiempo restante: ${formatTimeDetailed(timeLeft)}`, m, { mentions: [who] })
                    }
                    return conn.reply(m.chat, `❗ @${who.split('@')[0]} ya está baneado permanentemente.`, m, { mentions: [who] })
                }

                await m.react('🕒')
                users[who].banned = true
                users[who].bannedReason = reason
                users[who].bannedUntil = bannedUntil
                users[who].bannedBy = await conn.getName(m.sender)
                
                let nameBan = await conn.getName(who)
                await m.react('✅')
                
                const banType = bannedUntil ? `⏱️ Temporal` : '🔒 Permanente'
                const timeDisplay = bannedUntil ? `⏰ Duración: ${formatTimeDetailed(timeMs)}` : ''
                
                await conn.reply(m.chat, `╭━〔🚫 *USUARIO BANEADO* 🚫〕━╮
 ┃
 ┃ Nombre: ${nameBan}
 ┃ Tipo: ${banType}
 ${timeDisplay ? ` ┃ ${timeDisplay}` : ''}
 ┃ Razón: ${reason}
 ╰━━━━━━━━━━━━╯`, m, { mentions: [who] })
                
                const userBanMessage = bannedUntil 
                    ? `╭━〔🚫 *HAS SIDO BANEADO* 🚫〕━╮
 ┃
 ┃ 👤 Usuario: ${nameBan}
 ┃ 🚫 Baneado por: ${users[who].bannedBy}
 ┃ 📝 Razón: ${reason}
 ┃
 ┃ ⏰ Tiempo de baneo:
 ┃ ${formatTimeDetailed(timeMs)}
 ┃
 ┃ 💡 Usa el comando .horaban
 ┃ para ver tu tiempo restante.
 ╰━━━━━━━━━━━━╯`
                    : `╭━〔🔒 *HAS SIDO BANEADO* 🔒〕━╮
 ┃
 ┃ 👤 Usuario: ${nameBan}
 ┃ 🚫 Baneado por: ${users[who].bannedBy}
 ┃ 📝 Razón: ${reason}
 ┃
 ┃ ⚠️ Este es un baneo PERMANENTE.
 ┃ Contacta a un administrador.
 ╰━━━━━━━━━━━━╯`

                try {
                    await conn.sendMessage(who, { text: userBanMessage }, { quoted: null })
                } catch (e) {
                    console.log('No se pudo enviar mensaje al usuario baneado:', e)
                }
                
                if (typeof suittag !== 'undefined') {
                    await conn.reply(`${suittag}@s.whatsapp.net`, `❗ ${nameBan} fue baneado por ${users[who].bannedBy}\n> Tipo: ${banType}\n${timeDisplay ? `> ${timeDisplay}\n` : ''}> Razón: ${reason}`, m)
                }
                break
            }

            case 'unban': {
                if (!who) return conn.reply(m.chat, `❌ *ASTA-BOT* ❌\n> Por favor, etiqueta o coloca el número del usuario que quieres desbanear del Bot.\n\n*Ejemplos:*\n${usedPrefix}unban @usuario\n${usedPrefix}unban 521234567890`, m)
                if (!users[who]) return conn.reply(m.chat, '❗ El usuario no está registrado.', m)
                if (!users[who].banned) return conn.reply(m.chat, `⚠️ @${who.split('@')[0]} no está baneado.`, m, { mentions: [who] })

                await m.react('🕒')
                users[who].banned = false
                users[who].bannedReason = ''
                users[who].bannedUntil = null
                users[who].bannedBy = ''
                await m.react('✅')
                let nameUnban = await conn.getName(who)
                
                await conn.reply(m.chat, `╭━〔✅ *USUARIO DESBANEADO* ✅〕━╮
 ┃
 ┃ Nombre: ${nameUnban}
 ┃ Desbaneado por: ${await conn.getName(m.sender)}
 ╰━━━━━━━━━━━━╯`, m, { mentions: [who] })
                
                try {
                    await conn.sendMessage(who, { 
                        text: `╭━〔✅ *HAS SIDO DESBANEADO* ✅〕━╮
 ┃
 ┃ 🎉 ${nameUnban}, tu baneo ha sido removido.
 ┃ ✨ Desbaneado por: ${await conn.getName(m.sender)}
 ┃
 ┃ Ya puedes usar el bot nuevamente.
 ╰━━━━━━━━━━━━╯` 
                    }, { quoted: null })
                } catch (e) {
                    console.log('No se pudo enviar mensaje al usuario desbaneado:', e)
                }
                
                if (typeof suittag !== 'undefined') {
                    await conn.reply(`${suittag}@s.whatsapp.net`, `✅ ${nameUnban} fue desbaneado por ${await conn.getName(m.sender)}.`, m)
                }
                break
            }

            case 'checkban': {
                if (!who) return conn.reply(m.chat, `❌ *ASTA-BOT* ❌\n> Por favor, etiqueta o coloca el número del usuario que quieres verificar.\n\n*Ejemplos:*\n${usedPrefix}checkban @usuario\n${usedPrefix}checkban 521234567890`, m)
                if (!users[who] || !users[who].banned) {
                    return conn.reply(m.chat, `✅ @${who.split('@')[0]} no está baneado.`, m, { mentions: [who] })
                }

                const name = await conn.getName(who)
                const reason = users[who].bannedReason || 'Sin Especificar'
                const bannedBy = users[who].bannedBy || 'Administrador'
                
                if (users[who].bannedUntil) {
                    const timeLeft = users[who].bannedUntil - Date.now()
                    if (timeLeft <= 0) {
                        users[who].banned = false
                        users[who].bannedUntil = null
                        users[who].bannedReason = ''
                        users[who].bannedBy = ''
                        return conn.reply(m.chat, `✅ El baneo de @${who.split('@')[0]} ha expirado.`, m, { mentions: [who] })
                    }
                    await conn.reply(m.chat, `╭━〔🚫 *ESTADO DE BANEO* 🚫〕━╮
 ┃
 ┃ Usuario: ${name}
 ┃ Tipo: ⏱️ Temporal
 ┃ Baneado por: ${bannedBy}
 ┃
 ┃ ⏰ Tiempo restante:
 ┃ ${formatTimeDetailed(timeLeft)}
 ┃
 ┃ Razón: ${reason}
 ╰━━━━━━━━━━━━╯`, m, { mentions: [who] })
                } else {
                    await conn.reply(m.chat, `╭━〔🚫 *ESTADO DE BANEO* 🚫〕━╮
 ┃
 ┃ Usuario: ${name}
 ┃ Tipo: 🔒 Permanente
 ┃ Baneado por: ${bannedBy}
 ┃ Razón: ${reason}
 ╰━━━━━━━━━━━━╯`, m, { mentions: [who] })
                }
                break
            }

            case 'block': {
                if (!who) return conn.reply(m.chat, `❌ *ASTA-BOT* ❌\n> Por favor, menciona al usuario que quieres bloquear del número de la Bot.`, m)
                
                if (isProtectedUser(who)) {
                    return conn.reply(m.chat, `⚠️ No puedes bloquear a @${who.split('@')[0]} porque es Global Owner o ROwner.`, m, { mentions: [who] })
                }
                
                await m.react('🕒')
                await conn.updateBlockStatus(who, 'block')
                await m.react('✅')
                conn.reply(m.chat, `╭━〔🚫 *USUARIO BLOQUEADO* 🚫〕━╮
 ┃ @${who.split('@')[0]}
 ╰━━━━━━━━━━━━╯`, m, { mentions: [who] })
                break
            }

            case 'unblock': {
                if (!who) return conn.reply(m.chat, `❌ *ASTA-BOT* ❌\n> Por favor, menciona al usuario que quieres desbloquear del número de la Bot.`, m)
                await m.react('🕒')
                await conn.updateBlockStatus(who, 'unblock')
                await m.react('✅')
                conn.reply(m.chat, `╭━〔✅ *USUARIO DESBLOQUEADO* ✅〕━╮
 ┃ @${who.split('@')[0]}
 ╰━━━━━━━━━━━━╯`, m, { mentions: [who] })
                break
            }

            case 'banlist': {
                await m.react('🕒')
                const now = Date.now()
                const bannedUsers = Object.entries(users).filter(([_, data]) => data.banned)
                const bannedChats = Object.entries(chats).filter(([_, data]) => data.isBanned)
                
                const usersList = bannedUsers.map(([jid, data]) => {
                    let status = '🔒 Permanente'
                    if (data.bannedUntil) {
                        const timeLeft = data.bannedUntil - now
                        if (timeLeft > 0) {
                            status = `⏱️ ${formatTimeRemaining(timeLeft)}`
                        } else {
                            status = '✅ Expirado'
                        }
                    }
                    return `▢ @${jid.split('@')[0]} - ${status}`
                })
                
                const chatsList = bannedChats.map(([jid]) => `▢ ${jid}`)
                
                const bannedText = `╭━〔📋 *LISTA DE BANEADOS* 📋〕━╮
 ┃
 ┃ ✦ Usuarios Baneados • Total: ${bannedUsers.length}
 ┃ ${usersList.join('\n ┃ ') || 'Ninguno'}
 ┃
 ┃ ✧ Chats Baneados • Total: ${bannedChats.length}
 ┃ ${chatsList.join('\n ┃ ') || 'Ninguno'}
 ╰━━━━━━━━━━━━╯`.trim()
                
                const mentions = [...bannedUsers.map(([jid]) => jid), ...bannedChats.map(([jid]) => jid)]
                await m.react('✅')
                conn.reply(m.chat, bannedText, m, { mentions })
                break
            }

            case 'blocklist': {
                await m.react('🕒')
                const blocklist = await conn.fetchBlocklist()
                let listText = `╭━〔📋 *LISTA DE BLOQUEADOS* 📋〕━╮\n ┃ Total: ${blocklist.length}\n ┃\n`
                for (const i of blocklist) listText += ` ┃ ▢ @${i.split('@')[0]}\n`
                listText += '╰━━━━━━━━━━━━╯'
                await m.react('✅')
                conn.reply(m.chat, listText, m, { mentions: blocklist })
                break
            }
        }
    } catch (e) {
        await m.react('❌')
        return conn.reply(m.chat, `⚠️ Se ha producido un error.\n> Usa *${usedPrefix}report* para informarlo.\n\n` + (e.message || e), m)
    }
}

handler.help = ['banned', 'unban', 'checkban', 'horaban', 'block', 'unblock', 'banlist', 'blocklist']
handler.tags = ['mods']
handler.command = ['banned', 'unban', 'checkban', 'horaban', 'block', 'unblock', 'banlist', 'blocklist']
handler.rowner = true
export default handler
