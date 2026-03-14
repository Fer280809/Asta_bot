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
      return m.reply(`ㅤ𓏸𓈒ㅤׄ ${target === m.sender ? 'No tienes' : `*${name}* no tiene`} ningún Pokémon en este grupo.`)
    }

    const pokemonList = userData.pokemon
    let totalWins = 0
    let totalLosses = 0
    let totalPower = 0

    const name = global.db.data.users?.[target]?.name || target.split('@')[0]
    let message = `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜* ㅤ֢ㅤ⸱ㅤᯭִ* — *ʜɪsᴛᴏʀɪᴀʟ ᴅᴇ ʙᴀᴛᴀʟʟᴀs ᴅᴇ ${target === m.sender ? 'ᴛɪ' : name}*\n`
    message += `─────────────────\n\n`

    pokemonList.forEach((poke, index) => {
      const pokemonData = global.db.data.pokemon?.[m.chat]?.[poke.id] || {}
      const wins = pokemonData.wins || 0
      const losses = pokemonData.losses || 0
      const poder = pokemonData.poder || poke.poder || 0
      const totalBattles = wins + losses
      const winRate = totalBattles > 0 ? ((wins / totalBattles) * 100).toFixed(1) : 0

      totalWins += wins
      totalLosses += losses
      totalPower += poder

      message += `${index + 1}. *${poke.nombre}* (${poke.tipo})\n`
      message += `ㅤ𓏸𓈒ㅤׄ Poder: ${poder.toLocaleString()}\n`
      message += `ㅤ𓏸𓈒ㅤׄ Victorias: ${wins}\n`
      message += `ㅤ𓏸𓈒ㅤׄ Derrotas: ${losses}\n`
      message += `ㅤ𓏸𓈒ㅤׄ Win Rate: ${winRate}%\n`
      message += `ㅤ𓏸𓈒ㅤׄ Total batallas: ${totalBattles}\n\n`
    })

    const globalWinRate = (totalWins + totalLosses) > 0 ? ((totalWins / (totalWins + totalLosses)) * 100).toFixed(1) : 0

    message += `─────────────────\n`
    message += `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜* ㅤ֢ㅤ⸱ㅤᯭִ* — *ʀᴇsᴜᴍᴇɴ ɢʟᴏʙᴀʟ*\n\n`
    message += `ㅤ𓏸𓈒ㅤׄ Victorias totales: ${totalWins}\n`
    message += `ㅤ𓏸𓈒ㅤׄ Derrotas totales: ${totalLosses}\n`
    message += `ㅤ𓏸𓈒ㅤׄ Win Rate global: ${globalWinRate}%\n`
    message += `ㅤ𓏸𓈒ㅤׄ Poder total: ${totalPower.toLocaleString()}\n\n`
    message += `─────────────────\n`
    message += `ㅤ𓏸𓈒ㅤׄ Pokémon activos: ${pokemonList.length}`

    await m.reply(message, null, { mentions: [target] })
  } catch (e) {
    m.reply(msgglobal + e)
  }
}

handler.help = ['historial', 'historypoke']
handler.tags = ['pokes']
handler.command = ['historial', 'historypoke']

export default handler