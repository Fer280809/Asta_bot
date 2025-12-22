import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon
    const itemsData = JSON.parse(fs.readFileSync('./lib/poke/items.json'))

    if (text) {
        let [id, qty] = text.split(' ')
        let item;
        for (let cat in itemsData) if (itemsData[cat][id]) item = itemsData[cat][id]
        
        if (!item) return m.reply('❌ Item no válido.')
        let cantidad = parseInt(qty) || 1
        let total = item.precio * cantidad

        if (p.dinero < total) return m.reply('💸 No tienes suficiente dinero.')
        p.dinero -= total
        p.mochila[id] = (p.mochila[id] || 0) + cantidad
        return m.reply(`🛒 Compraste ${cantidad}x ${item.nombre} por $${total}.`)
    }

    let sections = []
    for (let cat in itemsData) {
        if (cat === "aventura") continue // No se venden items de aventura
        let rows = []
        for (let id in itemsData[cat]) {
            rows.push({
                title: `${itemsData[cat][id].nombre}`,
                rowId: `${usedPrefix + command} ${id} 1`,
                description: `$${itemsData[cat][id].precio} - ${itemsData[cat][id].descripcion}`
            })
        }
        sections.push({ title: cat.toUpperCase(), rows })
    }

    return conn.sendList(m.chat, "🏪 TIENDA POKÉMON", `Tu dinero: $${p.dinero}`, "Comprar", sections, m)
}
handler.command = ['shop', 'tienda']
export default handler
