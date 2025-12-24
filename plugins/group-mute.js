let handler = async (m, { conn, command, usedPrefix, text, args, isAdmin, isBotAdmin }) => {
    let chat = global.db.data.chats[m.chat]
    
    // 🔥 FORZAR sincronización con la base de datos
    if (!chat.muted || !Array.isArray(chat.muted)) {
        // Si no existe, crearla en la DB
        chat.muted = []
        // Guardar inmediatamente en la base de datos
        await global.saveDatabase()
    }

    // --- FUNCIÓN: VER LISTA ---
    if (command === 'mutelist' || args[0] === 'list') {
        // Verificar sincronización
        const dbChat = global.db.data.chats[m.chat]
        const mutedList = dbChat.muted || []
        
        if (mutedList.length === 0) {
            return m.reply('❄️ No hay usuarios silenciados en este grupo.')
        }
        
        let list = mutedList.map((v, i) => `${i + 1}. @${v.split`@`[0]}`).join('\n')
        return conn.reply(m.chat, `📜 *LISTA DE USUARIOS SILENCIADOS*\n━━━━━━━━━━━━━━━━━━━━━━━\n${list}\n━━━━━━━━━━━━━━━━━━━━━━━\n> Usa ${usedPrefix}unmute @usuario para desilenciar.`, m, { mentions: mutedList })
    }

    // --- IDENTIFICAR USUARIO (VERSIÓN MEJORADA) ---
    let who = null
    
    // Método 1: Usuario mencionado en el mensaje
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        who = m.mentionedJid[0]
    }
    
    // Método 2: Usuario citado (respondido)
    if (!who && m.quoted) {
        who = m.quoted.sender
    }
    
    // Método 3: Extraer mención del texto (para casos donde m.mentionedJid no funciona)
    if (!who && text) {
        // Buscar menciones en el formato @número
        const mentionRegex = /@?(\d{5,}|\d{10,})/g
        const matches = text.match(mentionRegex)
        if (matches && matches[0]) {
            const number = matches[0].replace('@', '').trim()
            if (number.length >= 5) {
                who = number + '@s.whatsapp.net'
            }
        }
    }
    
    // Método 4: Si el texto contiene solo números
    if (!who && /^\d+$/.test(text.trim())) {
        who = text.trim() + '@s.whatsapp.net'
    }

    // Si no se identificó usuario y el comando requiere uno
    if (!who && (command === 'mute' || command === 'unmute' || command === 'silenciar' || command === 'desmutear')) {
        return conn.sendMessage(m.chat, {
            text: `❄️ *MENÚ DE MUTE*\n━━━━━━━━━━━━━━━━━━━━━━━\nDebes etiquetar a alguien o responder a un mensaje.\n\n✨ *Ejemplos:*\n• ${usedPrefix}mute @usuario\n• ${usedPrefix}mute (respondiendo a un mensaje)\n\n✨ *Acciones rápidas:*`,
            buttons: [
                { buttonId: `${usedPrefix}mutelist`, buttonText: { displayText: '📜 Ver Silenciados' }, type: 1 }
            ],
            headerType: 1
        }, { quoted: m })
    }

    // Validar que 'who' sea un JID válido antes de continuar
    if (who && !who.includes('@s.whatsapp.net') && !who.includes('@lid')) {
        // Intentar convertir a JID válido
        const cleanNumber = who.replace(/[^0-9]/g, '')
        if (cleanNumber.length >= 5) {
            who = cleanNumber + '@s.whatsapp.net'
        }
    }

    // --- COMANDO: MUTE ---
    if (command === 'mute' || command === 'silenciar') {
        // Validación final de who
        if (!who || !who.includes('@')) {
            return m.reply('⚠️ No se pudo identificar al usuario. Por favor, etiqueta o responde a un mensaje.')
        }
        
        if (who === conn.user.jid) return m.reply('⚠️ No puedo silenciarme a mí mismo.')
        if (who === m.sender) return m.reply('⚠️ No puedes silenciarte a ti mismo.')
        
        // Verificar si ya está silenciado (usando DB actualizada)
        const dbChat = global.db.data.chats[m.chat]
        const isAlreadyMuted = dbChat.muted && dbChat.muted.includes(who)
        
        if (isAlreadyMuted) return m.reply('🌟 Este usuario ya está silenciado.')
        
        // Verificar si es admin del grupo
        try {
            const groupMetadata = await conn.groupMetadata(m.chat)
            const participant = groupMetadata.participants.find(p => p.id === who)
            
            if (!participant) {
                return m.reply('⚠️ Este usuario no está en el grupo.')
            }
            
            if (participant.admin === 'admin' || participant.admin === 'superadmin') {
                return m.reply('⚠️ No puedes silenciar a un *administrador* del grupo.')
            }
            
            // Verificar si quien ejecuta el comando es admin
            const senderParticipant = groupMetadata.participants.find(p => p.id === m.sender)
            if (!senderParticipant || (!senderParticipant.admin && !isOwner && !isROwner)) {
                return m.reply('⚠️ Solo los administradores pueden usar este comando.')
            }
            
        } catch (e) {
            console.error(`Error obteniendo metadatos: ${e.message}`)
            return m.reply('⚠️ Error al verificar permisos.')
        }

        // 🔥 AGREGAR y GUARDAR en DB
        if (!dbChat.muted) dbChat.muted = []
        dbChat.muted.push(who)
        
        // GUARDAR CAMBIOS PERSISTENTEMENTE
        await global.saveDatabase()
        
        await m.react('🔇')
        
        // Notificar al grupo
        await conn.sendMessage(m.chat, {
            text: `🔇 *USUARIO SILENCIADO*\n━━━━━━━━━━━━━━━━━━━━━━━\n@${who.split`@`[0]} ha sido silenciado.\n\n❌ Sus mensajes serán eliminados automáticamente.\n🔓 Para desilenciar: ${usedPrefix}unmute @${who.split`@`[0]}\n━━━━━━━━━━━━━━━━━━━━━━━`,
            mentions: [who]
        }, { quoted: m })
        
        // Obtener nombre del grupo para la notificación
        let groupName = 'grupo'
        try {
            const groupMetadata = await conn.groupMetadata(m.chat)
            groupName = groupMetadata.subject || 'grupo'
        } catch (e) {}
        
        // Notificar al usuario silenciado
        try {
            await conn.sendMessage(who, {
                text: `🔇 *HAS SIDO SILENCIADO*\n\nHas sido silenciado en el grupo *${groupName}*.\n\n📍 Grupo: ${groupName}\n👤 Por: @${m.sender.split`@`[0]}\n\nNo podrás enviar mensajes hasta que un admin te desilencie.`,
                mentions: [m.sender]
            })
        } catch (dmErr) {
            console.log('[MUTE] No se pudo enviar DM al usuario')
        }
    }

    // --- COMANDO: UNMUTE ---
    if (command === 'unmute' || command === 'desmutear') {
        // Validación final de who
        if (!who || !who.includes('@')) {
            return m.reply('⚠️ No se pudo identificar al usuario. Por favor, etiqueta o responde a un mensaje.')
        }
        
        // 🔥 Obtener datos FRESCOS de la DB
        const dbChat = global.db.data.chats[m.chat]
        const mutedList = dbChat.muted || []
        
        if (!mutedList.includes(who)) {
            return m.reply('❄️ Este usuario no está en la lista de silenciados.')
        }
        
        // Verificar permisos
        try {
            const groupMetadata = await conn.groupMetadata(m.chat)
            const senderParticipant = groupMetadata.participants.find(p => p.id === m.sender)
            if (!senderParticipant || (!senderParticipant.admin && !isOwner && !isROwner)) {
                return m.reply('⚠️ Solo los administradores pueden usar este comando.')
            }
        } catch (e) {
            console.error(`Error verificando permisos: ${e.message}`)
        }
        
        // 🔥 REMOVER y GUARDAR en DB
        // Filtrar el usuario de la lista
        dbChat.muted = mutedList.filter(u => u !== who)
        
        // GUARDAR CAMBIOS PERSISTENTEMENTE
        await global.saveDatabase()
        
        // 🔥 FORZAR recarga del handler para aplicar cambios inmediatos
        try {
            // Forzar actualización de la caché del handler
            if (global.reloadHandler) {
                await global.reloadHandler()
            }
        } catch (reloadErr) {
            console.error('[UNMUTE] Error recargando handler:', reloadErr)
        }
        
        await m.react('🔊')
        
        // Notificar al grupo
        await conn.reply(m.chat, 
            `🔊 *USUARIO DESILENCIADO*\n━━━━━━━━━━━━━━━━━━━━━━━\n@${who.split`@`[0]} ya puede hablar normalmente.\n\n✅ Lista actualizada en la base de datos.`, 
            m, 
            { mentions: [who] }
        )
        
        // Verificación de que se removió correctamente
        console.log(`[UNMUTE] Usuario ${who} removido. Lista actual:`, dbChat.muted)
        
        // Obtener nombre del grupo para la notificación
        let groupName = 'grupo'
        try {
            const groupMetadata = await conn.groupMetadata(m.chat)
            groupName = groupMetadata.subject || 'grupo'
        } catch (e) {}
        
        // Notificar al usuario
        try {
            await conn.sendMessage(who, {
                text: `🔊 *YA PUEDES HABLAR*\n\nHas sido desilenciado en el grupo *${groupName}*.\n\nAhora puedes enviar mensajes normalmente.`
            })
        } catch (dmErr) {
            console.log('[UNMUTE] No se pudo notificar al usuario')
        }
    }
}

handler.help = ['mute @usuario', 'unmute @usuario', 'mutelist']
handler.tags = ['group']
handler.command = ['mute', 'silenciar', 'unmute', 'desmutear', 'mutelist']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
