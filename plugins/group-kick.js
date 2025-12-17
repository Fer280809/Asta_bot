global.kicknumRunning = global.kicknumRunning || {}

const handler = async (m, { conn, args, participants, usedPrefix, command }) => {
    const delay = ms => new Promise(res => setTimeout(res, ms))
    
    // --- 1. LÓGICA DE DETECCIÓN (EL CEREBRO) ---
    let user = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
    let text = args[0] ? args[0].replace(/[^0-9]/g, '') : ''

    // --- 2. FUNCIÓN: STOP (DETENER LIMPIEZA) ---
    if (command === 'stopkick') {
        if (!global.kicknumRunning[m.chat]) return m.reply('❄️ No hay ninguna limpieza en curso.')
        global.kicknumRunning[m.chat] = false
        return m.reply('🛑 *Proceso detenido.*')
    }

    // --- 3. FUNCIÓN: KICK INDIVIDUAL (Cita, Tag o Número Largo) ---
    // Si hay un usuario detectado o el texto es un número de teléfono largo
    if (user || text.length >= 10) {
        let target = user || (text + '@s.whatsapp.net')
        
        const groupInfo = await conn.groupMetadata(m.chat)
        const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
        const ownerBot = global.owner[0][0] + '@s.whatsapp.net'

        if (target === conn.user.jid) return m.reply('❌ No puedo expulsarme a mí mismo.')
        if (target === ownerGroup || target === ownerBot) return m.reply('🎁 No puedo expulsar a un Dueño.')
        
        const isAdmin = participants.find(p => p.id === target)?.admin
        if (isAdmin) return m.reply('⭐ Es admin, quítale el rango primero.')

        await conn.groupParticipantsUpdate(m.chat, [target], 'remove')
        return m.reply(`✅ @${target.split('@')[0]} fue enviado al Polo Norte.`, null, { mentions: [target] })
    }

    // --- 4. FUNCIÓN: KICK MASIVO (Prefijo corto) ---
    if (text.length > 0 && text.length < 7) {
        const prefijo = text
        const targets = participants.map(u => u.id).filter(v => v !== conn.user.jid && v.startsWith(prefijo))

        if (targets.length === 0) return m.reply(`❄️ No hay nadie con el prefijo +${prefijo}.`)

        // Si el comando es directamente kicknum, ejecuta. Si no, pregunta con botones.
        if (command === 'kicknum') {
            if (global.kicknumRunning[m.chat]) return m.reply('⚠️ Ya hay una limpieza activa.')
            global.kicknumRunning[m.chat] = true
            
            await m.reply(`🚀 *Iniciando limpieza masiva (+${prefijo})...*`)
            for (let target of targets) {
                if (!global.kicknumRunning[m.chat]) break
                if (participants.find(p => p.id === target)?.admin) continue 
                await conn.groupParticipantsUpdate(m.chat, [target], 'remove')
                await delay(3000)
            }
            global.kicknumRunning[m.chat] = false
            return m.reply('✅ Limpieza terminada.')
        }

        // Menú de decisión para el Prefijo
        return await conn.sendMessage(m.chat, {
            text: `⚠️ *DETECCIÓN DE PREFIJO +${prefijo}*\n\nHe encontrado *${targets.length}* usuarios. ¿Qué deseas hacer?`,
            buttons: [
                { buttonId: `${usedPrefix}listnum ${prefijo}`, buttonText: { displayText: '📋 Ver Lista' }, type: 1 },
                { buttonId: `${usedPrefix}kicknum ${prefijo}`, buttonText: { displayText: '🚀 Expulsar Todos' }, type: 1 }
            ]
        }, { quoted: m })
    }

    // --- 5. FUNCIÓN: LISTAR (Opcional) ---
    if (command === 'listnum' && text) {
        const targets = participants.map(u => u.id).filter(v => v !== conn.user.jid && v.startsWith(text))
        return m.reply(`📋 *LISTA +${text}:*\n${targets.map(v => '@' + v.split('@')[0]).join('\n')}`, null, { mentions: targets })
    }

    // Si no mandó nada
    m.reply(`*¿A quién expulsamos?*\n\n1. Responde a un mensaje.\n2. Etiqueta: \`${usedPrefix}kick @user\`\n3. Por número: \`${usedPrefix}kick 346000000\`\n4. Por prefijo: \`${usedPrefix}kick 212\``)
}

handler.help = ['kick']
handler.tags = ['grupo']
handler.command = ['kick', 'echar', 'sacar', 'kicknum', 'listnum', 'stopkick', 'listanum']

handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
