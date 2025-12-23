// lib/breeding-system.js
export class BreedingSystem {
    constructor() {
        this.daycare = {
            pokemon1: null,
            pokemon2: null,
            startDate: null,
            steps: 0,
            eggReady: false,
            egg: null
        };
        
        this.compatibilityGroups = {
            'field': [1, 4, 7, 10, 13, 16, 19, 21, 23, 27, 29, 32, 37, 41, 43, 46, 50, 52, 54, 56, 58, 60, 63, 66, 72, 74, 77, 79, 81, 84, 86, 88, 90, 92, 95, 98, 100, 102, 104, 108, 109, 111, 113, 114, 115, 116, 118, 120, 122, 123, 127, 128, 129, 131, 133, 138, 140],
            'monster': [1, 4, 7, 10, 13, 16, 19, 21, 23, 27, 29, 32, 37, 41, 43, 46, 50, 52, 54, 56, 58, 60, 63, 66, 72, 74, 77, 79, 81, 84, 86, 88, 90, 92, 95, 98, 100, 102, 104, 108, 109, 111, 113, 114, 115, 116, 118, 120, 122, 123, 127, 128, 129, 131, 133, 138, 140],
            // ... más grupos de compatibilidad
        };
    }
    
    // Depositar Pokémon en guardería
    depositToDaycare(pokemon, slot = 1) {
        if (slot === 1) {
            this.daycare.pokemon1 = pokemon;
        } else {
            this.daycare.pokemon2 = pokemon;
        }
        
        this.daycare.startDate = new Date();
        this.checkCompatibility();
        
        return { 
            success: true, 
            message: `${pokemon.nombre} depositado en guardería`,
            slot: slot 
        };
    }
    
    // Verificar compatibilidad
    checkCompatibility() {
        if (!this.daycare.pokemon1 || !this.daycare.pokemon2) {
            return { compatible: false, reason: 'Faltan Pokémon' };
        }
        
        const p1 = this.daycare.pokemon1;
        const p2 = this.daycare.pokemon2;
        
        // Misma especie o grupos compatibles
        const compatible = this.arePokemonCompatible(p1, p2);
        
        if (compatible) {
            this.daycare.eggReady = false;
            this.daycare.steps = 0;
            return { compatible: true, message: 'Los Pokémon se llevan bien!' };
        }
        
        return { compatible: false, reason: 'Los Pokémon no son compatibles' };
    }
    
    // Actualizar pasos (llamado cuando el jugador se mueve)
    updateSteps(stepsTaken) {
        if (!this.daycare.pokemon1 || !this.daycare.pokemon2) return;
        
        this.daycare.steps += stepsTaken;
        
        // Huevo listo después de 5000 pasos (por ejemplo)
        if (this.daycare.steps >= 5000 && !this.daycare.eggReady) {
            this.daycare.eggReady = true;
            this.generateEgg();
            return { eggReady: true, message: '¡Hay un huevo en la guardería!' };
        }
        
        return { steps: this.daycare.steps, eggReady: this.daycare.eggReady };
    }
    
    // Generar huevo
    generateEgg() {
        const p1 = this.daycare.pokemon1;
        const p2 = this.daycare.pokemon2;
        
        // Determinar especie del bebé (generalmente la especie de la madre)
        let babySpecies = p1.gender === 'female' ? p1.id : p2.id;
        
        // Movimientos heredados
        const inheritedMoves = this.getInheritedMoves(p1, p2);
        
        this.daycare.egg = {
            species: babySpecies,
            stepsToHatch: 2550, // Pasos para eclosionar
            currentSteps: 0,
            inheritedMoves: inheritedMoves,
            parents: [p1.nombre, p2.nombre],
            createdDate: new Date().toISOString()
        };
        
        return this.daycare.egg;
    }
    
    // Recoger huevo
    collectEgg() {
        if (!this.daycare.eggReady || !this.daycare.egg) {
            return { success: false, error: 'No hay huevo disponible' };
        }
        
        const egg = this.daycare.egg;
        this.daycare.egg = null;
        this.daycare.eggReady = false;
        
        return { 
            success: true, 
            egg: egg,
            message: '¡Recogiste un huevo Pokémon!'
        };
    }
    
    // Eclosionar huevo
    hatchEgg(egg) {
        if (egg.currentSteps < egg.stepsToHatch) {
            return { 
                success: false, 
                stepsNeeded: egg.stepsToHatch - egg.currentSteps 
            };
        }
        
        // Crear Pokémon bebé
        const babyPokemon = {
            id: egg.species,
            nombre: this.getBabyName(egg.species),
            nivel: 1,
            hp: 20,
            hpMax: 20,
            exp: 0,
            movimientos: egg.inheritedMoves.concat(this.getDefaultMoves(egg.species)),
            shiny: this.calculateShinyChance(egg.parents),
            // ... más stats
        };
        
        return {
            success: true,
            pokemon: babyPokemon,
            message: '¡El huevo eclosionó!'
        };
    }
}