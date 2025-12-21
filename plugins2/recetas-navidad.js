import fetch from "node-fetch"
import yts from "yt-search"
import Jimp from "jimp"
import axios from "axios"
import crypto from "crypto"

// Recetas navideñas mexicanas tradicionales con búsquedas específicas
const recetasNavidenas = [
    {
        nombre: "Bacalao a la Vizcaína",
        descripcion: "Platillo tradicional navideño con bacalao, jitomate, aceitunas y chiles güeros.",
        ingredientes: [
            "1 kg de bacalao desalado",
            "6 jitomates grandes",
            "2 cebollas",
            "4 dientes de ajo",
            "1/2 taza de aceitunas",
            "1/2 taza de alcaparras",
            "4 chiles güeros en vinagre",
            "1/2 taza de almendras",
            "Aceite de oliva",
            "Sal y pimienta"
        ],
        preparacion: [
            "Desala el bacalao en agua fría por 24 horas, cambiando el agua cada 6 horas",
            "Asa los jitomates y licúa con cebolla y ajo",
            "Sofríe la salsa y añade aceitunas, alcaparras y almendras",
            "Agrega el bacalao en trozos y cocina por 20 minutos",
            "Añade los chiles güeros y cocina 5 minutos más",
            "Sirve caliente con pan o tostadas"
        ],
        tiempo: "2 horas (más 24h de desalado)",
        porciones: "8 personas",
        busquedaVideo: "receta bacalao a la vizcaina navidad mexicana"
    },
    {
        nombre: "Romeritos con Mole y Camarón",
        descripcion: "Quelites en mole poblano con tortas de camarón seco y papas.",
        ingredientes: [
            "1 kg de romeritos limpios",
            "200g de camarón seco",
            "4 huevos",
            "500g de mole poblano",
            "4 papas medianas",
            "3 nopales",
            "Aceite para freír",
            "Sal al gusto"
        ],
        preparacion: [
            "Cuece los romeritos en agua con sal por 15 minutos",
            "Muele el camarón seco y mezcla con huevo batido",
            "Forma tortitas y fríelas en aceite caliente",
            "Cuece las papas en cubos y los nopales en rajas",
            "Diluye el mole en caldo y calienta",
            "Mezcla romeritos, papas, nopales y tortitas de camarón",
            "Baña con el mole caliente y sirve"
        ],
        tiempo: "1 hora 30 minutos",
        porciones: "6 personas",
        busquedaVideo: "como hacer romeritos con mole y camaron tradicional"
    },
    {
        nombre: "Ponche Navideño Mexicano",
        descripcion: "Bebida caliente con frutas de temporada, especias y piloncillo.",
        ingredientes: [
            "4 litros de agua",
            "2 conos de piloncillo",
            "4 guayabas",
            "2 manzanas",
            "200g de tejocotes",
            "1 rama de tamarindo",
            "3 rajas de canela",
            "1 taza de ciruela pasa",
            "Caña de azúcar en trozos",
            "Jamaica al gusto"
        ],
        preparacion: [
            "Hierve el agua con piloncillo y canela",
            "Agrega los tejocotes y cocina 15 minutos",
            "Añade guayabas, manzanas en cuartos y tamarindo",
            "Agrega ciruelas pasas y caña",
            "Cocina a fuego medio 30 minutos más",
            "Sirve caliente, opcionalmente con piquete (ron o tequila)"
        ],
        tiempo: "1 hora",
        porciones: "10-12 tazas",
        busquedaVideo: "ponche navideño mexicano tradicional receta"
    },
    {
        nombre: "Pierna de Cerdo al Horno",
        descripcion: "Pierna adobada con naranja, especias y horneada hasta dorar.",
        ingredientes: [
            "1 pierna de cerdo (5-6 kg)",
            "Jugo de 6 naranjas",
            "1/2 taza de vinagre",
            "8 dientes de ajo",
            "2 cucharadas de orégano",
            "1 cucharada de comino",
            "Sal y pimienta",
            "2 cervezas oscuras",
            "Mostaza al gusto"
        ],
        preparacion: [
            "Haz cortes profundos en la pierna",
            "Licúa naranja, ajo, especias, vinagre y cerveza",
            "Marina la pierna por 12 horas en refrigerador",
            "Precalienta horno a 180°C",
            "Hornea cubierta con papel aluminio 3 horas",
            "Retira el aluminio y hornea 1 hora más bañando cada 15 min",
            "Deja reposar 20 minutos antes de rebanar"
        ],
        tiempo: "4 horas (más 12h marinado)",
        porciones: "12-15 personas",
        busquedaVideo: "pierna de cerdo al horno navidad receta mexicana"
    },
    {
        nombre: "Ensalada de Manzana Navideña",
        descripcion: "Ensalada cremosa con manzanas, nueces, piña y crema.",
        ingredientes: [
            "4 manzanas rojas",
            "1 taza de piña en cubos",
            "1 taza de nuez picada",
            "1/2 taza de pasitas",
            "2 latas de crema",
            "1 lata de media crema",
            "1/2 taza de azúcar",
            "Jugo de limón",
            "Granadas para decorar"
        ],
        preparacion: [
            "Corta las manzanas en cubos y rocía con limón",
            "Mezcla cremas con azúcar hasta integrar",
            "Agrega manzanas, piña, nueces y pasas",
            "Refrigera mínimo 2 horas",
            "Decora con granada roja antes de servir"
        ],
        tiempo: "30 minutos (más 2h refrigeración)",
        porciones: "8 personas",
        busquedaVideo: "ensalada de manzana navideña receta tradicional"
    },
    {
        nombre: "Buñuelos con Miel de Piloncillo",
        descripcion: "Tortillas fritas espolvoreadas con azúcar y bañadas en miel.",
        ingredientes: [
            "1 kg de harina",
            "4 huevos",
            "1/2 taza de mantequilla",
            "1 cucharadita de polvo para hornear",
            "1 taza de leche tibia",
            "Aceite para freír",
            "Azúcar con canela",
            "2 conos de piloncillo",
            "Rajas de canela"
        ],
        preparacion: [
            "Mezcla harina, huevos, mantequilla y leche",
            "Amasa hasta obtener masa suave",
            "Forma bolitas y deja reposar 30 minutos",
            "Extiende muy delgadas con rodillo",
            "Fríe en aceite caliente hasta dorar",
            "Espolvorea con azúcar y canela",
            "Para la miel: hierve piloncillo con agua y canela"
        ],
        tiempo: "1 hora 30 minutos",
        porciones: "20 buñuelos",
        busquedaVideo: "buñuelos mexicanos tradicionales navidad receta"
    },
    {
        nombre: "Pavo Navideño Relleno",
        descripcion: "Pavo jugoso relleno de carne molida, frutas y nueces.",
        ingredientes: [
            "1 pavo de 8-10 kg",
            "500g de carne molida",
            "2 manzanas picadas",
            "1 taza de nueces",
            "1 taza de ciruelas pasas",
            "2 cebollas",
            "Mantequilla",
            "Vino blanco",
            "Hierbas de olor",
            "Sal y pimienta"
        ],
        preparacion: [
            "Sofríe cebolla y carne molida",
            "Agrega manzanas, nueces y ciruelas",
            "Sazona el pavo por dentro y fuera",
            "Rellena con la mezcla de carne",
            "Unta mantequilla sobre el pavo",
            "Hornea a 180°C por 4-5 horas",
            "Baña con vino blanco cada hora"
        ],
        tiempo: "5 horas",
        porciones: "15-20 personas",
        busquedaVideo: "pavo relleno navideño mexicano receta tradicional"
    },
    {
        nombre: "Tamales de Dulce Navideños",
        descripcion: "Tamales dulces con pasas, piña y sabor a canela.",
        ingredientes: [
            "1 kg de masa para tamales",
            "300g de manteca",
            "1 taza de azúcar",
            "1 taza de pasitas",
            "1 taza de piña en cubos",
            "Colorante rosa",
            "1 cucharada de polvo para hornear",
            "Hojas de maíz",
            "Canela molida"
        ],
        preparacion: [
            "Bate la manteca hasta esponjar",
            "Agrega masa, azúcar y polvo para hornear",
            "Divide la masa y colorea una parte de rosa",
            "Mezcla pasas y piña",
            "Unta masa en hojas de maíz",
            "Coloca frutas en el centro",
            "Envuelve y cuece al vapor 1 hora"
        ],
        tiempo: "2 horas",
        porciones: "30 tamales",
        busquedaVideo: "tamales dulces navideños receta mexicana"
    },
    {
        nombre: "Rosca de Reyes",
        descripcion: "Pan dulce tradicional del 6 de enero con figuras escondidas.",
        ingredientes: [
            "1 kg de harina",
            "200g de azúcar",
            "200g de mantequilla",
            "6 huevos",
            "2 sobres de levadura",
            "Ralladura de naranja",
            "Agua de azahar",
            "Frutas cristalizadas",
            "Muñequitos de plástico",
            "Azúcar glas"
        ],
        preparacion: [
            "Disuelve levadura en leche tibia",
            "Mezcla harina, azúcar, huevos y mantequilla",
            "Amasa hasta obtener masa elástica",
            "Deja reposar hasta que duplique tamaño",
            "Forma rosca y esconde muñequitos",
            "Decora con frutas cristalizadas",
            "Hornea a 180°C por 40 minutos"
        ],
        tiempo: "3 horas (con reposos)",
        porciones: "12-15 rebanadas",
        busquedaVideo: "rosca de reyes tradicional receta mexicana"
    },
    {
        nombre: "Atole de Guayaba Navideño",
        descripcion: "Bebida caliente y espesa con guayaba y canela.",
        ingredientes: [
            "1 litro de leche",
            "1/2 kg de guayabas",
            "1 taza de masa de maíz",
            "1 taza de azúcar",
            "2 rajas de canela",
            "1 cucharadita de vainilla"
        ],
        preparacion: [
            "Cuece las guayabas con canela hasta suaves",
            "Licúa y cuela para quitar semillas",
            "Disuelve masa de maíz en leche fría",
            "Calienta la leche con masa sin dejar de mover",
            "Agrega puré de guayaba y azúcar",
            "Cocina hasta espesar, moviendo constantemente",
            "Sirve caliente en tazas"
        ],
        tiempo: "45 minutos",
        porciones: "6-8 tazas",
        busquedaVideo: "atole de guayaba receta tradicional mexicana"
    }
]

