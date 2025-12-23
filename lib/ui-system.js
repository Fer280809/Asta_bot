// lib/ui-system.js
export const UISystem = {
  // Generar barra de vida visual
  generateHPBar(currentHP, maxHP, width = 20) {
    const percentage = (currentHP / maxHP) * 100;
    const filled = Math.floor((percentage / 100) * width);
    const empty = width - filled;
    
    let color = '🟩'; // Verde > 50%
    if (percentage <= 50) color = '🟨'; // Amarillo 21-50%
    if (percentage <= 20) color = '🟥'; // Rojo <= 20%
    
    return color.repeat(filled) + '⬜'.repeat(empty) + ` ${currentHP}/${maxHP}`;
  },
  
  // Generar menú de batalla
  generateBattleMenu() {
    return `⚔️ *MENÚ DE BATALLA*\n` +
           `1. 🥊 Atacar\n` +
           `2. 🎒 Objeto\n` +
           `3. 🔄 Cambiar Pokémon\n` +
           `4. 🏃 Huir\n` +
           `\nElige una opción (1-4):`;
  },
  
  // Mostrar Pokémon en equipo
  displayTeam(team) {
    let display = `🎒 *TU EQUIPO* (${team.length}/6)\n\n`;
    
    team.forEach((pokemon, index) => {
      const hpBar = this.generateHPBar(pokemon.hp, pokemon.hpMax, 10);
      display += `${index + 1}. ${pokemon.nombre} Nv.${pokemon.nivel}\n`;
      display += `   ${hpBar}\n`;
      display += `   Movimientos: ${pokemon.movimientos.map(m => m.nombre).join(', ')}\n\n`;
    });
    
    return display;
  },
  
  // Generar mapa visual ASCII
  generateMap(currentLocation) {
    const map = `
    🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲
    🌲🏘️══🌳══🏘️══🌊══🏙️🌲
    🌲│  │  │  │  │  │  │🌲
    🌲🏔️══🌋══🏞️══❄️══⛰️🌲
    🌲│  │  │  │  │  │  │🌲
    🌲🏝️══🌴══🏰══🌉══🏆🌲
    🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲
    
    🏘️ = Pueblo/Ciudad
    🌳 = Hierba (Pokémon salvaje)
    🌋 = Gimnasio
    🏆 = Liga Pokémon
    ⭐ = TÚ (${currentLocation})
    `;
    
    return map;
  }
};