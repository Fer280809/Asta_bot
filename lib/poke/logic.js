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
        volador: { lucha: 2, bicho: 2, planta: 2, electrico: 0.5, roca: 0.5, acero: 0.5 },
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

    calculateDamage(attacker, defender, move) {
        const level = attacker.nivel
        const power = move.daño || 40
        const A = attacker.statsActuales?.ataque || (attacker.nivel * 2)
        const D = defender.statsActuales?.defensa || (defender.nivel * 2)

        let baseDamage = ((((2 * level) / 5 + 2) * power * (A / D)) / 50) + 2
        let modifiers = 1

        if (Math.random() < 0.0625) modifiers *= 1.5 // Crítico
        modifiers *= (Math.floor(Math.random() * (100 - 85 + 1)) + 85) / 100 // Variación

        if (attacker.tipos.includes(move.tipo)) modifiers *= 1.5 // STAB

        let typeMod = 1
        defender.tipos.forEach(tDef => {
            const mod = this.typeChart[move.tipo.toLowerCase()]?.[tDef.toLowerCase()]
            if (mod !== undefined) typeMod *= mod
        })
        modifiers *= typeMod

        return {
            total: Math.max(1, Math.floor(baseDamage * modifiers)),
            isCrit: modifiers > 1.5,
            textMod: typeMod > 1 ? '¡Es súper efectivo! 💥' : typeMod < 1 && typeMod > 0 ? 'No es muy efectivo... 💧' : typeMod === 0 ? 'No afecta... 🛡️' : ''
        }
    },

    calculateStats(baseStats, level) {
        return {
            hp: Math.floor((2 * baseStats.hp * level) / 100 + level + 10),
            ataque: Math.floor((2 * baseStats.ataque * level) / 100 + 5),
            defensa: Math.floor((2 * baseStats.defensa * level) / 100 + 5)
        }
    }
}
