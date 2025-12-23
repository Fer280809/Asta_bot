// lib/status-system.js
export const StatusSystem = {
  statusEffects: {
    'quemado': {
      nombre: 'Quemado',
      emoji: '🔥',
      efectoTurno: (pokemon) => {
        const damage = Math.floor(pokemon.hpMax / 16);
        pokemon.hp = Math.max(0, pokemon.hp - damage);
        return { damage: damage, message: `Quemadura causa ${damage} de daño` };
      },
      efectoStats: (pokemon) => {
        // Ataque físico reducido a la mitad
        if (pokemon.stats) {
          pokemon.stats.ataque = Math.floor(pokemon.stats.ataque * 0.5);
        }
      },
      curaCon: ['antiquemar', 'baya_sandia']
    },
    
    'envenenado': {
      nombre: 'Envenenado',
      emoji: '☠️',
      efectoTurno: (pokemon) => {
        const damage = Math.floor(pokemon.hpMax / 8);
        pokemon.hp = Math.max(0, pokemon.hp - damage);
        return { damage: damage, message: `Veneno causa ${damage} de daño` };
      },
      curaCon: ['antidoto', 'baya_ciruela']
    },
    
    'paralizado': {
      nombre: 'Paralizado',
      emoji: '⚡',
      efectoTurno: (pokemon) => {
        // 25% de probabilidad de no poder moverse
        if (Math.random() < 0.25) {
          return { canMove: false, message: '¡Está paralizado y no se puede mover!' };
        }
        // Velocidad reducida
        if (pokemon.stats) {
          pokemon.stats.velocidad = Math.floor(pokemon.stats.velocidad * 0.5);
        }
        return { canMove: true };
      },
      curaCon: ['antiparalizador', 'baya_mora']
    },
    
    'dormido': {
      nombre: 'Dormido',
      emoji: '💤',
      efectoTurno: (pokemon) => {
        // Duerme 1-3 turnos
        if (!pokemon.sleepCounter) {
          pokemon.sleepCounter = Math.floor(Math.random() * 3) + 1;
        }
        
        pokemon.sleepCounter--;
        if (pokemon.sleepCounter > 0) {
          return { canMove: false, message: '¡Está profundamente dormido!' };
        } else {
          pokemon.status = null;
          delete pokemon.sleepCounter;
          return { canMove: true, message: '¡Se despertó!' };
        }
      },
      curaCon: ['despertar', 'baya_lecha']
    },
    
    'congelado': {
      nombre: 'Congelado',
      emoji: '❄️',
      efectoTurno: (pokemon) => {
        // 20% de probabilidad de descongelarse
        if (Math.random() < 0.2) {
          pokemon.status = null;
          return { canMove: true, message: '¡Se descongeló!' };
        }
        return { canMove: false, message: '¡Está congelado!' };
      },
      curaCon: ['antihielo', 'baya_perasi']
    }
  },
  
  // Aplicar efecto de estado al inicio del turno
  applyStatusEffect(pokemon) {
    if (!pokemon.status) return null;
    
    const status = this.statusEffects[pokemon.status];
    if (status && status.efectoTurno) {
      return status.efectoTurno(pokemon);
    }
    
    return null;
  },
  
  // Aplicar modificadores de stats por estado
  applyStatusStats(pokemon) {
    if (!pokemon.status) return;
    
    const status = this.statusEffects[pokemon.status];
    if (status && status.efectoStats) {
      status.efectoStats(pokemon);
    }
  },
  
  // Curar estado con item
  cureStatus(pokemon, itemId) {
    if (!pokemon.status) return { success: false, message: 'No tiene estado alterado' };
    
    const status = this.statusEffects[pokemon.status];
    if (status.curaCon.includes(itemId)) {
      const oldStatus = pokemon.status;
      pokemon.status = null;
      
      // Restaurar stats si es necesario
      if (oldStatus === 'quemado' && pokemon.stats) {
        pokemon.stats.ataque = pokemon.stats.ataque * 2;
      }
      
      return { success: true, message: `¡${pokemon.nombre} fue curado de ${oldStatus}!` };
    }
    
    return { success: false, message: 'Este item no cura ese estado' };
  }
};