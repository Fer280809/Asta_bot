import fs from 'fs'

let handler = async (m, { conn, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    if (!user.pokemon?.registrado) return m.reply('❌ No tienes una partida activa.')

    let p = user.pokemon
    let itemsData = JSON.parse(fs.readFileSync('./lib/poke/items.json'))
    
    let inventario = p.inventario || {}
    let texto = `🎒 *MOCHILA DE ${p.nombreEntrenador.toUpperCase()}*\n`
    texto += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`
    texto += `💰 *Dinero:* $${p.dinero}\n\n`

    let categorias = {
        "balls": "⚪ *Poké Balls*",
        "curacion": "🧪 *Objetos de Salud*",
        "evolucion": "💎 *Objetos de Evolución*",
        "especial": "⭐ *Otros*"
    }

    let vacia = true
    for (let [catKey, catName] of Object.entries(categorias)) {
        let itemsEnCat = ""
        for (let [itemId, cantidad] of Object.entries(inventario)) {
            // Buscar datos del item en la categoría correspondiente del JSON maestro
            let itemInfo = itemsData[catKey]?.[itemId]
            if (itemInfo && cantidad > 0) {
                itemsEnCat += `• ${itemInfo.emoji} *${itemInfo.nombre}* x${cantidad}\n`
                vacia = false
            }
        }
        if (itemsEnCat) texto += `${catName}\n${itemsEnCat}\n`
    }

    if (vacia) texto += `_Tu mochila está vacía..._ 🏜️\n`

    texto += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`
    texto += `💡 _Usa *${usedPrefix}puse [nombre]* para usar un objeto._`

    await conn.reply(m.chat, texto, m)
}

handler.command = /^(p|pokemon)bag|mochila$/i
export default handler
