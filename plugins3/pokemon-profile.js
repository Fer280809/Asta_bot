import fs from 'fs'

let handler = async (m, { conn, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    
    // 1. Verificar registro
    if (!user.pokemon?.registrado) {
        return m.reply(`❌ No has iniciado tu aventura. Usa *${usedPrefix}p start* para elegir tu primer Pokémon.`)
    }

    let p = user.pokemon
    const pokedex = JSON.parse(fs.readFileSync('./lib/poke/pokedex.json'))
    const pokeData = pokedex[p.id]

    // 2. Formatear Medallas (Emojis para visualización)
    let medallasTxt = p.medallas.length > 0 
        ? p.medallas.map(m => `🏅 *${m}*`).join(', ') 
        : 'Ninguna'

    // 3. Calcular progreso de experiencia
    let expNext = p.nivel * 100
    let expBar = '▓'.repeat(Math.floor((p.exp / expNext) * 10)) + '░'.repeat(10 - Math.floor((p.exp / expNext) * 10))

    // 4. Construcción del mensaje (Diseño Elegante)
    let perfil = `💳 *TARJETA DE ENTRENADOR AURALIS*\n`
    perfil += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`
    perfil += `👤 *Entrenador:* ${p.nombreEntrenador}\n`
    perfil += `📍 *Ubicación:* ${p.ubicacion}\n`
    perfil += `💰 *Dinero:* $${p.dinero.toLocaleString()}\n`
    perfil += `🏆 *Medallas:* ${p.medallas.length}/8\n`
    perfil += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n`
    
    perfil += `⭐ *POKÉMON LÍDER*\n`
    perfil += `• *Mote:* ${p.nombre}\n`
    perfil += `• *Especie:* ${pokeData.nombre}\n`
    perfil += `• *Nivel:* ${p.nivel}\n`
    perfil += `• *Tipos:* ${p.tipos.join(' / ')}\n\n`
    
    perfil += `❤️ *Salud (HP):* ${p.hp} / ${p.hpMax}\n`
    perfil += `[${p.hp > 0 ? '🟢' : '🔴'}] ${p.hp <= 0 ? '*DEBILITADO*' : '*SANO*'}\n\n`
    
    perfil += `📈 *Experiencia:* ${p.exp} / ${expNext}\n`
    perfil += `${expBar}\n\n`
    
    perfil += `😊 *Felicidad:* ${p.emocion}%\n`
    perfil += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`
    perfil += `🏅 *Colección de Medallas:*\n${medallasTxt}\n`
    perfil += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n`
    perfil += `📱 _Usa *${usedPrefix}p bag* para ver tus objetos o *${usedPrefix}p team* para ver tu PC._`

    // 5. Enviar con la imagen del Pokémon líder si existe en la pokedex
    if (pokeData.imagen) {
        await conn.sendFile(m.chat, pokeData.imagen, 'pokemon.jpg', perfil, m)
    } else {
        await conn.reply(m.chat, perfil, m)
    }
}

handler.command = /^(p|pokemon)(profile|perfil|trainer|card|stats)$/i
export default handler
