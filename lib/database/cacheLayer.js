export class DatabaseCache {
    constructor() {
        this.userCache = new Map()
        this.chatCache = new Map()
        this.ttl = 5 * 60 * 1000 // 5 minutos
        this.cleanupInterval = setInterval(() => this.cleanup(), this.ttl)
    }
    
    async getUser(senderId, fallbackFn) {
        // Verificar caché primero
        if (this.userCache.has(senderId)) {
            const cached = this.userCache.get(senderId)
            if (Date.now() - cached.timestamp < this.ttl) {
                return cached.data
            }
            this.userCache.delete(senderId)
        }
        
        // Obtener datos
        const userData = await fallbackFn(senderId)
        
        // Almacenar en caché
        this.userCache.set(senderId, {
            data: userData,
            timestamp: Date.now()
        })
        
        return userData
    }
    
    async getChat(chatId, fallbackFn) {
        if (this.chatCache.has(chatId)) {
            const cached = this.chatCache.get(chatId)
            if (Date.now() - cached.timestamp < this.ttl) {
                return cached.data
            }
            this.chatCache.delete(chatId)
        }
        
        const chatData = await fallbackFn(chatId)
        
        this.chatCache.set(chatId, {
            data: chatData,
            timestamp: Date.now()
        })
        
        return chatData
    }
    
    cleanup() {
        const now = Date.now()
        
        // Limpiar usuarios
        for (const [key, value] of this.userCache.entries()) {
            if (now - value.timestamp > this.ttl) {
                this.userCache.delete(key)
            }
        }
        
        // Limpiar chats
        for (const [key, value] of this.chatCache.entries()) {
            if (now - value.timestamp > this.ttl) {
                this.chatCache.delete(key)
            }
        }
    }
    
    invalidateUser(senderId) {
        this.userCache.delete(senderId)
    }
    
    invalidateChat(chatId) {
        this.chatCache.delete(chatId)
    }
    
    clear() {
        this.userCache.clear()
        this.chatCache.clear()
    }
}
