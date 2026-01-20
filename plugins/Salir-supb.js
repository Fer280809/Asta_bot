let handler = async (m, { conn, text, participants, usedPrefix, command }) => {
    if (!m.isGroup) return m.reply('⚠️ Este comando solo funciona en grupos.')
    
    // Obtener todos los bots conectados (subbots)
    let subbots = Object.values(global.conns).filter(bot => bot.user && bot.user.jid !== conn.user.jid)
    
    if (subbots.length === 0) {
        return m.reply('ℹ️ No hay subbots conectados en este momento.')
    }
    
    // Obtener JIDs de subbots que están en este grupo
    let subbotsInGroup = subbots.filter(bot => {
        return participants.some(p => p.id === bot.user.jid)
    })
    
    if (subbotsInGroup.length === 0) {
        return m.reply('ℹ️ No hay subbots en este grupo.')
    }
    
    // Obtener usuarios mencionados (excepciones)
    let mentionedJids = m.mentionedJid || []
    
    // Si hay menciones en el texto
    if (text) {
        const mentions = [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
        mentionedJids = [...new Set([...mentionedJids, ...mentions])]
    }
    
    let exceptions = mentionedJids.filter(jid => 
        subbotsInGroup.some(bot => bot.user.jid === jid)
    )
    
    // Filtrar subbots que deben salirse (los que NO están en las excepciones)
    let subbotsToLeave = subbotsInGroup.filter(bot => 
        !exceptions.includes(bot.user.jid)
    )
    
    if (subbotsToLeave.length === 0) {
        return m.reply('ℹ️ Todos los subbots están en la lista de excepciones. No hay bots para expulsar.')
    }
    
    // Mensaje de confirmación
    let confirmText = `🤖 *EXPULSIÓN DE SUBBOTS* 🤖\n\n`
    confirmText += `📊 Total de subbots en grupo: *${subbotsInGroup.length}*\n`
    confirmText += `🚪 Subbots que se saldrán: *${subbotsToLeave.length}*\n`
    
    if (exceptions.length > 0) {
        confirmText += `✅ Excepciones (se quedan): *${exceptions.length}*\n\n`
        confirmText += `*Bots que NO se saldrán:*\n`
        for (let jid of exceptions) {
            let bot = subbotsInGroup.find(b => b.user.jid === jid)
            let name = bot?.user?.name || jid.split('@')[0]
            confirmText += `  • @${jid.split('@')[0]} (${name})\n`
        }
        confirmText += `\n`
    }
    
    confirmText += `*Bots que se saldrán:*\n`
    for (let bot of subbotsToLeave) {
        let name = bot.user?.name || bot.user.jid.split('@')[0]
        confirmText += `  • @${bot.user.jid.split('@')[0]} (${name})\n`
    }
    
    confirmText += `\n⏳ Expulsando subbots en 3 segundos...`
    
    // Enviar mensaje con menciones
    let allMentions = [...exceptions, ...subbotsToLeave.map(b => b.user.jid)]
    await conn.reply(m.chat, confirmText, m, { mentions: allMentions })
    
    // Esperar 3 segundos
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Expulsar subbots
    let success = 0
    let failed = 0
    
    for (let bot of subbotsToLeave) {
        try {
            await bot.groupLeave(m.chat)
            success++
            console.log(`✅ Subbot ${bot.user.jid} salió del grupo ${m.chat}`)
        } catch (error) {
            failed++
            console.error(`❌ Error al expulsar subbot ${bot.user.jid}:`, error)
        }
    }
    
    // Mensaje final
    let resultText = `\n━━━━━━━━━━━━━━━━\n`
    resultText += `✅ *Expulsados exitosamente:* ${success}\n`
    if (failed > 0) {
        resultText += `❌ *Fallidos:* ${failed}\n`
    }
    resultText += `━━━━━━━━━━━━━━━━`
    
    await conn.reply(m.chat, resultText, m)
}

handler.help = ['salirsupb [@user]']
handler.tags = ['fernando']
handler.command = ['salirsupb', 'sacarsubbots', 'expulsarsubbots']
handler.group = true
handler.fernando = true

export default handler