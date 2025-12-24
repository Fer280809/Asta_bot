handler = async (m, { conn, command, usedPrefix, text, args }) => {
    let chat = global.db.data.chats[m.chat]
    if (!chat.muted) chat.muted = []

    // --- FUNCIÓN: VER LISTA ---
    if (command === 'mutelist' || args[0] === 'list') {
        if (chat.muted.length === 0) {
            return m.reply('❄️ No hay usuarios silenciados en este grupo.')
        }
        let list = chat.muted.map((v, i) => `${i + 1}. @${v.split`@`[0]}`).join('\n')
        return conn.reply(m.chat, `📜 *LISTA DE USUARIOS SILENCIADOS*\n━━━━━━━━━━━━━━━━━━━━━━━\n${list}\n━━━━━━━━━━━━━━━━━━━━━━━\n> Usa ${usedPrefix}unmute @usuario para desilenciar.`, m, { mentions: chat.muted })
    }

    // --- IDENTIFICAR USUARIO ---
    let who = m.mentionedJid && m.mentionedJid[0] || m.quoted && m.quoted.sender || null
    
    if (!who && (command === 'mute' || command === 'unmute')) {
        return conn.sendMessage(m.chat, {
            text: `❄️ *MENÚ DE MUTE*\n━━━━━━━━━━━━━━━━━━━━━━━\nDebes etiquetar a alguien o responder a un mensaje.\n\n✨ *Acciones rápidas:*`,
            buttons: [
                { buttonId: `${usedPrefix}mutelist`, buttonText: { displayText: '📜 Ver Silenciados' }, type: 1 }
            ],
            headerType: 1
        }, { quoted: m })
    }

    // --- COMANDO: MUTE ---
    if (command === 'mute' || command === 'silenciar') {
        if (who === conn.user.jid) return m.reply('⚠️ No puedo silenciarme a mí mismo.')
        if (chat.muted.includes(who)) return m.reply('🌟 Este usuario ya está silenciado.')
        
        try {
            const groupMetadata = await conn.groupMetadata(m.chat)
            const isAdmin = groupMetadata.participants.find(p => p.id === who)?.admin
            if (isAdmin) return m.reply('⚠️ No puedes silenciar a un *administrador* del grupo.')
        } catch (e) {
            console.error(`Error obteniendo metadatos del grupo: ${e.message}`)
            return m.reply('⚠️ No pude obtener los datos del grupo para verificar el estado del usuario.')
        }

        chat.muted.push(who)
        await m.react('🔇')
        
        await conn.sendMessage(m.chat, {
            text: `🤐 *USUARIO SILENCIADO* ✨\n━━━━━━━━━━━━━━━━━━━━━━━\n@${who.split`@`[0]} ha sido silenciado.\n━━━━━━━━━━━━━━━━━━━━━━━`,
            buttons: [
                { buttonId: `${usedPrefix}unmute @${who.split`@`[0]}`, buttonText: { displayText: '🔊 Desilenciar' }, type: 1 },
                { buttonId: `${usedPrefix}mutelist`, buttonText: { displayText: '📜 Ver Lista' }, type: 1 }
            ],
            mentions: [who],
            headerType: 1
        }, { quoted: m })
    }

    // --- COMANDO: UNMUTE ---
    if (command === 'unmute' || command === 'desmutear') {
        if (!chat.muted.includes(who)) {
            return m.reply('❄️ Este usuario no está en la lista de silenciados.')
        }
        
        chat.muted = chat.muted.filter(u => u !== who)
        await m.react('🔊')
        await conn.reply(m.chat, `🔔 *USUARIO DESILENCIADO*\n━━━━━━━━━━━━━━━━━━━━━━━\n@${who.split`@`[0]} ya puede hablar.`, m, { mentions: [who] })
    }
}

handler.help = ['mute', 'unmute', 'mutelist']
handler.tags = ['group']
handler.command = ['mute', 'silenciar', 'unmute', 'desmutear', 'mutelist']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
