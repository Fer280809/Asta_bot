import { resolveLidToRealJid } from "../../lib/utils.js"

let handler = async (m, { conn, usedPrefix, text, args, command }) => {
  if (global.db.data.chats[m.chat].adminonly || !global.db.data.chats[m.chat].pokes)
    return m.reply(`ㅤ𓏸𓈒ㅤׄ Estos comandos estan desactivados en este grupo.`)

  try {
    if (!text) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ Uso: *${usedPrefix + command} @usuario <nombre_pokemon>*\n\nㅤ𓏸𓈒ㅤׄ Ejemplo: ${usedPrefix + command} @user Pikachu`)
    }

    const mentionedJid = m.mentionedJid || []
    const who = mentionedJid[0] ? mentionedJid[0] : (m.quoted ? m.quoted.sender : null)

    const mentioned = await resolveLidToRealJid(who, conn, m.chat)

    if (!who) return m.reply(`ㅤ𓏸𓈒ㅤׄ Debes mencionar o responder al mensaje del usuario al que quieres regalar el Pokémon.`)
    if (mentioned === m.sender) return m.reply(`ㅤ𓏸𓈒ㅤׄ No puedes regalarte un Pokémon a ti mismo.`)

    const pokemonName = text.replace(/@\d+/g, '').trim().toLowerCase()
    if (!pokemonName) return m.reply(`ㅤ𓏸𓈒ㅤׄ Debes especificar el nombre del Pokémon que quieres regalar.`)

    const userData = global.db.data.chats[m.chat].users?.[m.sender] || {}
    const recipientData = global.db.data.chats[m.chat].users?.[mentioned] || {}

    if (!userData.pokemon || userData.pokemon.length === 0) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ No tienes ningún Pokémon para regalar en este grupo.`)
    }

    const pokemonIndex = userData.pokemon.findIndex(p => (p.nombre || '').toLowerCase() === pokemonName)
    if (pokemonIndex === -1) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ No tienes un Pokémon llamado *${text.replace(/@\d+/g, '').trim()}* en este grupo.`)
    }

    const pokemon = userData.pokemon[pokemonIndex]
    const pokemonData = global.db.data.pokemon?.[m.chat]?.[pokemon.id] || {}

    if (!pokemonData.ownerHistory) pokemonData.ownerHistory = []
    pokemonData.ownerHistory.push({
      owner: m.sender,
      ownedFrom: pokemon.atrapado,
      ownedUntil: Date.now(),
      transferType: 'regalo'
    })

    if (!recipientData.pokemon) recipientData.pokemon = []

    recipientData.pokemon.push({
      id: pokemon.id,
      nombre: pokemon.nombre,
      tipo: pokemon.tipo,
      poder: pokemon.poder,
      atrapado: Date.now()
    })

    pokemonData.atrapador = mentioned
    userData.pokemon.splice(pokemonIndex, 1)

    const recipientName = global.db.data.users?.[mentioned]?.name || mentioned.split('@')[0]
    const senderName = m.pushName || m.sender.split('@')[0]

    await m.reply(
      `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜* ㅤ֢ㅤ⸱ㅤᯭִ* — *ʀᴇɢᴀʟᴏ ᴇɴᴠɪᴀᴅᴏ*\n\n` +
      `ㅤ𓏸𓈒ㅤׄ Has regalado a *${pokemon.nombre}* a *${recipientName}*\n` +
      `ㅤ𓏸𓈒ㅤׄ *Tipo* » ${pokemon.tipo}\n` +
      `ㅤ𓏸𓈒ㅤׄ *Poder* » ${pokemon.poder.toLocaleString()}`,
      null,
      { mentions: [mentioned] }
    )

    await conn.reply(
      mentioned,
      `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜* ㅤ֢ㅤ⸱ㅤᯭִ* — *¡ʜᴀs ʀᴇᴄɪʙɪᴅᴏ ᴜɴ ʀᴇɢᴀʟᴏ!*\n\n` +
      `ㅤ𓏸𓈒ㅤׄ *${senderName}* te ha regalado a *${pokemon.nombre}*\n` +
      `ㅤ𓏸𓈒ㅤׄ *Tipo* » ${pokemon.tipo}\n` +
      `ㅤ𓏸𓈒ㅤׄ *Poder* » ${pokemon.poder.toLocaleString()}\n\n` +
      `─────────────────\n` +
      `ㅤ𓏸𓈒ㅤׄ Usa *${usedPrefix}mispokemon* para ver tu colección.`,
      m
    )
  } catch (e) {
    m.reply(msgglobal + e)
  }
}

handler.help = ['regalarpokemon', 'darpoke', 'regalarpoke', 'donarpokemon']
handler.tags = ['pokes']
handler.command = ['regalarpokemon', 'darpoke', 'regalarpoke', 'donarpokemon']

export default handler