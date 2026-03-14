import { resolveLidToRealJid } from "../../lib/utils.js"

let handler = async (m, { conn, usedPrefix, text, args, command }) => {
  if (global.db.data.chats[m.chat].adminonly || !global.db.data.chats[m.chat].pokes)
    return m.reply(`ㅤ𓏸𓈒ㅤׄ Estos comandos estan desactivados en este grupo.`)

  try {
    if (!m.quoted) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ Debes responder al mensaje de la propuesta de intercambio para aceptarlo.`)
    }

    const trade = Object.values(global.db.data.pokemonTrades).find(t =>
      t.status === 'pending' &&
      t.expiresAt > Date.now() &&
      m.quoted.text.includes(`${t.proposerPokemon.nombre} / ${t.partnerPokemon.nombre}`)
    )

    if (!trade) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ No encontré ninguna propuesta de intercambio válida en el mensaje que respondiste o ya expiró.`)
    }

    if (trade.partner !== m.sender) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ Solo el usuario destinatario del intercambio puede aceptarlo.`)
    }

    const userData = global.db.data.chats[m.chat].users[m.sender]
    const proposerData = global.db.data.chats[m.chat].users[trade.proposer]

    const myPokemon = trade.partnerPokemon
    const theirPokemon = trade.proposerPokemon

    const myPokemonData = global.db.data.pokemon[m.chat][myPokemon.id]
    const theirPokemonData = global.db.data.pokemon[m.chat][theirPokemon.id]

    if (!myPokemonData.ownerHistory) myPokemonData.ownerHistory = []
    if (!theirPokemonData.ownerHistory) theirPokemonData.ownerHistory = []

    myPokemonData.ownerHistory.push({
      owner: m.sender,
      ownedFrom: myPokemon.atrapado,
      ownedUntil: Date.now(),
      transferType: 'intercambio',
      tradedFor: theirPokemon.nombre
    })
    theirPokemonData.ownerHistory.push({
      owner: trade.proposer,
      ownedFrom: theirPokemon.atrapado,
      ownedUntil: Date.now(),
      transferType: 'intercambio',
      tradedFor: myPokemon.nombre
    })

    userData.pokemon.splice(trade.partnerPokemonIndex, 1)
    proposerData.pokemon.splice(trade.proposerPokemonIndex, 1)

    userData.pokemon.push({
      id: theirPokemon.id,
      nombre: theirPokemon.nombre,
      tipo: theirPokemon.tipo,
      poder: theirPokemon.poder,
      atrapado: Date.now()
    })

    proposerData.pokemon.push({
      id: myPokemon.id,
      nombre: myPokemon.nombre,
      tipo: myPokemon.tipo,
      poder: myPokemon.poder,
      atrapado: Date.now()
    })

    theirPokemonData.atrapador = m.sender
    myPokemonData.atrapador = trade.proposer

    trade.status = 'completed'

    const proposerName = global.db.data.users[trade.proposer].name || 'Desconocido'
    const partnerName = m.pushName

    await m.reply(
      `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜* ㅤ֢ㅤ⸱ㅤᯭִ* — *ɪɴᴛᴇʀᴄᴀᴍʙɪᴏ ᴇxɪᴛᴏsᴏ*\n\n` +
      `ㅤ𓏸𓈒ㅤׄ *${proposerName}* recibió: *${myPokemon.nombre}*\n` +
      `ㅤ𓏸𓈒ㅤׄ *${partnerName}* recibió: *${theirPokemon.nombre}*\n\n` +
      `─────────────────\n` +
      `ㅤ𓏸𓈒ㅤׄ ¡Ambos Pokémon han cambiado de entrenador!`,
      null,
      { mentions: [trade.proposer, m.sender] }
    )

    const from = m.chat
    const groupMetadata = m.isGroup ? await conn.groupMetadata(from).catch((e) => {}) : ''
    const groupName = groupMetadata.subject

    await conn.reply(
      trade.proposer,
      `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜* ㅤ֢ㅤ⸱ㅤᯭִ* — *ɪɴᴛᴇʀᴄᴀᴍʙɪᴏ ᴀᴄᴇᴘᴛᴀᴅᴏ*\n\n` +
      `ㅤ𓏸𓈒ㅤׄ Grupo: *${groupName}*\n` +
      `ㅤ𓏸𓈒ㅤׄ *${partnerName}* ha aceptado tu propuesta de intercambio.\n` +
      `ㅤ𓏸𓈒ㅤׄ Has recibido: *${myPokemon.nombre}* (${myPokemon.tipo})\n` +
      `ㅤ𓏸𓈒ㅤׄ Entregaste: *${theirPokemon.nombre}* (${theirPokemon.tipo})`,
      m
    )

    delete global.db.data.pokemonTrades[Object.keys(global.db.data.pokemonTrades).find(k => global.db.data.pokemonTrades[k] === trade)]
  } catch (e) {
    m.reply(msgglobal + e)
  }
}

handler.help = ['aceptarpoke', 'aceptarpokemon']
handler.tags = ['pokes']
handler.command = ['aceptarpoke', 'aceptarpokemon']

export default handler