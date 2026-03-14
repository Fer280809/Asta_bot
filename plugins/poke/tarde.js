let handler = async (m, { conn, usedPrefix, text, args, command }) => {
  if (global.db.data.chats[m.chat].adminonly || !global.db.data.chats[m.chat].pokes)
    return m.reply(`ㅤ𓏸𓈒ㅤׄ Estos comandos estan desactivados en este grupo.`)

  try {
    if (!text) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ Uso: *${usedPrefix + command} <tu_pokemon> / <su_pokemon>*\n\nㅤ𓏸𓈒ㅤׄ Ejemplo: ${usedPrefix + command} Pikachu / Charmander`)
    }

    const argsClean = text.trim()
    if (!argsClean.includes('/')) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ Uso correcto: *${usedPrefix + command} <tu_pokemon> / <su_pokemon>*\n\nㅤ𓏸𓈒ㅤׄ Ejemplo: ${usedPrefix + command} Pikachu / Charmander`)
    }

    const [myPokemonNameRaw, theirPokemonNameRaw] = argsClean.split('/').map(arg => arg.trim())
    if (!myPokemonNameRaw || !theirPokemonNameRaw) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ Debes especificar ambos Pokémon separados por " / ".\n\nㅤ𓏸𓈒ㅤׄ Ejemplo: *${usedPrefix + command} Pikachu / Charmander*`)
    }

    const myPokemonName = myPokemonNameRaw.toLowerCase()
    const theirPokemonName = theirPokemonNameRaw.toLowerCase()

    const userData = global.db.data.chats[m.chat].users[m.sender]
    if (!userData?.pokemon || userData.pokemon.length === 0) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ No tienes ningún Pokémon para intercambiar en este grupo.`)
    }

    const myPokemonIndex = userData.pokemon.findIndex(p => p.nombre.toLowerCase() === myPokemonName)
    if (myPokemonIndex === -1) return m.reply(`ㅤ𓏸𓈒ㅤׄ No tienes un Pokémon llamado *${myPokemonNameRaw}* en este grupo.`)

    const allUsers = global.db.data.chats[m.chat].users
    let partnerId = null
    let theirPokemonIndex = -1
    let theirPokemon = null

    for (const [uid, pdata] of Object.entries(allUsers)) {
      if (uid === m.sender) continue
      if (pdata?.pokemon) {
        const idx = pdata.pokemon.findIndex(p => p.nombre.toLowerCase() === theirPokemonName)
        if (idx !== -1) {
          partnerId = uid
          theirPokemonIndex = idx
          theirPokemon = pdata.pokemon[idx]
          break
        }
      }
    }

    if (!partnerId) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ Ningún usuario en este grupo tiene un Pokémon llamado *${theirPokemonNameRaw}*.`)
    }

    const myPokemon = userData.pokemon[myPokemonIndex]

    const tradeId = `${m.chat}_${Date.now()}`
    global.db.data.pokemonTrades[tradeId] = {
      proposer: m.sender,
      partner: partnerId,
      proposerPokemon: myPokemon,
      proposerPokemonIndex: myPokemonIndex,
      partnerPokemon: theirPokemon,
      partnerPokemonIndex: theirPokemonIndex,
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + 300000
    }

    const proposerName = m.pushName || 'Desconocido'
    const partnerName = global.db.data.users[partnerId]?.name || 'Desconocido'

    await conn.reply(m.chat,
      `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜* ㅤ֢ㅤ⸱ㅤᯭִ* — *ᴘʀᴏᴘᴜᴇsᴛᴀ ᴅᴇ ɪɴᴛᴇʀᴄᴀᴍʙɪᴏ*\n\n` +
      `ㅤ𓏸𓈒ㅤׄ @${m.sender.split('@')[0]} quiere intercambiar:\n` +
      `ㅤ𓏸𓈒ㅤׄ ${myPokemon.nombre} / ${theirPokemon.nombre}\n\n` +
      `ㅤ𓏸𓈒ㅤׄ @${partnerId.split('@')[0]}, se ha solicitado un intercambio contigo.\n\n` +
      `─────────────────\n` +
      `ㅤ𓏸𓈒ㅤׄ Para aceptar este intercambio responde a este mensaje con el comando *${usedPrefix}aceptarpoke*\n` +
      `ㅤ𓏸𓈒ㅤׄ ⏰ Esta propuesta expira en 5 minutos.`,
      m,
      { mentions: [partnerId, m.sender] }
    )
  } catch (e) {
    m.reply(msgglobal + e)
  }
}

handler.help = ['intercambiarpoke', 'poketrade', 'tradep', 'tradepoke']
handler.tags = ['pokes']
handler.command = ['intercambiarpoke', 'poketrade', 'tradep', 'tradepoke']

export default handler