// lib/logic.js
import { BattleSystem } from './battle-system.js';
import { AbilitiesSystem } from './abilities.js';
import { StatusSystem } from './status-system.js';
import { WeatherSystem } from './weather-system.js';
import { UISystem } from './ui-system.js';
import pokedex from './pokedex.json' assert { type: 'json' };
import moves from './moves.json' assert { type: 'json' };
import items from './items.json' assert { type: 'json' };
import trainers from './trainers.json' assert { type: 'json' };
import mapa from './mapa.json' assert { type: 'json' };

export class GameLogic {
  // ========== ORQUESTADOR PRINCIPAL ==========
  static async handleBattle(playerPokemon, opponentPokemon, playerMove, opponentMove) {
    // 1. Aplicar habilidades al entrar
    const abilityMessage1 = AbilitiesSystem.applyAbilityOnEntry(playerPokemon, opponentPokemon);
    const abilityMessage2 = AbilitiesSystem.applyAbilityOnEntry(opponentPokemon, playerPokemon);
    
    // 2. Iniciar clima (opcional, aleatorio o basado en ubicación)
    const possibleWeathers = ['soleado', 'lluvia', null];
    const weather = possibleWeathers[Math.floor(Math.random() * possibleWeathers.length)];
    if (weather) {
      WeatherSystem.setWeather(weather);
    }
    
    // 3. Ejecutar turno de combate
    const turnResult = BattleSystem.executeBattleTurn(
      playerPokemon,
      opponentPokemon,
      playerMove,
      opponentMove,
      weather
    );
    
    // 4. Verificar si alguien fue debilitado
    const playerFainted = playerPokemon.hp <= 0;
    const opponentFainted = opponentPokemon.hp <= 0;
    
    // 5. Preparar mensaje de resultado
    let resultMessage = '';
    
    if (abilityMessage1) resultMessage += `🎇 ${abilityMessage1}\n`;
    if (abilityMessage2) resultMessage += `🎇 ${abilityMessage2}\n`;
    
    resultMessage += `${turnResult.attacker.message}\n`;
    resultMessage += `${turnResult.defender.message}\n`;
    
    turnResult.statusEffects.forEach(effect => {
      resultMessage += `⚡ ${effect}\n`;
    });
    
    if (playerFainted) {
      resultMessage += `\n💔 ${playerPokemon.nombre} se debilitó!`;
    } else if (opponentFainted) {
      resultMessage += `\n🎉 ${opponentPokemon.nombre} se debilitó!`;
      
      // Calcular experiencia si el jugador gana
      const expGained = BattleSystem.calculateExperience(
        playerPokemon.nivel,
        opponentPokemon.base_experience || 50,
        opponentPokemon.isTrainer // Si es entrenador
      );
      
      resultMessage += `\n✨ ${playerPokemon.nombre} gana ${expGained} puntos de experiencia!`;
    }
    
    return {
      playerPokemon,
      opponentPokemon,
      turnResult,
      playerFainted,
      opponentFainted,
      message: resultMessage,
      weather: turnResult.weather
    };
  }
  
  // ========== SISTEMA DE EXPLORACIÓN ==========
  static findWildPokemon(locationName) {
    const location = mapa[locationName];
    if (!location || !location.spawn) return null;
    
    // Seleccionar Pokémon aleatorio de la zona
    const possiblePokemonIds = location.spawn;
    const randomIndex = Math.floor(Math.random() * possiblePokemonIds.length);
    const pokemonId = possiblePokemonIds[randomIndex];
    
    // Generar nivel aleatorio dentro del rango
    const levelRange = location.niveles || [2, 5];
    const randomLevel = Math.floor(Math.random() * (levelRange[1] - levelRange[0] + 1)) + levelRange[0];
    
    // Crear instancia del Pokémon salvaje
    const basePokemon = pokedex[pokemonId];
    if (!basePokemon) return null;
    
    const wildPokemon = {
      ...basePokemon,
      id: pokemonId,
      nivel: randomLevel,
      hp: BattleSystem.calculateMaxHP({...basePokemon, nivel: randomLevel}),
      hpMax: BattleSystem.calculateMaxHP({...basePokemon, nivel: randomLevel}),
      movimientos: basePokemon.movimientos.filter(m => m.nivel <= randomLevel)
    };
    
    return wildPokemon;
  }
  
