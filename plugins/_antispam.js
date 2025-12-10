// Sistema Anti-Spam con Mute Progresivo Mejorado
// Detecta spam de mensajes repetidos, flood y stickers

const SPAM_THRESHOLD = 5 // Mensajes permitidos en el intervalo
const SPAM_INTERVAL = 10000 // 10 segundos
const RESET_WARNINGS = 5 * 60 * 60 * 1000 // 5 horas
const REPEATED_MSG_THRESHOLD = 3 // Mensajes idénticos para considerar spam

// Fases de mute progresivo
const MUTE_PHASES = [
    { warnings: 3, time: 5 * 60 * 1000, label: '5 minutos' },
    { warnings: 6, time: 15 * 60 * 1000, label: '15 minutos' },
    { warnings: 9, time: 30 * 60 * 1000, label: '30 minutos' },
    { warnings: 12, time: 1 * 60 * 60 * 1000, label: '1 hora' },
    { warnings: 15, time: 3 * 60 * 60 * 1000, label: '3 horas' },
    { warnings: 20, time: 6 * 60 * 60 * 1000, label: '6 horas' },
    { warnings: 25, time: 12 * 60 * 60 * 1000, label: '12 horas' },
    { warnings: 30, time: 24 * 60 * 60 * 1000, label: '24 horas' }
]

