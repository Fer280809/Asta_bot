// lib/abilities.js - ARCHIVO ACTUALIZADO Y COMPLETO
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
                if (move && move.contacto && Math.random() < 0.3) {
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
                if (move && move.tipo === 'Agua') {
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
                if (move && move.contacto && Math.random() < 0.3) {
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
                if (move && move.pp) move.pp = Math.max(0, move.pp - 1);
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
            descripcion: 'Evita que baje la precisión del usuario.',
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
            descripcion: 'Copia la habilidad del Pokémon rival.',
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
                if (user.status) {
                    // Podrías añadir una propiedad 'evasion' al user aquí
                    return '¡Tumbos aumenta la evasión!';
                }
                return null;
            }
        },
        'cloro_fila': {
            nombre: 'Clorofila',
            descripcion: 'Duplica la velocidad bajo el sol.',
            efecto: (user, weather) => {
                if (weather === 'soleado' && user.stats) {
                    user.stats.velocidad *= 2;
                    return '¡La velocidad se duplicó bajo el sol!';
                }
                return null;
            }
        },
        'torrente': {
            nombre: 'Torrente',
            descripcion: 'Potencia ataques de agua cuando tiene poca vida.',
            efecto: (user, target, move) => {
                if (move && move.tipo === 'Agua' && user.hp < (user.hpMax / 3)) {
                    move.poder = Math.floor(move.poder * 1.5);
                    return '¡Torrente potencia el ataque de agua!';
                }
                return null;
            }
        },
        'mar_llamas': {
            nombre: 'Mar Llamas',
            descripcion: 'Potencia ataques de fuego cuando tiene poca vida.',
            efecto: (user, target, move) => {
                if (move && move.tipo === 'Fuego' && user.hp < (user.hpMax / 3)) {
                    move.poder = Math.floor(move.poder * 1.5);
                    return '¡Mar Llamas potencia el ataque de fuego!';
                }
                return null;
            }
        },
        'espejo_magico': {
            nombre: 'Espejo Mágico',
            descripcion: 'Refleja cambios de estado y debuffs al rival.',
            efecto: (user, target, move) => '¡Espejo Mágico refleja los efectos del rival!'
        },

        // --- NUEVAS HABILIDADES (AGREGADAS POR FALTA EN POKEDEX) ---
        'fuga': {
            nombre: 'Fuga',
            descripcion: 'Permite huir de combates contra Pokémon salvajes con mayor facilidad.',
            efecto: (user, target) => {
                // Esta habilidad se puede chequear en la lógica de huida
                return '¡La habilidad Fuga facilita la huida!';
            }
        },
        'agallas': {
            nombre: 'Agallas',
            descripcion: 'Aumenta el ataque cuando el Pokémon sufre un problema de estado.',
            efecto: (user) => {
                if (user.status && user.stats) {
                    user.stats.ataque = Math.floor(user.stats.ataque * 1.5);
                    return '¡Agallas aumenta el ataque por su estado!';
                }
                return null;
            }
        },
        'cacheo': {
            nombre: 'Cacheo',
            descripcion: 'Revela el objeto que lleva el Pokémon rival.',
            efecto: (user, target) => {
                // Lógica para revelar el item del oponente
                if (target.item) {
                    return `¡Cacheo reveló que el rival lleva ${target.item.nombre}!`;
                }
                return '¡Cacheo reveló que el rival no lleva ningún objeto!';
            }
        },
        'polvo_escudo': {
            nombre: 'Polvo Escudo',
            descripcion: 'Evita que bajen los stats por movimientos del rival.',
            efecto: (user) => {
                // Actúa como protección contra efectos que reducen estadísticas
                return '¡Polvo Escudo protege de cambios de stats!';
            }
        },
        'mudar': {
            nombre: 'Mudar',
            descripcion: 'Cura problemas de estado al mudar la piel.',
            efecto: (user) => {
                // Similar a Cura Natural, pero tal vez con diferente probabilidad o trigger
                if (user.status && Math.random() < 0.3) { // 30% de chance por turno
                    const oldStatus = user.status;
                    user.status = null;
                    return `¡Mudar curó ${oldStatus}!`;
                }
                return null;
            }
        },
        'ojo_compuesto': {
            nombre: 'Ojo Compuesto',
            descripcion: 'Aumenta la precisión de los movimientos.',
            efecto: (user, target, move) => {
                if (move) {
                    // Aumenta la precisión percibida del movimiento un 30%
                    move.precision = Math.min(100, move.precision * 1.3);
                }
                return '¡Ojo Compuesto aumenta la precisión!';
            }
        },
        'enjambre': {
            nombre: 'Enjambre',
            descripcion: 'Potencia los movimientos de tipo Bicho cuando los PS son bajos.',
            efecto: (user, target, move) => {
                if (move && move.tipo === 'Bicho' && user.hp < (user.hpMax / 3)) {
                    move.poder = Math.floor(move.poder * 1.5);
                    return '¡Enjambre potencia el ataque bicho!';
                }
                return null;
            }
        },
        'francotirador': {
            nombre: 'Francotirador',
            descripcion: 'Aumenta el daño de los golpes críticos.',
            efecto: (user) => {
                // Este efecto se aplica en la lógica de cálculo de daño crítico
                return '¡Francotirador preparado para golpes críticos!';
            }
        }
    },

    // --- LÓGICA DE APLICACIÓN ---
    applyAbilityOnEntry(pokemon, opponent) {
        const key = pokemon.habilidad?.toLowerCase().replace(/\s+/g, '_');
        const ability = this.abilities[key];
        
        if (ability && ability.efecto) {
            const result = ability.efecto(pokemon, opponent);
            // Algunas habilidades no devuelven mensaje (retornan null)
            return result || null;
        }
        return null;
    },

    applyAbilityOnAttack(attacker, defender, move) {
        const key = attacker.habilidad?.toLowerCase().replace(/\s+/g, '_');
        const ability = this.abilities[key];

        if (ability && ability.efecto) {
            return ability.efecto(attacker, defender, move);
        }
        return null;
    }
};