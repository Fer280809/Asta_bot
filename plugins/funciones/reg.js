import { createHash } from 'crypto'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const user = global.db.data.users[m.sender]
    
    // Si ya está completamente registrado
    if (user.registered === true && user.name && user.age) {
        return conn.reply(m.chat, `✅ *Ya estás registrado*\n\n👤 Nombre: ${user.name}\n🎂 Edad: ${user.age}\n\nUsa *${usedPrefix}profile* para ver tu perfil.`, m)
    }

    // Verificar formato del comando
    if (!text) {
        return conn.reply(m.chat, `📝 *REGISTRO DE USUARIO*\n\nFormatos disponibles:\n\n*${usedPrefix}reg nombre/edad*\n> Ejemplo: *${usedPrefix}reg Juan/25*\n\n*${usedPrefix}reg nombre/edad/género/cumpleaños*\n> Ejemplo: *${usedPrefix}reg Juan/25/hombre/15/05/1998*\n\n⚠️ *Nota:* El nombre no debe contener números y la edad debe ser entre 5 y 100 años.`, m)
    }

    const args = text.split('/').map(v => v.trim())
    
    // Modo simple: nombre/edad
    if (args.length === 2) {
        const [name, age] = args
        
        // Validar nombre
        if (!name || name.length < 2) {
            return conn.reply(m.chat, `❌ *Nombre inválido*\nEl nombre debe tener al menos 2 caracteres.`, m)
        }
        if (/\d/.test(name)) {
            return conn.reply(m.chat, `❌ *Nombre inválido*\nEl nombre no debe contener números.`, m)
        }
        if (name.length > 30) {
            return conn.reply(m.chat, `❌ *Nombre muy largo*\nMáximo 30 caracteres.`, m)
        }
        
        // Validar edad
        const ageNum = parseInt(age)
        if (isNaN(ageNum) || ageNum < 5 || ageNum > 100) {
            return conn.reply(m.chat, `❌ *Edad inválida*\nLa edad debe ser un número entre 5 y 100 años.`, m)
        }
        
        // Guardar datos básicos
        user.name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
        user.age = ageNum
        user.regTime = Date.now()
        
        // Si ya tenía datos parciales, conservarlos y solo actualizar lo nuevo
        if (!user.registered) {
            user.registered = true
            user.registro = true
            user.serial = createHash('md5').update(m.sender).digest('hex').slice(0, 10).toUpperCase()
        }
        
        // Mensaje de éxito
        let txt = `✅ *¡REGISTRO COMPLETADO!* ✅\n\n`
        txt += `┌─「 *DATOS DEL USUARIO* 」\n`
        txt += `├ 👤 *Nombre:* ${user.name}\n`
        txt += `├ 🎂 *Edad:* ${user.age} años\n`
        txt += `├ 🆔 *Serial:* ${user.serial}\n`
        
        if (user.genre) txt += `├ ⚥ *Género:* ${user.genre}\n`
        if (user.birth) txt += `├ 🎉 *Cumpleaños:* ${user.birth}\n`
        
        txt += `└────────────────\n\n`
        txt += `💡 *Consejo:* Puedes completar más datos con:\n`
        txt += `• *${usedPrefix}setgenre* - Establecer género\n`
        txt += `• *${usedPrefix}setbirth* - Establecer cumpleaños\n`
        txt += `• *${usedPrefix}setdesc* - Establecer descripción\n\n`
        txt += `📋 Ver tu perfil: *${usedPrefix}profile*`
        
        await conn.sendMessage(m.chat, { 
            text: txt,
            mentions: [m.sender]
        }, { quoted: m })
        
    } 
    // Modo completo: nombre/edad/género/cumpleaños
    else if (args.length >= 4) {
        const [name, age, genre, ...birthParts] = args
        const birth = birthParts.join('/')
        
        // Validar nombre
        if (!name || name.length < 2) {
            return conn.reply(m.chat, `❌ *Nombre inválido*\nEl nombre debe tener al menos 2 caracteres.`, m)
        }
        if (/\d/.test(name)) {
            return conn.reply(m.chat, `❌ *Nombre inválido*\nEl nombre no debe contener números.`, m)
        }
        if (name.length > 30) {
            return conn.reply(m.chat, `❌ *Nombre muy largo*\nMáximo 30 caracteres.`, m)
        }
        
        // Validar edad
        const ageNum = parseInt(age)
        if (isNaN(ageNum) || ageNum < 5 || ageNum > 100) {
            return conn.reply(m.chat, `❌ *Edad inválida*\nLa edad debe ser un número entre 5 y 100 años.`, m)
        }
        
        // Validar género
        const genreLower = genre.toLowerCase()
        if (!['hombre', 'mujer', 'otro'].includes(genreLower)) {
            return conn.reply(m.chat, `❌ *Género inválido*\nOpciones disponibles: *hombre*, *mujer*, *otro*`, m)
        }
        
        // Validar fecha de nacimiento
        const fechaValida = validarFechaNacimiento(birth)
        if (!fechaValida) {
            return conn.reply(m.chat, `❌ *Fecha inválida*\nFormato: *día/mes/año* (ej: 15/05/1998)\nLa fecha debe ser lógica (edad entre 5 y 100 años).`, m)
        }
        
        // Guardar todos los datos
        user.name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
        user.age = ageNum
        user.genre = genreLower.charAt(0).toUpperCase() + genreLower.slice(1)
        user.birth = fechaValida
        user.regTime = Date.now()
        
        if (!user.registered) {
            user.registered = true
            user.registro = true
            user.serial = createHash('md5').update(m.sender).digest('hex').slice(0, 10).toUpperCase()
        }
        
        // Mensaje de éxito completo
        let txt = `✅ *¡REGISTRO COMPLETO!* ✅\n\n`
        txt += `┌─「 *DATOS DEL USUARIO* 」\n`
        txt += `├ 👤 *Nombre:* ${user.name}\n`
        txt += `├ 🎂 *Edad:* ${user.age} años\n`
        txt += `├ ⚥ *Género:* ${user.genre}\n`
        txt += `├ 🎉 *Cumpleaños:* ${user.birth}\n`
        txt += `├ 🆔 *Serial:* ${user.serial}\n`
        txt += `└────────────────\n\n`
        txt += `🎉 *¡Bienvenido oficialmente!*\n`
        txt += `Ahora tienes acceso a todos los comandos del bot.\n\n`
        txt += `📋 Ver tu perfil: *${usedPrefix}profile*`
        
        await conn.sendMessage(m.chat, { 
            text: txt,
            mentions: [m.sender]
        }, { quoted: m })
        
    } else {
        return conn.reply(m.chat, `❌ *Formato incorrecto*\n\nUsa:\n*${usedPrefix}reg nombre/edad*\nO:\n*${usedPrefix}reg nombre/edad/género/cumpleaños*`, m)
    }
}

// Función para validar fecha de nacimiento
function validarFechaNacimiento(text) {
    const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    if (!regex.test(text)) return null
    
    const [, dia, mes, año] = text.match(regex)
    const d = parseInt(dia)
    const m = parseInt(mes)
    const a = parseInt(año)
    
    const fecha = new Date(a, m - 1, d)
    if (fecha.getDate() !== d || fecha.getMonth() !== m - 1 || fecha.getFullYear() !== a) {
        return null
    }
    
    const ahora = new Date()
    const edad = ahora.getFullYear() - a
    if (edad < 5 || edad > 100) return null
    
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
    return `${d} de ${meses[m - 1]} de ${a}`
}

handler.help = ['reg nombre/edad', 'reg nombre/edad/género/cumpleaños']
handler.tags = ['rg']
handler.command = ['reg', 'register', 'verificar', 'verify']
// NO lleva handler.reg = true porque es el comando de registro

export default handler
