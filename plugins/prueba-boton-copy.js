import { promises as fs } from 'fs'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    
    // ============ SI ES EL COMANDO PRINCIPAL (copiar) ============
    if (command === 'copiar' || command === 'copy') {
        // Verificar si está respondiendo a un mensaje
        if (!m.quoted) {
            return m.reply('⚠️ *Responde a un mensaje* que quieras copiar.\n\n📝 Uso: Responde al mensaje y usa:\n> `' + usedPrefix + 'copiar`')
        }

        const textToCopy = m.quoted.text || m.quoted.caption || ''
        
        if (!textToCopy) {
            return m.reply('❌ *El mensaje no contiene texto* para copiar.')
        }

        // Enviar el texto con botón para copiarlo
        await conn.sendMessage(m.chat, {
            text: `📋 *TEXTO CAPTURADO*\n\n${textToCopy}`,
            footer: "Presiona el botón para copiar • Asta-Bot",
            buttons: [
                { 
                    buttonId: `${usedPrefix}copytext ${Buffer.from(textToCopy).toString('base64')}`, 
                    buttonText: { displayText: '📋 Copiar Texto' }, 
                    type: 1 
                }
            ],
            headerType: 1
        }, { quoted: m })

        await m.react('📋')
        return
    }

    // ============ COMANDO INTERNO PARA COPIAR (copytext) ============
    if (command === 'copytext') {
        try {
            // Decodificar el texto en base64
            const encodedText = text.trim()
            if (!encodedText) {
                return m.reply('❌ No hay texto para copiar.')
            }

            const decodedText = Buffer.from(encodedText, 'base64').toString('utf-8')
            
            // Enviar el texto nuevamente para que se pueda copiar fácilmente
            await m.reply(`📋 *TEXTO COPIADO*\n\n\`\`\`${decodedText}\`\`\`\n\n✅ *Mantén presionado* el mensaje para copiarlo.`)
            await m.react('✅')
            
        } catch (e) {
            console.error('Error en copytext:', e)
            await m.reply('❌ Error al procesar el texto.')
        }
        return
    }
}

handler.help = ['copiar', 'copy']
handler.tags = ['herramientas']
handler.command = ['copiar', 'copy', 'copytext']

export default handler