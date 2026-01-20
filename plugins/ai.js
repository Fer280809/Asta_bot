import fetch from "node-fetch"
import https from "https"

const aiHandler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text?.trim()) {
        return conn.reply(m.chat, 
            `🤖 *Chat GPT-5 Nano*\n\n` +
            `Escribe tu pregunta después del comando.\n\n` +
            `📝 *Ejemplo:*\n` +
            `• ${usedPrefix + command} ¿Qué es la inteligencia artificial?\n` +
            `• ${usedPrefix + command} Explica la teoría de la relatividad\n` +
            `• ${usedPrefix + command} Escribe un poema sobre el amor`,
            m
        )
    }

    await m.react('🤔')

    try {
        // Generar un sessionId único
        const sessionId = generateSessionId()
        
        // Datos para la API
        const data = JSON.stringify({
            "model": "openai/gpt-5-nano",
            "question": text,
            "language": "Spanish",
            "sessionId": sessionId,
            "previousQuestion": null,
            "previousAnswer": null
        })

        // Opciones para la petición HTTPS
        const options = {
            hostname: 'api.heckai.weight-wave.com',
            path: '/api/ha/v1/search',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 60000 // 60 segundos de timeout
        }

        // Enviar mensaje de procesamiento
        const processingMsg = await conn.reply(m.chat, 
            `🤖 *Chat GPT-5 Nano*\n\n` +
            `🔍 *Pregunta:* ${text}\n\n` +
            `⏳ *Procesando respuesta...*\n` +
            `_Esto puede tomar unos momentos..._`,
            m
        )

        // Función para hacer la petición y procesar el stream
        const result = await new Promise((resolve, reject) => {
            const resultData = {
                generated: {
                    thought: "",
                    response: ""
                },
                external: {
                    sources: [],
                    related: ""
                }
            }

            let currentSection = null
            let buffer = ""
            let responseStarted = false

            const req = https.request(options, (res) => {
                res.on('data', (chunk) => {
                    if (!responseStarted) {
                        responseStarted = true
                        // Eliminar mensaje de procesamiento
                        if (processingMsg) {
                            conn.deleteMessage(m.chat, processingMsg.key)
                        }
                    }
                    
                    buffer += chunk.toString()
                    const lines = buffer.split('\n')
                    buffer = lines.pop()

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const content = line.substring(6)

                            if (content.trim() === '[REASON_START]') {
                                currentSection = 'thought'
                                continue
                            } else if (content.trim() === '[REASON_DONE]') {
                                continue
                            } else if (content.trim() === '[ANSWER_START]') {
                                currentSection = 'response'
                                continue
                            } else if (content.trim() === '[ANSWER_DONE]') {
                                continue
                            } else if (content.trim() === '[SOURCE_START]') {
                                currentSection = 'sources'
                                continue
                            } else if (content.trim() === '[SOURCE_DONE]') {
                                continue
                            } else if (content.trim() === '[RELATE_Q_START]') {
                                currentSection = 'related'
                                continue
                            } else if (content.trim() === '[RELATE_Q_DONE]') {
                                currentSection = null
                                continue
                            }

                            if (currentSection === 'thought') {
                                resultData.generated.thought += content
                            } else if (currentSection === 'response') {
                                resultData.generated.response += content
                            } else if (currentSection === 'sources') {
                                try {
                                    const sources = JSON.parse(content)
                                    resultData.external.sources = sources
                                } catch (e) {
                                    // Ignorar error de parseo
                                }
                            } else if (currentSection === 'related') {
                                resultData.external.related += content
                            }
                        }
                    }
                })

                res.on('end', () => {
                    if (buffer) {
                        // Procesar buffer restante
                        if (buffer.startsWith('data: ')) {
                            const content = buffer.substring(6)
                            if (currentSection === 'response') {
                                resultData.generated.response += content
                            }
                        }
                    }
                    resolve(resultData)
                })

                res.on('error', (error) => {
                    reject(error)
                })
            })

            req.on('error', (error) => {
                reject(error)
            })

            req.on('timeout', () => {
                req.destroy()
                reject(new Error('Timeout: La petición tardó demasiado'))
            })

            req.write(data)
            req.end()
        })

        // Formatear la respuesta
        let response = `🤖 *Chat GPT-5 Nano*\n\n`
        response += `📝 *Pregunta:* ${text}\n\n`
        
        if (result.generated.thought && result.generated.thought.trim()) {
            response += `💭 *Pensamiento interno:*\n${result.generated.thought.trim()}\n\n`
        }
        
        if (result.generated.response && result.generated.response.trim()) {
            response += `💡 *Respuesta:*\n${result.generated.response.trim()}\n\n`
        } else {
            throw new Error('No se recibió respuesta del modelo')
        }
        
        if (result.external.sources && result.external.sources.length > 0) {
            response += `📚 *Fuentes consultadas:*\n`
            result.external.sources.forEach((source, index) => {
                if (source.title && source.url) {
                    response += `${index + 1}. ${source.title}\n   🔗 ${source.url}\n`
                }
            })
            response += `\n`
        }
        
        if (result.external.related && result.external.related.trim()) {
            response += `🤔 *Preguntas relacionadas:*\n${result.external.related.trim()}\n\n`
        }
        
        response += `_🆔 Sesión: ${sessionId.substring(0, 8)}..._`

        // Verificar longitud y dividir si es necesario
        const maxLength = 4000
        if (response.length > maxLength) {
            const parts = splitMessage(response, maxLength)
            for (let i = 0; i < parts.length; i++) {
                await conn.reply(m.chat, parts[i], i === 0 ? m : null)
                if (i < parts.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500))
                }
            }
        } else {
            await conn.reply(m.chat, response, m)
        }

        await m.react('✅')

    } catch (error) {
        await m.react('❌')
        console.error('Error en GPT:', error)
        
        const errorMessage = `❌ *Error en GPT-5 Nano*\n\n` +
            `No se pudo obtener una respuesta.\n\n` +
            `⚠️ *Posibles causas:*\n` +
            `• La API está temporalmente fuera de servicio\n` +
            `• Tu pregunta es demasiado compleja\n` +
            `• Se excedió el tiempo de espera\n\n` +
            `💡 *Intenta de nuevo con una pregunta más simple o más tarde.*`
        
        await conn.reply(m.chat, errorMessage, m)
    }
}

