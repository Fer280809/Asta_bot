export class PokemonLogic {
  constructor(userId) {
    this.userId = userId;
    this.userData = null;
  }
  
  // Cargar datos del usuario
  async loadUserData() {
    const path = `./data/users/userdata_${this.userId}.json`;
    if (fs.existsSync(path)) {
      this.userData = JSON.parse(fs.readFileSync(path, 'utf8'));
    } else {
      this.userData = this.createNewUser();
      await this.saveUserData();
    }
    return this.userData;
  }
  
  createNewUser() {
    return {
      player: {
        name: "Entrenador",
        money: 3000,
        badges: [],
        location: "pueblo_paleta",
        lastAction: Date.now()
      },
      team: [
        {
          id: 1, // Pokémon inicial elegido
          nickname: "",
          level: 5,
          exp: 0,
          currentHp: 20,
          maxHp: 20,
          moves: ["Placaje", "Gruñido"],
          stats: { hp: 20, atk: 10, def: 10, spa: 10, spd: 10, spe: 10 }
        }
      ],
      pc: {
        boxes: Array(8).fill().map(() => Array(30).fill(null)),
        currentBox: 0
      },
      bag: {
        pokeballs: { pokeball: 5, greatball: 0, ultraball: 0 },
        potions: { potion: 3, superpotion: 0, hyperpotion: 0 },
        berries: {},
        keyItems: {}
      },
      pokedex: {},
      progress: {
        defeatedTrainers: [],
        gymsDefeated: [],
        storyStep: 0
      }
    };
  }
  
  // Sistema de batalla
  calculateDamage(attacker, defender, move) {
    // Implementar fórmula de daño Pokémon
    const level = attacker.level;
    const attack = attacker.stats.atk;
    const defense = defender.stats.def;
    const power = move.power;
    const stab = attacker.types.includes(move.type) ? 1.5 : 1;
    const effectiveness = this.getEffectiveness(move.type, defender.types);
    
    const damage = Math.floor((((2 * level / 5 + 2) * power * attack / defense) / 50 + 2) * stab * effectiveness);
    return Math.max(1, damage);
  }
  
  getEffectiveness(attackType, defenderTypes) {
    let multiplier = 1;
    defenderTypes.forEach(type => {
      const chart = pokemonDB.typeChart[attackType];
      if (chart.super.includes(type)) multiplier *= 2;
      if (chart.weak.includes(type)) multiplier *= 0.5;
      if (chart.immune?.includes(type)) multiplier *= 0;
    });
    return multiplier;
  }
  
  // Sistema de experiencia
  gainExp(pokemon, defeatedLevel) {
    const expGain = Math.floor((defeatedLevel * pokemonDB.pokemons[pokemon.id].expYield) / 7);
    pokemon.exp += expGain;
    
    // Subir nivel
    const expForNextLevel = Math.floor(Math.pow(pokemon.level, 3) * 0.8);
    if (pokemon.exp >= expForNextLevel) {
      pokemon.level++;
      pokemon.exp -= expForNextLevel;
      this.levelUpStats(pokemon);
      return { leveledUp: true, newLevel: pokemon.level };
    }
    return { leveledUp: false };
  }
  
  levelUpStats(pokemon) {
    const baseStats = pokemonDB.pokemons[pokemon.id].baseStats;
    // Incrementar stats según nivel
    Object.keys(baseStats).forEach(stat => {
      pokemon.stats[stat] = Math.floor((2 * baseStats[stat] * pokemon.level) / 100) + 5;
    });
    pokemon.maxHp = pokemon.stats.hp;
    pokemon.currentHp = pokemon.maxHp; // Recupera HP al subir nivel
  }
}
