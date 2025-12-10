import axios from 'axios'
const {proto, generateWAMessageFromContent, prepareWAMessageMedia, generateWAMessageContent, getDevice} = (await import("@whiskeysockets/baileys")).default

let handler = async (message, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(message.chat, `⚠️ *Por favor, ingrese lo que desea buscar en TikTok.*`, message)
    
    async function createVideoMessage(url) {
        try {
            const { videoMessage } = await generateWAMessageContent({ 
                video: { url } 
            }, { 
                upload: conn.waUploadToServer 
            })
            return videoMessage
        } catch (error) {
            console.error('Error creando video:', error)
            return null
        }
    }
    
    async function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]
        }
    }
    
    try {
        await message.react('⏳')
        await conn.reply(message.chat, `🔍 *Buscando videos en TikTok...*\n⏱️ _Espere un momento..._`, message)
        
        let results = []
        let { data: response } = await axios.get('https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=' + encodeURIComponent(text))
        
        if (!response || !response.data || response.data.length === 0) {
            await message.react('❌')
            return conn.reply(message.chat, `❌ *No se encontraron resultados para:* _${text}_\n\n💡 Intenta con otra búsqueda.`, message)
        }
        
        let searchResults = response.data
        await shuffleArray(searchResults)
        let selectedResults = searchResults.splice(0, 7)
        
        for (let result of selectedResults) {
            try {
                let videoMsg = await createVideoMessage(result.nowm)
                
                if (!videoMsg) continue
                
                results.push({
                    body: proto.Message.InteractiveMessage.Body.fromObject({ 
                        text: result.title || '📱 Video de TikTok'
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.fromObject({ 
                        text: 'Asta Bot' 
                    }),
                    header: proto.Message.InteractiveMessage.Header.fromObject({
                        title: '',
                        hasMediaAttachment: true,
                        videoMessage: videoMsg
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ 
                        buttons: [] 
                    })
                })
            } catch (err) {
                console.error('Error procesando video:', err)
                continue
            }
        }
        
        if (results.length === 0) {
            await message.react('❌')
            return conn.reply(message.chat, `❌ *Error al procesar los videos*\n\n💡 Intenta nuevamente en unos momentos.`, message)
        }
        
        const responseMessage = generateWAMessageFromContent(message.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        body: proto.Message.InteractiveMessage.Body.create({ 
                            text: `🎯 Resultados: ${text}\n📊 ${results.length} videos` 
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ 
                            text: '⚡ Asta Bot ⚡' 
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({ 
                            title: '🎥 TikTok Search',
                            hasMediaAttachment: false 
                        }),
                        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ 
                            cards: [...results] 
                        })
                    })
                }
            }
        }, { quoted: message })
        
        await message.react('✅')
        await conn.relayMessage(message.chat, responseMessage.message, { messageId: responseMessage.key.id })
        
    } catch (error) {
        await message.react('❌')
        console.error('Error en TikTok Search:', error)
        await conn.reply(message.chat, `❌ *Error al buscar videos*\n\n📝 ${error.message || 'Error desconocido'}\n\n💡 Intenta con otra búsqueda.`, message)
    }
}

handler.help = ['tiktoksearch <txt>']
handler.tags = ['buscador']
handler.command = ['tiktoksearch', 'ttss', 'tiktoks']
handler.group = false
handler.register = true
handler.coin = 2

export default handler