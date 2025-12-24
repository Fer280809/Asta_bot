export const pokemonDB = {
  // Base de datos de 151 Pokémon Kanto
  pokemons: {
    1: {
      id: 1,
      name: "Bulbasaur",
      types: ["Planta", "Veneno"],
      baseStats: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
      moves: {
        1: "Placaje",
        3: "Gruñido",
        7: "Latigo Cepa",
        9: "Drenadoras",
        13: "Polvo Veneno",
        15: "Somnífero"
      },
      evolution: { level: 16, to: 2 },
      catchRate: 45,
      expYield: 64
    },
    // ... 150 Pokémon más
  },
  
  // Movimientos con tipo, poder y precisión
  moves: {
    "Placaje": { type: "Normal", power: 40, accuracy: 100, pp: 35 },
    "Lanzallamas": { type: "Fuego", power: 90, accuracy: 100, pp: 15 },
    "Hidrobomba": { type: "Agua", power: 110, accuracy: 80, pp: 5 },
    // ... más movimientos
  },
  
  // Tipos y efectividades
  typeChart: {
    "Fuego": { super: ["Planta", "Hielo", "Bicho"], weak: ["Agua", "Roca", "Fuego"] },
    "Agua": { super: ["Fuego", "Roca", "Tierra"], weak: ["Planta", "Eléctrico"] },
    // ... todos los tipos
  }
}
