const handler = async (m, { conn, text, usedPrefix, command, isROwner }) => {
    if (!isROwner) return m.reply('⚠️ Este comando solo puede ser usado por el owner principal.')
    
    if (!text) {
        return m.reply(`📢 *BROADCAST A GRUPOS*\n\n*Uso:*\n${usedPrefix + command} <mensaje>\n\n*Ejemplo:*\n${usedPrefix + command} Mantenimiento programado mañana a las 10 AM\n\n*Nota:* Este comando enviará el mensaje a TODOS los grupos donde está el bot principal y los sub-bots.`)
    }

    // Mensaje de inicio
    await m.react('📡')
    const loadingMsg = await conn.reply(m.chat, `📡 *INICIANDO BROADCAST*\n\n⏳ Preparando envío a todos los grupos...\n🤖 Recopilando información de bots...`, m)

    // Estructura para almacenar resultados
    const results = {
        mainBot: {
            name: conn.user.name || 'Bot Principal',
            jid: conn.user.jid,
            total: 0,
            success: 0,
            failed: 0,
            groups: []
        },
        subBots: []
    }

    // Función para enviar mensaje con control de duplicados y errores
    async function sendBroadcast(connection, groupsData, botInfo) {
        const sent = new Set() // Control de duplicados
        let success = 0
        let failed = 0
        const failedGroups = []

        for (const group of groupsData) {
            try {
                const groupJid = group[0]
                
                // Evitar duplicados
                if (sent.has(groupJid)) {
                    continue
                }

                // Verificar que sea un grupo válido
                if (!groupJid.endsWith('@g.us')) {
                    continue
                }

                // Intentar enviar el mensaje
                const broadcast = `╭━━━━━━━━━━━━━━━╮
│ 📢 *AVISO OFICIAL* 📢
╰━━━━━━━━━━━━━━━╯

${text}

╭────────────────╮
│ 🤖 Bot: ${botInfo.name}
│ 📅 ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}
╰────────────────╯`

                await connection.sendMessage(groupJid, { 
                    text: broadcast 
                }, { 
                    quoted: null 
                })

                sent.add(groupJid)
                success++
                
                // Pequeña pausa para evitar spam
                await new Promise(resolve => setTimeout(resolve, 1500))

            } catch (error) {
                failed++
                failedGroups.push({
                    jid: group[0],
                    name: group[1]?.subject || 'Desconocido',
                    error: error.message
                })
                console.error(`Error enviando a ${group[0]}:`, error)
            }
        }

        return { success, failed, failedGroups, total: groupsData.length }
    }

    try {
        // ============================================
        // ENVÍO AL BOT PRINCIPAL
        // ============================================
        await conn.reply(m.chat, `📡 *ENVIANDO EN BOT PRINCIPAL*\n⏳ Por favor espera...`, m)
        
        const mainGroups = Object.entries(conn.chats).filter(([jid, chat]) => 
            jid.endsWith('@g.us') && 
            chat.isChats && 
            !chat.read_only
        )

        results.mainBot.total = mainGroups.length
        
        const mainResults = await sendBroadcast(conn, mainGroups, results.mainBot)
        results.mainBot.success = mainResults.success
        results.mainBot.failed = mainResults.failed
        results.mainBot.groups = mainResults.failedGroups

        // ============================================
        // ENVÍO A SUB-BOTS
        // ============================================
        if (global.conns && Array.isArray(global.conns) && global.conns.length > 0) {
            await conn.reply(m.chat, `📡 *ENVIANDO EN SUB-BOTS*\n🤖 ${global.conns.length} sub-bots detectados\n⏳ Procesando...`, m)

            for (let i = 0; i < global.conns.length; i++) {
                const subConn = global.conns[i]
                
                try {
                    // Verificar si el sub-bot está activo
                    if (!subConn.user || !subConn.ws?.socket?.readyState || subConn.ws.socket.readyState !== 1) {
                        results.subBots.push({
                            name: `Sub-Bot ${i + 1}`,
                            jid: subConn.user?.jid || 'Desconocido',
                            total: 0,
                            success: 0,
                            failed: 0,
                            status: '❌ Desconectado',
                            groups: []
                        })
                        continue
                    }

                    const subBotInfo = {
                        name: subConn.user.name || `Sub-Bot ${i + 1}`,
                        jid: subConn.user.jid
                    }

                    const subGroups = Object.entries(subConn.chats).filter(([jid, chat]) => 
                        jid.endsWith('@g.us') && 
                        chat.isChats && 
                        !chat.read_only
                    )

                    const subResults = await sendBroadcast(subConn, subGroups, subBotInfo)

                    results.subBots.push({
                        name: subBotInfo.name,
                        jid: subBotInfo.jid,
                        total: subGroups.length,
                        success: subResults.success,
                        failed: subResults.failed,
                        status: '✅ Activo',
                        groups: subResults.failedGroups
                    })

                    // Pausa entre sub-bots
                    await new Promise(resolve => setTimeout(resolve, 2000))

                } catch (error) {
                    console.error(`Error en sub-bot ${i + 1}:`, error)
                    results.subBots.push({
                        name: `Sub-Bot ${i + 1}`,
                        jid: subConn.user?.jid || 'Desconocido',
                        total: 0,
                        success: 0,
                        failed: 0,
                        status: '⚠️ Error',
                        groups: []
                    })
                }
            }
        }

        // ============================================
        // REPORTE FINAL
        // ============================================
        await m.react('✅')

        // Calcular totales
        const totalGroups = results.mainBot.total + results.subBots.reduce((sum, bot) => sum + bot.total, 0)
        const totalSuccess = results.mainBot.success + results.subBots.reduce((sum, bot) => sum + bot.success, 0)
        const totalFailed = results.mainBot.failed + results.subBots.reduce((sum, bot) => sum + bot.failed, 0)

        // Construir reporte
        let report = `╭━━━━━━━━━━━━━━━━━━━━╮
│ 📊 *REPORTE DE BROADCAST*
╰━━━━━━━━━━━━━━━━━━━━╯

📈 *RESUMEN GENERAL:*
┌─────────────────
│ 📱 Total de Grupos: ${totalGroups}
│ ✅ Enviados: ${totalSuccess}
│ ❌ Fallidos: ${totalFailed}
│ 📊 Tasa de éxito: ${totalGroups > 0 ? ((totalSuccess / totalGroups) * 100).toFixed(2) : 0}%
└─────────────────

━━━━━━━━━━━━━━━━━━━━━

🤖 *BOT PRINCIPAL:*
┌─────────────────
│ 👤 Nombre: ${results.mainBot.name}
│ 📱 Grupos: ${results.mainBot.total}
│ ✅ Exitosos: ${results.mainBot.success}
│ ❌ Fallidos: ${results.mainBot.failed}
└─────────────────\n`

        // Información de sub-bots
        if (results.subBots.length > 0) {
            report += `\n🔗 *SUB-BOTS (${results.subBots.length}):*\n`
            
            results.subBots.forEach((bot, index) => {
                report += `\n┌─ 🤖 Sub-Bot ${index + 1}
│ 👤 ${bot.name}
│ 📊 Estado: ${bot.status}
│ 📱 Grupos: ${bot.total}
│ ✅ Exitosos: ${bot.success}
│ ❌ Fallidos: ${bot.failed}
└─────────────────\n`
            })
        }

        report += `\n━━━━━━━━━━━━━━━━━━━━━`

        // Detalles de errores si existen
        const allFailedGroups = [
            ...results.mainBot.groups.map(g => ({ ...g, bot: 'Principal' })),
            ...results.subBots.flatMap((bot, i) => 
                bot.groups.map(g => ({ ...g, bot: `Sub-Bot ${i + 1}` }))
            )
        ]

        if (allFailedGroups.length > 0) {
            report += `\n\n⚠️ *ERRORES DETALLADOS:*\n`
            allFailedGroups.slice(0, 10).forEach((fail, i) => {
                report += `\n${i + 1}. 🤖 ${fail.bot}
   📱 ${fail.name}
   ❌ ${fail.error}\n`
            })
            
            if (allFailedGroups.length > 10) {
                report += `\n... y ${allFailedGroups.length - 10} errores más.`
            }
        }

        report += `\n\n✅ *Broadcast completado*\n📅 ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`

        // Enviar reporte final
        await conn.reply(m.chat, report, m)

    } catch (error) {
        await m.react('❌')
        console.error('Error en broadcast:', error)
        return conn.reply(m.chat, `❌ *ERROR EN BROADCAST*\n\n${error.message}\n\nStack: ${error.stack}`, m)
    }
}

handler.help = ['aviso', 'avis']
handler.tags = ['owner']
handler.command = ['aviso', 'avis', 'broadcast', 'bc']
handler.rowner = true

export default handler