import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon

    // 1. Verificación de inicio
    if (!p?.registrado) return m.reply(`❌ No tienes una partida activa. Usa *${usedPrefix}p start*`)

    const itemsData = JSON.parse(fs.readFileSync('./lib/poke/items.json'))

    // 2. LÓGICA DE USO DE OBJETOS
    if (text) {
        let input = text.toLowerCase().split(' ')
        let action = input[0] // ej: "use"
        let itemID = input[1] // ej: "pocion"

        if (action === 'use' || action === 'usar') {
            if (!itemID) return m.reply(`💡 Indica qué quieres usar. Ejemplo: *${usedPrefix + command} use pocion*`)
            
            // Verificar si tiene el objeto
            if (!p.mochila[itemID] || p.mochila[itemID] <= 0) {
                return m.reply(`❌ No tienes *${itemID}* en tu mochila.`)
            }

            let itemInfo = itemsData[itemID]

            // EFECTO: POCIÓN (Curación)
            if (itemID.includes('pocion')) {
                if (p.hp >= p.hpMax) return m.reply(`❤️ *${p.nombre}* ya tiene la salud al máximo.`)
                
                let saludRecuperada = itemID === 'superpocion' ? 100 : 50
                p.hp = Math.min(p.hpMax, p.hp + saludRecuperada)
                p.mochila[itemID]--
                
                return m.reply(`🧪 Usaste una *${itemInfo.nombre}*.\n💖 *${p.nombre}* recuperó salud. HP: ${p.hp}/${p.hpMax}`)
            }

            // EFECTO: ANTÍDOTO (Estado)
            if (itemID === 'antidoto') {
                // Aquí podrías añadir lógica de estados alterados en la V2
                p.mochila[itemID]--
                return m.reply(`✨ Usaste un *Antídoto* en *${p.nombre}*.`)
            }

            // OBJETOS NO USABLES DESDE LA MOCHILA (Poké Balls)
            if (itemID.includes('bola')) {
                return m.reply(`🔴 Las Poké Balls se usan automáticamente durante una captura con *.p hunt capturar*`)
            }

            return m.reply(`❓ El objeto *${itemInfo.nombre}* no tiene un efecto de uso directo desde la mochila.`)
        }
    }

    // 3. INTERFAZ DE LA MOCHILA (Visualización)
    let inventario = `🎒 *MOCHILA DE ${p.nombreEntrenador.toUpperCase()}*\n`
    inventario += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n`

    let hayItems = false
    for (let id in p.mochila) {
        if (p.mochila[id] > 0) {
            let info = itemsData[id] || { nombre: id, descripcion: 'Objeto misterioso' }
            inventario += `📦 *${info.nombre}* x${p.mochila[id]}\n`
            inventario += `   _${info.descripcion}_\n\n`
            hayItems = true
        }
    }

    if (!hayItems) {
        inventario += `_Tu mochila está vacía..._\n_¡Ve a una tienda a comprar suministros!_\n`
    }

    inventario += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`
    inventario += `💰 *Dinero:* $${p.dinero.toLocaleString()}\n\n`
    inventario += `💡 Para usar un objeto: *${usedPrefix + command} use [nombre]*`

    await conn.reply(m.chat, inventario, m)
}

handler.command = /^(p|pokemon)bag|mochila|inventario|items$/i
export default handler
