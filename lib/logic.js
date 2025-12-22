export const PokemonLogic = {
    // Tabla de tipos completa para cálculos de daño
    typeChart: {
        fuego: { planta: 2, bicho: 2, hielo: 2, acero: 2, fuego: 0.5, agua: 0.5, roca: 0.5, dragon: 0.5 },
        agua: { fuego: 2, tierra: 2, roca: 2, agua: 0.5, planta: 0.5, dragon: 0.5 },
        planta: { agua: 2, tierra: 2, roca: 2, fuego: 0.5, planta: 0.5, veneno: 0.5, volador: 0.5, bicho: 0.5, dragon: 0.5, acero: 0.5 },
        electrico: { agua: 2, volador: 2, electrico: 0.5, planta: 0.5, dragon: 0.5, tierra: 0 },
        hielo: { planta: 2, tierra: 2, volador: 2, dragon: 2, fuego: 0.5, agua: 0.5, hielo: 0.5, acero: 0.5 },
        lucha: { normal: 2, hielo: 2, roca: 2, acero: 2, siniestro: 2, veneno: 0.5, volador: 0.5, bicho: 0.5, psiquico: 0.5, hada: 0.5, fantasma: 0 },
        veneno: { planta: 2, hada: 2, veneno: 0.5, tierra: 0.5, roca: 0.5, fantasma: 0.5, acero: 0 },
        tierra: { fuego: 2, electrico: 2, veneno: 2, roca: 2, acero: 2, planta: 0.5, bicho: 0.5, volador: 0 },
        volador: { planta: 2, lucha: 2, bicho: 2, electrico: 0.5, roca: 0.5, acero: 0.5 },
        psiquico: { lucha: 2, veneno: 2, psiquico: 0.5, acero: 0.5, siniestro: 0 },
        bicho: { planta: 2, psiquico: 2, siniestro: 2, fuego: 0.5, lucha: 0.5, veneno: 0.5, volador: 0.5, fantasma: 0.5, acero: 0.5, hada: 0.5 },
        roca: { fuego: 2, hielo: 2, volador: 2, bicho: 2, lucha: 0.5, tierra: 0.5, acero: 0.5 },
        fantasma: { psiquico: 2, fantasma: 2, siniestro: 0.5, normal: 0 },
        dragon: { dragon: 2, acero: 0.5, hada: 0 },
        siniestro: { psiquico: 2, fantasma: 2, lucha: 0.5, siniestro: 0.5, hada: 0.5 },
        acero: { hielo: 2, roca: 2, hada: 2, fuego: 0.5, agua: 0.5, electrico: 0.5, acero: 0.5 },
        hada: { lucha: 2, dragon: 2, siniestro: 2, fuego: 0.5, veneno: 0.5, acero: 0.5 },
        normal: { roca: 0.5, acero: 0.5, fantasma: 0 }
    },

    // Calcula la experiencia necesaria para el siguiente nivel (Curva media)
    getExpRequired(level) {
        return Math.floor(0.8 * Math.pow(level, 3));
    },

    // Lógica de daño corregida para usar 'statsBase' o 'stats'
    calculateDamage(attacker, defender, move) {
        const level = attacker.nivel;
        const power = move.poder || move.daño || 40;
        
        // Buscamos en statsBase (pokedex) o stats (instancia del pokemon)
        const A = attacker.stats?.ataque || attacker.statsBase?.ataque || (level * 2);
        const D = defender.stats?.defensa || defender.statsBase?.defensa || (level * 2);

        let baseDamage = ((((2 * level) / 5 + 2) * power * (A / D)) / 50) + 2;
        let modifiers = 1;

        // Crítico (6.25% de probabilidad)
        if (Math.random() < 0.0625) modifiers *= 1.5;

        // Variación aleatoria entre 0.85 y 1.00
        modifiers *= (Math.floor(Math.random() * (100 - 85 + 1)) + 85) / 100;

        // STAB (Mismo tipo de ataque que el Pokémon)
        if (attacker.tipos && attacker.tipos.includes(move.tipo)) modifiers *= 1.5;

        // Multiplicador de tipos
        let typeMod = 1;
        if (defender.tipos) {
            defender.tipos.forEach(tDef => {
                const mod = this.typeChart[move.tipo.toLowerCase()]?.[tDef.toLowerCase()];
                if (mod !== undefined) typeMod *= mod;
            });
        }
        modifiers *= typeMod;

        const totalDamage = Math.max(1, Math.floor(baseDamage * modifiers));
        
        let effectiveText = '';
        if (typeMod > 1) effectiveText = '¡Es súper efectivo! 💥';
        else if (typeMod < 1 && typeMod > 0) effectiveText = 'No es muy efectivo... 🛡️';
        else if (typeMod === 0) effectiveText = 'No afecta al oponente... 🚫';

        return {
            total: totalDamage,
            isCrit: modifiers > 1.5,
            typeMod: typeMod,
            text: effectiveText
        };
    },

    // Verifica si el Pokémon sube de nivel y aumenta sus stats
    checkLevelUp(pokemon) {
        let leveledUp = false;
        while (pokemon.exp >= this.getExpRequired(pokemon.nivel + 1)) {
            pokemon.nivel++;
            leveledUp = true;
            // Aumento de stats lineal (puedes hacerlo más complejo si quieres)
            pokemon.hpMax += 5;
            pokemon.hp = pokemon.hpMax; // Curar al subir nivel
            if (pokemon.stats) {
                pokemon.stats.ataque += 2;
                pokemon.stats.defensa += 2;
                pokemon.stats.velocidad += 2;
            }
        }
        return leveledUp;
    }
};
