const handler = async (m, { conn }) => {
    // Solo procesar en grupos
    if (!m.isGroup) return
    
    const chat = global.db.data.chats[m.chat]
    
    // Verificar si existe la lista de silenciados
    if (!chat.muted || !Array.isArray(chat.muted)) {
        chat.muted = []
        return
    }
    
    // Verificar si el remitente está en la lista de silenciados
    if (chat.muted.includes(m.sender)) {
        try {
            // Eliminar el mensaje del usuario silenciado
            await conn.sendMessage(m.chat, {
                delete: {
                    remoteJid: m.chat,
                    fromMe: false,
                    id: m.key.id,
                    participant: m.sender
                }
            })
            
            // Opcional: Enviar advertencia
            await conn.sendMessage(m.chat, {
                text: `⚠️ *MENSAJE ELIMINADO*\n@${m.sender.split`@`[0]} está silenciado y no puede enviar mensajes.\n━━━━━━━━━━━━━━━━━━━━━━━\nUsa *${conn.prefix}unmute @usuario* para permitirle hablar.`,
                mentions: [m.sender]
            }, {
                quoted: null
            })
            
        } catch (error) {
            console.error('Error eliminando mensaje de usuario muteado:', error)
        }
    }
}

handler.before = async (m) => {
    // Solo verificar si es un mensaje de texto normal (no comandos)
    if (!m.isGroup || m.isBaileys || m.fromMe) return
    
    const chat = global.db.data.chats[m.chat]
    if (!chat.muted || !Array.isArray(chat.muted)) {
        chat.muted = []
        return
    }
    
    // Si el usuario está muteado, prevenir procesamiento adicional
    if (chat.muted.includes(m.sender)) {
        return true // Detiene el procesamiento
    }
}

handler.group = true
handler.botAdmin = true // Requiere que el bot sea admin para eliminar mensajes

export default handler
