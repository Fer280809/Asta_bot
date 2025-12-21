import fs from 'fs'

export const PokemonLogic = {
    // 1. SISTEMA DE EMOCIONES (Afecta stats y entrenamiento)
    emociones: {
        "Alegría": { exp: 1.2, atk: 1.0, def: 1.0, msg: "😊 ¡Está rebosante de alegría! Gana más experiencia." },
        "Enojo": { exp: 1.0, atk: 1.15, def: 0.9, msg: "💢 Parece estar enfadado. Su ataque sube pero baja su defensa." },
        "Calma": { exp: 1.0, atk: 1.0, def: 1.1, msg: "😌 Se siente tranquilo. Su defensa ha mejorado." },
        "Tristeza": { exp: 0.8, atk: 0.9, def: 0.9, msg: "💧 Se ve un poco triste... Necesita atención." }
    },

    // Asigna una emoción aleatoria al capturar
    getRandomEmocion: () => {
        const emos = ["Alegría", "Enojo", "Calma", "Tristeza"]
        return emos[Math.floor(Math.random() * emos.length)]
    },

    // 2. SISTEMA DE EXPERIENCIA (Curva parabólica)
    // Calcula cuánta EXP necesita un nivel específico
    getExpRequired: (nivel) => {
        if (nivel >= 100) return Infinity
        return Math.floor(5 * Math.pow(nivel, 3) / 4)
    },

    // Calcula la EXP ganada en batalla
    calculateExpGanada: (nivelRival, esLider = false, emocion = "Calma") => {
        let base = esLider ? 100 : 25
        let bonusEmo = PokemonLogic.emociones[emocion]?.exp || 1.0
        return Math.floor(base * nivelRival * bonusEmo)
    },

    // 3. LÓGICA DE EVOLUCIÓN
    checkEvolution: (pokemon, pokedex) => {
        const infoBase = pokedex[pokemon.id]
        if (!infoBase || !infoBase.evolucion) return null

        // Evolución por nivel
        if (infoBase.evolucion.nivel && pokemon.nivel >= infoBase.evolucion.nivel) {
            const evoId = infoBase.evolucion.id
            const evoData = pokedex[evoId]
            
            return {
                nuevoId: evoId,
                nuevoNombre: evoData.nombre,
                nuevosTipos: evoData.tipos,
                nuevaImagen: evoData.imagen
            }
        }
        return null
    },

    // 4. ECONOMÍA (Dinero por batalla)
    calculatePrize: (nivelRival, esLider = false) => {
        let base = esLider ? 500 : 20
        let randomFactor = 0.8 + Math.random() * 0.4
        return Math.floor(base * nivelRival * randomFactor)
    },

    // 5. CÁLCULO DE STATS SEGÚN NIVEL
    // Escala los stats base al nivel actual del Pokémon
    calculateStats: (baseStats, nivel) => {
        return {
            hp: Math.floor((2 * baseStats.hp * nivel) / 100 + nivel + 10),
            ataque: Math.floor((2 * baseStats.ataque * nivel) / 100 + 5),
            defensa: Math.floor((2 * baseStats.defensa * nivel) / 100 + 5),
            velocidad: Math.floor((2 * baseStats.velocidad * nivel) / 100 + 5)
        }
    }
}
