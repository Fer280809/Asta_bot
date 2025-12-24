let handler = async (m, { conn, usedPrefix, command }) => {
  // Verificar economía activada
  if (!global.db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`⛏️ *¡Minas Cerradas!*\n\nUsa *${usedPrefix}economy on* para activar el sistema.`)
  }

  const user = global.db.data.users[m.sender]
  
  // Inicializar usuario
  if (!user) {
    global.db.data.users[m.sender] = {
      coin: 0,
      exp: 0,
      health: 100,
      hunger: 100,
      energy: 100,
      miningSkill: 0,
      coal: 0,
      iron: 0,
      gold: 0,
      diamond: 0,
      emerald: 0,
      pickaxe: 0,
      pickaxeDurability: 0
    }
    user = global.db.data.users[m.sender]
  }

  // Inicializar propiedades
  user.coin = user.coin || 0
  user.exp = user.exp || 0
  user.health = user.health || 100
  user.hunger = user.hunger || 100
  user.energy = user.energy || 100
  user.miningSkill = user.miningSkill || 0
  user.coal = user.coal || 0
  user.iron = user.iron || 0
  user.gold = user.gold || 0
  user.diamond = user.diamond || 0
  user.emerald = user.emerald || 0
  user.pickaxe = user.pickaxe || 0
  user.pickaxeDurability = user.pickaxeDurability || 0

  // Verificar salud crítica
  if (user.health < 25) {
    return conn.reply(m.chat,
      `💔 *¡Salud peligrosa!*\n\nTu salud es ${user.health}/100\n\n` +
      `🍖 Come comida nutritiva\n` +
      `💊 Descansa en cama\n` +
      `⚠️ Minar ahora sería muy peligroso`, m)
  }

  // Verificar hambre crítica
  if (user.hunger < 25) {
    return conn.reply(m.chat,
      `🍗 *¡Necesitas comer!*\n\nTu hambre es ${user.hunger}/100\n\n` +
      `🍽️ Usa *${usedPrefix}comer*\n` +
      `⚡ Sin comida no tienes energía\n` +
      `⚠️ Te desmayarías en las minas`, m)
  }

  // Verificar energía
  if (user.energy < 25) {
    return conn.reply(m.chat,
      `⚡ *¡Agotado!*\n\nTu energía es ${user.energy}/100\n\n` +
      `💤 Usa *${usedPrefix}descansar*\n` +
      `🍰 Come algo energético\n` +
      `😴 Necesitas descansar`, m)
  }

  // Verificar pico
  if (user.pickaxe === 0 || user.pickaxeDurability <= 0) {
    return conn.reply(m.chat,
      `⛏️ *¡Necesitas un pico!*\n\nSin pico no puedes minar.\n\n` +
      `🛒 *Picos disponibles:*\n` +
      `• Madera: ¥2,000 - *${usedPrefix}comprar pico madera*\n` +
      `• Piedra: ¥5,000 - *${usedPrefix}comprar pico piedra*\n` +
      `• Hierro: ¥15,000 - *${usedPrefix}comprar pico hierro*\n` +
      `• Diamante: ¥50,000 - *${usedPrefix}comprar pico diamante*\n\n` +
      `⚒️ *O craftea uno:* *${usedPrefix}craft pico*`, m)
  }

  // Cooldown
  const cooldown = 5 * 60 * 1000 // 5 minutos
  const now = Date.now()
  user.lastmine = user.lastmine || 0
  
  if (now < user.lastmine) {
    const restante = user.lastmine - now
    return conn.reply(m.chat,
      `⏰ *¡Minas en mantenimiento!*\n\nPuedes minar de nuevo en *${formatTime(restante)}*`, m)
  }

  // Actualizar tiempo y consumir recursos
  user.lastmine = now + cooldown
  user.hunger = Math.max(0, user.hunger - 25)
  user.energy = Math.max(0, user.energy - 25)
  
  // Posibilidad de perder salud por accidente (20%)
  if (Math.random() < 0.2) {
    const dano = Math.floor(Math.random() * 10) + 5
    user.health = Math.max(1, user.health - dano)
  }

  // Mejorar habilidad
  user.miningSkill = Math.min((user.miningSkill || 0) + 0.15, 40)
  
  // Reducir durabilidad
  const durabilidadPerdida = Math.max(1, 6 - user.pickaxe)
  user.pickaxeDurability = Math.max(0, user.pickaxeDurability - durabilidadPerdida)

  // Bonus por nivel y pico
  const bonusSkill = 1 + (user.miningSkill * 0.04)
  const bonusPickaxe = [0, 1, 1.2, 1.5, 2][user.pickaxe]
  
  // Generar recursos según pico
  let carbon = 0, hierro = 0, oro = 0, diamante = 0, esmeralda = 0
  let mensajeMina = ''
  
  const tipoMina = ['Carbón', 'Hierro', 'Oro', 'Diamante', 'Esmeralda'][user.pickaxe - 1] || 'Básica'

  // Tablas de probabilidad por tipo de pico
  if (user.pickaxe >= 1) { // Madera
    carbon = Math.floor((Math.random() * 8 + 4) * bonusSkill)
  }
  if (user.pickaxe >= 2) { // Piedra
    hierro = Math.floor((Math.random() * 4 + 1) * bonusSkill * 0.7)
  }
  if (user.pickaxe >= 3) { // Hierro
    oro = Math.floor((Math.random() * 2 + 1) * bonusSkill * 0.5)
  }
  if (user.pickaxe >= 4) { // Diamante
    if (Math.random() < 0.1 * bonusSkill) {
      diamante = Math.floor(Math.random() * 1 + 1)
    }
    if (Math.random() < 0.05 * bonusSkill) {
      esmeralda = Math.floor(Math.random() * 1 + 1)
    }
  }

  // Aplicar recursos
  if (carbon > 0) user.coal += carbon
  if (hierro > 0) user.iron += hierro
  if (oro > 0) user.gold += oro
  if (diamante > 0) user.diamond += diamante
  if (esmeralda > 0) user.emerald += esmeralda

  // Calcular experiencia y dinero
  const totalValor = (carbon * 10) + (hierro * 25) + (oro * 50) + (diamante * 200) + (esmeralda * 300)
  const experiencia = Math.floor(totalValor * 0.8 * bonusSkill)
  const dinero = Math.floor(totalValor * bonusPickaxe)

  user.exp += experiencia
  user.coin += dinero

  // Construir mensaje
  const nombrePico = ['Ninguno', 'Madera', 'Piedra', 'Hierro', 'Diamante'][user.pickaxe]
  
  let resultado = `⛏️ *MINANDO CON PIC
