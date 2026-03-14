import { areJidsSameUser } from '@whiskeysockets/baileys'

const handler = async (m, { conn, args, usedPrefix, command, groupMetadata }) => {
    // Verificar permisos
    if (!m.isGroup) return m.reply('✳️ Este comando solo funciona en grupos')
    
    const botAdmin = await conn.groupMetadata(m.chat).then(m => m.participants.find(p => areJidsSameUser(p.id, conn.user.jid)))
    if (!botAdmin || !botAdmin.admin) return m.reply('✳️ Necesito ser administrador para usar este comando')
    
    const senderAdmin = m.isGroup ? await conn.groupMetadata(m.chat).then(m => m.participants.find(p => areJidsSameUser(p.id, m.sender))) : null
    if (!senderAdmin || !senderAdmin.admin) return m.reply('✳️ Solo los administradores pueden usar este comando')

    // Obtener usuario a promover
    let who = m.mentionedJid && m.mentionedJid[0] 
        ? m.mentionedJid[0] 
        : m.quoted ? m.quoted.sender 
        : args[0] ? (args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net') 
        : null

    if (!who) return m.reply(`✳️ Menciona o responde al mensaje del usuario que quieres promover\n\n📌 Ejemplo:\n${usedPrefix + command} @usuario`)

    // Verificar que no se promueva a sí mismo
    if (areJidsSameUser(who, m.sender)) return m.reply('✳️ No puedes promoverte a ti mismo')
    
    // Verificar que no sea el bot
    if (areJidsSameUser(who, conn.user.jid)) return m.reply('✳️ No puedo promoverme a mí mismo')

    try {
        const participant = await conn.groupMetadata(m.chat).then(m => m.participants.find(p => areJidsSameUser(p.id, who)))
        
        if (!participant) return m.reply('✳️ El usuario no está en el grupo')
        if (participant.admin) return m.reply('✳️ El usuario ya es administrador')

        await conn.groupParticipantsUpdate(m.chat, [who], 'promote')
        
        // Obtener nombre del usuario
        let name = who.split('@')[0]
        try {
            const contact = await conn.getName(who)
            if (contact) name = contact
        } catch {}

        m.reply(`┏━━〔 👑 *ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀ* 〕━⬣\n┃\n┃ ✅ *${name}* ha sido ascendido\n┃ a administrador del grupo\n┃\n┗━━━━━━━━━━━━━━━━━━⬣`)
        
    } catch (error) {
        console.error('Error en promote:', error)
        m.reply(`❌ *Error:* ${error.message || 'No se pudo promover al usuario'}`)
    }
}

handler.help = ['promote', 'ascender', 'admin', 'daradmin']
handler.tags = ['group']
handler.command = ['promote', 'ascender', 'admin', 'daradmin', 'darpoder']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler