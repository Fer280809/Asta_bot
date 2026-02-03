// lib/daily-missions.js

const ALL_MISSIONS = [
  // ========== ECONOMÍA BÁSICA ==========
  { 
    id: 'mine', 
    name: '⛏️ Minar recursos', 
    target: [15, 35], 
    rewardCoins: [20000, 45000], 
    rewardHearts: [15, 30],
    rewardItems: [{ id: 'iron', chance: 0.3, amount: [2, 5] }],
    category: 'economy',
    emoji: '⛏️',
    difficulty: 1,
    description: "Usa el comando /minar para completar esta misión"
  },
  { 
    id: 'work', 
    name: '💼 Trabajar', 
    target: [8, 20], 
    rewardCoins: [10000, 25000], 
    rewardHearts: [10, 25],
    rewardItems: [{ id: 'contract', chance: 0.1, amount: 1 }],
    category: 'economy',
    emoji: '💼',
    difficulty: 1,
    description: "Usa /trabajar para ganar dinero"
  },
  { 
    id: 'fish', 
    name: '🎣 Pescar peces', 
    target: [12, 30], 
    rewardCoins: [15000, 35000], 
    rewardHearts: [12, 28],
    rewardItems: [{ id: 'fish', chance: 0.4, amount: [3, 8] }],
    category: 'economy',
    emoji: '🎣',
    difficulty: 1,
    description: "Pesca con /pescar si tienes el comando"
  },
  
  // ========== ACTIVIDADES DE RIESGO ==========
  { 
    id: 'crime', 
    name: '🔫 Cometer crímenes', 
    target: [6, 18], 
    rewardCoins: [8000, 20000], 
    rewardHearts: [8, 20],
    penalty: { health: [5, 15], chance: 0.3 },
    category: 'risk',
    emoji: '🔫',
    difficulty: 2,
    description: "Comete crímenes con /crimen"
  },
  { 
    id: 'hunt', 
    name: '🏹 Cazar animales', 
    target: [5, 15], 
    rewardCoins: [18000, 40000], 
    rewardHearts: [15, 35],
    rewardItems: [
      { id: 'leather', chance: 0.5, amount: [2, 6] },
      { id: 'meat', chance: 0.4, amount: [3, 7] }
    ],
    category: 'risk',
    emoji: '🏹',
    difficulty: 2,
    description: "Caza animales con /cazar"
  },
  { 
    id: 'prosti', 
    name: '💋 Prostituirse', 
    target: [10, 25], 
    rewardCoins: [5000, 15000], 
    rewardHearts: [10, 25],
    penalty: { health: [3, 10], chance: 0.2 },
    category: 'risk',
    emoji: '💋',
    difficulty: 2,
    description: "Usa /prostituir o comando similar"
  },
  
  // ========== HABILIDADES ESPECIALES ==========
  { 
    id: 'chop', 
    name: '🪓 Talar árboles', 
    target: [10, 25], 
    rewardCoins: [12000, 30000], 
    rewardHearts: [12, 25],
    rewardItems: [
      { id: 'wood', chance: 0.6, amount: [4, 10] },
      { id: 'oak_wood', chance: 0.2, amount: [1, 3] }
    ],
    category: 'skill',
    emoji: '🪓',
    difficulty: 2,
    description: "Tala árboles con /talar"
  },
  { 
    id: 'craft', 
    name: '🔨 Crear objetos', 
    target: [3, 10], 
    rewardCoins: [15000, 40000], 
    rewardHearts: [20, 40],
    requirement: { items: ['wood', 'iron'] },
    category: 'skill',
    emoji: '🔨',
    difficulty: 3,
    description: "Crea objetos con /crear o /craft"
  },
  { 
    id: 'plant', 
    name: '🌱 Plantar árboles', 
    target: [2, 6], 
    rewardCoins: [8000, 20000], 
    rewardHearts: [15, 30],
    requirement: { items: ['seed'] },
    category: 'skill',
    emoji: '🌱',
    difficulty: 1,
    description: "Planta árboles con /plantar"
  },
  
  // ========== JUEGOS DE AZAR ==========
  { 
    id: 'rt', 
    name: '🎰 Ganar en ruleta', 
    target: [3, 8], 
    rewardCoins: [5000, 12000], 
    rewardHearts: [10, 20],
    category: 'gambling',
    emoji: '🎰',
    difficulty: 3,
    description: "Gana en la ruleta con /ruleta"
  },
  { 
    id: 'slot', 
    name: '💰 Ganar en tragamonedas', 
    target: [5, 12], 
    rewardCoins: [3000, 10000], 
    rewardHearts: [8, 18],
    category: 'gambling',
    emoji: '💰',
    difficulty: 3,
    description: "Juega a las tragamonedas con /slot"
  },
  { 
    id: 'dice', 
    name: '🎲 Ganar en dados', 
    target: [7, 15], 
    rewardCoins: [4000, 11000], 
    rewardHearts: [9, 19],
    category: 'gambling',
    emoji: '🎲',
    difficulty: 2,
    description: "Gana juegos de dados con /dado"
  },
  
  // ========== SOCIALES ==========
  { 
    id: 'heal', 
    name: '❤️‍🩹 Curar jugadores', 
    target: [3, 10], 
    rewardCoins: [6000, 18000], 
    rewardHearts: [25, 50],
    category: 'social',
    emoji: '❤️‍🩹',
    difficulty: 1,
    description: "Cura a otros con /curar"
  },
  { 
    id: 'gift', 
    name: '🎁 Enviar regalos', 
    target: [2, 6], 
    rewardCoins: [4000, 12000], 
    rewardHearts: [15, 30],
    category: 'social',
    emoji: '🎁',
    difficulty: 1,
    description: "Envía regalos con /regalar"
  },
  { 
    id: 'trade', 
    name: '🤝 Comerciar items', 
    target: [1, 4], 
    rewardCoins: [10000, 30000], 
    rewardHearts: [10, 25],
    category: 'social',
    emoji: '🤝',
    difficulty: 2,
    description: "Haz intercambios con /comerciar"
  },
  
  // ========== COMPRAS Y VENTAS ==========
  { 
    id: 'buy', 
    name: '🛒 Comprar items', 
    target: [3, 10], 
    rewardCoins: [5000, 15000], 
    rewardHearts: [8, 20],
    category: 'shop',
    emoji: '🛒',
    difficulty: 1,
    description: "Compra items en la tienda con /comprar"
  },
  { 
    id: 'sell', 
    name: '💰 Vender items', 
    target: [5, 15], 
    rewardCoins: [7000, 20000], 
    rewardHearts: [10, 25],
    category: 'shop',
    emoji: '💰',
    difficulty: 1,
    description: "Vende items con /vender"
  },
  
  // ========== ESPECIALES DIARIOS ==========
  { 
    id: 'login', 
    name: '📅 Iniciar sesión', 
    target: [1, 1], 
    rewardCoins: [1000, 5000], 
    rewardHearts: [5, 15],
    category: 'daily',
    emoji: '📅',
    difficulty: 0,
    description: "Solo tienes que iniciar sesión"
  },
  { 
    id: 'streak', 
    name: '🔥 Mantener racha', 
    target: [1, 1], 
    rewardCoins: [5000, 20000], 
    rewardHearts: [20, 50],
    requirement: { streak: 3 },
    category: 'daily',
    emoji: '🔥',
    difficulty: 1,
    description: "Mantén tu racha de días consecutivos"
  },
  
  // ========== MISIONES SEMANALES ESPECIALES ==========
  { 
    id: 'weekly_boss', 
    name: '👾 Derrotar jefe semanal', 
    target: [1, 1], 
    rewardCoins: [50000, 150000], 
    rewardHearts: [100, 200],
    rewardItems: [{ id: 'boss_token', chance: 1, amount: 1 }],
    category: 'weekly',
    emoji: '👾',
    difficulty: 5,
    day: 'sunday',
    description: "Derrota al jefe semanal"
  },
  { 
    id: 'weekly_collect', 
    name: '📦 Recolectar recursos', 
    target: [20, 50], 
    rewardCoins: [30000, 80000], 
    rewardHearts: [60, 120],
    category: 'weekly',
    emoji: '📦',
    difficulty: 4,
    day: 'wednesday',
    description: "Recolecta muchos recursos esta semana"
  }
]

// Categorías simplificadas
const MISSION_CATEGORIES = {
  economy: { name: '💵 Económicas', color: '#2ECC71' },
  risk: { name: '⚠️ De Riesgo', color: '#E74C3C' },
  skill: { name: '🛠️ De Habilidad', color: '#3498DB' },
  gambling: { name: '🎰 De Azar', color: '#9B59B6' },
  social: { name: '👥 Sociales', color: '#1ABC9C' },
  shop: { name: '🛒 Compras', color: '#F1C40F' },
  daily: { name: '📅 Diarias', color: '#95A5A6' },
  weekly: { name: '📆 Semanales', color: '#8E44AD' }
}

// Recompensas por completar todas las misiones
const CHEST_REWARDS = {
  basic: { 
    coins: 50000, 
    hearts: 100, 
    items: [
      { id: 'chest_key', amount: 1, name: '🔑 Llave del cofre' },
      { id: 'random_box', amount: 1, name: '🎁 Caja misteriosa' }
    ] 
  },
  streak: [
    { days: 3, coins: 75000, hearts: 150 },
    { days: 7, coins: 150000, hearts: 300, items: [{ id: 'legendary_key', amount: 1, name: '✨ Llave legendaria' }] },
    { days: 30, coins: 500000, hearts: 1000, items: [{ id: 'mythical_chest', amount: 1, name: '🏆 Cofre mítico' }] }
  ]
}

