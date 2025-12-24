let handler = async (m, { conn, usedPrefix }) => {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')
    
    const chat = global.db.data.chats[m.chat]
    const mutedUsers = chat?.muted || []
    
    // Obtener metadatos del grupo
    let groupMetadata
    try {
        groupMetadata = await conn.groupMetadata(m.chat)
    } catch (e) {
        groupMetadata = { participants: [] }
    }
    
    const totalMembers = groupMetadata.participants?.length || 0
    const mutedCount = mutedUsers.length
    const percentage = totalMembers > 0 ? ((mutedCount / totalMembers) * 100).toFixed(1) : 0
    
    let statsText = `📊 *ESTADÍSTICAS DE MUTE*\n━━━━━━━━━━━━━━━━━━━━━━━\n`
    statsText += `👥 Total miembros: ${totalMembers}\n`
    statsText += `🔇 Usuarios muteados: ${mutedCount}\n`
    statsText += `📈 Porcentaje: ${percentage}%\n\n`
    
    if (mutedCount > 0) {
        statsText += `📋 *Top razones de mute:*\n`
        
        // Contar razones
        const reasons = {}
        mutedUsers.forEach(u => {
            if (typeof u === 'object' && u.reason) {
                const reason = u.reason || 'Sin razón'
                reasons[reason] = (reasons[reason] || 0) + 1
            }
        })
        
        // Mostrar top 3 razones
        const sortedReasons = Object.entries(reasons)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
        
        if (sortedReasons.length > 0) {
            sortedReasons.forEach(([reason, count], i) => {
                statsText += `${i + 1}. "${reason.substring(0, 20)}${reason.length > 20 ? '...' : ''}": ${count} vez${count !== 1 ? 'es' : ''}\n`
            })
        } else {
            statsText += `No hay razones registradas.\n`
        }
        
        statsText += `\n💡 Usa ${usedPrefix}mutelist para ver la lista completa`
    } else {
        statsText += `🎉 ¡No hay usuarios muteados en este grupo!`
    }
    
    statsText += `\n━━━━━━━━━━━━━━━━━━━━━━━`
    
    await m.reply(statsText)
}

handler.help = ['mutestats', 'statsmute']
handler.tags = ['group']
handler.command = ['mutestats', 'statsmute', 'estadisticasmute']
handler.group = true

export default handler
