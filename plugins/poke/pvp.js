import { resolveLidToRealJid } from "../../lib/utils.js"

let handler = async (m, { conn, usedPrefix, text, args, command }) => {
  if (global.db.data.chats[m.chat].adminonly || !global.db.data.chats[m.chat].pokes)
    return m.reply(`ㅤ𓏸𓈒ㅤׄ Estos comandos estan desactivados en este grupo.`)

  const userDatass = global.db.data.chats[m.chat].users[m.sender]

  const now = Date.now()
  const cooldown = 15 * 60 * 1000

  if (userDatass.lastPokemonPvp && now < userDatass.lastPokemonPvp) {
    const timeLeft = Math.ceil((userDatass.lastPokemonPvp - now) / 1000)
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    let timeText = ''
    if (minutes > 0) timeText += `${minutes} minuto${minutes !== 1 ? 's' : ''} `
    if (seconds > 0 || timeText === '') timeText += `${seconds} segundo${seconds !== 1 ? 's' : ''}`
    return m.reply(`ㅤ𓏸𓈒ㅤׄ Debes esperar *${timeText.trim()}* para usar *${usedPrefix + command}* de nuevo.`)
  }

  try {
    if (!text) return m.reply(`ㅤ𓏸𓈒ㅤׄ Uso: *${usedPrefix + command} <nombre_pokemon>*\n\nㅤ𓏸𓈒ㅤׄ Menciona a un oponente en tu mensaje.`)

    const mentionedJid = m.mentionedJid || []
    const who = mentionedJid[0] ? mentionedJid[0] : (m.quoted ? m.quoted.sender : null)

    const mentioned = await resolveLidToRealJid(who, conn, m.chat)

    if (!who) return m.reply(`ㅤ𓏸𓈒ㅤׄ Debes mencionar o responder al mensaje de tu oponente.`)
    if (mentioned === m.sender) return m.reply(`ㅤ𓏸𓈒ㅤׄ No puedes pelear contra ti mismo.`)

    const chatUsers = global.db.data.chats?.[m.chat]?.users || {}
    const userData = chatUsers?.[m.sender] || {}
    const opponentData = chatUsers?.[mentioned] || {}

    const userPokes = userData.pokemon || []
    const oppPokes = opponentData.pokemon || []
    if (userPokes.length === 0) return m.reply(`ㅤ𓏸𓈒ㅤׄ No tienes ningún Pokémon en este grupo.`)
    if (oppPokes.length === 0) {
      const opponentName = global.db.data.users?.[mentioned]?.name || mentioned.split('@')[0]
      return m.reply(`ㅤ𓏸𓈒ㅤׄ *${opponentName}* no puede pelear porque no tiene Pokémon en este grupo.`)
    }

    const pokemonName = text.trim().split(/\s+/)[0].toLowerCase()
    const myPokemon = userPokes.find(p => (p.nombre || '').toLowerCase() === pokemonName)
    if (!myPokemon) return m.reply(`ㅤ𓏸𓈒ㅤׄ No tienes un Pokémon llamado *${text.split(' ')[0]}* en este grupo.`)

    const myPokemonData = global.db.data.pokemon?.[m.chat]?.[myPokemon.id] || {}
    const now = Date.now()
    if (myPokemonData.lastBattle && now < myPokemonData.lastBattle) {
      const timeLeft = Math.ceil((myPokemonData.lastBattle - now) / 1000)
      const minutes = Math.floor(timeLeft / 60)
      return m.reply(`ㅤ𓏸𓈒ㅤׄ Tu *${myPokemon.nombre}* está descansando. Podrá pelear de nuevo en *${minutes} minuto${minutes !== 1 ? 's' : ''}*.`)
    }

    const existingBattle = Object.values(global.db.data.pokemonBattles).find(b =>
      b.challenger === m.sender &&
      b.challengerPokemon === myPokemon.id &&
      b.status === 'waiting' &&
      b.expiresAt > now
    )
    if (existingBattle) {
      return m.reply(`ㅤ𓏸𓈒ㅤׄ Tu *${myPokemon.nombre}* ya está en una batalla pendiente. No puede pelear dos batallas a la vez.`)
    }

    const battleId = `${m.chat}_${now}`
    global.db.data.pokemonBattles[battleId] = {
      challenger: m.sender,
      opponent: mentioned,
      challengerPokemon: myPokemon.id,
      status: 'waiting',
      createdAt: now,
      expiresAt: now + 60000
    }

    const opponentName = global.db.data.users?.[mentioned]?.name || mentioned.split('@')[0]
    const poderShown = (myPokemonData.poder || myPokemon.poder || 0).toLocaleString()

    await m.reply(
      `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜* ㅤ֢ㅤ⸱ㅤᯭִ* — *ᴅᴇsᴀғíᴏ ᴅᴇ ʙᴀᴛᴀʟʟᴀ*\n\n` +
      `ㅤ𓏸𓈒ㅤׄ *${m.pushName || m.sender.split('@')[0]}* ha retado a *${opponentName}*\n` +
      `ㅤ𓏸𓈒ㅤׄ Pokémon desafiante: *${myPokemon.nombre}* (Poder: ${poderShown})\n\n` +
      `─────────────────\n` +
      `ㅤ𓏸𓈒ㅤׄ @${mentioned.split('@')[0]}, responde con *${usedPrefix}pvp <nombre_pokemon>* para aceptar el desafío.`,
      null,
      { mentions: [mentioned] }
    )

    userDatass.lastPokemonPvp = now + cooldown
  } catch (e) {
    m.reply(msgglobal + e)
  }
}

handler.help = ['pvppoke', 'pokepvp', 'pokemonpvp', 'pvppokemon']
handler.tags = ['pokes']
handler.command = ['pvppoke', 'pokepvp', 'pokemonpvp', 'pvppokemon']

export default handler