// ==============================
// FUNCIONES DE AYUDA
// ==============================
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getDayOfWeek() {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[new Date().getDay()]
}

function getRandomItems(rewardItems) {
  if (!rewardItems) return []
  
  const obtained = []
  rewardItems.forEach(item => {
    if (Math.random() < item.chance) {
      obtained.push({
        id: item.id,
        amount: Array.isArray(item.amount) 
          ? randomBetween(item.amount[0], item.amount[1])
          : item.amount,
        name: item.name || item.id
      })
    }
  })
  
  return obtained
}

function checkItems(user, requiredItems) {
  if (!user.inventory || !user.inventory.items) return false
  
  return requiredItems.every(itemId => {
    return (user.inventory.items[itemId] || 0) > 0
  })
}

// ==============================
// DESCRIPCIONES DE MISIONES
// ==============================
function getMissionDescription(missionId, target) {
  const descriptions = {
    'mine': `Minar ${target} veces recursos`,
    'work': `Trabajar ${target} veces`,
    'fish': `Pescar ${target} peces`,
    'crime': `Cometer ${target} crímenes`,
    'hunt': `Cazar ${target} animales`,
    'prosti': `Prostituirse ${target} veces`,
    'chop': `Talar ${target} árboles`,
    'craft': `Crear ${target} objetos`,
    'plant': `Plantar ${target} árboles`,
    'rt': `Ganar ${target} veces en la ruleta`,
    'slot': `Ganar ${target} veces en tragamonedas`,
    'dice': `Ganar ${target} juegos de dados`,
    'heal': `Curar ${target} jugadores`,
    'gift': `Enviar ${target} regalos`,
    'trade': `Hacer ${target} intercambios`,
    'buy': `Comprar ${target} items`,
    'sell': `Vender ${target} items`,
    'login': `Iniciar sesión hoy`,
    'streak': `Mantener racha de 3+ días`,
    'weekly_boss': `Derrotar al jefe semanal`,
    'weekly_collect': `Recolectar ${target} recursos`
  }
  
  return descriptions[missionId] || `Completar ${target} veces`
}

