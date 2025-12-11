import { smsg } from "./lib/simple.js"
import { format } from "util"
import { fileURLToPath } from "url"
import path, { join } from "path"
import fs, { unwatchFile, watchFile } from "fs"
import chalk from "chalk"

const { proto } = (await import("@whiskeysockets/baileys")).default
const isNumber = x => typeof x === "number" && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

export async function handler(chatUpdate) {
    if (!chatUpdate?.messages?.length) return

    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m || !m.message) return
    if (m.key?.remoteJid === 'status@broadcast') return

    if (!global.db.data) await global.loadDatabase()

    try {
        m = smsg(this, m) || m
        if (!m) return
        if (m.isBaileys) return
        if (m.id?.startsWith("BAE5") || m.id?.startsWith("B24E")) return

        m.exp = 0

        /* ===============================
           CREAR USUARIO SI NO EXISTE
        =============================== */
        let user = global.db.data.users[m.sender]
        if (!user) {
            global.db.data.users[m.sender] = {
                name: m.name,
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
                warn: 0
            }
            user = global.db.data.users[m.sender]
        }

        if (m.pushName && user.name !== m.pushName) user.name = m.pushName

        /* ===============================
           CREAR CHAT SI NO EXISTE
        =============================== */
        let chat = global.db.data.chats[m.chat]
        if (!chat) {
            global.db.data.chats[m.chat] = {
                isBanned: false,
                isMute: false,
                mutes: {},
                welcome: true,
                sWelcome: "",
                sBye: "",
                detect: true,
                modoadmin: false,
                antiLink: true,
                nsfw: false,
                economy: true,
                gacha: true
            }
            chat = global.db.data.chats[m.chat]
        }

        /* ===============================
           SETTINGS DEL BOT
        =============================== */
        let settings = global.db.data.settings[this.user.jid]
        if (!settings) {
            global.db.data.settings[this.user.jid] = {
                self: false,
                jadibotmd: true,
                restrict: true,
                antiPrivate: false,
                gponly: false
            }
            settings = global.db.data.settings[this.user.jid]
        }

        if (typeof m.text !== "string") m.text = ""

        /* ===============================
           DETECCIÓN OWNER / FERNANDO
        =============================== */
        const senderNumber = m.sender.split('@')[0]

        let isROwner = false
        let isFernando = false

        if (global.owner && Array.isArray(global.owner)) {
            let owners = global.owner.map(v => v.toString().replace(/[^0-9]/g, ''))
            if (owners.includes(senderNumber)) isROwner = true
        }

        if (global.fernando && Array.isArray(global.fernando)) {
            let fers = global.fernando.map(v => v.toString().replace(/[^0-9]/g, ''))
            if (fers.includes(senderNumber)) isFernando = true
        }

        const isOwner = isROwner || m.fromMe
        const isPrems = isROwner || isFernando || user.premium

        /* ======================================================
           **DETECCIÓN DE ADMIN Y BOT ADMIN (CORREGIDO + PRO)
        ====================================================== */
        let isAdmin = false
        let isBotAdmin = false

        if (m.isGroup) {
            try {
                const metadata = await this.groupMetadata(m.chat)
                const participants = metadata.participants || []

                const userP = participants.find(p => p.id === m.sender)
                const botP = participants.find(p => p.id === this.user.jid)

                if (userP?.admin === "admin" || userP?.admin === "superadmin") {
                    isAdmin = true
                }

                if (botP?.admin === "admin" || botP?.admin === "superadmin") {
                    isBotAdmin = true
                }

            } catch (e) {
                console.error("Error al obtener admins:", e)
            }
        }

        /* ===============================
           ANTI MUTE / CONTROL
        =============================== */
        if (settings.self && !isOwner) return

        if (chat.modoadmin && m.isGroup && !isAdmin && !isOwner) {
            m.reply(`⚠️ Este grupo está en *modo solo admins*`)
            return
        }

        m.exp += Math.ceil(Math.random() * 10)

        /* ===============================
           PROCESAR PLUGINS
        =============================== */

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "./plugins")

        for (const name in global.plugins) {
            const plugin = global.plugins[name]
            if (!plugin || plugin.disabled) continue

            const __filename = join(___dirname, name)

            if (typeof plugin.all === "function") {
                try {
                    await plugin.all.call(this, m, {
                        chatUpdate, __dirname: ___dirname, __filename,
                        user, chat, settings,
                        isROwner, isOwner, isAdmin, isBotAdmin, isPrems, isFernando
                    })
                } catch { }
            }

            if (typeof plugin !== "function") continue

            const pluginPrefix = plugin.customPrefix || this.prefix || global.prefix
            let usedPrefix = null
            let command = null

            if (pluginPrefix instanceof RegExp) {
                let match = pluginPrefix.exec(m.text)
                if (match) {
                    usedPrefix = match[0]
                    command = m.text.slice(match[0].length).trim().split(" ")[0].toLowerCase()
                }
            } else if (typeof pluginPrefix === "string") {
                if (m.text.startsWith(pluginPrefix)) {
                    usedPrefix = pluginPrefix
                    command = m.text.slice(pluginPrefix.length).trim().split(" ")[0].toLowerCase()
                }
            }

            if (!usedPrefix || !command) continue

            const isAccept = plugin.command instanceof RegExp
                ? plugin.command.test(command)
                : Array.isArray(plugin.command)
                    ? plugin.command.includes(command)
                    : plugin.command === command

            if (!isAccept) continue

            global.comando = command
            m.plugin = name
            user.commands++

            const fail = plugin.fail || global.dfail

            if (plugin.rowner && !isROwner) { fail("rowner", m, this); continue }
            if (plugin.owner && !isOwner) { fail("owner", m, this); continue }
            if (plugin.fernando && !isFernando) { fail("fernando", m, this); continue }
            if (plugin.premium && !isPrems) { fail("premium", m, this); continue }
            if (plugin.group && !m.isGroup) { fail("group", m, this); continue }
            if (plugin.private && m.isGroup) { fail("private", m, this); continue }
            if (plugin.admin && !isAdmin) { fail("admin", m, this); continue }
            if (plugin.botAdmin && !isBotAdmin) { fail("botAdmin", m, this); continue }

            // Ejecutar plugin:
            m.isCommand = true

            const noPrefix = m.text.slice(usedPrefix.length).trim()
            const args = noPrefix.split(" ").slice(1)
            const text = args.join(" ")

            try {
                await plugin.call(this, m, {
                    usedPrefix, noPrefix, args, command, text,
                    conn: this,
                    isROwner, isOwner, isAdmin, isBotAdmin, isPrems, isFernando,
                    user, chat, settings,
                    __dirname: ___dirname, __filename
                })
            } catch (e) {
                m.error = e
                console.log(`Error en plugin ${name}:`, e)
            }
        }

    } catch (e) {
        console.log("Error general handler:", e)
    }
}

/* ===========================
   MENSAJES DE FALLO
=========================== */

global.dfail = (type, m, conn) => {
    const msg = {
        rowner: `Solo los *creadores del bot* pueden usar *${global.comando}*`,
        owner: `Este comando es solo para *owners del bot*`,
        fernando: `Comando exclusivo de *Fernando*`,
        premium: `Solo usuarios *premium* pueden usar esto`,
        group: `Este comando solo funciona en *grupos*`,
        private: `Este comando solo se puede usar en *privado*`,
        admin: `Necesitas ser *admin del grupo*`,
        botAdmin: `Necesito ser *admin* para ejecutar este comando`,
    }[type]

    if (msg) conn.reply(m.chat, msg, m)
}