  // ========== SISTEMA DE ENTRENADORES ==========
  static getTrainer(trainerId) {
    // Buscar en todas las categorías de entrenadores
    let trainer = null;
    
    // Buscar en entrenadores de ruta
    const routeTrainer = trainers.entrenadores_ruta.find(t => t.id === trainerId);
    if (routeTrainer) trainer = routeTrainer;
    
    // Buscar en líderes
    if (!trainer) {
      for (const [city, leader] of Object.entries(trainers.lideres)) {
        if (leader.nombre === trainerId) {
          trainer = { ...leader, esLider: true, ciudad: city };
          break;
        }
      }
    }
    
    // Buscar en alto mando
    if (!trainer) {
      const elite = trainers.alto_mando.find(t => t.id === trainerId);
      if (elite) trainer = { ...elite, esElite: true };
    }
    
    // Buscar en campeón
    if (!trainer && trainers.campeon && trainers.campeon.nombre === trainerId) {
      trainer = { ...trainers.campeon, esCampeon: true };
    }
    
    // Buscar en especiales
    if (!trainer && trainers.entrenadores_especiales) {
      const special = trainers.entrenadores_especiales[trainerId];
      if (special) trainer = { ...special, id: trainerId };
    }
    
    if (!trainer) return null;
    
    // Crear equipo del entrenador con Pokémon instanciados
    const team = trainer.equipo.map((pokemonId, index) => {
      const basePokemon = pokedex[pokemonId];
      if (!basePokemon) return null;
      
      const level = trainer.niveles ? trainer.niveles[index] : 5;
      
      return {
        ...basePokemon,
        id: pokemonId,
        nivel: level,
        hp: BattleSystem.calculateMaxHP({...basePokemon, nivel: level}),
        hpMax: BattleSystem.calculateMaxHP({...basePokemon, nivel: level}),
        movimientos: basePokemon.movimientos.filter(m => m.nivel <= level)
      };
    }).filter(p => p !== null);
    
    return {
      ...trainer,
      team,
      currentPokemonIndex: 0
    };
  }
  
  // ========== SISTEMA DE CAPTURA ==========
  static attemptPokemonCapture(pokemonId, ballType = 'pokeball', currentHP, maxHP) {
    return BattleSystem.attemptCatch(pokemonId, ballType, currentHP, maxHP);
  }
  
  // ========== SISTEMA DE EVOLUCIÓN ==========
  static checkEvolution(pokemon) {
    if (!pokemon.evolucion) return null;
    
    const evolutionData = pokemon.evolucion;
    
    if (pokemon.nivel >= evolutionData.nivel) {
      return {
        canEvolve: true,
        newPokemonId: evolutionData.id,
        method: 'level',
        requiredLevel: evolutionData.nivel
      };
    }
    
    return null;
  }
  
  // ========== UTILIDADES PARA COMANDOS ==========
  static getPokemonMoveSet(pokemon, level) {
    return pokemon.movimientos
      .filter(move => move.nivel <= level)
      .map(move => move.nombre);
  }
  
  static calculateNextLevelExp(currentLevel) {
    // Fórmula simplificada: Exp para siguiente nivel = Nivel * 100
    return currentLevel * 100;
  }
  
  static generateBattleSummary(playerPokemon, opponentPokemon) {
    const playerHPBar = UISystem.generateHPBar(playerPokemon.hp, playerPokemon.hpMax);
    const opponentHPBar = UISystem.generateHPBar(opponentPokemon.hp, opponentPokemon.hpMax);
    
    return `
🎮 *COMBATE POKÉMON*

👤 *TÚ*:
${playerPokemon.nombre} Nv.${playerPokemon.nivel}
${playerHPBar}
💥 ${playerPokemon.tipos.join('/')}

🆚 *RIVAL*:
${opponentPokemon.nombre} Nv.${opponentPokemon.nivel}
${opponentHPBar}
💥 ${opponentPokemon.tipos.join('/')}
    `;
  }
}

// Exportar todo lo necesario para los plugins
export {
  BattleSystem,
  AbilitiesSystem,
  StatusSystem,
  WeatherSystem,
  UISystem
};