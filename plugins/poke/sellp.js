let handler = async (m, { conn, usedPrefix, text, args, command }) => {
  if (global.db.data.chats[m.chat].adminonly || !global.db.data.chats[m.chat].pokes)
    return m.reply(`ㅤ𓏸𓈒ㅤׄ Estos comandos estan desactivados en este grupo.`)

  try {
    if (!text) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ Especifica el nombre del pokemon y valor.`)
    }

    const botId = conn?.user?.id.split(':')[0] + '@s.whatsapp.net' || ''
    const botSettings = global.db.data.settings[botId] || {}
    const money = botSettings.currency || ''

    const parts = text.trim().split(' ')
    if (parts.length < 2) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ Debes especificar el nombre del Pokémon y el precio.`)
    }

    const price = parseInt(parts[parts.length - 1])
    if (isNaN(price) || price <= 0) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ El precio debe ser un número válido mayor a 0.`)
    }
    if (price > 20000000) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ El precio máximo permitido es de 20,000,000.`)
    }

    const pokemonName = parts.slice(0, -1).join(' ').toLowerCase()
    const userData = global.db.data.chats[m.chat].users[m.sender]

    if (!userData?.pokemon || userData.pokemon.length === 0) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ No tienes ningún Pokémon para vender en este grupo.`)
    }

    const pokemonIndex = userData.pokemon.findIndex(p => p.nombre.toLowerCase() === pokemonName)
    if (pokemonIndex === -1) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ No tienes un Pokémon llamado *${parts.slice(0, -1).join(' ')}* en este grupo.`)
    }

    const pokemon = userData.pokemon[pokemonIndex]

    if (!global.db.data.pokemonShop[m.chat]) {
      global.db.data.pokemonShop[m.chat] = []
    }

    global.db.data.pokemonShop[m.chat].push({
      id: pokemon.id,
      nombre: pokemon.nombre,
      tipo: pokemon.tipo,
      poder: global.db.data.pokemon[m.chat][pokemon.id]?.poder || 0,
      precio: price,
      vendedor: m.sender,
      listedAt: Date.now()
    })

    userData.pokemon.splice(pokemonIndex, 1)

    await m.reply(
      `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜* ㅤ֢ㅤ⸱ㅤᯭִ* — *ᴘᴏᴋéᴍᴏɴ ᴇɴ ᴠᴇɴᴛᴀ*\n\n` +
      `ㅤ𓏸𓈒ㅤׄ *Pokémon* » ${pokemon.nombre}\n` +
      `ㅤ𓏸𓈒ㅤׄ *Tipo* » ${pokemon.tipo}\n` +
      `ㅤ𓏸𓈒ㅤׄ *Poder* » ${(global.db.data.pokemon[m.chat][pokemon.id]?.poder || 0).toLocaleString()}\n` +
      `ㅤ𓏸𓈒ㅤׄ *Precio* » ${price.toLocaleString()} ${money}\n\n` +
      `─────────────────\n` +
      `ㅤ𓏸𓈒ㅤׄ Usa *${usedPrefix}pokeshop* para ver las ventas disponibles.`
    )
  } catch (e) {
    m.reply(msgglobal + e)
  }
}

handler.help = ['sellpokemon', 'sellpoke']
handler.tags = ['pokes']
handler.command = ['sellpokemon', 'sellpoke']

export default handler