import { promises as fs } from 'fs'

const handler = async (m, { conn, participants, groupMetadata, usedPrefix, command }) => {
    const chat = global.db.data.chats[m.chat]
    
    try {
        let member = participants.map(u => u.id)
        let total = 0
        let sider = []

        // ============ LÓGICA DE BÚSQUEDA DE INACTIVOS ============
        for (let i = 0; i < member.length; i++) {
            let user = participants.find(u => u.id == member[i])
            if (!user) continue

            // Filtros: No admin, no bot, no mensajes registrados, no whitelist
            if ((typeof global.db.data.users[member[i]] == 'undefined' || global.db.data.users[member[i]].chat == 0) && 
                user.admin !== 'admin' && user.admin !== 'superadmin' && user.admin !== true && 
                member[i] !== conn.user.jid) {

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

        // ============ SI NO HAY FANTASMAS ============
        if (total == 0) {
            await m.react('✨')
            return conn.reply(m.chat, `✨ *¡Felicidades!*\n\nEste grupo está lleno de espíritu navideño. No hay elfos inactivos. 🎄`, m)
        }

        // ============ COMANDO PARA LISTAR (fantasmas/inactivos) ============
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
            await conn.sendMessage(m.chat, {
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

            await m.react('👻')
            return
        }

        // ============ COMANDO PARA ELIMINAR (kickfantasmas) ============
        if (command === 'kickfantasmas') {
            await m.react('🔄')
            await m.reply(`📦 *Iniciando mudanza...*\n\nLos fantasmas serán eliminados cada 5 segundos para evitar spam.`)

            // Apagar bienvenidas temporalmente
            const welcomeStatus = chat.welcome
            chat.welcome = false

            let eliminados = 0
            let fallidos = 0

            try {
                for (let user of sider) {
                    try {
                        // Verificar que el usuario aún esté en el grupo
                        const meta = await conn.groupMetadata(m.chat)
                        const existe = meta.participants.find(p => p.id === user)
                        
                        if (existe) {
                            await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
                            eliminados++
                            console.log(`✅ Eliminado: ${user}`)
                        } else {
                            console.log(`⚠️ Usuario ya no está en el grupo: ${user}`)
                        }
                        
                        await new Promise(res => setTimeout(res, 5000)) // Pausa de 5 segundos
                    } catch (err) {
                        fallidos++
                        console.error(`❌ Error eliminando ${user}:`, err.message)
                    }
                }

                // Mensaje final
                const resultado = `
✅ *Limpieza completada*

📊 *Resultados:*
• Eliminados: ${eliminados}
• Fallidos: ${fallidos}
• Total procesados: ${sider.length}

🎄 La chimenea quedó impecable.`.trim()

                await m.reply(resultado)
                await m.react('✅')

            } catch (e) {
                console.error('Error general en eliminación:', e)
                await m.reply(`⚠️ *Error durante la limpieza:* ${e.message}`)
                await m.react('❌')
            } finally {
                // Reactivar bienvenidas
                chat.welcome = welcomeStatus
            }
        }

    } catch (e) {
        console.error('Error en fantasmas:', e)
        await m.reply(`⚠️ *Error en la nieve:* ${e.message}`)
        await m.react('❌')
    }
}

handler.help = ['fantasmas', 'inactivos']
handler.tags = ['grupo']
handler.command = ['inactivos', 'fantasmas', 'kickfantasmas']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler