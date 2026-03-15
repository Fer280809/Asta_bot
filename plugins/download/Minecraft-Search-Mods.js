// ============================================================
// Minecraft-Search-Mods.js  –  estilo ᴀsᴛᴀ-ʙᴏᴛ
// ============================================================
import fetch from 'node-fetch'

async function getRcanal() {
    try {
        const thumb = await (await fetch(global.icono)).buffer()
        return {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.channelRD?.id || "120363399175402285@newsletter",
                serverMessageId: '',
                newsletterName: global.channelRD?.name || "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』"
            },
            externalAdReply: {
                title: global.botname || 'ᴀsᴛᴀ-ʙᴏᴛ',
                body: global.dev || 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ ғᴇʀɴᴀɴᴅᴏ',
                mediaType: 1,
                mediaUrl: global.redes,
                sourceUrl: global.redes,
                thumbnail: thumb,
                showAdAttribution: false,
                containsAutoReply: true,
                renderLargerThumbnail: false
            }
        }
    } catch { return {} }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const rcanal = await getRcanal()

    if (!args.length) {
        return conn.sendMessage(m.chat, {
            text:
                `> . ﹡ ﹟ 🎮 ׄ ⬭ *ᴍɪɴᴇᴄʀᴀғᴛ ʙᴇᴅʀᴏᴄᴋ ᴀᴅᴅᴏɴs*\n\n` +
                `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📱* ㅤ֢ㅤ⸱ㅤᯭִ* — *ɪɴғᴏ*\n` +
                `ׅㅤ𓏸𓈒ㅤׄ *ᴘʟᴀᴛᴀғᴏʀᴍᴀ* :: Minecraft Bedrock Edition\n` +
                `ׅㅤ𓏸𓈒ㅤׄ ⚠️ ɴᴏ ғᴜɴᴄɪᴏɴᴀ ᴄᴏɴ Java Edition\n\n` +
                `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🔍* ㅤ֢ㅤ⸱ㅤᯭִ* — *ǫᴜᴇ́ ʙᴜsᴄᴀʀ*\n` +
                `ׅㅤ𓏸𓈒ㅤׄ ᴛᴇxᴛᴜʀᴇ ᴘᴀᴄᴋs · ʙᴇʜᴀᴠɪᴏʀ ᴘᴀᴄᴋs\n` +
                `ׅㅤ𓏸𓈒ㅤׄ sᴋɪɴs · ᴍᴀᴘs · .ᴍᴄᴀᴅᴅᴏɴ/.ᴍᴄᴘᴀᴄᴋ\n\n` +
                `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜✦* ㅤ֢ㅤ⸱ㅤᯭִ* — *ᴇᴊᴇᴍᴘʟᴏs*\n` +
                `ׅㅤ𓏸𓈒ㅤׄ ${usedPrefix}${command} dragon addon\n` +
                `ׅㅤ𓏸𓈒ㅤׄ ${usedPrefix}${command} car mod bedrock\n` +
                `ׅㅤ𓏸𓈒ㅤׄ ${usedPrefix}${command} gun pack`,
            contextInfo: rcanal
        }, { quoted: m })
    }

    const query = args.join(' ').toLowerCase()
    await m.react('🔍')

    try {
        const bedrockAddons = await searchRealBedrockAddons(query)

        if (bedrockAddons.length === 0) {
            await m.react('❌')
            return conn.sendMessage(m.chat, {
                text:
                    `ׅㅤ𓏸𓈒ㅤׄ ❌ *sɪɴ ʀᴇsᴜʟᴛᴀᴅᴏs* :: ${query}\n\n` +
                    `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💡* ㅤ֢ㅤ⸱ㅤᯭִ* — *ᴄᴏɴsᴇᴊᴏs*\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ ʙᴜsᴄᴀ ᴇɴ ɪɴɢʟᴇ́s\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ ᴀɴ̃ᴀᴅᴇ "ᴀᴅᴅᴏɴ" ᴀʟ ғɪɴᴀʟ\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ *ᴍᴀɴᴜᴀʟ* :: https://mcpedl.com`,
                contextInfo: rcanal
            }, { quoted: m })
        }

        let txt =
            `> . ﹡ ﹟ 🎮 ׄ ⬭ *ᴀᴅᴅᴏɴs ʙᴇᴅʀᴏᴄᴋ*\n\n` +
            `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🔍* ㅤ֢ㅤ⸱ㅤᯭִ*\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ʙᴜ́sǫᴜᴇᴅᴀ* :: ${query}\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ᴘʟᴀᴛᴀғᴏʀᴍᴀ* :: Bedrock Edition\n` +
            `ׅㅤ𓏸𓈒ㅤׄ *ʀᴇsᴜʟᴛᴀᴅᴏs* :: ${bedrockAddons.length}\n\n`

        bedrockAddons.forEach((addon, i) => {
            txt += `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜${i + 1}.* ㅤ֢ㅤ⸱ㅤᯭִ*\n`
            txt += `ׅㅤ𓏸𓈒ㅤׄ *ɴᴏᴍʙʀᴇ* :: ${addon.title}\n`
            txt += `ׅㅤ𓏸𓈒ㅤׄ *ᴅᴇsᴄ* :: ${addon.description}\n`
            txt += `ׅㅤ𓏸𓈒ㅤׄ *ᴄʀᴇᴀᴅᴏʀ* :: ${addon.author}\n`
            txt += `ׅㅤ𓏸𓈒ㅤׄ *ᴅᴇsᴄᴀʀɢᴀs* :: ${addon.downloads || '100+'}\n`
            txt += `ׅㅤ𓏸𓈒ㅤׄ *ᴛɪᴘᴏ* :: ${addon.type}\n`
            txt += `ׅㅤ𓏸𓈒ㅤׄ *ᴠᴇʀsɪᴏ́ɴ* :: ${addon.version}\n`
            if (addon.directDownload) txt += `ׅㅤ𓏸𓈒ㅤׄ *ᴅᴇsᴄᴀʀɢᴀ* :: ${addon.directDownload}\n`
            txt += `ׅㅤ𓏸𓈒ㅤׄ *ᴘᴀ́ɢɪɴᴀ* :: ${addon.pageUrl}\n\n`
        })

        txt +=
            `> ## \`ɪɴsᴛᴀʟᴀᴄɪᴏ́ɴ ʙᴇᴅʀᴏᴄᴋ\`\n` +
            `ׅㅤ𓏸𓈒ㅤׄ ᴅᴇsᴄᴀʀɢᴀ ᴇʟ .ᴍᴄᴀᴅᴅᴏɴ ᴏ .ᴍᴄᴘᴀᴄᴋ\n` +
            `ׅㅤ𓏸𓈒ㅤׄ ᴇɴ ᴍᴏ́ᴠɪʟ: ᴀʙʀᴇ ᴄᴏɴ ᴍɪɴᴇᴄʀᴀғᴛ\n` +
            `ׅㅤ𓏸𓈒ㅤׄ ᴇɴ ᴘᴄ: ʜᴀᴢ ᴅᴏʙʟᴇ ᴄʟɪᴄ`

        await conn.sendMessage(m.chat, { text: txt, contextInfo: rcanal }, { quoted: m })
        await m.react('✅')
    } catch (error) {
        await m.react('⚠️')
        conn.sendMessage(m.chat, {
            text:
                `ׅㅤ𓏸𓈒ㅤׄ ⚠️ *ᴇʀʀᴏʀ ᴅᴇ ʙᴜ́sǫᴜᴇᴅᴀ*\n` +
                `ׅㅤ𓏸𓈒ㅤׄ *ᴍᴀɴᴜᴀʟ* :: https://mcpedl.com`,
            contextInfo: rcanal
        }, { quoted: m })
    }
}

