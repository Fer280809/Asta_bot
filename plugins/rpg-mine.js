let handler = async (m, { conn, usedPrefix, command, text }) => {
  // Verificar si la economía está activada en grupos
  if (!global.db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(
      `⛏️ *¡Minería Cancelada!* 💎\n\nLos comandos de *Minería* están desactivados en este grupo.\n\nUn *Administrador* puede activarlos con:\n» *${usedPrefix}economy on*\n\n🛡️ *¡Así podrás extraer minerales valiosos!* 🔥`
    )
  }

  const user = global.db.data.users[m.sender]
  if (!user) {
    global.db.data.users[m.sender] = {
      coin: 0,
      exp: 0,
      health: 100,
      lastmine: 0,
      // Sistema de picos
      pickaxe: 0, // 0: sin pico, 1: madera, 2: piedra, 3: hierro, 4: diamante, 5: netherite
      pickaxedurability: 0,
      // Recursos del mine
      coal: 0,
      iron: 0,
      gold: 0,
      diamond: 0,
      emerald: 0,
      redstone: 0,
      lapis: 0,
      quartz: 0,
      copper: 0,
      ancient_debris: 0,
      netherite: 0,
      // Habilidad de minería
      miningSkill: 0,
      // Inventario para crafteo
      wood: 0,
      cobblestone: 0,
      stick: 0
    }
    user = global.db.data.users[m.sender]
  }

  // Inicializar propiedades si no existen
  const defaultValues = {
    coin: 0,
    exp: 0,
    health: 100,
    lastmine: 0,
    pickaxe: 0,
    pickaxedurability: 0,
    coal: 0, iron: 0, gold: 0, diamond: 0, emerald: 0,
    redstone: 0, lapis: 0, quartz: 0, copper: 0,
    ancient_debris: 0, netherite: 0,
    miningSkill: 0,
    wood: 0, cobblestone: 0, stick: 0
  }

  for (const key in defaultValues) {
    if (user[key] === undefined) user[key] = defaultValues[key]
  }

  // Si el usuario no tiene pico, debe comprar uno
  if (user.pickaxe === 0) {
    return conn.reply(m.chat,
      `⛏️ *¡Necesitas un pico para minar!* 🔨\n\nNo tienes ningún pico. Compra uno en la tienda:\n\n` +
      `*${usedPrefix}comprar pico_madera* - 2000 monedas\n` +
      `*${usedPrefix}comprar pico_piedra* - 5000 monedas\n` +
      `*${usedPrefix}comprar pico_hierro* - 10000 monedas\n` +
      `*${usedPrefix}comprar pico_diamante* - 50000 monedas\n` +
      `*${usedPrefix}comprar pico_netherite* - 100000 monedas\n\n` +
      `O usa *${usedPrefix}craft* para craftear uno si tienes los materiales.`,
      m
    )
  }

  // Verificar durabilidad del pico
  if (user.pickaxedurability <= 0) {
    return conn.reply(m.chat,
      `⛏️ *¡Tu pico está roto!* 🔨\n\nLa durabilidad de tu pico es *0*. Debes repararlo o conseguir uno nuevo.\n\n` +
      `*✨ Opciones:*\n` +
      `1. Reparar pico: *${usedPrefix}repararpico* (cuesta recursos)\n` +
      `2. Comprar pico nuevo: *${usedPrefix}comprar* [tipo_pico]\n` +
      `3. Craftear pico nuevo: *${usedPrefix}craft pico* [material]\n` +
      `4. Usar otro pico si tienes en inventario`,
      m
    )
  }

  // Verificar salud
  if (user.health < 5) {
    return conn.reply(m.chat,
      `💔 *¡Poca salud!* ⛏️\n\nNo tienes suficiente *Salud* para minar.\n\n> Usa *"${usedPrefix}heal"* para recuperar salud\n> Come algo: *"${usedPrefix}eat"*\n> Descansa un rato: *"${usedPrefix}rest"*\n\n*❤️ Tu salud actual:* ${user.health}/100`, m)
  }

  // Cooldown basado en el tipo de pico (mejores picos = menos cooldown)
  const cooldowns = [0, 10, 8, 6, 4, 2] // en minutos
  const gap = cooldowns[user.pickaxe] * 60 * 1000

  const now = Date.now()

  // Verificar cooldown
  if (now < user.lastmine) {
    const restante = user.lastmine - now
    return conn.reply(m.chat,
      `⏰ *¡Necesitas esperar!* ⛏️\n\nDebes esperar *${formatTime(restante)}* para minar de nuevo.\n\n` +
      `*🛠️ Mientras tanto puedes:*\n` +
      `• Craftear herramientas: *${usedPrefix}craft*\n` +
      `• Construir: *${usedPrefix}build*\n` +
      `• Explorar: *${usedPrefix}explore*`,
      m
    )
  }

  user.lastmine = now + gap

  // Reducir durabilidad del pico (depende del tipo de pico, los mejores duran más)
  const durabilidadPerdida = Math.max(1, 5 - user.pickaxe) // Mejores picos pierden menos durabilidad
  user.pickaxedurability = Math.max(0, user.pickaxedurability - durabilidadPerdida)

  // Mejorar habilidad de minería
  user.miningSkill = Math.min((user.miningSkill || 0) + 0.1, 50)

  // Bonus por habilidad y tipo de pico
  const bonusPico = user.pickaxe * 0.15 // 15% por nivel de pico
  const bonusHabilidad = user.miningSkill * 0.02 // 2% por nivel de habilidad
  const chanceExito = Math.min(0.7 + bonusPico + bonusHabilidad, 0.95)

  // Determinar éxito
  const exito = Math.random() < chanceExito

  let experiencia = 0
  let saludPerdida = Math.floor(Math.random() * 5) + 1
  let recursosGanados = {}

  if (exito) {
    // Éxito: Minería exitosa
    experiencia = Math.floor((Math.random() * 91 + 10) * (1 + user.pickaxe * 0.2))

    // Tabla de recursos según el pico
    const tablasRecursos = {
      1: [ // Pico de madera
        { nombre: 'carbón', cantidad: () => Math.floor(Math.random() * 16) + 8, prob: 0.9 },
        { nombre: 'piedra', cantidad: () => Math.floor(Math.random() * 32) + 16, prob: 0.8 }
      ],
      2: [ // Pico de piedra
        { nombre: 'carbón', cantidad: () => Math.floor(Math.random() * 24) + 12, prob: 0.9 },
        { nombre: 'hierro', cantidad: () => Math.floor(Math.random() * 12) + 6, prob: 0.7 },
        { nombre: 'cobre', cantidad: () => Math.floor(Math.random() * 16) + 8, prob: 0.6 }
      ],
      3: [ // Pico de hierro
        { nombre: 'carbón', cantidad: () => Math.floor(Math.random() * 32) + 16, prob: 0.9 },
        { nombre: 'hierro', cantidad: () => Math.floor(Math.random() * 16) + 8, prob: 0.8 },
        { nombre: 'oro', cantidad: () => Math.floor(Math.random() * 8) + 4, prob: 0.5 },
        { nombre: 'redstone', cantidad: () => Math.floor(Math.random() * 20) + 10, prob: 0.7 },
        { nombre: 'lapislázuli', cantidad: () => Math.floor(Math.random() * 12) + 6, prob: 0.6 },
        { nombre: 'diamante', cantidad: () => Math.floor(Math.random() * 3) + 1, prob: 0.1 }
      ],
      4: [ // Pico de diamante
        { nombre: 'carbón', cantidad: () => Math.floor(Math.random() * 40) + 20, prob: 0.9 },
        { nombre: 'hierro', cantidad: () => Math.floor(Math.random() * 24) + 12, prob: 0.8 },
        { nombre: 'oro', cantidad: () => Math.floor(Math.random() * 12) + 6, prob: 0.6 },
        { nombre: 'diamante', cantidad: () => Math.floor(Math.random() * 5) + 2, prob: 0.3 },
        { nombre: 'esmeralda', cantidad: () => Math.floor(Math.random() * 4) + 2, prob: 0.2 },
        { nombre: 'redstone', cantidad: () => Math.floor(Math.random() * 32) + 16, prob: 0.8 },
        { nombre: 'lapislázuli', cantidad: () => Math.floor(Math.random() * 20) + 10, prob: 0.7 },
        { nombre: 'cuarzo', cantidad: () => Math.floor(Math.random() * 16) + 8, prob: 0.5 }
      ],
      5: [ // Pico de netherite
        { nombre: 'carbón', cantidad: () => Math.floor(Math.random() * 50) + 25, prob: 0.9 },
        { nombre: 'hierro', cantidad: () => Math.floor(Math.random() * 32) + 16, prob: 0.8 },
        { nombre: 'oro', cantidad: () => Math.floor(Math.random() * 16) + 8, prob: 0.7 },
        { nombre: 'diamante', cantidad: () => Math.floor(Math.random() * 8) + 4, prob: 0.4 },
        { nombre: 'esmeralda', cantidad: () => Math.floor(Math.random() * 6) + 3, prob: 0.3 },
        { nombre: 'redstone', cantidad: () => Math.floor(Math.random() * 40) + 20, prob: 0.9 },
        { nombre: 'lapislázuli', cantidad: () => Math.floor(Math.random() * 24) + 12, prob: 0.8 },
        { nombre: 'cuarzo', cantidad: () => Math.floor(Math.random() * 20) + 10, prob: 0.6 },
        { nombre: 'escombros_antiguos', cantidad: () => Math.floor(Math.random() * 3) + 1, prob: 0.15 },
        { nombre: 'netherita', cantidad: () => Math.floor(Math.random() * 2) + 1, prob: 0.1 }
      ]
    }

    const tabla = tablasRecursos[user.pickaxe] || tablasRecursos[1]

    tabla.forEach(recurso => {
      if (Math.random() < recurso.prob) {
        const cantidad = recurso.cantidad()
        const nombre = recurso.nombre
        recursosGanados[nombre] = (recursosGanados[nombre] || 0) + cantidad
        
        // Actualizar inventario del usuario
        switch(nombre) {
          case 'carbón': user.coal += cantidad; break
          case 'piedra': user.cobblestone += cantidad; break
          case 'hierro': user.iron += cantidad; break
          case 'oro': user.gold += cantidad; break
          case 'diamante': user.diamond += cantidad; break
          case 'esmeralda': user.emerald += cantidad; break
          case 'redstone': user.redstone += cantidad; break
          case 'lapislázuli': user.lapis += cantidad; break
          case 'cuarzo': user.quartz += cantidad; break
          case 'cobre': user.copper += cantidad; break
          case 'escombros_antiguos': user.ancient_debris += cantidad; break
          case 'netherita': user.netherite += cantidad; break
        }
      }
    })

    // Añadir experiencia y salud
    user.exp += experiencia
    user.health -= saludPerdida

    // Posibilidad de encontrar dinero (monedas)
    if (Math.random() < 0.3) {
      const monedas = Math.floor(Math.random() * 500) + 100 * user.pickaxe
      user.coin += monedas
      recursosGanados['monedas'] = monedas
    }

  } else {
    // Fracaso
    experiencia = Math.floor((Math.random() * 20) + 5)
    user.exp += experiencia
    user.health -= saludPerdida * 2 // Pierde más salud si falla
  }

  // Asegurar que la salud no sea negativa
  if (user.health < 0) user.health = 0
  if (user.health > 100) user.health = 100

  // Construir mensaje de resultado
  let resultado = `⛏️ *¡Minería en las profundidades!* 💎\n\n`
  resultado += `🛠️ *Pico usado:* ${obtenerNombrePico(user.pickaxe)}\n`
  resultado += `🔨 *Durabilidad restante:* ${user.pickaxedurability}\n\n`

  if (exito) {
    resultado += `✅ *¡Extracción exitosa!*\n`
    resultado += `⭐ *Experiencia ganada:* ${experiencia} XP\n`
    
    if (Object.keys(recursosGanados).length > 0) {
      resultado += `📦 *Recursos obtenidos:*\n`
      for (const [recurso, cantidad] of Object.entries(recursosGanados)) {
        resultado += `• ${formatearNombreRecurso(recurso)}: ${cantidad}\n`
      }
    } else {
      resultado += `📦 *No encontraste recursos esta vez.*\n`
    }
  } else {
    resultado += `❌ *¡La extracción falló!*\n`
    resultado += `⭐ *Experiencia ganada:* ${experiencia} XP (por intento)\n`
    resultado += `💔 *Salud perdida:* ${saludPerdida * 2}\n`
  }

  resultado += `❤️ *Salud restante:* ${user.health}/100\n`
  resultado += `📈 *Nivel de minería:* ${user.miningSkill.toFixed(1)}\n`
  resultado += `⏰ *Próxima minería:* en ${formatTime(gap)}\n\n`

  // Advertencia si la durabilidad es baja
  if (user.pickaxedurability <= 10) {
    resultado += `⚠️ *¡Tu pico está a punto de romperse!* Considera repararlo pronto.\n\n`
  }

  // Mostrar inventario de recursos
  resultado += `🎒 *Inventario de minerales:*\n`
  resultado += `• Carbón: ${user.coal}\n`
  resultado += `• Hierro: ${user.iron}\n`
  resultado += `• Oro: ${user.gold}\n`
  resultado += `• Diamante: ${user.diamond}\n`
  resultado += `• Esmeralda: ${user.emerald}\n`
  resultado += `• Redstone: ${user.redstone}\n`
  resultado += `• Lapislázuli: ${user.lapis}\n`
  resultado += `• Cuarzo: ${user.quartz}\n`
  resultado += `• Cobre: ${user.copper}\n`
  if (user.ancient_debris > 0) resultado += `• Escombros antiguos: ${user.ancient_debris}\n`
  if (user.netherite > 0) resultado += `• Netherita: ${user.netherite}\n`

  // Enviar mensaje
  await conn.reply(m.chat, resultado, m)

  // Efecto especial si el pico se rompió
  if (user.pickaxedurability <= 0) {
    setTimeout(() => {
      conn.sendMessage(m.chat, {
        text: `💔 *¡Tu pico se ha roto!* 🔨\n\nNecesitas repararlo o conseguir uno nuevo para seguir minando.\n\nUsa: *${usedPrefix}repararpico* o *${usedPrefix}comprar* [tipo_pico]`
      }, { quoted: m })
    }, 1500)
  }
}

handler.help = ['minar', 'mine']
handler.tags = ['economy', 'mine']
handler.command = ['minar', 'mine']
handler.group = true

export default handler

// Funciones auxiliares
function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60
  const partes = []
  if (minutes > 0) partes.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`)
  if (seconds > 0) partes.push(`${seconds} segundo${seconds !== 1 ? 's' : ''}`)
  return partes.join(' ')
}

function obtenerNombrePico(nivel) {
  const nombres = ['Ninguno', 'Madera', 'Piedra', 'Hierro', 'Diamante', 'Netherita']
  return nombres[nivel] || 'Desconocido'
}

function formatearNombreRecurso(nombre) {
  const nombres = {
    'carbón': 'Carbón',
    'piedra': 'Piedra',
    'hierro': 'Hierro',
    'oro': 'Oro',
    'diamante': 'Diamante',
    'esmeralda': 'Esmeralda',
    'redstone': 'Redstone',
    'lapislázuli': 'Lapislázuli',
    'cuarzo': 'Cuarzo del Nether',
    'cobre': 'Cobre',
    'escombros_antiguos': 'Escombros antiguos',
    'netherita': 'Netherita',
    'monedas': 'Monedas'
  }
  return nombres[nombre] || nombre
}
