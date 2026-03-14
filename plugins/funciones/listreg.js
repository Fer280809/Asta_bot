let handler = async (m, { conn, args }) => {
    const users = Object.entries(global.db.data.users)
        .filter(([_, u]) => u.registered)
        .sort((a, b) => (b[1].regTime || 0) - (a[1].regTime || 0))
    
    const page = parseInt(args[0]) || 1
    const totalPages = Math.ceil(users.length / 20)
    const start = (page - 1) * 20
    const end = start + 20
    const pageUsers = users.slice(start, end)
    
    let text = `📊 *LISTA DE USUARIOS REGISTRADOS*\n\n`
    text += `Total: ${users.length} usuarios | Página ${page} de ${totalPages}\n\n`
    
    for (let i = 0; i < pageUsers.length; i++) {
        const [jid, user] = pageUsers[i]
        const num = start + i + 1
        const fecha = user.regTime ? new Date(user.regTime).toLocaleDateString() : 'N/A'
        text += `${num}. ${user.name || 'Sin nombre'} (${user.age || '?'} años)\n`
        text += `   🆔 ${jid.split('@')[0]} | 📅 ${fecha}\n\n`
    }
    
    if (page < totalPages) {
        text += `\n> Usa *#listreg ${page + 1}* para ver más`
    }
    
    await conn.reply(m.chat, text, m)
}

handler.help = ['listreg']
handler.tags = ['owner']
handler.command = ['listreg', 'registrados']
handler.rowner = true
// NO lleva handler.reg = true porque es solo para owners

export default handler
