export class ChatManager {
    static ensureChatSchema(chat = {}, chatId) {
        const defaults = {
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
        
        return { ...defaults, ...chat }
    }
    
    static ensureSettingsSchema(settings = {}) {
        const defaults = {
            self: false,
            restrict: true,
            jadibotmd: true,
            antiPrivate: false,
            gponly: false
        }
        
        return { ...defaults, ...settings }
    }
    
    static getPrimaryBot(chatId) {
        const chat = global.db.data.chats[chatId]
        return chat?.primaryBot || null
    }
    
    static setPrimaryBot(chatId, botJid) {
        if (!global.db.data.chats[chatId]) {
            global.db.data.chats[chatId] = this.ensureChatSchema({}, chatId)
        }
        global.db.data.chats[chatId].primaryBot = botJid
    }
}
