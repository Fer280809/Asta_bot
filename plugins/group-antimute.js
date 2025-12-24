// Sistema de eliminación automática de mensajes de usuarios muteados
let handler = async (m, { conn }) => {
    // Solo en grupos
    if (!m.isGroup) return false
    
    const chat = global.db.data.chats[m.chat]
    if (!chat || !chat.muted || chat.muted.length === 0) return false
    
    // Verificar si el remitente está muteado
    const isMuted = chat.muted.some(u => {
        if (typeof u === 'string') return u === m.sender
        return u.id === m.sender
    })
    
    if (isMuted) {
        try {
            // Intentar eliminar el mensaje
            await conn.sendMessage(m.chat, {
                delete: {
                    remoteJid: m.chat,
                    fromMe: false,
                    id: m.key.id,
                    participant: m.sender
                }
            })
            
            // Opcional: Enviar notificación privada al que muteó
            /*
            const mutedUser = chat.muted.find(u => {
                if (typeof u === 'object') return u.id === m.sender
                return u === m.sender
            })
            
            if (mutedUser && typeof mutedUser === 'object' && mutedUser.mutedBy) {
                try {
                    await conn.sendMessage(mutedUser.mutedBy, {
                        text: `🗑️ *Mensaje eliminado*\n━━━━━━━━━━━━━━━━━━━━━━━\nEliminé un mensaje de *${mutedUser.name}* en el grupo.\n📝 Contenido: ${m.text?.substring(0, 50)}...`
                    })
                } catch (e) {}
            }
            */
            
            return true // Mensaje eliminado
        } catch (error) {
            // Error al eliminar (posiblemente no tenemos permisos)
            console.error('Error eliminando mensaje de usuario muteado:', error.message)
            
            // Notificar al grupo que no se pudo eliminar
            if (error.message.includes('not authorized')) {
                await conn.sendMessage(m.chat, {
                    text: `⚠️ *ADVERTENCIA*\nNo pude eliminar el mensaje de un usuario muteado.\n\n*Posibles causas:*\n• El bot no es administrador\n• Permisos insuficientes\n• El mensaje es antiguo\n\n💡 Verifica que el bot tenga permisos de administrador.`
                }, { quoted: m })
            }
            
            return false
        }
    }
    
    return false
}

// Este handler se ejecuta ANTES que otros handlers
handler.before = async function(m) {
    await handler(m, { conn: this })
    return false // Continuar con otros handlers
}

handler.group = true
export default handler