// ==============================
// INICIAR MISIONES DIARIAS
// ==============================
export function initDailyMissions(user) {
  if (!user.dailyMissions) {
    user.dailyMissions = {
      date: '',
      list: [],
      chestUnlocked: false,
      chestClaimed: false,
      streak: 0,
      totalCompleted: 0,
      weeklyCompleted: 0,
      stats: {}
    }
  }
  
  const today = new Date().toDateString()
  const todayWeekday = getDayOfWeek()
  
  // Si ya se inicializaron hoy, no hacer nada
  if (user.dailyMissions.date === today) {
    return
  }
  
  // Verificar y actualizar racha
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  if (user.dailyMissions.date === yesterday) {
    user.dailyMissions.streak = (user.dailyMissions.streak || 0) + 1
  } else if (user.dailyMissions.date !== today) {
    user.dailyMissions.streak = 1
  }
  
  // Filtrar misiones disponibles hoy
  const availableMissions = ALL_MISSIONS.filter(mission => {
    // Excluir misiones semanales que no corresponden al día
    if (mission.category === 'weekly' && mission.day !== todayWeekday) {
      return false
    }
    
    // Verificar requisitos especiales
    if (mission.id === 'streak' && user.dailyMissions.streak < 3) {
      return false
    }
    
    return true
  })
  
  // Seleccionar 6 misiones diarias balanceadas
  let selectedMissions = []
  
  // Siempre incluir misión de login
  const loginMission = availableMissions.find(m => m.id === 'login')
  if (loginMission) {
    selectedMissions.push(loginMission)
  }
  
  // Seleccionar misiones de diferentes categorías
  const categories = ['economy', 'risk', 'skill', 'gambling', 'social', 'shop']
  let attempts = 0
  
  while (selectedMissions.length < 6 && attempts < 20) {
    attempts++
    
    // Priorizar categorías que no están representadas
    const currentCategories = selectedMissions.map(m => m.category)
    const missingCategories = categories.filter(cat => !currentCategories.includes(cat))
    
    let candidates = []
    
    if (missingCategories.length > 0) {
      // Buscar misiones de categorías faltantes
      candidates = availableMissions.filter(m => 
        missingCategories.includes(m.category) && 
        !selectedMissions.find(sm => sm.id === m.id)
      )
    }
    
    if (candidates.length === 0) {
      // Si no hay de categorías faltantes, tomar cualquier otra
      candidates = availableMissions.filter(m => 
        !selectedMissions.find(sm => sm.id === m.id)
      )
    }
    
    if (candidates.length > 0) {
      const randomMission = candidates[Math.floor(Math.random() * candidates.length)]
      selectedMissions.push(randomMission)
    } else {
      break // No hay más misiones disponibles
    }
  }
  
  // Agregar misiones semanales del día actual
  const weeklyMissions = availableMissions.filter(m => 
    m.category === 'weekly' && 
    m.day === todayWeekday
  )
  
  weeklyMissions.forEach(mission => {
    if (!selectedMissions.find(m => m.id === mission.id)) {
      selectedMissions.push(mission)
    }
  })
  
  // Crear misiones del usuario con valores aleatorios
  user.dailyMissions = {
    date: today,
    list: selectedMissions.map(mission => {
      const target = randomBetween(mission.target[0], mission.target[1])
      
      // Ajustar recompensas basado en dificultad y racha
      const streakBonus = 1 + (user.dailyMissions.streak * 0.05)
      const difficultyMultiplier = 1 + (mission.difficulty * 0.2)
      
      const baseCoins = randomBetween(mission.rewardCoins[0], mission.rewardCoins[1])
      const baseHearts = randomBetween(mission.rewardHearts[0], mission.rewardHearts[1])
      
      return {
        id: mission.id,
        name: mission.name,
        target: target,
        progress: mission.id === 'login' ? 1 : 0, // Login automáticamente completado
        claimed: false,
        rewardCoins: Math.floor(baseCoins * streakBonus * difficultyMultiplier),
        rewardHearts: Math.floor(baseHearts * streakBonus * difficultyMultiplier),
        rewardItems: mission.rewardItems || [],
        penalty: mission.penalty || null,
        requirement: mission.requirement || null,
        category: mission.category,
        emoji: mission.emoji,
        difficulty: mission.difficulty,
        description: mission.description || getMissionDescription(mission.id, target),
        completed: mission.id === 'login' // Login ya está completado
      }
    }),
    chestUnlocked: false,
    chestClaimed: false,
    streak: user.dailyMissions.streak || 1,
    totalCompleted: user.dailyMissions.totalCompleted || 0,
    weeklyCompleted: user.dailyMissions.weeklyCompleted || 0,
    stats: user.dailyMissions.stats || {
      missionsCompleted: 0,
      coinsEarned: 0,
      heartsEarned: 0,
      chestsOpened: 0,
      totalMissions: 0
    }
  }
}

