let handler = async (m, { conn, usedPrefix, text, args, command }) => {
  if (global.db.data.chats[m.chat].adminonly || !global.db.data.chats[m.chat].pokes)
    return m.reply(`ㅤ𓏸𓈒ㅤׄ Estos comandos estan desactivados en este grupo.`)

  try {
    if (!global.db.data.pokemonShop[m.chat] || global.db.data.pokemonShop[m.chat].length === 0) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ No hay Pokémon en venta en este grupo.`)
    }

    if (!text) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ Ingresa el nombre del Pokémon para retirarlo del store.`)
    }

    const botId = conn?.user?.id.split(':')[0] + '@s.whatsapp.net' || ''
    const botSettings = global.db.data.settings[botId] || {}
    const money = botSettings.currency || ''

    const pokemonName = text.trim().toLowerCase()
    const index = global.db.data.pokemonShop[m.chat].findIndex(p => p.nombre.toLowerCase() === pokemonName)

    if (index === -1) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ No se encontró un Pokémon llamado ${text} en la tienda.`)
    }

    const item = global.db.data.pokemonShop[m.chat][index]

    if (item.vendedor !== m.sender) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ Solo el vendedor original puede remover su Pokémon de la tienda.`)
    }
    global.db.data.pokemonShop[m.chat].splice(index, 1)

    const userData = global.db.data.chats[m.chat].users[m.sender]
    if (!userData.pokemon) userData.pokemon = []
    userData.pokemon.push({
      id: item.id,
      nombre: item.nombre,
      tipo: item.tipo,
      poder: item.poder
    })

    await m.reply(
      `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜* ㅤ֢ㅤ⸱ㅤᯭִ* — *ᴘᴏᴋéᴍᴏɴ ʀᴇᴍᴏᴠɪᴅᴏ*\n\n` +
      `ㅤ𓏸𓈒ㅤׄ Pokémon » ${item.nombre}\n` +
      `ㅤ𓏸𓈒ㅤׄ Tipo » ${item.tipo}\n` +
      `ㅤ𓏸𓈒ㅤׄ Poder » ${item.poder.toLocaleString()}\n` +
      `ㅤ𓏸𓈒ㅤׄ Precio » ${item.precio.toLocaleString()} ${money}\n\n` +
      `─────────────────\n` +
      `ㅤ𓏸𓈒ㅤׄ El Pokémon ha vuelto a tu inventario.`
    )
  } catch (e) {
    m.reply(msgglobal + e)
  }
}

handler.help = ['removepoke', 'removepokemon', 'removep']
handler.tags = ['pokes']
handler.command = ['removepoke', 'removepokemon', 'removep']

export default handler