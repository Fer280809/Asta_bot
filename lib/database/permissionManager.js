import { jidNormalizedUser, areJidsSameUser } from '@whiskeysockets/baileys'

export class PermissionManager {
    static async checkAll(m, conn, context = {}) {
        const { userData, chatData, settings } = context
        
        // ID normalizados
        const decode = (j) => conn.decodeJid?.(j) || j
        const norm = (j) => jidNormalizedUser(decode(j))
        
        // IDs del bot
        const meIdRaw = conn.user?.id || conn.user?.jid
        const botNum = String(decode(meIdRaw)).split('@')[0].replace(/[^0-9]/g, '')
        
        // Permisos básicos
        const isROwner = [...global.owner.map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")].includes(m.sender)
        const isOwner = isROwner || m.fromMe
        const isPrems = isROwner || 
                       global.prems.map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender) || 
                       (userData?.premium === true)
        const isOwners = [conn.user.jid, ...global.owner.map(v => v + "@s.whatsapp.net")].includes(m.sender)
        
        // Permisos de grupo
        let isAdmin = false
        let isRAdmin = false
        let isBotAdmin = false
        let userGroup = {}
        let botGroup = {}
        
        if (m.isGroup) {
            const groupMetadata = await this.getGroupMetadata(m.chat, conn)
            const participants = Array.isArray(groupMetadata?.participants) ? groupMetadata.participants : []
            
            // Encontrar usuario y bot en participantes
            userGroup = participants.find(p => 
                areJidsSameUser(norm(p.jid || p.id), norm(m.sender))
            ) || {}
            
            botGroup = participants.find(p => 
                areJidsSameUser(norm(p.jid || p.id), norm(meIdRaw))
            ) || {}
            
            isRAdmin = userGroup?.admin === 'superadmin'
            isAdmin = isRAdmin || userGroup?.admin === 'admin' || userGroup?.admin === true
            isBotAdmin = botGroup?.admin === 'admin' || botGroup?.admin === 'superadmin' || botGroup?.admin === true
        }
        
        return {
            isROwner,
            isOwner,
            isRAdmin,
            isAdmin,
            isBotAdmin,
            isPrems,
            isOwners,
            userGroup,
            botGroup,
            chat: chatData,
            user: userData,
            settings
        }
    }
    
    static async getGroupMetadata(chatId, conn) {
        try {
            if (global.cachedGroupMetadata) {
                return await global.cachedGroupMetadata(chatId).catch(() => ({}))
            }
            return await conn.groupMetadata(chatId).catch(() => ({}))
        } catch {
            return {}
        }
    }
    
    static async isExemptFromFlood(senderId) {
        // Los owners no tienen límite de flood
        const normalized = senderId.replace(/[^0-9]/g, "")
        const owners = global.owner.map(v => v.replace(/[^0-9]/g, ""))
        return owners.includes(normalized)
    }
    
    static canUseInPrivate(chatType, commandType) {
        if (chatType !== 'private' && commandType === 'private') {
            return false
        }
        if (chatType === 'private' && commandType === 'group') {
            return false
        }
        return true
    }
}
