let handler = async (m, { conn, usedPrefix, text, args, isAdmin, isOwner, isROwner, participants, groupMetadata }) => {
    // Obtener chat de forma segura
    let chat = global.db.data.chats[m.chat];
    if (!chat) {
        global.db.data.chats[m.chat] = {};
        chat = global.db.data.chats[m.chat];
    }
    
    // 🔥 FORZAR sincronización con la base de datos
    if (!chat.muted || !Array.isArray(chat.muted)) {
        chat.muted = [];
        await global.saveDatabase();
    }
    
    // Verificar que el comando se use en grupo
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');
    
    // Verificar permisos básicos
    if (!isAdmin && !isOwner && !isROwner) {
        return m.reply('⚠️ Solo los administradores pueden usar este comando.');
    }
    
    // --- FUNCIÓN: VER LISTA ---
    if (args[0] === 'list' || text.toLowerCase() === 'list') {
        const mutedList = chat.muted || [];
        
        if (mutedList.length === 0) {
            return m.reply('📭 No hay usuarios silenciados en este grupo.');
        }
        
        // Obtener nombres de los usuarios
        let listText = '📋 *LISTA DE USUARIOS SILENCIADOS*\n━━━━━━━━━━━━━━━━━━━━━━━\n';
        
        for (let i = 0; i < mutedList.length; i++) {
            const userJid = mutedList[i];
            try {
                const userName = await conn.getName(userJid) || userJid.split('@')[0];
                listText += `\n${i + 1}. @${userJid.split('@')[0]} - ${userName}`;
            } catch {
                listText += `\n${i + 1}. @${userJid.split('@')[0]}`;
            }
        }
        
        listText += '\n━━━━━━━━━━━━━━━━━━━━━━━\n';
        listText += `🔓 Para desilenciar: ${usedPrefix}unmute @usuario\n`;
        listText += `📌 Total: ${mutedList.length} usuario(s)`;
        
        return conn.sendMessage(m.chat, {
            text: listText,
            mentions: mutedList
        }, { quoted: m });
    }
    
    // --- IDENTIFICAR USUARIO (VERSIÓN MEJORADA) ---
    let who = null;
    let mentionedUser = null;
    
    // Método 1: Usuario mencionado en el mensaje
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        who = m.mentionedJid[0];
        mentionedUser = who;
    }
    
    // Método 2: Usuario citado (respondido)
    if (!who && m.quoted) {
        who = m.quoted.sender;
        mentionedUser = who;
    }
    
    // Método 3: Extraer número del texto
    if (!who && text) {
        const numberMatch = text.match(/\d+/g);
        if (numberMatch && numberMatch[0]) {
            const number = numberMatch[0];
            if (number.length >= 5) {
                who = number + '@s.whatsapp.net';
            }
        }
    }
    
    // Validar que se identificó un usuario para mute/unmute
    if (!who && (args[0] && args[0] !== 'list')) {
        return m.reply(`🔧 *Uso correcto:*\n\n` +
            `• ${usedPrefix}mute @usuario - Silenciar usuario\n` +
            `• ${usedPrefix}unmute @usuario - Desilenciar usuario\n` +
            `• ${usedPrefix}mute list - Ver lista de silenciados\n\n` +
            `📌 *Ejemplo:* ${usedPrefix}mute @${m.sender.split('@')[0]}`);
    }
    
    // Normalizar el JID
    if (who && !who.includes('@s.whatsapp.net')) {
        const cleanNumber = who.replace(/[^0-9]/g, '');
        if (cleanNumber.length >= 5) {
            who = cleanNumber + '@s.whatsapp.net';
        }
    }
    
    // Verificar que el usuario esté en el grupo
    try {
        const groupData = await conn.groupMetadata(m.chat);
        const userInGroup = groupData.participants.find(p => p.id === who);
        
        if (!userInGroup) {
            return m.reply('❌ El usuario no está en este grupo.');
        }
        
        // Verificar si es administrador
        const isUserAdmin = userInGroup.admin === 'admin' || userInGroup.admin === 'superadmin';
        
        // Verificar que el ejecutante sea admin (si no es owner)
        const senderInGroup = groupData.participants.find(p => p.id === m.sender);
        const isSenderAdmin = senderInGroup && (senderInGroup.admin === 'admin' || senderInGroup.admin === 'superadmin');
        
        if (!isOwner && !isROwner && !isSenderAdmin) {
            return m.reply('⚠️ Solo los administradores pueden usar este comando.');
        }
        
        // Evitar que se silencie a admins (a menos que sea owner)
        if (isUserAdmin && !isOwner && !isROwner) {
            return m.reply('⚠️ No puedes silenciar a otro administrador.');
        }
        
        // --- COMANDO: MUTE ---
        if (args[0] && args[0] !== 'list' && !text.toLowerCase().includes('unmute')) {
            // Verificar si ya está silenciado
            const isAlreadyMuted = chat.muted.some(mutedJid => 
                mutedJid === who || 
                mutedJid.replace(/[^0-9]/g, '') === who.replace(/[^0-9]/g, '')
            );
            
            if (isAlreadyMuted) {
                return m.reply('⚠️ Este usuario ya está silenciado.');
            }
            
            // Agregar a la lista
            chat.muted.push(who);
            await global.saveDatabase();
            
            // Obtener nombre del usuario
            const userName = await conn.getName(who) || who.split('@')[0];
            
            await m.react('🔇');
            
            // Notificar al grupo
            await conn.sendMessage(m.chat, {
                text: `🔇 *USUARIO SILENCIADO*\n━━━━━━━━━━━━━━━━━━━━━━━\n` +
                      `👤 *Usuario:* @${who.split('@')[0]}\n` +
                      `📛 *Nombre:* ${userName}\n` +
                      `👮 *Moderador:* @${m.sender.split('@')[0]}\n\n` +
                      `❌ Sus mensajes serán eliminados automáticamente.\n` +
                      `🔓 Para desilenciar: ${usedPrefix}unmute @${who.split('@')[0]}\n` +
                      `━━━━━━━━━━━━━━━━━━━━━━━`,
                mentions: [who, m.sender]
            }, { quoted: m });
            
            // Notificar al usuario silenciado (opcional)
            try {
                await conn.sendMessage(who, {
                    text: `🔇 *HAS SIDO SILENCIADO*\n\n` +
                          `Has sido silenciado en el grupo *${groupData.subject || 'este grupo'}*.\n` +
                          `No podrás enviar mensajes hasta que un administrador te desilencie.\n\n` +
                          `👮 Moderador: @${m.sender.split('@')[0]}\n` +
                          `📅 Fecha: ${new Date().toLocaleString()}`,
                    mentions: [m.sender]
                });
            } catch (dmErr) {
                console.log('[MUTE] No se pudo enviar DM al usuario');
            }
        }
        
        // --- COMANDO: UNMUTE ---
        if (text.toLowerCase().includes('unmute') || args[0] === 'unmute') {
            // Verificar si está silenciado
            const userIndex = chat.muted.findIndex(mutedJid => 
                mutedJid === who || 
                mutedJid.replace(/[^0-9]/g, '') === who.replace(/[^0-9]/g, '')
            );
            
            if (userIndex === -1) {
                return m.reply('⚠️ Este usuario no está en la lista de silenciados.');
            }
            
            // Remover de la lista
            chat.muted.splice(userIndex, 1);
            await global.saveDatabase();
            
            // Obtener nombre del usuario
            const userName = await conn.getName(who) || who.split('@')[0];
            
            await m.react('🔊');
            
            // Notificar al grupo
            await conn.sendMessage(m.chat, {
                text: `🔊 *USUARIO DESILENCIADO*\n━━━━━━━━━━━━━━━━━━━━━━━\n` +
                      `👤 *Usuario:* @${who.split('@')[0]}\n` +
                      `📛 *Nombre:* ${userName}\n` +
                      `👮 *Moderador:* @${m.sender.split('@')[0]}\n\n` +
                      `✅ Ahora puede enviar mensajes normalmente.\n` +
                      `📌 Usuarios silenciados restantes: ${chat.muted.length}\n` +
                      `━━━━━━━━━━━━━━━━━━━━━━━`,
                mentions: [who, m.sender]
            }, { quoted: m });
            
            // Notificar al usuario (opcional)
            try {
                await conn.sendMessage(who, {
                    text: `🔊 *YA PUEDES HABLAR*\n\n` +
                          `Has sido desilenciado en el grupo *${groupData.subject || 'este grupo'}*.\n` +
                          `Ahora puedes enviar mensajes normalmente.\n\n` +
                          `👮 Moderador: @${m.sender.split('@')[0]}\n` +
                          `📅 Fecha: ${new Date().toLocaleString()}`,
                    mentions: [m.sender]
                });
            } catch (dmErr) {
                console.log('[UNMUTE] No se pudo notificar al usuario');
            }
        }
        
    } catch (error) {
        console.error('Error en comando mute:', error);
        return m.reply('❌ Ocurrió un error al procesar el comando.');
    }
}

// Configuración del handler
handler.help = ['mute @usuario', 'unmute @usuario', 'mute list'];
handler.tags = ['group', 'admin'];
handler.command = ['mute', 'silenciar', 'unmute', 'desmutear', 'mutelist'];
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;
