import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    let p = user.pokemon

    // 1. Validaciones de inicio
    if (!p?.registrado) return m.reply(`❌ No has iniciado tu aventura. Usa *${usedPrefix}p start*`)

    const itemsData = JSON.parse(fs.readFileSync('./lib/poke/items.json'))
    const mapa = JSON.parse(fs.readFileSync('./lib/poke/mapa.json'))
    
    // 2. Verificar si hay una Tienda (PokéMart) en la ubicación actual
    let zonaActual = mapa[p.ubicacion]
    if (!zonaActual.puntos_interes.includes("Tienda Pokémon") && !zonaActual.puntos_interes.includes("PokéMart")) {
        return m.reply(`🏙️ No hay una Tienda Pokémon en *${p.ubicacion}*. Debes viajar a una ciudad para comprar suministros.`)
    }

    // 3. Si no escribe qué comprar, mostrar el catálogo
    if (!text) {
        let catalogo = `🛒 *BIENVENIDO A LA TIENDA POKÉMON* 🛒\n`
        catalogo += `💰 Tu saldo: $${p.dinero.toLocaleString()}\n`
        catalogo += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n`
        
        for (let id in itemsData) {
            let item = itemsData[id]
            catalogo += `🔹 *${item.nombre}* \n`
            catalogo += `   Price: $${item.precio} | _${item.descripcion}_\n`
            catalogo += `   Comprar: \`${usedPrefix + command} ${id}\`\n\n`
        }
        
        catalogo += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`
        catalogo += `💡 _Ejemplo: ${usedPrefix + command} pokebola_`
        return m.reply(catalogo)
    }

    // 4. PROCESAR LA COMPRA
    let input = text.toLowerCase().split(' ')
    let itemID = input[0]
    let cantidad = parseInt(input[1]) || 1 // Por defecto compra 1

    if (cantidad <= 0) return m.reply('❌ La cantidad debe ser mayor a 0.')

    let itemSeleccionado = itemsData[itemID]

    if (!itemSeleccionado) {
        return m.reply(`❌ El objeto *"${itemID}"* no está disponible en esta tienda.`)
    }

    let costoTotal = itemSeleccionado.precio * cantidad

    // 5. Validar fondos
    if (p.dinero < costoTotal) {
        return m.reply(`❌ No tienes suficiente dinero. \n💰 Costo: $${costoTotal} | Saldo: $${p.dinero}`)
    }

    // 6. Ejecutar transacción
    p.dinero -= costoTotal
    p.mochila[itemID] = (p.mochila[itemID] || 0) + cantidad

    let ticket = `🛍️ *RECIBO DE COMPRA*\n`
    ticket += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`
    ticket += `📦 Objeto: ${itemSeleccionado.nombre}\n`
    ticket += `🔢 Cantidad: ${cantidad}\n`
    ticket += `💸 Total pagado: $${costoTotal}\n`
    ticket += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`
    ticket += `💰 Saldo restante: $${p.dinero}\n\n`
    ticket += `✨ ¡Gracias por su compra! Vuelva pronto.`

    await conn.reply(m.chat, ticket, m)
}

handler.command = /^(p|pokemon)shop|tienda|mart|buy|comprar$/i
export default handler
