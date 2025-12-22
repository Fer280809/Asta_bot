import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false
    if (!who) return m.reply(`✨ *MODO DIOS POKÉMON*\n\nUso:\n${usedPrefix + command} @usuario [cantidad/id]`)

    let user = global.db.data.users[who]
    if (!user) return m.reply('❌ El usuario no está en mi base de datos.')
    if (!user.pokemon?.registrado) return m.reply('❌ El usuario aún no ha iniciado su aventura Pokémon.')

    let p = user.pokemon
    let input = text.split(' ')
    let valor = input[1]

    switch (command) {
        case 'addmoney':
            if (!valor || isNaN(valor)) return m.reply('💰 Indica la cantidad de dinero.')
            p.dinero += parseInt(valor)
            m.reply(`✅ Se han añadido $${valor} a @${who.split('@')[0]}`, null, { mentions: [who] })
            break

        case 'givepokemon':
            const pokedex = JSON.parse(fs.readFileSync('./lib/poke/pokedex.json'))
            if (!valor || !pokedex[valor]) return m.reply('👾 Indica un ID de Pokémon válido.')
            let pData = pokedex[valor]
            let nuevoPk = {
                id: valor,
                nombre: pData.nombre,
                nivel: input[2] || 5,
                exp: 0,
                hp: pData.statsBase.hp + 10,
                hpMax: pData.statsBase.hp + 10,
                tipos: pData.tipos,
                stats: pData.statsBase
            }
            p.equipo.push(nuevoPk)
            m.reply(`✅ ¡Se ha entregado un *${pData.nombre}* a @${who.split('@')[0]}!`, null, { mentions: [who] })
            break

        case 'giveitem':
            if (!valor) return m.reply('🎒 Indica el ID del objeto (ej: pokeball, hacha).')
            let cant = input[2] || 1
            p.mochila[valor] = (p.mochila[valor] || 0) + parseInt(cant)
            m.reply(`✅ Se han entregado ${cant}x *${valor}* a @${who.split('@')[0]}`, null, { mentions: [who] })
            break
    }
}

handler.help = ['addmoney', 'givepokemon', 'giveitem']
handler.tags = ['owner']
handler.command = ['addmoney', 'givepokemon', 'giveitem']
handler.rowner = true // Solo el dueño del bot puede usarlo

export default handler
