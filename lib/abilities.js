// lib/abilities.js
export const AbilitiesSystem = {
    abilities: {
        // --- HABILIDADES ORIGINALES (MANTENIDAS) ---
        'intimidacion': {
            nombre: 'Intimidación',
            descripcion: 'Baja el Ataque del rival al entrar en combate',
            efecto: (user, target) => {
                if (target.stats) target.stats.ataque = Math.floor(target.stats.ataque * 0.9);
                return '¡El Ataque del rival bajó!';
            }
        },
        'cuerpo_llama': {
            nombre: 'Cuerpo Llama',
            descripcion: 'Puede quemar al rival al hacer contacto',
            efecto: (user, target, move) => {
                if (move.contacto && Math.random() < 0.3) {
                    target.status = 'quemado';
                    return '¡El rival se quemó!';
                }
                return null;
            }
        },
        'absorbe_agua': {
            nombre: 'Absorbe Agua',
            descripcion: 'Cura PS con movimientos de tipo Agua',
            efecto: (user, move) => {
                if (move.tipo === 'Agua') {
                    const heal = Math.floor(user.hpMax * 0.25);
                    user.hp = Math.min(user.hpMax, user.hp + heal);
                    return `Absorbió agua y recuperó ${heal} PS!`;
                }
                return null;
            }
        },
        'electricidad_estatica': {
            nombre: 'Electricidad Estática',
            descripcion: 'Puede paralizar al rival al hacer contacto',
            efecto: (user, target, move) => {
                if (move.contacto && Math.random() < 0.3) {
                    target.status = 'paralizado';
                    return '¡El rival fue paralizado!';
                }
                return null;
            }
        },
        'presion': {
            nombre: 'Presión',
            descripcion: 'El rival gasta 2 PP por movimiento',
            efecto: (target, move) => {
                if (move.pp) move.pp = Math.max(0, move.pp - 1);
                return '¡Presión del legendario!';
            }
        },
        'cura_natural': {
            nombre: 'Cura Natural',
            descripcion: 'Cura problemas de estado al cambiar de Pokémon',
            efecto: (user) => {
                if (user.status) {
                    const oldStatus = user.status;
                    user.status = null;
                    return `Cura Natural curó ${oldStatus}!`;
                }
                return null;
            }
        },

        // --- BLOQUE DE NUEVAS HABILIDADES (DETECTADAS EN POKEDEX) ---

        'escudo_supremo': {
            nombre: 'Escudo Supremo',
            descripcion: 'Aumenta las defensas de Zamazenta al entrar en combate.',
            efecto: (user) => {
                if (user.stats) {
                    user.stats.defensa = Math.floor(user.stats.defensa * 1.5);
                    user.stats.defensaEspecial = Math.floor(user.stats.defensaEspecial * 1.5);
                }
                return '¡El Escudo Supremo de Zamazenta aumentó sus defensas!';
            }
        },

        'vista_lince': {
            nombre: 'Vista Lince',
            descripcion: 'Evita que baje la precisión (Pidgey y otros).',
            efecto: (user) => '¡Vista Lince mantiene la precisión al máximo!'
        },

        'fuerza_aura': {
            nombre: 'Fuerza Aura',
            descripcion: 'Potencia los movimientos de tipo Lucha (Lucario).',
            efecto: (user, target, move) => {
                if (move && move.tipo === 'Lucha') {
                    move.poder = Math.floor(move.poder * 1.33);
                    return '¡La Fuerza Aura potencia el ataque!';
                }
                return null;
            }
        },

        'rastro': {
            nombre: 'Rastro',
            descripcion: 'Copia la habilidad del Pokémon rival (Gardevoir/Mewtwo).',
            efecto: (user, target) => {
                if (target.habilidad) {
                    user.habilidad = target.habilidad;
                    return `¡Rastro copió la habilidad ${target.habilidad} del rival!`;
                }
                return null;
            }
        },

        'tumbos': {
            nombre: 'Tumbos',
            descripcion: 'Aumenta la evasión si sufre un estado alterado.',
            efecto: (user) => {
                if (user.status) return '¡Tumbos aumenta la velocidad de reacción!';
                return null;
            }
        },

        'cloro_fila': {
            nombre: 'Clorofila',
            descripcion: 'Duplica la velocidad bajo el sol (Venusaur).',
            efecto: (user, weather) => {
                if (weather === 'soleado') {
                    user.stats.velocidad *= 2;
                    return '¡La velocidad de Venusaur se duplicó bajo el sol!';
                }
                return null;
            }
        },

        'torrente': {
            nombre: 'Torrente',
            descripcion: 'Potencia ataques de agua cuando tiene poca vida (Blastoise).',
            efecto: (user, target, move) => {
                if (move.tipo === 'Agua' && user.hp < (user.hpMax / 3)) {
                    move.poder *= 1.5;
                    return '¡Torrente potencia el ataque de agua!';
                }
                return null;
            }
        },

        'mar_llamas': {
            nombre: 'Mar Llamas',
            descripcion: 'Potencia ataques de fuego cuando tiene poca vida (Charizard).',
            efecto: (user, target, move) => {
                if (move.tipo === 'Fuego' && user.hp < (user.hpMax / 3)) {
                    move.poder *= 1.5;
                    return '¡Mar Llamas potencia el ataque de fuego!';
                }
                return null;
            }
        },

        'espejo_magico': {
            nombre: 'Espejo Mágico',
            descripcion: 'Refleja cambios de estado y debuffs al rival.',
            efecto: (user, target, move) => '¡Espejo Mágico refleja los efectos del rival!'
        }
    },

    // --- LÓGICA DE APLICACIÓN MEJORADA ---

    applyAbilityOnEntry(pokemon, opponent) {
        // Normalizamos el nombre para que "Escudo Supremo" funcione como "escudo_supremo"
        const key = pokemon.habilidad?.toLowerCase().replace(/\s+/g, '_');
        const ability = this.abilities[key] || this.abilities[pokemon.habilidad];
        
        if (ability && ability.efecto) {
            return ability.efecto(pokemon, opponent);
        }
        return null;
    },

    applyAbilityOnAttack(attacker, defender, move) {
        const key = attacker.habilidad?.toLowerCase().replace(/\s+/g, '_');
        const ability = this.abilities[key] || this.abilities[attacker.habilidad];

        if (ability && ability.efecto) {
            return ability.efecto(attacker, defender, move);
        }
        return null;
    }
};
