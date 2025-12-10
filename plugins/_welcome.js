import fs from 'fs'
import { WAMessageStubType } from '@whiskeysockets/baileys'

async function generarBienvenida({ conn, userId, groupMetadata, chat }) {
    const username = `@${userId.split('@')[0]}`
    const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')
    const groupSize = groupMetadata.participants.length + 1
    const mensaje = (chat.sWelcome || 'Edita con el comando "setwelcome"')
        .replace(/{usuario}/g, `${username}`)
        .replace(/{grupo}/g, `${groupMetadata.subject}`)
        .replace(/{desc}/g, `${groupMetadata.desc || 'Sin descripción'}`)

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
 ┗━━━━━━━━━━━━━━━┅ ⳹
`
    return { pp, caption, mentions: [userId] }
}

async function generarDespedida({ conn, userId, groupMetadata, chat }) {
    const username = `@${userId.split('@')[0]}`
    const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')
    const groupSize = groupMetadata.participants.length - 1
    const mensaje = (chat.sBye || 'Edita con el comando "setbye"')
        .replace(/{usuario}/g, `${username}`)
        .replace(/{grupo}/g, `${groupMetadata.subject}`)
        .replace(/{desc}/g, `${groupMetadata.desc || 'Sin descripción'}`)

    const caption = `
╭━〔👑 *ASTA-BOT 👑 〕* 
 ┋ 
 ┋「 😢 *¡ADIOS! 👋 」* 
 ┋ 
 ┋ 「 *${groupMetadata.subject}* 」 
 ┋ 
 ╰━★ 「 ${username} 」 
 *╭━━━━━━ * 
 ┋❖ Un miembro menos 😢
 ┋❀ Te extrañaremos en el grupo * 
 ┋❖ Ahora somos ${groupSize} miembros
 ┗━━━━━━━━━━━━━━━┅ ⳹
`
    return { pp, caption, mentions: [userId] }
}

let handler = m => m
handler.before = async function (m, { conn, participants, groupMetadata }) {
    if (!m.messageStubType || !m.isGroup) return !0
    const primaryBot = global.db.data.chats[m.chat].primaryBot
    if (primaryBot && conn.user.jid !== primaryBot) throw !1
    const chat = global.db.data.chats[m.chat]
    const userId = m.messageStubParameters[0]

    if (chat.welcome && m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_ADD) {
        const { pp, caption, mentions } = await generarBienvenida({ conn, userId, groupMetadata, chat })
        rcanal.contextInfo.mentionedJid = mentions
        await conn.sendMessage(m.chat, { image: { url: pp }, caption, ...rcanal }, { quoted: null })
        try { fs.unlinkSync(img) } catch {}
    }

    if (chat.welcome && (m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_LEAVE)) {
        const { pp, caption, mentions } = await generarDespedida({ conn, userId, groupMetadata, chat })
        rcanal.contextInfo.mentionedJid = mentions
        await conn.sendMessage(m.chat, { image: { url: pp }, caption, ...rcanal }, { quoted: null })
        try { fs.unlinkSync(img) } catch {}
    }
}

export { generarBienvenida, generarDespedida }
export default handler
