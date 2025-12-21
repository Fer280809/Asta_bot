import { generarBienvenida, generarDespedida } from './_welcome.js'

const handler = async (m, { conn, command, usedPrefix, text, groupMetadata }) => {
    const chat = global.db.data.chats[m.chat]

    if (command === 'setgp') {
        return m.reply(`🏰 *GESTIÓN DE LA VILLA*\n\nUsa:\n✨ *${usedPrefix}setwelcome* <texto>\n✨ *${usedPrefix}setbye* <texto>\n\n*Variables:* {usuario}, {grupo}, {cantidad}`)
    }

    if (command === 'setwelcome') {
        if (!text) return m.reply(`❄️ *¡Falta el mensaje!*\nEjemplo: ${usedPrefix}setwelcome Hola {usuario}, bienvenido a {grupo}`)
        chat.sWelcome = text
        m.reply('✅ *¡Bienvenida establecida!*')
    }

    if (command === 'setbye') {
        if (!text) return m.reply(`❄️ *¡Falta el mensaje!*\nEjemplo: ${usedPrefix}setbye Adiós {usuario}`)
        chat.sBye = text
        m.reply('✅ *¡Despedida establecida!*')
    }

    if (command === 'testwelcome' || command === 'testbye') {
        await m.react('⏳')
        const isWelcome = command === 'testwelcome'
        const { pp, caption, mentions } = isWelcome 
            ? await generarBienvenida({ conn, userId: m.sender, groupMetadata, chat })
            : await generarDespedida({ conn, userId: m.sender, groupMetadata, chat })
        
        await conn.sendMessage(m.chat, { image: { url: pp }, caption, mentions }, { quoted: m })
    }
}

handler.help = ['setwelcome', 'setbye', 'testwelcome', 'testbye']
handler.tags = ['group']
handler.command = ['setgp', 'setwelcome', 'setbye', 'testwelcome', 'testbye']
handler.admin = true
handler.group = true

export default handler
