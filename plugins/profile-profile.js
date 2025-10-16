import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'
import fetch from 'node-fetch'

let handler = async (m, { conn, args }) => {
    try {
        let texto = await m.mentionedJid
        let userId = texto.length > 0 ? texto[0] : (m.quoted ? await m.quoted.sender : m.sender)
        let name = await (async () => global.db.data.users[userId].name || (async () => {
            try {
                const n = await conn.getName(userId)
                return typeof n === 'string' && n.trim() ? n : userId.split('@')[0]
            } catch {
                return userId.split('@')[0]
            }
        })())()

        if (!global.db.data.users) global.db.data.users = {}
        if (!global.db.data.characters) global.db.data.characters = {}
        if (!global.db.data.users[userId]) global.db.data.users[userId] = {}

        const user = global.db.data.users[userId]
        const cumpleanos = user.birth || 'Sin especificar 🎂'
        const genero = user.genre || 'Sin especificar ⚥'
        const pareja = user.marry
        const casado = await (async () => pareja ? (global.db.data.users[pareja]?.name?.trim() || await conn.getName(pareja).then(n => typeof n === 'string' && n.trim() ? n : pareja.split('@')[0]).catch(() => pareja.split('@')[0])) : 'Nadie 💔')()
        const description = user.description || 'Sin descripción 😶'
        const exp = user.exp || 0
        const nivel = user.level || 0
        const coin = user.coin || 0
        const bank = user.bank || 0
        const total = coin + bank
        const sorted = Object.entries(global.db.data.users).map(([k, v]) => ({ ...v, jid: k })).sort((a, b) => (b.level || 0) - (a.level || 0))
        const rank = sorted.findIndex(u => u.jid === userId) + 1
        const progreso = (() => {
            let datos = xpRange(nivel, global.multiplier)
            return `${exp - datos.min} => ${datos.xp} _(${Math.floor(((exp - datos.min) / datos.xp) * 100)}%)_`
        })()
        const premium = user.premium || global.prems.map(v => v.replace(/\D+/g, '') + '@s.whatsapp.net').includes(userId)
        const isLeft = premium ? (global.prems.includes(userId.split('@')[0]) ? 'Permanente ♾️' : (user.premiumTime ? await formatTime(user.premiumTime - Date.now()) : '—')) : '—'
        const favId = user.favorite
        const favLine = favId && global.db.data.characters?.[favId] ? `\n🎯 Claim favorito » *${global.db.data.characters[favId].name || '???'}*` : ''
        const ownedIDs = Object.entries(global.db.data.characters).filter(([, c]) => c.user === userId).map(([id]) => id)
        const haremCount = ownedIDs.length
        const haremValue = ownedIDs.reduce((acc, id) => {
            const char = global.db.data.characters[id] || {}
            const value = typeof char.value === 'number' ? char.value : 0
            return acc + value
        }, 0)

        const pp = await conn.profilePictureUrl(userId, 'image').catch(_ => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')

        const text = `
✨🌟 *「 Perfil de ${name} 」* 🌟✨

📝 *Descripción:* ${description}

🎂 *Cumpleaños:* ${cumpleanos}
⚥ *Género:* ${genero}
💖 *Casado con:* ${casado}

🌱 *Experiencia:* ${exp.toLocaleString()} XP
🏆 *Nivel:* ${nivel}
🎖️ *Rango:* #${rank}
📊 *Progreso:* ${progreso}
💎 *Premium:* ${premium ? `✔️ (${isLeft})` : '✖️'}

👑 *Harem:* ${haremCount} personajes
💰 *Valor total del Harem:* ${haremValue.toLocaleString()}
${favLine}

💰 *Coins totales:* ¥${total.toLocaleString()} ${currency}
🛠️ *Comandos usados:* ${user.commands || 0}

────────────────────────
🌟 ¡Sigue jugando para subir de nivel y descubrir más secretos! 🚀
`

        await conn.sendMessage(m.chat, { image: { url: pp }, caption: text, mentions: [userId] }, { quoted: fkontak })
    } catch (error) {
        await m.reply(`⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${error.message}`, m)
    }
}

handler.help = ['profile']
handler.tags = ['rg']
handler.command = ['profile', 'perfil', 'perfíl']
handler.group = true

export default handler

async function formatTime(ms) {
    let s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24)
    let months = Math.floor(d / 30), weeks = Math.floor((d % 30) / 7)
    s %= 60; m %= 60; h %= 24; d %= 7
    let t = months ? [`${months} mes${months > 1 ? 'es' : ''}`] :
            weeks ? [`${weeks} semana${weeks > 1 ? 's' : ''}`] :
            d ? [`${d} día${d > 1 ? 's' : ''}`] : []
    if (h) t.push(`${h} hora${h > 1 ? 's' : ''}`)
    if (m) t.push(`${m} minuto${m > 1 ? 's' : ''}`)
    if (s) t.push(`${s} segundo${s !== 1 ? 's' : ''}`)
    return t.length > 1 ? t.slice(0, -1).join(' ') + ' y ' + t.slice(-1) : t[0]
}