export async function before(m, { conn, isAdmin, isBotAdmin }) {
    if (!m.isGroup || !m.message) return false
    if (isAdmin || m.fromMe || m.key.fromMe) return false
    
    const chat = global.db.data.chats[m.chat]
    if (!chat.antispam) return false
    
    // Inicializar datos
    if (!global.db.data.users[m.sender]) {
        global.db.data.users[m.sender] = {}
    }
    
    const user = global.db.data.users[m.sender]
    const now = Date.now()
    
    if (!user.spam) {
        user.spam = {
            messages: [],
            warnings: 0,
            muted: false,
            muteEnd: 0,
            lastWarningReset: now,
            deleteCount: 0,
            recentMessages: [],
            spamMessages: [] // Para rastrear mensajes de spam a eliminar
        }
    }
    
    // Resetear advertencias cada 5 horas
    if (now - user.spam.lastWarningReset > RESET_WARNINGS) {
        const wasMuted = user.spam.muted && now < user.spam.muteEnd
        const oldWarnings = user.spam.warnings
        user.spam.warnings = 0
        user.spam.lastWarningReset = now
        
        if (!wasMuted) {
            console.log(`[AntiSpam] Advertencias reseteadas: ${m.sender} (${oldWarnings} → 0)`)
        }
    }
    
    // SI ESTÁ MUTEADO: Eliminar mensaje inmediatamente
    if (user.spam.muted && now < user.spam.muteEnd) {
        try {
            await conn.sendMessage(m.chat, { delete: m.key })
            user.spam.deleteCount++
            
            // Recordatorio cada 5 mensajes
            if (user.spam.deleteCount % 5 === 0) {
                const timeLeft = Math.ceil((user.spam.muteEnd - now) / 60000)
                const hoursLeft = Math.floor(timeLeft / 60)
                const minutesLeft = timeLeft % 60
                const timeText = hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m` : `${minutesLeft}m`
                
                const msg = await conn.reply(m.chat, 
                    `⚠️ @${m.sender.split('@')[0]} estás *silenciado*\n\n` +
                    `⏰ Tiempo restante: *${timeText}*\n` +
                    `📊 Advertencias: *${user.spam.warnings}*\n\n` +
                    `> Tus mensajes serán eliminados automáticamente`, 
                    null, { mentions: [m.sender] })
                
                setTimeout(() => conn.sendMessage(m.chat, { delete: msg.key }).catch(() => {}), 15000)
            }
        } catch (e) {
            console.error('[AntiSpam] Error eliminando mensaje:', e)
        }
        return true
    }
    
    // Desmutear si el tiempo expiró
    if (user.spam.muted && now >= user.spam.muteEnd) {
        user.spam.muted = false
        user.spam.deleteCount = 0
        
        await conn.reply(m.chat, 
            `✅ @${m.sender.split('@')[0]} ya no está silenciado\n\n` +
            `⚠️ Advertencias actuales: *${user.spam.warnings}*\n` +
            `🔄 Se resetearán en: *${Math.ceil((RESET_WARNINGS - (now - user.spam.lastWarningReset)) / 3600000)}h*`, 
            m, { mentions: [m.sender] }).catch(() => {})
    }
    
    // DETECCIÓN DE SPAM
    
    // Limpiar mensajes antiguos
    user.spam.messages = user.spam.messages.filter(msg => now - msg.time < SPAM_INTERVAL)
    user.spam.recentMessages = user.spam.recentMessages.filter(msg => now - msg.time < SPAM_INTERVAL)
    
    // Obtener contenido del mensaje
    let messageContent = ''
    let messageType = 'text'
    
    if (m.message.conversation) {
        messageContent = m.message.conversation
    } else if (m.message.extendedTextMessage) {
        messageContent = m.message.extendedTextMessage.text
    } else if (m.message.imageMessage) {
        messageContent = 'image_' + (m.message.imageMessage.caption || '')
        messageType = 'image'
    } else if (m.message.videoMessage) {
        messageContent = 'video_' + (m.message.videoMessage.caption || '')
        messageType = 'video'
    } else if (m.message.stickerMessage) {
        messageContent = 'sticker_' + (m.message.stickerMessage.fileSha256?.toString() || Math.random())
        messageType = 'sticker'
    } else if (m.message.audioMessage) {
        messageContent = 'audio_' + Math.random()
        messageType = 'audio'
    }
    
    // Registrar mensaje
    user.spam.messages.push({ time: now, key: m.key })
    user.spam.recentMessages.push({ 
        time: now, 
        content: messageContent, 
        key: m.key,
        type: messageType
    })
    
    let isSpam = false
    let spamReason = ''
    
    // 1. Detección de FLOOD (muchos mensajes rápido)
    if (user.spam.messages.length >= SPAM_THRESHOLD) {
        isSpam = true
        spamReason = 'Flood de mensajes'
        user.spam.spamMessages = user.spam.messages.map(msg => msg.key)
    }
    
    // 2. Detección de MENSAJES REPETIDOS
    if (!isSpam && messageContent) {
        const repeatedCount = user.spam.recentMessages.filter(msg => 
            msg.content === messageContent
        ).length
        
        if (repeatedCount >= REPEATED_MSG_THRESHOLD) {
            isSpam = true
            spamReason = 'Mensajes repetidos'
            user.spam.spamMessages = user.spam.recentMessages
                .filter(msg => msg.content === messageContent)
                .map(msg => msg.key)
        }
    }
    
    // 3. Detección de STICKERS repetidos
    if (!isSpam && messageType === 'sticker') {
        const stickerCount = user.spam.recentMessages.filter(msg => 
            msg.type === 'sticker'
        ).length
        
        if (stickerCount >= REPEATED_MSG_THRESHOLD) {
            isSpam = true
            spamReason = 'Spam de stickers'
            user.spam.spamMessages = user.spam.recentMessages
                .filter(msg => msg.type === 'sticker')
                .map(msg => msg.key)
        }
    }
    
    // SI ES SPAM: Aplicar sanción
    if (isSpam) {
        if (!isBotAdmin) {
            await conn.reply(m.chat, 
                `⚠️ Spam detectado de @${m.sender.split('@')[0]}\n\n` +
                `❌ No puedo actuar sin permisos de administrador`, 
                m, { mentions: [m.sender] }).catch(() => {})
            return false
        }
        
        // ELIMINAR TODOS LOS MENSAJES DE SPAM
        for (const msgKey of user.spam.spamMessages) {
            try {
                await conn.sendMessage(m.chat, { delete: msgKey })
                await new Promise(resolve => setTimeout(resolve, 100)) // Pequeño delay
            } catch (e) {
                console.error('[AntiSpam] Error eliminando mensaje spam:', e)
            }
        }
        
        // Incrementar advertencias
        user.spam.warnings++
        
        // Calcular tiempo de mute
        let muteTime = MUTE_PHASES[0].time
        let muteLabel = MUTE_PHASES[0].label
        
        for (let i = MUTE_PHASES.length - 1; i >= 0; i--) {
            if (user.spam.warnings >= MUTE_PHASES[i].warnings) {
                muteTime = MUTE_PHASES[i].time
                muteLabel = MUTE_PHASES[i].label
                break
            }
        }
        
        // Aplicar mute
        user.spam.muted = true
        user.spam.muteEnd = now + muteTime
        user.spam.messages = []
        user.spam.recentMessages = []
        user.spam.deleteCount = 0
        user.spam.spamMessages = []
        
        // Nivel de peligro
        let warningLevel = '🟢 Bajo'
        if (user.spam.warnings >= 25) warningLevel = '🔴 Crítico'
        else if (user.spam.warnings >= 15) warningLevel = '🟠 Alto'
        else if (user.spam.warnings >= 9) warningLevel = '🟡 Medio'
        
        // Siguiente fase
        let nextPhase = MUTE_PHASES.find(p => p.warnings > user.spam.warnings)
        let nextPhaseText = nextPhase ? `${nextPhase.warnings} adv → ${nextPhase.label}` : 'Máximo alcanzado'
        
        // Mensaje de sanción
        const msg = await conn.sendMessage(m.chat, {
            text: `🚨 *SPAM DETECTADO* 🚨\n\n` +
                  `👤 Usuario: @${m.sender.split('@')[0]}\n` +
                  `⚠️ Motivo: *${spamReason}*\n` +
                  `📊 Advertencias: *${user.spam.warnings}*\n` +
                  `🔴 Nivel: ${warningLevel}\n` +
                  `🔇 Silenciado por: *${muteLabel}*\n` +
                  `📈 Siguiente fase: ${nextPhaseText}\n\n` +
                  `⏰ Reseteo en: *${Math.ceil((RESET_WARNINGS - (now - user.spam.lastWarningReset)) / 3600000)}h*\n\n` +
                  `> ✅ Mensajes de spam eliminados\n` +
                  `> 🚫 Mensajes bloqueados hasta cumplir sanción`,
            mentions: [m.sender]
        }).catch(() => {})
        
        setTimeout(() => conn.sendMessage(m.chat, { delete: msg.key }).catch(() => {}), 25000)
        
        console.log(`[AntiSpam] ${m.sender} muteado por ${muteLabel} | Razón: ${spamReason} | Advertencias: ${user.spam.warnings}`)
        
        return true
    }
    
    return false
}

// Comando para gestionar el sistema
let handler = async (m, { conn, isAdmin, args }) => {
    if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos', m)
    if (!isAdmin) return conn.reply(m.chat, '❌ Solo administradores pueden usar este comando', m)
    
    const chat = global.db.data.chats[m.chat]
    
    if (args[0] === 'on' || args[0] === 'activar') {
        if (chat.antispam) return conn.reply(m.chat, '⚠️ El anti-spam ya está activado', m)
        chat.antispam = true
        await conn.reply(m.chat, 
            `✅ *Sistema Anti-Spam Activado*\n\n` +
            `📋 *Configuración:*\n` +
            `• Límite: ${SPAM_THRESHOLD} mensajes en ${SPAM_INTERVAL/1000}s\n` +
            `• Detección múltiple:\n` +
            `  └ Flood de mensajes\n` +
            `  └ Mensajes repetidos (${REPEATED_MSG_THRESHOLD}+ iguales)\n` +
            `  └ Spam de stickers\n` +
            `• Reseteo: cada 5 horas\n` +
            `• Eliminación automática de spam\n\n` +
            `📊 *Fases de Mute:*\n` +
            MUTE_PHASES.map(p => `• ${p.warnings} adv → ${p.label}`).join('\n') + '\n\n' +
            `🛡️ *Comandos:*\n` +
            `• ${conn.prefix}antispam check @user\n` +
            `• ${conn.prefix}antispam reset @user\n` +
            `• ${conn.prefix}antispam off`, m)
            
    } else if (args[0] === 'off' || args[0] === 'desactivar') {
        if (!chat.antispam) return conn.reply(m.chat, '⚠️ El anti-spam ya está desactivado', m)
        chat.antispam = false
        await conn.reply(m.chat, '❌ Sistema Anti-Spam desactivado', m)
        
    } else if (args[0] === 'reset' && args[1]) {
        const user = args[1].replace('@', '').replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        if (global.db.data.users[user]?.spam) {
            global.db.data.users[user].spam = {
                messages: [],
                warnings: 0,
                muted: false,
                muteEnd: 0,
                lastWarningReset: Date.now(),
                deleteCount: 0,
                recentMessages: [],
                spamMessages: []
            }
            await conn.reply(m.chat, `✅ Usuario @${args[1].replace('@', '')} reseteado completamente`, m, { mentions: [user] })
        } else {
            await conn.reply(m.chat, '❌ Usuario sin historial', m)
        }
        
    } else if (args[0] === 'check' && args[1]) {
        const user = args[1].replace('@', '').replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        if (global.db.data.users[user]?.spam) {
            const userSpam = global.db.data.users[user].spam
            const now = Date.now()
            const timeUntilReset = Math.ceil((RESET_WARNINGS - (now - userSpam.lastWarningReset)) / 3600000)
            
            let status = '✅ Normal'
            if (userSpam.muted && now < userSpam.muteEnd) {
                const timeLeft = Math.ceil((userSpam.muteEnd - now) / 60000)
                const hoursLeft = Math.floor(timeLeft / 60)
                const minutesLeft = timeLeft % 60
                status = hoursLeft > 0 ? `🔇 Silenciado (${hoursLeft}h ${minutesLeft}m)` : `🔇 Silenciado (${minutesLeft}m)`
            }
            
            let currentPhase = MUTE_PHASES[0]
            for (let i = MUTE_PHASES.length - 1; i >= 0; i--) {
                if (userSpam.warnings >= MUTE_PHASES[i].warnings) {
                    currentPhase = MUTE_PHASES[i]
                    break
                }
            }
            
            await conn.reply(m.chat, 
                `📊 *Estado de @${args[1].replace('@', '')}*\n\n` +
                `• Advertencias: *${userSpam.warnings}*\n` +
                `• Estado: ${status}\n` +
                `• Fase actual: ${currentPhase.label}\n` +
                `• Reseteo en: *${timeUntilReset}h*`, 
                m, { mentions: [user] })
        } else {
            await conn.reply(m.chat, '❌ Usuario sin historial', m)
        }
        
    } else {
        await conn.reply(m.chat, 
            `🛡️ *Sistema Anti-Spam*\n\n` +
            `*Comandos:*\n` +
            `• ${conn.prefix}antispam on/off\n` +
            `• ${conn.prefix}antispam reset @user\n` +
            `• ${conn.prefix}antispam check @user\n\n` +
            `*Estado:* ${chat.antispam ? '✅ Activado' : '❌ Desactivado'}`, m)
    }
}

handler.help = ['antispam']
handler.tags = ['group']
handler.command = ['antispam', 'antiflood']
handler.group = true
handler.admin = true

export default handler