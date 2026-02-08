// ==================== FUNCIÓN BEFORE ====================
export async function before(m, { conn, isOwner }) {
  // 1. Solo en chats privados
  if (m.isGroup || m.isBaileys || !m.message || m.sender === conn.user.jid) return true

  // 2. Función para obtener JIDs de owners
  const getOwnerJids = () => {
    return (global.owner || []).map(owner => {
      // Si es un array, toma el primer elemento (el número)
      if (Array.isArray(owner)) {
        return `${owner[0]}@s.whatsapp.net`;
      }
      // Si es un string, úsalo directamente
      return `${owner}@s.whatsapp.net`;
    });
  };
  
  // Owners y números de Fernando protegidos
  const OWNER_NUMS = [...getOwnerJids()];
  if (OWNER_NUMS.includes(m.sender)) return true;

  // 3. Verificar si está bloqueado → desbloquear automáticamente
  try {
    const status = await conn.fetchBlocklist();
    if (status.includes(m.sender)) {
      await conn.updateBlockStatus(m.sender, 'unblock');
      return true;
    }
  } catch (e) {
    // Si no puede verificar, continúa normal
  }

  // 4. Ignora ciertos comandos permitidos
  const permitidos = ['PIEDRA', 'PAPEL', 'TIJERA', 'code', 'qr'];
  if (m.text && permitidos.some(p => m.text.toUpperCase().includes(p))) return true;

  // 5. Verifica si está activado
  const bot = global.db.data.settings[conn.user.jid] || {};
  if (!bot.antiPrivate) return true;

  // 6. Mensaje antes de bloquear
  const msg = `╭─◉ 🚫 *CHAT PRIVADO BLOQUEADO* ◉
│
│ ❌ Hola @${m.sender.split('@')[0]}
│ 
│ ⚠️ El bot ha desactivado los comandos en privado.
│ 📩 Únete a la comunidad para usar los comandos:
│
│ 💬 ${global.group || 'https://chat.whatsapp.com/BfCKeP10yZZ9ancsGy1Eh9'}
│
│ ⏳ Serás bloqueado automáticamente en 5 segundos...
╰─────────────────`;

  await conn.sendMessage(m.chat, { text: msg, mentions: [m.sender] });

  // 7. Bloquear después de 5 segundos
  setTimeout(async () => {
    await conn.updateBlockStatus(m.sender, 'block');
  }, 5000);

  return false;
}

// ==================== HANDLER ====================
const handler = async (m, { conn, command, usedPrefix }) => {
    // Función para obtener JIDs de owners
    const getOwnerJids = () => {
      return (global.owner || []).map(owner => {
        // Si es un array, toma el primer elemento (el número)
        if (Array.isArray(owner)) {
          return `${owner[0]}@s.whatsapp.net`;
        }
        // Si es un string, úsalo directamente
        return `${owner}@s.whatsapp.net`;
      });
    };
    
    // Solo el bot/socket y los owners globales pueden ejecutar este comando
    const allowedJids = [conn.user.jid, ...getOwnerJids()];
    
    // Depuración: mostrar quién intenta ejecutar
    console.log('Remitente:', m.sender);
    console.log('Allowed JIDs:', allowedJids);
    console.log('¿Está permitido?:', allowedJids.includes(m.sender));
    
    if (!allowedJids.includes(m.sender)) {
      return m.reply(`❀ El comando *${command}* solo puede ser ejecutado por el Socket o los dueños.\n\nOwners configurados: ${global.owner ? JSON.stringify(global.owner) : 'No configurados'}`);
    }

    try {
        const settings = global.db.data.settings[conn.user.jid] || {};

        // Determinar el estado actual
        const estadoActual = settings.antiPrivate || false;

        // Si es comando directo (antiprivateon o antiprivateoff)
        if (command === 'antiprivateon' || command === 'antiprivateoff') {
            const nuevoEstado = command === 'antiprivateon';

            if (estadoActual === nuevoEstado) {
                return conn.reply(m.chat, `⚠️ El *Anti-Privado* ya estaba *${nuevoEstado ? 'activado' : 'desactivado'}*`, m);
            }

            settings.antiPrivate = nuevoEstado;

            const msg = `✅ *ANTI-PRIVADO* *${nuevoEstado ? 'ACTIVADO' : 'DESACTIVADO'}*
🔹 Estado: *${nuevoEstado ? '✅ Encendido' : '❌ Apagado'}*
🔹 Usuario: @${m.sender.split('@')[0]}
🔹 Tipo: ${conn.user.jid === m.sender ? 'Socket' : 'Owner'}`;

            return conn.sendMessage(m.chat, { text: msg, mentions: [m.sender] }, { quoted: m });
        }

        // Si es solo 'antiprivate', mostrar menú con botones
        const estadoTexto = estadoActual ? '✅ Activado' : '❌ Desactivado';
        const botonTexto = estadoActual ? '🔴 Apagar' : '🟢 Prender';
        const botonComando = estadoActual ? 'antiprivateoff' : 'antiprivateon';

        const txt = `╭─◉ 🔒 *ANTI-PRIVADO* ◉
│
│ 📊 Estado actual: *${estadoTexto}*
│ 👤 Ejecutado por: ${conn.user.jid === m.sender ? 'Socket' : 'Owner'}
│
│ ℹ️ Esta función bloquea mensajes
│ en chats privados automáticamente.
│
│ 💡 Presiona el botón para cambiar:
╰─────────────────`;

        await conn.sendMessage(m.chat, {
            text: txt,
            footer: `『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡ | ${conn.user.jid === m.sender ? 'Socket' : 'Owner'}`,
            buttons: [
                { buttonId: `${usedPrefix}${botonComando}`, buttonText: { displayText: botonTexto }, type: 1 }
            ],
            headerType: 1
        }, { quoted: m });

    } catch (error) {
        console.error('Error en antiprivate:', error);
        m.reply(`⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${error.message}`);
    }
};

handler.help = ['antiprivate'];
handler.tags = ['socket'];
handler.command = ['antiprivate', 'antiprivateon', 'antiprivateoff'];

export default handler;