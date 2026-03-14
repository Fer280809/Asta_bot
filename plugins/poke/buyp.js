let handler = async (m, { conn, usedPrefix, text, args, command }) => {
  if (global.db.data.chats[m.chat].adminonly || !global.db.data.chats[m.chat].pokes)
    return m.reply(`ㅤ𓏸𓈒ㅤׄ Estos comandos estan desactivados en este grupo.`)

  try {
    if (!text) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ Uso: *${usedPrefix + command} <nombre>*\n\nㅤ𓏸𓈒ㅤׄ Usa *${usedPrefix}pokeshop* para ver los Pokémon disponibles.`)
    }

    const botId = conn?.user?.id.split(':')[0] + '@s.whatsapp.net' || ''
    const botSettings = global.db.data.settings[botId] || {}
    const money = botSettings.currency || ''

    if (!global.db.data.pokemonShop || !global.db.data.pokemonShop[m.chat] || global.db.data.pokemonShop[m.chat].length === 0) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ No hay Pokémon en venta en este grupo.`)
    }

    const shop = global.db.data.pokemonShop[m.chat]
    const pokemonName = text.trim().toLowerCase()
    const index = shop.findIndex(p => p.nombre.toLowerCase() === pokemonName)

    if (index === -1) return m.reply(`ㅤ𓏸𓈒ㅤׄ No se encontró un Pokémon llamado *${text}* en la tienda.`)

    const item = shop[index]
    if (item.vendedor === m.sender) return m.reply(`ㅤ𓏸𓈒ㅤׄ No puedes comprar tu propio Pokémon.`)

    const userData = global.db.data.chats[m.chat].users?.[m.sender] || {}
    const sellerData = global.db.data.chats[m.chat].users?.[item.vendedor] || {}

    userData.coins = userData.coins || 0
    sellerData.coins = sellerData.coins || 0

    if (userData.coins < item.precio) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ No tienes suficientes ${money}. Necesitas *${item.precio.toLocaleString()}* pero solo tienes *${userData.coins.toLocaleString()}*.`)
    }

    userData.coins -= item.precio
    sellerData.coins += item.precio

    const pokemonData = global.db.data.pokemon?.[m.chat]?.[item.id] || {}
    if (!pokemonData.ownerHistory) pokemonData.ownerHistory = []

    const sellerPokemon = sellerData.pokemon?.find(p => p.id === item.id)
    pokemonData.ownerHistory.push({
      owner: item.vendedor,
      ownedFrom: sellerPokemon?.atrapado || Date.now(),
      ownedUntil: Date.now(),
      transferType: 'venta',
      price: item.precio
    })

    if (!userData.pokemon) userData.pokemon = []
    userData.pokemon.push({
      id: item.id,
      nombre: item.nombre,
      tipo: item.tipo,
      poder: item.poder,
      atrapado: Date.now()
    })

    pokemonData.atrapado = true
    pokemonData.atrapador = m.sender

    if (sellerData.pokemon) {
      const pokemonIndex = sellerData.pokemon.findIndex(p => p.id === item.id)
      if (pokemonIndex !== -1) sellerData.pokemon.splice(pokemonIndex, 1)
    }

    shop.splice(index, 1)

    await m.reply(
      `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜* ㅤ֢ㅤ⸱ㅤᯭִ* — *ᴄᴏᴍᴘʀᴀ ᴇxɪᴛᴏsᴀ*\n\n` +
      `ㅤ𓏸𓈒ㅤׄ Has comprado a *${item.nombre}*\n` +
      `ㅤ𓏸𓈒ㅤׄ *Tipo* » ${item.tipo}\n` +
      `ㅤ𓏸𓈒ㅤׄ *Poder* » ${item.poder.toLocaleString()}\n` +
      `ㅤ𓏸𓈒ㅤׄ *Precio pagado* » ${item.precio.toLocaleString()} ${money}\n\n` +
      `─────────────────\n` +
      `ㅤ𓏸𓈒ㅤׄ *${money} restantes* » ${userData.coins.toLocaleString()}`
    )

    const from = m.chat
    const groupMetadata = m.isGroup ? await conn.groupMetadata(from).catch(() => {}) : ''
    const groupName = groupMetadata.subject

    await conn.reply(
      item.vendedor,
      `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜* ㅤ֢ㅤ⸱ㅤᯭִ* — *ᴠᴇɴᴛᴀ ʀᴇᴀʟɪᴢᴀᴅᴀ*\n\n` +
      `ㅤ𓏸𓈒ㅤׄ Grupo: *${groupName}*\n` +
      `ㅤ𓏸𓈒ㅤׄ Has vendido a *${item.nombre}* por *${item.precio.toLocaleString()}* ${money}.\n\n` +
      `─────────────────\n` +
      `ㅤ𓏸𓈒ㅤׄ *${money} actuales* » ${sellerData.coins.toLocaleString()}`,
      m
    )
  } catch (e) {
    m.reply(msgglobal + e)
  }
}

handler.help = ['comprarpokemon', 'buypoke', 'comprarpoke', 'buyp']
handler.tags = ['pokes']
handler.command = ['comprarpokemon', 'buypoke', 'comprarpoke', 'buyp']

export default handler