import { smsg } from "./lib/simple.js"
import { fileURLToPath } from "url"
import path, { join } from "path"
import fs, { unwatchFile, watchFile } from "fs"
import chalk from "chalk"
import ws from "ws"
import { jidNormalizedUser, areJidsSameUser } from '@whiskeysockets/baileys'
import fetch from "node-fetch" // Añadido para obtener la miniatura del canal

const isNumber = x => typeof x === "number" && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

// =================== FUNCIÓN PARA OBTENER EL CONTEXTINFO DEL CANAL (igual que en play.js) ===================
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
    } catch {
        return {}
    }
}

// =================== FUNCIÓN PARA ENVIAR MENSAJES CON ESTILO (como en play) ===================
async function replyStyled(conn, m, text, options = {}) {
    const rcanal = await getRcanal()
    await conn.sendMessage(m.chat, {
        text: text,
        contextInfo: rcanal,
        ...options
    }, { quoted: m })
}

export async function handler(chatUpdate) {
    this.msgqueue = this.msgqueue || []
    this.uptime = this.uptime || Date.now()

    if (!chatUpdate) return
    await this.pushMessage(chatUpdate.messages).catch(console.error)

    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return

    if (!global.db.data) await global.loadDatabase()

    try {
        m = smsg(this, m) || m
        if (!m) return
        m.exp = 0

        // ============= CARGAR CONFIGURACIÓN DEL SUBBOT =============
        const isSubBot = this.user.jid !== global.conn.user.jid
        let subBotConfig = {}
        
        if (isSubBot) {
            // Cargar configuración desde archivo si no está en memoria
            if (!this.subConfig) {
                const sessionId = this.user.jid.split('@')[0]
                const configPath = path.join(global.jadi, sessionId, 'config.json')
                
                if (fs.existsSync(configPath)) {
                    subBotConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
                    this.subConfig = subBotConfig
                }
            } else {
                subBotConfig = this.subConfig
            }
        }

        // ============= DEFINICIÓN DE USUARIO CON SISTEMA DE REGISTRO =============
        const user = global.db.data.users[m.sender] = global.db.data.users[m.sender] || {
            name: "",
            age: 0,
            exp: 0, 
            coin: 0, 
            bank: 0, 
            level: 0, 
            health: 100,
            genre: "", 
            birth: "", 
            marry: "", 
            description: "",
            packstickers: null, 
            premium: false, 
            premiumTime: 0,
            banned: false, 
            bannedReason: "", 
            commands: 0,
            afk: -1, 
            afkReason: "", 
            warn: 0,
            registered: false,
            regTime: 0,
            serial: ""
        }

        const chat = global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {
            isBanned: false, 
            isMute: false, 
            welcome: false,
            sWelcome: "", 
            sBye: "", 
            detect: true, 
            primaryBot: null,
            modoadmin: false, 
            antiLink: true, 
            nsfw: false,
            economy: true, 
            gacha: true
        }

        const settings = global.db.data.settings[this.user.jid] = global.db.data.settings[this.user.jid] || {
            self: false, 
            restrict: true, 
            jadibotmd: true,
            antiPrivate: false, 
            gponly: false
        }

        // Aplicar configuración del SubBot
        if (isSubBot && subBotConfig) {
            if (subBotConfig.mode === 'private') {
                settings.self = true
            }
            if (subBotConfig.antiPrivate !== undefined) {
                settings.antiPrivate = subBotConfig.antiPrivate
            }
            if (subBotConfig.gponly !== undefined) {
                settings.gponly = subBotConfig.gponly
            }
        }

        if (typeof m.text !== "string") m.text = ""

        try {
            const newName = m.pushName || await this.getName(m.sender)
            if (typeof newName === "string" && newName.trim() && newName !== user.name) {
                user.name = newName
            }
        } catch {}

        const isROwner = [...global.owner].map(v => v.replace(/\D/g, "") + "@s.whatsapp.net").includes(m.sender)
        const isOwner = isROwner || m.fromMe
        const isPrems = isROwner || global.prems.map(v => v.replace(/\D/g, "") + "@s.whatsapp.net").includes(m.sender) || user.premium
        const isOwners = [this.user.jid, ...global.owner.map(v => v + "@s.whatsapp.net")].includes(m.sender)

        // Verificar si Fernando tiene acceso
        const isFernando = global.fernando
            .map(v => v.replace(/\D/g, "") + "@s.whatsapp.net")
            .includes(m.sender)

        if (settings.self && !isOwners) return
        
        if (settings.gponly && !isOwners && !m.chat.endsWith('g.us')) {
            const allowedCommands = [
                'qr', 'code', 'menu', 'help', 'infobot', 'ping',
                'estado', 'status', 'report', 'reportar', 'suggest',
                'subcmd', 'config', 'cmdinfo', 'botlist', 'menú',
                'reg', 'register', 'verificar', 'verify'
            ]

            const userCommand = m.text.split(' ')[0].toLowerCase()
            const isAllowed = allowedCommands.some(cmd => 
                userCommand.includes(cmd.toLowerCase())
            )

            if (!isAllowed) {
                const msg = 
                    `> . ﹡ ﹟ 🔒 ׄ ⬭ *Modo Solo Grupos*\n\n` +
                    `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🚫* ㅤ֢ㅤ⸱ㅤᯭִ*\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ *Motivo* :: Este bot solo funciona en grupos.\n\n` +
                    `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📌* ㅤ֢ㅤ⸱ㅤᯭִ* — *Comandos permitidos en privado*\n` +
                    allowedCommands.map(cmd => `ׅㅤ𓏸𓈒ㅤׄ *${cmd}*`).join('\n')
                return await replyStyled(this, m, msg)
            }
        }

        if (global.opts?.queque && m.text && !isPrems) {
            const queue = this.msgqueue
            queue.push(m.id || m.key.id)
            setTimeout(() => {
                const index = queue.indexOf(m.id || m.key.id)
                if (index > -1) queue.splice(index, 1)
            }, 5000)
        }

        if (m.isBaileys) return
        m.exp += Math.ceil(Math.random() * 10)

        let groupMetadata = {}
        let participants = []

        if (m.isGroup) {
            groupMetadata = global.cachedGroupMetadata ? 
                await global.cachedGroupMetadata(m.chat).catch(() => null) : 
                await this.groupMetadata(m.chat).catch(() => null) || {}
            participants = Array.isArray(groupMetadata?.participants) ? groupMetadata.participants : []
        }

        const decodeJid = (j) => this.decodeJid(j)
        const normJid = (j) => jidNormalizedUser(decodeJid(j))

        const userGroup = m.isGroup ? participants.find(p => areJidsSameUser(normJid(p.jid || p.id), normJid(m.sender))) || {} : {}
        const botGroup = m.isGroup ? participants.find(p => areJidsSameUser(normJid(p.jid || p.id), normJid(this.user.jid))) || {} : {}

        const isRAdmin = userGroup?.admin === 'superadmin'
        const isAdmin = isRAdmin || userGroup?.admin === 'admin' || userGroup?.admin === true
        const isBotAdmin = botGroup?.admin === 'admin' || botGroup?.admin === 'superadmin' || botGroup?.admin === true

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "./plugins")

        for (const name in global.plugins) {
            const plugin = global.plugins[name]
            if (!plugin || plugin.disabled) continue

            const __filename = join(___dirname, name)

            if (typeof plugin.all === "function") {
                try {
                    await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename, user, chat, settings })
                } catch (err) {
                    console.error(err)
                }
            }

            if (!global.opts?.restrict && plugin.tags?.includes("admin")) continue

            // ============= MANEJO DE PREFIJOS MEJORADO =============
            const pluginPrefix = plugin.customPrefix || 
                               (isSubBot && subBotConfig?.prefix) || 
                               global.prefix
            
            // Verificar si se permite sin prefijo
            const allowNoPrefix = isSubBot ? 
                (subBotConfig?.sinprefix || false) : 
                global.sinprefix

            let match = null
            let usedPrefix = ""

            // Caso 1: Comando con prefijo
            if (pluginPrefix instanceof RegExp) {
                match = [pluginPrefix.exec(m.text), pluginPrefix]
                usedPrefix = match ? (match[0] || "")[0] || "" : ""
            } else if (Array.isArray(pluginPrefix)) {
                match = pluginPrefix.map(prefix => {
                    const regex = prefix instanceof RegExp ? prefix : new RegExp(prefix.toString().replace(/[|\\{}()[\]^$+*?.]/g, "\\$&"))
                    return [regex.exec(m.text), regex]
                }).find(p => p[0])
                usedPrefix = match ? (match[0] || "")[0] || "" : ""
            } else if (typeof pluginPrefix === "string") {
                const regex = new RegExp(pluginPrefix.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&"))
                match = [regex.exec(m.text), regex]
                usedPrefix = match ? (match[0] || "")[0] || "" : ""
            }

            // Caso 2: Comando sin prefijo (solo si está permitido)
            if (!match && allowNoPrefix && m.text) {
                // Verificar si la primera palabra coincide con algún comando del plugin
                const firstWord = m.text.trim().split(' ')[0].toLowerCase()
                let isAcceptWithoutPrefix = false
                
                if (plugin.command instanceof RegExp) {
                    isAcceptWithoutPrefix = plugin.command.test(firstWord)
                } else if (Array.isArray(plugin.command)) {
                    isAcceptWithoutPrefix = plugin.command.some(cmd => {
                        if (cmd instanceof RegExp) return cmd.test(firstWord)
                        return cmd.toLowerCase() === firstWord
                    })
                } else if (typeof plugin.command === "string") {
                    isAcceptWithoutPrefix = plugin.command.toLowerCase() === firstWord
                }
                
                if (isAcceptWithoutPrefix) {
                    // Crear un match artificial para comandos sin prefijo
                    match = [[firstWord], new RegExp(`^${firstWord}`)]
                    usedPrefix = ""
                }
            }

            if (!match) continue

            const noPrefix = m.text.replace(usedPrefix, "")
            let [command, ...args] = noPrefix.trim().split(" ").filter(v => v)
            command = (command || "").toLowerCase()

            let isAccept = false
            if (plugin.command instanceof RegExp) {
                isAccept = plugin.command.test(command)
            } else if (Array.isArray(plugin.command)) {
                isAccept = plugin.command.some(cmd => 
                    cmd instanceof RegExp ? cmd.test(command) : cmd === command)
            } else if (typeof plugin.command === "string") {
                isAccept = plugin.command === command
            }

            if (!isAccept) continue

            m.plugin = name
            global.comando = command
            user.commands = (user.commands || 0) + 1

            if (chat.isBanned && !isROwner) {
                const aviso = 
                    `> . ﹡ ﹟ ⚠️ ׄ ⬭ *Bot Desactivado*\n\n` +
                    `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🔒* ㅤ֢ㅤ⸱ㅤᯭִ*\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ *Motivo* :: El bot *${global.botname}* está desactivado en este grupo.\n\n` +
                    `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜👑* ㅤ֢ㅤ⸱ㅤᯭִ* — *Solución*\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ » *${usedPrefix}bot on* (solo administradores)`
                await replyStyled(this, m, aviso)
                return
            }

            if (user.banned && !isROwner) {
                const mensaje = 
                    `> . ﹡ ﹟ 🚫 ׄ ⬭ *Acceso Denegado*\n\n` +
                    `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🔨* ㅤ֢ㅤ⸱ㅤᯭִ*\n` +
                    `ׅㅤ𓏸𓈒ㅤׄ *Razón* :: ${user.bannedReason}`
                await replyStyled(this, m, mensaje)
                return
            }

            // ============= VERIFICACIÓN DE REGISTRO =============
            // Si el comando requiere registro
            if (plugin.reg && !isROwner) {
                const user = global.db.data.users[m.sender]
                
                // Verificar si está registrado
                if (!user.registered) {
                    return global.dfail("reg", m, this)
                }
                
                // Verificar si tiene datos incompletos (nombre o edad faltantes)
                if (!user.name || !user.age) {
                    return global.dfail("regincompleto", m, this)
                }
            }

            // ============= VERIFICAR PERMISOS ESPECIALES PARA FERNANDO =============
            let hasPermission = true
            
            if (plugin.rowner && plugin.owner) {
                hasPermission = isROwner || isOwner
                if (!hasPermission) return global.dfail("owner", m, this)
            }
            if (plugin.rowner && !isROwner) {
                hasPermission = false
                if (!hasPermission) return global.dfail("rowner", m, this)
            }
            if (plugin.owner && !isOwner) {
                // Permitir a Fernando ejecutar comandos de owner en SubBots
                if (isSubBot && isFernando) {
                    hasPermission = true
                } else {
                    hasPermission = false
                    if (!hasPermission) return global.dfail("owner", m, this)
                }
            }
            if (plugin.premium && !isPrems) {
                hasPermission = false
                if (!hasPermission) return global.dfail("premium", m, this)
            }
            
            const adminMode = chat.modoadmin
            const requiresAdmin = plugin.botAdmin || plugin.admin || plugin.group

            if (adminMode && !isOwner && m.isGroup && !isAdmin && requiresAdmin) return
            if (plugin.group && !m.isGroup) return global.dfail("group", m, this)
            if (plugin.botAdmin && !isBotAdmin) return global.dfail("botAdmin", m, this)
            if (plugin.admin && !isAdmin) return global.dfail("admin", m, this)
            if (plugin.private && m.isGroup) return global.dfail("private", m, this)

            m.isCommand = true
            m.exp += plugin.exp ? parseInt(plugin.exp) : 10

            try {
                await plugin.call(this, m, {
                    match, 
                    usedPrefix, 
                    noPrefix, 
                    args,
                    command, 
                    text: args.join(" "), 
                    conn: this,
                    participants, 
                    groupMetadata, 
                    userGroup, 
                    botGroup,
                    isROwner, 
                    isOwner: isOwner || (isSubBot && isFernando),
                    isRAdmin, 
                    isAdmin, 
                    isBotAdmin, 
                    isPrems, 
                    chatUpdate, 
                    __dirname: ___dirname,
                    __filename, 
                    user, 
                    chat, 
                    settings,
                    isFernando,
                    subBotConfig
                })
            } catch (err) {
                m.error = err
                console.error(err)
            } finally {
                if (typeof plugin.after === "function") {
                    try {
                        await plugin.after.call(this, m, {
                            match, 
                            usedPrefix, 
                            noPrefix, 
                            args,
                            command, 
                            text: args.join(" "), 
                            conn: this,
                            participants, 
                            groupMetadata, 
                            userGroup, 
                            botGroup,
                            isROwner, 
                            isOwner: isOwner || (isSubBot && isFernando),
                            isRAdmin, 
                            isAdmin, 
                            isBotAdmin, 
                            isPrems,
                            chatUpdate, 
                            __dirname: ___dirname,
                            __filename, 
                            user, 
                            chat, 
                            settings,
                            isFernando, 
                            subBotConfig
                        })
                    } catch (err) {
                        console.error(err)
                    }
                }
            }
        }
    } catch (err) {
        console.error(err)
    } finally {
        if (global.opts?.queque && m?.text) {
            const index = this.msgqueue.indexOf(m.id || m.key.id)
            if (index > -1) this.msgqueue.splice(index, 1)
        }

        if (m?.sender && global.db.data.users[m.sender]) {
            global.db.data.users[m.sender].exp += m.exp || 0
        }

        try {
            if (!global.opts?.noprint) {
                await import("./lib/print.js").then(mod => mod.default(m, this))
            }
        } catch (err) {
            console.warn(err)
        }
    }
}

