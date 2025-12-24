const handler = async (m, { conn, isAdmin, groupMetadata, usedPrefix, isBotAdmin, isROwner, text, args, participants }) => {
    if (!isROwner) return
    if (!isBotAdmin) return m.reply(`❌ El bot debe ser administrador para usar este comando`)
    
    const helpMessage = `⚙️ *COMANDO AUTOADMIN - MENÚ DE AYUDA*

📌 *Sintaxis:* ${usedPrefix}autoadmin [opción] [@usuario]

🎯 *Opciones disponibles:*
┌─ *1. ${usedPrefix}autoadmin*
│  ╰─ Auto-promoción a administrador
├─ *2. ${usedPrefix}autoadmin admin*
│  ╰─ Auto-promoción a administrador
├─ *3. ${usedPrefix}autoadmin owner*
│  ╰─ Auto-promoción a dueño (si el bot es creador)
├─ *4. ${usedPrefix}autoadmin @usuario*
│  ╰─ Promover a otro usuario como admin
├─ *5. ${usedPrefix}autoadmin owner @usuario*
│  ╰─ Hacer dueño a otro usuario
├─ *6. ${usedPrefix}autoadmin demote @usuario*
│  ╰─ Quitar admin a un usuario
├─ *7. ${usedPrefix}autoadmin list*
│  ╰─ Ver lista de admins actuales
└─ *8. ${usedPrefix}autoadmin help*
   ╰─ Mostrar este menú

💡 *Notas:*
• Para hacer "dueño", el bot debe ser el creador del grupo
• Solo el dueño del bot puede usar este comando`

    // Mostrar ayuda si no hay argumentos o si pide help
    if (!text || args[0] === 'help') {
        return m.reply(helpMessage)
    }

    const action = args[0].toLowerCase()
    let targetUser = m.mentionedJid[0] || args[1] || m.sender
    
    // Listar administradores
    if (action === 'list') {
        const groupAdmins = participants.filter(p => p.admin).map(p => p.id)
        const adminList = groupAdmins.map(id => `@${id.split('@')[0]}`).join('\n')
        return m.reply(`👥 *ADMINISTRADORES DEL GRUPO*\n\n${adminList || 'No hay administradores'}`, null, {
            mentions: groupAdmins
        })
    }

    // Quitar administrador (demote)
    if (action === 'demote') {
        if (!m.mentionedJid[0]) return m.reply(`❌ Debes mencionar al usuario para quitarle admin\nEjemplo: ${usedPrefix}autoadmin demote @usuario`)
        
        try {
            await m.react('🔄')
            await conn.groupParticipantsUpdate(m.chat, [targetUser], 'demote')
            await m.react('✅')
            return m.reply(`🔻 *Usuario degradado*\n@${targetUser.split('@')[0]} ya no es administrador`, null, {
                mentions: [targetUser]
            })
        } catch (error) {
            await m.react('❌')
            return m.reply(`⚠️ Error al degradar usuario:\n${error.message}`)
        }
    }

    // Verificar si ya es admin para evitar operaciones innecesarias
    const userIsAdmin = participants.find(p => p.id === targetUser)?.admin || false
    
    // Auto-promoción (sin argumentos o con "admin")
    if (action === 'admin' || !m.mentionedJid[0] && !['owner', 'demote', 'list'].includes(action)) {
        if (userIsAdmin && targetUser === m.sender) {
            return m.reply(`ℹ️ Ya tienes privilegios de administrador.`)
        }
        
        try {
            await m.react('⏳')
            await conn.groupParticipantsUpdate(m.chat, [targetUser], 'promote')
            await m.react('✅')
            return m.reply(`👑 *Auto-promoción exitosa*\n@${targetUser.split('@')[0]} ahora es administrador`, null, {
                mentions: [targetUser]
            })
        } catch (error) {
            await m.react('❌')
            return m.reply(`⚠️ Error al auto-promover:\n${error.message}`)
        }
    }

    // Promover a dueño (owner)
    if (action === 'owner') {
        // Verificar si el bot es el creador del grupo
        const groupInfo = await conn.groupMetadata(m.chat)
        const botIsCreator = groupInfo.owner === conn.user.jid
        
        if (!botIsCreator) {
            return m.reply(`❌ Esta función solo está disponible si el bot es el creador del grupo`)
        }
        
        // En WhatsApp no se puede "transferir" propiedad directamente
        // Pero podemos intentar promocionar al usuario y darle todos los permisos
        if (userIsAdmin) {
            return m.reply(`ℹ️ @${targetUser.split('@')[0]} ya es administrador.`, null, {
                mentions: [targetUser]
            })
        }
        
        try {
            await m.react('👑')
            await conn.groupParticipantsUpdate(m.chat, [targetUser], 'promote')
            await m.react('✅')
            
            // Mensaje especial para "dueño"
            return m.reply(`👑 *NUEVO DUEÑO DESIGNADO*\n\n@${targetUser.split('@')[0]} ha sido promovido a dueño del grupo.\n\n⚠️ *Nota:* En WhatsApp no existe el rol de "dueño", pero tiene privilegios de administrador total.`, null, {
                mentions: [targetUser]
            })
        } catch (error) {
            await m.react('❌')
            return m.reply(`⚠️ Error al designar dueño:\n${error.message}`)
        }
    }

    // Promover a otro usuario mencionado
    if (m.mentionedJid[0]) {
        if (userIsAdmin) {
            return m.reply(`ℹ️ @${targetUser.split('@')[0]} ya es administrador.`, null, {
                mentions: [targetUser]
            })
        }
        
        try {
            await m.react('🔺')
            await conn.groupParticipantsUpdate(m.chat, [targetUser], 'promote')
            await m.react('✅')
            return m.reply(`📈 *Usuario promovido*\n@${targetUser.split('@')[0]} ahora es administrador`, null, {
                mentions: [targetUser]
            })
        } catch (error) {
            await m.react('❌')
            return m.reply(`⚠️ Error al promover usuario:\n${error.message}`)
        }
    }
}

handler.tags = ['owner', 'grupo']
handler.help = ['autoadmin [admin/owner/demote/list] [@usuario]']
handler.command = ['autoadmin', 'autoadmin']
handler.group = true
handler.botAdmin = true

export default handler

/*const handler = async (m, { conn, isAdmin, groupMetadata, usedPrefix, isBotAdmin, isROwner }) => {
if (!isROwner) return
if (!isBotAdmin) return
if (isAdmin) return m.reply(`❀ Ya tienes privilegios de administrador.`)
try {
await m.react('🕒')
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote')
await m.react('✔️')
m.reply(`❀ Fuiste agregado como admin del grupo con exito.`)
} catch (error) {
await m.react('✖️')
m.reply(`⚠︎ Se ha producido un problema\n> Usa *${usedPrefix}report* para informarlo\n\n${error.message}`)
}}

handler.tags = ['owner']
handler.help = ['autoadmin']
handler.command = ['autoadmin']
handler.group = true

export default handler
*/
