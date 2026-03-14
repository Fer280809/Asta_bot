// Filtro de Modo Admin - Solo permite comandos a Admins y Global Owners
// Se activa/desactiva desde nable con: #modoadmin on / #modoadmin off

export async function before(m, { conn, isAdmin, isROwner, isBotAdmin }) {
    // Solo aplica en grupos
    if (!m.isGroup) return
    
    // Si no hay texto, no es comando
    if (!m.text) return
    
    // Global Owners siempre pueden usar comandos
    if (isROwner) return
    
    // El bot siempre puede responder a sí mismo
    if (m.fromMe) return
    
    // Si el bot no es admin, no puede controlar el grupo (pero dejamos pasar para que otros handlers decidan)
    if (!isBotAdmin) return
    
    // Verificar si modo admin está activado en este grupo
    const chat = global?.db?.data?.chats?.[m.chat]
    if (!chat || !chat.modoadmin) return
    
    // Los admins del grupo pueden usar comandos normalmente
    if (isAdmin) return
    
    // Si llegó aquí: es usuario normal + modo admin activo = BLOQUEAR
    console.log(`🔒 [MODADMIN] Ignorado: ${m.sender.split('@')[0]} | Msg: ${m.text.substring(0, 40)}`)
    
    // Silenciosamente ignorar - el bot NO responde nada al usuario
    return true
}