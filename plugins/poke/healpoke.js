let handler = async (m, { conn, usedPrefix, text, args, command }) => {
  if (global.db.data.chats[m.chat].adminonly || !global.db.data.chats[m.chat].pokes)
    return m.reply(`ㅤ𓏸𓈒ㅤׄ Estos comandos estan desactivados en este grupo.`)

  const now = Date.now()
  const cooldown = 15 * 60 * 1000

  const userDatass = global.db.data.chats[m.chat].users[m.sender]
  if (userDatass.lastPokemonHeal && now < userDatass.lastPokemonHeal) {
    const timeLeft = Math.ceil((userDatass.lastPokemonHeal - now) / 1000)
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    let timeText = ''
    if (minutes > 0) timeText += `${minutes} minuto${minutes !== 1 ? 's' : ''} `
    if (seconds > 0 || timeText === '') timeText += `${seconds} segundo${seconds !== 1 ? 's' : ''}`
    return m.reply(`ㅤ𓏸𓈒ㅤׄ Debes esperar *${timeText.trim()}* para usar *${usedPrefix + command}* de nuevo.`)
  }

  try {
    if (!text) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ Uso: *${usedPrefix + command} <nombre_pokemon>*\n\nㅤ𓏸𓈒ㅤׄ Ejemplo: ${usedPrefix + command} Pikachu`)
    }

    const botId = conn?.user?.id.split(':')[0] + '@s.whatsapp.net' || ''
    const botSettings = global.db.data.settings[botId] || {}
    const money = botSettings.currency || ''

    const userData = global.db.data.chats?.[m.chat]?.users?.[m.sender] || {}

    if (!userData.pokemon || userData.pokemon.length === 0) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ No tienes ningún Pokémon en este grupo.`)
    }

    const pokemonName = text.trim().toLowerCase()
    const myPokemon = userData.pokemon.find(p => (p.nombre || '').toLowerCase() === pokemonName)

    if (!myPokemon) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ No tienes un Pokémon llamado *${text}* en este grupo.`)
    }

    const myPokemonData = global.db.data.pokemon?.[m.chat]?.[myPokemon.id] || {}
    const now = Date.now()

    if (!myPokemonData.lastBattle || now >= myPokemonData.lastBattle) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ Tu *${myPokemon.nombre}* ya está completamente recuperado y listo para pelear.`)
    }

    const cureCost = 1000
    userData.coins = userData.coins || 0

    if (userData.coins < cureCost) {
      return m.reply(
        `ㅤ𓏸𓈒ㅤׄ No tienes suficientes ${money} para curar a *${myPokemon.nombre}*.\n\n` +
        `ㅤ𓏸𓈒ㅤׄ Costo: ${cureCost.toLocaleString()} ${money}\n` +
        `ㅤ𓏸𓈒ㅤׄ Tienes: ${userData.coins.toLocaleString()} ${money}`
      )
    }

    userData.coins -= cureCost
    myPokemonData.lastBattle = 0

    await m.reply(
      `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜* ㅤ֢ㅤ⸱ㅤᯭִ* — *ᴄᴜʀᴀᴄɪᴏ́ɴ ᴇxɪᴛᴏsᴀ*\n\n` +
      `ㅤ𓏸𓈒ㅤׄ Has curado a *${myPokemon.nombre}*\n` +
      `ㅤ𓏸𓈒ㅤׄ Tu Pokémon está completamente recuperado y listo para pelear\n` +
      `ㅤ𓏸𓈒ㅤׄ Costo: ${cureCost.toLocaleString()} ${money}\n\n` +
      `─────────────────\n` +
      `ㅤ𓏸𓈒ㅤׄ ${money} restantes: ${userData.coins.toLocaleString()}`
    )

    userDatass.lastPokemonHeal = now + cooldown
  } catch (e) {
    m.reply(msgglobal + e)
  }
}

handler.help = ['curarpokemon', 'healpoke']
handler.tags = ['pokes']
handler.command = ['curarpokemon', 'healpoke']

export default handler