// logic.js - SISTEMA COMPLETO MEJORADO DEL JUEGO POKÉMON
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cargar archivos de datos
const pokedexData = JSON.parse(readFileSync(path.join(__dirname, 'pokedex.json'), 'utf8'));
const itemsData = JSON.parse(readFileSync(path.join(__dirname, 'items.json'), 'utf8'));
const movesData = JSON.parse(readFileSync(path.join(__dirname, 'moves.json'), 'utf8'));
const mapaData = JSON.parse(readFileSync(path.join(__dirname, 'mapa.json'), 'utf8'));
const trainersData = JSON.parse(readFileSync(path.join(__dirname, 'trainers.json'), 'utf8'));
const dialogosData = JSON.parse(readFileSync(path.join(__dirname, 'dialogos.json'), 'utf8'));

// Importar sistemas
import { UISystem } from './ui-system.js';
import { AbilitiesSystem } from './abilities.js';
import { StatusSystem } from './status-system.js';
import { WeatherSystem } from './weather-system.js';
import { PCSystem } from './pc-system.js';
import { BreedingSystem } from './breeding-system.js';
import { ContestSystem } from './contest-system.js';
import { MissionSystem } from './mission-system.js';

export const PokemonLogic = {
    // ============ INICIALIZAR SISTEMAS ============
    ui: UISystem,
    abilities: AbilitiesSystem,
    status: StatusSystem,
    weather: WeatherSystem,
    pc: new PCSystem(),
    breeding: new BreedingSystem(),
    contests: new ContestSystem(),
    missions: new MissionSystem(),
    
    // ============ SISTEMA DE TIPOS MEJORADO ============
        typeChart: {
        'Normal': { 'Roca': 0.5, 'Fantasma': 0, 'Acero': 0.5 },
        'Fuego': { 'Planta': 2, 'Hielo': 2, 'Bicho': 2, 'Acero': 2, 'Agua': 0.5, 'Fuego': 0.5, 'Roca': 0.5, 'Dragon': 0.5 },
        'Agua': { 'Fuego': 2, 'Tierra': 2, 'Roca': 2, 'Agua': 0.5, 'Planta': 0.5, 'Dragon': 0.5 },
        'Planta': { 'Agua': 2, 'Tierra': 2, 'Roca': 2, 'Fuego': 0.5, 'Planta': 0.5, 'Veneno': 0.5, 'Volador': 0.5, 'Bicho': 0.5, 'Dragon': 0.5, 'Acero': 0.5 },
        'Electrico': { 'Agua': 2, 'Volador': 2, 'Electrico': 0.5, 'Planta': 0.5, 'Dragon': 0.5, 'Tierra': 0 },
        'Hielo': { 'Planta': 2, 'Tierra': 2, 'Volador': 2, 'Dragon': 2, 'Fuego': 0.5, 'Agua': 0.5, 'Hielo': 0.5, 'Acero': 0.5 },
        'Lucha': { 'Normal': 2, 'Hielo': 2, 'Roca': 2, 'Acero': 2, 'Veneno': 0.5, 'Volador': 0.5, 'Psiquico': 0.5, 'Bicho': 0.5, 'Hada': 0.5, 'Fantasma': 0 },
        'Veneno': { 'Planta': 2, 'Hada': 2, 'Veneno': 0.5, 'Tierra': 0.5, 'Roca': 0.5, 'Fantasma': 0.5, 'Acero': 0 },
        'Tierra': { 'Fuego': 2, 'Electrico': 2, 'Veneno': 2, 'Roca': 2, 'Acero': 2, 'Planta': 0.5, 'Bicho': 0.5, 'Volador': 0 },
        'Volador': { 'Planta': 2, 'Lucha': 2, 'Bicho': 2, 'Electrico': 0.5, 'Roca': 0.5, 'Acero': 0.5 },
        'Psiquico': { 'Lucha': 2, 'Veneno': 2, 'Psiquico': 0.5, 'Acero': 0.5, 'Siniestro': 0 },
        'Bicho': { 'Planta': 2, 'Psiquico': 2, 'Siniestro': 2, 'Fuego': 0.5, 'Lucha': 0.5, 'Veneno': 0.5, 'Volador': 0.5, 'Fantasma': 0.5, 'Acero': 0.5, 'Hada': 0.5 },
        'Roca': { 'Fuego': 2, 'Hielo': 2, 'Volador': 2, 'Bicho': 2, 'Lucha': 0.5, 'Tierra': 0.5, 'Acero': 0.5 },
        'Fantasma': { 'Psiquico': 2, 'Fantasma': 2, 'Siniestro': 0.5, 'Normal': 0 },
        'Dragon': { 'Dragon': 2, 'Acero': 0.5, 'Hada': 0 },
        'Acero': { 'Hielo': 2, 'Roca': 2, 'Hada': 2, 'Fuego': 0.5, 'Agua': 0.5, 'Electrico': 0.5, 'Acero': 0.5 },
        'Hada': { 'Lucha': 2, 'Dragon': 2, 'Siniestro': 2, 'Fuego': 0.5, 'Veneno': 0.5, 'Acero': 0.5 }
    },
    
    // ============ SISTEMA DE EXPERIENCIA ============
    getExpRequired(level) {
        return Math.floor(0.8 * Math.pow(level, 3));
    },

    // ============ CALCULAR DAÑO MEJORADO ============
            initBattle(playerPk, opponentPk) {
        const battleLog = [];
        const res1 = this.abilities.applyAbilityOnEntry(playerPk, opponentPk);
        const res2 = this.abilities.applyAbilityOnEntry(opponentPk, playerPk);
        if (res1) battleLog.push(res1);
        if (res2) battleLog.push(res2);
        return battleLog;
    },

    
        calculateDamage(attacker, defender, moveName) {
        // 1. "Traductor" para encontrar el poder del ataque
        let move = movesData[moveName];
        if (!move) {
            // Busca en la pokedex el movimiento si no está en moves.json
            const pkMove = pokedexData[attacker.id].movimientos.find(m => m.nombre === moveName);
            if (pkMove) move = { poder: pkMove.daño, tipo: pkMove.tipo };
        }
        if (!move) move = { poder: 40, tipo: 'Normal' };

        // 2. Cálculo de efectividad por tipo
        let effectiveness = 1;
        defender.tipos.forEach(t => {
            if (this.typeChart[move.tipo]?.[t] !== undefined) effectiveness *= this.typeChart[move.tipo][t];
        });

        // 3. Mejora: Conexión con Clima y Habilidades
        this.abilities.applyAbilityOnAttack(attacker, defender, move);
        if (this.weather.currentWeather) effectiveness *= this.weather.getWeatherModifier(move.tipo);

        // 4. Fórmula Base
        const levelCalc = ((2 * attacker.nivel) / 5) + 2;
        const atk = attacker.stats?.ataque || 50;
        const def = defender.stats?.defensa || 50;
        let damage = Math.floor((((levelCalc * move.poder * (atk / def)) / 50) + 2) * effectiveness);
        
        return { 
            total: Math.max(1, Math.floor(damage * (Math.random() * 0.15 + 0.85))), 
            effectiveness 
        };
    },


    // ============ BATALLA COMPLETA POR TURNOS ============
    async battleTurn(playerPokemon, opponentPokemon, playerAction, moveIndex = 0, itemId = null) {
        const turnLog = [];
        
        // 1. APLICAR EFECTOS DE INICIO DE TURNO
        // Estados del jugador
        if (playerPokemon.status) {
            const statusResult = this.status.applyStatusEffect(playerPokemon);
            if (statusResult?.message) {
                turnLog.push(`**${playerPokemon.nombre}:** ${statusResult.message}`);
            }
            if (statusResult?.canMove === false) {
                return { 
                    canContinue: true, 
                    playerHP: playerPokemon.hp,
                    opponentHP: opponentPokemon.hp,
                    log: [...turnLog, `¡${playerPokemon.nombre} no puede moverse!`] 
                };
            }
        }
        
        // Estados del oponente
        if (opponentPokemon.status) {
            const statusResult = this.status.applyStatusEffect(opponentPokemon);
            if (statusResult?.message) {
                turnLog.push(`**${opponentPokemon.nombre}:** ${statusResult.message}`);
            }
            if (statusResult?.canMove === false) {
                // Opción de IA para atacar de todos modos
            }
        }
        
        // 2. APLICAR DAÑO POR CLIMA
        const weatherDamagePlayer = this.weather.applyWeatherDamage(playerPokemon);
        if (weatherDamagePlayer) {
            turnLog.push(`**Clima:** ${weatherDamagePlayer.message}`);
        }
        
        const weatherDamageOpponent = this.weather.applyWeatherDamage(opponentPokemon);
        if (weatherDamageOpponent) {
            turnLog.push(`**Clima:** ${weatherDamageOpponent.message} (Oponente)`);
        }
        
        // 3. VERIFICAR SI ALGUIEN SE DEBILITÓ
        if (playerPokemon.hp <= 0) {
            turnLog.push(`¡${playerPokemon.nombre} se debilitó!`);
            return { 
                canContinue: false, 
                winner: 'opponent', 
                playerHP: 0,
                opponentHP: opponentPokemon.hp,
                log: turnLog 
            };
        }
        
        if (opponentPokemon.hp <= 0) {
            turnLog.push(`¡${opponentPokemon.nombre} se debilitó!`);
            return { 
                canContinue: false, 
                winner: 'player',
                playerHP: playerPokemon.hp,
                opponentHP: 0,
                log: turnLog 
            };
        }
        
        // 4. TURNO DEL JUGADOR
        switch(playerAction) {
            case 'attack':
                const move = playerPokemon.movimientos[moveIndex];
                if (!move) {
                    turnLog.push('Movimiento inválido');
                    break;
                }
                
                const damageResult = this.calculateDamage(playerPokemon, opponentPokemon, move.nombre);
                opponentPokemon.hp = Math.max(0, opponentPokemon.hp - damageResult.total);
                
                turnLog.push(`⚔️ **${playerPokemon.nombre}** usó **${move.nombre}**!`);
                if (damageResult.text) turnLog.push(damageResult.text);
                if (damageResult.isCrit) turnLog.push('¡GOLPE CRÍTICO! 💥');
                if (damageResult.abilityEffect) turnLog.push(damageResult.abilityEffect);
                if (damageResult.weather) turnLog.push(`(Clima: ${damageResult.weather})`);
                
                // Verificar si la habilidad aplica efecto de estado
                if (playerPokemon.habilidad === 'cuerpo_llama' && Math.random() < 0.3) {
                    opponentPokemon.status = 'quemado';
                    turnLog.push(`¡${opponentPokemon.nombre} se quemó! 🔥`);
                }
                break;
                
            case 'item':
                if (!itemId) {
                    turnLog.push('Item no especificado');
                    break;
                }
                
                const itemResult = this.useItemInBattle(itemId, playerPokemon);
                if (itemResult.success) {
                    turnLog.push(`🎒 **Usó ${itemId}:** ${itemResult.message}`);
                } else {
                    turnLog.push(`❌ **Error:** ${itemResult.message}`);
                }
                break;
                
            case 'switch':
                turnLog.push(`🔄 **Cambió a otro Pokémon**`);
                return { 
                    canContinue: true, 
                    switched: true,
                    playerHP: playerPokemon.hp,
                    opponentHP: opponentPokemon.hp,
                    log: turnLog 
                };
                
            case 'flee':
                const fleeChance = (playerPokemon.stats?.velocidad || 50) / (opponentPokemon.stats?.velocidad || 50);
                if (Math.random() < fleeChance) {
                    return { 
                        canContinue: false, 
                        fled: true,
                        log: [...turnLog, '🏃 **¡Huyó exitosamente de la batalla!**'] 
                    };
                } else {
                    turnLog.push('❌ **No pudo huir...**');
                }
                break;
        }
        
        // 5. TURNO DEL OPONENTE (solo si sigue vivo)
        if (opponentPokemon.hp > 0 && playerAction !== 'flee') {
            // IA simple: elegir movimiento al azar
            const availableMoves = opponentPokemon.movimientos.filter(m => m);
            if (availableMoves.length > 0) {
                const opponentMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
                const opponentDamage = this.calculateDamage(opponentPokemon, playerPokemon, opponentMove.nombre);
                playerPokemon.hp = Math.max(0, playerPokemon.hp - opponentDamage.total);
                
                turnLog.push(`⚔️ **${opponentPokemon.nombre}** usó **${opponentMove.nombre}**!`);
                if (opponentDamage.text) turnLog.push(opponentDamage.text);
                if (opponentDamage.isCrit) turnLog.push('¡GOLPE CRÍTICO del oponente! 💥');
                
                // Efecto de habilidad del oponente
                if (opponentPokemon.habilidad === 'cuerpo_llama' && Math.random() < 0.3) {
                    playerPokemon.status = 'quemado';
                    turnLog.push(`¡${playerPokemon.nombre} se quemó! 🔥`);
                }
            }
        }
        
        // 6. ACTUALIZAR CLIMA
        const weatherUpdate = this.weather.updateWeather();
        if (weatherUpdate?.ended) {
            turnLog.push(`🌤️ **${weatherUpdate.message}**`);
        } else if (weatherUpdate?.ongoing) {
            turnLog.push(`⏳ **${weatherUpdate.weather}:** ${weatherUpdate.turnsLeft} turnos restantes`);
        }
        
        // 7. VERIFICAR FIN DE BATALLA
        if (playerPokemon.hp <= 0) {
            turnLog.push(`💀 **¡${playerPokemon.nombre} se debilitó!**`);
            return { 
                canContinue: false, 
                winner: 'opponent',
                playerHP: 0,
                opponentHP: opponentPokemon.hp,
                log: turnLog 
            };
        }
        
        if (opponentPokemon.hp <= 0) {
            turnLog.push(`🎉 **¡${opponentPokemon.nombre} se debilitó!**`);
            return { 
                canContinue: false, 
                winner: 'player',
                playerHP: playerPokemon.hp,
                opponentHP: 0,
                log: turnLog 
            };
        }
        
        return {
            canContinue: true,
            playerHP: playerPokemon.hp,
            opponentHP: opponentPokemon.hp,
            log: turnLog
        };
    },

    // ============ GENERAR POKÉMON CON TODOS LOS ATRIBUTOS ============
    generatePokemonWithAbility(pokemonId, level, isShiny = false) {
        const baseData = pokedexData[pokemonId];
        if (!baseData) return null;

        // Determinar habilidad
        const possibleAbilities = this.getPossibleAbilities(pokemonId);
        const ability = possibleAbilities[Math.floor(Math.random() * possibleAbilities.length)];
        
        // Determinar naturaleza
        const natures = ['Audaz', 'Modesta', 'Timida', 'Osada', 'Floja', 'Activa', 'Mansa', 'Agitada', 'Firme', 'Picara'];
        const nature = natures[Math.floor(Math.random() * natures.length)];
        
        // Calcular IVs (0-31)
        const ivs = {
            hp: Math.floor(Math.random() * 32),
            ataque: Math.floor(Math.random() * 32),
            defensa: Math.floor(Math.random() * 32),
            velocidad: Math.floor(Math.random() * 32),
            ataqueEspecial: Math.floor(Math.random() * 32),
            defensaEspecial: Math.floor(Math.random() * 32)
        };
        
        // Calcular stats
        const stats = this.calculateAllStats(baseData.statsBase, level, ivs, nature);
        const hpMax = this.calculateHP(baseData.statsBase.hp, level, ivs.hp);
        
        const pokemon = {
            id: pokemonId,
            nombre: baseData.nombre,
            tipos: baseData.tipos,
            nivel: level,
            exp: 0,
            hpMax: hpMax,
            hp: hpMax,
            stats: stats,
            statsBase: baseData.statsBase,
            movimientos: this.getAvailableMoves(baseData, level),
            habilidad: ability,
            naturaleza: nature,
            ivs: ivs,
            evs: { hp: 0, ataque: 0, defensa: 0, velocidad: 0, ataqueEspecial: 0, defensaEspecial: 0 },
            shiny: isShiny,
            felicidad: 70,
            status: null,
            originalTrainer: null,
            metLocation: 'wild',
            metLevel: level,
            pokerus: false
        };
        
        return pokemon;
    },

    // ============ FUNCIONES DE APOYO ============
    getPossibleAbilities(pokemonId) {
        const abilityMap = {
            '10': ['Vista Lince', 'Tumbos'],
            '13': ['Fuga', 'Agallas'],
            '149': ['Multiescala'],
            '150': ['Presión'],
            '164': ['Presión'],
            '151': ['Sincronía'],
            '4': ['Mar Llamas'],
            '7': ['Torrente'],
            '1': ['Espesura'],
            '25': ['Electricidad Estática'],
            // Agregar más según necesites
        };
        
        return abilityMap[pokemonId] || ['Ninguna'];
    },
    
    calculateHP(baseHP, level, ivHP) {
        return Math.floor(((2 * baseHP + ivHP) * level) / 100) + level + 10;
    },
    
    calculateAllStats(baseStats, level, ivs, nature) {
        const stats = {};
        const natureModifiers = this.getNatureModifiers(nature);
        
        const statOrder = ['ataque', 'defensa', 'velocidad', 'ataqueEspecial', 'defensaEspecial'];
        
        statOrder.forEach(stat => {
            const base = baseStats[stat] || 50;
            const iv = ivs[stat] || 0;
            const natureMod = natureModifiers[stat] || 1.0;
            
            stats[stat] = Math.floor((((2 * base + iv) * level) / 100) + 5) * natureMod;
        });
        
        return stats;
    },
    
    getNatureModifiers(nature) {
        const modifiers = {
            'Audaz': { ataque: 1.1, defensa: 0.9 },
            'Modesta': { ataque: 0.9, ataqueEspecial: 1.1 },
            'Timida': { ataque: 0.9, velocidad: 1.1 },
            'Osada': { defensa: 1.1, ataque: 0.9 },
            'Floja': { defensa: 0.9, ataqueEspecial: 1.1 },
            'Activa': { velocidad: 1.1, defensa: 0.9 },
            'Mansa': { ataqueEspecial: 1.1, velocidad: 0.9 },
            'Agitada': { velocidad: 1.1, ataqueEspecial: 0.9 },
            'Firme': { defensa: 1.1, velocidad: 0.9 },
            'Picara': { ataqueEspecial: 1.1, defensa: 0.9 },
            'Serena': {}, // Neutra
            'Huraña': {}, // Neutra
            'Miedosa': {}, // Neutra
            'Activa': {}, // Neutra
            'Alocada': {} // Neutra
        };
        
        return modifiers[nature] || {};
    },

    // ============ SISTEMA DE CAPTURA MEJORADO ============
    calculateCaptureRate(pokemonId, pokemonHP, pokemonMaxHP, ballType = 'pokeball', status = null) {
        const pokemonData = pokedexData[pokemonId];
        if (!pokemonData) return 0;

        const ballData = itemsData.balls[ballType];
        if (!ballData) return 0;

        const catchRate = 255; // Base
        const ballRate = ballData.ratio || 1;
        const hpFactor = (3 * pokemonMaxHP - 2 * pokemonHP) / (3 * pokemonMaxHP);
        
        let captureRate = catchRate * ballRate * hpFactor;
        
        // Bonificación por estado
        if (status) {
            if (status === 'dormido' || status === 'congelado') {
                captureRate *= 2.5;
            } else if (status === 'paralizado' || status === 'quemado' || status === 'envenenado') {
                captureRate *= 1.5;
            }
        }
        
        // Ajuste por nivel
        if (pokemonData.spawn?.rango_nivel) {
            const avgLevel = (pokemonData.spawn.rango_nivel[0] + pokemonData.spawn.rango_nivel[1]) / 2;
            captureRate *= (50 / avgLevel);
        }
        
        return Math.min(99, Math.max(1, Math.floor(captureRate)));
    },

    // ============ USAR ITEM EN BATALLA ============
    useItemInBattle(itemId, targetPokemon) {
        const item = this.findItem(itemId);
        if (!item) return { success: false, message: 'Item no encontrado' };

        let result = { success: true, message: '' };

        if (item.curacion) {
            const healAmount = item.curacion;
            targetPokemon.hp = Math.min(targetPokemon.hpMax, targetPokemon.hp + healAmount);
            result.message = `${targetPokemon.nombre} recuperó ${healAmount} PS!`;
            
        } else if (item.revive && targetPokemon.hp <= 0) {
            const reviveHP = Math.floor(targetPokemon.hpMax * 0.5);
            targetPokemon.hp = reviveHP;
            result.message = `${targetPokemon.nombre} fue revivido con ${reviveHP} PS!`;
            
        } else if (item.curaEstado && targetPokemon.status) {
            const cureResult = this.status.cureStatus(targetPokemon, itemId);
            if (cureResult.success) {
                result.message = cureResult.message;
            } else {
                result = cureResult;
            }
            
        } else {
            result = { success: false, message: 'No se puede usar este item ahora' };
        }

        return result;
    },

    // ============ FUNCIONES PARA PC SYSTEM ============
    depositToPC(player, pokemonIndex, boxName = 'Caja 1') {
        return this.pc.depositPokemon(player, pokemonIndex, boxName);
    },
    
    withdrawFromPC(player, boxName, pcIndex) {
        return this.pc.withdrawPokemon(player, boxName, pcIndex);
    },
    
    getPCBox(boxName) {
        return this.pc.boxes[boxName];
    },
    
    searchInPC(searchTerm) {
        return this.pc.searchPokemon(searchTerm);
    },
    
    getPCStats() {
        return this.pc.getPCStats();
    },
    
    organizePC(boxName, criteria = 'nivel') {
        return this.pc.organizeBox(boxName, criteria);
    },

    // ============ FUNCIONES PARA BREEDING SYSTEM ============
    depositToDaycare(pokemon, slot = 1) {
        return this.breeding.depositToDaycare(pokemon, slot);
    },
    
    collectEgg() {
        return this.breeding.collectEgg();
    },
    
    hatchEgg(egg) {
        return this.breeding.hatchEgg(egg);
    },
    
    checkDaycareCompatibility() {
        return this.breeding.checkCompatibility();
    },
    
    updateDaycareSteps(steps) {
        return this.breeding.updateSteps(steps);
    },

    // ============ FUNCIONES PARA MISSION SYSTEM ============
    assignDailyMissions(player) {
        return this.missions.assignDailyMissions(player);
    },
    
    updateMissionProgress(player, missionType, data) {
        return this.missions.updateMissionProgress(player, missionType, data);
    },
    
    claimMissionReward(player, missionId) {
        return this.missions.claimMissionReward(player, missionId);
    },
    
    getEventMissions(eventName) {
        return this.missions.eventMissions[eventName] || [];
    },

    // ============ FUNCIONES PARA CONTEST SYSTEM ============
    startContest(category, participants) {
        return this.contests.startContest(category, participants);
    },
    
    contestTurn(contest, moves) {
        return this.contests.contestTurn(contest, moves);
    },
    
    calculateContestCondition(pokemon, category) {
        return this.contests.calculateCondition(pokemon, category);
    },

    // ============ FUNCIONES UTILITARIAS ============
    findItem(itemId) {
        for (const category in itemsData) {
            if (itemsData[category][itemId]) {
                return itemsData[category][itemId];
            }
        }
        return null;
    },

    getPokemonData(pokemonId) {
        return pokedexData[pokemonId] || null;
    },

    getMoveData(moveName) {
        return movesData[moveName] || null;
    },

    getLocationData(locationName) {
        return mapaData[locationName] || null;
    },
    
    getTrainerData(trainerId) {
        // Buscar en todas las categorías de entrenadores
        for (const category in trainersData) {
            if (Array.isArray(trainersData[category])) {
                const trainer = trainersData[category].find(t => t.id === trainerId);
                if (trainer) return trainer;
            } else if (trainersData[category][trainerId]) {
                return trainersData[category][trainerId];
            }
        }
        return null;
    },
    
    getNPCConversation(location, npc) {
        return dialogosData[location]?.[npc] || null;
    },

    // ============ OTRAS FUNCIONES EXISTENTES (mantener) ============
    getAvailableMoves(pokemonData, level) {
        const moves = [];
        
        if (pokemonData.movimientos) {
            pokemonData.movimientos.forEach(move => {
                if (move.nivel <= level) {
                    moves.push({
                        nombre: move.nombre,
                        tipo: move.tipo,
                        poder: move.daño,
                        pp: move.pp || 10,
                        ppMax: move.pp || 10,
                        categoria: move.categoria || 'fisico',
                        precision: move.precision || 100,
                        efecto: move.efecto || null
                    });
                }
            });
        }

        if (moves.length === 0) {
            moves.push(
                { nombre: "Placaje", tipo: "Normal", poder: 40, pp: 35, ppMax: 35, categoria: 'fisico', precision: 100 },
                { nombre: "Arañazo", tipo: "Normal", poder: 40, pp: 35, ppMax: 35, categoria: 'fisico', precision: 100 }
            );
        }

        return moves.slice(0, 4);
    },
    
    generateWildPokemon(locationName) {
        const location = mapaData[locationName];
        if (!location || location.tipo !== 'hierba') {
            return null;
        }

        const spawnIds = location.spawn || [];
        if (spawnIds.length === 0) {
            return null;
        }

        const randomPokemonId = spawnIds[Math.floor(Math.random() * spawnIds.length)];
        const levelRange = location.niveles || [2, 5];
        const level = Math.floor(Math.random() * (levelRange[1] - levelRange[0] + 1)) + levelRange[0];
        
        return this.generatePokemonWithAbility(randomPokemonId, level, Math.random() < 0.001); // 0.1% shiny
    },
    
    checkEvolution(pokemonId, pokemonLevel) {
        const pokemonData = pokedexData[pokemonId];
        if (!pokemonData || !pokemonData.evolucion) return null;

        const evolution = pokemonData.evolucion;
        
        if (evolution.nivel && pokemonLevel >= evolution.nivel) {
            return {
                evolves: true,
                newId: evolution.id,
                method: 'level',
                level: evolution.nivel
            };
        }
        
        if (evolution.alternativa && pokemonLevel >= (evolution.nivel || 20)) {
            return {
                evolves: true,
                newId: evolution.alternativa,
                method: 'alternative',
                level: evolution.nivel || 20
            };
        }

        return { evolves: false };
    },
    
    healPokemonTeam(team) {
        team.forEach(pokemon => {
            pokemon.hp = pokemon.hpMax;
            pokemon.status = null;
            
            if (pokemon.movimientos) {
                pokemon.movimientos.forEach(move => {
                    move.pp = move.ppMax || 10;
                });
            }
        });
        
        return {
            success: true,
            message: '¡Todos tus Pokémon han sido curados completamente!'
        };
    }
};

// ============ FUNCIONES DE UTILIDAD GLOBAL ============
export const GameUtils = {
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    calculatePriceWithDiscount(basePrice, discountPercent = 0) {
        return Math.floor(basePrice * (1 - discountPercent / 100));
    },

    formatPercentage(value) {
        return `${Math.round(value * 100)}%`;
    },
    
    capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },
    
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    },
    
    getRandomWeather() {
        const weathers = ['soleado', 'lluvia', 'tormenta_arena', 'granizo'];
        return weathers[Math.floor(Math.random() * weathers.length)];
    },
    
    getTypeEmoji(type) {
        const emojis = {
            'fuego': '🔥',
            'agua': '💧',
            'planta': '🌿',
            'electrico': '⚡',
            'hielo': '❄️',
            'lucha': '🥊',
            'veneno': '☠️',
            'tierra': '⛰️',
            'volador': '🐦',
            'psiquico': '🔮',
            'bicho': '🐛',
            'roca': '🪨',
            'fantasma': '👻',
            'dragon': '🐉',
            'siniestro': '🌑',
            'acero': '🛡️',
            'hada': '✨',
            'normal': '⚪'
        };
        return emojis[type.toLowerCase()] || '❓';
    }
};