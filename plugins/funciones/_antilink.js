// Regex mejorado para detectar TODOS los tipos de enlaces
const linkRegex = /(?:(?:https?|ftp):\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/gi
const whatsappLinkRegex = /(chat\.whatsapp\.com\/[0-9A-Za-z]{20,24})|(whatsapp\.com\/channel\/[0-9A-Za-z]{20,24})/i
const allowedLinks = ['https://whatsapp.com/channel/0029Vb64nWqLo4hb8cuxe23n']

export async function before(m, { conn, isAdmin, isBotAdmin, isROwner }) {
    // Verificaciones básicas
    if (!m.isGroup) return
    if (!m.text) return
    if (isAdmin || isROwner) return // Los admins pueden enviar links
    if (!isBotAdmin) return // El bot necesita ser admin
    
    const chat = global?.db?.data?.chats?.[m.chat]
    if (!chat || !chat.antilink) return // Verificar que antilink esté activo
    
    const text = m.text.toLowerCase()
    
    // Verificar links permitidos primero
    const hasAllowedLink = allowedLinks.some(link => text.includes(link.toLowerCase()))
    if (hasAllowedLink) return
    
    // Detectar si es link de WhatsApp
    const isWhatsAppLink = whatsappLinkRegex.test(m.text)
    
    // Detectar cualquier otro tipo de link
    const hasAnyLink = linkRegex.test(m.text)
    
    // Si detecta algún link
    if (isWhatsAppLink || hasAnyLink) {
        console.log('🔗 Link detectado:', m.text) // Para debug
        
        // Si es link de WhatsApp, verificar que no sea del mismo grupo
        if (isWhatsAppLink) {
            try {
                const linkThisGroup = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`
                if (m.text.includes(linkThisGroup)) {
                    console.log('✅ Es el link del mismo grupo')
                    return
                }
            } catch (e) {
                console.error('Error al obtener invite code:', e)
            }
        }
        
        try {
            // Obtener el participante que envió el mensaje
            const participant = m.key.participant || m.participant || m.sender
            
            console.log('🚫 Intentando eliminar mensaje de:', participant)
            
            // 1. Eliminar el mensaje
            await conn.sendMessage(m.chat, { 
                delete: { 
                    remoteJid: m.chat, 
                    fromMe: false, 
                    id: m.key.id, 
                    participant: participant 
                }
            })
            
            console.log('✅ Mensaje eliminado')
            
            // 2. Enviar advertencia
            const userName = global.db?.data?.users?.[participant]?.name || 'Usuario'
            const linkType = isWhatsAppLink ? 'WhatsApp' : 'externos'
            
            await conn.sendMessage(m.chat, {
                text: `╭━━━━━━━━━⬣
┃ ⚠️ *ANTI-LINK ACTIVADO*
┃
┃ 👤 Usuario: @${participant.split('@')[0]}
┃ 🚫 Motivo: Link ${linkType} detectado
┃ ⚡ Acción: Eliminado del grupo
╰━━━━━━━━━⬣`,
                mentions: [participant]
            })
            
            console.log('✅ Advertencia enviada')
            
            // 3. Pequeña pausa
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // 4. Eliminar del grupo
            const result = await conn.groupParticipantsUpdate(m.chat, [participant], 'remove')
            
            console.log('✅ Usuario eliminado:', result)
            
        } catch (error) {
            console.error('❌ Error en antilink:', error)
            // Intentar al menos enviar un mensaje de error
            await conn.reply(m.chat, `⚠️ Error al ejecutar antilink: ${error.message}`, m)
        }
        
        return true // Detener el procesamiento del mensaje
    }
}