async function resizeImage(buffer, size = 300) {
    try {
        const image = await Jimp.read(buffer)
        return await image.resize(size, size).getBufferAsync(Jimp.MIME_JPEG)
    } catch {
        return buffer
    }
}

const savetube = {
    api: {
        base: "https://media.savetube.me/api",
        info: "/v2/info",
        download: "/download",
        cdn: "/random-cdn"
    },
    headers: {
        accept: "*/*",
        "content-type": "application/json",
        origin: "https://yt.savetube.me",
        referer: "https://yt.savetube.me/",
        "user-agent": "Postify/1.0.0"
    },
    crypto: {
        hexToBuffer: (hexString) => {
            const matches = hexString.match(/.{1,2}/g)
            return Buffer.from(matches.join(""), "hex")
        },
        decrypt: async (enc) => {
            const secretKey = "C5D58EF67A7584E4A29F6C35BBC4EB12"
            const data = Buffer.from(enc, "base64")
            const iv = data.slice(0, 16)
            const content = data.slice(16)
            const key = savetube.crypto.hexToBuffer(secretKey)
            const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv)
            let decrypted = decipher.update(content)
            decrypted = Buffer.concat([decrypted, decipher.final()])
            return JSON.parse(decrypted.toString())
        }
    },
    youtube: (url) => {
        const patterns = [
            /youtube.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
            /youtube.com\/embed\/([a-zA-Z0-9_-]{11})/,
            /youtu.be\/([a-zA-Z0-9_-]{11})/
        ]
        for (let pattern of patterns) {
            const match = url.match(pattern)
            if (match) return match[1]
        }
        return null
    },
    request: async (endpoint, data = {}, method = "post") => {
        try {
            const { data: response } = await axios({
                method,
                url: `${endpoint.startsWith("http") ? "" : savetube.api.base}${endpoint}`,
                data: method === "post" ? data : undefined,
                params: method === "get" ? data : undefined,
                headers: savetube.headers
            })
            return { status: true, code: 200, data: response }
        } catch (error) {
            return { status: false, code: error.response?.status || 500, error: error.message }
        }
    },
    getCDN: async () => {
        const response = await savetube.request(savetube.api.cdn, {}, "get")
        if (!response.status) return response
        return { status: true, code: 200, data: response.data.cdn }
    },
    download: async (link) => {
        const id = savetube.youtube(link)
        if (!id) return { status: false, code: 400, error: "No se pudo obtener el ID del video" }
        try {
            const cdnx = await savetube.getCDN()
            if (!cdnx.status) return cdnx
            const cdn = cdnx.data
            const videoInfo = await savetube.request(`https://${cdn}${savetube.api.info}`, { url: `https://www.youtube.com/watch?v=${id}` })
            if (!videoInfo.status || !videoInfo.data?.data) return { status: false, code: 500, error: "No se pudo obtener información del video" }
            const decrypted = await savetube.crypto.decrypt(videoInfo.data.data)
            const downloadData = await savetube.request(
                `https://${cdn}${savetube.api.download}`,
                { id, downloadType: "video", quality: "720p", key: decrypted.key }
            )
            if (!downloadData?.data?.data?.downloadUrl) return { status: false, code: 500, error: "No se pudo obtener link de descarga" }
            return {
                status: true,
                code: 200,
                result: {
                    title: decrypted.title || "Desconocido",
                    download: downloadData.data.data.downloadUrl,
                    thumbnail: decrypted.thumbnail || null
                }
            }
        } catch (error) {
            return { status: false, code: 500, error: error.message }
        }
    }
}

