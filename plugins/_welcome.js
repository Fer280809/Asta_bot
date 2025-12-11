const fs = require('fs')
const { WAMessageStubType } = require('@whiskeysockets/baileys')

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

// ==================== HANDLER DE EVENTOS ====================
const eventHandler = m => m
eventHandler.before = async function (m, { conn, groupMetadata }) {
    if (!m.messageStubType || !m.isGroup) return true

    // Asegurar que el chat existe y welcome esté activado por defecto
    let chat = global.db.data.chats[m.chat]
    if (!chat) {
        global.db.data.chats[m.chat] = {
            welcome: true,
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

    if (chat.welcome === undefined) {
        chat.welcome = true
    }

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

// ==================== COMANDOS ====================
const handler = async (m, { conn, command, text, usedPrefix, groupMetadata }) => {
    // Asegurar que el chat existe
    let chat = global.db.data.chats[m.chat]
    if (!chat) {
        global.db.data.chats[m.chat] = {
            welcome: true,
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
• ${usedPrefix}setwelcome <mensaje>
• ${usedPrefix}setbye <mensaje>
• ${usedPrefix}testwelcome
• ${usedPrefix}testbye
• ${usedPrefix}mywelcome
• ${usedPrefix}resetwelcome
• ${usedPrefix}resetbye
        `.trim()

        return m.reply(ayuda)
    }

    // ACTIVAR/DESACTIVAR WELCOME
    if (command === 'welcome') {
        const estado = text?.toLowerCase()
        if (estado === 'on') {
            chat.welcome = true
            return m.reply('✅ *Bienvenidas activadas*')
        } else if (estado === 'off') {
            chat.welcome = false
            return m.reply('❌ *Bienvenidas desactivadas*')
        } else {
            const estadoActual = chat.welcome ? '✅ ACTIVADO' : '❌ DESACTIVADO'
            return m.reply(`Estado: ${estadoActual}\nUsa: ${usedPrefix}welcome on/off`)
        }
    }

    // SET WELCOME
    if (command === 'setwelcome') {
        if (!text) {
            return m.reply(`❌ *Escribe un mensaje*\n\n📝 Ejemplo:\n${usedPrefix}setwelcome ¡Hola (usuario)! 👋`)
        }

        chat.sWelcome = text
        await m.reply(`✅ *Mensaje de bienvenida configurado*`)
    }

    // SET BYE
    if (command === 'setbye') {
        if (!text) {
            return m.reply(`❌ *Escribe un mensaje*\n\n📝 Ejemplo:\n${usedPrefix}setbye Adiós (usuario) 😢`)
        }

        chat.sBye = text
        await m.reply(`✅ *Mensaje de despedida configurado*`)
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
    }

    // MY WELCOME
    if (command === 'mywelcome') {
        const estado = chat.welcome ? '✅ ACTIVADO' : '❌ DESACTIVADO'
        const welcomeType = chat.sWelcome ? '✅ PERSONALIZADO' : '⚙️ PREDETERMINADO'
        const byeType = chat.sBye ? '✅ PERSONALIZADO' : '⚙️ PREDETERMINADO'

        const info = `
📊 *CONFIGURACIÓN ACTUAL*

🏷️ *Grupo:* ${groupMetadata.subject}
👥 *Miembros:* ${groupMetadata.participants.length}
🔧 *Estado:* ${estado}

🎉 *BIENVENIDA:* ${welcomeType}
😢 *DESPEDIDA:* ${byeType}
        `.trim()

        return m.reply(info)
    }

    // RESET WELCOME
    if (command === 'resetwelcome') {
        delete chat.sWelcome
        return m.reply('✅ *Bienvenida restablecida*')
    }

    // RESET BYE
    if (command === 'resetbye') {
        delete chat.sBye
        return m.reply('✅ *Despedida restablecida*')
    }
}

// ==================== EXPORTACIÓN COMMONJS ====================
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

// Asignar el eventHandler.before al handler principal
handler.before = eventHandler.before

module.exports = handler