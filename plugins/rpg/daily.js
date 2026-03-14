var handler = async (m, { conn, usedPrefix }) => {
    // Comprobar si la economía está activada en el grupo
    if (!db.data.chats[m.chat].economy && m.isGroup) 
        return m.reply(`《✦》Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`)

    let user = global.db.data.users[m.sender]
    let now = Date.now()
    let gap = 86400000 // 24 horas
    let maxStreak = 200

    // Inicializar valores si no existen
    user.streak = user.streak || 0
    user.lastDailyGlobal = user.lastDailyGlobal || 0
    user.coin = user.coin || 0
    user.exp = user.exp || 0
    user.lastDaily = user.lastDaily || 0

    // Comprobar si ya reclamó el daily
    if (now < user.lastDaily) {
        let wait = formatTime(Math.floor((user.lastDaily - now) / 1000))
        return conn.reply(m.chat, `⚠️ Ya has reclamado tu *Daily* de hoy.\n> Puedes reclamarlo de nuevo en *${wait}*`, m)
    }

    // Comprobar si perdió racha
    let lost = user.streak >= 1 && now - user.lastDailyGlobal > gap * 1.5
    if (lost) user.streak = 0

    // Incrementar racha global si corresponde
    let canClaimGlobal = now - user.lastDailyGlobal >= gap
    if (canClaimGlobal) {
        user.streak = Math.min(user.streak + 1, maxStreak)
        user.lastDailyGlobal = now
    }

    // Calcular recompensa y experiencia
    let reward = Math.min(20000 + (user.streak - 1) * 5000, 1015000)
    let expRandom = Math.floor(Math.random() * (100 - 20 + 1)) + 20
    user.coin += reward
    user.exp += expRandom
    user.lastDaily = now + gap
    let nextReward = Math.min(20000 + user.streak * 5000, 1015000).toLocaleString()

    // Mensaje rediseñado ASTA-BOT
    let msg = `╭━〔💰 *RECOMPENSA DIARIA* 💰〕━╮
 ┃
 ┃ ✅ Has reclamado tu Daily de hoy
 ┃ 💸 Recompensa: *¥${reward.toLocaleString()} ${currency}*
 ┃ 🗓 Día: *${user.streak}*
 ┃
 ┃ 🔹 Próximo día: *+¥${nextReward}*
${lost ? ' ┃ ⚠ ¡Has perdido tu racha de días! ⚠' : ''}
 ╰━━━━━━━━━━━━━━━╯`

    conn.reply(m.chat, msg, m)
}

handler.help = ['daily']
handler.tags = ['rpg']
handler.command = ['daily', 'diario']
handler.group = true
handler.reg = true

export default handler

// Función para formatear tiempo
function formatTime(t) {
    const h = Math.floor(t / 3600)
    const m = Math.floor((t % 3600) / 60)
    const s = t % 60
    const parts = []
    if (h) parts.push(`${h} hora${h !== 1 ? 's' : ''}`)
    if (m || h) parts.push(`${m} minuto${m !== 1 ? 's' : ''}`)
    parts.push(`${s} segundo${s !== 1 ? 's' : ''}`)
    return parts.join(' ')
}