// ==============================
// AGREGAR PROGRESO A MISIÓN
// ==============================
export function addMissionProgress(user, missionId, amount = 1, extraData = {}) {
  if (!user.dailyMissions?.list) {
    initDailyMissions(user)
    return { success: false, message: 'Misiones no inicializadas' }
  }
  
  const mission = user.dailyMissions.list.find(m => m.id === missionId)
  if (!mission) {
    return { success: false, message: 'Misión no encontrada' }
  }
  
  if (mission.claimed) {
    return { success: false, message: 'Misión ya reclamada' }
  }
  
  // Verificar requisitos si los hay
  if (mission.requirement) {
    if (mission.requirement.items && !checkItems(user, mission.requirement.items)) {
      return { success: false, message: 'No tienes los items requeridos' }
    }
    if (mission.requirement.streak && user.dailyMissions.streak < mission.requirement.streak) {
      return { success: false, message: 'Necesitas más días de racha' }
    }
  }
  
  const oldProgress = mission.progress
  mission.progress += amount
  
  // Asegurar que no exceda el target
  if (mission.progress > mission.target) {
    mission.progress = mission.target
  }
  
  const completed = mission.progress >= mission.target
  const wasJustCompleted = completed && oldProgress < mission.target
  
  // Actualizar estadísticas
  if (wasJustCompleted) {
    user.dailyMissions.stats.missionsCompleted = (user.dailyMissions.stats.missionsCompleted || 0) + 1
  }
  
  // Verificar si todas las misiones están completas para desbloquear cofre
  if (completed) {
    const allCompleted = user.dailyMissions.list.every(m => m.progress >= m.target)
    if (allCompleted && !user.dailyMissions.chestUnlocked) {
      user.dailyMissions.chestUnlocked = true
    }
  }
  
  return { 
    success: true, 
    progress: mission.progress,
    target: mission.target,
    completed,
    wasJustCompleted,
    missionName: mission.name,
    missionEmoji: mission.emoji,
    rewardCoins: mission.rewardCoins,
    rewardHearts: mission.rewardHearts,
    description: mission.description
  }
}

