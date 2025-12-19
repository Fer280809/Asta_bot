let handler = async (m, { conn, usedPrefix, command, args }) => {
    // Estado de paginación por chat/usuario
    if (!global.menuState) global.menuState = {};
    let chatId = m.chat;
    let userId = m.sender;
    let key = `${chatId}_${userId}`;
    
    // Imagen del bot desde settings.js
    let menuImage = global.icono || "https://files.catbox.moe/nqvhaq.jpg";
    
    // Categorías en orden (SIN NSFW)
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

    // Botones de navegación (SIN botón NSFW)
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
    
    const buttonMessage = {
        image: { url: menuImage },
        caption: txt,
        footer: `${global.botname || 'Asta-Bot'} | Página ${paginaIndex + 1}/${categorias.length}`,
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

// Manejador para botones (SIN lógica NSFW)
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
    
    // Procesar acción del botón (SIN NSFW)
    if (buttonId === `${usedPrefix}menu_prev`) {
        estado.pagina = Math.max(0, estado.pagina - 1);
    } else if (buttonId === `${usedPrefix}menu_next`) {
        estado.pagina = Math.min(8, estado.pagina + 1); // Cambiado de 9 a 8
    } else if (buttonId === `${usedPrefix}menu_home`) {
        estado.pagina = 0;
    } else {
        return; // No es un botón del menú
    }
    
    // Actualizar el menú
    estado.timestamp = Date.now();
    await handler(m, { conn, usedPrefix, command: 'menu', args: [] });
    
    return true; // Evitar procesamiento adicional
};

// Función para obtener contenido por categoría (SIN NSFW)
function obtenerContenidoCategoria(categoria, usedPrefix, m) {
    let titulo, descripcion, contenido;
    
    switch(categoria) {
        case 'MENU_INICIO':
    titulo = '🌟 BIENVENIDO A ASTA-BOT';
    descripcion = 'Panel principal - Todo en un solo lugar';
    
    // Obtener estadísticas
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
├─🌸 *ANIME* - Contenido otaku
└─🔞 *NSFW* - Contenido adulto (18+)

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
    
    contenido = `
╔════════════════════════╗
💼 *TRABAJOS Y RECOMPENSAS*
╚════════════════════════╝

┌─🔸 *${usedPrefix}work*
│  ╰─ Ganar coins trabajando
├─🔸 *${usedPrefix}slut*
│  ╰─ Ganar coins prostituyéndote
├─🔸 *${usedPrefix}crime*
│  ╰─ Ganar coins rápido (crimen)
├─🔸 *${usedPrefix}miming*
│  ╰─ Ganar coins minando
├─🔸 *${usedPrefix}aventura*
│  ╰─ Aventuras para ganar coins y EXP
├─🔸 *${usedPrefix}cazar*
│  ╰─ Cazar animales por recompensas
├─🔸 *${usedPrefix}fish*
│  ╰─ Pescar para ganar coins
├─🔸 *${usedPrefix}mazmorra*
│  ╰─ Explorar mazmorras
├─🔸 *${usedPrefix}daily*
│  ╰─ Recompensa diaria
├─🔸 *${usedPrefix}weekly*
│  ╰─ Recompensa semanal
├─🔸 *${usedPrefix}monthly*
│  ╰─ Recompensa mensual
└─🔸 *${usedPrefix}cofre*
   ╰─ Reclamar cofre diario

╔════════════════════════╗
   🏦 *BANCA Y GESTIÓN*
╚════════════════════════╝

┌─🔹 *${usedPrefix}balance* [@usuario]
│  ╰─ Ver saldo de coins
├─🔹 *${usedPrefix}deposit* [cantidad|all]
│  ╰─ Depositar en el banco
├─🔹 *${usedPrefix}withdraw* [cantidad|all]
│  ╰─ Retirar del banco
├─🔹 *${usedPrefix}economyinfo*
│  ╰─ Tu información económica
└─🔹 *${usedPrefix}givecoins* [@usuario] [cantidad]
   ╰─ Dar coins a otro usuario

╔════════════════════════╗
  🎲 *APUESTAS Y CASINO*
╚════════════════════════╝

┌─🔸 *${usedPrefix}coinflip* [cantidad] [cara/cruz]
│  ╰─ Apostar en cara o cruz
├─🔸 *${usedPrefix}roulette* [red/black] [cantidad]
│  ╰─ Apostar en la ruleta
├─🔸 *${usedPrefix}casino* [cantidad]
│  ╰─ Jugar en el casino
└─🔸 *${usedPrefix}steal* [@usuario]
   ╰─ Intentar robar coins

╔════════════════════════╗
  ⚔️ *AVENTURA Y SALUD*
╚════════════════════════╝

┌─🔹 *${usedPrefix}curar*
│  ╰─ Curar salud para aventuras
└─🔹 *${usedPrefix}heal*
   ╰─ Curar salud (alternativo)

╔════════════════════════╗
 📊 *RANKINGS Y LIDERAZGO*
╚════════════════════════╝

┌─🔸 *${usedPrefix}economyboard* [página]
│  ╰─ Ranking económico del grupo
└─🔸 *${usedPrefix}baltop* [página]
   ╰─ Ranking económico (alternativo)`;
    break;
            
        case 'DOWNLOAD':
    titulo = '📥 DESCARGAS MULTIMEDIA';
    descripcion = 'Obtén archivos de múltiples plataformas';
    
    contenido = `
╔════════════════════════╗
   🎵 *AUDIO Y MÚSICA*
╚════════════════════════╝

┌─🔸 *${usedPrefix}play* [canción]
│  ╰─ Buscar y reproducir música
├─🔸 *${usedPrefix}ytmp3* [link]
│  ╰─ Descargar audio de YouTube
├─🔸 *${usedPrefix}ytmp3doc* [link]
│  ╰─ Audio como documento
└─🔸 *${usedPrefix}spotify* [link]
   ╰─ Descargar de Spotify

╔════════════════════════╗
   🎬 *VIDEOS Y REDES*
╚════════════════════════╝

┌─🔹 *${usedPrefix}ytmp4* [link]
│  ╰─ Descargar video de YouTube
├─🔹 *${usedPrefix}ytmp4doc* [link]
│  ╰─ Video como documento
├─🔹 *${usedPrefix}tiktok* [link]
│  ╰─ Descargar de TikTok
├─🔹 *${usedPrefix}facebook* [link]
│  ╰─ Descargar de Facebook
├─🔹 *${usedPrefix}twitter* [link]
│  ╰─ Descargar de Twitter/X
└─🔹 *${usedPrefix}instagram* [link]
   ╰─ Descargar de Instagram

╔════════════════════════╗
      🖼️ *IMÁGENES*
╚════════════════════════╝

┌─🔸 *${usedPrefix}pinterest* [búsqueda]
│  ╰─ Buscar imágenes Pinterest
├─🔸 *${usedPrefix}image* [búsqueda]
│  ╰─ Buscar imágenes Google
└─🔸 *${usedPrefix}pinterestdoc* [búsqueda]
   ╰─ Imágenes como documento

╔════════════════════════╗
   📂 *ARCHIVOS Y APPS*
╚════════════════════════╝

┌─🔹 *${usedPrefix}mediafire* [link]
│  ╰─ Descargar de MediaFire
├─🔹 *${usedPrefix}mega* [link]
│  ╰─ Descargar de MEGA
├─🔹 *${usedPrefix}apk* [nombre app]
│  ╰─ Buscar APK en Aptoide
└─🔹 *${usedPrefix}mods* [nombre]
   ╰─ Buscar mods Minecraft

╔════════════════════════╗
     🔍 *BÚSQUEDAS*
╚════════════════════════╝

┌─🔸 *${usedPrefix}ytsearch* [búsqueda]
│  ╰─ Buscar en YouTube
├─🔸 *${usedPrefix}play2* [canción]
│  ╰─ Alternativa de búsqueda
└─🔸 *${usedPrefix}estados*
   ╰─ Descargar estados WhatsApp`;
    break;
            
        case 'GACHA':
    titulo = '🎴 SISTEMA GACHA';
    descripcion = 'Colecciona, intercambia y gestiona personajes';
    
    contenido = `
╔════════════════════════╗
   🎲 *COLECCIÓN BÁSICA*
╚════════════════════════╝

┌─🔸 *${usedPrefix}rollwaifu*
│  ╰─ Personaje aleatorio
├─🔸 *${usedPrefix}claim* [@personaje]
│  ╰─ Reclamar personaje
├─🔸 *${usedPrefix}harem* [@usuario]
│  ╰─ Ver colección personal
├─🔸 *${usedPrefix}charinfo* [nombre]
│  ╰─ Info de personaje
└─🔸 *${usedPrefix}serielist*
   ╰─ Listar series disponibles

╔════════════════════════╗
   💰 *MERCADO Y VENTAS*
╚════════════════════════╝

┌─🔹 *${usedPrefix}sell* [precio] [nombre]
│  ╰─ Vender personaje
├─🔹 *${usedPrefix}haremshop* [página]
│  ╰─ Tienda de personajes
├─🔹 *${usedPrefix}buycharacter* [nombre]
│  ╰─ Comprar personaje
├─🔹 *${usedPrefix}removesale* [precio] [nombre]
│  ╰─ Retirar de venta
└─🔹 *${usedPrefix}givechar* [@usuario] [nombre]
   ╰─ Regalar personaje

╔════════════════════════╗
  ⚔️ *INTERACCIÓN SOCIAL*
╚════════════════════════╝

┌─🔸 *${usedPrefix}trade* [tu personaje] [otro personaje]
│  ╰─ Intercambiar personajes
├─🔸 *${usedPrefix}robwaifu* [@usuario]
│  ╰─ Robar personaje
├─🔸 *${usedPrefix}giveallharem* [@usuario]
│  ╰─ Regalar toda la colección
└─🔸 *${usedPrefix}vote* [nombre]
   ╰─ Votar por personaje

╔════════════════════════╗
   ⚙️ *GESTIÓN Y CONFIG*
╚════════════════════════╝

┌─🔹 *${usedPrefix}setclaimmsg* [mensaje]
│  ╰─ Personalizar mensaje de claim
├─🔹 *${usedPrefix}delclaimmsg*
│  ╰─ Restablecer mensaje de claim
├─🔹 *${usedPrefix}deletewaifu* [nombre]
│  ╰─ Eliminar personaje
├─🔹 *${usedPrefix}charimage* [nombre]
│  ╰─ Ver imagen del personaje
└─🔹 *${usedPrefix}serieinfo* [nombre]
   ╰─ Información del anime

╔════════════════════════╗
    📊 *ESTADÍSTICAS*
╚════════════════════════╝

┌─🔸 *${usedPrefix}gachainfo*
│  ╰─ Tu info de gacha
├─🔸 *${usedPrefix}waifusboard* [número]
│  ╰─ Top personajes por valor
├─🔸 *${usedPrefix}favoritetop*
│  ╰─ Top personajes favoritos
└─🔸 *${usedPrefix}delwaifu* [nombre]
   ╰─ Eliminar personaje (alternativo)`;
    break;
            
        case 'SOCKETS':
    titulo = '🔌 SOCKETS Y CONEXIONES';
    descripcion = 'Gestiona sub-bots, conexiones y estado del sistema';
    
    contenido = `
╔════════════════════════╗
 🤖 *SUB-BOTS Y SESIONES*
╚════════════════════════╝

┌─🔸 *${usedPrefix}qr* / *${usedPrefix}code*
│  ╰─ Crear sub-bot con QR/código
├─🔸 *${usedPrefix}bots*
│  ╰─ Ver bots activos
├─🔸 *${usedPrefix}logout*
│  ╰─ Cerrar sesión del bot
└─🔸 *${usedPrefix}join* [invitación]
   ╰─ Unir bot a un grupo

╔════════════════════════╗
 ⚙️ *CONFIGURAR DEL BOT*
╚════════════════════════╝

┌─🔹 *${usedPrefix}setusername* [nombre]
│  ╰─ Cambiar nombre de usuario
├─🔹 *${usedPrefix}setpfp*
│  ╰─ Cambiar imagen de perfil
├─🔹 *${usedPrefix}setstatus* [estado]
│  ╰─ Cambiar estado (bio)
└─🔹 *${usedPrefix}leave*
   ╰─ Salir de un grupo

╔════════════════════════╗
 📊 *ESTADO Y DIAGNÓSTICO*
╚════════════════════════╝

┌─🔸 *${usedPrefix}status*
│  ╰─ Ver estado del bot
├─🔸 *${usedPrefix}ping*
│  ╰─ Medir tiempo de respuesta
└─🔸 *${usedPrefix}botlist*
   ╰─ Ver número de bots (alternativo)`;
    break;
            
        case 'UTILITIES':
    titulo = '🛠️ HERRAMIENTAS Y UTILIDADES';
    descripcion = 'Conversores, IA, búsquedas y herramientas varias';
    
    contenido = `
╔════════════════════════╗
🎨 *STICKERS Y MULTIMEDIA*
╚════════════════════════╝

┌─🔸 *${usedPrefix}sticker*
│  ╰─ Crear sticker de imagen/video
├─🔸 *${usedPrefix}toimg*
│  ╰─ Convertir sticker a imagen
├─🔸 *${usedPrefix}setmeta* [autor]|[pack]
│  ╰─ Configurar pack/autor stickers
├─🔸 *${usedPrefix}delmeta*
│  ╰─ Restablecer pack stickers
├─🔸 *${usedPrefix}brat* / *${usedPrefix}emojimix*
│  ╰─ Stickers con texto/emojis
└─🔸 *${usedPrefix}enhance* [imagen]
   ╰─ Mejorar calidad de imagen

╔════════════════════════╗
        🤖 *IA*
╚════════════════════════╝

┌─🔹 *${usedPrefix}ia* / *${usedPrefix}gemini*
│  ╰─ Preguntar a ChatGPT/Gemini
├─🔹 *${usedPrefix}dalle* [texto]
│  ╰─ Crear imágenes con IA
└─🔹 *${usedPrefix}translate* [texto]
   ╰─ Traducir texto

╔════════════════════════╗
   🔍 *BÚSQUEDAS Y WEB*
╚════════════════════════╝

┌─🔸 *${usedPrefix}google* [consulta]
│  ╰─ Buscar en Google
├─🔸 *${usedPrefix}wiki* [tema]
│  ╰─ Consultar Wikipedia
├─🔸 *${usedPrefix}ssweb* [url]
│  ╰─ Captura de pantalla web
└─🔸 *${usedPrefix}gitclone* [url]
   ╰─ Clonar repositorio GitHub

╔════════════════════════╗
 ⚙️ *HERRAMIENTAS VARIAS*
╚════════════════════════╝

┌─🔹 *${usedPrefix}calcular* [ecuación]
│  ╰─ Calculadora
├─🔹 *${usedPrefix}letra* [texto]
│  ╰─ Cambiar fuente de texto
├─🔹 *${usedPrefix}getpic* [@usuario]
│  ╰─ Ver foto de perfil
├─🔹 *${usedPrefix}tourl*
│  ╰─ Subir media a URL
├─🔹 *${usedPrefix}readviewonce*
│  ╰─ Ver imágenes viewonce
├─🔹 *${usedPrefix}say* [texto]
│  ╰─ Repetir mensaje
├─🔹 *${usedPrefix}npmdl* [paquete]
│  ╰─ Descargar paquete npm
└─🔹 *${usedPrefix}sc*
   ╰─ Link del repositorio

╔════════════════════════╗
   🆘 *SOPORTE Y AYUDA*
╚════════════════════════╝

┌─🔸 *${usedPrefix}help*
│  ╰─ Menú de comandos
├─🔸 *${usedPrefix}reporte* [problema]
│  ╰─ Reportar fallos
└─🔸 *${usedPrefix}suggest* [idea]
   ╰─ Sugerir nuevas funciones`;
    break;
            
        case 'PROFILES':
    titulo = '👤 PERFILES DE USUARIO';
    descripcion = 'Gestiona tu perfil, nivel y relaciones sociales';
    
    contenido = `
╔════════════════════════╗
📱 *PERFIL Y ESTADÍSTICAS*
╚════════════════════════╝

┌─🔸 *${usedPrefix}profile* [@usuario]
│  ╰─ Ver perfil de usuario
├─🔸 *${usedPrefix}level* [@usuario]
│  ╰─ Ver nivel y experiencia
└─🔸 *${usedPrefix}leaderboard* [página]
   ╰─ Top de usuarios por EXP

╔════════════════════════╗
   ✏️ *PERSONALIZACIÓN*
╚════════════════════════╝

┌─🔹 *${usedPrefix}setdescription* [texto]
│  ╰─ Establecer tu descripción
├─🔹 *${usedPrefix}deldescription*
│  ╰─ Eliminar descripción
├─🔹 *${usedPrefix}setgenre* [hombre|mujer]
│  ╰─ Establecer género
├─🔹 *${usedPrefix}delgenre*
│  ╰─ Eliminar género
├─🔹 *${usedPrefix}setbirth* [fecha]
│  ╰─ Establecer cumpleaños
├─🔹 *${usedPrefix}delbirth*
│  ╰─ Eliminar cumpleaños
└─🔹 *${usedPrefix}setfavourite* [personaje]
   ╰─ Establecer claim favorito

╔════════════════════════╗
 💝 *RELACIONES SOCIALES*
╚════════════════════════╝

┌─🔸 *${usedPrefix}marry* [@usuario]
│  ╰─ Casarse con otro usuario
├─🔸 *${usedPrefix}divorce*
│  ╰─ Divorciarse
└─🔸 *${usedPrefix}prem*
   ╰─ Comprar membresía premium`;
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
   ╰─ Wallpaper anime HD`;
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
