import fs from 'fs'

let handler = async (m, { conn, usedPrefix, command, text }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon
    if (!p?.registrado) return m.reply('❌ No has iniciado tu aventura.')

    const itemsData = JSON.parse(fs.readFileSync('./lib/poke/items.json'))

    // Lógica de uso de objetos
    if (text) {
        let itemID = text.toLowerCase().trim()
        let item;
        // Buscar el item en todas las categorías
        for (let cat in itemsData) {
            if (itemsData[cat][itemID]) item = itemsData[cat][itemID]
        }

        if (!item || p.mochila[itemID] <= 0) return m.reply('❌ No tienes ese objeto.')

        // EFECTO: POCIONES / CURACIÓN (Aplica al líder del equipo [0])
        if (item.curacion) {
            let poke = p.equipo[0]
            if (poke.hp >= poke.hpMax) return m.reply(`✅ *${poke.nombre}* ya tiene la vida al máximo.`)
            poke.hp = Math.min(poke.hpMax, poke.hp + item.curacion)
            p.mochila[itemID]--
            return m.reply(`✨ Usaste ${item.nombre} en ${poke.nombre}. HP: ${poke.hp}/${poke.hpMax}`)
        }

        // EFECTO: PIEDRAS EVOLUTIVAS
        if (itemID.includes('piedra_')) {
            // Redirige al comando de evolución indicando que se usa un objeto en el líder
            return conn.processCommand(`${usedPrefix}p evo 1 objeto`)
        }

        return m.reply(`🎒 Has seleccionado *${item.nombre}*, pero no se puede usar directamente desde aquí o es un objeto pasivo.`)
    }

    // INTERFAZ DE LISTA ORGANIZADA
    let sections = []
    for (let categoria in itemsData) {
        let rows = []
        for (let id in itemsData[categoria]) {
            let cantidad = p.mochila[id] || 0
            if (cantidad > 0) {
                rows.push({
                    title: `${itemsData[categoria][id].emoji || '📦'} ${itemsData[categoria][id].nombre} (x${cantidad})`,
                    rowId: `${usedPrefix + command} ${id}`,
                    description: itemsData[categoria][id].descripcion
                })
            }
        }
        if (rows.length > 0) sections.push({ title: categoria.toUpperCase(), rows })
    }

    if (sections.length === 0) return m.reply('🎒 Tu mochila está vacía.')

    return conn.sendList(m.chat, "🎒 MOCHILA DE " + p.nombreEntrenador.toUpperCase(), "Selecciona un objeto para usarlo en tu Pokémon líder:", "Abrir Mochila", sections, m)
}
handler.command = ['bag', 'mochila', 'p bag']
export default handler
