// lib/battle-system.js
import typeChart from './type-chart.json' assert { type: 'json' };
import movesData from './moves.json' assert { type: 'json' };
import { AbilitiesSystem } from './abilities.js';
import { StatusSystem } from './status-system.js';
import { WeatherSystem } from './weather-system.js';

export class BattleSystem {
  // ========== CÁLCULO DE DAÑO ==========
  static calculateDamage(attacker, defender, moveName, weather = null) {
    const move = movesData[moveName];
    if (!move) return { damage: 0, message: "Movimiento no encontrado" };

    // 1. Calcular efectividad del tipo
    const effectiveness = this.calculateTypeEffectiveness(move.tipo, defender.tipos);
    
    // 2. Calcular stats del atacante (con nivel)
    const attackerStats = this.calculateStatsWithLevel(attacker);
    
    // 3. Calcular stats del defensor (con nivel)
    const defenderStats = this.calculateStatsWithLevel(defender);
    
    // 4. Determinar stat de ataque/defensa según categoría
    let attackStat, defenseStat;
    
    if (move.categoria === 'fisico') {
      attackStat = attackerStats.ataque;
      defenseStat = defenderStats.defensa;
    } else if (move.categoria === 'especial') {
      attackStat = attackerStats.ataqueEspecial;
      defenseStat = defenderStats.defensaEspecial;
    } else {
      // Movimiento de estado - no hace daño
      return { 
        damage: 0, 
        effectiveness,
        message: this.getEffectivenessMessage(effectiveness),
        isStatusMove: true 
      };
    }

    // 5. Fórmula de daño Pokémon (simplificada)
    let damage = Math.floor(
      (((2 * attacker.nivel / 5) + 2) * 
      move.poder * 
      (attackStat / defenseStat) / 50) + 2
    );

    // 6. Aplicar STAB (Same Type Attack Bonus)
    if (attacker.tipos.includes(move.tipo)) {
      damage = Math.floor(damage * 1.5);
    }

    // 7. Aplicar efectividad
    damage = Math.floor(damage * effectiveness.multiplier);

    // 8. Aplicar clima
    if (weather) {
      damage = WeatherSystem.applyWeatherToDamage(move, damage);
    }

    // 9. Aplicar habilidad del atacante
    const abilityEffect = AbilitiesSystem.applyAbilityOnAttack(attacker, defender, move);
    if (abilityEffect) {
      // Aquí podrías modificar el daño según la habilidad
      // Por ejemplo, para Mar Llamas o Torrente
    }

    // 10. Aplicar crítico (5% de probabilidad)
    let isCritical = false;
    if (Math.random() < 0.05) {
      damage = Math.floor(damage * 1.5);
      isCritical = true;
    }

    // 11. Daño mínimo de 1
    damage = Math.max(1, damage);

    return {
      damage,
      effectiveness,
      isCritical,
      move,
      message: `${this.getEffectivenessMessage(effectiveness)}${isCritical ? ' ¡GOLPE CRÍTICO!' : ''}`
    };
  }

  // ========== EFECTIVIDAD DE TIPOS ==========
  static calculateTypeEffectiveness(moveType, defenderTypes) {
    let multiplier = 1;
    let messages = [];

    for (const defenderType of defenderTypes) {
      const typeInfo = typeChart[defenderType];
      if (!typeInfo) continue;

      if (typeInfo.debil.includes(moveType)) {
        multiplier *= 2;
        messages.push("Es muy efectivo");
      } else if (typeInfo.resistente.includes(moveType)) {
        multiplier *= 0.5;
        messages.push("No es muy efectivo");
      } else if (typeInfo.inmune.includes(moveType)) {
        multiplier *= 0;
        messages.push("No afecta");
      }
    }

    return {
      multiplier,
      messages: messages.length > 0 ? messages : ["Efectividad normal"]
    };
  }

  static getEffectivenessMessage(effectiveness) {
    const lastMessage = effectiveness.messages[effectiveness.messages.length - 1];
    
    if (effectiveness.multiplier === 0) return "¡No tuvo efecto!";
    if (effectiveness.multiplier >= 2) return "¡Es muy efectivo!";
    if (effectiveness.multiplier <= 0.5) return "No es muy efectivo...";
    return "";
  }

