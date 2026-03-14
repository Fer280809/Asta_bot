import { resolveLidToRealJid } from "../../lib/utils.js"

let handler = async (m, { conn, usedPrefix, text, args, command }) => {
  if (global.db.data.chats[m.chat].adminonly || !global.db.data.chats[m.chat].pokes)
    return m.reply(`ㅤ𓏸𓈒ㅤׄ Estos comandos estan desactivados en este grupo.`)

  try {
    const mentionedJid = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null)
    const who = mentionedJid || m.sender
    const target = await resolveLidToRealJid(who, conn, m.chat)

    const userData = global.db.data.chats?.[m.chat]?.users?.[target] || {}

    if (!userData.pokemon || userData.pokemon.length === 0) {
      const name = global.db.data.users?.[target]?.name || target.split('@')[0]
      return m.reply(`ㅤ𓏸𓈒ㅤׄ ${target === m.sender ? 'No tienes' : `*${name}* no tiene`} ningún Pokémon atrapado en este grupo.`)
    }

    const pokemonList = userData.pokemon
    const name = global.db.data.users?.[target]?.name || target.split('@')[0]
    let message = `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜* ㅤ֢ㅤ⸱ㅤᯭִ* — *ᴘᴏᴋéᴍᴏɴᴇs ᴅᴇ ${target === m.sender ? 'ᴛɪ' : name}*\n\n`

    pokemonList.forEach((poke, index) => {
      const pokemonData = global.db.data.pokemon?.[m.chat]?.[poke.id] || {}
      const poder = pokemonData.poder || poke.poder || 0
      const wins = pokemonData.wins || 0
      const losses = pokemonData.losses || 0

      message += `${index + 1}. *${poke.nombre}*\n`
      message += `ㅤ𓏸𓈒ㅤׄ Tipo: ${poke.tipo}\n`
      message += `ㅤ𓏸𓈒ㅤׄ Poder: ${poder.toLocaleString()}\n`
      message += `ㅤ𓏸𓈒ㅤׄ Victorias: ${wins} | Derrotas: ${losses}\n\n`
    })

    message += `─────────────────\n`
    message += `ㅤ𓏸𓈒ㅤׄ Total: *${pokemonList.length}* Pokémon`

    await m.reply(message, null, { mentions: [target] })
  } catch (e) {
    m.reply(msgglobal + e)
  }
}

handler.help = ['harempokes', 'harempokemones']
handler.tags = ['pokes']
handler.command = ['harempokes', 'harempokemones']

export default handler