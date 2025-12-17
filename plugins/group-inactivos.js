import { areJidsSameUser } from '@whiskeysockets/baileys'

var handler = async (m, { conn, text, participants, args, command, usedPrefix }) => {
    try {
        let member = participants.map(u => u.id)
        let total = 0
        let sider = []

        // 1. Lógica de búsqueda de inactivos
        for (let i = 0; i < member.length; i++) {
            let user = participants.find(u => u.id == member[i])
            if (!user) continue

            // Filtros: No admin, no bot, no mensajes registrados, no whitelist
            if ((typeof global.db.data.users[member[i]] == 'undefined' || global.db.data.users[member[i]].chat == 0) && 
                !user.admin && !user.isSuperAdmin && member[i] !== conn.user.jid) {
                
                if (typeof global.db.data.users[member[i]] !== 'undefined') {
                    if (global.db.data.users[member[i]].whitelist == false) {
                        total++
                        sider.push(member[i])
                    }
                } else {
                    total++
                    sider.push(member[i])
                }
            }
        }

        // 2. Si no hay fantasmas
        if (total == 0) return conn.reply(m.chat, `✨ *¡Felicidades!* Este grupo está lleno de espíritu navideño. No hay elfos inactivos.`, m)

        // 3. Si el comando es para listar (Fantasmas/Inactivos)
        if (command === 'fantasmas' || command === 'inactivos') {
            const menciones = sider.map(v => '@' + v.replace(/@.+/, ''))
            const texto = `
❄️ *REVISIÓN DEL TALLER* ❄️
━━━━━━━━━━━━━━━━━━━━━━━
Se han detectado *${total}* elfos que no han ayudado en la fabricación de juguetes (inactivos).

📝 *LISTA NEGRA:*
${menciones.join('\n')}

⚠️ *Nota:* El conteo es desde que el bot llegó al grupo.
━━━━━━━━━━━━━━━━━━━━━━━`.trim()

            // Enviar mensaje con botón para eliminar
            return await conn.sendMessage(m.chat, {
                text: texto,
                footer: "Navidad 2024 • Asta-Bot",
                mentions: sider,
                buttons: [
                    { 
                        buttonId: `${usedPrefix}kickfantasmas`, 
                        buttonText: { displayText: '🚀 Expulsar de la Villa' }, 
                        type: 1 
                    }
                ],
                headerType: 1
            }, { quoted: m })
        }

        // 4. Lógica de eliminación (Se activa al pulsar el botón)
        if (command === 'kickfantasmas') {
            await m.reply(`📦 *Iniciando mudanza...*\nLos fantasmas serán eliminados cada 5 segundos para evitar spam.`)
            
            let chat = global.db.data.chats[m.chat]
            chat.welcome = false // Apagar bienvenidas temporalmente

            try {
                for (let user of sider) {
                    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
                    await new Promise(res => setTimeout(res, 5000)) // Pausa de 5 segundos
                }
                await m.reply('✅ *Limpieza terminada.* La chimenea quedó impecable.')
            } finally {
                chat.welcome = true // Reactivar bienvenidas
            }
        }

    } catch (e) {
        console.log(e)
        m.reply(`⚠️ *Error en la nieve:* ${e.message}`)
    }
}

handler.help = ['fantasmas']
handler.tags = ['grupo']
handler.command = ['inactivos', 'fantasmas', 'kickfantasmas'] // kickfantasmas queda oculto para el botón
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
