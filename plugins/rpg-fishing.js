let handler = async (m, { conn, command, usedPrefix }) => {
  // Verificar economía activada con temática navideña
  if (!global.db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`🎅 *¡Pesca Navideña Cancelada!* ❄️\n\nLos comandos de *Economía Navideña* están desactivados en este grupo.\n\nUn *Elfo Administrador* puede activarlos con:\n» *${usedPrefix}economy on*\n\n🦌 *¡Así podrás pescar en el Lago Congelado del Polo Norte!* 🎣`)
  }
  
  let user = global.db.data.users[m.sender]
  if (!user) global.db.data.users[m.sender] = user = { 
    coin: 0, 
    exp: 0, 
    lastFish: 0,
    christmasSpirit: 0,
    fishingSkill: 0
  }
  
  // Bonus especial si es diciembre (cooldown reducido)
  const esNavidad = new Date().getMonth() === 11
  const cooldownBase = 12 * 60 * 1000 // 12 minutos base
  const cooldown = esNavidad ? cooldownBase * 0.8 : cooldownBase // 20% menos en diciembre
  
  const ahora = Date.now()
  
  // Verificar cooldown con mensaje navideño
  if (ahora < user.lastFish) {
    const restante = user.lastFish - ahora
    const wait = formatTimeMs(restante)
    return conn.reply(m.chat, 
      `⏰ *¡El hielo necesita tiempo para formarse!* ❄️\n\nDebes esperar *${wait}* para pescar en el *Lago Congelado* de nuevo.\n\n*🎅 Mientras tanto puedes:*\n• Decorar el árbol: *${usedPrefix}decorate*\n• Hornear galletas: *${usedPrefix}cookies*\n• Cantar villancicos: *${usedPrefix}carols*`, m)
  }
  
  user.lastFish = ahora + cooldown
  
  // Mejorar habilidad de pesca con cada uso
  if (!user.fishingSkill) user.fishingSkill = 0
  user.fishingSkill = Math.min(user.fishingSkill + 0.1, 5) // Máximo nivel 5
  
  // Bonus por nivel de habilidad (más chance de éxito)
  const bonusHabilidad = 1 + (user.fishingSkill * 0.1) // Hasta 50% más chance
  const chanceBase = 0.7 // 70% base de éxito
  const chanceExito = Math.min(chanceBase * bonusHabilidad, 0.95) // Máximo 95%
  
  // Determinar resultado basado en chance mejorada
  const exito = Math.random() < chanceExito
  const tipo = exito ? 'victoria' : 'derrota'
  
  // Seleccionar evento apropiado
  const evento = exito ? 
    pickRandom(eventosNavidenos.filter(e => e.tipo === 'victoria')) :
    pickRandom(eventosNavidenos.filter(e => e.tipo === 'derrota'))
  
  let monedas, experiencia, espirituNavideno, itemEspecial
  
  // Bonus de diciembre
  const multiplicadorNavidad = esNavidad ? 1.5 : 1
  
  if (exito) {
    // Éxito: Pesca exitosa
    monedas = Math.floor((Math.random() * 2001 + 11000) * multiplicadorNavidad * (1 + user.fishingSkill * 0.2))
    experiencia = Math.floor((Math.random() * 61 + 30) * multiplicadorNavidad)
    espirituNavideno = Math.floor(Math.random() * 8) + 2
    
    // Posibilidad de item especial (10% chance)
    if (Math.random() < 0.1) {
      const items = [
        { nombre: '🎣 Caña de Pescar Dorada', bonus: 500 },
        { nombre: '🧊 Hielo Mágico', bonus: 300 },
        { nombre: '🎁 Regalo Flotante', bonus: 800 },
        { nombre: '⭐ Estrella de la Suerte', bonus: 1000 }
      ]
      itemEspecial = pickRandom(items)
      monedas += itemEspecial.bonus
    }
    
    user.coin += monedas
    user.exp += experiencia
    user.christmasSpirit = (user.christmasSpirit || 0) + espirituNavideno
    
  } else {
    // Fracaso
    monedas = Math.floor((Math.random() * 2001 + 5000) * 0.6) // 40% menos pérdida
    experiencia = Math.floor((Math.random() * 31 + 30) * 0.5)
    
    // Aún puede ganar algo de espíritu navideño (30% chance)
    if (Math.random() < 0.3) {
      espirituNavideno = Math.floor(Math.random() * 3) + 1
      user.christmasSpirit = (user.christmasSpirit || 0) + espirituNavideno
    }
    
    user.coin = Math.max(0, user.coin - monedas)
    user.exp = Math.max(0, user.exp - experiencia)
  }
  
  // Construir mensaje de resultado
  let resultado = `🎣 *¡Pesca en el Lago Congelado!* ❄️\n\n`
  resultado += `${evento.mensaje}\n\n`
  
  if (exito) {
    resultado += `✨ *¡Pesca Exitosa!*\n`
    resultado += `💰 *Regalos obtenidos:* ${currency}${monedas.toLocaleString()}\n`
    resultado += `⭐ *Experiencia:* ${experiencia.toLocaleString()} XP\n`
    resultado += `🎄 *Espíritu Navideño:* +${espirituNavideno}\n`
    resultado += `🎣 *Habilidad de Pesca:* Nivel ${user.fishingSkill.toFixed(1)}\n`
    
    if (itemEspecial) {
      resultado += `🎁 *¡Item Especial!* ${itemEspecial.nombre}\n`
      resultado += `✨ *Bonus adicional:* ${currency}${itemEspecial.bonus.toLocaleString()}\n`
    }
    
    if (multiplicadorNavidad > 1) {
      resultado += `🎅 *Bonus de Diciembre:* x1.5 en recompensas!\n`
    }
    
    // Mensaje especial por alta habilidad
    if (user.fishingSkill >= 3) {
      resultado += `🏆 *¡Eres un experto pescador del Polo Norte!*\n`
    }
    
  } else {
    resultado += `🧊 *¡El hielo estaba muy grueso!*\n`
    resultado += `🦌 *Regalos perdidos:* ${currency}${monedas.toLocaleString()}\n`
    resultado += `📉 *Experiencia perdida:* ${experiencia.toLocaleString()} XP\n`
    
    if (espirituNavideno) {
      resultado += `✨ *Pero ganaste Espíritu Navideño:* +${espirituNavideno}\n`
    }
    
    // Mensaje alentador
    resultado += `💡 *No te rindas!* Intenta de nuevo en ${formatTimeMs(cooldown)}.\n`
  }
  
  // Footer con estadísticas y consejos
  resultado += `\n━━━━━━━━━━━━━━━━━━━━\n`
  resultado += `💰 *Cartera:* ${currency}${user.coin.toLocaleString()}\n`
  resultado += `🎯 *Experiencia:* ${user.exp.toLocaleString()} XP\n`
  resultado += `✨ *Espíritu Navideño:* ${user.christmasSpirit || 0}\n`
  resultado += `🎣 *Nivel de Pesca:* ${user.fishingSkill.toFixed(1)}/5.0\n`
  resultado += `⏰ *Próxima pesca:* en ${formatTimeMs(cooldown)}\n\n`
  
  // Consejo aleatorio
  const consejos = [
    'Usa cebo de galleta para atraer peces dorados.',
    'Los días soleados son mejores para pescar en el hielo.',
    'Pesca cerca de los agujeros donde beben los renos.',
    'Santa recompensa a los pescadores pacientes.',
    'El espíritu navideño atrae peces más valiosos.',
    'Mejora tu habilidad pescando regularmente.',
    'En diciembre, los peces son más generosos.'
  ]
  resultado += `💡 *Consejo de Pesca:* ${pickRandom(consejos)}`
  
  // Enviar mensaje
  await conn.reply(m.chat, resultado, m)
  
  // Efecto especial para pescas excepcionales
  if (exito && monedas > 15000) {
    setTimeout(() => {
      conn.sendMessage(m.chat, { 
        text: `🎣 *¡Pesca legendaria!* 🏆\nLos elfos cuentan historias sobre tu hazaña en el hielo.` 
      }, { quoted: m })
    }, 1000)
  }
  
  await global.db.write()
}

