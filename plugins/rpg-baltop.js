let handler = async (m, { conn, args, participants, usedPrefix }) => {
    if (!db.data.chats[m.chat].economy && m.isGroup) {
        return m.reply(`🚫 *Economía desactivada*\n\nLos comandos de economía están desactivados en este grupo.\n\n🛡️ *Un administrador* puede activarlos con:\n» *${usedPrefix}economy on*`)
    }

    // Obtener JIDs de los participantes del grupo
    const groupMembers = m.isGroup ? participants.map(p => p.id) : []

    // Filtrar usuarios: solo los que están en el grupo (o todos si es chat privado)
    const users = [...new Map(
        Object.entries(global.db.data.users)
            .filter(([jid]) => !m.isGroup || groupMembers.includes(jid)) // Solo usuarios del grupo
            .map(([jid, data]) => [jid, { ...data, jid }])
    ).values()]

    const sorted = users.sort((a, b) => {
        const totalA = (a.coin || 0) + (a.bank || 0)
        const totalB = (b.coin || 0) + (b.bank || 0)
        return totalB - totalA
    })

    const totalPages = Math.ceil(sorted.length / 10)
    const page = Math.max(1, Math.min(parseInt(args[0]) || 1, totalPages))
    const startIndex = (page - 1) * 10
    const endIndex = startIndex + 10
    
    let text = `┏━━━━━━━━━━━━━━━━━━━┓
     💰 *TOP ${currency.toUpperCase()}* 💰
┗━━━━━━━━━━━━━━━━━━━┛\n\n`
    
    const slice = sorted.slice(startIndex, endIndex)
    let mentions = []
    
    for (let i = 0; i < slice.length; i++) {
        const { jid, coin, bank } = slice[i]
        const total = (coin || 0) + (bank || 0)
        
        // Obtener nombre del usuario
        let name = await (async () => 
            global.db.data.users[jid]?.name ||
            (async () => { 
                try { 
                    const n = await conn.getName(jid); 
                    return typeof n === 'string' && n.trim() ? n : jid.split('@')[0] 
                } catch { 
                    return jid.split('@')[0] 
                } 
            })()
        )()
        
        // Agregar al array de menciones
        mentions.push(jid)
        
        // Emojis para el top 3
        const medal = i + startIndex === 0 ? '🥇' : i + startIndex === 1 ? '🥈' : i + startIndex === 2 ? '🥉' : '✨'
        
        // Formato con mención @
        text += `${medal} *${startIndex + i + 1}.* @${jid.split('@')[0]}\n`
        text += `   👤 ${name}\n`
        text += `   💵 ¥${total.toLocaleString()} ${currency}\n`
        text += `   🪙 Cartera: ¥${(coin || 0).toLocaleString()}\n`
        text += `   🏦 Banco: ¥${(bank || 0).toLocaleString()}\n\n`
    }

    text += `━━━━━━━━━━━━━━━━━━━\n`
    text += `📄 Página *${page}* de *${totalPages}*`
    
    if (m.isGroup) {
        text += `\n👥 Mostrando usuarios del grupo`
    }
    
    await conn.reply(m.chat, text.trim(), m, { mentions })
}

handler.help = ['baltop']
handler.tags = ['rpg']
handler.command = ['baltop', 'eboard', 'economyboard']
handler.group = true

export default handler