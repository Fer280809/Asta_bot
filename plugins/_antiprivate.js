export async function before(m, { conn, isOwner }) {
  // 1. Solo en chats privados
  if (m.isGroup || m.isBaileys || !m.message || m.sender === conn.user.jid) return !0

  // 2. Números de Fernando (protegidos)
  const FERNANDO_NUMS = ['5214181450063', '524181450063'].map(n => n + '@s.whatsapp.net')
  if (FERNANDO_NUMS.includes(m.sender)) return !0

  // 3. Verificar si está bloqueado // Función automática que bloquea privados
export async function before(m, { conn, isOwner }) {
  // 1. Solo en chats privados
  if (m.isGroup || m.isBaileys || !m.message || m.sender === conn.user.jid) return true
  
  // 2. Números de Fernando (protegidos)
  const FERNANDO_NUMS = ['5214181450063', '524181450063'].map(n => n + '@s.whatsapp.net')
  if (FERNANDO_NUMS.includes(m.sender)) return true
  
  // 3. Verificar si está bloqueado → desbloquear automáticamente
  try {
    const status = await conn.fetchBlocklist()
    if (status.includes(m.sender)) {
      await conn.updateBlockStatus(m.sender, 'unblock')
      return true
    }
  } catch (e) {
    // Si no puede verificar, continúa normal
  }
  
  // 4. Ignora ciertos comandos permitidos
  const permitidos = ['PIEDRA', 'PAPEL', 'TIJERA', 'code', 'qr']
  if (permitidos.some(p => m.text.toUpperCase().includes(p))) return true
  
  // 5. Verifica si está activado
  const bot = global.db.data.settings[conn.user.jid] || {}
  if (!bot.antiPrivate) return true
  
  // 6. Mensaje antes de bloquear
  const msg = `╭─◉ 🚫 *CHAT PRIVADO BLOQUEADO* ◉
│
│ ❌ Hola @${m.sender.split('@')[0]}
│ 
│ ⚠️ El bot ha desactivado los comandos en privado.
│ 📩 Únete a la comunidad para usar los comandos:
│
│ 💬 https://chat.whatsapp.com/BfCKeP10yZZ9ancsGy1Eh9
│
│ ⏳ Serás bloqueado automáticamente en 5 segundos...
╰─────────────────`
  
  await conn.sendMessage(m.chat, { text: msg, mentions: [m.sender] })
  
  // 7. Bloquear después de 5 segundos
  setTimeout(async () => {
    await conn.updateBlockStatus(m.sender, 'block')
  }, 5000)
  
  return false
}

// Comando para controlar el anti-privado
const handler = async (m, { conn, command, usedPrefix }) => {
    // Solo el bot/socket puede ejecutar este comando
    const isSubBots = [conn.user.jid, ...global.owner.map(([number]) => `${number}@s.whatsapp.net`)].includes(m.sender)
    if (!isSubBots) return m.reply(`❀ El comando *${command}* solo puede ser ejecutado por el Socket.`)
    
    try {
        const settings = global.db.data.settings[conn.user.jid] || {}
        
        // Determinar el estado actual
        const estadoActual = settings.antiPrivate || false
        
        // Si es comando directo (antiprivateon o antiprivateoff)
        if (command === 'antiprivateon' || command === 'antiprivateoff') {
            const nuevoEstado = command === 'antiprivateon'
            
            if (estadoActual === nuevoEstado) {
                return conn.reply(m.chat, `⚠️ El *Anti-Privado* ya estaba *${nuevoEstado ? 'activado' : 'desactivado'}*`, m)
            }
            
            settings.antiPrivate = nuevoEstado
            
            const msg = `✅ *ANTI-PRIVADO* *${nuevoEstado ? 'ACTIVADO' : 'DESACTIVADO'}*
🔹 Estado: *${nuevoEstado ? '✅ Encendido' : '❌ Apagado'}*
🔹 Usuario: @${m.sender.split('@')[0]}`
            
            return conn.sendMessage(m.chat, { text: msg, mentions: [m.sender] }, { quoted: m })
        }
        
        // Si es solo 'antiprivate', mostrar menú con botones
        const estadoTexto = estadoActual ? '✅ Activado' : '❌ Desactivado'
        const botonTexto = estadoActual ? '🔴 Apagar' : '🟢 Prender'
        const botonComando = estadoActual ? 'antiprivateoff' : 'antiprivateon'
        
        const txt = `╭─◉ 🔒 *ANTI-PRIVADO* ◉
│
│ 📊 Estado actual: *${estadoTexto}*
│
│ ℹ️ Esta función bloquea mensajes
│ en chats privados automáticamente.
│
│ 💡 Presiona el botón para cambiar:
╰─────────────────`
        
        await conn.sendMessage(m.chat, {
            text: txt,
            footer: `『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡`,
            buttons: [
                { buttonId: `${usedPrefix}${botonComando}`, buttonText: { displayText: botonTexto }, type: 1 }
            ],
            headerType: 1
        }, { quoted: m })
        
    } catch (error) {
        m.reply(`⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${error.message}`)
    }
}

handler.help = ['antiprivate']
handler.tags = ['socket']
handler.command = ['antiprivate', 'antiprivateon', 'antiprivateoff']

export default handler→ desbloquear automáticamente
  try {
    const status = await conn.fetchBlocklist()
    if (status.includes(m.sender)) {
      await conn.updateBlockStatus(m.sender, 'unblock')
      return !0
    }
  } catch (e) {
    // Si no puede verificar, continúa normal
  }

  // 4. Ignora ciertos comandos permitidos
  const permitidos = ['PIEDRA', 'PAPEL', 'TIJERA', 'code', 'qr']
  if (permitidos.some(p => m.text.toUpperCase().includes(p))) return !0

  // 5. Verifica si está activado
  const bot = global.db.data.settings[conn.user.jid] || {}
  if (!bot.antiPrivate) return !0

  // 6. Mensaje chido antes de bloquear
  const msg = `
╭─◉ 🚫 *CHAT PRIVADO BLOQUEADO* ◉
│
│ ❌ Hola @${m.sender.split('@')[0]}
│ 
│ ⚠️ El bot ha desactivado los comandos en privado.
│ 📩 Únete a la comunidad para usar los comandos:
│
│ 💬 https://chat.whatsapp.com/BfCKeP10yZZ9ancsGy1Eh9
│
│ ⏳ Serás bloqueado automáticamente en 5 segundos...
╰─────────────────
  `.trim()

  await conn.sendMessage(m.chat, { text: msg, mentions: [m.sender] })

  // 7. Bloquear después de 5 segundos
  setTimeout(async () => {
    await conn.updateBlockStatus(m.sender, 'block')
  }, 5000)

  return !1
}