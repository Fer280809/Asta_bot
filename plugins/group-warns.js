const handler = async (m, { conn, text, command, usedPrefix, groupMetadata }) => {
    try {
        const pp = await conn.profilePictureUrl(m.chat, 'image').catch(() => 'https://files.catbox.moe/xr2m6u.jpg')
        let who = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        
        // Definición de Owners
        const ownerGroup = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
        const ownerBot = global.owner[0][0] + '@s.whatsapp.net'

        switch (command) {
            case 'advertencia': case 'warn': case 'addwarn': {
                if (!who) return m.reply(`⚠️ *¿A quién advertir?*\nEtiqueta a alguien o responde a su mensaje.\n\n*Ejemplo:* ${usedPrefix + command} @usuario (motivo)`)
                
                // Inicializar usuario en DB si no existe
                if (!global.db.data.users[who]) global.db.data.users[who] = { warn: 0 }
                let user = global.db.data.users[who]

                // Protecciones de jerarquía
                if (who === conn.user.jid) return m.reply('❌ No puedo advertirme a mí mismo.')
                if (who === ownerGroup) return m.reply('⭐ No puedo advertir al Propietario del grupo.')
                if (who === ownerBot) return m.reply('👑 No puedo advertir a mi Creador.')

                const motivo = text ? text.replace(/@\d+/g, '').trim() : 'Sin especificar'
                
                user.warn += 1

                await m.reply(`⚠️ *ADVERTENCIA APLICADA* ⚠️\n━━━━━━━━━━━━━━━━━━━━━━━\n*Usuario:* @${who.split`@`[0]}\n*Motivo:* ${motivo}\n*Advertencias:* [ ${user.warn} / 3 ]\n━━━━━━━━━━━━━━━━━━━━━━━`, null, { mentions: [who] })

                if (user.warn >= 3) {
                    user.warn = 0
                    await m.reply(`🚫 *LÍMITE ALCANZADO*\n@${who.split`@`[0]} acumuló 3 advertencias y será expulsado del grupo.`, null, { mentions: [who] })
                    await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
                }
                break
            }

            case 'delwarn': case 'unwarn': {
                if (!who) return m.reply(`⚠️ *¿A quién quitar advertencia?*\nEtiqueta al usuario.`)
                let user = global.db.data.users[who]
                
                if (!user || user.warn === 0) return m.reply('✅ Este usuario no tiene advertencias.')
                
                user.warn -= 1
                await m.reply(`✅ *ADVERTENCIA REMOVIDA*\nSe ha retirado una advertencia a @${who.split`@`[0]}.\n*Actual:* [ ${user.warn} / 3 ]`, null, { mentions: [who] })
                break
            }

            case 'listadv': case 'advlist': {
                const usuarios = global.db.data.users
                const advertidos = Object.entries(usuarios).filter(([jid, u]) => u.warn > 0 && m.chat.includes(m.chat)) // Filtro simple para el grupo
                
                if (advertidos.length === 0) return m.reply('📭 No hay usuarios con advertencias en este grupo.')

                let listadvs = `📋 *LISTA DE ADVERTENCIAS*\n\n`
                advertidos.forEach(([jid, u]) => {
                    listadvs += `● @${jid.split`@`[0]} : *(${u.warn}/3)*\n`
                })
                listadvs += `\n> Eviten acumular 3 advertencias para no ser expulsados.`

                await conn.sendMessage(m.chat, { image: { url: pp }, caption: listadvs, mentions: advertidos.map(v => v[0]) }, { quoted: m })
                break
            }
        }
    } catch (error) {
        m.reply(`⚠️ *Error* No se pudo procesar la advertencia.\n${error.message}`)
    }
}

// MISMOS COMMANDS, PERMISOS
handler.command = ['advertencia', 'warn', 'addwarn', 'delwarn', 'unwarn', 'listadv', 'advlist']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
