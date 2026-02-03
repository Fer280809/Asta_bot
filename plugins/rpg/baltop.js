let handler = async (m, { conn, args, participants, usedPrefix }) => {
    if (!db.data.chats[m.chat].economy && m.isGroup) {
        return m.reply(`🚫《✦》Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on* ✅`)
    }
    
    // Obtener todos los usuarios con datos de economía válidos
    const users = Object.entries(global.db.data.users)
        .map(([jid, data]) => ({
            jid,
            coin: data.coin || 0,
            bank: data.bank || 0,
            name: data.name || jid.split('@')[0]
        }))
        .filter(user => (user.coin + user.bank) > 0) // Solo usuarios con dinero
    
    // Ordenar por total de dinero (coin + bank)
    const sorted = users.sort((a, b) => (b.coin + b.bank) - (a.coin + a.bank))
    
    const totalPages = Math.ceil(sorted.length / 10)
    const page = Math.max(1, Math.min(parseInt(args[0]) || 1, totalPages))
    const startIndex = (page - 1) * 10
    const endIndex = startIndex + 10
    
    // Emojis de medallas para top 3
    const medals = ['🥇', '🥈', '🥉']
    
    let text = `╭━━━━━━━━━━━━━━━━╮
┃  💎 *RANKING DE RIQUEZA* 💎
╰━━━━━━━━━━━━━━━━╯

📊 *Top Usuarios con más ${currency}*\n\n`
    
    const slice = sorted.slice(startIndex, endIndex)
    
    for (let i = 0; i < slice.length; i++) {
        const { jid, coin, bank, name } = slice[i]
        const total = coin + bank
        const position = startIndex + i + 1
        
        // Obtener nombre actualizado del usuario
        let userName = name
        try {
            const contactName = await conn.getName(jid)
            if (contactName && typeof contactName === 'string' && contactName.trim()) {
                userName = contactName.trim()
            }
        } catch (e) {
            userName = name
        }
        
        // Añadir medalla si está en top 3
        const medal = position <= 3 ? medals[position - 1] : '◈'
        
        text += `${medal} *#${position}* ┃ ${userName}\n`
        text += `   └─ 💰 *¥${total.toLocaleString()}* ${currency}\n`
        text += `   └─ 💵 Efectivo: ¥${coin.toLocaleString()}\n`
        text += `   └─ 🏦 Banco: ¥${bank.toLocaleString()}\n\n`
    }
    
    text += `╭─────────────────╮
┃ 📄 Página *${page}* de *${totalPages}*
╰─────────────────╯

💡 *Tip:* Usa *${usedPrefix}baltop [página]* para ver otras páginas`
    
    await conn.reply(m.chat, text.trim(), m, { mentions: conn.parseMention(text) })
}

handler.help = ['baltop']
handler.tags = ['rpg']
handler.command = ['baltop', 'eboard', 'economyboard']
handler.group = true

export default handler
