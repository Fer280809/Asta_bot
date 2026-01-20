import { generarBienvenida, generarDespedida } from './_welcome.js'

const handler = async (m, { conn, command, usedPrefix, text, groupMetadata }) => {
    const chat = global.db.data.chats[m.chat]
    
    // Ayuda general
    if (command === 'setgp') {
        return m.reply(`╭━━〔 🏰 CONFIGURACIÓN DE GRUPO 〕━⬣
┃ 
┃ ✦ *COMANDOS DISPONIBLES:*
┃ 
┃ • ${usedPrefix}setwelcome <texto>
┃   Configurar mensaje de BIENVENIDA
┃ 
┃ • ${usedPrefix}setbye <texto>
┃   Configurar mensaje de DESPEDIDA
┃ 
┃ • ${usedPrefix}testwelcome
┃   Probar la bienvenida actual
┃ 
┃ • ${usedPrefix}testbye
┃   Probar la despedida actual
┃ 
┃ 
┃ ✦ *VARIABLES DISPONIBLES:*
┃ 
┃ • {usuario} → Menciona al usuario
┃ • {grupo} → Nombre del grupo
┃ • {desc} → Descripción del grupo
┃ • {cantidad} → Número de miembros
┃ 
┃ 
┃ ✦ *EJEMPLOS:*
┃ 
┃ ${usedPrefix}setwelcome ¡Hola {usuario}! 👋
┃ Bienvenido a {grupo}
┃
┃ ${usedPrefix}setbye Adiós {usuario} 😢
┃ 
┗━━━━━━━━━━━━━━━━━━⬣`)
    }
    
    // Configurar bienvenida
    if (command === 'setwelcome') {
        if (!text) {
            return m.reply(`❌ *Falta el mensaje de bienvenida*\n\n📝 *Ejemplo:*\n${usedPrefix}setwelcome ¡Hola {usuario}! 👋\nBienvenido a {grupo}\nAhora somos {cantidad} miembros\n\n*Variables disponibles:*\n{usuario} {grupo} {desc} {cantidad}`)
        }
        
        // Guardar el mensaje exactamente como lo escriben
        chat.sWelcome = text
        
        // Activar welcome si no está activado
        chat.welcome = true
        
        // Confirmar con el mensaje guardado
        const respuesta = `✅ *¡BIENVENIDA CONFIGURADA CORRECTAMENTE!*\n\n📝 *Mensaje guardado:*\n${text}\n\n🔍 *Puedes probarlo con:* ${usedPrefix}testwelcome\n\n*Este mensaje solo se aplicará en este grupo.*`
        
        await m.reply(respuesta)
        return
    }
    
    // Configurar despedida
    if (command === 'setbye') {
        if (!text) {
            return m.reply(`❌ *Falta el mensaje de despedida*\n\n📝 *Ejemplo:*\n${usedPrefix}setbye Adiós {usuario} 😢\nTe extrañaremos en {grupo}\n\n*Variables disponibles:*\n{usuario} {grupo} {desc} {cantidad}`)
        }
        
        // Guardar el mensaje exactamente como lo escriben
        chat.sBye = text
        
        // Activar welcome si no está activado
        chat.welcome = true
        
        const respuesta = `✅ *¡DESPEDIDA CONFIGURADA CORRECTAMENTE!*\n\n📝 *Mensaje guardado:*\n${text}\n\n🔍 *Puedes probarlo con:* ${usedPrefix}testbye\n\n*Este mensaje solo se aplicará en este grupo.*`
        
        await m.reply(respuesta)
        return
    }
    
    // Probar bienvenida
    if (command === 'testwelcome') {
        await m.react('🔄')
        
        // Verificar si hay mensaje personalizado
        if (!chat.sWelcome || chat.sWelcome.trim() === '') {
            await m.reply(`ℹ️ *No hay mensaje personalizado*\nUsando el diseño predeterminado.\n\nPara configurar uno usa:\n${usedPrefix}setwelcome <tu mensaje>`)
        } else {
            await m.reply(`✅ *Usando mensaje personalizado:*\n${chat.sWelcome}\n\nGenerando vista previa...`)
        }
        
        try {
            // Obtener metadata actual del grupo
            const grupoInfo = await conn.groupMetadata(m.chat).catch(() => groupMetadata)
            
            // Generar la bienvenida
            const { pp, caption, mentions } = await generarBienvenida({
                conn,
                userId: m.sender,
                groupMetadata: grupoInfo,
                chat
            })
            
            // Enviar la vista previa
            await conn.sendMessage(m.chat, {
                image: { url: pp },
                caption,
                mentions
            }, { quoted: m })
            
            await m.react('✅')
        } catch (error) {
            console.error('Error en testwelcome:', error)
            await m.reply(`❌ Error al generar la vista previa:\n${error.message}`)
            await m.react('❌')
        }
        return
    }
    
    // Probar despedida
    if (command === 'testbye') {
        await m.react('🔄')
        
        // Verificar si hay mensaje personalizado
        if (!chat.sBye || chat.sBye.trim() === '') {
            await m.reply(`ℹ️ *No hay mensaje personalizado*\nUsando el diseño predeterminado.\n\nPara configurar uno usa:\n${usedPrefix}setbye <tu mensaje>`)
        } else {
            await m.reply(`✅ *Usando mensaje personalizado:*\n${chat.sBye}\n\nGenerando vista previa...`)
        }
        
        try {
            // Obtener metadata actual del grupo
            const grupoInfo = await conn.groupMetadata(m.chat).catch(() => groupMetadata)
            
            // Generar la despedida
            const { pp, caption, mentions } = await generarDespedida({
                conn,
                userId: m.sender,
                groupMetadata: grupoInfo,
                chat
            })
            
            // Enviar la vista previa
            await conn.sendMessage(m.chat, {
                image: { url: pp },
                caption,
                mentions
            }, { quoted: m })
            
            await m.react('✅')
        } catch (error) {
            console.error('Error en testbye:', error)
            await m.reply(`❌ Error al generar la vista previa:\n${error.message}`)
            await m.react('❌')
        }
        return
    }
}

handler.help = ['setwelcome', 'setbye', 'testwelcome', 'testbye', 'setgp']
handler.tags = ['group']
handler.command = ['setwelcome', 'setbye', 'testwelcome', 'testbye', 'setgp']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler