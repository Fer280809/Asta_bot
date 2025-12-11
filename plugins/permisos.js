let handler = async (m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) => {
    const info = `
📊 *INFORMACIÓN DE PERMISOS*

👤 Usuario: @${m.sender.split('@')[0]}
💬 Chat: ${m.isGroup ? 'Grupo' : 'Privado'}

🔐 *PERMISOS DETECTADOS:*
• 👑 Owner: ${isOwner ? '✅ SI' : '❌ NO'}
• 🏆 Root Owner: ${isROwner ? '✅ SI' : '❌ NO'}
• ⚡ Admin del grupo: ${isAdmin ? '✅ SI' : '❌ NO'}
• 🤖 Bot es admin: ${isBotAdmin ? '✅ SI' : '❌ NO'}

💡 *modoadmin activado:* ${global.db.data.chats[m.chat]?.modoadmin ? '✅ SI' : '❌ NO'}
    `.trim()
    
    await conn.reply(m.chat, info, m, {
        mentions: [m.sender]
    })
}

handler.help = ['testadmin']
handler.tags = ['info']
handler.command = ['testadmin', 'perms']
handler.group = true

export default handler