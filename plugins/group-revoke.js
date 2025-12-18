var handler = async (m, { conn, usedPrefix }) => {
    try {
        // 1. Revocar el enlace actual
        await conn.groupRevokeInvite(m.chat)
        
        // 2. Obtener el nuevo código generado
        let res = await conn.groupInviteCode(m.chat)
        let nuevoLink = `https://chat.whatsapp.com/${res}`

        // 3. Mensaje de confirmación normal
        const texto = `
🔒 *ENLACE REVOCADO*
━━━━━━━━━━━━━━━━━━━━━━━
El enlace de invitación anterior ha sido **anulado** permanentemente.

✅ *Estado:* Enlace restablecido
🔐 *Motivo:* Acción de seguridad
━━━━━━━━━━━━━━━━━━━━━━━
> Solo los administradores pueden compartir el nuevo enlace.`.trim()

        // 4. Enviar confirmación al grupo con botón
        await conn.sendMessage(m.chat, {
            text: texto,
            footer: "Asta-Bot",
            buttons: [
                { 
                    buttonId: `${usedPrefix}link`, 
                    buttonText: { displayText: '🔗 Ver Nuevo Enlace' }, 
                    type: 1 
                }
            ]
        }, { quoted: m })

        await m.react('🔒')

    } catch (e) {
        m.reply(`⚠️ *Error* No se pudo restablecer el enlace.\n${e.message}`)
    }
}

// MISMOS HELP, TAGS, COMMAND
handler.help = ['revoke']
handler.tags = ['grupo']
handler.command = ['revoke', 'restablecer', 'anularenlace']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
