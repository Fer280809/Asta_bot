//by orion wolf | Victor Manuel 💪🏻
let handler = async (m, { conn, command, usedPrefix, text, args }) => {
    let chat = global.db.data.chats[m.chat]
    if (!chat.muted) chat.muted = []

    // --- FUNCIÓN: VER LISTA ---
    if (command === 'mutelist' || args[0] === 'list') {
        if (chat.muted.length === 0) return m.reply('❄️ No hay elfos silenciados en esta Villa.')
        let list = chat.muted.map((v, i) => `${i + 1}. @${v.split`@`[0]}`).join('\n')
        return conn.reply(m.chat, `📜 *LISTA DE SILENCIO (MUTE)*\n━━━━━━━━━━━━━━━━━━━━━━━\n${list}\n━━━━━━━━━━━━━━━━━━━━━━━\n> Usa ${usedPrefix}unmute @usuario para perdonar.`, m, { mentions: chat.muted })
    }

    // --- IDENTIFICAR USUARIO ---
    let who = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
    
    if (!who && (command === 'mute' || command === 'unmute')) {
        return conn.sendMessage(m.chat, {
            text: `❄️ *MENÚ DE SILENCIO*\n━━━━━━━━━━━━━━━━━━━━━━━\nDebes etiquetar a alguien o responder a un mensaje.\n\n✨ *Acciones rápidas:*`,
            buttons: [
                { buttonId: `${usedPrefix}mutelist`, buttonText: { displayText: '📜 Ver Muteados' }, type: 1 }
            ],
            headerType: 1
        }, { quoted: m })
    }

    // --- COMANDO: MUTE ---
    if (command === 'mute' || command === 'silenciar') {
        if (chat.muted.includes(who)) return m.reply('🌟 Este elfo ya está silenciado.')
        
        const groupMetadata = await conn.groupMetadata(m.chat)
        const isAdmin = groupMetadata.participants.find(p => p.id === who)?.admin
        if (isAdmin) return m.reply('⚠️ No puedes silenciar a un *Elfo Mayor* (Admin).')

        chat.muted.push(who)
        await m.react('🔇')
        
        await conn.sendMessage(m.chat, {
            text: `🤐 *ELFO SILENCIADO* ✨\n━━━━━━━━━━━━━━━━━━━━━━━\n@${who.split`@`[0]} ha sido enviado al rincón del silencio.\n━━━━━━━━━━━━━━━━━━━━━━━`,
            buttons: [
                { buttonId: `${usedPrefix}unmute @${who.split`@`[0]}`, buttonText: { displayText: '🔊 Desmutear' }, type: 1 },
                { buttonId: `${usedPrefix}mutelist`, buttonText: { displayText: '📜 Ver Lista' }, type: 1 }
            ],
            mentions: [who],
            headerType: 1
        }, { quoted: m })
    }

    // --- COMANDO: UNMUTE ---
    if (command === 'unmute' || command === 'desmutear') {
        if (!chat.muted.includes(who)) return m.reply('❄️ Este elfo no está en la lista de silencio.')
        
        chat.muted = chat.muted.filter(u => u !== who)
        await m.react('🔊')
        m.reply(`🔔 *ELFO PERDONADO*\n━━━━━━━━━━━━━━━━━━━━━━━\n@${who.split`@`[0]} puede volver a hablar en la Villa.`, null, { mentions: [who] })
    }
}

handler.help = ['mute', 'unmute', 'mutelist']
handler.tags = ['grupo']
handler.command = ['mute', 'silenciar', 'unmute', 'desmutear', 'mutelist']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
