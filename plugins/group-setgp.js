const handler = async (m, { conn, args, text, command, usedPrefix }) => {
    try {
        switch (command) {
            case 'gpbanner': 
            case 'groupimg': {
                const q = m.quoted || m
                const mime = (q.msg || q).mimetype || ''
                if (!/image\/(png|jpe?g)/.test(mime)) return m.reply('📷 *Falta la imagen* Responde a una imagen o envíala para cambiar la foto del grupo.')
                
                await m.react('🖼️')
                const img = await q.download()
                await conn.updateProfilePicture(m.chat, img)
                m.reply('✅ *Foto actualizada* La imagen del grupo ha sido cambiada correctamente.')
                break
            }

            case 'gpdesc': 
            case 'groupdesc': {
                if (!text) return m.reply(`📝 *Nueva descripción* Escribe la nueva descripción para el grupo.\n\n*Ejemplo:* ${usedPrefix + command} Bienvenidos al grupo, respeten las reglas.`)
                
                await m.react('📄')
                await conn.groupUpdateDescription(m.chat, text)
                m.reply('✅ *Descripción actualizada* La descripción del grupo se ha modificado con éxito.')
                break
            }

            case 'gpname': 
            case 'groupname': {
                if (!text) return m.reply(`🏷️ *Nuevo nombre* Escribe el nuevo nombre para el grupo.\n\n*Ejemplo:* ${usedPrefix + command} Grupo de Comunidad`)
                
                if (text.length > 25) return m.reply('⚠️ *Nombre muy largo* El nombre del grupo no puede tener más de 25 caracteres.')
                
                await m.react('✏️')
                await conn.groupUpdateSubject(m.chat, text)
                m.reply(`✅ *Nombre cambiado* Ahora el grupo se llama: *${text}*`)
                break
            }
        }
    } catch (e) {
        await m.react('❌')
        m.reply(`⚠️ *Error* No se pudieron aplicar los cambios.\n${e.message}`)
    }
}

// MISMOS HELP, TAGS, COMMAND
handler.help = ['groupimg', 'groupdesc', 'groupname']
handler.tags = ['grupo']
handler.command = ['gpbanner', 'groupimg', 'gpdesc', 'groupdesc', 'gpname', 'groupname']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