  // ========== CÁLCULO DE STATS CON NIVEL ==========
  static calculateStatsWithLevel(pokemon) {
    // Fórmula: Stat = ((StatBase * 2 + IV + EV/4) * Nivel / 100) + 5
    // Versión simplificada: Stat = StatBase * (1 + Nivel/100)
    
    const levelMultiplier = 1 + (pokemon.nivel / 100);
    
    return {
      hp: Math.floor(pokemon.statsBase.hp * levelMultiplier),
      ataque: Math.floor(pokemon.statsBase.ataque * levelMultiplier),
      defensa: Math.floor(pokemon.statsBase.defensa * levelMultiplier),
      ataqueEspecial: Math.floor(pokemon.statsBase.ataqueEspecial * levelMultiplier),
      defensaEspecial: Math.floor(pokemon.statsBase.defensaEspecial * levelMultiplier),
      velocidad: Math.floor(pokemon.statsBase.velocidad * levelMultiplier)
    };
  }

  static calculateMaxHP(pokemon) {
    // HP = ((HPBase * 2 + IV + EV/4) * Nivel / 100) + Nivel + 10
    return Math.floor(pokemon.statsBase.hp * (1 + (pokemon.nivel / 50))) + pokemon.nivel + 10;
  }

  // ========== SISTEMA DE COMBATE POR TURNOS ==========
  static executeBattleTurn(attacker, defender, attackerMove, defenderMove, weather = null) {
    const turnResults = {
      attacker: { damage: 0, message: "" },
      defender: { damage: 0, message: "" },
      weather: null,
      statusEffects: []
    };

    // 1. Determinar orden por velocidad
    const attackerStats = this.calculateStatsWithLevel(attacker);
    const defenderStats = this.calculateStatsWithLevel(defender);
    
    let attackerFirst = attackerStats.velocidad >= defenderStats.velocidad;
    
    // 2. Aplicar parálisis (reduce velocidad y puede inmovilizar)
    if (attacker.status === 'paralizado') {
      const statusEffect = StatusSystem.applyStatusEffect(attacker);
      if (statusEffect && !statusEffect.canMove) {
        turnResults.statusEffects.push(`${attacker.nombre} está paralizado y no se puede mover!`);
        attackerFirst = false; // No puede mover, pasa turno
      }
    }
    
    if (defender.status === 'paralizado') {
      const statusEffect = StatusSystem.applyStatusEffect(defender);
      if (statusEffect && !statusEffect.canMove) {
        turnResults.statusEffects.push(`${defender.nombre} está paralizado y no se puede mover!`);
        attackerFirst = true; // Defensor no puede mover
      }
    }

    // 3. Aplicar daño por estado (quemadura, veneno)
    if (attacker.status && attacker.status !== 'paralizado') {
      const statusEffect = StatusSystem.applyStatusEffect(attacker);
      if (statusEffect && statusEffect.damage) {
        attacker.hp = Math.max(0, attacker.hp - statusEffect.damage);
        turnResults.statusEffects.push(`${attacker.nombre} ${statusEffect.message}`);
      }
    }

    if (defender.status && defender.status !== 'paralizado') {
      const statusEffect = StatusSystem.applyStatusEffect(defender);
      if (statusEffect && statusEffect.damage) {
        defender.hp = Math.max(0, defender.hp - statusEffect.damage);
        turnResults.statusEffects.push(`${defender.nombre} ${statusEffect.message}`);
      }
    }

    // 4. Aplicar clima
    if (weather) {
      const weatherDamage = WeatherSystem.applyWeatherDamage(attacker);
      if (weatherDamage) {
        attacker.hp = Math.max(0, attacker.hp - weatherDamage.damage);
        turnResults.statusEffects.push(weatherDamage.message);
      }
      
      const weatherDamageDef = WeatherSystem.applyWeatherDamage(defender);
      if (weatherDamageDef) {
        defender.hp = Math.max(0, defender.hp - weatherDamageDef.damage);
        turnResults.statusEffects.push(weatherDamageDef.message);
      }
    }

    // 5. Ejecutar movimientos
    if (attackerFirst) {
      // Atacante primero
      if (attackerMove) {
        const attackResult = this.calculateDamage(attacker, defender, attackerMove, weather);
        if (!attackResult.isStatusMove) {
          defender.hp = Math.max(0, defender.hp - attackResult.damage);
          turnResults.attacker = {
            damage: attackResult.damage,
            message: `${attacker.nombre} usó ${attackerMove}! ${attackResult.message}`
          };
        } else {
          turnResults.attacker.message = `${attacker.nombre} usó ${attackerMove}! (Movimiento de estado)`;
        }
      }

      // Defensor solo si sigue con vida
      if (defender.hp > 0 && defenderMove) {
        const defenseResult = this.calculateDamage(defender, attacker, defenderMove, weather);
        if (!defenseResult.isStatusMove) {
          attacker.hp = Math.max(0, attacker.hp - defenseResult.damage);
          turnResults.defender = {
            damage: defenseResult.damage,
            message: `${defender.nombre} usó ${defenderMove}! ${defenseResult.message}`
          };
        } else {
          turnResults.defender.message = `${defender.nombre} usó ${defenderMove}! (Movimiento de estado)`;
        }
      }
    } else {
      // Defensor primero
      if (defender.hp > 0 && defenderMove) {
        const defenseResult = this.calculateDamage(defender, attacker, defenderMove, weather);
        if (!defenseResult.isStatusMove) {
          attacker.hp = Math.max(0, attacker.hp - defenseResult.damage);
          turnResults.defender = {
            damage: defenseResult.damage,
            message: `${defender.nombre} usó ${defenderMove}! ${defenseResult.message}`
          };
        } else {
          turnResults.defender.message = `${defender.nombre} usó ${defenderMove}! (Movimiento de estado)`;
        }
      }

      // Atacante solo si sigue con vida
      if (attacker.hp > 0 && attackerMove) {
        const attackResult = this.calculateDamage(attacker, defender, attackerMove, weather);
        if (!attackResult.isStatusMove) {
          defender.hp = Math.max(0, defender.hp - attackResult.damage);
          turnResults.attacker = {
            damage: attackResult.damage,
            message: `${attacker.nombre} usó ${attackerMove}! ${attackResult.message}`
          };
        } else {
          turnResults.attacker.message = `${attacker.nombre} usó ${attackerMove}! (Movimiento de estado)`;
        }
      }
    }

    // 6. Actualizar clima
    if (weather) {
      turnResults.weather = WeatherSystem.updateWeather();
    }

    return turnResults;
  }

