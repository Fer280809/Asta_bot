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
    2: { // Ivysaur
      id: 2,
      name: "Ivysaur",
      types: ["Planta", "Veneno"],
      baseStats: { hp: 60, atk: 62, def: 63, spa: 80, spd: 80, spe: 60 },
      moves: {
        1: "Placaje", 3: "Gruñido", 7: "Látigo Cepa", 9: "Drenadoras",
        13: "Polvo Veneno", 15: "Somnífero", 20: "Hoja Afilada"
      },
      evolution: { level: 32, to: 3 },
      catchRate: 45,
      expYield: 142
    },
    
    3: { // Venusaur
      id: 3,
      name: "Venusaur",
      types: ["Planta", "Veneno"],
      baseStats: { hp: 80, atk: 82, def: 83, spa: 100, spd: 100, spe: 80 },
      moves: {
        1: "Placaje", 3: "Gruñido", 7: "Látigo Cepa", 9: "Drenadoras",
        13: "Polvo Veneno", 15: "Somnífero", 20: "Hoja Afilada", 30: "Rayo Solar"
      },
      evolution: null,
      catchRate: 45,
      expYield: 236
    },
    
    4: { // Charmander - ¡INICIAL FUEGO!
      id: 4,
      name: "Charmander",
      types: ["Fuego"],
      baseStats: { hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65 },
      moves: {
        1: "Placaje", 3: "Gruñido", 7: "Ascuas", 9: "Furia Dragon",
        13: "Cuchillada", 15: "Foco Energía", 20: "Lanzallamas"
      },
      evolution: { level: 16, to: 5 },
      catchRate: 45,
      expYield: 62
    },
    
    5: { // Charmeleon
      id: 5,
      name: "Charmeleon",
      types: ["Fuego"],
      baseStats: { hp: 58, atk: 64, def: 58, spa: 80, spd: 65, spe: 80 },
      moves: {
        1: "Ascuas", 3: "Gruñido", 7: "Furia Dragon", 9: "Humo",
        13: "Cuchillada", 15: "Foco Energía", 20: "Lanzallamas", 25: "Garra Dragón"
      },
      evolution: { level: 36, to: 6 },
      catchRate: 45,
      expYield: 142
    },
    
    6: { // Charizard
      id: 6,
      name: "Charizard",
      types: ["Fuego", "Volador"],
      baseStats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 },
      moves: {
        1: "Lanzallamas", 3: "Gruñido", 7: "Furia Dragon", 9: "Humo",
        13: "Cuchillada", 15: "Foco Energía", 20: "Tajo Aéreo", 30: "Infierno"
      },
      evolution: null,
      catchRate: 45,
      expYield: 240
    },
    
    7: { // Squirtle - ¡INICIAL AGUA!
      id: 7,
      name: "Squirtle",
      types: ["Agua"],
      baseStats: { hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43 },
      moves: {
        1: "Placaje", 3: "Gruñido", 7: "Burbuja", 9: "Pistola Agua",
        13: "Refugio", 15: "Giro Rápido", 20: "Hidropulso"
      },
      evolution: { level: 16, to: 8 },
      catchRate: 45,
      expYield: 63
    },
    
    8: { // Wartortle
      id: 8,
      name: "Wartortle",
      types: ["Agua"],
      baseStats: { hp: 59, atk: 63, def: 80, spa: 65, spd: 80, spe: 58 },
      moves: {
        1: "Burbuja", 3: "Gruñido", 7: "Pistola Agua", 9: "Refugio",
        13: "Giro Rápido", 15: "Mordisco", 20: "Hidropulso", 25: "Acua Cola"
      },
      evolution: { level: 36, to: 9 },
      catchRate: 45,
      expYield: 142
    },
    
    9: { // Blastoise
      id: 9,
      name: "Blastoise",
      types: ["Agua"],
      baseStats: { hp: 79, atk: 83, def: 100, spa: 85, spd: 105, spe: 78 },
      moves: {
        1: "Hidropulso", 3: "Gruñido", 7: "Refugio", 9: "Giro Rápido",
        13: "Mordisco", 15: "Acua Cola", 20: "Hidrobomba", 30: "Cabezazo"
      },
      evolution: null,
      catchRate: 45,
      expYield: 239
    },
    
    10: { // Caterpie
      id: 10,
      name: "Caterpie",
      types: ["Bicho"],
      baseStats: { hp: 45, atk: 30, def: 35, spa: 20, spd: 20, spe: 45 },
      moves: {
        1: "Placaje", 1: "Drenadoras"
      },
      evolution: { level: 7, to: 11 },
      catchRate: 255,
      expYield: 39
    },
    
    11: { // Metapod
      id: 11,
      name: "Metapod",
      types: ["Bicho"],
      baseStats: { hp: 50, atk: 20, def: 55, spa: 25, spd: 25, spe: 30 },
      moves: {
        1: "Placaje", 7: "Drenadoras", 7: "Fortaleza"
      },
      evolution: { level: 10, to: 12 },
      catchRate: 120,
      expYield: 72
    },
    
    12: { // Butterfree
      id: 12,
      name: "Butterfree",
      types: ["Bicho", "Volador"],
      baseStats: { hp: 60, atk: 45, def: 50, spa: 90, spd: 80, spe: 70 },
      moves: {
        1: "Confusión", 10: "Polvo Veneno", 13: "Somnífero", 14: "Supersónico",
        15: "Viento Plata", 18: "Psicorrayo", 23: "Reflejo", 28: "Tornado"
      },
      evolution: null,
      catchRate: 45,
      expYield: 178
    },
    
    16: { // Pidgey
      id: 16,
      name: "Pidgey",
      types: ["Normal", "Volador"],
      baseStats: { hp: 40, atk: 45, def: 40, spa: 35, spd: 35, spe: 56 },
      moves: {
        1: "Placaje", 5: "Arenilla", 9: "Tornado", 13: "Ataque Rápido",
        17: "Remolino", 21: "Viento Afilado", 25: "Tajo Aéreo"
      },
      evolution: { level: 18, to: 17 },
      catchRate: 255,
      expYield: 50
    },
    
    17: { // Pidgeotto
      id: 17,
      name: "Pidgeotto",
      types: ["Normal", "Volador"],
      baseStats: { hp: 63, atk: 60, def: 55, spa: 50, spd: 50, spe: 71 },
      moves: {
        1: "Tornado", 5: "Arenilla", 9: "Ataque Rápido", 13: "Remolino",
        17: "Viento Afilado", 22: "Tajo Aéreo", 27: "Vendaval"
      },
      evolution: { level: 36, to: 18 },
      catchRate: 120,
      expYield: 122
    },
    
    18: { // Pidgeot
      id: 18,
      name: "Pidgeot",
      types: ["Normal", "Volador"],
      baseStats: { hp: 83, atk: 80, def: 75, spa: 70, spd: 70, spe: 101 },
      moves: {
        1: "Tornado", 5: "Arenilla", 9: "Ataque Rápido", 13: "Remolino",
        17: "Viento Afilado", 22: "Tajo Aéreo", 27: "Vendaval", 32: "Ataque Ala"
      },
      evolution: null,
      catchRate: 45,
      expYield: 216
    },
    
    19: { // Rattata
      id: 19,
      name: "Rattata",
      types: ["Normal"],
      baseStats: { hp: 30, atk: 56, def: 35, spa: 25, spd: 35, spe: 72 },
      moves: {
        1: "Placaje", 4: "Ataque Rápido", 7: "Persecución", 10: "Mordisco",
        13: "Hipercolmillo", 16: "Foco Energía", 19: "Triturar"
      },
      evolution: { level: 20, to: 20 },
      catchRate: 255,
      expYield: 51
    },
    
    20: { // Raticate
      id: 20,
      name: "Raticate",
      types: ["Normal"],
      baseStats: { hp: 55, atk: 81, def: 60, spa: 50, spd: 70, spe: 97 },
      moves: {
        1: "Persecución", 4: "Ataque Rápido", 7: "Mordisco", 10: "Hipercolmillo",
        13: "Foco Energía", 16: "Triturar", 20: "Superdiente", 24: "Golpe"
      },
      evolution: null,
      catchRate: 127,
      expYield: 145
    },
    
    25: { // Pikachu
      id: 25,
      name: "Pikachu",
      types: ["Eléctrico"],
      baseStats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 },
      moves: {
        1: "Impactrueno", 5: "Gruñido", 7: "Ataque Rápido", 10: "Onda Trueno",
        13: "Doble Equipo", 18: "Bola Voltio", 21: "Velocidad", 23: "Chispazo"
      },
      evolution: { item: "thunderstone", to: 26 },
      catchRate: 190,
      expYield: 82
    },
    
    26: { // Raichu
      id: 26,
      name: "Raichu",
      types: ["Eléctrico"],
      baseStats: { hp: 60, atk: 90, def: 55, spa: 90, spd: 80, spe: 110 },
      moves: {
        1: "Impactrueno", 1: "Gruñido", 1: "Ataque Rápido", 1: "Onda Trueno",
        1: "Bola Voltio", 1: "Chispazo", 30: "Trueno", 40: "Ataque Voltio"
      },
      evolution: null,
      catchRate: 75,
      expYield: 218
    },
    
    74: { // Geodude - Para el gimnasio de Roca
      id: 74,
      name: "Geodude",
      types: ["Roca", "Tierra"],
      baseStats: { hp: 40, atk: 80, def: 100, spa: 30, spd: 30, spe: 20 },
      moves: {
        1: "Placaje", 4: "Defensa Férrea", 8: "Lanzarrocas", 11: "Terremoto",
        15: "Golpe Roca", 18: "Magnitud", 22: "Avivar", 25: "Tumba Rocas"
      },
      evolution: { level: 25, to: 75 },
      catchRate: 255,
      expYield: 60
    },
    
    95: { // Onix - Para el gimnasio de Roca
      id: 95,
      name: "Onix",
      types: ["Roca", "Tierra"],
      baseStats: { hp: 35, atk: 45, def: 160, spa: 30, spd: 45, spe: 70 },
      moves: {
        1: "Lanzarrocas", 1: "Atadura", 10: "Tumba Rocas", 14: "Furia",
        18: "Terremoto", 22: "Excavar", 25: "Velocidad", 30: "Roca Afilada"
      },
      evolution: { trade: true, with: "metalcoat", to: 208 },
      catchRate: 45,
      expYield: 77
    }
  },
  
  moves: {
    "Placaje": { type: "Normal", power: 40, accuracy: 100, pp: 35 },
    "Lanzallamas": { type: "Fuego", power: 90, accuracy: 100, pp: 15 },
    "Hidrobomba": { type: "Agua", power: 110, accuracy: 80, pp: 5 },
    "Rayo Solar": { type: "Planta", power: 120, accuracy: 100, pp: 10 },
    "Impactrueno": { type: "Eléctrico", power: 40, accuracy: 100, pp: 30 },
    "Trueno": { type: "Eléctrico", power: 110, accuracy: 70, pp: 10 },
    "Terremoto": { type: "Tierra", power: 100, accuracy: 100, pp: 10 },
    "Psíquico": { type: "Psíquico", power: 90, accuracy: 100, pp: 10 },
    "Lanzarrocas": { type: "Roca", power: 50, accuracy: 90, pp: 15 },
    "Bola Sombra": { type: "Fantasma", power: 80, accuracy: 100, pp: 15 },
    "Ataque Ala": { type: "Volador", power: 60, accuracy: 100, pp: 35 },
    "Garra Dragón": { type: "Dragón", power: 80, accuracy: 100, pp: 15 },
    "Pistola Agua": { type: "Agua", power: 40, accuracy: 100, pp: 25 },
    "Ascuas": { type: "Fuego", power: 40, accuracy: 100, pp: 25 },
    "Burbuja": { type: "Agua", power: 40, accuracy: 100, pp: 30 },
    "Rayo Confuso": { type: "Psíquico", power: 50, accuracy: 100, pp: 25, effect: "confusion" },
    "Somnífero": { type: "Psíquico", power: 0, accuracy: 75, pp: 15, effect: "sleep" },
    "Polvo Veneno": { type: "Veneno", power: 0, accuracy: 75, pp: 35, effect: "poison" },
    "Gruñido": { type: "Normal", power: 0, accuracy: 100, pp: 40, effect: "atk_down" },
    "Ataque Rápido": { type: "Normal", power: 40, accuracy: 100, pp: 30, priority: 1 },
    "Mordisco": { type: "Siniestro", power: 60, accuracy: 100, pp: 25 },
    "Giro Rápido": { type: "Normal", power: 20, accuracy: 100, pp: 40 },
    "Refugio": { type: "Normal", power: 0, accuracy: 100, pp: 40, effect: "def_up" }
  },
  
  typeChart: {
    "Normal": { super: [], weak: ["Lucha"], immune: ["Fantasma"] },
    "Fuego": { super: ["Planta", "Hielo", "Bicho", "Acero"], weak: ["Agua", "Roca", "Fuego", "Dragón"] },
    "Agua": { super: ["Fuego", "Roca", "Tierra"], weak: ["Planta", "Eléctrico", "Agua"] },
    "Eléctrico": { super: ["Agua", "Volador"], weak: ["Tierra", "Eléctrico", "Dragón"] },
    "Planta": { super: ["Agua", "Roca", "Tierra"], weak: ["Fuego", "Hielo", "Veneno", "Volador", "Bicho"] },
    "Hielo": { super: ["Planta", "Tierra", "Volador", "Dragón"], weak: ["Fuego", "Lucha", "Roca", "Acero", "Hielo"] },
    "Lucha": { super: ["Normal", "Hielo", "Roca", "Siniestro", "Acero"], weak: ["Psíquico", "Volador", "Hada"] },
    "Veneno": { super: ["Planta", "Hada"], weak: ["Tierra", "Psíquico", "Roca", "Fantasma"], immune: ["Acero"] },
    "Tierra": { super: ["Fuego", "Eléctrico", "Veneno", "Roca", "Acero"], weak: ["Agua", "Planta", "Hielo"], immune: ["Eléctrico"] },
    "Volador": { super: ["Planta", "Lucha", "Bicho"], weak: ["Eléctrico", "Hielo", "Roca"], immune: ["Tierra"] },
    "Psíquico": { super: ["Lucha", "Veneno"], weak: ["Bicho", "Siniestro", "Fantasma"] },
    "Bicho": { super: ["Planta", "Psíquico", "Siniestro"], weak: ["Fuego", "Volador", "Roca"] },
    "Roca": { super: ["Fuego", "Hielo", "Volador", "Bicho"], weak: ["Agua", "Planta", "Lucha", "Tierra", "Acero"] },
    "Fantasma": { super: ["Psíquico", "Fantasma"], weak: ["Fantasma", "Siniestro"], immune: ["Normal", "Lucha"] },
    "Dragón": { super: ["Dragón"], weak: ["Hielo", "Dragón", "Hada"] },
    "Siniestro": { super: ["Psíquico", "Fantasma"], weak: ["Lucha", "Bicho", "Hada"] },
    "Acero": { super: ["Hielo", "Roca", "Hada"], weak: ["Fuego", "Lucha", "Tierra"], immune: ["Veneno"] },
    "Hada": { super: ["Lucha", "Dragón", "Siniestro"], weak: ["Veneno", "Acero"] }
  }
}
