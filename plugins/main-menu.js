let handler = async (m, { conn, usedPrefix, command, args }) => {
    if (!global.menuState) global.menuState = {};
    let chatId = m.chat;
    let userId = m.sender;
    let key = `${chatId}_${userId}`;
    
    let menuImage = global.icono || "https://files.catbox.moe/nqvhaq.jpg";
    
    const categorias = [
        "MENU_INICIO",
        "ECONOMY", 
        "DOWNLOAD",
        "GACHA",
        "SOCKETS",
        "UTILITIES",
        "PROFILES",
        "GROUPS",
        "ANIME"
    ];
    
    if (!global.menuState[key] || args[0] === 'reset') {
        global.menuState[key] = {
            pagina: 0,
            mensajeKey: null,
            timestamp: Date.now()
        };
    }
    
    let estado = global.menuState[key];
    let paginaIndex = estado.pagina;
    let categoriaActual = categorias[paginaIndex];
    
    let { titulo, descripcion, contenido } = obtenerContenidoCategoria(categoriaActual, usedPrefix, m);
    
    let txt = `🎮 *${global.botname || 'Asta-Bot'} - MENÚ INTERACTIVO* 🎮

╭─═⊰ 📍 *${titulo}*
│ ${descripcion}
╰─━━━━━━━━━━━━━━━─╯

${contenido}

╭─═⊰ 🔄 *NAVEGACIÓN*
│ 📄 Página ${paginaIndex + 1}/${categorias.length}
│ 🏷️ Categoría: ${categoriaActual}
│ 👤 Usuario: @${userId.split('@')[0]}
╰─━━━━━━━━━━━━━━━─╯

*Usa los botones para navegar*`;

    let botones = [];
    
    if (paginaIndex > 0) {
        botones.push({
            buttonId: `${usedPrefix}menu_prev`,
            buttonText: { displayText: '◀️ Anterior' },
            type: 1
        });
    }
    
    botones.push({
        buttonId: `${usedPrefix}menu_home`,
        buttonText: { displayText: '🏠 Inicio' },
        type: 1
    });
    
    if (paginaIndex < categorias.length - 1) {
        botones.push({
            buttonId: `${usedPrefix}menu_next`,
            buttonText: { displayText: 'Siguiente ▶️' },
            type: 1
        });
    }
    
    const buttonMessage = {
        image: { url: menuImage },
        caption: txt,
        footer: `${global.botname || 'Asta-Bot'} | Página ${paginaIndex + 1}/${categorias.length}`,
        buttons: botones,
        headerType: 1,
        mentions: [userId]
    };
    
    try {
        if (estado.mensajeKey && args[0] !== 'new') {
            await conn.sendMessage(m.chat, {
                ...buttonMessage,
                edit: estado.mensajeKey
            }, { quoted: m });
        } else {
            let mensaje = await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
            if (mensaje && mensaje.key) {
                estado.mensajeKey = mensaje.key;
            } else {
                estado.mensajeKey = null;
            }
            estado.timestamp = Date.now();
        }
    } catch (error) {
        console.error('Error en menú interactivo:', error);
        await conn.sendMessage(m.chat, {
            text: txt,
            mentions: [userId]
        }, { quoted: m });
    }
};

handler.before = async (m, { conn, usedPrefix }) => {
    if (!m.message?.buttonsResponseMessage) return;
    
    let buttonId = m.message.buttonsResponseMessage.selectedButtonId;
    let chatId = m.chat;
    let userId = m.sender;
    let key = `${chatId}_${userId}`;
    
    if (!global.menuState[key]) return;
    
    let estado = global.menuState[key];
    
    if (Date.now() - estado.timestamp > 30 * 60 * 1000) {
        delete global.menuState[key];
        return;
    }
    
    if (buttonId === `${usedPrefix}menu_prev`) {
        estado.pagina = Math.max(0, estado.pagina - 1);
    } else if (buttonId === `${usedPrefix}menu_next`) {
        estado.pagina = Math.min(8, estado.pagina + 1);
    } else if (buttonId === `${usedPrefix}menu_home`) {
        estado.pagina = 0;
    } else {
        return;
    }
    
    estado.timestamp = Date.now();
    await handler(m, { conn, usedPrefix, command: 'menu', args: [] });
    
    return true;
};

