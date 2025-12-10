const handler = async (m, { conn, usedPrefix, command }) => {
    console.log('=== COMANDO DIRECTO EJECUTADO ===')
    console.log('Comando:', command)
    
    const primaryBot = global.db.data.chats[m.chat]?.primaryBot
    if (primaryBot && conn.user.jid !== primaryBot) return
    
    const chat = global.db.data.chats[m.chat]
    
    // Mapear comando a tipo y estado
    const commandMap = {
        'welcomeon': { type: 'welcome', state: true },
        'welcomeoff': { type: 'welcome', state: false },
        'bienvenidaon': { type: 'welcome', state: true },
        'bienvenidaoff': { type: 'welcome', state: false },
        
        'modoadminon': { type: 'modoadmin', state: true },
        'modoadminoff': { type: 'modoadmin', state: false },
        'onlyadminon': { type: 'modoadmin', state: true },
        'onlyadminoff': { type: 'modoadmin', state: false },
        
        'detecton': { type: 'detect', state: true },
        'detectoff': { type: 'detect', state: false },
        'alertason': { type: 'detect', state: true },
        'alertasoff': { type: 'detect', state: false },
        
        'antilinkon': { type: 'antilink', state: true },
        'antilinkoff': { type: 'antilink', state: false },
        'antienlaceon': { type: 'antilink', state: true },
        'antienlaceoff': { type: 'antilink', state: false },
        
        'nsfwon': { type: 'nsfw', state: true },
        'nsfwoff': { type: 'nsfw', state: false },
        'modohornyon': { type: 'nsfw', state: true },
        'modohornyoff': { type: 'nsfw', state: false },
        
        'economyon': { type: 'economy', state: true },
        'economyoff': { type: 'economy', state: false },
        'economiaon': { type: 'economy', state: true },
        'economiaoff': { type: 'economy', state: false },
        
        'rpgon': { type: 'rpg', state: true },
        'rpgoff': { type: 'rpg', state: false },
        'gachaon': { type: 'rpg', state: true },
        'gachaoff': { type: 'rpg', state: false },
        
        'antispamon': { type: 'antispam', state: true },
        'antispamoff': { type: 'antispam', state: false }
    }
    
    const config = commandMap[command.toLowerCase()]
    
    if (!config) {
        return conn.reply(m.chat, '❌ Comando no reconocido', m)
    }
    
    const { type, state: newState } = config
    
    // Determinar estado actual
    let isEnable = chat[type] !== undefined ? chat[type] : false
    
    if (isEnable === newState) {
        return conn.reply(m.chat, `⚠️ El *${type}* ya estaba *${newState ? 'activado' : 'desactivado'}*`, m)
    }
    
    chat[type] = newState
    console.log('✅ Chat[' + type + '] actualizado:', newState)
    
    // Mensaje de confirmación
    const msg = `✅ *${type.toUpperCase()}* *${newState ? 'ACTIVADO' : 'DESACTIVADO'}*
🔹 Estado: *${newState ? '✅ Encendido' : '❌ Apagado'}*
🔹 Usuario: @${m.sender.split('@')[0]}`
    
    console.log('📤 Confirmación enviada')
    return conn.sendMessage(m.chat, { text: msg, mentions: [m.sender] }, { quoted: m })
}

handler.command = [
    'welcomeon', 'welcomeoff', 'bienvenidaon', 'bienvenidaoff',
    'modoadminon', 'modoadminoff', 'onlyadminon', 'onlyadminoff',
    'detecton', 'detectoff', 'alertason', 'alertasoff',
    'antilinkon', 'antilinkoff', 'antienlaceon', 'antienlaceoff',
    'nsfwon', 'nsfwoff', 'modohornyon', 'modohornyoff',
    'economyon', 'economyoff', 'economiaon', 'economiaoff',
    'rpgon', 'rpgoff', 'gachaon', 'gachaoff',
    'antispamon', 'antispamoff'
]
handler.tags = ['enable']
handler.group = true
handler.admin = true

export default handler