// ============================================
// plugins/rpg/missions.js
// ============================================
import { missionSystem } from '../../lib/rpg/mission-system.js';

const handler = async (m, { conn, usedPrefix, command, text }) => {
    // Verificar si economía está activada
    if (m.isGroup && (!global.db.data.chats[m.chat] || !global.db.data.chats[m.chat].economy)) {
        return m.reply(`🚫 *Economía desactivada*\n\nUn *administrador* puede activarla con:\n» *${usedPrefix}economy on*`);
    }

    const user = global.db.data.users[m.sender];

    // Inicializar usuario si no existe
    if (!user) {
        global.db.data.users[m.sender] = {
            coin: 1000,
            bank: 0,
            health: 100,
            level: 1,
            xp: 0,
            minedToday: 0,
            choppedToday: 0,
            fishedToday: 0,
            craftedToday: 0,
            soldToday: 0,
            workedToday: 0,
            adventuresToday: 0,
            crimesToday: 0,
            dungeonsToday: 0,
            inventory: {
                resources: {},
                missions: {
                    daily: { completed: [] },
                    weekly: { completed: [] },
                    monthly: { completed: [] }
                }
            }
        };
    }

    // Asegurar campos básicos
    user.coin = user.coin || 1000;
    user.bank = user.bank || 0;
    user.health = user.health || 100;
    user.level = user.level || 1;
    user.xp = user.xp || 0;

    // Asegurar contadores diarios
    user.minedToday = user.minedToday || 0;
    user.choppedToday = user.choppedToday || 0;
    user.fishedToday = user.fishedToday || 0;
    user.craftedToday = user.craftedToday || 0;
    user.soldToday = user.soldToday || 0;
    user.workedToday = user.workedToday || 0;
    user.adventuresToday = user.adventuresToday || 0;
    user.crimesToday = user.crimesToday || 0;
    user.dungeonsToday = user.dungeonsToday || 0;

    // Asegurar inventario y misiones
    if (!user.inventory) user.inventory = {};
    if (!user.inventory.resources) user.inventory.resources = {};
    if (!user.inventory.missions) {
        user.inventory.missions = {
            daily: { completed: [] },
            weekly: { completed: [] },
            monthly: { completed: [] }
        };
    }

    // Argumentos
    const args = text ? text.trim().split(/ +/) : [];
    const action = args[0]?.toLowerCase() || 'view';

    // --- VER MISIONES ---
    if (action === 'view' || action === 'ver') {
        const dailyMissions = missionSystem.getMissions('daily');
        const weeklyMissions = missionSystem.getMissions('weekly');
        const monthlyMissions = missionSystem.getMissions('monthly');

        // Tiempos de reinicio
        const now = Date.now();
        const dailyReset = missionSystem.lastReset.daily + (24 * 60 * 60 * 1000);
        const weeklyReset = missionSystem.lastReset.weekly + (7 * 24 * 60 * 60 * 1000);
        const monthlyReset = missionSystem.lastReset.monthly + (30 * 24 * 60 * 60 * 1000);

        const formatTime = (timestamp) => {
            const diff = timestamp - now;
            if (diff <= 0) return '¡Ahora!';
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            return `${hours}h ${minutes}m`;
        };

        let text = `╭━━━━━━━━━━━━━━━━━━━━━━━╮
┃     🎯 *MISIONES RPG*     🎯
┃━━━━━━━━━━━━━━━━━━━━━━━┃
👤 *Usuario:* ${await conn.getName(m.sender)}
💰 *Monedas:* ¥${user.coin.toLocaleString()}
🎚️ *Nivel:* ${user.level}\n\n`;

        text += `⏰ *Reinicio en:*\n`;
        text += `├ Diarias: ${formatTime(dailyReset)}\n`;
        text += `├ Semanales: ${formatTime(weeklyReset)}\n`;
        text += `└ Mensuales: ${formatTime(monthlyReset)}\n\n`;

        // MISIONES DIARIAS
        text += `📅 *MISIONES DIARIAS:*\n\n`;

        if (dailyMissions.length === 0) {
            text += `🔄 Generando misiones...\n\n`;
        } else {
            dailyMissions.forEach((mission, index) => {
                const isCompleted = missionSystem.isMissionCompleted(user, mission);
                const alreadyClaimed = user.inventory.missions.daily.completed.includes(mission.id);
                const progress = missionSystem.getUserProgress(user, mission);
                const total = mission.requirement.amount;
                const percentage = Math.min(Math.floor((progress / total) * 100), 100);

                // Barra de progreso
                const barLength = 10;
                const filled = Math.floor((percentage / 100) * barLength);
                const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);

                text += `${alreadyClaimed ? '✅' : isCompleted ? '🎯' : '📌'} *${index + 1}. ${mission.name}*\n`;
                text += `   ${mission.description}\n`;
                text += `   [${bar}] ${progress}/${total} (${percentage}%)\n`;
                text += `   🎁 Recompensa: ¥${mission.reward.coin.toLocaleString()}`;

                if (mission.reward.resource) {
                    text += ` + ${mission.reward.amount}x ${mission.reward.resource}`;
                }
                if (mission.reward.exp) {
                    text += ` + ${mission.reward.exp} EXP`;
                }
                if (mission.reward.health) {
                    text += ` + ${mission.reward.health} ❤️`;
                }
                if (mission.reward.special) {
                    text += ` + ${mission.reward.special}`;
                }

                if (isCompleted && !alreadyClaimed) {
                    text += `\n   💡 *${usedPrefix}mission claim daily ${index + 1}*\n`;
                }
                text += `\n`;
            });
        }

        // MISIONES SEMANALES
        if (weeklyMissions.length > 0) {
            text += `🗓️ *MISIONES SEMANALES:*\n\n`;
            weeklyMissions.forEach((mission, index) => {
                const alreadyClaimed = user.inventory.missions.weekly.completed.includes(mission.id);
                
                text += `${alreadyClaimed ? '✅' : '📌'} *${mission.name}*\n`;
                text += `   ${mission.description}\n`;
                text += `   🎁 Recompensa: ¥${mission.reward.coin.toLocaleString()}`;
                
                if (mission.reward.special) {
                    text += ` + ${mission.reward.special}`;
                }
                text += `\n\n`;
            });
        }

        // MISIONES MENSUALES
        if (monthlyMissions.length > 0) {
            text += `📊 *MISIONES MENSUALES:*\n\n`;
            monthlyMissions.forEach((mission, index) => {
                const alreadyClaimed = user.inventory.missions.monthly.completed.includes(mission.id);
                
                text += `${alreadyClaimed ? '✅' : '📌'} *${mission.name}*\n`;
                text += `   ${mission.description}\n`;
                text += `   🎁 Recompensa: ¥${mission.reward.coin.toLocaleString()}`;
                
                if (mission.reward.special) {
                    text += ` + ${mission.reward.special}`;
                }
                text += `\n\n`;
            });
        }

        text += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n`;
        text += `📌 *Usa:* ${usedPrefix}mission claim [daily/weekly/monthly] [número]`;

        await conn.reply(m.chat, text, m);
        return;
    }

    // --- RECLAMAR MISIÓN ---
    if (action === 'claim' || action === 'reclamar') {
        const type = args[1]?.toLowerCase() || 'daily';
        const number = parseInt(args[2]);

        if (isNaN(number) || number < 1) {
            return m.reply(`❌ Número inválido.\nUso: *${usedPrefix}mission claim [daily/weekly/monthly] [número]*\nEjemplo: *${usedPrefix}mission claim daily 1*`);
        }

        // Obtener misiones
        let missions, completedList;
        
        switch(type) {
            case 'daily':
                missions = missionSystem.getMissions('daily');
                completedList = user.inventory.missions.daily.completed;
                break;
            case 'weekly':
                missions = missionSystem.getMissions('weekly');
                completedList = user.inventory.missions.weekly.completed;
                break;
            case 'monthly':
                missions = missionSystem.getMissions('monthly');
                completedList = user.inventory.missions.monthly.completed;
                break;
            default:
                return m.reply(`❌ Tipo inválido. Usa: daily, weekly o monthly`);
        }

        if (number > missions.length) {
            return m.reply(`❌ Solo hay ${missions.length} misiones ${type}.`);
        }

        const missionIndex = number - 1;
        const mission = missions[missionIndex];

        // Verificar si ya reclamó
        if (completedList.includes(mission.id)) {
            return m.reply(`⚠️ Ya has reclamado esta misión ${type}.`);
        }

        // Verificar si está completada
        if (!missionSystem.isMissionCompleted(user, mission)) {
            const progress = missionSystem.getUserProgress(user, mission);
            const needed = mission.requirement.amount - progress;
            
            let progressText = '';
            switch(mission.requirement.type) {
                case 'mine':
                    progressText = `⛏️ Minado: ${progress}/${mission.requirement.amount} (faltan ${needed})`;
                    break;
                case 'chop':
                    progressText = `🪓 Talado: ${progress}/${mission.requirement.amount} (faltan ${needed})`;
                    break;
                case 'fish':
                    progressText = `🎣 Pesca: ${progress}/${mission.requirement.amount} (faltan ${needed})`;
                    break;
                case 'work':
                    progressText = `💼 Trabajo: ${progress}/${mission.requirement.amount} (faltan ${needed})`;
                    break;
                case 'bank':
                    progressText = `🏦 Banco: ¥${progress.toLocaleString()}/¥${mission.requirement.amount.toLocaleString()}`;
                    break;
                default:
                    progressText = `Progreso: ${progress}/${mission.requirement.amount}`;
            }

            return m.reply(`❌ *Aún no completas la misión!*\n${progressText}`);
        }

        // OTORGAR RECOMPENSAS
        completedList.push(mission.id);
        user.coin += mission.reward.coin;
        user.xp += mission.reward.exp || 0;
        user.health = Math.min(100, user.health + (mission.reward.health || 0));

        // Recurso especial
        if (mission.reward.resource) {
            user.inventory.resources[mission.reward.resource] = 
                (user.inventory.resources[mission.reward.resource] || 0) + (mission.reward.amount || 1);
        }

        // Mensaje de éxito
        let rewardText = `🎉 *¡MISIÓN ${type.toUpperCase()} COMPLETADA!*\n\n`;
        rewardText += `✅ ${mission.name}\n`;
        rewardText += `💰 +¥${mission.reward.coin.toLocaleString()}\n`;
        
        if (mission.reward.exp) {
            rewardText += `⭐ +${mission.reward.exp} EXP\n`;
        }
        if (mission.reward.health) {
            rewardText += `❤️ +${mission.reward.health} Salud\n`;
        }
        if (mission.reward.resource) {
            rewardText += `📦 +${mission.reward.amount}x ${mission.reward.resource}\n`;
        }
        if (mission.reward.special) {
            rewardText += `✨ ${mission.reward.special.replace('_', ' ')}\n`;
        }

        await m.reply(rewardText);
        await global.db.write();
        return;
    }

    // --- PROGRESO ---
    if (action === 'progress' || action === 'progreso') {
        let text = `╭━━━━━━━━━━━━━━━━━━━━━━━╮
┃      📊 *PROGRESO*      📊
┃━━━━━━━━━━━━━━━━━━━━━━━┃\n`;

        text += `📈 *ESTADÍSTICAS DIARIAS:*\n\n`;
        text += `⛏️  Minado: ${user.minedToday || 0}\n`;
        text += `🪓  Talado: ${user.choppedToday || 0}\n`;
        text += `🎣  Pesca: ${user.fishedToday || 0}\n`;
        text += `⚒️  Crafteo: ${user.craftedToday || 0}\n`;
        text += `💰  Ventas: ${user.soldToday || 0}\n`;
        text += `💼  Trabajos: ${user.workedToday || 0}\n`;
        text += `⚔️  Aventuras: ${user.adventuresToday || 0}\n`;
        text += `🦹  Crímenes: ${user.crimesToday || 0}\n`;
        text += `🏰  Mazmorras: ${user.dungeonsToday || 0}\n`;
        text += `🏦  Banco: ¥${user.bank.toLocaleString()}\n\n`;

        text += `🏆 *LOGROS:*\n`;
        text += `✅ Misiones diarias: ${user.inventory.missions.daily.completed.length}\n`;
        text += `✅ Misiones semanales: ${user.inventory.missions.weekly.completed.length}\n`;
        text += `✅ Misiones mensuales: ${user.inventory.missions.monthly.completed.length}\n`;
        text += `💰 Total monedas: ¥${user.coin.toLocaleString()}\n`;
        text += `❤️  Salud: ${user.health}/100\n`;
        text += `🎚️  Nivel: ${user.level}\n`;
        text += `⭐  XP: ${user.xp}\n\n`;

        text += `╰━━━━━━━━━━━━━━━━━━━━━━━╯`;

        await conn.reply(m.chat, text, m);
        return;
    }

    // --- HELP ---
    if (action === 'help' || action === 'ayuda') {
        await conn.reply(m.chat, 
            `📘 *AYUDA - SISTEMA DE MISIONES*\n\n` +
            `🔀 *Características:*\n` +
            `• Misiones diferentes cada día/semana/mes\n` +
            `• Recompensas aleatorias\n` +
            `• Progreso automático\n` +
            `• Sistema de recompensas\n\n` +
            
            `🎯 *Comandos:*\n` +
            `• *${usedPrefix}mission* - Ver todas las misiones\n` +
            `• *${usedPrefix}mission claim daily 1* - Reclamar misión diaria 1\n` +
            `• *${usedPrefix}mission progress* - Ver tu progreso\n` +
            `• *${usedPrefix}mission help* - Esta ayuda\n\n` +
            
            `💰 *Tipos de Misiones:*\n` +
            `• *Diarias:* Se renuevan cada 24 horas\n` +
            `• *Semanales:* Se renuevan cada 7 días\n` +
            `• *Mensuales:* Se renuevan cada 30 días\n\n` +
            
            `🏆 *Cómo completar misiones:*\n` +
            `Usa los comandos de economía para avanzar:\n` +
            `- *${usedPrefix}work* para trabajos\n` +
            `- *${usedPrefix}mine* para minería\n` +
            `- *${usedPrefix}chop* para tala\n` +
            `- *${usedPrefix}fish* para pesca\n` +
            `- *${usedPrefix}adventure* para aventuras\n` +
            `- *${usedPrefix}dungeon* para mazmorras\n` +
            `- *${usedPrefix}crime* para crímenes\n\n` +
            
            `🎁 *Recompensas:*\n` +
            `• Monedas (¥) 💰\n` +
            `• Experiencia (EXP) ⭐\n` +
            `• Salud (❤️)\n` +
            `• Recursos especiales 📦\n` +
            `• Ítems únicos ✨`
        , m);
        return;
    }

    // --- RESET (solo owner) ---
    if (action === 'reset') {
        const senderNumber = m.sender.split('@')[0];
        if (!global.owner || !global.owner.includes(senderNumber)) {
            return m.reply(`❌ Solo para owners.`);
        }

        const type = args[1]?.toLowerCase() || 'daily';

        switch(type) {
            case 'daily':
                missionSystem.dailyMissions = missionSystem.generateRandomMissions('daily', 5);
                missionSystem.lastReset.daily = Date.now();
                
                // Resetear contadores diarios de todos los usuarios
                Object.values(global.db.data.users).forEach(u => {
                    u.minedToday = 0;
                    u.choppedToday = 0;
                    u.fishedToday = 0;
                    u.craftedToday = 0;
                    u.soldToday = 0;
                    u.workedToday = 0;
                    u.adventuresToday = 0;
                    u.crimesToday = 0;
                    u.dungeonsToday = 0;
                    if (u.inventory?.missions?.daily) {
                        u.inventory.missions.daily.completed = [];
                    }
                });
                break;

            case 'weekly':
                missionSystem.weeklyMissions = missionSystem.generateRandomMissions('weekly', 3);
                missionSystem.lastReset.weekly = Date.now();
                Object.values(global.db.data.users).forEach(u => {
                    if (u.inventory?.missions?.weekly) {
                        u.inventory.missions.weekly.completed = [];
                    }
                });
                break;

            case 'monthly':
                missionSystem.monthlyMissions = missionSystem.generateRandomMissions('monthly', 2);
                missionSystem.lastReset.monthly = Date.now();
                Object.values(global.db.data.users).forEach(u => {
                    if (u.inventory?.missions?.monthly) {
                        u.inventory.missions.monthly.completed = [];
                    }
                });
                break;

            case 'all':
                missionSystem.dailyMissions = missionSystem.generateRandomMissions('daily', 5);
                missionSystem.weeklyMissions = missionSystem.generateRandomMissions('weekly', 3);
                missionSystem.monthlyMissions = missionSystem.generateRandomMissions('monthly', 2);
                missionSystem.lastReset = { 
                    daily: Date.now(), 
                    weekly: Date.now(), 
                    monthly: Date.now() 
                };
                break;

            default:
                return m.reply(`❌ Tipo inválido. Usa: daily, weekly, monthly o all`);
        }

        await m.reply(`✅ Misiones ${type} reiniciadas. Nuevas misiones generadas.`);
        await global.db.write();
        return;
    }

    // Por defecto, mostrar misiones
    return handler(m, { conn, usedPrefix, command, text: 'view' });
};

handler.help = ['mission', 'misiones'];
handler.tags = ['rpg'];
handler.command = ['mission', 'missions', 'misiones', 'quest', 'quests'];
handler.group = true;

export default handler;