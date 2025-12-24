// plugins/reset-mute.js
let handler = async (m, { conn, isOwner }) => {
    if (!isOwner) return
    
    const chat = global.db.data.chats[m.chat]
    const oldList = chat.muted || []
    chat.muted = []
    
    await global.saveDatabase()
    await m.reply(`🔄 *RESET MUTE COMPLETO*\n\n✅ Lista limpiada: ${oldList.length} usuarios\n\nBase de datos guardada.`)
}

handler.command = ['resetmute']
handler.owner = true
export default handler