// ==============================
// RECLAMAR RECOMPENSA DE MISIÓN
// ==============================
export function claimMission(user, missionId) {
  initDailyMissions(user)
  
  const mission = user.dailyMissions.list.find(m => m.id === missionId)
  if (!mission) {
    return { 
      ok: false, 
      msg: '❌ Misión no encontrada',
      type: 'error'
    }
  }
  
  if (mission.progress < mission.target) {
    const remaining = mission.target - mission.progress
    return { 
      ok: false, 
      msg: `⚠️ Te faltan ${remaining} para completar: "${mission.name}"`,
      type: 'incomplete',
      remaining: remaining
    }
  }
  
  if (mission.claimed) {
    return { 
      ok: false, 
      msg: '⚠️ Ya reclamaste esta misión',
      type: 'claimed'
    }
  }
  
  // Aplicar penalidad si existe (solo para misiones de riesgo)
  let healthLost = 0
  if (mission.penalty && Math.random() < mission.penalty.chance) {
    healthLost = randomBetween(mission.penalty.health[0], mission.penalty.health[1])
    user.health = Math.max(0, (user.health || 100) - healthLost)
  }
  
  // Dar recompensas
  mission.claimed = true
  user.money = (user.money || 0) + mission.rewardCoins
  user.hearts = (user.hearts || 0) + mission.rewardHearts
  
  // Dar items aleatorios si los hay
  const obtainedItems = getRandomItems(mission.rewardItems)
  obtainedItems.forEach(item => {
    if (!user.inventory) user.inventory = { items: {} }
    if (!user.inventory.items) user.inventory.items = {}
    user.inventory.items[item.id] = (user.inventory.items[item.id] || 0) + item.amount
  })
  
  // Actualizar estadísticas
  user.dailyMissions.totalCompleted = (user.dailyMissions.totalCompleted || 0) + 1
  user.dailyMissions.stats.coinsEarned = (user.dailyMissions.stats.coinsEarned || 0) + mission.rewardCoins
  user.dailyMissions.stats.heartsEarned = (user.dailyMissions.stats.heartsEarned || 0) + mission.rewardHearts
  
  if (mission.category === 'weekly') {
    user.dailyMissions.weeklyCompleted = (user.dailyMissions.weeklyCompleted || 0) + 1
  }
  
  // Verificar si todas están reclamadas
  const allClaimed = user.dailyMissions.list.every(m => m.claimed)
  if (allClaimed && !user.dailyMissions.chestUnlocked) {
    user.dailyMissions.chestUnlocked = true
  }
  
  return {
    ok: true,
    coins: mission.rewardCoins,
    hearts: mission.rewardHearts,
    items: obtainedItems,
    name: mission.name,
    emoji: mission.emoji,
    allClaimed: allClaimed,
    chestUnlocked: user.dailyMissions.chestUnlocked,
    streak: user.dailyMissions.streak,
    penalty: healthLost > 0,
    healthLost: healthLost,
    category: mission.category
  }
}

// ==============================
// RECLAMAR COFRE ESPECIAL
// ==============================
export function claimChest(user) {
  if (!user.dailyMissions.chestUnlocked) {
    return { 
      ok: false, 
      msg: '❌ Aún no has desbloqueado el cofre especial.\n¡Completa todas tus misiones diarias primero!',
      type: 'locked'
    }
  }
  
  if (user.dailyMissions.chestClaimed) {
    return { 
      ok: false, 
      msg: '⚠️ Ya reclamaste el cofre de hoy',
      type: 'claimed'
    }
  }
  
  // Calcular recompensa basada en racha
  const streak = user.dailyMissions.streak || 1
  let chestReward = { ...CHEST_REWARDS.basic }
  
  // Verificar recompensas por racha
  CHEST_REWARDS.streak.forEach(reward => {
    if (streak >= reward.days) {
      chestReward.coins = reward.coins
      chestReward.hearts = reward.hearts
      if (reward.items) {
        chestReward.items = [...(chestReward.items || []), ...reward.items]
      }
    }
  })
  
  // Bonus por misiones semanales completadas
  const weeklyBonus = user.dailyMissions.weeklyCompleted * 0.1
  const coins = Math.floor(chestReward.coins * (1 + weeklyBonus))
  const hearts = Math.floor(chestReward.hearts * (1 + weeklyBonus))
  
  // Dar recompensas
  user.money = (user.money || 0) + coins
  user.hearts = (user.hearts || 0) + hearts
  
  // Agregar items al inventario
  const items = chestReward.items || []
  items.forEach(item => {
    if (!user.inventory) user.inventory = { items: {} }
    if (!user.inventory.items) user.inventory.items = {}
    user.inventory.items[item.id] = (user.inventory.items[item.id] || 0) + item.amount
  })
  
  // Dar item especial por completar cofre
  const specialItem = {
    id: `daily_chest_${new Date().toISOString().split('T')[0].replace(/-/g, '')}`,
    amount: 1,
    name: '🏆 Trofeo del día'
  }
  
  if (!user.inventory.special) user.inventory.special = []
  user.inventory.special.push(specialItem)
  
  // Actualizar estadísticas
  user.dailyMissions.chestClaimed = true
  user.dailyMissions.stats.chestsOpened = (user.dailyMissions.stats.chestsOpened || 0) + 1
  user.dailyMissions.stats.coinsEarned = (user.dailyMissions.stats.coinsEarned || 0) + coins
  user.dailyMissions.stats.heartsEarned = (user.dailyMissions.stats.heartsEarned || 0) + hearts
  
  // Reiniciar misiones semanales si es domingo
  if (getDayOfWeek() === 'sunday') {
    user.dailyMissions.weeklyCompleted = 0
  }
  
  return {
    ok: true,
    coins,
    hearts,
    items,
    specialItem,
    streak,
    weeklyBonus: user.dailyMissions.weeklyCompleted,
    chestType: streak >= 7 ? 'legendario' : streak >= 3 ? 'especial' : 'normal'
  }
}

