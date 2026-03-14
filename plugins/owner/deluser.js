let handler = async (m, { conn, command, text }) => {
    // Verificar que se haya mencionado o etiquetado a alguien
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null
    
    if (!who) {
        return conn.reply(m.chat, `❀ Por favor, menciona, etiqueta o escribe el número del usuario cuyos mensajes deseas eliminar.\n\nEjemplo: ${command} @usuario o ${command} 123456789`, m)
    }

    // Mensaje inicial que se actualizará
    let statusMsg = await conn.reply(m.chat, `🗑️ *ELIMINACIÓN INICIADA*\n\n👤 Usuario: @${who.split('@')[0]}\n⏳ Buscando mensajes...`, m, { mentions: [who] })

    let deletedCount = 0
    let errorCount = 0
    let totalChecked = 0
    let lastUpdate = Date.now()
    
    // Función para actualizar el mensaje de estado
    const updateStatus = async (force = false) => {
        const now = Date.now()
        if (force || now - lastUpdate > 3000) {
            try {
                await conn.sendMessage(m.chat, {
                    text: `🗑️ *ELIMINANDO MENSAJES*\n\n👤 @${who.split('@')[0]}\n📊 Revisados: ${totalChecked}\n✅ Eliminados: ${deletedCount}\n❌ Errores: ${errorCount}\n\n⏳ Procesando...`,
                    edit: statusMsg.key,
                    mentions: [who]
                }).catch(() => {})
                lastUpdate = now
            } catch {}
        }
    }
    
    try {
        let allMessages = []
        
        // Recopilar mensajes de todas las fuentes disponibles
        // 1. Store de Baileys
        try {
            const store = conn.store || global.store
            if (store?.messages?.[m.chat]) {
                const msgs = store.messages[m.chat]
                const msgArray = Array.isArray(msgs) ? msgs : Object.values(msgs)
                allMessages.push(...msgArray.filter(msg => msg?.key?.id))
            }
        } catch (e) {}
        
        // 2. Chats
        try {
            if (conn.chats?.[m.chat]?.messages) {
                const chatMsgs = Object.values(conn.chats[m.chat].messages)
                allMessages.push(...chatMsgs.filter(msg => msg?.key?.id))
            }
        } catch (e) {}
        
        // 3. Base de datos global
        try {
            if (global.db?.data?.chats?.[m.chat]?.messages) {
                allMessages.push(...global.db.data.chats[m.chat].messages.filter(msg => msg?.key?.id))
            }
        } catch (e) {}
        
        // 4. Cargar mensajes adicionales
        try {
            if (conn.loadMessage) {
                for (let i = 0; i < 3; i++) {
                    const loaded = await conn.loadMessage(m.chat, 500).catch(() => null)
                    if (loaded) {
                        const msgArray = Array.isArray(loaded) ? loaded : [loaded]
                        allMessages.push(...msgArray.filter(msg => msg?.key?.id))
                    }
                }
            }
        } catch (e) {}
        
        // Eliminar duplicados
        const seenIds = new Set()
        const uniqueMessages = allMessages.filter(msg => {
            const id = msg?.key?.id
            if (!id || seenIds.has(id)) return false
            seenIds.add(id)
            return true
        })
        
        if (uniqueMessages.length === 0) {
            await conn.sendMessage(m.chat, {
                text: `⚠️ *No se encontraron mensajes en caché*\n\n👤 @${who.split('@')[0]}\n\n💡 El bot solo puede eliminar mensajes que tenga guardados en memoria.`,
                edit: statusMsg.key,
                mentions: [who]
            })
            return
        }
        
        await updateStatus(true)
        
        // ELIMINAR mensajes del usuario
        const whoNumber = who.split('@')[0]
        
        for (const msg of uniqueMessages) {
            totalChecked++
            
            try {
                const key = msg.key
                if (!key) continue
                
                // Identificar si es del usuario
                const participant = key.participant || ''
                const remoteJid = key.remoteJid || ''
                const fromMe = key.fromMe
                
                // Solo eliminar si NO es fromMe y coincide con el usuario
                const isFromUser = !fromMe && (
                    participant === who ||
                    participant.includes(whoNumber) ||
                    remoteJid === who ||
                    remoteJid.includes(whoNumber)
                )
                
                if (isFromUser) {
                    let deleted = false
                    
                    // Intento 1: Método estándar
                    try {
                        await conn.sendMessage(m.chat, { delete: key })
                        deleted = true
                        deletedCount++
                    } catch (e) {
                        // Intento 2: Método extendido
                        try {
                            await conn.sendMessage(m.chat, { 
                                delete: { 
                                    remoteJid: m.chat, 
                                    fromMe: false, 
                                    id: key.id, 
                                    participant: participant || who
                                }
                            })
                            deleted = true
                            deletedCount++
                        } catch (e2) {
                            errorCount++
                        }
                    }
                    
                    // Delay entre eliminaciones
                    await new Promise(r => setTimeout(r, 300))
                }
            } catch (e) {
                errorCount++
            }
            
            // Actualizar cada 10 mensajes
            if (totalChecked % 10 === 0) {
                await updateStatus()
            }
        }
        
        // Mensaje final
        let resultMsg = `✅ *PROCESO COMPLETADO*\n\n`
        resultMsg += `👤 Usuario: @${who.split('@')[0]}\n\n`
        resultMsg += `📊 Mensajes revisados: ${totalChecked}\n`
        resultMsg += `🗑️ Eliminados exitosamente: ${deletedCount}\n`
        resultMsg += `❌ No se pudieron eliminar: ${errorCount}\n`
        resultMsg += `💾 Total en caché: ${uniqueMessages.length}\n\n`
        
        if (deletedCount === 0) {
            resultMsg += `⚠️ No se encontraron mensajes de este usuario en el caché disponible.`
        } else {
            resultMsg += `✅ Se eliminaron todos los mensajes disponibles del usuario.`
        }
        
        await conn.sendMessage(m.chat, {
            text: resultMsg,
            edit: statusMsg.key,
            mentions: [who]
        })
        
    } catch (error) {
        console.error('ERROR:', error)
        try {
            await conn.sendMessage(m.chat, {
                text: `❌ *Error durante la eliminación*\n\n📊 Eliminados: ${deletedCount}\n❌ Errores: ${errorCount}\n\n${error.message}`,
                edit: statusMsg.key
            })
        } catch {
            conn.reply(m.chat, `❌ Error: ${error.message}\nEliminados: ${deletedCount}`, m)
        }
    }
}

handler.help = ['deleteuser @usuario']
handler.tags = ['grupo']
handler.command = ['deleteuser', 'deluser', 'eliminarusuario']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler