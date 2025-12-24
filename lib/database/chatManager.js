// ╔═══════════════════════════════════════════════════════════╗
// ║               ORION'S WOLF - ASTA BOT                     ║
// ║  Creador: Orion's Wolf     │    Estilo: Cósmico/Lobuno    ║
// ║  Archivo: chatManager.js   │    Versión: 1.0.0            ║
// ╟───────────────────────────────────────────────────────────╢
// ║  "Los chats son galaxias donde mis aullados resuenan,     ║
// ║   moderando constelaciones de conversaciones."            ║
// ╚═══════════════════════════════════════════════════════════╝

// ╔═══════════════════════════════════════════════════════════╗
// ║                       DESCRIPCIÓN:                        ║
// ║  Administrador de chats y configuraciones - Controla      ║
// ║  todas las interacciones grupales y ajustes del bot.      ║
// ║                                                           ║
// ║  RESPONSABILIDADES:                                       ║
// ║  • Gestionar configuración de chats                       ║
// ║  • Mantener settings globales del bot                     ║
// ║  • Manejar bots principales por chat                      ║
// ║  • Validar esquemas de datos                              ║
// ╚═══════════════════════════════════════════════════════════╝
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
}