// Función para generar un sessionId único
function generateSessionId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

// Función para dividir mensajes largos
function splitMessage(text, maxLength) {
    const parts = []
    let currentPart = ''
    const sentences = text.split(/(?<=[.!?])\s+/)
    
    for (const sentence of sentences) {
        if ((currentPart + sentence).length > maxLength) {
            if (currentPart.trim()) {
                parts.push(currentPart.trim())
            }
            currentPart = sentence
        } else {
            currentPart += (currentPart ? ' ' : '') + sentence
        }
    }
    
    if (currentPart.trim()) {
        parts.push(currentPart.trim())
    }
    
    return parts
}

// También puedes crear comandos alternativos
const gptHandler = async (m, { conn, text, usedPrefix }) => {
    return aiHandler(m, { conn, text, usedPrefix, command: 'gpt' })
}

const iaHandler = async (m, { conn, text, usedPrefix }) => {
    return aiHandler(m, { conn, text, usedPrefix, command: 'ia' })
}

const aiHandlerHelp = ['gpt', 'ia', 'chatgpt']
const aiHandlerTags = ['ai', 'utilidades']
const aiHandlerCommand = ['gpt', 'ia', 'chatgpt']

// Configurar los handlers
aiHandler.help = aiHandlerHelp
aiHandler.tags = aiHandlerTags
aiHandler.command = aiHandlerCommand
aiHandler.register = false
aiHandler.group = false

gptHandler.help = ['gpt <texto>']
gptHandler.tags = ['ai']
gptHandler.command = ['gpt']
gptHandler.register = false
gptHandler.group = false

iaHandler.help = ['ia <texto>']
iaHandler.tags = ['ai']
iaHandler.command = ['ia']
iaHandler.register = false
iaHandler.group = false

// Exportar los handlers
export { aiHandler as default, gptHandler, iaHandler }

// O si prefieres exportar solo uno:
// export default aiHandler