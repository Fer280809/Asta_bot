// ============================================
// plugins/rpg/inventory.js
// ============================================
import { RESOURCE_SYSTEM } from '../../lib/rpg/resource-system.js';

const handler = async (m, { conn, usedPrefix, args }) => {
    if (!global.db.data.chats[m.chat].economy && m.isGroup) {
        return m.reply(`🚫 *Economía desactivada*\n\nUn *administrador* puede activarla con:\n» *${usedPrefix}economy on*`);
    }

    const user = global.db.data.users[m.sender];
    
    // Inicializar inventario si no existe
    if (!user.inventory) {
        user.inventory = {
            resources: {},
            tools: {
                pickaxe: 'basic',
                axe: 'basic',
                fishingRod: 'basic'
            },
            durability: {
                pickaxe: 100,
                axe: 100,
                fishingRod: 100
            },
            crafted: {},
            missions: {
                daily: { streak: 0, lastCompleted: 0, completed: [] },
                weekly: { streak: 0, lastCompleted: 0 },
                monthly: { streak: 0, lastCompleted: 0 }
            }
        };
    }

    const view = args[0]?.toLowerCase() || 'all';
    const page = parseInt(args[1]) || 1;
    const itemsPerPage = 10;

    let text = `╭━━━━━━━━━━━━━━━━━━━━━╮
┃   🎒 *INVENTARIO* 🎒
┃━━━━━━━━━━━━━━━━━━━━━┃
👤 *Usuario:* ${await conn.getName(m.sender)}\n`;

    // Ver herramientas
    if (view === 'tools' || view === 'all') {
        text += `\n🛠️ *HERRAMIENTAS*:\n`;
        const tools = user.inventory.tools;
        const durability = user.inventory.durability || {};
        
        for (const [tool, type] of Object.entries(tools)) {
            const toolData = RESOURCE_SYSTEM.TOOLS[tool === 'pickaxe' ? 'PICKAXES' : 
                                   tool === 'axe' ? 'AXES' : 'FISHING_RODS'][type];
            const dur = durability[tool] || 100;
            const emoji = tool === 'pickaxe' ? '⛏️' : tool === 'axe' ? '🪓' : '🎣';
            text += `▸ ${emoji} ${toolData.name} (${dur}%)\n`;
        }
    }

    // Ver recursos
    if (view === 'resources' || view === 'all') {
        const resources = user.inventory.resources || {};
        const resourceEntries = Object.entries(resources);
        
        if (resourceEntries.length > 0) {
            text += `\n📦 *RECURSOS*:\n`;
            
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const paginated = resourceEntries.slice(start, end);
            
            for (const [id, amount] of paginated) {
                // Buscar en todos los tipos de recursos
                for (const category of Object.values(RESOURCE_SYSTEM.RESOURCES)) {
                    if (category[id]) {
                        text += `▸ ${category[id].emoji} ${category[id].name}: ${amount}\n`;
                        break;
                    }
                }
            }
            
            const totalPages = Math.ceil(resourceEntries.length / itemsPerPage);
            if (totalPages > 1) {
                text += `\n📄 Página ${page}/${totalPages}`;
            }
        } else {
            text += `\n📦 *RECURSOS*:\n▸ No tienes recursos aún\n`;
        }
    }

    // Ver objetos crafteados
    if (view === 'crafted' || view === 'all') {
        const crafted = user.inventory.crafted || {};
        const craftedEntries = Object.entries(crafted);
        
        if (craftedEntries.length > 0) {
            text += `\n🔧 *OBJETOS CRAFTEADOS*:\n`;
            for (const [id, amount] of craftedEntries) {
                // Buscar en items crafteables
                for (const category of Object.values(RESOURCE_SYSTEM.CRAFT_ITEMS)) {
                    if (category[id]) {
                        text += `▸ ${category[id].emoji} ${category[id].name}: ${amount}\n`;
                        break;
                    }
                }
            }
        }
    }

    text += `\n╰━━━━━━━━━━━━━━━━━━━━━╯\n`;
    text += `📌 *Uso:* ${usedPrefix}inventory [tools/resources/crafted/all] [página]`;

    await conn.reply(m.chat, text, m);
};

handler.help = ['inventory', 'inv', 'inventario'];
handler.tags = ['rpg'];
handler.command = ['inventory', 'inv', 'inventario'];
handler.group = true;

export default handler;