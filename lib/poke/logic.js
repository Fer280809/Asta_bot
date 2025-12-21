import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// --- CARGA DE DATOS SEURA ---
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf-8'))

export const pokedex = readJson('pokedex.json')
export const moves = readJson('moves.json')
export const mapa = readJson('mapa.json')

// --- TABLA DE TIPOS (MATRIZ DE EFECTIVIDAD) ---
const typeTable = {
    "Normal": { "Roca": 0.5, "Fantasma": 0, "Acero": 0.5 },
    "Fuego": { "Fuego": 0.5, "Agua": 0.5, "Planta": 2, "Hielo": 2, "Bicho": 2, "Roca": 0.5, "Dragón": 0.5, "Acero": 2 },
    "Agua": { "Fuego": 2, "Agua": 0.5, "Planta": 0.5, "Tierra": 2, "Roca": 2, "Dragón": 0.5 },
    "Planta": { "Fuego": 0.5, "Agua": 2, "Planta": 0.5, "Veneno": 0.5, "Tierra": 2, "Volador": 0.5, "Bicho": 0.5, "Roca": 2, "Dragón": 0.5, "Acero": 0.5 },
    "Eléctrico": { "Agua": 2, "Planta": 0.5, "Eléctrico": 0.5, "Tierra": 0, "Volador": 2, "Dragón": 0.5 },
    "Hielo": { "Fuego": 0.5, "Agua": 0.5, "Planta": 2, "Hielo": 0.5, "Tierra": 2, "Volador": 2, "Dragón": 2, "Acero": 0.5 },
    "Lucha": { "Normal": 2, "Hielo": 2, "Veneno": 0.5, "Volador": 0.5, "Psíquico": 0.5, "Bicho": 0.5, "Roca": 2, "Fantasma": 0, "Siniestro": 2, "Acero": 2 },
    "Veneno": { "Planta": 2, "Veneno": 0.5, "Tierra": 0.5, "Roca": 0.5, "Fantasma": 0.5, "Acero": 0, "Hada": 2 },
    "Tierra": { "Fuego": 2, "Eléctrico": 2, "Planta": 0.5, "Veneno": 2, "Volador": 0, "Bicho": 0.5, "Roca": 2, "Acero": 2 },
    "Volador": { "Planta": 2, "Eléctrico": 0.5, "Lucha": 2, "Bicho": 2, "Roca": 0.5, "Acero": 0.5 },
    "Psíquico": { "Lucha": 2, "Veneno": 2, "Psíquico": 0.5, "Siniestro": 0, "Acero": 0.5 },
    "Bicho": { "Fuego": 0.5, "Planta": 2, "Lucha": 0.5, "Veneno": 0.5, "Volador": 0.5, "Psíquico": 2, "Fantasma": 0.5, "Siniestro": 2, "Acero": 0.5 },
    "Roca": { "Fuego": 2, "Hielo": 2, "Lucha": 0.5, "Tierra": 0.5, "Volador": 2, "Bicho": 2, "Acero": 0.5 },
    "Fantasma": { "Normal": 0, "Psíquico": 2, "Fantasma": 2, "Siniestro": 0.5 },
    "Dragón": { "Dragón": 2, "Acero": 0.5 },
    "Siniestro": { "Lucha": 0.5, "Psíquico": 2, "Fantasma": 2, "Siniestro": 0.5 },
    "Acero": { "Fuego": 0.5, "Agua": 0.5, "Eléctrico": 0.5, "Hielo": 2, "Roca": 2, "Acero": 0.5 }
}

export const PokemonLogic = {
    // Obtener datos básicos
    getPokemon: (id) => pokedex[id] || null,
    getMove: (name) => moves[name] || null,
    getMap: (locName) => mapa[locName] || null,

    // Lógica de daño
    calculateDamage: (attacker, defender, moveName) => {
        const move = moves[moveName]
        if (!move) return { damage: 0, effectiveness: 1, message: "Ataque fallido" }
        
        // 1. Calcular Efectividad de Tipos
        let mult = 1
        defender.tipos.forEach(defType => {
            if (typeTable[move.tipo] && typeTable[move.tipo][defType] !== undefined) {
                mult *= typeTable[move.tipo][defType]
            }
        })

        // 2. Bonus STAB (Si el atacante es del mismo tipo que el movimiento)
        const stab = attacker.tipos.includes(move.tipo) ? 1.5 : 1

        // 3. Fórmula de Daño Base
        const level = attacker.nivel || 5
        const atkPower = attacker.stats.ataque
        const defPower = defender.stats.defensa
        
        let damage = ((((2 * level / 5 + 2) * move.poder * (atkPower / defPower)) / 50) + 2)
        
        // 4. Aplicar multiplicadores y variación aleatoria (85% a 100%)
        const random = (Math.floor(Math.random() * (100 - 85 + 1)) + 85) / 100
        const finalDamage = Math.floor(damage * stab * mult * random)

        let msg = mult > 1 ? "¡Es súper efectivo!" : (mult < 1 && mult > 0 ? "No es muy efectivo..." : (mult === 0 ? "No afecta al rival..." : ""))

        return {
            damage: finalDamage,
            effectiveness: mult,
            message: msg
        }
    },

    // Lógica de Experiencia y Nivel
    getExpRequired: (level) => Math.pow(level, 3), // Curva media

    checkLevelUp: (pokemon) => {
        const req = PokemonLogic.getExpRequired(pokemon.nivel + 1)
        if (pokemon.exp >= req) {
            pokemon.nivel += 1
            // Subir stats base proporcionalmente
            pokemon.hpMax += 3
            pokemon.hp = pokemon.hpMax
            pokemon.stats.ataque += 2
            pokemon.stats.defensa += 2
            return true
        }
        return false
    },

    // Lógica de Captura
    isCaught: (rate, hpPercent, ballMultiplier = 1) => {
        // Fórmula simplificada: Mientras menos HP, más fácil capturar
        const chance = (rate * ballMultiplier * (1 - (hpPercent / 200))) / 255
        return Math.random() < chance
    }
}