handler.tags = ['economy', 'navidad', 'pesca']
handler.help = ['pescar', 'fish', 'pescanavidad', 'lagocongelado', 'icefishing']
handler.command = ['pescar', 'fish', 'pescanavidad', 'lagocongelado', 'icefishing', 'navidadpesca', 'santafish']
handler.group = true
handler.limit = true

export default handler

// Funciones auxiliares
function formatTimeMs(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  const partes = []
  if (min) partes.push(`${min} minuto${min !== 1 ? 's' : ''}`)
  partes.push(`${sec} segundo${sec !== 1 ? 's' : ''}`)
  return partes.join(' ')
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

// Eventos navideños de pesca
const eventosNavidenos = [
  // Victorias - Pescas exitosas
  { tipo: 'victoria', mensaje: '🎣 *¡Pescaste un Pez Navideño Dorado!* ✨\nSus escamas brillan como luces de Navidad.' },
  { tipo: 'victoria', mensaje: '❄️ *¡Atrapaste un Salmón del Polo Norte!* 🐟\nSanta lo usa para su cena especial.' },
  { tipo: 'victoria', mensaje: '🎁 *¡Encontraste un Regalo Flotante!* 🎄\nAlguien lo perdió en el lago congelado.' },
  { tipo: 'victoria', mensaje: '🦌 *¡Pescaste un Reno de Hielo!* ❄️\nEs una escultura natural perfecta.' },
  { tipo: 'victoria', mensaje: '⭐ *¡Capturaste una Estrella Marina Brillante!* ✨\nBrilla como la Estrella de Belén.' },
  { tipo: 'victoria', mensaje: '🔔 *¡Atrapaste un Pez Campana!* 🎶\nSu sonido es como un villancico acuático.' },
  { tipo: 'victoria', mensaje: '🎄 *¡Pescaste un Árbol de Navidad Miniature!* 🌲\nPerfecto para decorar la mesa de Santa.' },
  { tipo: 'victoria', mensaje: '🧦 *¡Encontraste una Media Navideña Perdida!* 🎅\nEstaba llena de dulces congelados.' },
  { tipo: 'victoria', mensaje: '✨ *¡Capturaste un Copo de Nieve Mágico!* ❄️\nNunca se derrite y brilla intensamente.' },
  { tipo: 'victoria', mensaje: '🛷 *¡Pescaste un Trineo en Miniatura!* 🦌\nLos elfos lo usan para entrenar renos jóvenes.' },
  
  // Derrotas - Pescas fallidas
  { tipo: 'derrota', mensaje: '🧊 *El hielo se rompió bajo tus pies.*\nTuviste que retirarte rápidamente.' },
  { tipo: 'derrota', mensaje: '🎣 *Tu caña se congeló y se quebró.*\nEl frío del Polo Norte es implacable.' },
  { tipo: 'derrota', mensaje: '🐻 *Un oso polar asustó a los peces.*\nMejor darle espacio al rey del hielo.' },
  { tipo: 'derrota', mensaje: '🌨️ *Una tormenta de nieve comenzó.*\nLa visibilidad era nula, tuviste que parar.' },
  { tipo: 'derrota', mensaje: '🧦 *Pescaste solo un calcetín mojado.*\nAlgún elfo lo perdió lavando ropa.' },
  { tipo: 'derrota', mensaje: '🕳️ *Tu agujero en el hielo se congeló.*\nNecesitas herramientas más calientes.' },
  { tipo: 'derrota', mensaje: '🎅 *Santa pasó con su trineo.*\nEl ruido asustó a todos los peces.' },
  { tipo: 'derrota', mensaje: '🧚 *Los duendes hicieron una travesura.*\nMovieron tu cebo sin que te dieras cuenta.' },
  { tipo: 'derrota', mensaje: '☃️ *Un muñeco de nieve bloqueó tu vista.*\nAlguien lo construyó justo frente a ti.' },
  { tipo: 'derrota', mensaje: '🔮 *El hielo era demasiado transparente.*\nLos peces podían verte y se asustaban.' }
]