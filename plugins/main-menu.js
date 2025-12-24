// main-menu.js - Sistema de menú con navegación por botones

// Configuración del menú
const menuConfig = {
  totalPages: 10, // Total de páginas/categorías
  bannerUrl: "https://files.catbox.moe/nqvhaq.jpg",
  botName: "𝕬𝖘𝖙𝖆-𝕭𝖔𝖙",
  footerText: "⚡ Sistema Multi-Plugins"
};

// Almacenar estados de menú por chat (para eliminar mensajes anteriores)
const chatMenus = new Map();

// Contenido dinámico del menú - SOLO ESTRUCTURA
const menuContent = {
  // Página 1 - Menú Principal
  1: {
    title: "🎄 MENÚ PRINCIPAL 🎄",
    // NOTA: Aquí va el contenido de la página 1
    // Se reemplazará con tu contenido real
    body: (totalUsers, userName) => `
╭─━━━━━━━━━━━━━━━─╮
│ 🎁 ¡Hola @${userName}! 🌟
╰─━━━━━━━━━━━━━━━─╯
Me llamo 『 ${menuConfig.botName} 』

╭─═⊰ 🎀 INFORMACIÓN DEL SISTEMA
│ 🤖 Estado: ACTIVO ✅
│ 👥 Usuarios: 『${totalUsers}』🌟
│ 📅 Librería » Baileys Multi-Device
│ 🔒 Modo: SEGURO
╰───────────────╯

*Elige una categoría usando los botones:*
`.trim()
  },
  
  // Página 2 - Economía
  2: {
    title: "💰 SISTEMA ECONÓMICO",
    // NOTA: Aquí va el contenido de economía
    body: () => ``
  },
  
  // Página 3 - Descargas
  3: {
    title: "📥 DESCARGAS",
    // NOTA: Aquí va el contenido de descargas
    body: () => ``
  },
  
  // Página 4 - Juegos
  4: {
    title: "🎮 JUEGOS Y GACHA",
    // NOTA: Aquí va el contenido de juegos
    body: () => ``
  },
  
  // Página 5 - Utilidades
  5: {
    title: "🛠️ UTILIDADES",
    // NOTA: Aquí va el contenido de utilidades
    body: () => ``
  },
  
  // Página 6 - Perfiles
  6: {
    title: "👤 PERFILES",
    // NOTA: Aquí va el contenido de perfiles
    body: () => ``
  },
  
  // Página 7 - Grupos
  7: {
    title: "👥 GRUPOS",
    // NOTA: Aquí va el contenido de grupos
    body: () => ``
  },
  
  // Página 8 - Anime
  8: {
    title: "🎌 ANIME",
    // NOTA: Aquí va el contenido de anime
    body: () => ``
  },
  
  // Página 9 - Herramientas
  9: {
    title: "🔧 HERRAMIENTAS AVANZADAS",
    // NOTA: Aquí va el contenido de herramientas
    body: () => ``
  },
  
  // Página 10 - NSFW (si aplica)
  10: {
    title: "🔞 CONTENIDO ADULTO",
    // NOTA: Aquí va el contenido NSFW (si lo tienes)
    body: () => ``
  }
};

// Handler principal
let handler = async (m, { conn, usedPrefix, text }) => {
  try {
    // Obtener datos del usuario y sistema
    const totalUsers = Object.keys(global.db.data.users).length || 0;
    const userName = m.pushName || m.sender.split('@')[0];
    
    // Determinar página actual
    let page = 1;
    if (text && !isNaN(text)) {
      page = parseInt(text);
      if (page < 1) page = 1;
      if (page > menuConfig.totalPages) page = menuConfig.totalPages;
    }
    
    // Obtener contenido de la página actual
    const currentPage = menuContent[page];
    if (!currentPage) {
      return m.reply('❌ Página no encontrada en el menú.');
    }
    
    // Generar cuerpo del mensaje
    let bodyText = '';
    if (typeof currentPage.body === 'function') {
      bodyText = currentPage.body(totalUsers, userName);
    } else {
      bodyText = currentPage.body;
    }
    
    // Añadir encabezado de página
    const finalMessage = `
┏━━━━━━━━━━━━━━━━━━━━━┓
   ${currentPage.title}
┗━━━━━━━━━━━━━━━━━━━━━┛

${bodyText}

┏━━━━━━━━━━━━━━━━━━━━━┓
 📄 Página ${page}/${menuConfig.totalPages}
 ┗━━━━━━━━━━━━━━━━━━━━━┛
`.trim();
    
    // Crear botones de navegación
    const buttons = [];
    
    // Botón ANTERIOR (si no es la primera página)
    if (page > 1) {
      buttons.push({
        buttonId: `${usedPrefix}menu ${page - 1}`,
        buttonText: { displayText: '◀️ Anterior' },
        type: 1
      });
    }
    
    // Botón SIGUIENTE (si no es la última página)
    if (page < menuConfig.totalPages) {
      buttons.push({
        buttonId: `${usedPrefix}menu ${page + 1}`,
        buttonText: { displayText: 'Siguiente ▶️' },
        type: 1
      });
    }
    
    // Botón INICIO (siempre disponible)
    buttons.push({
      buttonId: `${usedPrefix}menu 1`,
      buttonText: { displayText: '🏠 Inicio' },
      type: 1
    });
    
    // Botón SUB-BOT
    buttons.push({
      buttonId: `${usedPrefix}code`,
      buttonText: { displayText: '🤖 Sub-Bot' },
      type: 1
    });
    
    // Eliminar mensaje anterior del menú en este chat
    const chatId = m.chat;
    if (chatMenus.has(chatId)) {
      try {
        const oldMsg = chatMenus.get(chatId);
        await conn.sendMessage(chatId, {
          delete: oldMsg.key
        });
      } catch (e) {
        // Ignorar errores al eliminar
      }
    }
    
    // Enviar nuevo mensaje con menú
    const sentMsg = await conn.sendMessage(m.chat, {
      image: { url: menuConfig.bannerUrl },
      caption: finalMessage,
      footer: `${menuConfig.botName} | ${menuConfig.footerText}`,
      buttons: buttons,
      headerType: 4
    }, { quoted: m });
    
    // Guardar referencia al nuevo mensaje
    chatMenus.set(chatId, sentMsg);
    
    // Limpiar referencia después de 5 minutos
    setTimeout(() => {
      if (chatMenus.has(chatId)) {
        chatMenus.delete(chatId);
      }
    }, 5 * 60 * 1000);
    
  } catch (error) {
    console.error('❌ Error en menú:', error);
    m.reply('🚫 Ocurrió un error al mostrar el menú. Intenta de nuevo.');
  }
};

// Configuración del comando
handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu', 'menú', 'help', 'comandos'];

// Limpieza periódica de mensajes antiguos
setInterval(() => {
  const now = Date.now();
  for (const [chatId, msg] of chatMenus.entries()) {
    if (msg.messageTimestamp && (now - msg.messageTimestamp * 1000 > 10 * 60 * 1000)) {
      chatMenus.delete(chatId);
    }
  }
}, 30 * 60 * 1000); // Cada 30 minutos

export default handler;
