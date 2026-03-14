import { promises as fs } from 'fs'

const POKEMON_FILES = [
  './lib/pokemon.json',
  './lib/pokemon2.json',
  './lib/pokemon3.json',
  './lib/pokemon4.json'
]

async function loadPokemon() {
  const allPokemon = []
  for (const file of POKEMON_FILES) {
    try {
      const data = await fs.readFile(file, 'utf-8')
      const pokemon = JSON.parse(data)
      allPokemon.push(...pokemon)
    } catch {
      console.log(`Archivo ${file} no encontrado o inválido, continuando...`)
    }
  }
  return allPokemon
}

let handler = async (m, { conn, usedPrefix, text, args, command }) => {
  if (global.db.data.chats[m.chat].adminonly || !global.db.data.chats[m.chat].pokes)
    return m.reply(`ㅤ𓏸𓈒ㅤׄ Estos comandos estan desactivados en este grupo.`)

  const groupData = global.db.data.chats[m.chat]
  const userData = global.db.data.chats[m.chat].users[m.sender]
  const now = Date.now()
  const cooldown = 15 * 60 * 1000

  if (userData.lastPokemonRoll && now < userData.lastPokemonRoll) {
    const timeLeft = Math.ceil((userData.lastPokemonRoll - now) / 1000)
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    let timeText = ''
    if (minutes > 0) timeText += `${minutes} minuto${minutes !== 1 ? 's' : ''} `
    if (seconds > 0 || timeText === '') timeText += `${seconds} segundo${seconds !== 1 ? 's' : ''}`
    return m.reply(`ㅤ𓏸𓈒ㅤׄ Debes esperar *${timeText.trim()}* para usar *${usedPrefix + command}* de nuevo.`)
  }

  const botId = conn?.user?.id.split(':')[0] + '@s.whatsapp.net' || ''
  const botSettings = global.db.data.settings[botId] || {}
  const money = botSettings.currency || ''

  try {
    const allPokemon = await loadPokemon()
    if (allPokemon.length === 0) return m.reply(`ㅤ𓏸𓈒ㅤׄ No se encontraron Pokémon disponibles.`)

    const randomPokemon = allPokemon[Math.floor(Math.random() * allPokemon.length)]
    const pokemonId = String(randomPokemon.id)

    if (!global.db.data.pokemon) global.db.data.pokemon = {}
    if (!global.db.data.pokemon[m.chat]) global.db.data.pokemon[m.chat] = {}

    const randomPrice = Math.floor(Math.random() * (1000000 - 100 + 1)) + 100

    if (!global.db.data.pokemon[m.chat][pokemonId]) {
      global.db.data.pokemon[m.chat][pokemonId] = {
        id: pokemonId,
        nombre: randomPokemon.nombre,
        tipo: randomPokemon.tipo,
        habilidades: randomPokemon.habilidades,
        peso: randomPokemon.peso,
        altura: randomPokemon.altura,
        especie: randomPokemon.especie,
        habilidadOculta: randomPokemon.habilidadOculta,
        atrapado: false,
        atrapador: null,
        poder: 1000,
        precio: randomPrice,
        lastBattle: null,
        wins: 0,
        losses: 0
      }
    }

    const pokemonData = global.db.data.pokemon[m.chat][pokemonId]
    let ownerName = 'Libre'

    if (pokemonData.atrapado && pokemonData.atrapador) {
      const ownerData = global.db.data.users[pokemonData.atrapador]
      ownerName = ownerData?.name?.trim() ||
        await conn.getName(pokemonData.atrapador).catch(() => pokemonData.atrapador.split('@')[0]) ||
        'Desconocido'
    }

    const caption =
      `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜* ㅤ֢ㅤ⸱ㅤᯭִ* — *${randomPokemon.nombre}*\n\n` +
      `ㅤ𓏸𓈒ㅤׄ *Tipo* » ${randomPokemon.tipo}\n` +
      `ㅤ𓏸𓈒ㅤׄ *Habilidades* » ${Array.isArray(randomPokemon.habilidades) ? randomPokemon.habilidades.join(', ') : randomPokemon.habilidades}\n` +
      `ㅤ𓏸𓈒ㅤׄ *Habilidad Oculta* » ${randomPokemon.habilidadOculta}\n` +
      `ㅤ𓏸𓈒ㅤׄ *Altura* » ${randomPokemon.altura}\n` +
      `ㅤ𓏸𓈒ㅤׄ *Peso* » ${randomPokemon.peso}\n` +
      `ㅤ𓏸𓈒ㅤׄ *Especie* » ${randomPokemon.especie}\n` +
      `ㅤ𓏸𓈒ㅤׄ *Poder* » ${pokemonData.poder.toLocaleString()}\n` +
      `ㅤ𓏸𓈒ㅤׄ *Precio* » ${pokemonData.precio.toLocaleString()} ${money}\n` +
      `ㅤ𓏸𓈒ㅤׄ *Estado* » ${pokemonData.atrapado ? `Atrapado por ${ownerName}` : 'Libre'}\n\n` +
      `─────────────────\n` +
      `ㅤ𓏸𓈒ㅤׄ Usa *${usedPrefix}atrapar* respondiendo a este mensaje para atraparlo.`

    const payload = { image: { url: randomPokemon.imagen }, caption, mimetype: 'image/jpeg' }

    const sentMsg = await conn.sendMessage(m.chat, payload, { quoted: m })

    groupData.lastPokemonId = pokemonId
    groupData.lastPokemonMsgId = sentMsg.key?.id || null
    userData.lastPokemonRoll = now + cooldown

  } catch (e) {
    await conn.reply(m.chat, msgglobal, m)
  }
}

handler.help = ['pokemon', 'rollpoke']
handler.tags = ['pokes']
handler.command = ['pokemon', 'rollpoke']

export default handler