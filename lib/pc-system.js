// lib/pc-system.js
export class PCSystem {
    constructor() {
        this.boxes = {
            'Caja 1': { name: 'Iniciales', limit: 30, pokemon: [] },
            'Caja 2': { name: 'Legendarios', limit: 30, pokemon: [] },
            'Caja 3': { name: 'Competitivo', limit: 30, pokemon: [] },
            'Caja 4': { name: 'Favoritos', limit: 30, pokemon: [] },
            'Caja 5': { name: 'Para intercambiar', limit: 30, pokemon: [] },
            'Caja 6': { name: 'Eventos', limit: 30, pokemon: [] },
            'Caja 7': { name: 'Shinies', limit: 30, pokemon: [] },
            'Caja 8': { name: 'Crianza', limit: 30, pokemon: [] },
            'Caja 9': { name: 'Por tipo', limit: 30, pokemon: [] },
            'Caja 10': { name: 'Reserva', limit: 30, pokemon: [] }
        };
    }
    
    // Depositar Pokémon en PC
    depositPokemon(player, pokemonIndex, boxName = 'Caja 1') {
        if (pokemonIndex < 0 || pokemonIndex >= player.equipo.length) {
            return { success: false, error: 'Índice inválido' };
        }
        
        const pokemon = player.equipo.splice(pokemonIndex, 1)[0];
        const box = this.boxes[boxName];
        
        if (box.pokemon.length >= box.limit) {
            return { success: false, error: `La ${boxName} está llena` };
        }
        
        box.pokemon.push({
            ...pokemon,
            box: boxName,
            depositedDate: new Date().toISOString()
        });
        
        return { 
            success: true, 
            message: `${pokemon.nombre} depositado en ${boxName}`,
            boxCount: box.pokemon.length
        };
    }
    
    // Retirar Pokémon del PC
    withdrawPokemon(player, boxName, pcIndex) {
        const box = this.boxes[boxName];
        
        if (pcIndex < 0 || pcIndex >= box.pokemon.length) {
            return { success: false, error: 'Índice inválido' };
        }
        
        if (player.equipo.length >= 6) {
            return { success: false, error: 'Equipo lleno (máx. 6 Pokémon)' };
        }
        
        const pokemon = box.pokemon.splice(pcIndex, 1)[0];
        player.equipo.push(pokemon);
        
        return { 
            success: true, 
            message: `${pokemon.nombre} retirado de ${boxName}`,
            teamCount: player.equipo.length
        };
    }
    
    // Organizar PC por criterios
    organizeBox(boxName, criteria = 'nivel') {
        const box = this.boxes[boxName];
        
        switch(criteria) {
            case 'nivel':
                box.pokemon.sort((a, b) => b.nivel - a.nivel);
                break;
            case 'tipo':
                box.pokemon.sort((a, b) => a.tipos[0].localeCompare(b.tipos[0]));
                break;
            case 'nombre':
                box.pokemon.sort((a, b) => a.nombre.localeCompare(b.nombre));
                break;
            case 'fecha':
                box.pokemon.sort((a, b) => new Date(b.depositedDate) - new Date(a.depositedDate));
                break;
        }
        
        return { success: true, criteria: criteria };
    }
    
    // Buscar Pokémon en PC
    searchPokemon(searchTerm) {
        const results = [];
        
        for (const [boxName, box] of Object.entries(this.boxes)) {
            box.pokemon.forEach((pokemon, index) => {
                if (pokemon.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    pokemon.tipos.some(t => t.toLowerCase().includes(searchTerm)) ||
                    pokemon.id.toString() === searchTerm) {
                    
                    results.push({
                        box: boxName,
                        index: index,
                        pokemon: pokemon
                    });
                }
            });
        }
        
        return results;
    }
    
    // Estadísticas del PC
    getPCStats() {
        const stats = {
            totalPokemon: 0,
            byBox: {},
            byType: {},
            shinyCount: 0,
            legendaryCount: 0
        };
        
        for (const [boxName, box] of Object.entries(this.boxes)) {
            stats.byBox[boxName] = box.pokemon.length;
            stats.totalPokemon += box.pokemon.length;
            
            box.pokemon.forEach(pokemon => {
                // Contar por tipo
                pokemon.tipos.forEach(type => {
                    stats.byType[type] = (stats.byType[type] || 0) + 1;
                });
                
                // Contar shinies
                if (pokemon.shiny) stats.shinyCount++;
                
                // Contar legendarios (IDs altos)
                if (parseInt(pokemon.id) >= 150) stats.legendaryCount++;
            });
        }
        
        return stats;
    }
}