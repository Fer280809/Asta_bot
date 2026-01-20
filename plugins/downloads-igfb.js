const handler = async (m, { args, conn, usedPrefix }) => {
    try {
        if (!args[0]) {
            return conn.reply(m.chat, `❀ *Ingresa un enlace válido*\n\n📝 *Ejemplos:*\n• https://www.instagram.com/p/...\n• https://www.facebook.com/reel/...\n• https://fb.watch/...`, m)
        }

        const url = args[0].trim()
        
        // Validar que sea un enlace de Instagram o Facebook
        if (!/https?:\/\/(www\.)?(instagram\.com|facebook\.com|fb\.watch)/i.test(url)) {
            return conn.reply(m.chat, `❌ *Enlace no válido*\n\nSolo acepto enlaces de:\n• Instagram (instagram.com)\n• Facebook (facebook.com, fb.watch)`, m)
        }

        await m.react('🕒')
        
        let mediaUrls = []
        let success = false
        
        // Lista de APIs a probar (en orden de preferencia)
        const apis = [
            {
                name: 'vreden',
                url: `${global.APIs.vreden?.url || 'https://api.vreden.my.id'}/api/igdownload?url=${encodeURIComponent(url)}`,
                parser: async (json) => {
                    if (json.resultado?.respuesta?.datos?.length) {
                        return json.resultado.respuesta.datos.map(v => ({
                            url: v.url,
                            type: v.type || 'video'
                        }))
                    }
                    return []
                }
            },
            {
                name: 'delirius',
                url: `${global.APIs.delirius?.url || 'https://delirius-api-oficial.vercel.app'}/download/instagram?url=${encodeURIComponent(url)}`,
                parser: async (json) => {
                    if (json.status && json.data?.length) {
                        return json.data.map(v => ({
                            url: v.url,
                            type: v.type || 'video'
                        }))
                    }
                    return []
                }
            },
            {
                name: 'api-samir',
                url: `https://api-samir.onrender.com/igdl?url=${encodeURIComponent(url)}`,
                parser: async (json) => {
                    if (json.result) {
                        return json.result.map(v => ({
                            url: v.download_link,
                            type: v.type || 'video'
                        }))
                    }
                    return []
                }
            },
            {
                name: 'aryan',
                url: `https://aryanapis.vercel.app/api/igdl?url=${encodeURIComponent(url)}`,
                parser: async (json) => {
                    if (json.data) {
                        if (Array.isArray(json.data)) {
                            return json.data.map(v => ({
                                url: v.url,
                                type: v.type || 'video'
                            }))
                        } else if (json.data.url) {
                            return [{
                                url: json.data.url,
                                type: json.data.type || 'video'
                            }]
                        }
                    }
                    return []
                }
            },
            {
                name: 'api-neoxr',
                url: `https://api.neoxr.eu.org/api/ig?url=${encodeURIComponent(url)}&apikey=yntkts`,
                parser: async (json) => {
                    if (json.data) {
                        const medias = []
                        if (json.data.images) {
                            json.data.images.forEach(img => medias.push({
                                url: img,
                                type: 'image'
                            }))
                        }
                        if (json.data.videos) {
                            json.data.videos.forEach(vid => medias.push({
                                url: vid,
                                type: 'video'
                            }))
                        }
                        return medias
                    }
                    return []
                }
            },
            {
                name: 'alpha',
                url: `https://api.alpha-md.xyz/download/instagram?url=${encodeURIComponent(url)}`,
                parser: async (json) => {
                    if (json.data) {
                        const medias = []
                        if (json.data.image) {
                            medias.push({
                                url: json.data.image,
                                type: 'image'
                            })
                        }
                        if (json.data.video) {
                            medias.push({
                                url: json.data.video,
                                type: 'video'
                            })
                        }
                        return medias
                    }
                    return []
                }
            }
        ]

        // Intentar con cada API hasta encontrar una que funcione
        for (const api of apis) {
            try {
                console.log(`[INSTAGRAM] Intentando con API: ${api.name}`)
                
                const res = await fetch(api.url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    timeout: 30000 // 30 segundos timeout
                }).catch(() => null)

                if (!res || !res.ok) continue
                
                const json = await res.json().catch(() => null)
                if (!json) continue
                
                mediaUrls = await api.parser(json)
                
                if (mediaUrls.length > 0) {
                    success = true
                    console.log(`[INSTAGRAM] Éxito con API: ${api.name}, encontrados: ${mediaUrls.length} medios`)
                    break
                }
            } catch (apiError) {
                console.log(`[INSTAGRAM] Error con API ${api.name}:`, apiError.message)
                continue
            }
        }

        // Si ninguna API funcionó, intentar con método alternativo para reels/cortos
        if (!success) {
            try {
                // Método alternativo para reels/cortos
                const altUrl = `https://api.download-lag.lol/api/ig?url=${encodeURIComponent(url)}`
                const altRes = await fetch(altUrl)
                const altJson = await altRes.json()
                
                if (altJson.result) {
                    mediaUrls = [{
                        url: altJson.result,
                        type: 'video'
                    }]
                    success = true
                }
            } catch (altError) {
                console.log('[INSTAGRAM] Método alternativo falló:', altError.message)
            }
        }

        if (!success || mediaUrls.length === 0) {
            await m.react('❌')
            return conn.reply(m.chat, `❌ *No se pudo descargar el contenido*\n\nPosibles razones:\n• El enlace es privado/eliminado\n• El contenido es muy largo (>10min)\n• Necesita login de Instagram\n\n*Solución:* Intenta con otro enlace o usa la app oficial para compartir.`, m)
        }

        // Enviar cada medio encontrado
        let sentCount = 0
        for (let i = 0; i < mediaUrls.length; i++) {
            const media = mediaUrls[i]
            try {
                if (media.type === 'image') {
                    await conn.sendFile(m.chat, media.url, 'instagram.jpg', 
                        `📸 *Instagram Download*\n${mediaUrls.length > 1 ? `(${i + 1}/${mediaUrls.length})` : ''}\n\n✨ Descargado por ASTA-BOT`, m)
                } else {
                    await conn.sendFile(m.chat, media.url, 'instagram.mp4', 
                        `🎬 *Instagram Download*\n${mediaUrls.length > 1 ? `(${i + 1}/${mediaUrls.length})` : ''}\n\n✨ Descargado por ASTA-BOT`, m)
                }
                sentCount++
                
                // Pequeña pausa entre envíos si hay múltiples medios
                if (i < mediaUrls.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000))
                }
            } catch (sendError) {
                console.log(`[INSTAGRAM] Error enviando medio ${i + 1}:`, sendError.message)
                // Continuar con los siguientes medios si hay error
            }
        }

        if (sentCount > 0) {
            await m.react('✅')
            if (sentCount < mediaUrls.length) {
                await conn.reply(m.chat, `✅ *Descarga parcialmente completada*\n\nSe enviaron ${sentCount} de ${mediaUrls.length} medios.`, m)
            }
        } else {
            await m.react('❌')
            await conn.reply(m.chat, '❌ Error al enviar los medios. Intenta nuevamente.', m)
        }

    } catch (error) {
        console.error('[INSTAGRAM] Error general:', error)
        await m.react('⚠️')
        await conn.reply(m.chat, `⚠️ *Error en la descarga*\n\nDetalles: ${error.message}\n\nSi el problema persiste, usa *${usedPrefix}report* para informarlo.`, m)
    }
}

// Comandos adicionales para facilitar el uso
handler.command = /^(instagram|ig|fb|facebook|igdl|fbdl|descargarig|descargarfb)$/i
handler.tags = ['descargas']
handler.help = [
    'instagram <enlace>',
    'ig <enlace>',
    'facebook <enlace>',
    'fb <enlace>',
    'igdl <enlace>',
    'fbdl <enlace>'
]

// Configuraciones adicionales
handler.limit = true // Activar límite para evitar spam
handler.premium = false // Disponible para todos
handler.group = true
handler.private = true // También funciona en privado

export default handler