async function getSize(url) {
    try {
        const res = await axios.head(url, {
            timeout: 10000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        return parseInt(res.headers['content-length'], 10) || 0
    } catch {
        return 0
    }
}

const handler = async (m, { conn, usedPrefix }) => {
    await m.react('🎄')

    try {
        // Seleccionar receta aleatoria
        const receta = recetasNavidenas[Math.floor(Math.random() * recetasNavidenas.length)]
        
        console.log(`🍽️ Receta seleccionada: ${receta.nombre}`)

        // Crear mensaje de receta
        let mensajeReceta = `╭━━━━━━🎄━━━━━━╮\n`
        mensajeReceta += `│ *RECETA NAVIDEÑA* 🎅\n`
        mensajeReceta += `╰━━━━━━🎄━━━━━━╯\n\n`
        
        mensajeReceta += `🍽️ *${receta.nombre}*\n\n`
        mensajeReceta += `📝 *Descripción:*\n${receta.descripcion}\n\n`
        
        mensajeReceta += `👨‍🍳 *Ingredientes:*\n`
        receta.ingredientes.forEach(ing => {
            mensajeReceta += `• ${ing}\n`
        })
        
        mensajeReceta += `\n🔪 *Preparación:*\n`
        receta.preparacion.forEach((paso, index) => {
            mensajeReceta += `${index + 1}. ${paso}\n`
        })
        
        mensajeReceta += `\n⏰ *Tiempo:* ${receta.tiempo}\n`
        mensajeReceta += `👥 *Porciones:* ${receta.porciones}\n\n`
        mensajeReceta += `🎁 *¡Buen provecho y Feliz Navidad!* 🎄`

        // Enviar receta
        await conn.reply(m.chat, mensajeReceta, m)
        
        await m.react('📹')

        // Buscar video tutorial
        await conn.reply(m.chat, 
            `📹 *¡Buscando video tutorial!* 🎅\n\n` +
            `🎬 Buscando: *${receta.nombre}*\n` +
            `⏳ Los elfos están preparando el video...`, 
            m
        )

        const search = await yts(receta.busquedaVideo)
        const videoInfo = search.videos?.[0]

        if (!videoInfo) {
            await m.react('✅')
            return conn.reply(m.chat, 
                `✅ *Receta enviada correctamente*\n\n` +
                `❄️ No se encontró video tutorial, pero tienes la receta completa arriba.\n\n` +
                `💡 *Consejo:* Puedes buscar en YouTube: "${receta.nombre}"`, 
                m
            )
        }

        const { title, thumbnail, url } = videoInfo

        console.log(`🎯 Descargando tutorial: ${title}`)

        const thumbResized = await resizeImage(await (await fetch(thumbnail)).buffer(), 300)

        await conn.reply(m.chat, 
            `╭━━━━━━🎬━━━━━━╮\n` +
            `│ *VIDEO TUTORIAL* 📹\n` +
            `╰━━━━━━🎬━━━━━━╯\n\n` +
            `🎥 *${title}*\n\n` +
            `⏳ *Descargando tutorial...*\n` +
            `🎅 *Los elfos están preparando el video...*`, 
            m
        )

        // Descargar video
        const dl = await savetube.download(url)
        if (!dl.status) {
            await m.react('✅')
            return conn.reply(m.chat, 
                `✅ *Receta enviada*\n\n` +
                `❌ No se pudo descargar el video, pero puedes verlo aquí:\n${url}`, 
                m
            )
        }

        const size = await getSize(dl.result.download)
        console.log(`📦 Tamaño del video: ${size} bytes`)

        const fkontak = {
            key: { fromMe: false, participant: "0@s.whatsapp.net" },
            message: {
                documentMessage: {
                    title: `🎬 ${title}`,
                    fileName: `Tutorial ${receta.nombre}`,
                    jpegThumbnail: thumbResized
                }
            }
        }

        // Si es muy grande (>200MB), enviar como documento
        if (size > 200 * 1024 * 1024) {
            await conn.sendMessage(m.chat, {
                document: { url: dl.result.download },
                mimetype: 'video/mp4',
                fileName: `${receta.nombre} - Tutorial.mp4`,
                jpegThumbnail: thumbResized,
                caption: `🎬 *Tutorial: ${receta.nombre}*\n\n🎄 ¡Sigue el video y cocina esta delicia navideña!`
            }, { quoted: fkontak })
        } else {
            // Enviar como video normal
            await conn.sendMessage(m.chat, {
                video: { url: dl.result.download },
                mimetype: 'video/mp4',
                caption: `🎬 *Tutorial: ${receta.nombre}*\n\n🎄 ¡Sigue el video y cocina esta delicia navideña!`,
                jpegThumbnail: thumbResized
            }, { quoted: fkontak })
        }

        await m.react('🎁')

    } catch (e) {
        await m.react('❌')
        console.error('❌ Error:', e)
        return conn.reply(m.chat, 
            `⚠️ *¡Error en la cocina navideña!* 🎄\n\n` +
            `Error: ${typeof e === 'string' ? e : e.message}\n\n` +
            `🎅 Intenta de nuevo con *${usedPrefix}receta*`, 
            m
        )
    }
}

handler.help = ['receta', 'recetanavi', 'cocinanavi']
handler.tags = ['navidadreceta', 'recetas']
handler.command = ['receta', 'recetanavi', 'cocinanavi', 'recetanavidad']
handler.register = false
handler.group = false

export default handler