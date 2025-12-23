// lib/mission-system.js
export class MissionSystem {
    constructor() {
        this.dailyMissions = [
            {
                id: 'daily_catch',
                title: 'Cazador del Día',
                description: 'Captura 3 Pokémon salvajes',
                objective: { type: 'catch', target: 3 },
                reward: { money: 500, exp: 100, items: { pokeball: 2 } },
                expires: 'daily'
            },
            {
                id: 'daily_battle',
                title: 'Guerrero Incansable',
                description: 'Gana 5 batallas',
                objective: { type: 'battle_win', target: 5 },
                reward: { money: 800, exp: 150, items: { pocion: 3 } },
                expires: 'daily'
            },
            {
                id: 'daily_explore',
                title: 'Explorador',
                description: 'Visita 3 ubicaciones diferentes',
                objective: { type: 'visit', target: 3 },
                reward: { money: 300, exp: 80, items: { mapa: 1 } },
                expires: 'daily'
            }
        ];
        
        this.storyMissions = [
            {
                id: 'story_1',
                title: 'Primeros Pasos',
                description: 'Habla con el Profesor Cerezo en Albavera',
                objective: { type: 'talk', npc: 'Profesor Cerezo' },
                reward: { money: 1000, exp: 200, pokemon: 'starter' },
                nextMission: 'story_2',
                required: []
            },
            {
                id: 'story_2',
                title: 'Rival Inesperado',
                description: 'Derrota a Joven Chano en la Ruta 1',
                objective: { type: 'defeat', trainer: 'Joven Chano' },
                reward: { money: 1500, exp: 300, items: { superball: 1 } },
                nextMission: 'story_3',
                required: ['story_1']
            },
            // ... más misiones de historia
        ];
        
        this.eventMissions = {
            'halloween': [
                {
                    id: 'event_spooky',
                    title: 'Noche de Halloween',
                    description: 'Captura 10 Pokémon de tipo Fantasma',
                    objective: { type: 'catch_type', pokemonType: 'Fantasma', target: 10 },
                    reward: { money: 5000, exp: 1000, items: { masterball: 1 }, special: 'pumpkin_costume' },
                    event: 'halloween',
                    duration: '2024-10-25 to 2024-11-01'
                }
            ],
            'christmas': [
                {
                    id: 'event_santa',
                    title: 'Ayuda a Santa Pokémon',
                    description: 'Reparte 5 regalos a otros entrenadores',
                    objective: { type: 'gift', target: 5 },
                    reward: { money: 3000, exp: 800, items: { cherishball: 1 }, special: 'santa_hat' },
                    event: 'christmas',
                    duration: '2024-12-20 to 2024-12-27'
                }
            ]
        };
    }
    
    // Asignar misiones diarias a jugador
    assignDailyMissions(player) {
        const today = new Date().toDateString();
        
        if (player.dailyMissionsDate !== today) {
            player.dailyMissions = this.dailyMissions.map(mission => ({
                ...mission,
                progress: 0,
                completed: false,
                claimed: false
            }));
            
            player.dailyMissionsDate = today;
            return { newMissions: true, count: this.dailyMissions.length };
        }
        
        return { newMissions: false };
    }
    
    // Actualizar progreso de misión
    updateMissionProgress(player, missionType, data) {
        let updated = false;
        
        // Revisar misiones diarias
        player.dailyMissions?.forEach(mission => {
            if (!mission.completed && mission.objective.type === missionType) {
                mission.progress += data.amount || 1;
                
                if (mission.progress >= mission.objective.target) {
                    mission.completed = true;
                    updated = true;
                }
            }
        });
        
        // Revisar misiones de historia
        player.storyMissions?.forEach(mission => {
            if (!mission.completed && mission.objective.type === missionType) {
                if (this.checkObjective(mission.objective, data)) {
                    mission.completed = true;
                    updated = true;
                }
            }
        });
        
        return { updated: updated };
    }
    
    // Reclamar recompensa de misión
    claimMissionReward(player, missionId) {
        // Buscar misión en todas las categorías
        let mission = null;
        let category = null;
        
        // Buscar en diarias
        if (player.dailyMissions) {
            const daily = player.dailyMissions.find(m => m.id === missionId);
            if (daily) {
                mission = daily;
                category = 'daily';
            }
        }
        
        // Buscar en historia
        if (!mission && player.storyMissions) {
            const story = player.storyMissions.find(m => m.id === missionId);
            if (story) {
                mission = story;
                category = 'story';
            }
        }
        
        if (!mission) {
            return { success: false, error: 'Misión no encontrada' };
        }
        
        if (!mission.completed) {
            return { success: false, error: 'Misión no completada' };
        }
        
        if (mission.claimed) {
            return { success: false, error: 'Recompensa ya reclamada' };
        }
        
        // Dar recompensa
        mission.claimed = true;
        player.money += mission.reward.money || 0;
        player.experience += mission.reward.exp || 0;
        
        // Agregar items al inventario
        if (mission.reward.items) {
            Object.entries(mission.reward.items).forEach(([itemId, quantity]) => {
                player.inventory[itemId] = (player.inventory[itemId] || 0) + quantity;
            });
        }
        
        // Pokémon especial como recompensa
        if (mission.reward.pokemon) {
            // Lógica para dar Pokémon
        }
        
        // Item especial
        if (mission.reward.special) {
            player.specialItems = player.specialItems || [];
            player.specialItems.push(mission.reward.special);
        }
        
        return {
            success: true,
            reward: mission.reward,
            mission: mission.title,
            category: category
        };
    }
}