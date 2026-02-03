let handler = async (m, { args, usedPrefix, command }) => {
    if (!db.data.chats[m.chat].economy && m.isGroup) {
        return m.reply(`⚠️ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con:\n» *${usedPrefix}economy on*`)
    }
    let user = global.db.data.users[m.sender]
    if (!args[0]) return m.reply(`❗ Ingresa la cantidad de *${currency}* que deseas retirar.`)

    if (args[0] === 'all') {
        let count = parseInt(user.bank)
        if (!count) return m.reply(`❌ No tienes *${currency}* para retirar.`)
        user.bank -= count
        user.coin += count
        await m.reply(`✅ Has retirado *¥${count.toLocaleString()} ${currency}* del banco.\n> Ahora puedes usarlo libremente, ¡pero cuidado con los robos!`)
        return
    }

    if (!Number(args[0])) return m.reply(`❌ Cantidad inválida.\n> Ejemplo 1 » *${usedPrefix + command} 25000*\n> Ejemplo 2 » *${usedPrefix + command} all*`)

    let count = parseInt(args[0])
    if (!user.bank) return m.reply(`❌ No tienes fondos en el Banco.`)
    if (user.bank < count) return m.reply(`⚠️ Solo tienes *¥${user.bank.toLocaleString()} ${currency}* en el Banco.`)

    user.bank -= count
    user.coin += count
    await m.reply(`✅ Has retirado *¥${count.toLocaleString()} ${currency}* del banco.\n> Ahora puedes usarlo, ¡pero cuidado con los robos!`)
}

handler.help = ['retirar']
handler.tags = ['rpg']
handler.command = ['withdraw', 'retirar', 'with']
handler.group = true

export default handler