// ==============================
// ESTADÍSTICAS DEL JUGADOR
// ==============================
export function getMissionStats(user) {
  initDailyMissions(user)
  
  const totalMissions = user.dailyMissions.list.length
  const completedMissions = user.dailyMissions.list.filter(m => m.progress >= m.target).length
  const claimedMissions = user.dailyMissions.list.filter(m => m.claimed).length
  
  // Estadísticas por categoría
  const categoryStats = {}
  user.dailyMissions.list.forEach(mission => {
    if (!categoryStats[mission.category]) {
      categoryStats[mission.category] = {
        total: 0,
        completed: 0,
        claimed: 0
      }
    }
    
    categoryStats[mission.category].total++
    if (mission.progress >= mission.target) {
      categoryStats[mission.category].completed++
    }
    if (mission.claimed) {
      categoryStats[mission.category].claimed++
    }
  })
  
  return {
    total: totalMissions,
    completed: completedMissions,
    claimed: claimedMissions,
    progressPercentage: totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0,
    streak: user.dailyMissions.streak || 0,
    totalCompleted: user.dailyMissions.totalCompleted || 0,
    weeklyCompleted: user.dailyMissions.weeklyCompleted || 0,
    chestUnlocked: user.dailyMissions.chestUnlocked,
    chestClaimed: user.dailyMissions.chestClaimed,
    categoryStats,
    stats: user.dailyMissions.stats || {
      missionsCompleted: 0,
      coinsEarned: 0,
      heartsEarned: 0,
      chestsOpened: 0
    }
  }
}

// ==============================
// OBTENER RECOMPENSAS POR RACHA
// ==============================
export function getStreakRewards(streak) {
  const rewards = []
  const currentStreak = streak || 1
  
  CHEST_REWARDS.streak.forEach(reward => {
    rewards.push({
      days: reward.days,
      achieved: currentStreak >= reward.days,
      coins: reward.coins,
      hearts: reward.hearts,
      items: reward.items || []
    })
  })
  
  return rewards
}

// ==============================
// OBTENER MISIONES POR CATEGORÍA
// ==============================
export function getMissionsByCategory(user, category) {
  initDailyMissions(user)
  
  return user.dailyMissions.list.filter(mission => mission.category === category)
}

