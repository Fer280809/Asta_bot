import fetch from "node-fetch"
import yts from "yt-search"
import Jimp from "jimp"
import axios from "axios"
import crypto from "crypto"

// RECETAS NAVIDEÑAS MEXICANAS E INTERNACIONALES AMPLIADAS
const recetasNavidenas = [
    // BEBIDAS NAVIDEÑAS
    {
        nombre: "Chocolate Caliente Especial",
        descripcion: "Chocolate cremoso con canela, vainilla y un toque de naranja.",
        categoria: "Bebidas",
        dificultad: "Fácil",
        tiempo: "20 minutos",
        porciones: "4 tazas",
        calorias: "180 cal por taza",
        ingredientes: [
            "4 tazas de leche entera",
            "200g de chocolate negro para mesa",
            "2 cucharadas de cacao en polvo",
            "1 rama de canela",
            "1 cucharadita de extracto de vainilla",
            "Ralladura de naranja",
            "Crema batida para decorar",
            "Chispas de chocolate",
            "Marshmallows"
        ],
        preparacion: [
            "Calienta la leche con la canela a fuego medio sin hervir",
            "Trocea el chocolate y derrite en baño María",
            "Mezcla el chocolate derretido con el cacao",
            "Agrega lentamente la leche caliente, batiendo constantemente",
            "Añade vainilla y ralladura de naranja",
            "Sirve caliente con crema batida, chispas y marshmallows"
        ],
        tips: "Para un toque especial, añade una pizca de chile en polvo",
        busquedaVideo: "chocolate caliente navideño especial receta"
    },
    {
        nombre: "Ponche de Frutas Navideño",
        descripcion: "Bebida caliente tradicional con frutas de temporada y especias.",
        categoria: "Bebidas",
        dificultad: "Media",
        tiempo: "1 hora",
        porciones: "8-10 tazas",
        calorias: "120 cal por taza",
        ingredientes: [
            "2 litros de agua",
            "200g de piloncillo",
            "8 tejocotes",
            "4 guayabas maduras",
            "2 manzanas",
            "1 taza de ciruelas pasas",
            "1 taza de caña de azúcar en trozos",
            "2 rajas de canela",
            "5 clavos de olor",
            "1 cucharadita de anís estrella"
        ],
        preparacion: [
            "Hierve agua con piloncillo y especias por 15 minutos",
            "Añade tejocotes y cocina por 20 minutos hasta ablandar",
            "Agrega guayabas partidas en cuartos y manzanas en trozos",
            "Incorpora ciruelas pasas y caña de azúcar",
            "Cocina a fuego lento 25 minutos más",
            "Sirve caliente, puede añadirse un toque de ron o brandy"
        ],
        tips: "Dejar reposar toda la noche para que los sabores se intensifiquen",
        busquedaVideo: "ponche navideño mexicano tradicional receta"
    },
    {
        nombre: "Eggnog Casero",
        descripcion: "Bebida cremosa de huevo, leche y especias navideñas.",
        categoria: "Bebidas",
        dificultad: "Media",
        tiempo: "30 minutos",
        porciones: "6 tazas",
        calorias: "280 cal por taza",
        ingredientes: [
            "6 huevos",
            "1/2 taza de azúcar",
            "2 tazas de leche",
            "1 taza de crema para batir",
            "1 cucharadita de extracto de vainilla",
            "1/2 cucharadita de nuez moscada rallada",
            "1/4 cucharadita de canela molida",
            "Ron o brandy al gusto (opcional)"
        ],
        preparacion: [
            "Separa yemas y claras de huevo",
            "Bate yemas con azúcar hasta cremosas",
            "Calienta leche y crema sin hervir, añade a las yemas",
            "Cocina a baño María hasta espesar ligeramente",
            "Enfría la mezcla y añade vainilla y especias",
            "Bate claras a punto de nieve e incorpora suavemente",
            "Refrigera por 4 horas antes de servir"
        ],
        tips: "Decorar con nuez moscada rallada y canela en polvo",
        busquedaVideo: "eggnog casero receta navideña tradicional"
    },
    
    // POSTRES Y GALLETAS
    {
        nombre: "Galletas de Jengibre Navideñas",
        descripcion: "Galletas especiadas con formas navideñas y glaseado real.",
        categoria: "Postres",
        dificultad: "Media",
        tiempo: "2 horas",
        porciones: "40 galletas",
        calorias: "85 cal por galleta",
        ingredientes: [
            "3 tazas de harina",
            "1 cucharadita de bicarbonato",
            "2 cucharaditas de jengibre molido",
            "1 cucharadita de canela molida",
            "1/2 cucharadita de clavo molido",
            "200g de mantequilla a temperatura ambiente",
            "3/4 taza de azúcar morena",
            "1 huevo",
            "1/4 taza de miel",
            "1 cucharadita de extracto de vainilla"
        ],
        preparacion: [
            "Mezcla harina, bicarbonato y especias",
            "Bate mantequilla y azúcar hasta cremoso",
            "Añade huevo, miel y vainilla, bate bien",
            "Incorpora los ingredientes secos hasta formar masa",
            "Envuelve en plástico y refrigera 1 hora",
            "Extiende la masa y corta formas navideñas",
            "Hornea a 180°C por 10-12 minutos"
        ],
        tips: "Decorar con glaseado real de azúcar glass y colorantes",
        busquedaVideo: "galletas de jengibre navideñas decoradas receta"
    },
    {
        nombre: "Waffles de Canela con Sirope de Arce",
        descripcion: "Waffles esponjosos con canela y sirope caliente.",
        categoria: "Postres",
        dificultad: "Fácil",
        tiempo: "25 minutos",
        porciones: "8 waffles",
        calorias: "220 cal por waffle",
        ingredientes: [
            "2 tazas de harina",
            "2 cucharadas de azúcar",
            "1 cucharada de polvo para hornear",
            "1/2 cucharadita de sal",
            "2 huevos",
            "1 3/4 tazas de leche",
            "1/2 taza de mantequilla derretida",
            "1 cucharadita de extracto de vainilla",
            "2 cucharaditas de canela molida",
            "Sirope de arce",
            "Frutos rojos para decorar"
        ],
        preparacion: [
            "Mezcla ingredientes secos: harina, azúcar, polvo, sal y canela",
            "En otro bowl, bate huevos, leche, mantequilla y vainilla",
            "Combina mezclas húmedas y secas sin batir demasiado",
            "Calienta la wafflera y unta con mantequilla",
            "Vierte masa y cocina hasta dorar",
            "Sirve con sirope de arce y frutos rojos"
        ],
        tips: "Para waffles más crujientes, aumentar 1 cucharada de maicena",
        busquedaVideo: "waffles de canela navideños receta fácil"
    },
    {
        nombre: "Pastel de Frutas Navideño",
        descripcion: "Pastel denso con frutas confitadas, nueces y especias.",
        categoria: "Postres",
        dificultad: "Alta",
        tiempo: "3 horas (más 2 semanas de maduración)",
        porciones: "16 rebanadas",
        calorias: "320 cal por rebanada",
        ingredientes: [
            "500g de frutas confitadas mixtas",
            "200g de pasas",
            "200g de ciruelas pasas picadas",
            "100g de cerezas al marrasquino",
            "1 taza de ron oscuro",
            "250g de mantequilla",
            "1 taza de azúcar morena",
            "4 huevos",
            "2 tazas de harina",
            "1 cucharadita de canela",
            "1/2 cucharadita de nuez moscada",
            "1/4 taza de mermelada de albaricoque"
        ],
        preparacion: [
            "Remoja frutas en ron por mínimo 24 horas",
            "Bate mantequilla y azúcar hasta cremoso",
            "Añade huevos uno por uno",
            "Incorpora harina y especias cernidas",
            "Mezcla con frutas escurridas",
            "Vierte en molde engrasado y forrado",
            "Hornea a 150°C por 2.5 horas",
            "Cepilla con mermelada caliente al salir del horno"
        ],
        tips: "Madurar mínimo 2 semanas, regando con ron cada 3 días",
        busquedaVideo: "pastel de frutas navideño tradicional receta"
    },
    {
        nombre: "Buñuelos Mexicanos con Miel",
        descripcion: "Tortillas fritas crujientes con miel de piloncillo.",
        categoria: "Postres",
        dificultad: "Media",
        tiempo: "1 hora 30 minutos",
        porciones: "20 buñuelos",
        calorias: "180 cal por buñuelo",
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
            "Para la miel: hierve piloncillo con agua y canela hasta espesar"
        ],
        tips: "Estirar la masa lo más delgada posible para que queden crujientes",
        busquedaVideo: "buñuelos mexicanos tradicionales navidad receta"
    },
    
    // PLATILLOS PRINCIPALES
    {
        nombre: "Pavo Relleno Navideño",
        descripcion: "Pavo jugoso relleno de frutas, nueces y hierbas.",
        categoria: "Platillo Principal",
        dificultad: "Alta",
        tiempo: "5 horas",
        porciones: "12-15 personas",
        calorias: "350 cal por porción",
        ingredientes: [
            "1 pavo de 6-7 kg",
            "Sal y pimienta al gusto",
            "1 taza de mantequilla ablandada",
            "4 manzanas picadas",
            "2 cebollas picadas",
            "3 tallos de apio picado",
            "1 taza de nueces picadas",
            "1 taza de pasas",
            "1 taza de vino blanco",
            "Hierbas frescas (tomillo, romero, salvia)"
        ],
        preparacion: [
            "Sazona el pavo por dentro y fuera con sal y pimienta",
            "Mezcla manzanas, cebollas, apio, nueces y pasas para el relleno",
            "Rellena el pavo con la mezcla de frutas",
            "Unta generosamente con mantequilla",
            "Coloca hierbas sobre y dentro del pavo",
            "Hornea a 180°C por 4 horas, bañando con jugos cada 45 minutos",
            "Deja reposar 30 minutos antes de cortar"
        ],
        tips: "Cubrir con papel aluminio las primeras 3 horas para evitar que se seque",
        busquedaVideo: "pavo relleno navideño tradicional receta completa"
    },
    {
        nombre: "Pierna de Cerdo Horneada",
        descripcion: "Pierna adobada con naranja, especias y horneada lentamente.",
        categoria: "Platillo Principal",
        dificultad: "Media",
        tiempo: "4 horas (más 12h marinado)",
        porciones: "10-12 personas",
        calorias: "380 cal por porción",
        ingredientes: [
            "1 pierna de cerdo (4-5 kg)",
            "Jugo de 6 naranjas",
            "1/2 taza de vinagre de manzana",
            "8 dientes de ajo machacados",
            "2 cucharadas de orégano",
            "1 cucharada de comino",
            "Sal y pimienta",
            "2 cervezas oscuras",
            "Miel para glaseado"
        ],
        preparacion: [
            "Haz cortes profundos en la pierna",
            "Licúa naranja, ajo, especias, vinagre y cerveza",
            "Marina la pierna por 12 horas en refrigerador",
            "Precalienta horno a 160°C",
            "Hornea cubierta con papel aluminio 3 horas",
            "Retira aluminio, unta con miel y hornea 1 hora más",
            "Baña con sus jugos cada 15 minutos"
        ],
        tips: "Dejar reposar 20 minutos antes de cortar para mayor jugosidad",
        busquedaVideo: "pierna de cerdo al horno navideña receta"
    },
    {
        nombre: "Bacalao a la Vizcaína",
        descripcion: "Platillo tradicional con bacalao en salsa de jitomate y aceitunas.",
        categoria: "Platillo Principal",
        dificultad: "Media",
        tiempo: "2 horas (más 24h desalado)",
        porciones: "8 personas",
        calorias: "280 cal por porción",
        ingredientes: [
            "1 kg de bacalao seco desalado",
            "6 jitomates grandes",
            "2 cebollas blancas",
            "4 dientes de ajo",
            "1/2 taza de aceitunas verdes",
            "1/2 taza de alcaparras",
            "4 chiles güeros en vinagre",
            "1/2 taza de almendras fileteadas",
            "Aceite de oliva",
            "Sal y pimienta"
        ],
        preparacion: [
            "Desala el bacalao en agua fría por 24 horas, cambiando agua cada 6h",
            "Asa los jitomates hasta que la piel se pele",
            "Licúa jitomates con cebolla y ajo",
            "Sofríe la salsa en aceite de oliva por 10 minutos",
            "Añade aceitunas, alcaparras y almendras",
            "Agrega el bacalao en trozos y cocina a fuego bajo 20 minutos",
            "Incorpora chiles güeros 5 minutos antes de apagar"
        ],
        tips: "Acompañar con arroz blanco y tortillas calientes",
        busquedaVideo: "bacalao a la vizcaina navidad mexicana receta"
    },
    
    // ENSALADAS Y GUARNICIONES
    {
        nombre: "Ensalada de Manzana Navideña",
        descripcion: "Ensalada cremosa con manzanas, nueces y frutas secas.",
        categoria: "Acompañamiento",
        dificultad: "Fácil",
        tiempo: "20 minutos",
        porciones: "8 personas",
        calorias: "150 cal por porción",
        ingredientes: [
            "4 manzanas rojas en cubos",
            "1 taza de apio picado",
            "1 taza de nueces picadas",
            "1/2 taza de pasas",
            "1/2 taza de uvas verdes partidas",
            "1 taza de mayonesa",
            "1/2 taza de crema",
            "1 cucharada de azúcar",
            "Jugo de 1 limón"
        ],
        preparacion: [
            "Mezcla manzanas, apio, nueces, pasas y uvas",
            "En otro bowl, combina mayonesa, crema, azúcar y jugo de limón",
            "Mezcla ambos preparados hasta integrar bien",
            "Refrigera mínimo 1 hora antes de servir",
            "Decorar con hojas de menta y granada"
        ],
        tips: "Rociar las manzanas con limón inmediatamente para evitar que se oxiden",
        busquedaVideo: "ensalada de manzana navideña cremosa receta"
    },
    {
        nombre: "Puré de Papa con Queso y Tocino",
        descripcion: "Puré cremoso con queso cheddar y tocino crujiente.",
        categoria: "Acompañamiento",
        dificultad: "Fácil",
        tiempo: "40 minutos",
        porciones: "6 personas",
        calorias: "220 cal por porción",
        ingredientes: [
            "1 kg de papas",
            "1/2 taza de mantequilla",
            "1 taza de leche caliente",
            "1 taza de queso cheddar rallado",
            "200g de tocino cocido y picado",
            "2 cucharadas de cebollín picado",
            "Sal y pimienta al gusto"
        ],
        preparacion: [
            "Cocina papas en agua con sal hasta suaves",
            "Escurre y machaca hasta obtener puré",
            "Añade mantequilla y leche caliente, bate hasta cremoso",
            "Incorpora queso cheddar reservando un poco",
            "Mezcla tocino y cebollín",
            "Corrige sazón con sal y pimienta",
            "Gratinar 5 minutos con el queso reservado"
        ],
        tips: "Para puré extra cremoso, usar leche entera y mantequilla sin sal",
        busquedaVideo: "pure de papa con queso y tocino navidad"
    },
    
    // PANES Y BOLLERÍA
    {
        nombre: "Pan de Muerto Navideño",
        descripcion: "Pan dulce con anís y decoración navideña.",
        categoria: "Panadería",
        dificultad: "Media",
        tiempo: "3 horas",
        porciones: "1 pieza grande",
        calorias: "200 cal por rebanada",
        ingredientes: [
            "500g de harina",
            "150g de azúcar",
            "100g de mantequilla",
            "3 huevos",
            "1 sobre de levadura seca",
            "1/2 taza de leche tibia",
            "1 cucharada de agua de azahar",
            "1 cucharadita de semillas de anís",
            "Azúcar glass para decorar"
        ],
        preparacion: [
            "Disuelve levadura en leche tibia con una cucharada de azúcar",
            "Mezcla harina, azúcar, mantequilla y huevos",
            "Añade levadura activada y agua de azahar",
            "Amasa 15 minutos hasta obtener masa elástica",
            "Deja leudar 1.5 horas hasta duplicar tamaño",
            "Forma pan con decoraciones navideñas",
            "Hornea a 180°C por 30-35 minutos"
        ],
        tips: "Pintar con mantequilla derretida al salir del horno y espolvorear azúcar",
        busquedaVideo: "pan dulce navideño mexicano receta"
    },
    {
        nombre: "Rosca de Reyes Navideña",
        descripcion: "Pan dulce con frutas cristalizadas y muñequitos escondidos.",
        categoria: "Panadería",
        dificultad: "Alta",
        tiempo: "4 horas",
        porciones: "12-15 rebanadas",
        calorias: "250 cal por rebanada",
        ingredientes: [
            "1 kg de harina",
            "200g de azúcar",
            "200g de mantequilla",
            "6 huevos",
            "2 sobres de levadura",
            "1/2 taza de leche tibia",
            "Ralladura de naranja y limón",
            "Agua de azahar",
            "Frutas cristalizadas variadas",
            "Azúcar glass para decorar"
        ],
        preparacion: [
            "Activa levadura en leche tibia con azúcar",
            "Mezcla harina, azúcar, huevos y mantequilla",
            "Añade levadura activada y ralladuras",
            "Amasa 20 minutos hasta que la masa no se pegue",
            "Deja leudar 2 horas en lugar cálido",
            "Forma rosca y esconde muñequitos",
            "Decora con frutas cristalizadas",
            "Hornea a 180°C por 40 minutos"
        ],
        tips: "Pincelar con mantequilla derretida al salir del horno para brillo",
        busquedaVideo: "rosca de reyes navideña tradicional receta"
    },
    
    // BOTANAS Y APERITIVOS
    {
        nombre: "Canapés de Salmón y Queso Crema",
        descripcion: "Aperitivos elegantes con salmón ahumado y eneldo.",
        categoria: "Aperitivo",
        dificultad: "Fácil",
        tiempo: "25 minutos",
        porciones: "24 canapés",
        calorias: "65 cal por canapé",
        ingredientes: [
            "200g de salmón ahumado",
            "1 paquete de queso crema",
            "1 cucharada de eneldo fresco picado",
            "Jugo de 1/2 limón",
            "24 rebanadas de pan de molde sin corteza",
            "Pepino para decorar",
            "Alcaparras",
            "Pimienta negra molida"
        ],
        preparacion: [
            "Mezcla queso crema, eneldo y jugo de limón",
            "Corta el pan con cortadores de formas navideñas",
            "Tuesta ligeramente las formas de pan",
            "Unta cada tostada con mezcla de queso",
            "Coloca trocitos de salmón ahumado",
            "Decora con rodajas de pepino y alcaparras",
            "Espolvorea pimienta negra"
        ],
        tips: "Servir inmediatamente para que el pan no se ablande",
        busquedaVideo: "canapes de salmon navidenos faciles"
    },
    {
        nombre: "Brochetas de Frutas Navideñas",
        descripcion: "Brochetas coloridas con frutas y chocolate.",
        categoria: "Aperitivo",
        dificultad: "Fácil",
        tiempo: "30 minutos",
        porciones: "12 brochetas",
        calorias: "90 cal por brocheta",
        ingredientes: [
            "Fresas",
            "Piña en cubos",
            "Uvas verdes y rojas",
            "Plátano",
            "Kiwi",
            "Chocolate para fundir",
            "Coco rallado",
            "Palitos para brocheta"
        ],
        preparacion: [
            "Lava y corta todas las frutas en trozos similares",
            "Ensarta las frutas en palitos alternando colores",
            "Derrite chocolate a baño María",
            "Sumerge la punta de cada brocheta en chocolate",
            "Espolvorea con coco rallado",
            "Coloca sobre papel encerado para que seque"
        ],
        tips: "Rociar las frutas con jugo de limón para evitar oxidación",
        busquedaVideo: "brochetas de frutas navideñas decoradas"
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

const handler = async (m, { conn, usedPrefix, command, text }) => {
    await m.react('🎄')

    try {
        let receta
        let busquedaEspecifica = false
        
        // Si el usuario escribe un número, buscar por índice
        if (text && !isNaN(text)) {
            const index = parseInt(text) - 1
            if (index >= 0 && index < recetasNavidenas.length) {
                receta = recetasNavidenas[index]
                busquedaEspecifica = true
            } else {
                return conn.reply(m.chat,
                    `❌ *Número fuera de rango*\n\n` +
                    `Solo tenemos recetas del 1 al ${recetasNavidenas.length}\n` +
                    `Usa: *${usedPrefix}${command} lista* para ver todas las recetas`,
                    m
                )
            }
        }
        // Si el usuario busca por nombre
        else if (text && isNaN(text)) {
            const busqueda = text.toLowerCase()
            const recetasFiltradas = recetasNavidenas.filter(r => 
                r.nombre.toLowerCase().includes(busqueda) ||
                r.categoria.toLowerCase().includes(busqueda) ||
                r.dificultad.toLowerCase().includes(busqueda)
            )
            
            if (recetasFiltradas.length === 0) {
                return conn.reply(m.chat,
                    `🔍 *No se encontraron recetas para:* "${text}"\n\n` +
                    `Usa: *${usedPrefix}${command} lista* para ver todas las recetas\n` +
                    `O: *${usedPrefix}${command} categorias* para ver categorías disponibles`,
                    m
                )
            } else if (recetasFiltradas.length === 1) {
                receta = recetasFiltradas[0]
                busquedaEspecifica = true
            } else {
                // Mostrar múltiples resultados
                let lista = `🔍 *Resultados para "${text}":*\n\n`
                recetasFiltradas.forEach((r, i) => {
                    lista += `${i + 1}. ${r.nombre} (${r.categoria}, ${r.dificultad})\n`
                })
                lista += `\n📌 *Usa:* ${usedPrefix}${command} [número] para ver la receta`
                return conn.reply(m.chat, lista, m)
            }
        }
        
        // Mostrar lista de recetas
        if (text === 'lista') {
            let lista = `📋 *LISTA DE RECETAS NAVIDEÑAS* 🎄\n\n`
            recetasNavidenas.forEach((r, i) => {
                lista += `${i + 1}. ${r.nombre} - ${r.categoria} (${r.dificultad}, ${r.tiempo})\n`
            })
            lista += `\n📌 *Usa:* ${usedPrefix}${command} [número] para ver la receta\n`
            lista += `📌 *Ejemplo:* ${usedPrefix}${command} 1`
            return conn.reply(m.chat, lista, m)
        }
        
        // Mostrar categorías
        if (text === 'categorias' || text === 'categorías') {
            const categorias = [...new Set(recetasNavidenas.map(r => r.categoria))]
            let lista = `📊 *CATEGORÍAS DE RECETAS* 🍽️\n\n`
            categorias.forEach((cat, i) => {
                const count = recetasNavidenas.filter(r => r.categoria === cat).length
                lista += `${i + 1}. ${cat} (${count} recetas)\n`
            })
            lista += `\n📌 *Usa:* ${usedPrefix}${command} [categoría] para filtrar`
            return conn.reply(m.chat, lista, m)
        }
        
        // Seleccionar receta aleatoria si no hay búsqueda
        if (!receta) {
            receta = recetasNavidenas[Math.floor(Math.random() * recetasNavidenas.length)]
        }
        
        console.log(`🍽️ Receta seleccionada: ${receta.nombre}`)

        // Crear mensaje de receta mejorado
        let mensajeReceta = `╭━━━━━━━━━━━━━━━━━━━━╮\n`
        mensajeReceta += `│     🎄 *RECETA NAVIDEÑA* 🎅    │\n`
        mensajeReceta += `╰━━━━━━━━━━━━━━━━━━━━╯\n\n`
        
        mensajeReceta += `🍽️ *${receta.nombre}*\n`
        mensajeReceta += `📊 *Categoría:* ${receta.categoria}\n`
        mensajeReceta += `⚡ *Dificultad:* ${receta.dificultad}\n`
        mensajeReceta += `⏰ *Tiempo:* ${receta.tiempo}\n`
        mensajeReceta += `👥 *Porciones:* ${receta.porciones}\n`
        mensajeReceta += `🔥 *Calorías:* ${receta.calorias}\n\n`
        
        mensajeReceta += `📝 *Descripción:*\n${receta.descripcion}\n\n`
        
        mensajeReceta += `🛒 *Ingredientes:*\n`
        receta.ingredientes.forEach(ing => {
            mensajeReceta += `• ${ing}\n`
        })
        
        mensajeReceta += `\n👨‍🍳 *Preparación:*\n`
        receta.preparacion.forEach((paso, index) => {
            mensajeReceta += `${index + 1}. ${paso}\n`
        })
        
        if (receta.tips) {
            mensajeReceta += `\n💡 *Tips del chef:* ${receta.tips}\n`
        }
        
        if (!busquedaEspecifica) {
            mensajeReceta += `\n🎲 *Receta seleccionada aleatoriamente*\n`
        }
        
        mensajeReceta += `\n🎁 *¡Buen provecho y Feliz Navidad!* 🎄\n\n`
        mensajeReceta += `📌 *Comandos útiles:*\n`
        mensajeReceta += `• ${usedPrefix}${command} lista - Ver todas las recetas\n`
        mensajeReceta += `• ${usedPrefix}${command} categorias - Ver por categorías\n`
        mensajeReceta += `• ${usedPrefix}${command} [nombre] - Buscar receta específica`

        // Enviar receta
        await conn.reply(m.chat, mensajeReceta, m)
        
        await m.react('📹')

        // Buscar video tutorial solo si el usuario no pidió lista o categorías
        if (text !== 'lista' && text !== 'categorias' && text !== 'categorías') {
            await conn.reply(m.chat, 
                `📹 *¡Buscando video tutorial!* 🎅\n\n` +
                `🎬 Receta: *${receta.nombre}*\n` +
                `⏳ Los elfos están preparando el video tutorial...`, 
                m
            )

            const search = await yts(receta.busquedaVideo + " receta")
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
                `╭━━━━━━━━━━━━━━━━━━━━╮\n` +
                `│   🎬 *VIDEO TUTORIAL* 📹   │\n` +
                `╰━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                `🎥 *${title}*\n\n` +
                `⏳ *Descargando video tutorial...*\n` +
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
                        fileName: `Tutorial ${receta.nombre}.mp4`,
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
                    caption: `🎬 *Tutorial: ${receta.nombre}*\n\n` +
                            `📊 Categoría: ${receta.categoria}\n` +
                            `⏰ Tiempo: ${receta.tiempo}\n\n` +
                            `🎄 ¡Sigue el video y cocina esta delicia navideña!\n` +
                            `🍽️ ¡Buen provecho y Feliz Navidad! 🎅`
                }, { quoted: fkontak })
            } else {
                // Enviar como video normal
                await conn.sendMessage(m.chat, {
                    video: { url: dl.result.download },
                    mimetype: 'video/mp4',
                    caption: `🎬 *Tutorial: ${receta.nombre}*\n\n` +
                            `📊 Categoría: ${receta.categoria}\n` +
                            `⏰ Tiempo: ${receta.tiempo}\n\n` +
                            `🎄 ¡Sigue el video y cocina esta delicia navideña!\n` +
                            `🍽️ ¡Buen provecho y Feliz Navidad! 🎅`,
                    jpegThumbnail: thumbResized
                }, { quoted: fkontak })
            }

            await m.react('🎁')
        }

    } catch (e) {
        await m.react('❌')
        console.error('❌ Error:', e)
        return conn.reply(m.chat, 
            `⚠️ *¡Error en la cocina navideña!* 🎄\n\n` +
            `Error: ${typeof e === 'string' ? e : e.message}\n\n` +
            `🎅 Intenta de nuevo con *${usedPrefix}${command}*\n` +
            `📋 O usa *${usedPrefix}${command} lista* para ver todas las recetas`, 
            m
        )
    }
}

handler.help = ['receta', 'recetanavi', 'cocinanavi', 'recetas']
handler.tags = ['navidad', 'recetas', 'cocina']
handler.command = ['receta', 'recetanavi', 'cocinanavi', 'recetanavidad', 'recetasnavidad']
handler.register = false
handler.group = false

export default handler
