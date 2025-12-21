import fs from 'fs'
import { WAMessageStubType } from '@whiskeysockets/baileys'

async function generarBienvenida({ conn, userId, groupMetadata, chat }) {
    const username = `@${userId.split('@')[0]}`
    const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')
    const groupSize = groupMetadata.participants.length
    
    // Si el usuario configuró un mensaje, lo usamos. Si no, usamos el diseño por defecto.
    const textoCustom = chat.sWelcome ? chat.sWelcome
        .replace(/{usuario}/g, `${username}`)
        .replace(/{grupo}/g, `${groupMetadata.subject}`)
        .replace(/{desc}/g, `${groupMetadata.desc || 'Sin descripción'}`)
        .replace(/{cantidad}/g, `${groupSize}`)
        : `╭━〔🎅 ASTA-BOT 🎄 〕─╮\n┋\n┋「 🎁 ¡BIENVENIDO/A! 🦌 」\n┋\n┋ 「 *🎄 ${groupMetadata.subject} 🎄* 」\n┋\n╰━★ 「 🎀 ${username} 🎀 」\n╭━━━━━━━━━━\n┋🎶 Revisa la descripción\n┋✨ ¡Disfruta del grupo!\n┋🦌 Miembros: ${groupSize}\n┗━━━━━━━━━━━━━━━━━━━━━🎅`

    return { pp, caption: textoCustom, mentions: [userId] }
}

async function generarDespedida({ conn, userId, groupMetadata, chat }) {
    const username = `@${userId.split('@')[0]}`
    const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')
    const groupSize = groupMetadata.participants.length
    
    const textoCustom = chat.sBye ? chat.sBye
        .replace(/{usuario}/g, `${username}`)
        .replace(/{grupo}/g, `${groupMetadata.subject}`)
        .replace(/{desc}/g, `${groupMetadata.desc || 'Sin descripción'}`)
        .replace(/{cantidad}/g, `${groupSize}`)
        : `╭━〔🎅 ASTA-BOT 🎄 〕─╮\n┋\n┋「 ❄️ ¡ADIÓS! 🎁 」\n┋\n┋ 「 *🎄 ${groupMetadata.subject} 🎄* 」\n┋\n╰━★ 「 🎀 ${username} 🎀 」\n╭━━━━━━━━━━\n┋✨ ¡Esperamos verte pronto!\n┗━━━━━━━━━━━━━━━━━━━━━🎅`

    return { pp, caption: textoCustom, mentions: [userId] }
}

let handler = m => m
handler.before = async function (m, { conn, participants, groupMetadata }) {
    if (!m.messageStubType || !m.isGroup) return !0
    const chat = global.db.data.chats[m.chat]
    const userId = m.messageStubParameters[0]

    if (chat.welcome && m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_ADD) {
        const { pp, caption, mentions } = await generarBienvenida({ conn, userId, groupMetadata, chat })
        // Usamos m.chat para enviar el mensaje al grupo correspondiente
        await conn.sendMessage(m.chat, { image: { url: pp }, caption, mentions }, { quoted: null })
    }

    if (chat.welcome && (m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_LEAVE)) {
        const { pp, caption, mentions } = await generarDespedida({ conn, userId, groupMetadata, chat })
        await conn.sendMessage(m.chat, { image: { url: pp }, caption, mentions }, { quoted: null })
    }
}

export { generarBienvenida, generarDespedida }
export default handler
