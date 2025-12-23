// lib/weather-system.js
export const WeatherSystem = {
  weatherTypes: {
    'soleado': {
      nombre: 'Sol intenso',
      emoji: '☀️',
      efecto: {
        'Fuego': { damageMultiplier: 1.5 },
        'Agua': { damageMultiplier: 0.5 },
        'Planta': { special: 'solar_beam_no_charge' }
      },
      turnosRestantes: 5,
      mensaje: '¡El sol es abrasador!'
    },
    
    'lluvia': {
      nombre: 'Lluvia',
      emoji: '🌧️',
      efecto: {
        'Agua': { damageMultiplier: 1.5 },
        'Fuego': { damageMultiplier: 0.5 },
        'Electrico': { special: 'trueno_always_hits' }
      },
      turnosRestantes: 5,
      mensaje: '¡Comenzó a llover!'
    },
    
    'tormenta_arena': {
      nombre: 'Tormenta de arena',
      emoji: '🌪️',
      efecto: {
        'Roca': { special: 'sp_def_boost' },
        'Tierra': { special: 'sp_def_boost' },
        'Acero': { special: 'sp_def_boost' },
        'damage_per_turn': { damage: 1/16 }
      },
      turnosRestantes: 5,
      mensaje: '¡Una tormenta de arena azota el campo!'
    },
    
    'granizo': {
      nombre: 'Granizo',
      emoji: '🌨️',
      efecto: {
        'Hielo': { special: 'no_hail_damage' },
        'damage_per_turn': { damage: 1/16 }
      },
      turnosRestantes: 5,
      mensaje: '¡Cae granizo del cielo!'
    }
  },
  
  currentWeather: null,
  
  // Cambiar clima
  setWeather(weatherType) {
    this.currentWeather = {
      ...this.weatherTypes[weatherType],
      turnoIniciado: 0
    };
    return this.currentWeather;
  },
  
  // Aplicar efectos del clima al daño
  applyWeatherToDamage(move, damage) {
    if (!this.currentWeather) return damage;
    
    const weather = this.currentWeather;
    const moveType = move.tipo.toLowerCase();
    
    // Multiplicador de daño
    if (weather.efecto[moveType] && weather.efecto[moveType].damageMultiplier) {
      damage = Math.floor(damage * weather.efecto[moveType].damageMultiplier);
    }
    
    return damage;
  },
  
  // Aplicar daño por turno del clima
  applyWeatherDamage(pokemon) {
    if (!this.currentWeather) return null;
    
    const weather = this.currentWeather;
    
    // Daño por tormenta arena/granizo
    if (weather.efecto.damage_per_turn) {
      const damage = Math.floor(pokemon.hpMax * weather.efecto.damage_per_turn.damage);
      
      // Verificar inmunidades
      if (weather.nombre === 'Tormenta de arena' && 
          (pokemon.tipos.includes('Roca') || pokemon.tipos.includes('Tierra') || pokemon.tipos.includes('Acero'))) {
        return null;
      }
      
      if (weather.nombre === 'Granizo' && pokemon.tipos.includes('Hielo')) {
        return null;
      }
      
      pokemon.hp = Math.max(0, pokemon.hp - damage);
      return { damage: damage, message: `${weather.nombre} causa ${damage} de daño` };
    }
    
    return null;
  },
  
  // Actualizar clima (reducir turnos)
  updateWeather() {
    if (!this.currentWeather) return null;
    
    this.currentWeather.turnosRestantes--;
    
    if (this.currentWeather.turnosRestantes <= 0) {
      const oldWeather = this.currentWeather.nombre;
      this.currentWeather = null;
      return { ended: true, message: `El ${oldWeather} ha terminado.` };
    }
    
    return { 
      ongoing: true, 
      turnsLeft: this.currentWeather.turnosRestantes,
      weather: this.currentWeather.nombre 
    };
  }
};