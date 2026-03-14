let handler = async (m, { conn, usedPrefix, text, args, command }) => {
  if (global.db.data.chats[m.chat].adminonly || !global.db.data.chats[m.chat].pokes)
    return m.reply(`ㅤ𓏸𓈒ㅤׄ Estos comandos estan desactivados en este grupo.`)

  const now = Date.now()
  const cooldown = 15 * 60 * 1000

  const userDatass = global.db.data.chats[m.chat].users[m.sender]

  if (userDatass.lastPokemonAceptar && now < userDatass.lastPokemonAceptar) {
    const timeLeft = Math.ceil((userDatass.lastPokemonAceptar - now) / 1000)
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    let timeText = ''
    if (minutes > 0) timeText += `${minutes} minuto${minutes !== 1 ? 's' : ''} `
    if (seconds > 0 || timeText === '') timeText += `${seconds} segundo${seconds !== 1 ? 's' : ''}`
    return m.reply(`ㅤ𓏸𓈒ㅤׄ Debes esperar *${timeText.trim()}* para usar *${usedPrefix + command}* de nuevo.`)
  }

  try {
    if (!text) return m.reply(`ㅤ𓏸𓈒ㅤׄ Escribe el nombre del Pokémon con el que quieres pelear.`)

    const botId = conn?.user?.id.split(':')[0] + '@s.whatsapp.net' || ''
    const botSettings = global.db.data.settings[botId] || {}
    const money = botSettings.currency || ''

    const now = Date.now()
    const battle = Object.values(global.db.data.pokemonBattles).find(b =>
      b.opponent === m.sender &&
      b.status === 'waiting' &&
      b.expiresAt > now
    )

    if (!battle) return m.reply(`ㅤ𓏸𓈒ㅤׄ No tienes ningún desafío pendiente o ya expiró.`)

    const chatUsers = global.db.data.chats?.[m.chat]?.users || {}
    const userData = chatUsers?.[m.sender] || {}
    const challengerData = chatUsers?.[battle.challenger] || {}

    const userPokes = userData.pokemon || []
    if (userPokes.length === 0) return m.reply(`ㅤ𓏸𓈒ㅤׄ No tienes ningún Pokémon en este grupo para pelear.`)

    const pokemonName = text.trim().toLowerCase()
    const myPokemon = userPokes.find(p => (p.nombre || '').toLowerCase() === pokemonName)
    if (!myPokemon) return m.reply(`ㅤ𓏸𓈒ㅤׄ No tienes un Pokémon llamado *${text}* en este grupo.`)

    const myPokemonData = global.db.data.pokemon?.[m.chat]?.[myPokemon.id] || {}
    const challengerPokemonData = global.db.data.pokemon?.[m.chat]?.[battle.challengerPokemon] || {}

    const battleCooldown = 60 * 60 * 1000

    if (myPokemonData.lastBattle && now < myPokemonData.lastBattle) {
      const timeLeft = Math.ceil((myPokemonData.lastBattle - now) / 1000)
      const minutes = Math.floor(timeLeft / 60)
      return m.reply(`ㅤ𓏸𓈒ㅤׄ Tu *${myPokemonData.nombre || myPokemon.nombre}* está descansando. Podrá pelear de nuevo en *${minutes} minuto${minutes !== 1 ? 's' : ''}*.`)
    }

    battle.status = 'fighting'

    const challengerPower = challengerPokemonData.poder || 0
    const opponentPower = myPokemonData.poder || 0
    const totalPower = Math.max(1, challengerPower + opponentPower)
    const challengerWinChance = challengerPower / totalPower
    const randomValue = Math.random()
    const winner = randomValue < challengerWinChance ? 'challenger' : 'opponent'

    const challengerName = global.db.data.users?.[battle.challenger]?.name || battle.challenger.split('@')[0]
    const opponentName = global.db.data.users?.[m.sender]?.name || m.sender.split('@')[0]

    let battleMessage = `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜* ㅤ֢ㅤ⸱ㅤᯭִ* — *ʙᴀᴛᴀʟʟᴀ ᴘᴏᴋéᴍᴏɴ*\n\n`
    battleMessage += `ㅤ𓏸𓈒ㅤׄ *Pokémon 1:* ${challengerPokemonData.nombre || 'Desconocido'} (${challengerPower.toLocaleString()})\n`
    battleMessage += `ㅤ𓏸𓈒ㅤׄ *Pokémon 2:* ${myPokemonData.nombre || 'Desconocido'} (${opponentPower.toLocaleString()})\n\n`
    battleMessage += `─────────────────\n`
    battleMessage += `ㅤ𓏸𓈒ㅤׄ ¡La batalla ha comenzado!\n\n`

    if (winner === 'challenger') {
      challengerPokemonData.poder = (challengerPokemonData.poder || 0) + 500
      challengerPokemonData.wins = (challengerPokemonData.wins || 0) + 1
      challengerPokemonData.lastBattle = now + battleCooldown

      myPokemonData.poder = Math.max(500, (myPokemonData.poder || 0) - 500)
      myPokemonData.losses = (myPokemonData.losses || 0) + 1
      myPokemonData.lastBattle = now + battleCooldown

      chatUsers[battle.challenger].coins = (chatUsers[battle.challenger].coins || 0) + 500

      battleMessage += `ㅤ𓏸𓈒ㅤׄ *¡${challengerPokemonData.nombre || 'Desconocido'} gana!* (${challengerName} +500 ${money})\n\n`
      battleMessage += `ㅤ𓏸𓈒ㅤׄ Poder de ${challengerPokemonData.nombre || 'Desconocido'}: ${challengerPower.toLocaleString()} → ${challengerPokemonData.poder.toLocaleString()} (+500)\n`
      battleMessage += `ㅤ𓏸𓈒ㅤׄ Poder de ${myPokemonData.nombre || 'Desconocido'}: ${opponentPower.toLocaleString()} → ${myPokemonData.poder.toLocaleString()} (-500)`
    } else {
      myPokemonData.poder = (myPokemonData.poder || 0) + 500
      myPokemonData.wins = (myPokemonData.wins || 0) + 1
      myPokemonData.lastBattle = now + battleCooldown

      challengerPokemonData.poder = Math.max(500, (challengerPokemonData.poder || 0) - 500)
      challengerPokemonData.losses = (challengerPokemonData.losses || 0) + 1
      challengerPokemonData.lastBattle = now + battleCooldown

      chatUsers[m.sender].coins = (chatUsers[m.sender].coins || 0) + 500

      battleMessage += `ㅤ𓏸𓈒ㅤׄ *¡${myPokemonData.nombre || 'Desconocido'} gana!* (${opponentName} +500 ${money})\n\n`
      battleMessage += `ㅤ𓏸𓈒ㅤׄ Poder de ${myPokemonData.nombre || 'Desconocido'}: ${opponentPower.toLocaleString()} → ${myPokemonData.poder.toLocaleString()} (+500)\n`
      battleMessage += `ㅤ𓏸𓈒ㅤׄ Poder de ${challengerPokemonData.nombre || 'Desconocido'}: ${challengerPower.toLocaleString()} → ${challengerPokemonData.poder.toLocaleString()} (-500)`
    }

    battleMessage += `\n\n─────────────────\n`
    battleMessage += `ㅤ𓏸𓈒ㅤׄ Ambos Pokémon necesitan 1 hora para recuperarse.`

    if ((myPokemonData.poder || 0) <= 500) {
      battleMessage += `\n\nㅤ𓏸𓈒ㅤׄ *${myPokemonData.nombre || 'Desconocido'}* está muy débil y necesitará 24 horas para recuperarse completamente.`
      myPokemonData.lastBattle = now + (24 * 60 * 60 * 1000)
    }

    if ((challengerPokemonData.poder || 0) <= 500) {
      battleMessage += `\n\nㅤ𓏸𓈒ㅤׄ *${challengerPokemonData.nombre || 'Desconocido'}* está muy débil y necesitará 24 horas para recuperarse completamente.`
      challengerPokemonData.lastBattle = now + (24 * 60 * 60 * 1000)
    }

    await m.reply(battleMessage, null, { mentions: [battle.challenger, m.sender] })

    userDatass.lastPokemonAceptar = now + cooldown

    const battleKey = Object.keys(global.db.data.pokemonBattles).find(k => global.db.data.pokemonBattles[k] === battle)
    if (battleKey) delete global.db.data.pokemonBattles[battleKey]
  } catch (e) {
    m.reply(msgglobal + e)
  }
}

handler.help = ['aceptarpvp']
handler.tags = ['pokes']
handler.command = ['aceptarpvp']

export default handler