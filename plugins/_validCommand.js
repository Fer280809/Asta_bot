import fetch from 'node-fetch'

export async function before(m, { conn }) {
    if (!m.text || m.isBaileys) return !0
    
    const prefixes = ['!', '#', '.', '/', '-']
    const hasPrefix = prefixes.includes(m.text[0])
    const usedPrefix = hasPrefix ? m.text[0] : ''

    if (!hasPrefix && !global.sinprefix) return !0

    const textTrim = m.text.trim()
    const str = hasPrefix ? textTrim.slice(1).trim() : textTrim
    const command = str.split(' ')[0].toLowerCase()

    if (!command) return !0

    // IGNORAR COMANDOS DE EXECUÇÃO PARA EVITAR PARSEERROR
    if (hasPrefix && (command === '>' || command === '=>' || command === '$')) return !0

    const isRealCommand = Object.values(global.plugins).some(plugin => {
        if (!plugin.command) return false
        const pluginCommands = Array.isArray(plugin.command) ? plugin.command : [plugin.command]
        return pluginCommands.some(cmd => (cmd instanceof RegExp ? cmd.test(command) : cmd === command))
    })

    if (!isRealCommand) {
        if (hasPrefix) {
            // Layout de Canal do WhatsApp
            const canalMsg = {
                contextInfo: {
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363160031023229@newsletter",
                        serverMessageId: '',
                        newsletterName: "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』" 
                    },
                    externalAdReply: {
                        title: "『 𝕬𝖘𝖙𝖆-𝕭𝖔𝖙 』",
                        body: `Comando não encontrado: ${command}`,
                        thumbnailUrl: global.icono,
                        sourceUrl: global.channel,
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }

            await conn.sendMessage(m.chat, { 
                text: `⚠️ *Comando Inválido*\n\n💡 Use *${usedPrefix}menu* para ver a lista completa.` 
            }, { quoted: m, ...canalMsg })
            
            return !1
        }
        return !0
    }

    let chat = global.db.data.chats[m.chat]
    let settings = global.db.data.settings[conn.user.jid]
    let owner = [...global.owner.map(([number]) => number)].map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender)

    if (chat?.isBanned && !owner) return !1
    if (chat?.isMute && !owner) return !1
    if (settings?.self && !owner) return !1

    return !0
}
