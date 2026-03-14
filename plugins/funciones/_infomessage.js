let WAMessageStubType = (await import('@whiskeysockets/baileys')).default
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const groupMetadataCache = new Map()
const lidCache = new Map()
const handler = m => m

handler.before = async function (m, { conn, participants, groupMetadata }) {
    if (!m.messageStubType || !m.isGroup) return
    const primaryBot = global.db.data.chats[m.chat].primaryBot
    if (primaryBot && conn.user.jid !== primaryBot) throw !1
    const chat = global.db.data.chats[m.chat]
    const users = m.messageStubParameters[0]
    const usuario = await resolveLidToRealJid(m?.sender, conn, m?.chat)
    const groupAdmins = participants.filter(p => p.admin)
    
    const rcanal = { 
        contextInfo: { 
            isForwarded: true, 
            forwardedNewsletterMessageInfo: { newsletterJid: channelRD.id, serverMessageId: '', newsletterName: channelRD.name }, 
            externalAdReply: { 
                title: "𐔌 . ⋮ ᗩ ᐯ I Տ O .ᐟ ֹ ₊ ꒱", 
                body: textbot, 
                mediaUrl: null, 
                description: null, 
                previewType: "PHOTO", 
                thumbnail: await (await fetch(icono)).buffer(), 
                sourceUrl: redes, 
                mediaType: 1, 
                renderLargerThumbnail: false 
            }, 
            mentionedJid: null 
        }
    }
    
    const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || 'https://files.catbox.moe/xr2m6u.jpg'

    // Mensajes editados
    const nombre = `╭━〔✦ NOMBRE DEL GRUPO CAMBIADO ✦〕━╮\n┃ > @${usuario.split('@')[0]} ha cambiado el nombre del grupo.\n┃ > Nuevo nombre: *${m.messageStubParameters[0]}*\n╰━━━━━━━━━━━━╯`
    const foto = `╭━〔✦ IMAGEN DEL GRUPO CAMBIADA ✦〕━╮\n┃ > Acción hecha por: @${usuario.split('@')[0]}\n╰━━━━━━━━━━━━╯`
    const edit = `╭━〔✦ CONFIGURACIÓN DE GRUPO ✦〕━╮\n┃ > @${usuario.split('@')[0]} ha permitido que ${m.messageStubParameters[0] == 'on' ? 'solo admins' : 'todos'} puedan configurar el grupo.\n╰━━━━━━━━━━━━╯`
    const newlink = `╭━〔✦ ENLACE RESTABLECIDO ✦〕━╮\n┃ > Acción hecha por: @${usuario.split('@')[0]}\n╰━━━━━━━━━━━━╯`
    const status = `╭━〔✦ ESTADO DEL GRUPO ✦〕━╮\n┃ > El grupo ha sido ${m.messageStubParameters[0] == 'on' ? '*cerrado*' : '*abierto*'} por @${usuario.split('@')[0]}\n┃ > Ahora ${m.messageStubParameters[0] == 'on' ? '*solo admins*' : '*todos*'} pueden enviar mensajes.\n╰━━━━━━━━━━━━╯`
    const admingp = `╭━〔✦ NUEVO ADMIN ✦〕━╮\n┃ > @${users.split('@')[0]} ahora es admin del grupo.\n┃ > Acción hecha por: @${usuario.split('@')[0]}\n╰━━━━━━━━━━━━╯`
    const noadmingp = `╭━〔✦ ADMIN REMOVIDO ✦〕━╮\n┃ > @${users.split('@')[0]} deja de ser admin del grupo.\n┃ > Acción hecha por: @${usuario.split('@')[0]}\n╰━━━━━━━━━━━━╯`

    // Eliminación de sesiones para evitar "undefined"
    if (chat.detect && m.messageStubType == 2) {
        const uniqid = (m.isGroup ? m.chat : m.sender).split('@')[0]
        const sessionPath = `./${sessions}/`
        for (const file of await fs.promises.readdir(sessionPath)) {
            if (file.includes(uniqid)) {
                await fs.promises.unlink(path.join(sessionPath, file))
                console.log(`${chalk.yellow.bold('✎ Delete!')} ${chalk.greenBright(`'${file}'`)}\n${chalk.redBright('Eliminado para evitar "undefined" en chat.')}`)
            }
        }
    }

    // Envío de mensajes según tipo de evento
    const mentions = [usuario, ...groupAdmins.map(v => v.id)]
    switch (m.messageStubType) {
        case 21: await this.sendMessage(m.chat, { text: nombre, ...rcanal, contextInfo: { ...rcanal.contextInfo, mentionedJid: mentions } }, { quoted: null }); break
        case 22: await this.sendMessage(m.chat, { image: { url: pp }, caption: foto, ...rcanal, contextInfo: { ...rcanal.contextInfo, mentionedJid: mentions } }, { quoted: null }); break
        case 23: await this.sendMessage(m.chat, { text: newlink, ...rcanal, contextInfo: { ...rcanal.contextInfo, mentionedJid: mentions } }, { quoted: null }); break
        case 25: await this.sendMessage(m.chat, { text: edit, ...rcanal, contextInfo: { ...rcanal.contextInfo, mentionedJid: mentions } }, { quoted: null }); break
        case 26: await this.sendMessage(m.chat, { text: status, ...rcanal, contextInfo: { ...rcanal.contextInfo, mentionedJid: mentions } }, { quoted: null }); break
        case 29: await this.sendMessage(m.chat, { text: admingp, ...rcanal, contextInfo: { ...rcanal.contextInfo, mentionedJid: [usuario, users, ...groupAdmins.map(v => v.id)].filter(Boolean) } }, { quoted: null }); return
        case 30: await this.sendMessage(m.chat, { text: noadmingp, ...rcanal, contextInfo: { ...rcanal.contextInfo, mentionedJid: [usuario, users, ...groupAdmins.map(v => v.id)].filter(Boolean) } }, { quoted: null }); break
        default:
            if (m.messageStubType != 2) {
                console.log({
                    messageStubType: m.messageStubType,
                    messageStubParameters: m.messageStubParameters,
                    type: WAMessageStubType[m.messageStubType]
                })
            }
    }
}

export default handler

// Función para resolver JID real de LID
async function resolveLidToRealJid(lid, conn, groupChatId, maxRetries = 3, retryDelay = 60000) {
    const inputJid = lid.toString()
    if (!inputJid.endsWith("@lid") || !groupChatId?.endsWith("@g.us")) { 
        return inputJid.includes("@") ? inputJid : `${inputJid}@s.whatsapp.net` 
    }
    if (lidCache.has(inputJid)) { return lidCache.get(inputJid) }
    const lidToFind = inputJid.split("@")[0]
    let attempts = 0
    while (attempts < maxRetries) {
        try {
            const metadata = await conn?.groupMetadata(groupChatId)
            if (!metadata?.participants) throw new Error("No se obtuvieron participantes")
            for (const participant of metadata.participants) {
                try {
                    if (!participant?.jid) continue
                    const contactDetails = await conn?.onWhatsApp(participant.jid)
                    if (!contactDetails?.[0]?.lid) continue
                    const possibleLid = contactDetails[0].lid.split("@")[0]
                    if (possibleLid === lidToFind) {
                        lidCache.set(inputJid, participant.jid)
                        return participant.jid
                    }
                } catch { continue }
            }
            lidCache.set(inputJid, inputJid)
            return inputJid
        } catch (e) {
            if (++attempts >= maxRetries) {
                lidCache.set(inputJid, inputJid)
                return inputJid
            }
            await new Promise(resolve => setTimeout(resolve, retryDelay))
        }
    }
    return inputJid
}
