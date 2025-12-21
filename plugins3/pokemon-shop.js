import fs from 'fs'
import { PokemonLogic } from '../lib/poke/logic.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    if (!user.pokemon?.registrado) return m.reply('❌ No has iniciado tu aventura.')

    // Cargar datos
    const itemsData = JSON.parse(fs.readFileSync('./lib/poke/items.json'))
    const mapa = JSON.parse(fs.readFileSync('./lib/poke/mapa.json'))
    
    let p = user.pokemon
    let zonaActual = mapa[p.ubicacion]

    // 1. Verificación de Tienda en la zona
    if (!zonaActual.puntos_interes?.includes("Tienda") && !zonaActual.puntos_interes?.includes("Mercado")) {
        return m.reply(`🏙️ *${p.ubicacion}* no tiene una Tienda Pokémon. ¡Viaja a una ciudad cercana!`)
    }

    // 2. Lógica de Compra
    if (text) {
        let [itemKey, cantidad] = text.toLowerCase().split(' ')
        cantidad = parseInt(cantidad) || 1
        if (cantidad < 1) return m.reply('💢 La cantidad debe ser al menos 1.')

        // Buscar el ítem en todas las categorías del JSON
        let itemFound = null
        for (let cat in itemsData) {
            if (itemsData[cat][itemKey]) {
                itemFound = { ...itemsData[cat][itemKey], key: itemKey }
                break
            }
        }

        if (!itemFound) return m.reply('❌ Ese artículo no existe en nuestro catálogo.')

        let costeTotal = itemFound.precio * cantidad
        if (p.dinero < costeTotal) return m.reply(`💸 No tienes suficiente dinero. Te faltan *$${costeTotal - p.dinero}*`)

        // Ejecutar transacción
        p.dinero -= costeTotal
        p.inventario[itemKey] = (p.inventario[itemKey] || 0) + cantidad

        return conn.reply(m.chat, `✅ *¡Compra exitosa!*\n\n📦 Has comprado: ${cantidad}x ${itemFound.emoji} *${itemFound.nombre}*\n💰 Total gastado: *$${costeTotal}*\n👛 Saldo restante: *$${p.dinero}*`, m)
    }

    // 3. Interfaz Visual (Generación de Secciones)
    let textoTienda = `╔═════ 🛒 *TIENDA POKÉMON* ═════╗\n`
    textoTienda += `║ 👤 *Cliente:* ${p.nombreEntrenador}\n`
    textoTienda += `║ 📍 *Lugar:* ${p.ubicacion}\n`
    textoTienda += `║ 💰 *Tu Saldo:* $${p.dinero}\n`
    textoTienda += `╚════════════════════════╝\n\n`
    textoTienda += `💡 _Escribe *${usedPrefix + command} [nombre] [cantidad]* para comprar._`

    const sections = []

    // Categoría: Pokéballs
    sections.push({
        title: "⚪ SECCIÓN DE CAPTURA",
        rows: Object.entries(itemsData.balls).map(([id, info]) => ({
            title: `${info.emoji} ${info.nombre}`,
            rowId: `${usedPrefix + command} ${id}`,
            description: ` Precio: $${info.precio} - ${info.descripcion}`
        }))
    })

    // Categoría: Curación
    sections.push({
        title: "🧪 MEDICAMENTOS Y POCIONES",
        rows: Object.entries(itemsData.curacion).map(([id, info]) => ({
            title: `${info.emoji} ${info.nombre}`,
            rowId: `${usedPrefix + command} ${id}`,
            description: ` Precio: $${info.precio} - ${info.descripcion}`
        }))
    })

    // Categoría: Evolución (Solo mostrar si hay stock o es ciudad grande)
    if (p.ubicacion.includes("Ciudad") || p.ubicacion.includes("Pueblo Ancestral")) {
        sections.push({
            title: "💎 OBJETOS DE EVOLUCIÓN",
            rows: Object.entries(itemsData.evolucion).map(([id, info]) => ({
                title: `${info.emoji} ${info.nombre}`,
                rowId: `${usedPrefix + command} ${id}`,
                description: ` Precio: $${info.precio} - ${info.descripcion}`
            }))
        })
    }

    await conn.sendList(m.chat, "🏪 CENTRO COMERCIAL AURALIS", textoTienda, "Ver Catálogo", sections, m)
}

handler.command = /^(p|pokemon)shop$/i
export default handler
