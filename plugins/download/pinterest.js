import axios from 'axios'
import baileys from '@whiskeysockets/baileys'
import cheerio from 'cheerio'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
    if (!text) return m.reply(`❀ Por favor, ingresa lo que deseas buscar o un enlace de Pinterest.\nEjemplo: *${usedPrefix}${command} paisajes*`)
    
    try {
        await m.react('🕒')
        
        // Si es un enlace directo
        if (text.includes("pin.it/") || text.includes("pinterest.com/pin/") || text.includes("pinterest.com/")) {
            let result = await pinterestDl(text)
            
            if (result.media && result.media.length > 0) {
                for (let media of result.media) {
                    if (media.type === 'video') {
                        await conn.sendMessage(m.chat, { 
                            video: { url: media.url }, 
                            caption: `📌 *${result.title || 'Pinterest'}*\n🔗 ${text}` 
                        }, { quoted: m })
                    } else if (media.type === 'image') {
                        await conn.sendMessage(m.chat, { 
                            image: { url: media.url }, 
                            caption: `📌 *${result.title || 'Pinterest'}*\n🔗 ${text}` 
                        }, { quoted: m })
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000)) // Delay para evitar spam
                }
            } else {
                return m.reply('❌ No se pudo descargar el contenido del enlace.')
            }
            
        } else {
            // Búsqueda
            const results = await pinterestSearch(text)
            
            if (!results || results.length === 0) {
                return m.reply(`❌ No se encontraron resultados para "${text}".`)
            }
            
            // Enviar primeros 5 resultados
            const medias = results.slice(0, 5).map(item => ({
                type: item.isVideo ? 'video' : 'image',
                url: item.url,
                thumbnail: item.thumbnail
            }))
            
            for (let item of medias) {
                try {
                    if (item.type === 'video') {
                        await conn.sendMessage(m.chat, {
                            video: { url: item.url },
                            caption: `📌 *Pinterest Search*\n🔍 "${text}"`
                        }, { quoted: m })
                    } else {
                        await conn.sendMessage(m.chat, {
                            image: { url: item.url },
                            caption: `📌 *Pinterest Search*\n🔍 "${text}"`
                        }, { quoted: m })
                    }
                    await new Promise(resolve => setTimeout(resolve, 1500))
                } catch (err) {
                    console.error('Error enviando media:', err)
                }
            }
        }
        
        await m.react('✅')
        
    } catch (error) {
        await m.react('❌')
        console.error(error)
        m.reply(`⚠️ Error al procesar la solicitud.\nDetalle: ${error.message}`)
    }
}

// Función para descargar contenido de Pinterest
async function pinterestDl(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        })
        
        const $ = cheerio.load(data)
        const media = []
        
        // Buscar videos
        $('video').each((i, elem) => {
            const videoUrl = $(elem).attr('src') || $(elem).find('source').attr('src')
            if (videoUrl && !videoUrl.includes('base64')) {
                media.push({
                    type: 'video',
                    url: videoUrl.startsWith('http') ? videoUrl : `https:${videoUrl}`
                })
            }
        })
        
        // Buscar imágenes de alta calidad
        $('img').each((i, elem) => {
            const imgUrl = $(elem).attr('src')
            if (imgUrl && (imgUrl.includes('originals') || imgUrl.includes('736x') || imgUrl.includes('564x'))) {
                media.push({
                    type: 'image',
                    url: imgUrl.startsWith('http') ? imgUrl : `https:${imgUrl}`
                })
            }
        })
        
        // Buscar en meta tags
        $('meta[property="og:video"], meta[property="og:image"], meta[name="twitter:player"]').each((i, elem) => {
            const content = $(elem).attr('content')
            if (content) {
                if ($(elem).attr('property') === 'og:video' || $(elem).attr('name') === 'twitter:player') {
                    media.push({
                        type: 'video',
                        url: content
                    })
                } else if ($(elem).attr('property') === 'og:image') {
                    media.push({
                        type: 'image',
                        url: content
                    })
                }
            }
        })
        
        // Buscar en scripts JSON-LD
        $('script[type="application/ld+json"]').each((i, elem) => {
            try {
                const json = JSON.parse($(elem).html())
                if (json.video && json.video.contentUrl) {
                    media.push({
                        type: 'video',
                        url: json.video.contentUrl
                    })
                }
                if (json.image && (json.image.url || json.image.contentUrl)) {
                    media.push({
                        type: 'image',
                        url: json.image.url || json.image.contentUrl
                    })
                }
            } catch (e) {}
        })
        
        // Eliminar duplicados
        const uniqueMedia = []
        const urls = new Set()
        
        for (const item of media) {
            if (!urls.has(item.url)) {
                urls.add(item.url)
                uniqueMedia.push(item)
            }
        }
        
        return {
            title: $('title').text() || 'Pinterest Content',
            media: uniqueMedia
        }
        
    } catch (error) {
        throw new Error(`Error al descargar: ${error.message}`)
    }
}

// Función para buscar en Pinterest
async function pinterestSearch(query) {
    try {
        const searchUrl = `https://www.pinterest.com/resource/BaseSearchResource/get/?data=%7B%22options%22%3A%7B%22query%22%3A%22${encodeURIComponent(query)}%22%2C%22scope%22%3A%22pins%22%7D%2C%22context%22%3A%7B%7D%7D`
        
        const { data } = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Referer': 'https://www.pinterest.com/',
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        
        const results = []
        
        if (data.resource_response && data.resource_response.data && data.resource_response.data.results) {
            data.resource_response.data.results.forEach(item => {
                // Verificar si es video
                if (item.videos && item.videos.video_list && item.videos.video_list.V_720P) {
                    results.push({
                        url: item.videos.video_list.V_720P.url,
                        thumbnail: item.images && item.images.orig ? item.images.orig.url : null,
                        isVideo: true
                    })
                }
                // Si no es video, buscar imagen
                else if (item.images) {
                    const imageUrl = item.images.orig?.url || 
                                   item.images['736x']?.url || 
                                   item.images['564x']?.url
                    if (imageUrl) {
                        results.push({
                            url: imageUrl,
                            thumbnail: imageUrl,
                            isVideo: false
                        })
                    }
                }
            })
        }
        
        return results.slice(0, 10) // Limitar a 10 resultados
        
    } catch (error) {
        console.error('Error en búsqueda:', error)
        return []
    }
}

// Función alternativa usando API externa para videos difíciles
async function pinterestVideoAlt(url) {
    try {
        const apis = [
            `https://api.pinterestdownloader.com/api`,
            `https://pinterest-video-api.vercel.app/?url=${encodeURIComponent(url)}`,
            `https://pinterest-downloader-api.vercel.app/pin?url=${encodeURIComponent(url)}`
        ]
        
        for (let api of apis) {
            try {
                const { data } = await axios.get(api, { timeout: 10000 })
                if (data.video_url || data.videos) {
                    return {
                        video: data.video_url || data.videos.hd || data.videos.sd,
                        audio: data.audio_url,
                        images: data.images || []
                    }
                }
            } catch (e) {}
        }
        
        throw new Error('No se pudo obtener el video')
    } catch (error) {
        throw error
    }
}

handler.help = ['pinterest <búsqueda|enlace>']
handler.command = ['pinterest', 'pin', 'pindl']
handler.tags = ['download']
handler.group = true
handler.limit = true
handler.premium = false

export default handler