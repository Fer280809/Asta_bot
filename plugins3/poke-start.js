import { pokemonDB } from '../../lib/databasepokemon.js'
import { PokemonLogic } from '../../lib/logic.js'
import fs from 'fs'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const userId = m.sender
  const logic = new PokemonLogic(userId)
  const userData = await logic.loadUserData()
  
  // Si ya empezó el juego
  if (userData.player.started) {
    return m.reply(`🎮 *Ya has comenzado tu aventura Pokémon!*\nUsa *${usedPrefix}mapa* para ver dónde estás.`)
  }
  
  // Inicio del juego
  if (!args[0]) {
    const starterMessage = `*¡Bienvenido al mundo Pokémon!*\n\nSoy el Profesor Oak. Antes de comenzar tu aventura, debes elegir a tu primer compañero:\n\n` +
      `1. 🔥 *Charmander* - Tipo Fuego\n   "Prefiere las cosas calientes. Dicen que cuando llueve le sale vapor de la punta de la cola."\n\n` +
      `2. 💧 *Squirtle* - Tipo Agua\n   "Cuando retrae su largo cuello en el caparazón, dispara agua a una presión increíble."\n\n` +
      `3. 🌿 *Bulbasaur* - Tipo Planta/Veneno\n   "Una rara semilla fue plantada en su espalda al nacer. La planta brota y crece con este Pokémon."\n\n` +
      `*Responde con el número del Pokémon que quieras:*`
    
    await conn.sendMessage(m.chat, { 
      text: starterMessage,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true
      }
    }, { quoted: m })
    
    // Guardar que está en proceso de elegir
    global.starterSelection = global.starterSelection || {}
    global.starterSelection[userId] = true
    
    return
  }
  
  // Procesar elección
  if (global.starterSelection && global.starterSelection[userId]) {
    const choice = parseInt(args[0])
    let starterId
    
    if (choice === 1) starterId = 4  // Charmander
    else if (choice === 2) starterId = 7   // Squirtle
    else if (choice === 3) starterId = 1   // Bulbasaur
    else {
      return m.reply('❌ Opción inválida. Elige 1, 2 o 3.')
    }
    
    // Crear Pokémon inicial
    const starterPokemon = {
      id: starterId,
      nickname: "",
      level: 5,
      exp: 0,
      currentHp: 20,
      maxHp: 20,
      moves: ["Placaje", "Gruñido"],
      stats: { hp: 20, atk: 10, def: 10, spa: 10, spd: 10, spe: 10 }
    }
    
    // Actualizar datos del usuario
    userData.team = [starterPokemon]
    userData.player.started = true
    userData.player.name = m.pushName || "Entrenador"
    userData.player.location = "pueblo_paleta"
    userData.player.money = 3000
    userData.player.lastAction = Date.now()
    
    // Guardar datos
    await logic.saveUserData()
    
    // Mensaje de confirmación
    const pokemonName = pokemonDB.pokemons[starterId].name
    const pokemonType = pokemonDB.pokemons[starterId].types.join("/")
    
    const successMessage = `*¡Excelente elección!*\n\n` +
      `Has elegido a *${pokemonName}* (Tipo: ${pokemonType}) como tu primer Pokémon.\n\n` +
      `🎒 *Tu equipo:*\n` +
      `└ ${pokemonName} - Nv. 5\n\n` +
      `💰 *Dinero:* $3000\n` +
      `📍 *Ubicación:* Pueblo Paleta\n\n` +
      `*Comandos disponibles:*\n` +
      `• ${usedPrefix}mapa - Ver tu ubicación\n` +
      `• ${usedPrefix}ui - Menú principal\n` +
      `• ${usedPrefix}equipo - Ver tu equipo\n` +
      `• ${usedPrefix}mochila - Ver tus objetos\n` +
      `• ${usedPrefix}aventura - Explorar (cuando estés en una ruta)`
    
    delete global.starterSelection[userId]
    
    await conn.sendMessage(m.chat, {
      text: successMessage,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true
      }
    }, { quoted: m })
  }
}

handler.command = /^(pokemon|poke-start|start)$/i
handler.tags = ['pokemon']
handler.help = ['iniciarp', 'pokemon1', 'pokestart']

export default handler
