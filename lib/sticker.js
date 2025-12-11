import { dirname } from "path";
import { fileURLToPath } from "url";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { fileTypeFromBuffer } from "file-type";
import webp from "node-webpmux";
import fetch from "node-fetch";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Crear carpeta tmp si no existe
const tmpDir = path.join(__dirname, "../tmp");
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
}

/**
 * Convierte imagen a sticker WebP usando Sharp
 */
async function createStickerWithSharp(img, url) {
    try {
        const tmpPath = path.join(__dirname, "../tmp");
        if (!fs.existsSync(tmpPath)) {
            fs.mkdirSync(tmpPath, { recursive: true });
        }

        // Descargar desde URL si se proporciona
        if (url) {
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                img = await res.buffer();
            } catch (e) {
                throw new Error('No se pudo descargar la imagen: ' + e.message);
            }
        }

        if (!Buffer.isBuffer(img)) {
            throw new Error("El input debe ser un Buffer");
        }

        // Detectar tipo de archivo
        const type = await fileTypeFromBuffer(img);
        if (!type) {
            throw new Error("No se pudo detectar el tipo de archivo");
        }

        // Solo imágenes con Sharp
        if (!type.mime.includes('image')) {
            throw new Error("Sharp solo soporta imágenes. Para videos usa FFmpeg");
        }

        // Convertir a WebP con Sharp
        const stickerBuffer = await sharp(img)
            .resize(512, 512, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .webp({ quality: 80 })
            .toBuffer();

        return stickerBuffer;

    } catch (err) {
        console.error("Error en createStickerWithSharp:", err.message);
        throw err;
    }
}

/**
 * Agrega metadatos EXIF al sticker
 */
async function addExif(webpSticker, packname = 'Sticker', author = 'Bot', categories = [""], extra = {}) {
    try {
        const img = new webp.Image();
        const stickerPackId = crypto.randomBytes(32).toString("hex");
        
        const json = {
            "sticker-pack-id": stickerPackId,
            "sticker-pack-name": packname,
            "sticker-pack-publisher": author,
            emojis: categories,
            ...extra,
        };
        
        const exifAttr = Buffer.from([
            0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
            0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
        ]);
        
        const jsonBuffer = Buffer.from(JSON.stringify(json), "utf8");
        const exif = Buffer.concat([exifAttr, jsonBuffer]);
        exif.writeUIntLE(jsonBuffer.length, 14, 4);
        
        await img.load(webpSticker);
        img.exif = exif;
        
        return await img.save(null);
    } catch (err) {
        console.error("Error añadiendo EXIF:", err.message);
        // Si falla, devolver el sticker sin EXIF
        return webpSticker;
    }
}

/**
 * Función principal para crear stickers
 */
async function sticker(img, url, packname = 'Sticker', author = 'Bot', categories = [""], extra = {}) {
    try {
        console.log('Creando sticker con Sharp...');
        
        // Crear el sticker base
        let stickerBuffer = await createStickerWithSharp(img, url);

        if (!stickerBuffer || stickerBuffer.length === 0) {
            throw new Error("El sticker generado está vacío");
        }

        // Validar que sea un archivo WEBP válido (header RIFF)
        const header = stickerBuffer.toString('hex', 0, 4);
        if (header !== '52494646') {
            throw new Error("El archivo generado no es un WebP válido");
        }

        // Agregar metadatos EXIF
        try {
            stickerBuffer = await addExif(stickerBuffer, packname, author, categories, extra);
        } catch (e) {
            console.log("No se pudieron agregar metadatos, continuando sin ellos");
        }

        return stickerBuffer;

    } catch (err) {
        console.error("Error al crear sticker:", err.message);
        throw err;
    }
}

const support = {
    ffmpeg: false,
    ffprobe: false,
    ffmpegWebp: false,
    convert: false,
    magick: false,
    gm: false,
    find: false,
    sharp: true
};

export { 
    sticker,
    createStickerWithSharp as sticker6,
    addExif, 
    support 
};