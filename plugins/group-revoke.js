var handler = async (m, { conn, usedPrefix }) => {
    try {
        // 1. Revocar el enlace actual
        await conn.groupRevokeInvite(m.chat)
        
        // 2. Obtener el nuevo código generado
        let res = await conn.groupInviteCode(m.chat)
        let nuevoLink = `https://chat.whatsapp.com/${res}`

        // 3. Diseño de Seguridad Navideña
        const texto = `
🔐 *SEGURIDAD DE LA VILLA* 🔐
━━━━━━━━━━━━━━━━━━━━━━━
¡Las cerraduras han sido cambiadas! El enlace de invitación anterior ha sido **anulado** para siempre.

❄️ *Estado:* Enlace Restablecido
🔒 *Motivo:* Acción de Seguridad
━━━━━━━━━━━━━━━━━━━━━━━
> Solo los Elfos Mayores pueden distribuir el nuevo acceso secreto.`.trim()

        // 4. Enviar confirmación al grupo con botón secreto
        await conn.sendMessage(m.chat, {
            text: texto,
            footer: "Navidad 2024 • Asta-Bot",
            buttons: [
                { 
                    buttonId: `${usedPrefix}link`, 
                    buttonText: { displayText: '🎫 Ver Nuevo Enlace' }, 
                    type: 1 
                }
            ]
        }, { quoted: m })

        await m.react('🔐')

    } catch (e) {
        m.reply(`⚠️ *¡Error en los cerrojos!* No se pudo restablecer el enlace.\n${e.message}`)
    }
}

handler.help = ['revoke']
handler.tags = ['grupo']
handler.command = ['revoke', 'restablecer', 'anularenlace']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