function obtenerContenidoCategoria(categoria, usedPrefix, m) {
    let titulo, descripcion, contenido;
    
    switch(categoria) {
        case 'MENU_INICIO':
            titulo = '🌟 BIENVENIDO A ASTA-BOT';
            descripcion = 'Panel principal - Todo en un solo lugar';
            
            const totalUsers = Object.keys(global.db.data.users).length;
            const activeUsers = Object.values(global.db.data.users).filter(u => u.lastseen && (Date.now() - u.lastseen) < 86400000).length;
            const totalGroups = Object.keys(global.db.data.chats).filter(c => c.endsWith('@g.us')).length;
            const totalCommands = Object.values(global.plugins).filter(v => v.help && v.tags).length;
            const uptime = clockString(process.uptime() * 1000);
            
            contenido = `
╔════════════════════════╗
    🚀 *INFORMACIÓN*
╚════════════════════════╝

┌─📊 *ESTADÍSTICAS GLOBALES*
│ ├─👥 *Usuarios:* ${totalUsers.toLocaleString()}
│ ├─🟢 *Activos (24h):* ${activeUsers.toLocaleString()}
│ ├─👥 *Grupos:* ${totalGroups}
│ ├─⚡ *Comandos:* ${totalCommands}
│ └─⏰ *Uptime:* ${uptime}

╔════════════════════════╗
   📁 *CATEGORÍAS DISPONIBLES*
╚════════════════════════╝

┌─💰 *ECONOMÍA* - Sistema de monedas
├─📥 *DOWNLOAD* - Descargas multimedia
├─🎴 *GACHA* - Sistema de coleccionables
├─🔌 *SOCKETS* - Sub-bots y conexiones
├─🛠️ *UTILITIES* - Herramientas varias
├─👤 *PROFILES* - Perfiles de usuario
├─👥 *GROUPS* - Administración grupal
└─🌸 *ANIME* - Contenido otaku

╔════════════════════════╗
   💡 *CONSEJOS RÁPIDOS*
╚════════════════════════╝

┌─✨ Usa los botones para navegar
├─🔍 Escribe comandos directamente
├─📱 Responde a mensajes para interactuar
└─⚡ El bot está optimizado para velocidad
💬 *¡Explora todas las categorías usando los botones!*`;
            break;
            
        case 'ECONOMY':
            titulo = '💰 SISTEMA ECONÓMICO';
            descripcion = 'Gana, invierte y gestiona tu riqueza virtual';
            contenido = 'CONTENIDO ECONOMY AQUÍ';
            break;
            
        case 'DOWNLOAD':
            titulo = '📥 DESCARGAS MULTIMEDIA';
            descripcion = 'Obtén archivos de múltiples plataformas';
            contenido = 'CONTENIDO DOWNLOAD AQUÍ';
            break;
            
        case 'GACHA':
            titulo = '🎴 SISTEMA GACHA';
            descripcion = 'Colecciona, intercambia y gestiona personajes';
            contenido = 'CONTENIDO GACHA AQUÍ';
            break;
            
        case 'SOCKETS':
            titulo = '🔌 SOCKETS Y CONEXIONES';
            descripcion = 'Gestiona sub-bots, conexiones y estado del sistema';
            contenido = 'CONTENIDO SOCKETS AQUÍ';
            break;
            
        case 'UTILITIES':
            titulo = '🛠️ HERRAMIENTAS Y UTILIDADES';
            descripcion = 'Conversores, IA, búsquedas y herramientas varias';
            contenido = 'CONTENIDO UTILITIES AQUÍ';
            break;
            
        case 'PROFILES':
            titulo = '👤 PERFILES DE USUARIO';
            descripcion = 'Gestiona tu perfil, nivel y relaciones sociales';
            contenido = 'CONTENIDO PROFILES AQUÍ';
            break;
            
        case 'GROUPS':
            titulo = '🛡️ MODERACIÓN DE GRUPOS';
            descripcion = 'Panel completo de gestión grupal';
            contenido = 'CONTENIDO GROUPS AQUÍ';
            break;
            
        case 'ANIME':
            titulo = '🎌 COMANDOS DE ANIME';
            descripcion = 'Reacciones, waifus y contenido otaku';
            contenido = 'CONTENIDO ANIME AQUÍ';
            break;
            
        default:
            titulo = '🏠 INICIO';
            descripcion = 'Menú principal';
            contenido = 'Categoría no encontrada';
    }
    
    return { titulo, descripcion, contenido };
}

handler.help = ['menu2']
handler.tags = ['main']
handler.command = ['menu2', 'menú2', 'help2']

export default handler

function clockString(ms) {
    let seconds = Math.floor((ms / 1000) % 60)
    let minutes = Math.floor((ms / (1000 * 60)) % 60)
    let hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
    return `${hours}h ${minutes}m ${seconds}s`
}
