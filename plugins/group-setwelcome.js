import fetch from 'node-fetch'
import fs from 'fs'
import { generarBienvenida, generarDespedida } from './_welcome.js'

const handler = async (m, { conn, command, usedPrefix, text, groupMetadata }) => {
    const value = text ? text.trim() : ''
    const chat = global.db.data.chats[m.chat]

    if (command === 'setgp') {
        return m.reply(`🏰 *GESTIÓN DE LA VILLA*\n\nUsa los comandos para decorar tu grupo:\n✨ *${usedPrefix}setwelcome* (Texto de entrada)\n✨ *${usedPrefix}setbye* (Texto de salida)\n✨ *${usedPrefix}testwelcome* (Probar bienvenida)\n✨ *${usedPrefix}testbye* (Probar despedida)`)
    }

    try {
        switch (command) {
            case 'setwelcome': {
                if (!value) return m.reply(`❄️ *¡Falta el mensaje!*\nUsa variables: {usuario}, {grupo}, {desc}\n\n*Ejemplo:* ${usedPrefix}setwelcome ¡Bienvenido {usuario} al Taller de Santa!`)
                chat.sWelcome = value
                m.reply('✅ *¡Bienvenida establecida!* Los nuevos elfos ahora recibirán este mensaje.')
                break
            }
            case 'setbye': {
                if (!value) return m.reply(`❄️ *¡Falta el mensaje!*\nUsa variables: {usuario}, {grupo}, {desc}\n\n*Ejemplo:* ${usedPrefix}setbye Adiós {usuario}, que tengas un feliz viaje.`)
                chat.sBye = value
                m.reply('✅ *¡Despedida establecida!* Se ha guardado el mensaje de salida.')
                break
            }
            case 'testwelcome': {
                if (!chat.sWelcome) return m.reply('⚠️ No hay mensaje de bienvenida configurado.')
                await m.react('⏳')
                const { pp, caption, mentions } = await generarBienvenida({ conn, userId: m.sender, groupMetadata, chat })
                await conn.sendMessage(m.chat, { image: { url: pp }, caption, mentions }, { quoted: m })
                if (fs.existsSync(pp)) fs.unlinkSync(pp)
                break
            }
            case 'testbye': {
                if (!chat.sBye) return m.reply('⚠️ No hay mensaje de despedida configurado.')
                await m.react('⏳')
                const { pp, caption, mentions } = await generarDespedida({ conn, userId: m.sender, groupMetadata, chat })
                await conn.sendMessage(m.chat, { image: { url: pp }, caption, mentions }, { quoted: m })
                if (fs.existsSync(pp)) fs.unlinkSync(pp)
                break
            }
        }
    } catch (e) {
        m.reply(`⚠️ *¡Error en el taller!* No se pudo procesar la imagen.\n${e.message}`)
    }
}

handler.help = ['setwelcome', 'setbye', 'testwelcome', 'testbye']
handler.tags = ['group']
handler.command = ['setgp', 'setwelcome', 'setbye', 'testwelcome', 'testbye']
handler.admin = true
handler.group = true

export default handler
