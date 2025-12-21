let handler = async (m, { args, usedPrefix, command }) => {
    if (!db.data.chats[m.chat].economy && m.isGroup) {
        return m.reply(`🎄 *¡Oh no!* Los regalos económicos están *congelados* en este grupo navideño.\n\n🎅 Un *elfo administrador* puede descongelarlos con:\n» *${usedPrefix}economy on*`)
    }
    let user = global.db.data.users[m.sender]
    if (!args[0]) return m.reply(`🎁 *¡Hola!* Por favor, escribe la cantidad de *${currency}* que quieres retirar de tu cuenta navideña.`)

    if (args[0] === 'all') {
        let count = parseInt(user.bank)
        if (!count) return m.reply(`❄️ *¡Vaya!* No tienes *${currency}* en tu cuenta navideña para retirar.`)
        user.bank -= count
        user.coin += count
        await m.reply(`🎅 *¡Perfecto!* Has retirado *¥${count.toLocaleString()} ${currency}* de tu cuenta navideña.\n> Ahora puedes usarlo para comprar regalos, ¡pero ten cuidado con los Grinches!`)
        return
    }

    if (!Number(args[0])) return m.reply(`🎄 *Cantidad inválida.*\n> Ejemplo 1 » *${usedPrefix + command} 25000*\n> Ejemplo 2 » *${usedPrefix + command} all*`)

    let count = parseInt(args[0])
    if (!user.bank) return m.reply(`❄️ *¡Oh!* No tienes fondos en tu cuenta navideña.`)
    if (user.bank < count) return m.reply(`🎁 *¡Cuidado!* Solo tienes *¥${user.bank.toLocaleString()} ${currency}* en tu cuenta navideña.`)

    user.bank -= count
    user.coin += count
    await m.reply(`🎅 *¡Excelente!* Has retirado *¥${count.toLocaleString()} ${currency}* de tu cuenta navideña.\n> Ahora puedes usarlo para comprar regalos, ¡pero ten cuidado con los Grinches!`)
}

handler.help = ['retirar']
handler.tags = ['rpg']
handler.command = ['withdraw', 'retirar', 'with']
handler.group = true

export default handler