let handler = async (m, { conn, usedPrefix, command, args }) => {
    // Estado de paginación por chat/usuario
    if (!global.menuState) global.menuState = {};
    let chatId = m.chat;
    let userId = m.sender;
    let key = `${chatId}_${userId}`;
    
    // Imagen del bot desde settings.js
    let menuImage = global.icono || "https://files.catbox.moe/nqvhaq.jpg";
    
    // Categorías en orden
    const categorias = [
        "MENU_INICIO",
        "ECONOMY", 
        "DOWNLOAD",
        "GACHA",
        "SOCKETS",
        "UTILITIES",
        "PROFILES",
        "GROUPS",
        "ANIME",
        "NSFW"
    ];
    
    // Inicializar/actualizar estado
    if (!global.menuState[key] || args[0] === 'reset') {
        global.menuState[key] = {
            pagina: 0,
            mensajeId: null,
            timestamp: Date.now()
        };
    }
    
    let estado = global.menuState[key];
    let paginaIndex = estado.pagina;
    let categoriaActual = categorias[paginaIndex];
    
    // Obtener contenido según categoría
    let { titulo, descripcion, contenido } = obtenerContenidoCategoria(categoriaActual, usedPrefix, m);
    
    // Texto completo del mensaje
    let txt = `🎮 *${botname} - MENÚ INTERACTIVO* 🎮

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

    // Botones de navegación
    let botones = [];
    
    // Solo botón "Anterior" si no es la primera página
    if (paginaIndex > 0) {
        botones.push({
            buttonId: `${usedPrefix}menu_prev`,
            buttonText: { displayText: '◀️ Anterior' },
            type: 1
        });
    }
    
    // Botón "Inicio" siempre disponible
    botones.push({
        buttonId: `${usedPrefix}menu_home`,
        buttonText: { displayText: '🏠 Inicio' },
        type: 1
    });
    
    // Solo botón "Siguiente" si no es la última página
    if (paginaIndex < categorias.length - 1) {
        botones.push({
            buttonId: `${usedPrefix}menu_next`,
            buttonText: { displayText: 'Siguiente ▶️' },
            type: 1
        });
    }
    
    // Si es NSFW, agregar botón de confirmación especial
    if (categoriaActual === 'NSFW') {
        botones.push({
            buttonId: `${usedPrefix}menu_nsfwconfirm`,
            buttonText: { displayText: '⚠️ Confirmar NSFW' },
            type: 1
        });
    }
    
    const buttonMessage = {
        image: { url: menuImage },
        caption: txt,
        footer: `${global.botname} | Página ${paginaIndex + 1}/${categorias.length}`,
        buttons: botones,
        headerType: 1,
        mentions: [userId]
    };
    
    try {
        // Si ya existe un mensaje, EDITARLO
        if (estado.mensajeId && args[0] !== 'new') {
            await conn.sendMessage(m.chat, {
                ...buttonMessage,
                edit: estado.mensajeId
            }, { quoted: m });
        } else {
            // Enviar nuevo mensaje
            let mensaje = await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
            estado.mensajeId = mensaje.key.id;
            estado.timestamp = Date.now();
        }
    } catch (error) {
        console.error('Error en menú interactivo:', error);
        // Fallback a mensaje simple
        await conn.sendMessage(m.chat, {
            text: txt,
            mentions: [userId]
        }, { quoted: m });
    }
};

// Manejador para botones
handler.before = async (m, { conn, usedPrefix }) => {
    if (!m.message?.buttonsResponseMessage) return;
    
    let buttonId = m.message.buttonsResponseMessage.selectedButtonId;
    let chatId = m.chat;
    let userId = m.sender;
    let key = `${chatId}_${userId}`;
    
    if (!global.menuState[key]) return;
    
    let estado = global.menuState[key];
    
    // Limpiar estado viejo (más de 30 minutos)
    if (Date.now() - estado.timestamp > 30 * 60 * 1000) {
        delete global.menuState[key];
        return;
    }
    
    // Procesar acción del botón
    if (buttonId === `${usedPrefix}menu_prev`) {
        estado.pagina = Math.max(0, estado.pagina - 1);
    } else if (buttonId === `${usedPrefix}menu_next`) {
        estado.pagina = Math.min(9, estado.pagina + 1);
    } else if (buttonId === `${usedPrefix}menu_home`) {
        estado.pagina = 0;
    } else if (buttonId === `${usedPrefix}menu_nsfwconfirm`) {
        // Lógica especial para NSFW
        await conn.sendMessage(m.chat, {
            text: '⚠️ *CONTENIDO NSFW*\n\nEsta sección contiene contenido para adultos.\nUsa el comando directamente si deseas acceder.'
        }, { quoted: m });
        return;
    } else {
        return; // No es un botón del menú
    }
    
    // Actualizar el menú
    estado.timestamp = Date.now();
    await handler(m, { conn, usedPrefix, command: 'menu', args: [] });
    
    return true; // Evitar procesamiento adicional
};

// Función para obtener contenido por categoría (ESQUELETO - tú llenas los comandos)
function obtenerContenidoCategoria(categoria, usedPrefix, m) {
    let titulo, descripcion, contenido;
    
    switch(categoria) {
        case 'MENU_INICIO':
            titulo = '🏠 INICIO';
            descripcion = 'Menú principal del bot';
            contenido = `¡Bienvenido al menú interactivo!

🔹 *Comandos básicos:*
• ${usedPrefix}help - Ayuda general
• ${usedPrefix}infobot - Información del bot
• ${usedPrefix}owner - Contactar owner

📊 *Estadísticas:*
• Usuarios: ${Object.keys(global.db.data.users).length}
• Activo: ${clockString(process.uptime() * 1000)}
• Comandos: ${Object.values(global.plugins).filter(v => v.help && v.tags).length}

*Usa los botones para explorar categorías*`;
            break;
            
        case 'ECONOMY':
            titulo = '💰 ECONOMÍA';
            descripcion = 'Sistema de monedas, banca, trabajos';
            contenido = `*COMANDOS DE ECONOMÍA*

💵 *Monedas:*
• ${usedPrefix}balance
• ${usedPrefix}daily
• ${usedPrefix}work

🏦 *Banca:*
• ${usedPrefix}deposit
• ${usedPrefix}withdraw
• ${usedPrefix}transfer

🎰 *Casino:*
• ${usedPrefix}slot
• ${usedPrefix}dado

*Añade aquí tus comandos específicos...*`;
            break;
            
        case 'DOWNLOAD':
            titulo = '📥 DESCARGAS';
            descripcion = 'Descargar de YouTube, Instagram, etc';
            contenido = `*COMANDOS DE DESCARGA*

🎵 *Música:*
• ${usedPrefix}play
• ${usedPrefix}ytmp3

🎥 *Video:*
• ${usedPrefix}ytmp4
• ${usedPrefix}igdl

📷 *Imágenes:*
• ${usedPrefix}pinterest

*Añade aquí tus comandos específicos...*`;
            break;
            
        case 'GACHA':
            titulo = '🎴 GACHA';
            descripcion = 'Sistema de cartas, coleccionables';
            contenido = `*COMANDOS GACHA*

🃏 *Cartas:*
• ${usedPrefix}gacha
• ${usedPrefix}inventory

🏆 *Colección:*
• ${usedPrefix}shop
• ${usedPrefix}buy

*Añade aquí tus comandos específicos...*`;
            break;
            
        case 'SOCKETS':
            titulo = '🔌 SOCKETS';
            descripcion = 'Sub-bots, conexiones, jadibot';
            contenido = `*COMANDOS DE SOCKETS*

🤖 *Sub-bots:*
• ${usedPrefix}serbot
• ${usedPrefix}jadibot

🔗 *Conexiones:*
• ${usedPrefix}listjadibot

*Añade aquí tus comandos específicos...*`;
            break;
            
        case 'UTILITIES':
            titulo = '🛠️ UTILIDADES';
            descripcion = 'Herramientas, conversores, búsqueda';
            contenido = `*COMANDOS UTILITARIOS*

🔍 *Búsqueda:*
• ${usedPrefix}google
• ${usedPrefix}wiki

🔄 *Conversores:*
• ${usedPrefix}sticker
• ${usedPrefix}toimg

📊 *Herramientas:*
• ${usedPrefix}calc

*Añade aquí tus comandos específicos...*`;
            break;
            
        case 'PROFILES':
            titulo = '👤 PERFILES';
            descripcion = 'Perfil de usuario, nivel, experiencia';
            contenido = `*COMANDOS DE PERFIL*

📱 *Perfil:*
• ${usedPrefix}profile
• ${usedPrefix}level

🏅 *Logros:*
• ${usedPrefix}rank
• ${usedPrefix}top

*Añade aquí tus comandos específicos...*`;
            break;
            
        case 'GROUPS':
    titulo = '🛡️ MODERACIÓN DE GRUPOS';
    descripcion = 'Panel completo de gestión grupal';
    
    contenido = `
╔════════════════════════╗
   🏰 *ADMINISTRACIÓN*
╚════════════════════════╝

┌─🔸 *${usedPrefix}kick* @usuario
│  ╰─ Expulsar del grupo
├─🔸 *${usedPrefix}add* 521123456789
│  ╰─ Invitar por número
├─🔸 *${usedPrefix}admins*
│  ╰─ Listar administradores
├─🔸 *${usedPrefix}link*
│  ╰─ Obtener enlace
├─🔹 *${usedPrefix}promote* @usuario
│  ╰─ Hacer administrador
├─🔹 *${usedPrefix}demote* @usuario
│  ╰─ Quitar administrador
├─🔹 *${usedPrefix}warn* @usuario
│  ╰─ Advertir usuario
├─🔹 *${usedPrefix}revoke*
│  ╰─ Renovar enlace
├─🔸 *${usedPrefix}fantasmas*
│  ╰─ Detectar inactivos
├─🔸 *${usedPrefix}hidetag* [texto]
│  ╰─ Mencionar silenciosamente
├─🔸 *${usedPrefix}group* open/close
│  ╰─ Abrir/cerrar chat
└─🔸 *${usedPrefix}delete*
   ╰─ Borrar mensajes

╔════════════════════════╗
   ⚙️ *CONFIGURACIÓN*
╚════════════════════════╝

┌─🔹 *${usedPrefix}infogrupo*
│  ╰─ Info detallada
├─🔹 *${usedPrefix}setwelcome*
│  ╰─ Configurar bienvenida
├─🔹 *${usedPrefix}setbye*
│  ╰─ Configurar despedida
├─🔹 *${usedPrefix}bot* on/off
│  ╰─ Control del bot
├─🔸 *${usedPrefix}groupname*
│  ╰─ Cambiar nombre
├─🔸 *${usedPrefix}groupdesc*
│  ╰─ Cambiar descripción
└─🔸 *${usedPrefix}groupimg*
   ╰─ Cambiar foto
   
*🎯 *Requisitos por color:*
• 🔷 Solo admin 
• 🔶 Admin + bot admin
• 🔹 Funciona en cualquier grupo`;
    break;
            
        case 'ANIME':
    titulo = '🎌 COMANDOS DE ANIME';
    descripcion = 'Reacciones, waifus y contenido otaku';
    
    contenido = `
╭─❖ *🎭 REACCIONES ANIME* ❖─╮
├─🌸 *${usedPrefix}angry* @usuario
│  ╰─ Enojarse con alguien
├─🌸 *${usedPrefix}bath* @usuario
│  ╰─ Bañarse o ducharse
├─🌸 *${usedPrefix}bite* @usuario
│  ╰─ Morder a alguien
├─🌸 *${usedPrefix}bleh* @usuario
│  ╰─ Sacar la lengua
├─🌸 *${usedPrefix}blush* @usuario
│  ╰─ Sonrojarse o avergonzarse
├─🌸 *${usedPrefix}bored* @usuario
│  ╰─ Mostrar aburrimiento
├─🌸 *${usedPrefix}clap* @usuario
│  ╰─ Aplaudir o felicitar
├─🌸 *${usedPrefix}coffee* @usuario
│  ╰─ Tomar un café
├─🌸 *${usedPrefix}cry* @usuario
│  ╰─ Llorar por algo
├─🌸 *${usedPrefix}cuddle* @usuario
│  ╰─ Acurrucarse o arrullar
├─🌸 *${usedPrefix}dance* @usuario
│  ╰─ Bailar o danzar
├─🌸 *${usedPrefix}dramatic* @usuario
│  ╰─ Dramatizar una situación
├─🌸 *${usedPrefix}drunk* @usuario
│  ╰─ Actuar como borracho
├─🌸 *${usedPrefix}eat* @usuario
│  ╰─ Comer algo delicioso
├─🌸 *${usedPrefix}facepalm* @usuario
│  ╰─ Palmada en la cara
├─🌸 *${usedPrefix}happy* @usuario
│  ╰─ Mostrar felicidad
├─🌸 *${usedPrefix}hug* @usuario
│  ╰─ Dar un abrazo
├─🌸 *${usedPrefix}impregnate* @usuario
│  ╰─ Embarazar a alguien
├─🌸 *${usedPrefix}kill* @usuario
│  ╰─ Matar o atacar
├─🌸 *${usedPrefix}kiss* @usuario
│  ╰─ Dar un beso
├─🌸 *${usedPrefix}kisscheek* @usuario
│  ╰─ Beso en la mejilla
├─🌸 *${usedPrefix}laugh* @usuario
│  ╰─ Reírse a carcajadas
├─🌸 *${usedPrefix}lick* @usuario
│  ╰─ Lamer a alguien
├─🌸 *${usedPrefix}love* @usuario
│  ╰─ Enamorarse o amar
├─🌸 *${usedPrefix}pat* @usuario
│  ╰─ Acariciar suavemente
├─🌸 *${usedPrefix}poke* @usuario
│  ╰─ Picar o tocar
├─🌸 *${usedPrefix}pout* @usuario
│  ╰─ Hacer pucheros
├─🌸 *${usedPrefix}punch* @usuario
│  ╰─ Dar un puñetazo
├─🌸 *${usedPrefix}run* @usuario
│  ╰─ Correr o huir
├─🌸 *${usedPrefix}sad* @usuario
│  ╰─ Mostrar tristeza
├─🌸 *${usedPrefix}scared* @usuario
│  ╰─ Asustarse o temer
├─🌸 *${usedPrefix}seduce* @usuario
│  ╰─ Seducir a alguien
├─🌸 *${usedPrefix}shy* @usuario
│  ╰─ Mostrar timidez
├─🌸 *${usedPrefix}slap* @usuario
│  ╰─ Dar una bofetada
├─🌸 *${usedPrefix}sleep* @usuario
│  ╰─ Dormir o descansar
├─🌸 *${usedPrefix}smoke* @usuario
│  ╰─ Fumar un cigarro
├─🌸 *${usedPrefix}spit* @usuario
│  ╰─ Escupir o despreciar
├─🌸 *${usedPrefix}step* @usuario
│  ╰─ Pisar a alguien
├─🌸 *${usedPrefix}think* @usuario
│  ╰─ Pensar o reflexionar
├─🌸 *${usedPrefix}walk* @usuario
│  ╰─ Caminar o pasear
├─🌸 *${usedPrefix}wink* @usuario
│  ╰─ Guiñar el ojo
├─🌸 *${usedPrefix}cringe* @usuario
│  ╰─ Avergonzarse
├─🌸 *${usedPrefix}smug* @usuario
│  ╰─ Presumir con estilo
├─🌸 *${usedPrefix}smile* @usuario
│  ╰─ Sonreír tiernamente
├─🌸 *${usedPrefix}highfive* @usuario
│  ╰─ Chocar los cinco
├─🌸 *${usedPrefix}bully* @usuario
│  ╰─ Molestar o acosar
├─🌸 *${usedPrefix}handhold* @usuario
│  ╰─ Tomarse de la mano
└─🌸 *${usedPrefix}wave* @usuario
   ╰─ Saludar con la mano

╭─❖ *💖 WAIFUS Y PAREJAS* ❖─╮
├─💞 *${usedPrefix}waifu*
│  ╰─ Waifu aleatoria
└─💑 *${usedPrefix}ppcouple*
   ╰─ Imágenes de parejas anime

╭─❖ *🐉 POKÉMON* ❖─╮
├─🔍 *${usedPrefix}pokedex* <nombre>
│  ╰─ Información Pokémon
└─🐾 *${usedPrefix}pokemon* <nombre>
   ╰─ Buscar Pokémon

╭─❖ *ℹ️ INFORMACIÓN* ❖─╮
├─📺 *${usedPrefix}anime* <nombre>
│  ╰─ Buscar anime
├─📚 *${usedPrefix}manga* <nombre>
│  ╰─ Buscar manga
└─👤 *${usedPrefix}character* <nombre>
   ╰─ Buscar personaje

╭─❖ *🖼️ IMÁGENES* ❖─╮
├─🎨 *${usedPrefix}animepic*
│  ╰─ Imagen anime aleatoria
└─🖼️ *${usedPrefix}wallpaper*
   ╰─ Wallpaper anime HD
    break;
            
        case 'NSFW':
            titulo = '🔞 NSFW';
            descripcion = 'Contenido para adultos (18+)';
            contenido = `*COMANDOS NSFW*

⚠️ *ADVERTENCIA: Contenido 18+*

🎭 *General:*
• ${usedPrefix}nsfw
• ${usedPrefix}hentai

🔞 *Explícito:*
• [comandos específicos]

*Requiere confirmación adicional*`;
            break;
            
        default:
            titulo = '🏠 INICIO';
            descripcion = 'Menú principal';
            contenido = 'Categoría no encontrada';
    }
    
    return { titulo, descripcion, contenido };
}

// Configuración del handler
handler.help = ['menu2']
handler.tags = ['main']
handler.command = ['menu2', 'menú2', 'help2']

export default handler

// Función auxiliar para tiempo
function clockString(ms) {
    let seconds = Math.floor((ms / 1000) % 60)
    let minutes = Math.floor((ms / (1000 * 60)) % 60)
    let hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
    return `${hours}h ${minutes}m ${seconds}s`
}
