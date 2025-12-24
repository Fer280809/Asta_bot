let handler = async (m, { conn, command, usedPrefix, text, args }) => {
    let chat = global.db.data.chats[m.chat]
    if (!chat.muted) chat.muted = []

    // --- FUNCIÓN: VER LISTA ---
    if (command === 'mutelist' || args[0] === 'list') {
        if (chat.muted.length === 0) {
            return m.reply('❄️ No hay usuarios silenciados en este grupo.')
        }
        let list = chat.muted.map((v, i) => `${i + 1}. @${v.split`@`[0]}`).join('\n')
        return conn.reply(m.chat, `📜 *LISTA DE USUARIOS MUTEADOS*\n━━━━━━━━━━━━━━━━━━━━━━━\n${list}\n━━━━━━━━━━━━━━━━━━━━━━━\n> Usa ${usedPrefix}unmute @usuario para desmutear.\n> Usa ${usedPrefix}mutelist para ver esta lista.`, m, { mentions: chat.muted })
    }

    // --- FUNCIÓN: LIMPIAR LISTA ---
    if (args[0] === 'clear' || args[0] === 'limpiar') {
        if (chat.muted.length === 0) {
            return m.reply('❄️ La lista de muteados ya está vacía.')
        }
        
        const confirmacion = args[1]
        if (confirmacion !== 'confirm') {
            return m.reply(`⚠️ *CONFIRMACIÓN REQUERIDA*\n━━━━━━━━━━━━━━━━━━━━━━━\nEstás a punto de eliminar a *${chat.muted.length} usuarios* de la lista de muteos.\n\nEscribe: ${usedPrefix}mute clear confirm\n━━━━━━━━━━━━━━━━━━━━━━━\nEsto no los desmuteará, solo los eliminará de la lista.`)
        }
        
        const cantidad = chat.muted.length
        chat.muted = []
        await m.react('🗑️')
        return m.reply(`✅ *LISTA LIMPIADA*\n━━━━━━━━━━━━━━━━━━━━━━━\nSe eliminaron ${cantidad} usuarios de la lista de muteos.`)
    }

    // --- FUNCIÓN: AYUDA ---
    if (args[0] === 'help' || args[0] === 'ayuda' || command === 'mutehelp') {
        return conn.sendMessage(m.chat, {
            text: `🔇 *AYUDA COMANDOS MUTE*\n━━━━━━━━━━━━━━━━━━━━━━━\n\n*Comandos disponibles:*\n• ${usedPrefix}mute @usuario [razón]\n• ${usedPrefix}unmute @usuario\n• ${usedPrefix}mutelist\n• ${usedPrefix}mute clear confirm\n• ${usedPrefix}mute help\n\n*Ejemplos:*\n${usedPrefix}mute @usuario Spam\n${usedPrefix}mute (respondiendo mensaje)\n${usedPrefix}unmute @usuario\n\n*Notas:*\n• Solo administradores pueden usar\n• El bot debe ser admin\n• Los mensajes de muteados se eliminan automáticamente\n━━━━━━━━━━━━━━━━━━━━━━━`,
            buttons: [
                { buttonId: `${usedPrefix}mutelist`, buttonText: { displayText: '📜 Ver Muteados' }, type: 1 },
                { buttonId: `${usedPrefix}mute help`, buttonText: { displayText: '❓ Ayuda' }, type: 1 }
            ],
            headerType: 1
        }, { quoted: m })
    }

    // --- IDENTIFICAR USUARIO ---
    let who = m.mentionedJid && m.mentionedJid[0] || m.quoted && m.quoted.sender || null
    
    if (!who && (command === 'mute' || command === 'unmute')) {
        return conn.sendMessage(m.chat, {
            text: `🔇 *MENÚ DE MUTE*\n━━━━━━━━━━━━━━━━━━━━━━━\nDebes etiquetar a alguien o responder a un mensaje.\n\n✨ *Acciones rápidas:*`,
            buttons: [
                { buttonId: `${usedPrefix}mutelist`, buttonText: { displayText: '📜 Ver Muteados' }, type: 1 },
                { buttonId: `${usedPrefix}mute help`, buttonText: { displayText: '❓ Ayuda' }, type: 1 }
            ],
            headerType: 1
        }, { quoted: m })
    }

    // --- COMANDO: MUTE ---
    if (command === 'mute' || command === 'silenciar') {
        if (who === conn.user.jid) return m.reply('⚠️ No puedo silenciarme a mí mismo.')
        if (chat.muted.includes(who)) return m.reply('🌟 Este usuario ya está silenciado.')
        
        try {
            const groupMetadata = await conn.groupMetadata(m.chat)
            const isAdmin = groupMetadata.participants.find(p => p.id === who)?.admin
            if (isAdmin) return m.reply('⚠️ No puedes silenciar a un *administrador* del grupo.')
        } catch (e) {
            console.error(`Error obteniendo metadatos del grupo: ${e.message}`)
            return m.reply('⚠️ No pude obtener los datos del grupo para verificar el estado del usuario.')
        }

        // Obtener razón (si existe)
        const razon = args.slice(m.mentionedJid && m.mentionedJid.length > 0 ? 1 : 0).join(' ') || 'Sin razón especificada'
        
        // Obtener nombre del usuario
        let userName = who.split('@')[0]
        try {
            const contact = await conn.getContact(who)
            userName = contact?.name || contact?.pushname || userName
        } catch (e) {}
        
        // Agregar con información adicional
        chat.muted.push({
            id: who,
            name: userName,
            mutedBy: m.sender,
            mutedAt: new Date().toISOString(),
            reason: razon
        })
        
        await m.react('🔇')
        
        await conn.sendMessage(m.chat, {
            text: `🤐 *USUARIO MUTEADO* 🔇\n━━━━━━━━━━━━━━━━━━━━━━━\n@${who.split`@`[0]} ha sido silenciado.\n📝 *Razón:* ${razon}\n━━━━━━━━━━━━━━━━━━━━━━━`,
            buttons: [
                { buttonId: `${usedPrefix}unmute @${who.split`@`[0]}`, buttonText: { displayText: '🔊 Desmutear' }, type: 1 },
                { buttonId: `${usedPrefix}mutelist`, buttonText: { displayText: '📜 Ver Lista' }, type: 1 }
            ],
            mentions: [who],
            headerType: 1
        }, { quoted: m })
    }

    // --- COMANDO: UNMUTE ---
    if (command === 'unmute' || command === 'desmutear') {
        // Buscar usuario en la lista (compatible con nueva estructura de objetos)
        const mutedIndex = chat.muted.findIndex(u => {
            if (typeof u === 'string') return u === who
            return u.id === who
        })
        
        if (mutedIndex === -1) {
            return m.reply('❄️ Este usuario no está en la lista de silenciados.')
        }
        
        // Remover de la lista
        const unmutedUser = chat.muted.splice(mutedIndex, 1)[0]
        const userName = typeof unmutedUser === 'object' ? unmutedUser.name : unmutedUser.split('@')[0]
        
        await m.react('🔊')
        await conn.reply(m.chat, `🔔 *USUARIO DESMUTEADO*\n━━━━━━━━━━━━━━━━━━━━━━━\n@${who.split`@`[0]} (${userName}) ya puede hablar.\n━━━━━━━━━━━━━━━━━━━━━━━`, m, { mentions: [who] })
    }

    // --- COMANDO: INFO MUTE ---
    if (command === 'muteinfo' || (args[0] === 'info' && who)) {
        if (!who) return m.reply(`⚠️ Debes mencionar a un usuario.\nEjemplo: ${usedPrefix}muteinfo @usuario`)
        
        // Buscar información del usuario muteado
        const mutedUser = chat.muted.find(u => {
            if (typeof u === 'string') return u === who
            return u.id === who
        })
        
        if (!mutedUser) {
            return m.reply('✅ Este usuario no está muteado.')
        }
        
        let infoText = `📋 *INFORMACIÓN DE MUTE*\n━━━━━━━━━━━━━━━━━━━━━━━\n`
        
        if (typeof mutedUser === 'object') {
            const mutedDate = new Date(mutedUser.mutedAt)
            const timeAgo = formatTimeAgo(mutedDate)
            
            infoText += `👤 *Usuario:* @${who.split`@`[0]}\n`
            infoText += `📝 *Nombre:* ${mutedUser.name}\n`
            infoText += `📄 *Razón:* ${mutedUser.reason}\n`
            infoText += `⏰ *Muteado hace:* ${timeAgo}\n`
            infoText += `🔧 *Muteado por:* @${mutedUser.mutedBy.split`@`[0]}\n`
        } else {
            infoText += `👤 *Usuario:* @${who.split`@`[0]}\n`
            infoText += `📝 *Información:* Datos básicos\n`
        }
        
        infoText += `━━━━━━━━━━━━━━━━━━━━━━━\n`
        infoText += `💡 Usa ${usedPrefix}unmute @${who.split`@`[0]} para desmutear`
        
        await conn.reply(m.chat, infoText, m, { mentions: [who] })
    }
}

// Función para formatear tiempo
function formatTimeAgo(date) {
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMins < 60) return `${diffMins} minuto${diffMins !== 1 ? 's' : ''}`
    if (diffHours < 24) return `${diffHours} hora${diffHours !== 1 ? 's' : ''}`
    return `${diffDays} día${diffDays !== 1 ? 's' : ''}`
}

handler.help = ['mute', 'unmute', 'mutelist', 'muteinfo', 'mutehelp']
handler.tags = ['group']
handler.command = ['mute', 'silenciar', 'unmute', 'desmutear', 'mutelist', 'muteinfo', 'mutehelp']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