// ============= MENSAJES DE ERROR (DFAIL) CON ESTILO =============
global.dfail = async (type, m, conn) => {
    const messages = {
        rowner: `> . ﹡ ﹟ 🔒 ׄ ⬭ *Acceso denegado*\n\n*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜👑* ㅤ֢ㅤ⸱ㅤᯭִ*\nׅㅤ𓏸𓈒ㅤׄ *Motivo* :: El comando *${global.comando}* solo puede ser usado por los *creadores del bot*.`,
        owner: `> . ﹡ ﹟ 🔒 ׄ ⬭ *Acceso denegado*\n\n*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🛠️* ㅤ֢ㅤ⸱ㅤᯭִ*\nׅㅤ𓏸𓈒ㅤׄ *Motivo* :: El comando *${global.comando}* solo puede ser usado por los *desarrolladores del bot*.`,
        premium: `> . ﹡ ﹟ ⭐ ׄ ⬭ *Exclusivo Premium*\n\n*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💎* ㅤ֢ㅤ⸱ㅤᯭִ*\nׅㅤ𓏸𓈒ㅤׄ *Motivo* :: El comando *${global.comando}* solo puede ser usado por *usuarios premium*.`,
        group: `> . ﹡ ﹟ 👥 ׄ ⬭ *Solo en grupos*\n\n*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🗂️* ㅤ֢ㅤ⸱ㅤᯭִ*\nׅㅤ𓏸𓈒ㅤׄ *Motivo* :: El comando *${global.comando}* solo puede ejecutarse dentro de un *grupo*.`,
        private: `> . ﹡ ﹟ 📩 ׄ ⬭ *Solo privado*\n\n*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🔐* ㅤ֢ㅤ⸱ㅤᯭִ*\nׅㅤ𓏸𓈒ㅤׄ *Motivo* :: El comando *${global.comando}* solo puede usarse en *chat privado* con el bot.`,
        admin: `> . ﹡ ﹟ ⚠️ ׄ ⬭ *Requiere permisos de admin*\n\n*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜👮* ㅤ֢ㅤ⸱ㅤᯭִ*\nׅㅤ𓏸𓈒ㅤׄ *Motivo* :: El comando *${global.comando}* solo puede ser usado por los *administradores del grupo*.`,
        botAdmin: `> . ﹡ ﹟ 🤖 ׄ ⬭ *Necesito permisos*\n\n*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜⚙️* ㅤ֢ㅤ⸱ㅤᯭִ*\nׅㅤ𓏸𓈒ㅤׄ *Motivo* :: Para ejecutar *${global.comando}*, el bot debe ser *administrador del grupo*.`,
        restrict: `> . ﹡ ﹟ ⛔ ׄ ⬭ *Funcionalidad desactivada*\n\n*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🚧* ㅤ֢ㅤ⸱ㅤᯭִ*\nׅㅤ𓏸𓈒ㅤׄ *Motivo* :: Esta característica está *temporalmente deshabilitada*.`,
        reg: `> . ﹡ ﹟ 📝 ׄ ⬭ *REGISTRO REQUERIDO*\n\n*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🔑* ㅤ֢ㅤ⸱ㅤᯭִ*\nׅㅤ𓏸𓈒ㅤׄ *Motivo* :: Para usar el comando *${global.comando}*, primero debes registrarte.\n\n*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📌* ㅤ֢ㅤ⸱ㅤᯭִ* — *Instrucciones*\nׅㅤ𓏸𓈒ㅤׄ Usa: *${global.prefox || '#'}reg nombre/edad*\nׅㅤ𓏸𓈒ㅤׄ Ejemplo: *${global.prefox || '#'}reg Juan/25*\nׅㅤ𓏸𓈒ㅤׄ O completo: *${global.prefox || '#'}reg nombre/edad/género/cumpleaños*`,
        regincompleto: `> . ﹡ ﹟ ⚠️ ׄ ⬭ *DATOS INCOMPLETOS*\n\n*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📋* ㅤ֢ㅤ⸱ㅤᯭִ*\nׅㅤ𓏸𓈒ㅤׄ *Motivo* :: Tu registro está incompleto. Te falta completar tus datos.\n\n*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🔧* ㅤ֢ㅤ⸱ㅤᯭִ* — *Solución*\nׅㅤ𓏸𓈒ㅤׄ Usa: *${global.prefox || '#'}reg nombre/edad* para completar.\nׅㅤ𓏸𓈒ㅤׄ Ejemplo: *${global.prefox || '#'}reg Juan/25*\n\nׅㅤ𓏸𓈒ㅤׄ ✅ *Nota:* No perderás tu progreso actual (XP, coins, nivel, etc.)`
    }

    if (messages[type]) {
        await replyStyled(conn, m, messages[type])
        await m.react?.('✖️')
    }
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.magenta("Se actualizó 'handler.js'"))
    if (global.reloadHandler) console.log(await global.reloadHandler())
})
