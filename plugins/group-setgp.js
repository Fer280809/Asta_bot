const handler = async (m, { conn, args, text, command, usedPrefix }) => {
    try {
        switch (command) {
            case 'gpbanner': 
            case 'groupimg': {
                const q = m.quoted || m
                const mime = (q.msg || q).mimetype || ''
                if (!/image\/(png|jpe?g)/.test(mime)) return m.reply('❄️ *¡Falta el cuadro!* Responde a una imagen o envíala para cambiar el perfil de la Villa.')
                
                await m.react('🎨')
                const img = await q.download()
                await conn.updateProfilePicture(m.chat, img)
                m.reply('✅ *¡Fachada renovada!* La imagen del grupo ha sido actualizada correctamente.')
                break
            }

            case 'gpdesc': 
            case 'groupdesc': {
                if (!text) return m.reply(`❄️ *¿Qué nuevas reglas tenemos?* Escribe la nueva descripción.\n\n*Ejemplo:* ${usedPrefix + command} Bienvenidos a la Villa Santa.`)
                
                await m.react('📝')
                await conn.groupUpdateDescription(m.chat, text)
                m.reply('✅ *¡Pergamino actualizado!* La descripción del grupo se ha modificado con éxito.')
                break
            }

            case 'gpname': 
            case 'groupname': {
                if (!text) return m.reply(`❄️ *¿Cómo se llamará nuestra Villa?* Escribe el nuevo nombre.\n\n*Ejemplo:* ${usedPrefix + command} La Villa de Asta`)
                
                if (text.length > 25) return m.reply('⚠️ *Nombre muy largo.* El cartel de la Villa no puede tener más de 25 caracteres.')
                
                await m.react('🏷️')
                await conn.groupUpdateSubject(m.chat, text)
                m.reply(`✅ *¡Nombre cambiado!* Ahora somos: *${text}*`)
                break
            }
        }
    } catch (e) {
        await m.react('✖️')
        m.reply(`⚠️ *¡Error en la obra!* No se pudieron aplicar los cambios.\n${e.message}`)
    }
}

handler.help = ['groupimg', 'groupdesc', 'groupname']
handler.tags = ['grupo']
handler.command = ['gpbanner', 'groupimg', 'gpdesc', 'groupdesc', 'gpname', 'groupname']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
