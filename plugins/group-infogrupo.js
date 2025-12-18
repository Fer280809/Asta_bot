import { promises as fs } from 'fs'

const handler = async (m, { conn, participants, groupMetadata, usedPrefix }) => {
    const chat = global.db.data.chats[m.chat]
    const pp = await conn.profilePictureUrl(m.chat, 'image').catch(() => 'https://files.catbox.moe/xr2m6u.jpg')
    
    // Extracción de datos con lógica mejorada
    const { antiLink, detect, welcome, modoadmin, nsfw, isBanned, economy, gacha } = chat
    const groupAdmins = participants.filter(p => p.admin)
    const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net'
    
    const creador = (!owner || owner.startsWith('1203')) ? 'Desconocido' : `@${owner.split('@')[0]}`
    const totalreg = Object.keys(global.db.data.users).length

    // Formateo de opciones con iconos visuales
    const check = (v) => v ? '✅' : '❌'

    const infoTexto = `
📋 *INFORMACIÓN DEL GRUPO*
━━━━━━━━━━━━━━━━━━━━━━━

👥 *ESTRUCTURA:*
> 📌 *Nombre:* ${groupMetadata.subject}
> 👑 *Propietario:* ${creador}
> 👤 *Miembros:* ${participants.length} usuario(s)
> ⭐ *Administradores:* ${groupAdmins.length} admins

⚙️ *CONFIGURACIONES:*
> 🤖 *Estado Bot:* ${isBanned ? '🔴 Desactivado' : '🟢 Activo'}
> 🏠 *Bienvenida:* ${check(welcome)}
> 🔍 *Detección:* ${check(detect)}
> 🔗 *Anti-Enlace:* ${check(antiLink)}
> 🔞 *Contenido Adulto:* ${check(nsfw)}
> 💰 *Economía:* ${check(economy)}
> 🎮 *Sistema Gacha:* ${check(gacha)}

📝 *MENSAJE DE BIENVENIDA:*
"${chat.sWelcome || 'No configurado'}"

━━━━━━━━━━━━━━━━━━━━━━━
*Total de usuarios en la base:* ${totalreg.toLocaleString()}
『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡`.trim()

    // Enviar con imagen y botones interactivos
    await conn.sendMessage(m.chat, {
        image: { url: pp },
        caption: infoTexto,
        footer: "Asta-Bot • Gestión de Grupos",
        mentions: [owner, m.sender],
        buttons: [
            { 
                buttonId: `${usedPrefix}admins`, 
                buttonText: { displayText: '⭐ Ver Admins' }, 
                type: 1 
            },
            { 
                buttonId: `${usedPrefix}config`, 
                buttonText: { displayText: '⚙️ Configurar' }, 
                type: 1 
            }
        ],
        headerType: 4
    }, { quoted: m })

    await m.react('📋')
}

// MISMOS HELP, TAGS, COMMAND
handler.help = ['infogrupo']
handler.tags = ['grupo']
handler.command = ['infogrupo', 'gp', 'groupinfo']
handler.group = true

export default handler
