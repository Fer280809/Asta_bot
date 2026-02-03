import { readdirSync, unlinkSync, existsSync, promises as fs } from 'fs'
import path from 'path'
import cp from 'child_process'
import { promisify } from 'util'
import moment from 'moment-timezone'
import fetch from 'node-fetch'
const exec = promisify(cp.exec).bind(cp)
const linkRegex = /https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i

const handler = async (m, { conn, text, command, usedPrefix, args }) => {
try {
    const nombre = m.pushName || 'Anónimo'
    const tag = '@' + m.sender.split('@')[0]
    const usertag = Array.from(new Set([...text.matchAll(/@(\d{5,})/g)]), m => `${m[1]}@s.whatsapp.net`)
    const chatLabel = m.isGroup ? (await conn.getName(m.chat) || 'Grupal') : 'Privado'
    const horario = `${moment.tz('America/Caracas').format('DD/MM/YYYY hh:mm:ss A')}`

    switch (command) {

        // ================== SUGGEST ==================
        case 'suggest': case 'sug': {
            if (!text) return conn.reply(m.chat, '❌ Escribe la sugerencia que quieres enviar al propietario del Bot.', m)
            if (text.length < 10) return conn.reply(m.chat, '⚠️ La sugerencia debe tener más de 10 caracteres.', m)
            await m.react('🕒')
            const sug = `╭━〔📝 *SUGERENCIA ENVIADA* 📝〕━╮
┃
┃ Usuario: ${nombre}
┃ Tag: ${tag}
┃ Sugerencia: ${text}
┃ Chat: ${chatLabel}
┃ Fecha: ${horario}
┃ InfoBot: ${botname} / ${vs}
╰━━━━━━━━━━━━╯`
            await conn.sendMessage(`${suittag}@s.whatsapp.net`, { text: sug, mentions: [m.sender, ...usertag] }, { quoted: m })
            await m.react('✔️')
            return m.reply('✔️ La sugerencia ha sido enviada al desarrollador. ¡Gracias por contribuir a mejorar el Bot!')
        }

        // ================== REPORT ==================
        case 'report': case 'reportar': {
            if (!text) return conn.reply(m.chat, '❌ Por favor, ingresa el error que deseas reportar.', m)
            if (text.length < 10) return conn.reply(m.chat, '⚠️ Especifique mejor el error, mínimo 10 caracteres.', m)
            await m.react('🕒')
            const rep = `╭━〔🐞 *REPORTE RECIBIDO* 🐞〕━╮
┃
┃ Usuario: ${nombre}
┃ Tag: ${tag}
┃ Reporte: ${text}
┃ Chat: ${chatLabel}
┃ Fecha: ${horario}
┃ InfoBot: ${botname} / ${vs}
╰━━━━━━━━━━━━╯`
            await conn.sendMessage(`${suittag}@s.whatsapp.net`, { text: rep, mentions: [m.sender, ...usertag] }, { quoted: m })
            await m.react('✔️')
            return m.reply('✔️ El informe ha sido enviado al desarrollador. Evita reportes falsos, podrían generar restricciones en el Bot.')
        }

        // ================== INVITE ==================
        case 'invite': {
            if (!text) return m.reply('❌ Debes enviar un enlace para invitar el Bot a tu grupo.')
            let [_, code] = text.match(linkRegex) || []
            if (!code) return m.reply('⚠️ El enlace de invitación no es válido.')
            await m.react('🕒')
            const invite = `╭━〔🎯 *INVITACIÓN RECIBIDA* 🎯〕━╮
┃
┃ Usuario: ${nombre}
┃ Tag: ${tag}
┃ Chat: ${chatLabel}
┃ Fecha: ${horario}
┃ InfoBot: ${botname} / ${vs}
┃ Link: ${text}
╰━━━━━━━━━━━━╯`
            const mainBotNumber = global.conn.user.jid.split('@')[0]
            const senderBotNumber = conn.user.jid.split('@')[0]
            if (mainBotNumber === senderBotNumber)
                await conn.sendMessage(`${suittag}@s.whatsapp.net`, { text: invite, mentions: [m.sender, ...usertag] }, { quoted: m })
            else
                await conn.sendMessage(`${senderBotNumber}@s.whatsapp.net`, { text: invite, mentions: [m.sender, ...usertag] }, { quoted: m })
            await m.react('✔️')
            return m.reply('✔️ El enlace fue enviado correctamente. ¡Gracias por tu invitación! ฅ^•ﻌ•^ฅ')
        }

        // ================== SPEEDTEST ==================
        case 'speedtest': case 'stest': {
            await m.react('🕒')
            const o = await exec('python3 ./lib/ookla-speedtest.py --secure --share')
            const { stdout, stderr } = o
            if (stdout.trim()) {
                const url = stdout.match(/http[^"]+\.png/)?.[0]
                if (url) await conn.sendMessage(m.chat, { image: { url }, caption: `╭━〔📶 *RESULTADO SPEEDTEST* 📶〕━╮\n┃ ${stdout.trim()}\n╰━━━━━━━━━━━━╯` }, { quoted: m })
            }
            if (stderr.trim()) {
                const url2 = stderr.match(/http[^"]+\.png/)?.[0]
                if (url2) await conn.sendMessage(m.chat, { image: { url: url2 }, caption: `╭━〔📶 *RESULTADO SPEEDTEST* 📶〕━╮\n┃ ${stderr.trim()}\n╰━━━━━━━━━━━━╯` }, { quoted: m })
            }
            await m.react('✔️')
            break
        }

        // ================== FIXMSG ==================
        case 'fixmsg': case 'ds': {
            if (global.conn.user.jid !== conn.user.jid)
                return conn.reply(m.chat, '❌ Usa este comando en el número principal del Bot.', m)
            await m.react('🕒')
            const chatIdList = m.isGroup ? [m.chat, m.sender] : [m.sender]
            const sessionPath = './Sessions/'
            let files = await fs.readdir(sessionPath)
            let count = 0
            for (let file of files) {
                for (let id of chatIdList) {
                    if (file.includes(id.split('@')[0])) {
                        await fs.unlink(path.join(sessionPath, file))
                        count++
                        break
                    }
                }
            }
            await m.react(count === 0 ? '✖️' : '✔️')
            return conn.reply(m.chat, count === 0 ? '⚠️ No se encontraron archivos relacionados con tu ID.' : `✔️ Se eliminaron ${count} archivos de sesión.`, m)
        }

        // ================== SCRIPT ==================
        case 'script': case 'sc': {
            await m.react('🕒')
            const res = await fetch('https://api.github.com/repos/Fer280809/Asta_bot')
            if (!res.ok) throw new Error('⚠️ No se pudo obtener los datos del repositorio.')
            const json = await res.json()
            const txt = `╭━〔📂 *SCRIPT DEL BOT* 📂〕━╮
┃
┃ Nombre: ${json.name}
┃ Visitas: ${json.watchers_count}
┃ Peso: ${(json.size / 1024).toFixed(2)} MB
┃ Actualizado: ${moment(json.updated_at).format('DD/MM/YY - HH:mm:ss')}
┃ Url: ${json.html_url}
┃ Forks: ${json.forks_count}
┃ Stars: ${json.stargazers_count}
┃ Desarrollador: ${dev}
╰━━━━━━━━━━━━╯`
            await conn.sendMessage(m.chat, { image: catalogo, caption: txt, ...rcanal }, { quoted: m })
            await m.react('✔️')
            break
        }
    }
} catch (err) {
    await m.react('✖️')
    return conn.reply(m.chat, `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${err.message}`, m)
}}

handler.help = ['suggest', 'reporte', 'invite', 'speedtest', 'fixmsg', 'script']
handler.tags = ['main']
handler.command = ['suggest', 'sug', 'report', 'reportar', 'invite', 'speedtest', 'stest', 'fixmsg', 'ds', 'script', 'sc']

export default handler
