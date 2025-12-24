// plugins/debug-mute.js
let handler = async (m, { conn }) => {
    const chat = global.db.data.chats[m.chat]
    const mutedList = chat.muted || []
    
    await m.reply(`🔍 *DEBUG MUTE*\n\n📊 Estado DB: ${JSON.stringify(chat, null, 2)}\n\n👥 Usuarios muteados: ${mutedList.length}\n${mutedList.map((v, i) => `${i+1}. ${v}`).join('\n')}`)
}

handler.command = ['debugmute']
handler.admin = true
export default handler
