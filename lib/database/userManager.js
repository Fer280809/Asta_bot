export class UserManager {
    static ensureUserSchema(user = {}, senderId, userName = '') {
        const defaults = {
            name: userName,
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
        
        const merged = { ...defaults, ...user }
        
        // Validaciones específicas
        if (!Number.isInteger(merged.exp)) merged.exp = 0
        if (!Number.isInteger(merged.coin)) merged.coin = 0
        if (!Number.isInteger(merged.level)) merged.level = 0
        
        return merged
    }
    
    static async updateUserName(senderId, newName) {
        if (!senderId || !newName || typeof newName !== 'string') return
        
        const user = global.db.data.users[senderId]
        if (user && user.name !== newName.trim()) {
            user.name = newName.trim()
            return true
        }
        return false
    }
    
    static isBanned(user) {
        return user?.banned === true
    }
    
    static isPremium(user) {
        if (user?.premium === true) return true
        if (user?.premiumTime && user.premiumTime > Date.now()) return true
        return false
    }
}
