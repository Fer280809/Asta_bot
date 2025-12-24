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

    // --- IDENTIFICAR USUARIO ---
    let who = m.mentionedJid && m.mentionedJid[0] || m.quoted && m.quoted.sender || null
    
    if (!who && (command === 'mute' || command === 'unmute')) {
        return conn.sendMessage(m.chat, {
            text: `❄️ *MENÚ DE MUTE*\n━━━━━━━━━━━━━━━━━━━━━━━\nDebes etiquetar a alguien o responder a un mensaje.\n\n✨ *Acciones rápidas:*`,
            buttons: [
                { buttonId: `${usedPrefix}mutelist`, buttonText: { displayText: '📜 Ver Silenciados' }, type: 1 }
            ],
            headerType: 1
        }, { quoted: m })
    }

    // --- COMANDO: MUTE ---
    if (command === 'mute' || command === 'silenciar') {
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
        
        // Notificar al usuario silenciado
        try {
            await conn.sendMessage(who, {
                text: `🔇 *HAS SIDO SILENCIADO*\n\nHas sido silenciado en el grupo *${groupMetadata?.subject || 'grupo'}*.\n\n📍 Grupo: ${groupMetadata?.subject || 'Desconocido'}\n👤 Por: @${m.sender.split`@`[0]}\n\nNo podrás enviar mensajes hasta que un admin te desilencie.`,
                mentions: [m.sender]
            })
        } catch (dmErr) {
            console.log('[MUTE] No se pudo enviar DM al usuario')
        }
    }

    // --- COMANDO: UNMUTE ---
    if (command === 'unmute' || command === 'desmutear') {
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
        
        // Notificar al usuario
        try {
            await conn.sendMessage(who, {
                text: `🔊 *YA PUEDES HABLAR*\n\nHas sido desilenciado en el grupo *${groupMetadata?.subject || 'grupo'}*.\n\nAhora puedes enviar mensajes normalmente.`
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