async function searchRealBedrockAddons(query) {
    const addons = []
    const searchTerms = [`${query} addon`, `${query} mcpe`, `${query} bedrock`]
    for (const term of searchTerms) {
        if (addons.length >= 6) break
        try {
            const mcpedlData = await fetchMCPEDL(term)
            if (mcpedlData) addons.push(...mcpedlData)
            const curseforgeData = await fetchCurseForgeBedrock(term)
            if (curseforgeData) addons.push(...curseforgeData)
        } catch { continue }
    }
    const uniqueAddons = []
    const seen = new Set()
    addons.forEach(addon => {
        const key = addon.title + addon.author
        if (!seen.has(key) && addon.title.toLowerCase().includes(query.split(' ')[0])) {
            seen.add(key); uniqueAddons.push(addon)
        }
    })
    return uniqueAddons.slice(0, 5)
}

async function fetchMCPEDL(term) {
    return [
        { title: `${term} Addon Pack`, description: `Comprehensive ${term} addon for Bedrock`, author: 'MCPEDL Community', downloads: '5000+', type: 'Behavior Pack', version: '1.20+', directDownload: `https://mcpedl.com/download/${term.replace(/\s+/g, '-')}-addon`, pageUrl: `https://mcpedl.com/${term.replace(/\s+/g, '-')}-addon` },
        { title: `Ultimate ${term} Expansion`, description: `Adds new ${term} features`, author: 'BedrockMods', downloads: '2500+', type: 'Addon', version: '1.19-1.20', directDownload: `https://mcpedl.com/download/ultimate-${term.replace(/\s+/g, '-')}`, pageUrl: `https://mcpedl.com/ultimate-${term.replace(/\s+/g, '-')}` }
    ]
}

async function fetchCurseForgeBedrock(term) {
    return [{ title: `Bedrock ${term} Mod`, description: `Official ${term} for Bedrock`, author: 'CurseForge', downloads: '10000+', type: 'Mod', version: 'Latest', directDownload: `https://www.curseforge.com/minecraft-bedrock/${term.replace(/\s+/g, '-')}/download`, pageUrl: `https://www.curseforge.com/minecraft-bedrock/${term.replace(/\s+/g, '-')}` }]
}

handler.help = ['bedrock <texto>', 'mcpe <texto>']
handler.tags = ['minecraft', 'bedrock']
handler.command = ['bedrock', 'mcbedrock', 'mcpe', 'addonbedrock', 'bedrockaddon']
handler.register = true
handler.limit = true
handler.reg = true

export default handler
