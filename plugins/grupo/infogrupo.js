import { promises as fs } from 'fs'

const handler = async (m, { conn, participants, groupMetadata }) => {
    const chat = global.db.data.chats[m.chat]
    const pp = await conn.profilePictureUrl(m.chat, 'image').catch(() => 'https://files.catbox.moe/xr2m6u.jpg')
    const { antiLink, detect, welcome, sWelcome, sBye, modoadmin, nsfw, isBanned, economy, gacha } = chat
    const groupAdmins = participants.filter(p => p.admin)
    const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net'
    const creador = (!owner || owner.startsWith('1203') || owner.length < 15) ? 'No encontrado' : `@${owner.split('@')[0]}`
    const rawPrimary = typeof chat.primaryBot === 'string' ? chat.primaryBot : '';
    const botprimary = rawPrimary.endsWith('@s.whatsapp.net') ? `@${rawPrimary.split('@')[0]}` : 'Aleatorio';  
    const totalreg = Object.keys(global.db.data.users).length

    const text = `╭━〔👑 *INFORMACIÓN DEL GRUPO* 👑〕━╮
 ┃
 ┃ ❀ *Nombre* » ${groupMetadata.subject}
 ┃ ❀ *Creador* » ${creador}
 ┃ ✦ *Miembros* » ${participants.length} Participantes
 ┃ ꕥ *Admins* » ${groupAdmins.length}
 ┃ ☆ *Registrados* » ${totalreg.toLocaleString()}
 ┃ ❖ *Bot principal* » ${botprimary}
 ┃
 ┃ *▢ Opciones del Bot:*
 ┃ > ◆ *${botname}* » ${isBanned ? '✗ Desactivado' : '✓ Activado'}
 ┃ > ◆ *Welcome* » ${welcome ? '✓ Activado' : '✗ Desactivado'}
 ┃ > ◆ *Alertas* » ${detect ? '✓ Activado' : '✗ Desactivado'}
 ┃ > ◆ *Anti-Link* » ${antiLink ? '✓ Activado' : '✗ Desactivado'}
 ┃ > ◆ *Only-Admin* » ${modoadmin ? '✓ Activado' : '✗ Desactivado'}
 ┃ > ◆ *NSFW* » ${nsfw ? '✓ Activado' : '✗ Desactivado'}
 ┃ > ◆ *Gacha* » ${gacha ? '✓ Activado' : '✗ Desactivado'}
 ┃ > ◆ *Economy* » ${economy ? '✓ Activado' : '✗ Desactivado'}
 ┃
 ┃ *▢ Mensajes configurados:*
 ┃ > ● *Welcome* » ${(sWelcome || 'Sin mensaje de bienvenida').replace(/{usuario}/g, `@${m.sender.split('@')[0]}`).replace(/{grupo}/g, `*${groupMetadata.subject}*`).replace(/{desc}/g, `*${groupMetadata.desc || 'Sin descripción'}*`)}
 ┃ > ● *Bye* » ${(sBye || 'Sin mensaje de despedida').replace(/{usuario}/g, `@${m.sender.split('@')[0]}`).replace(/{grupo}/g, `*${groupMetadata.subject}*`).replace(/{desc}/g, `*${groupMetadata.desc || 'Sin descripción'}*`)}
 ╰━━━━━━━━━━━━━━╯`

    conn.sendFile(m.chat, pp, 'img.jpg', text, m, false, { mentions: [owner, rawPrimary, m.sender] })
}

handler.help = ['infogrupo']
handler.tags = ['grupo']
handler.command = ['infogrupo', 'gp']
handler.group = true

export default handler
