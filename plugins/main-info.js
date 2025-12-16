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
    // ==============================================
    // SISTEMA DE TEMAS FESTIVOS PARA COMANDOS
    // ==============================================
    
    function getFestiveTheme() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        
        // 🎄 Navidad
        if (month === 12 && day >= 1 && day <= 26) {
            return {
                name: 'navidad',
                main: '🎄',
                secondary: '❄️',
                accent: '🎅',
                highlight: '🎁',
                check: '✅',
                clock: '⏰',
                error: '❌',
                warning: '⚠️',
                report: '🐞',
                invite: '🎯',
                speed: '📶',
                script: '📂',
                suggest: '📝',
                success: '✔️',
                borderStart: '╭━〔',
                borderEnd: '〕━╮',
                line: '┃'
            };
        }
        
        // 🎆 Año Nuevo
        if ((month === 12 && day >= 27) || (month === 1 && day <= 5)) {
            return {
                name: 'año_nuevo',
                main: '🎆',
                secondary: '✨',
                accent: '🥂',
                highlight: '🎇',
                check: '✅',
                clock: '⏳',
                error: '❌',
                warning: '⚠️',
                report: '🚨',
                invite: '🤝',
                speed: '⚡',
                script: '📦',
                suggest: '💡',
                success: '🌟',
                borderStart: '╭━〔',
                borderEnd: '〕━╮',
                line: '┃'
            };
        }
        
        // ❤️ San Valentín
        if (month === 2 && day >= 10 && day <= 15) {
            return {
                name: 'san_valentin',
                main: '❤️',
                secondary: '💖',
                accent: '💝',
                highlight: '💌',
                check: '✅',
                clock: '💘',
                error: '💔',
                warning: '⚠️',
                report: '🔧',
                invite: '💑',
                speed: '💨',
                script: '📚',
                suggest: '✨',
                success: '💖',
                borderStart: '╭━〔',
                borderEnd: '〕━╮',
                line: '┃'
            };
        }
        
        // 🎃 Halloween
        if (month === 10 && day >= 25 && day <= 31) {
            return {
                name: 'halloween',
                main: '🎃',
                secondary: '👻',
                accent: '🕷️',
                highlight: '🍬',
                check: '✅',
                clock: '🦇',
                error: '💀',
                warning: '⚠️',
                report: '🕸️',
                invite: '👹',
                speed: '⚡',
                script: '📜',
                suggest: '🔮',
                success: '👍',
                borderStart: '╭━〔',
                borderEnd: '〕━╮',
                line: '┃'
            };
        }
        
        // Tema normal
        return {
            name: 'normal',
            main: '⚡',
            secondary: '✨',
            accent: '🎭',
            highlight: '💎',
            check: '✅',
            clock: '🕒',
            error: '❌',
            warning: '⚠️',
            report: '🐞',
            invite: '🎯',
            speed: '📶',
            script: '📂',
            suggest: '📝',
            success: '✔️',
            borderStart: '╭━〔',
            borderEnd: '〕━╮',
            line: '┃'
        };
    }
    
    const theme = getFestiveTheme();
    const nombre = m.pushName || 'Anónimo';
    const tag = '@' + m.sender.split('@')[0];
    const usertag = Array.from(new Set([...text.matchAll(/@(\d{5,})/g)]), m => `${m[1]}@s.whatsapp.net`);
    const chatLabel = m.isGroup ? (await conn.getName(m.chat) || 'Grupal') : 'Privado';
    const horario = `${moment.tz('America/Caracas').format('DD/MM/YYYY hh:mm:ss A')}`;

    switch (command) {

        // ================== SUGGEST ==================
        case 'suggest': case 'sug': {
            if (!text) return conn.reply(m.chat, `${theme.error} Escribe la sugerencia que quieres enviar al propietario del Bot.`, m);
            if (text.length < 10) return conn.reply(m.chat, `${theme.warning} La sugerencia debe tener más de 10 caracteres.`, m);
            await m.react(theme.clock);
            
            const sug = `${theme.borderStart}${theme.suggest} *SUGERENCIA ENVIADA* ${theme.suggest}${theme.borderEnd}
${theme.line}
${theme.line} Usuario: ${nombre}
${theme.line} Tag: ${tag}
${theme.line} Sugerencia: ${text}
${theme.line} Chat: ${chatLabel}
${theme.line} Fecha: ${horario}
${theme.line} InfoBot: ${botname} / ${vs}
╰━━━━━━━━━━━━╯`;
            
            await conn.sendMessage(`${suittag}@s.whatsapp.net`, { text: sug, mentions: [m.sender, ...usertag] }, { quoted: m });
            await m.react(theme.success);
            return m.reply(`${theme.success} La sugerencia ha sido enviada al desarrollador. ${theme.highlight}¡Gracias por contribuir a mejorar el Bot!`);
        }

        // ================== REPORT ==================
        case 'report': case 'reportar': {
            if (!text) return conn.reply(m.chat, `${theme.error} Por favor, ingresa el error que deseas reportar.`, m);
            if (text.length < 10) return conn.reply(m.chat, `${theme.warning} Especifique mejor el error, mínimo 10 caracteres.`, m);
            await m.react(theme.clock);
            
            const rep = `${theme.borderStart}${theme.report} *REPORTE RECIBIDO* ${theme.report}${theme.borderEnd}
${theme.line}
${theme.line} Usuario: ${nombre}
${theme.line} Tag: ${tag}
${theme.line} Reporte: ${text}
${theme.line} Chat: ${chatLabel}
${theme.line} Fecha: ${horario}
${theme.line} InfoBot: ${botname} / ${vs}
╰━━━━━━━━━━━━╯`;
            
            await conn.sendMessage(`${suittag}@s.whatsapp.net`, { text: rep, mentions: [m.sender, ...usertag] }, { quoted: m });
            await m.react(theme.success);
            return m.reply(`${theme.success} El informe ha sido enviado al desarrollador. ${theme.warning}Evita reportes falsos, podrían generar restricciones en el Bot.`);
        }

        // ================== INVITE ==================
        case 'invite': {
            if (!text) return m.reply(`${theme.error} Debes enviar un enlace para invitar el Bot a tu grupo.`);
            let [_, code] = text.match(linkRegex) || [];
            if (!code) return m.reply(`${theme.warning} El enlace de invitación no es válido.`);
            await m.react(theme.clock);
            
            const invite = `${theme.borderStart}${theme.invite} *INVITACIÓN RECIBIDA* ${theme.invite}${theme.borderEnd}
${theme.line}
${theme.line} Usuario: ${nombre}
${theme.line} Tag: ${tag}
${theme.line} Chat: ${chatLabel}
${theme.line} Fecha: ${horario}
${theme.line} InfoBot: ${botname} / ${vs}
${theme.line} Link: ${text}
╰━━━━━━━━━━━━╯`;
            
            const mainBotNumber = global.conn.user.jid.split('@')[0];
            const senderBotNumber = conn.user.jid.split('@')[0];
            
            if (mainBotNumber === senderBotNumber)
                await conn.sendMessage(`${suittag}@s.whatsapp.net`, { text: invite, mentions: [m.sender, ...usertag] }, { quoted: m });
            else
                await conn.sendMessage(`${senderBotNumber}@s.whatsapp.net`, { text: invite, mentions: [m.sender, ...usertag] }, { quoted: m });
            
            await m.react(theme.success);
            return m.reply(`${theme.success} El enlace fue enviado correctamente. ${theme.accent}¡Gracias por tu invitación! ฅ^•ﻌ•^ฅ`);
        }

        // ================== SPEEDTEST ==================
        case 'speedtest': case 'stest': {
            await m.react(theme.clock);
            const o = await exec('python3 ./lib/ookla-speedtest.py --secure --share');
            const { stdout, stderr } = o;
            
            if (stdout.trim()) {
                const url = stdout.match(/http[^"]+\.png/)?.[0];
                if (url) await conn.sendMessage(m.chat, { 
                    image: { url }, 
                    caption: `${theme.borderStart}${theme.speed} *RESULTADO SPEEDTEST* ${theme.speed}${theme.borderEnd}\n${theme.line} ${stdout.trim()}\n╰━━━━━━━━━━━━╯`
                }, { quoted: m });
            }
            
            if (stderr.trim()) {
                const url2 = stderr.match(/http[^"]+\.png/)?.[0];
                if (url2) await conn.sendMessage(m.chat, { 
                    image: { url: url2 }, 
                    caption: `${theme.borderStart}${theme.speed} *RESULTADO SPEEDTEST* ${theme.speed}${theme.borderEnd}\n${theme.line} ${stderr.trim()}\n╰━━━━━━━━━━━━╯`
                }, { quoted: m });
            }
            
            await m.react(theme.success);
            break;
        }

        // ================== FIXMSG ==================
        case 'fixmsg': case 'ds': {
            if (global.conn.user.jid !== conn.user.jid)
                return conn.reply(m.chat, `${theme.error} Usa este comando en el número principal del Bot.`, m);
            
            await m.react(theme.clock);
            const chatIdList = m.isGroup ? [m.chat, m.sender] : [m.sender];
            const sessionPath = './Sessions/';
            let files = await fs.readdir(sessionPath);
            let count = 0;
            
            for (let file of files) {
                for (let id of chatIdList) {
                    if (file.includes(id.split('@')[0])) {
                        await fs.unlink(path.join(sessionPath, file));
                        count++;
                        break;
                    }
                }
            }
            
            await m.react(count === 0 ? theme.error : theme.success);
            return conn.reply(m.chat, count === 0 ? 
                `${theme.warning} No se encontraron archivos relacionados con tu ID.` : 
                `${theme.success} Se eliminaron ${count} archivos de sesión.`, m);
        }

        // ================== SCRIPT ==================
        case 'script': case 'sc': {
            await m.react(theme.clock);
            const res = await fetch('https://api.github.com/repos/Fer280809/Asta_bot');
            if (!res.ok) throw new Error(`${theme.warning} No se pudo obtener los datos del repositorio.`);
            
            const json = await res.json();
            const txt = `${theme.borderStart}${theme.script} *SCRIPT DEL BOT* ${theme.script}${theme.borderEnd}
${theme.line}
${theme.line} Nombre: ${json.name}
${theme.line} Visitas: ${json.watchers_count}
${theme.line} Peso: ${(json.size / 1024).toFixed(2)} MB
${theme.line} Actualizado: ${moment(json.updated_at).format('DD/MM/YY - HH:mm:ss')}
${theme.line} Url: ${json.html_url}
${theme.line} Forks: ${json.forks_count}
${theme.line} Stars: ${json.stargazers_count}
${theme.line} Desarrollador: ${dev}
╰━━━━━━━━━━━━╯`;
            
            await conn.sendMessage(m.chat, { image: catalogo, caption: txt, ...rcanal }, { quoted: m });
            await m.react(theme.success);
            break;
        }
    }
} catch (err) {
    await m.react('✖️');
    return conn.reply(m.chat, `${theme.warning} Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${err.message}`, m);
}}

handler.help = ['suggest', 'reporte', 'invite', 'speedtest', 'fixmsg', 'script']
handler.tags = ['main']
handler.command = ['suggest', 'sug', 'report', 'reportar', 'invite', 'speedtest', 'stest', 'fixmsg', 'ds', 'script', 'sc']

export default handler
