import { WAMessageStubType } from '@whiskeysockets/baileys'

async function generarBienvenida({ conn, userId, groupMetadata, chat }) {
    const username = `@${userId.split('@')[0]}`
    const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')
    const groupSize = groupMetadata.participants.length
    
    // DEBUG: Ver qué hay en chat.sWelcome
    console.log('[DEBUG] chat.sWelcome:', chat.sWelcome)
    console.log('[DEBUG] userId:', userId)
    console.log('[DEBUG] groupMetadata.subject:', groupMetadata.subject)
    
    let mensajeFinal = ''
    
    // VERIFICAR SI EXISTE MENSAJE PERSONALIZADO
    if (chat.sWelcome && chat.sWelcome.trim() !== '') {
        console.log('[DEBUG] Usando mensaje personalizado')
        // USAR MENSAJE PERSONALIZADO
        mensajeFinal = chat.sWelcome
            .replace(/{usuario}/g, username)
            .replace(/{grupo}/g, groupMetadata.subject)
            .replace(/{desc}/g, groupMetadata.desc || 'Sin descripción')
            .replace(/{cantidad}/g, groupSize)
    } else {
        console.log('[DEBUG] Usando mensaje predeterminado')
        // USAR MENSAJE PREDETERMINADO
        mensajeFinal = `╭━〔👑 *ASTA-BOT 👑 〕* 
 ┋ 
 ┋「 🎉 *¡BIENVENIDO/A! 👋 」* 
 ┋ 
 ┋ 「 *${groupMetadata.subject}* 」 
 ┋ 
 ╰━★ 「 ${username} 」 
 *╭━━━━━━ * 
 ┋❖ Ve la descripcion para mas info
 ┋❀ Espero que te la lleves bien * 
 ┋❖ Ahora somos ${groupSize} miembros
 ┗━━━━━━━━━━━━━━━┅ ⳹`
    }
    
    console.log('[DEBUG] Mensaje final:', mensajeFinal)
    return { pp, caption: mensajeFinal, mentions: [userId] }
}

async function generarDespedida({ conn, userId, groupMetadata, chat }) {
    const username = `@${userId.split('@')[0]}`
    const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')
    const groupSize = groupMetadata.participants.length
    
    // DEBUG: Ver qué hay en chat.sBye
    console.log('[DEBUG] chat.sBye:', chat.sBye)
    
    let mensajeFinal = ''
    
    if (chat.sBye && chat.sBye.trim() !== '') {
        console.log('[DEBUG] Usando mensaje personalizado (despedida)')
        // USAR MENSAJE PERSONALIZADO
        mensajeFinal = chat.sBye
            .replace(/{usuario}/g, username)
            .replace(/{grupo}/g, groupMetadata.subject)
            .replace(/{desc}/g, groupMetadata.desc || 'Sin descripción')
            .replace(/{cantidad}/g, groupSize)
    } else {
        console.log('[DEBUG] Usando mensaje predeterminado (despedida)')
        // USAR MENSAJE PREDETERMINADO
        mensajeFinal = `╭━〔👑 *ASTA-BOT 👑 〕* 
 ┋ 
 ┋「 😢 *¡ADIOS! 👋 」* 
 ┋ 
 ┋ 「 *${groupMetadata.subject}* 」 
 ┋ 
 ╰━★ 「 ${username} 」 
 *╭━━━━━━ * 
 ┋❖ Un miembro menos 😢
 ┋❀ Te extrañaremos en el grupo * 
 ┋❖ Ahora somos ${groupSize} miembros
 ┗━━━━━━━━━━━━━━━┅ ⳹`
    }
    
    return { pp, caption: mensajeFinal, mentions: [userId] }
}

let handler = m => m
handler.before = async function (m, { conn }) {
    try {
        if (!m.messageStubType || !m.isGroup) return
        
        const chatId = m.chat
        const chat = global.db.data.chats[chatId]
        if (!chat || !chat.welcome) return
        
        const userId = m.messageStubParameters?.[0]
        if (!userId) return
        
        const groupMetadata = await conn.groupMetadata(chatId).catch(() => null)
        if (!groupMetadata) return

        if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
            console.log(`[WELCOME] Usuario ${userId} entró al grupo ${chatId}`)
            const { pp, caption, mentions } = await generarBienvenida({ 
                conn, 
                userId, 
                groupMetadata, 
                chat 
            })
            
            await conn.sendMessage(chatId, { 
                image: { url: pp }, 
                caption, 
                mentions 
            }).catch(e => console.error('Error enviando welcome:', e))
        }

        if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE || 
            m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
            
            console.log(`[BYE] Usuario ${userId} salió del grupo ${chatId}`)
            const { pp, caption, mentions } = await generarDespedida({ 
                conn, 
                userId, 
                groupMetadata, 
                chat 
            })
            
            await conn.sendMessage(chatId, { 
                image: { url: pp }, 
                caption, 
                mentions 
            }).catch(e => console.error('Error enviando despedida:', e))
        }
    } catch (error) {
        console.error('Error en handler welcome:', error)
    }
}

export { generarBienvenida, generarDespedida }
export default handler