  // ========== VERIFICACIÓN DE EFECTOS DE ESTADO EN ATAQUE ==========
  static canAttack(pokemon) {
    if (!pokemon.status) return true;
    
    const statusEffect = StatusSystem.applyStatusEffect(pokemon);
    return statusEffect ? statusEffect.canMove !== false : true;
  }

  // ========== EXPERIENCIA POR COMBATE ==========
  static calculateExperience(winnerLevel, loserBaseExperience, isTrainerBattle = false) {
    // Fórmula simplificada: Exp = (ExpBase * NivelPerdedor * Multiplicador) / 7
    let exp = Math.floor((loserBaseExperience * winnerLevel) / 7);
    
    if (isTrainerBattle) {
      exp = Math.floor(exp * 1.5); // Más experiencia en combates contra entrenadores
    }
    
    return Math.max(10, exp);
  }

  // ========== SISTEMA DE CAPTURA ==========
  static calculateCatchRate(pokemonId, ballType = 'pokeball', pokemonCurrentHP = 1, pokemonMaxHP = 1) {
    // Fórmula simplificada de captura
    const pokemonData = pokedex[pokemonId];
    if (!pokemonData) return 0;

    const baseRate = pokemonData.ratio_captura;
    const ballMultiplier = balls[ballType]?.ratio || 1;
    const hpMultiplier = (pokemonMaxHP * 3 - pokemonCurrentHP * 2) / (pokemonMaxHP * 3);
    
    let catchRate = (baseRate * ballMultiplier * hpMultiplier) / 255;
    
    // Asegurar rango 0-1
    catchRate = Math.max(0, Math.min(1, catchRate));
    
    return catchRate;
  }

  static attemptCatch(pokemonId, ballType = 'pokeball', pokemonCurrentHP = 1, pokemonMaxHP = 1) {
    const catchRate = this.calculateCatchRate(pokemonId, ballType, pokemonCurrentHP, pokemonMaxHP);
    const roll = Math.random();
    
    return roll <= catchRate;
  }
}

// Importaciones necesarias (deberás crearlas o ajustar)
import pokedex from './pokedex.json' assert { type: 'json' };
import { balls } from './items.json' assert { type: 'json' };