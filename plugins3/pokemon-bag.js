let handler = async (m, { conn, text, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon
    
    if (text.startsWith('use')) {
        let item = text.replace('use', '').trim().toLowerCase()
        if (!p.mochila[item] || p.mochila[item] <= 0) return m.reply('❌ No tienes ese objeto.')
        
        if (item === 'pocion') {
            p.hp = Math.min(p.hpMax, p.hp + 50)
            p.mochila[item]--
            return m.reply(`🧪 Usaste Poción. HP: ${p.hp}/${p.hpMax}`)
        }
    }

    let txt = `🎒 *MOCHILA DE ${p.nombreEntrenador.toUpperCase()}*\n\n`
    for (let [item, cant] of Object.entries(p.mochila)) {
        txt += `▪️ ${item.charAt(0).toUpperCase() + item.slice(1)}: ${cant}\n`
    }
    txt += `\n💡 Usa: *${usedPrefix}pbag use pocion* para curar.`
    m.reply(txt)
}
handler.command = /^(pbag|mochila|bag)$/i
export default handler
