‎// plugins/menu_paginado_base.js (o tu archivo menu.js)
‎// IMPORTANTE: Asegúrate de que este archivo está en tu carpeta de plugins.
‎
‎// --- 1. DEFINICIÓN ESTÁTICA DEL MENÚ (A LLENAR) ---
‎
‎/**
‎ * Objeto que contiene el contenido estático de cada sección del menú.
‎ * - La clave (e.g., "MENU_INICIO") es el identificador único.
‎ * - 'title': Título que aparece en la cabecera.
‎ * - 'body': El texto completo o una función que genera el contenido de la sección.
‎ */
‎const MenuData = {
‎    "MENU_INICIO": {
‎        title: "¡FELIZ NAVIDAD! 🎄",
‎        body: (totalreg, userId, conn) => `
‎╭─━━━━━━━━━━━━━━━─╮
‎│ 🎁 ¡Hola @${userId.split('@')[0]}! 🌟
‎╰─━━━━━━━━━━━━━━━─╯
‎Me llamo 『 𝕬𝖘𝖙𝖆-𝕭𝖔𝖙 』🎅
‎
‎╭─═⊰ 🎀 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂𝐈Ó𝐍 𝐍𝐀𝐕𝐈𝐃𝐄Ñ𝐀
‎│ 🤖 Estado: ${(conn.user.jid == global.conn.user.jid ? '🟢 RENO MÁGICO' : '🔗 DUENDE AYUDANTE')}
‎│ 👥 Usuarios: 『${totalreg.toLocaleString()}』🌟
‎│ 🛠️ Comandos: 『${Object.values(global.plugins).filter(v => v.help && v.tags).length}』✨
‎│ 📅 Librería » Baileys
‎│ 🌍 Región: Polo Norte 🎅
‎│ 📡 Ping: Alegre ✅
‎│ 💾 Versión: 1.3
‎│ 🔒 Modo: ${(conn.user.jid == global.conn.user.jid ? '🔐 ELFO PRIVADO' : '🔓 TALLER PÚBLICO')}
‎╰───────────────╯
‎
‎*🤖 PON #code O #qr PARA HACERTE SUBBOT DEL ASTA-BOT-MD 📡*
‎`.trim()
‎    },
‎    
‎    // ⬇️ ESPACIO PARA TUS CATEGORÍAS ⬇️
‎    // EJEMPLO: "ECONOMY": { title: "💰 ECONOMY", body: "Aquí va la lista de comandos de economía..." },
‎    // ⬆️ ESTE CONTENIDO DEBE SER COMPLETADO POR TI ⬆️
‎};
‎
‎// Array para definir el ORDEN EXACTO de la navegación entre categorías
‎const MenuOrder = [
‎    "MENU_INICIO",
‎    // ⬇️ AÑADE LAS CLAVES DE TUS CATEGORÍAS AQUÍ ⬇️
‎    // EJEMPLO: "ECONOMY", "DOWNLOAD", "GACHA", "GROUPS", "ANIME", "NSFW"
‎    // ⬆️ ESTE ARRAY DEBE SER COMPLETADO POR TI ⬆️
‎];
‎// ----------------------------------------------------
‎
‎
‎let handler = async (m, { conn, usedPrefix, text }) => {
‎    // Si MenuOrder está vacío, no hay nada que mostrar (excepto el inicio si está definido)
‎    if (MenuOrder.length === 0) return m.reply('❌ El menú está vacío o no configurado.');
‎    
‎    let totalreg = Object.keys(global.db.data.users).length;
‎    let userId = m.sender;
‎    const totalCategories = MenuOrder.length;
‎    
‎    // 1. Determinar la categoría actual (Índice de navegación)
‎    let currentCategoryKey = MenuOrder[0];
‎    let currentIndex = 0;
‎
‎    // Si se pasa un argumento numérico (desde un botón), úsalo como índice
‎    if (text && !isNaN(parseInt(text))) {
‎        currentIndex = parseInt(text);
‎        
‎        // Asegurar que el índice esté dentro del rango [0, totalCategories - 1]
‎        if (currentIndex >= 0 && currentIndex < totalCategories) {
‎            currentCategoryKey = MenuOrder[currentIndex];
‎        } else {
‎            // Índice inválido, vuelve al inicio
‎            currentIndex = 0;
‎            currentCategoryKey = MenuOrder[0];
‎        }
‎    }
‎
‎    const currentMenu = MenuData[currentCategoryKey];
‎
‎    if (!currentMenu) return m.reply('❌ Categoría de menú no encontrada. Intente de nuevo.');
‎
‎    // 2. Generar el cuerpo del mensaje
‎    let bodyContent = '';
‎    
‎    if (typeof currentMenu.body === 'function') {
‎        // Para la página de inicio que requiere datos dinámicos (totalreg, etc.)
‎        bodyContent = currentMenu.body(totalreg, userId, conn);
‎    } else {
‎        // Para las páginas de comandos (estáticas)
‎        const currentPageNumber = currentIndex + 1;
‎        
‎        bodyContent = `
‎╭ *Página ${currentPageNumber}/${totalCategories}*
‎╰──────────────────
‎
‎┏━━━━━━━━━━━━━━┓
‎*${currentMenu.title}*
‎┗━━━━━━━━━━━━━━┛
‎${currentMenu.body}
‎`.trim();
‎    }
‎    
‎    let infoText = bodyContent;
‎    
‎    // 3. Lógica de Botones Siguiente/Anterior
‎    let buttons = [];
‎
‎    // Botón ANTERIOR
‎    if (currentIndex > 0) {
‎        const prevIndex = currentIndex - 1;
‎        buttons.push({ 
‎            // El buttonId envía el índice de la categoría anterior
‎            buttonId: usedPrefix + 'menu ' + prevIndex, 
‎            buttonText: { displayText: '◀️ Anterior' }, 
‎            type: 1 
‎        });
‎    }
‎
‎    // Botón SIGUIENTE
‎    if (currentIndex < totalCategories - 1) {
‎        const nextIndex = currentIndex + 1;
‎        buttons.push({ 
‎            // El buttonId envía el índice de la categoría siguiente
‎            buttonId: usedPrefix + 'menu ' + nextIndex, 
‎            buttonText: { displayText: 'Siguiente ▶️' }, 
‎            type: 1 
‎        });
‎    }
‎    
‎    // Botón Fijo (Sup-Bot/code) - Se mantiene como un botón adicional.
‎    buttons.push({ 
‎        buttonId: usedPrefix + 'code', 
‎        buttonText: { displayText: '🤖 Sup-Bot' }, 
‎        type: 1 
‎    });
‎
‎    // --- 4. ENVÍO DEL MENSAJE ---
‎    let mediaUrl = 'https://files.catbox.moe/lajq7h.jpg';
‎
‎    try {
‎        await conn.sendMessage(m.chat, {
‎            image: { url: mediaUrl },
‎            caption: infoText,
‎            footer: "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡",
‎            buttons: buttons,
‎            headerType: 4,
‎            mentions: [userId]
‎        }, { quoted: m });
‎    } catch (e) {
‎        // Fallback sin imagen si falla el envío con HeaderType 4
‎        let buttonMessage = {
‎            text: infoText,
‎            footer: "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡",
‎            buttons: buttons,
‎            headerType: 1,
‎            mentions: [userId]
‎        };
‎        await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
‎    }
‎};
‎
‎handler.help = ['menu', 'help', 'menú'];
‎handler.tags = ['main'];
‎handler.command = ['menú', 'menu', 'help'];
‎
‎export default handler;
‎