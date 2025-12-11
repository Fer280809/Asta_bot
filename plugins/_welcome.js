import fs from 'fs'
import { WAMessageStubType } from '@whiskeysockets/baileys'

// ==================== FUNCIONES DE GENERACIÓN ====================
async function generarBienvenida({ conn, userId, groupMetadata, chat }) {
    const username = `@${userId.split('@')[0]}`
    const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')
    const groupSize = groupMetadata.participants.length
    const fecha = new Date().toLocaleDateString('es-MX')
    const hora = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    
    // Usar mensaje personalizado o predeterminado
    const mensajePersonalizado = chat.sWelcome || ''
    
    // Si hay mensaje personalizado
    if (mensajePersonalizado) {
        let caption = mensajePersonalizado
            .replace(/\(usuario\)/gi, username)
            .replace(/\(grupo\)/gi, groupMetadata.subject)
            .replace(/\(desc\)/gi, groupMetadata.desc || 'Sin descripción')
            .replace(/\(miembros\)/gi, groupSize.toString())
            .replace(/\(fecha\)/gi, fecha)
            .replace(/\(hora\)/gi, hora)
        
        return { 
            pp, 
            caption, 
            mentions: [userId]
        }
    }
    
    // MENSAJE PREDETERMINADO ACTIVO POR DEFECTO
    const caption = `
╭━〔👑 *ASTA-BOT 👑 〕* 
 ┋ 
 ┋「 🎉 *¡BIENVENIDO/A! 👋 」* 
 ┋ 
 ┋ 「 *${groupMetadata.subject}* 」 
 ┋ 
 ╰━★ 「 ${username} 」 
 *╭━━━━━━ * 
 ┋❖ Ve la descripcion para mas info
 ┋❀ Espero que te la lleves bien * 
 ┋❖ Ahora somos ${groupSize} miembros
 ┋📅 Fecha de ingreso: ${fecha} ${hora}
 ┗━━━━━━━━━━━━━━━┅ ⳹
`.trim()
    
    return { 
        pp, 
        caption, 
        mentions: [userId]
    }
}

async function generarDespedida({ conn, userId, groupMetadata, chat }) {
    const username = `@${userId.split('@')[0]}`
    const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')
    const groupSize = groupMetadata.participants.length
    const fecha = new Date().toLocaleDateString('es-MX')
    const hora = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    
    const mensajePersonalizado = chat.sBye || ''
    
    if (mensajePersonalizado) {
        let caption = mensajePersonalizado
            .replace(/\(usuario\)/gi, username)
            .replace(/\(grupo\)/gi, groupMetadata.subject)
            .replace(/\(desc\)/gi, groupMetadata.desc || 'Sin descripción')
            .replace(/\(miembros\)/gi, (groupSize - 1).toString())
            .replace(/\(fecha\)/gi, fecha)
            .replace(/\(hora\)/gi, hora)
        
        return { 
            pp, 
            caption, 
            mentions: [userId]
        }
    }
    
    const caption = `
╭━〔👑 *ASTA-BOT 👑 〕* 
 ┋ 
 ┋「 😢 *¡HASTA LUEGO! 👋 」* 
 ┋ 
 ┋ 「 *${groupMetadata.subject}* 」 
 ┋ 
 ╰━★ 「 ${username} 」 
 *╭━━━━━━ * 
 ┋❖ Te extrañaremos en el grupo
 ┋❀ Esperamos que vuelvas pronto * 
 ┋❖ Ahora somos ${groupSize - 1} miembros
 ┋📅 Fecha de salida: ${fecha} ${hora}
 ┗━━━━━━━━━━━━━━━┅ ⳹
`.trim()
    
    return { 
        pp, 
        caption, 
        mentions: [userId]
    }
}

// ==================== HANDLER DE EVENTOS (ACTIVADO POR DEFECTO) ====================
const eventHandler = m => m
eventHandler.before = async function (m, { conn, groupMetadata }) {
    if (!m.messageStubType || !m.isGroup) return true
    
    // Asegurar que el chat existe y welcome esté activado por defecto
    let chat = global.db.data.chats[m.chat]
    if (!chat) {
        // Crear chat con welcome ACTIVADO por defecto
        global.db.data.chats[m.chat] = {
            welcome: true,  // ACTIVADO POR DEFECTO
            sWelcome: '',
            sBye: '',
            detect: true,
            antiLink: true,
            modoadmin: false,
            nsfw: false,
            economy: true,
            gacha: true
        }
        chat = global.db.data.chats[m.chat]
    }
    
    // Si welcome no está definido, activarlo por defecto
    if (chat.welcome === undefined) {
        chat.welcome = true  // ACTIVAR POR DEFECTO
    }
    
    // Si está desactivado, no hacer nada
    if (!chat.welcome) return true
    
    const userId = m.messageStubParameters[0]
    
    // BIENVENIDA AUTOMÁTICA
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
        try {
            const { pp, caption, mentions } = await generarBienvenida({ 
                conn, 
                userId, 
                groupMetadata, 
                chat 
            })
            
            await conn.sendMessage(m.chat, { 
                image: { url: pp }, 
                caption: caption,
                mentions: mentions
            }, { quoted: null })
            
        } catch (error) {
            console.error('Error en bienvenida:', error)
        }
    }
    
    // DESPEDIDA AUTOMÁTICA
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE || 
        m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
        try {
            const { pp, caption, mentions } = await generarDespedida({ 
                conn, 
                userId, 
                groupMetadata, 
                chat 
            })
            
            await conn.sendMessage(m.chat, { 
                image: { url: pp }, 
                caption: caption,
                mentions: mentions
            }, { quoted: null })
            
        } catch (error) {
            console.error('Error en despedida:', error)
        }
    }
    
    return true
}

