let handler = async (m, { conn, usedPrefix, text, args, command }) => {
  if (global.db.data.chats[m.chat].adminonly || !global.db.data.chats[m.chat].pokes)
    return m.reply(`ㅤ𓏸𓈒ㅤׄ Estos comandos estan desactivados en este grupo.`)

  try {
    const chatUsers = global.db.data.chats?.[m.chat]?.users || {}
    const groupUsers = Object.keys(chatUsers)
    const userPokemonCount = []

    for (const userId of groupUsers) {
      const userChatData = chatUsers[userId] || {}
      const userGlobalData = global.db.data.users?.[userId] || {}
      const userPokes = userChatData.pokemon || []

      if (userPokes.length > 0) {
        let totalPower = 0
        for (const poke of userPokes) {
          const pokeData = global.db.data.pokemon?.[m.chat]?.[poke.id] || {}
          totalPower += (pokeData.poder || poke.poder || 0)
        }

        userPokemonCount.push({
          userId,
          name: userGlobalData.name || userId.split('@')[0],
          count: userPokes.length,
          totalPower
        })
      }
    }

    if (userPokemonCount.length === 0) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ Aún no hay usuarios con Pokémon en este grupo.`)
    }

    userPokemonCount.sort((a, b) => b.count - a.count || b.totalPower - a.totalPower)

    const top10 = userPokemonCount.slice(0, 10)
    let message = `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜* ㅤ֢ㅤ⸱ㅤᯭִ* — *ᴛᴏᴘ ᴇɴᴛʀᴇɴᴀᴅᴏʀᴇs ᴘᴏᴋéᴍᴏɴ*\n`
    message += `─────────────────\n\n`

    for (let i = 0; i < top10.length; i++) {
      const rank = i + 1
      const user = top10[i]
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`

      message += `${medal} *${user.name}*\n`
      message += `ㅤ𓏸𓈒ㅤׄ Pokémon: ${user.count}\n`
      message += `ㅤ𓏸𓈒ㅤׄ Poder total: ${user.totalPower.toLocaleString()}\n\n`
    }

    const userPosition = userPokemonCount.findIndex(u => u.userId === m.sender)
    if (userPosition >= 10 && userPosition !== -1) {
      const userData = userPokemonCount[userPosition]
      message += `─────────────────\n`
      message += `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜* ㅤ֢ㅤ⸱ㅤᯭִ* — *ᴛᴜ ᴘᴏsɪᴄɪᴏ́ɴ: #${userPosition + 1}*\n`
      message += `ㅤ𓏸𓈒ㅤׄ Pokémon: ${userData.count}\n`
      message += `ㅤ𓏸𓈒ㅤׄ Poder total: ${userData.totalPower.toLocaleString()}\n`
    }

    message += `\n─────────────────\n`
    message += `ㅤ𓏸𓈒ㅤׄ Total de entrenadores: ${userPokemonCount.length}`
    await m.reply(message)
  } catch (e) {
    m.reply(msgglobal + e)
  }
}

handler.help = ['toppoke', 'toppokemon']
handler.tags = ['pokes']
handler.command = ['toppoke', 'toppokemon']

export default handler