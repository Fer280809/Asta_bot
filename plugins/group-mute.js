let handler = async (m, { conn, command, usedPrefix, text, args, isAdmin, isBotAdmin }) => {
    let chat = global.db.data.chats[m.chat]
    if (!chat.muted) chat.muted = []

    // 🎁 FUNCIÓN: VER LISTA DE NAVIDAD
    if (command === 'mutelist' || args[0] === 'list') {
        if (chat.muted.length === 0) {
            return m.reply('🎄 *Lista de Carbón Vacía*\n━━━━━━━━━━━━━━━━━━━━━━━\n¡Por suerte todos se han portado bien! Nadie está en la lista de carbón.')
        }
        let list = chat.muted.map((v, i) => `${i + 1}. 🎅 @${v.split`@`[0]}`).join('\n')
        return conn.reply(m.chat, 
            `🎅 *LISTA DE CARBÓN NAVIDEÑO*\n━━━━━━━━━━━━━━━━━━━━━━━\n${list}\n━━━━━━━━━━━━━━━━━━━━━━━\n✨ Usa ${usedPrefix}unmute @usuario para darles un regalo de nuevo.`,
            m, 
            { mentions: chat.muted }
        )
    }

    // 🎄 IDENTIFICAR AL GRINCH
    let who = m.mentionedJid && m.mentionedJid[0] || m.quoted && m.quoted.sender || null
    
    if (!who && (command === 'mute' || command === 'unmute')) {
        return conn.sendMessage(m.chat, {
            text: `🎅 *FÁBRICA DE REGALOS SANTA*\n━━━━━━━━━━━━━━━━━━━━━━━\nDebes etiquetar a alguien o responder a un mensaje.\n\n🌟 *Opciones navideñas:*`,
            buttons: [
                { buttonId: `${usedPrefix}mutelist`, buttonText: { displayText: '📜 Ver Lista de Carbón' }, type: 1 }
            ],
            headerType: 1
        }, { quoted: m })
    }

    // 🎁 COMANDO: MUTE (DAR CARBÓN)
    if (command === 'mute' || command === 'silenciar') {
        if (who === conn.user.jid) return m.reply('🦌 ¡No puedo darme carbón a mí mismo! Soy el ayudante de Santa.')
        if (who === m.sender) return m.reply('🎄 ¡No puedes darte carbón a ti mismo! Eso sería muy triste.')
        if (chat.muted.includes(who)) return m.reply('❄️ Este elfo ya tiene suficiente carbón en su calcetín.')
        
        // Verificar si es un elfo importante
        try {
            const groupMetadata = await conn.groupMetadata(m.chat)
            const participant = groupMetadata.participants.find(p => p.id === who)
            
            if (!participant) {
                return m.reply('🎁 Este duende no está en el taller de Santa.')
            }
            
            if (participant.admin === 'admin' || participant.admin === 'superadmin') {
                return m.reply('🎅 ¡No puedes dar carbón a uno de los *elfos mayores* del taller!')
            }
            
            // Verificar si quien da el carbón es un elfo mayor
            const senderParticipant = groupMetadata.participants.find(p => p.id === m.sender)
            if (!senderParticipant || (!senderParticipant.admin && !isOwner && !isROwner)) {
                return m.reply('🔔 Solo los elfos mayores pueden repartir carbón.')
            }
            
        } catch (e) {
            console.error(`Error en el taller: ${e.message}`)
            return m.reply('🎄 ¡El trineo tuvo un problema! Intenta de nuevo.')
        }

        // Añadir a la lista de carbón
        chat.muted.push(who)
        await m.react('🪵')
        
        // Notificar al taller
        await conn.sendMessage(m.chat, {
            text: `🪵 *¡CARBÓN ENTREGADO!*\n━━━━━━━━━━━━━━━━━━━━━━━\n@${who.split`@`[0]} recibió carbón en su calcetín.\n\n🎁 Sus mensajes serán como regalos perdidos.\n✨ Para cambiar por regalos: ${usedPrefix}unmute @${who.split`@`[0]}\n━━━━━━━━━━━━━━━━━━━━━━━`,
            mentions: [who]
        }, { quoted: m })
        
        // Notificar al duende silenciado
        try {
            await conn.sendMessage(who, {
                text: `🎄 *¡OH NO! CARBÓN NAVIDEÑO*\n\nHas recibido carbón en el taller *${m.chatName || 'de Santa'}*.\n\n🏠 Taller: ${m.chatName || 'Taller Mágico'}\n🎅 Por: @${m.sender.split`@`[0]}\n\nTus mensajes desaparecerán como copos de nieve hasta que seas perdonado.`,
                mentions: [m.sender]
            })
        } catch (dmErr) {
            console.log('[MUTE] El trineo no pudo entregar el mensaje')
        }
    }

    // 🎄 COMANDO: UNMUTE (REGALO ESPECIAL)
    if (command === 'unmute' || command === 'desmutear') {
        if (!chat.muted.includes(who)) {
            return m.reply('✨ ¡Este elfo ya tiene sus regalos! No está en la lista de carbón.')
        }
        
        // Verificar permisos de elfo mayor
        try {
            const groupMetadata = await conn.groupMetadata(m.chat)
            const senderParticipant = groupMetadata.participants.find(p => p.id === m.sender)
            if (!senderParticipant || (!senderParticipant.admin && !isOwner && !isROwner)) {
                return m.reply('🔔 Solo los elfos mayores pueden dar regalos especiales.')
            }
        } catch (e) {
            console.error(`Error en la fábrica: ${e.message}`)
        }
        
        // Cambiar carbón por regalos
        chat.muted = chat.muted.filter(u => u !== who)
        await m.react('🎁')
        
        // Anunciar en el taller
        await conn.reply(m.chat, 
            `🎁 *¡REGALO ESPECIAL!*\n━━━━━━━━━━━━━━━━━━━━━━━\n@${who.split`@`[0]} cambió su carbón por regalos mágicos.\n\n✨ Ahora puede cantar villancicos normalmente.`,
            m, 
            { mentions: [who] }
        )
        
        // Notificar al duende feliz
        try {
            await conn.sendMessage(who, {
                text: `🌟 *¡FELICIDADES!*\n\nSanta te ha perdonado en el taller *${m.chatName || 'navideño'}*.\n\n🎄 ¡Tu carbón se convirtió en regalos!\n🔔 Ahora puedes compartir la magia navideña.`
            })
        } catch (dmErr) {
            console.log('[UNMUTE] El duende no recibió la noticia')
        }
    }
}

// 🎅 Configuración del Comando Navideño
handler.help = ['mute @usuario', 'unmute @usuario', 'mutelist']
handler.tags = ['group']
handler.command = ['mute', 'silenciar', 'unmute', 'desmutear', 'mutelist']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