// ==================== COMANDOS DE CONFIGURACIÓN ====================
const handler = async (m, { conn, command, text, usedPrefix, groupMetadata }) => {
    // Asegurar que el chat existe y welcome esté activado por defecto
    let chat = global.db.data.chats[m.chat]
    if (!chat) {
        global.db.data.chats[m.chat] = {
            welcome: true,  // ACTIVADO POR DEFECTO
            sWelcome: '',
            sBye: '',
            detect: true,
            antiLink: true,
            modoadmin: false,
            nsfw: false,
            economy: true,
            gacha: true
        }
        chat = global.db.data.chats[m.chat]
    }
    
    // Si welcome no está definido, activarlo por defecto
    if (chat.welcome === undefined) {
        chat.welcome = true
    }
    
    // AYUDA PRINCIPAL
    if (command === 'setgp') {
        const ayuda = `
╔═══════════════════════╗
║  🛠️ *CONFIGURACIÓN DE GRUPO*
╚═══════════════════════╝

🎉 *BIENVENIDA/DESPEDIDA:*
• ${usedPrefix}welcome on/off
  › Activa/desactiva bienvenidas
• ${usedPrefix}setwelcome <mensaje>
  › Configura mensaje de bienvenida
• ${usedPrefix}setbye <mensaje>
  › Configura mensaje de despedida
• ${usedPrefix}testwelcome
  › Prueba la bienvenida
• ${usedPrefix}testbye
  › Prueba la despedida
• ${usedPrefix}mywelcome
  › Muestra configuración actual
• ${usedPrefix}resetwelcome
  › Restablece bienvenida
• ${usedPrefix}resetbye
  › Restablece despedida

💬 *VARIABLES DISPONIBLES (usa paréntesis):*
(usuario) → Mención al usuario
(grupo) → Nombre del grupo
(desc) → Descripción del grupo
(miembros) → Número de miembros
(fecha) → Fecha actual (ej: 11/12/2025)
(hora) → Hora actual (ej: 14:30)

📝 *EJEMPLOS:*
• ${usedPrefix}setwelcome ¡Hola (usuario)! 👋 Bienvenido a (grupo)
  Fecha: (fecha) Hora: (hora)
  Ahora somos (miembros) miembros

• ${usedPrefix}setbye Adiós (usuario) 😢
  Fecha de salida: (fecha) (hora)
  Miembros restantes: (miembros)
        `.trim()
        
        return m.reply(ayuda)
    }
    
    // ACTIVAR/DESACTIVAR WELCOME
    if (command === 'welcome') {
        const estado = text?.toLowerCase()
        if (estado === 'on') {
            chat.welcome = true
            return m.reply('✅ *Bienvenidas activadas*\nAhora se enviarán mensajes cuando alguien entre/salga.')
        } else if (estado === 'off') {
            chat.welcome = false
            return m.reply('❌ *Bienvenidas desactivadas*\nYa no se enviarán mensajes.')
        } else {
            const estadoActual = chat.welcome ? '✅ ACTIVADO (por defecto)' : '❌ DESACTIVADO'
            return m.reply(`Estado: ${estadoActual}\nUsa: ${usedPrefix}welcome on/off`)
        }
    }
    
    // SET WELCOME
    if (command === 'setwelcome') {
        if (!text) {
            return m.reply(`❌ *Escribe un mensaje*\n\n📝 Ejemplo:\n${usedPrefix}setwelcome ¡Hola (usuario)! 👋\nBienvenido a (grupo)\nFecha: (fecha) Hora: (hora)\nMiembros: (miembros)`)
        }
        
        chat.sWelcome = text
        await m.reply(`✅ *Mensaje de bienvenida configurado*\n\n📝 Prueba: ${usedPrefix}testwelcome\n\n🔧 Variables usadas:\n${text.match(/\([^)]+\)/g)?.map(v => `• ${v}`).join('\n') || 'Ninguna detectada'}`)
    }
    
    // SET BYE
    if (command === 'setbye') {
        if (!text) {
            return m.reply(`❌ *Escribe un mensaje*\n\n📝 Ejemplo:\n${usedPrefix}setbye Adiós (usuario) 😢\nFecha de salida: (fecha)\nHora: (hora)\nMiembros restantes: (miembros)`)
        }
        
        chat.sBye = text
        await m.reply(`✅ *Mensaje de despedida configurado*\n\n📝 Prueba: ${usedPrefix}testbye\n\n🔧 Variables usadas:\n${text.match(/\([^)]+\)/g)?.map(v => `• ${v}`).join('\n') || 'Ninguna detectada'}`)
    }
    
    // TEST WELCOME
    if (command === 'testwelcome') {
        if (!chat.welcome) {
            return m.reply('⚠️ Las bienvenidas están desactivadas.\nActívalas: ' + usedPrefix + 'welcome on')
        }
        
        const { pp, caption, mentions } = await generarBienvenida({
            conn,
            userId: m.sender,
            groupMetadata,
            chat
        })
        
        await conn.sendMessage(m.chat, {
            image: { url: pp },
            caption: caption,
            mentions: mentions
        }, { quoted: m })
        
        // Informar si es predeterminado o personalizado
        const tipo = chat.sWelcome ? 'personalizado' : 'predeterminado'
        await m.reply(`📊 *Prueba realizada (${tipo})*\n${!chat.sWelcome ? `\n⚠️ Usando mensaje predeterminado de Asta-Bot.\nPara personalizar: ${usedPrefix}setwelcome <mensaje>` : ''}`)
    }
    
    // TEST BYE
    if (command === 'testbye') {
        if (!chat.welcome) {
            return m.reply('⚠️ Las despedidas están desactivadas.\nActívalas: ' + usedPrefix + 'welcome on')
        }
        
        const { pp, caption, mentions } = await generarDespedida({
            conn,
            userId: m.sender,
            groupMetadata,
            chat
        })
        
        await conn.sendMessage(m.chat, {
            image: { url: pp },
            caption: caption,
            mentions: mentions
        }, { quoted: m })
        
        const tipo = chat.sBye ? 'personalizado' : 'predeterminado'
        await m.reply(`📊 *Prueba realizada (${tipo})*\n${!chat.sBye ? `\n⚠️ Usando mensaje predeterminado de Asta-Bot.\nPara personalizar: ${usedPrefix}setbye <mensaje>` : ''}`)
    }
    
    // MY WELCOME
    if (command === 'mywelcome') {
        const estado = chat.welcome ? '✅ ACTIVADO' : '❌ DESACTIVADO'
        const welcomeType = chat.sWelcome ? '✅ PERSONALIZADO' : '⚙️ PREDETERMINADO'
        const byeType = chat.sBye ? '✅ PERSONALIZADO' : '⚙️ PREDETERMINADO'
        
        const info = `
📊 *CONFIGURACIÓN ACTUAL DEL GRUPO*

🏷️ *Grupo:* ${groupMetadata.subject}
👥 *Miembros:* ${groupMetadata.participants.length}
🔧 *Estado:* ${estado} ${chat.welcome === true && !chat.sWelcome ? '(predeterminado)' : ''}

🎉 *BIENVENIDA:*
• Tipo: ${welcomeType}
${chat.sWelcome ? `• Mensaje:\n${chat.sWelcome.substring(0, 80)}${chat.sWelcome.length > 80 ? '...' : ''}` : ''}

😢 *DESPEDIDA:*
• Tipo: ${byeType}
${chat.sBye ? `• Mensaje:\n${chat.sBye.substring(0, 80)}${chat.sBye.length > 80 ? '...' : ''}` : ''}

💡 *Comandos útiles:*
• ${usedPrefix}testwelcome → Probar bienvenida
• ${usedPrefix}testbye → Probar despedida
• ${usedPrefix}setgp → Ver todos los comandos
        `.trim()
        
        return m.reply(info)
    }
    
    // RESET WELCOME
    if (command === 'resetwelcome') {
        delete chat.sWelcome
        return m.reply('✅ *Bienvenida restablecida*\n\nAhora se usará el mensaje predeterminado de Asta-Bot.')
    }
    
    // RESET BYE
    if (command === 'resetbye') {
        delete chat.sBye
        return m.reply('✅ *Despedida restablecida*\n\nAhora se usará el mensaje predeterminado de Asta-Bot.')
    }
}

// ==================== EXPORTACIÓN ====================
handler.help = [
    'welcome on/off',
    'setwelcome <mensaje>',
    'setbye <mensaje>',
    'testwelcome',
    'testbye',
    'mywelcome',
    'resetwelcome',
    'resetbye',
    'setgp'
]

handler.tags = ['group']
handler.command = [
    'welcome', 
    'setwelcome', 
    'setbye', 
    'testwelcome', 
    'testbye', 
    'mywelcome', 
    'resetwelcome', 
    'resetbye',
    'setgp'
]

handler.group = true
handler.admin = true

export default handler