// ==============================
// REINICIAR MISIONES (SOLO PARA ADMIN)
// ==============================
export function resetUserMissions(user) {
  user.dailyMissions = {
    date: '',
    list: [],
    chestUnlocked: false,
    chestClaimed: false,
    streak: 0,
    totalCompleted: 0,
    weeklyCompleted: 0,
    stats: {}
  }
  
  initDailyMissions(user)
  return { ok: true, msg: '✅ Misiones reiniciadas exitosamente' }
}

// ==============================
// OBTENER RESUMEN DIARIO
// ==============================
export function getDailySummary(user) {
  const stats = getMissionStats(user)
  
  return {
    date: user.dailyMissions.date,
    totalMissions: stats.total,
    completed: stats.completed,
    claimed: stats.claimed,
    streak: stats.streak,
    chest: {
      unlocked: stats.chestUnlocked,
      claimed: stats.chestClaimed
    },
    rewardsToday: stats.stats.coinsEarned || 0,
    nextReset: new Date(new Date().setHours(24, 0, 0, 0)).toLocaleTimeString()
  }
}

// ==============================
// VERIFICAR RECOMPENSAS PENDIENTES
// ==============================
export function getPendingRewards(user) {
  initDailyMissions(user)
  
  const pendingMissions = user.dailyMissions.list.filter(m => 
    m.progress >= m.target && !m.claimed
  )
  
  const totalCoins = pendingMissions.reduce((sum, m) => sum + m.rewardCoins, 0)
  const totalHearts = pendingMissions.reduce((sum, m) => sum + m.rewardHearts, 0)
  
  return {
    pending: pendingMissions.length,
    totalCoins,
    totalHearts,
    missions: pendingMissions.map(m => ({
      id: m.id,
      name: m.name,
      coins: m.rewardCoins,
      hearts: m.rewardHearts,
      emoji: m.emoji
    })),
    hasChest: user.dailyMissions.chestUnlocked && !user.dailyMissions.chestClaimed
  }
}

// ==============================
// AYUDA PARA MISIONES
// ==============================
export function getMissionHelp(missionId) {
  const mission = ALL_MISSIONS.find(m => m.id === missionId)
  
  if (!mission) {
    return {
      exists: false,
      message: 'Misión no encontrada'
    }
  }
  
  return {
    exists: true,
    id: mission.id,
    name: mission.name,
    description: mission.description,
    category: mission.category,
    difficulty: mission.difficulty,
    commonTarget: `Normalmente necesitas completar entre ${mission.target[0]} y ${mission.target[1]} veces`,
    tips: getMissionTips(missionId)
  }
}

function getMissionTips(missionId) {
  const tips = {
    'mine': [
      'Usa picos de mejor calidad para obtener más recursos',
      'Repara tu pico regularmente para mantener su eficiencia',
      'Los picos legendarios duplican los materiales encontrados'
    ],
    'work': [
      'Tu nivel de trabajo aumenta tus ganancias',
      'Trabaja regularmente para subir de nivel más rápido',
      'A veces encuentras contratos especiales'
    ],
    'hunt': [
      'Usa armas apropiadas para cada tipo de animal',
      'Animales más grandes dan mejor botín pero son más difíciles',
      'Repara tus armas después de cada cacería'
    ],
    'chop': [
      'Las hachas de diamante cortan árboles más rápido',
      'Árboles especiales dan madera de mejor calidad',
      'Planta árboles para tener fuente constante de madera'
    ],
    'craft': [
      'Guarda materiales para crear objetos valiosos',
      'Algunas recetas requieren items especiales',
      'Los objetos creados se pueden vender por buen precio'
    ]
  }
  
  return tips[missionId] || ['Completa la misión usando el comando correspondiente']
}

// Exportar todas las funciones
export default {
  initDailyMissions,
  addMissionProgress,
  claimMission,
  claimChest,
  getMissionStats,
  getStreakRewards,
  getMissionsByCategory,
  resetUserMissions,
  getDailySummary,
  getPendingRewards,
  getMissionHelp,
  ALL_MISSIONS,
  MISSION_CATEGORIES,
  CHEST_REWARDS
}