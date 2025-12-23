// lib/contest-system.js
export class ContestSystem {
    constructor() {
        this.categories = {
            'belleza': { name: 'Belleza', emoji: '💖', stat: 'specialAttack' },
            'dureza': { name: 'Dureza', emoji: '💪', stat: 'attack' },
            'carisma': { name: 'Carisma', emoji: '✨', stat: 'speed' },
            'astucia': { name: 'Astucia', emoji: '🦊', stat: 'specialDefense' },
            'inteligencia': { name: 'Inteligencia', emoji: '🧠', stat: 'defense' }
        };
        
        this.contestMoves = {
            'Placaje': { category: 'dureza', appeal: 2, jam: 1 },
            'Lanzallamas': { category: 'belleza', appeal: 4, jam: 2 },
            'Hidrobomba': { category: 'belleza', appeal: 4, jam: 3 },
            'Rayo': { category: 'carisma', appeal: 3, jam: 2 },
            'Psíquico': { category: 'inteligencia', appeal: 4, jam: 1 },
            'Terremoto': { category: 'dureza', appeal: 5, jam: 4 },
            // ... más movimientos de concurso
        };
    }
    
    // Iniciar concurso
    startContest(category, participants) {
        return {
            category: this.categories[category],
            participants: participants.map(p => ({
                pokemon: p,
                condition: this.calculateCondition(p, category),
                score: 0,
                hearts: 0,
                turns: 0
            })),
            currentTurn: 0,
            maxTurns: 5,
            status: 'active'
        };
    }
    
    // Turno de concurso
    contestTurn(contest, moves) {
        contest.currentTurn++;
        
        // Cada participante usa un movimiento
        moves.forEach((move, index) => {
            const participant = contest.participants[index];
            const moveData = this.contestMoves[move];
            
            if (!moveData) return;
            
            // Puntuación base
            let appeal = moveData.appeal;
            
            // Bonificación por condición
            if (moveData.category === contest.category.name.toLowerCase()) {
                appeal += Math.floor(participant.condition / 10);
            }
            
            participant.score += appeal;
            participant.hearts += Math.floor(appeal / 2);
            
            // Efecto de jam a otros
            if (moveData.jam > 0) {
                // Reducir puntuación de otros participantes
                contest.participants.forEach((p, i) => {
                    if (i !== index) {
                        p.score = Math.max(0, p.score - moveData.jam);
                    }
                });
            }
        });
        
        // Verificar si terminó
        if (contest.currentTurn >= contest.maxTurns) {
            contest.status = 'finished';
            return this.calculateContestResults(contest);
        }
        
        return contest;
    }
    
    // Calcular condición del Pokémon para concurso
    calculateCondition(pokemon, category) {
        let condition = 0;
        
        // Base: nivel del Pokémon
        condition += pokemon.nivel * 2;
        
        // Bonificación por stats relevantes
        const categoryData = this.categories[category];
        if (pokemon.stats && pokemon.stats[categoryData.stat]) {
            condition += pokemon.stats[categoryData.stat];
        }
        
        // Bonificación por movimientos del tipo correcto
        if (pokemon.movimientos) {
            pokemon.movimientos.forEach(move => {
                if (this.contestMoves[move.nombre]?.category === category) {
                    condition += 10;
                }
            });
        }
        
        return Math.min(255, condition); // Máximo 255 como en los juegos
    }
    
    // Resultados finales
    calculateContestResults(contest) {
        const sorted = [...contest.participants].sort((a, b) => b.score - a.score);
        
        const results = {
            winner: sorted[0],
            rankings: sorted.map((p, i) => ({
                position: i + 1,
                pokemon: p.pokemon.nombre,
                score: p.score,
                hearts: p.hearts
            })),
            ribbons: []
        };
        
        // Dar cinta al ganador
        if (sorted[0].score > 20) {
            results.ribbons.push({
                name: `Cinta ${contest.category.name}`,
                category: contest.category.name,
                winner: sorted[0].pokemon.nombre
            });
        }
        
        return results;
    }
}