import { dirname } from "path";
import { fileURLToPath } from "url";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import fluent_ffmpeg from "fluent-ffmpeg";
import { fileTypeFromBuffer } from "file-type";
import webp from "node-webpmux";
import fetch from "node-fetch";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Crear carpeta tmp si no existe
const tmpDir = path.join(__dirname, "../tmp");
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
}

/**
 * Convierte imagen/video a sticker WebP usando FFmpeg
 */
function createStickerWithFFmpeg(img, url) {
    return new Promise(async (resolve, reject) => {
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
                    return reject(new Error('No se pudo descargar la imagen: ' + e.message));
                }
            }

            if (!Buffer.isBuffer(img)) {
                return reject(new Error("El input debe ser un Buffer"));
            }

            // Detectar tipo de archivo
            const type = await fileTypeFromBuffer(img);
            if (!type) {
                return reject(new Error("No se pudo detectar el tipo de archivo"));
            }

            if (!type.mime.includes('image') && !type.mime.includes('video')) {
                return reject(new Error("Solo se permiten imágenes o videos"));
            }

            const tmp = path.join(tmpPath, `${Date.now()}.${type.ext}`);
            const out = tmp + ".webp";

            // Escribir archivo temporal
            await fs.promises.writeFile(tmp, img);

            // Configurar FFmpeg según sea imagen o video
            const isVideo = type.mime.includes('video');
            const ffmpegCmd = fluent_ffmpeg(tmp);

            if (isVideo) {
                ffmpegCmd.inputFormat(type.ext);
            }

            ffmpegCmd
                .on("error", function (err) {
                    console.error("FFmpeg error:", err.message);
                    fs.promises.unlink(tmp).catch(() => {});
                    fs.promises.unlink(out).catch(() => {});
                    reject(new Error('Error al procesar: ' + err.message));
                })
                .on("end", async function () {
                    try {
                        // Limpiar archivo temporal de entrada
                        await fs.promises.unlink(tmp).catch(() => {});

                        if (!fs.existsSync(out)) {
                            throw new Error("El sticker no se generó correctamente");
                        }

                        let resultSticker = await fs.promises.readFile(out);
                        await fs.promises.unlink(out).catch(() => {});

                        // Si es muy grande, comprimir
                        if (resultSticker.length > 1000000) {
                            console.log("Sticker muy grande, comprimiendo...");
                            resultSticker = await compressSticker(img);
                        }

                        resolve(resultSticker);
                    } catch (err) {
                        console.error("Error al procesar resultado:", err.message);
                        fs.promises.unlink(out).catch(() => {});
                        reject(err);
                    }
                })
                .addOutputOptions([
                    `-vcodec`, `libwebp`,
                    `-vf`, `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse`,
                    `-loop`, `0`,
                    `-preset`, `default`,
                    `-an`,
                    `-vsync`, `0`
                ])
                .toFormat("webp")
                .save(out);

        } catch (err) {
            console.error("Error general en createStickerWithFFmpeg:", err.message);
            reject(err);
        }
    });
}

/**
 * Comprime un sticker que es muy grande
 */
function compressSticker(img) {
    return new Promise(async (resolve, reject) => {
        try {
            const tmpPath = path.join(__dirname, "../tmp");
            if (!fs.existsSync(tmpPath)) {
                fs.mkdirSync(tmpPath, { recursive: true });
            }

            if (!Buffer.isBuffer(img)) {
                return reject(new Error("El input debe ser un Buffer"));
            }

            const type = await fileTypeFromBuffer(img);
            if (!type) {
                return reject(new Error("No se pudo detectar el tipo de archivo"));
            }

            const tmp = path.join(tmpPath, `${Date.now()}.${type.ext}`);
            const out = tmp + ".webp";

            await fs.promises.writeFile(tmp, img);

            const isVideo = type.mime.includes('video');
            const ffmpegCmd = fluent_ffmpeg(tmp);

            if (isVideo) {
                ffmpegCmd.inputFormat(type.ext);
            }

            ffmpegCmd
                .on("error", function (err) {
                    console.error("FFmpeg compress error:", err.message);
                    fs.promises.unlink(tmp).catch(() => {});
                    fs.promises.unlink(out).catch(() => {});
                    reject(err);
                })
                .on("end", async function () {
                    try {
                        await fs.promises.unlink(tmp).catch(() => {});

                        if (!fs.existsSync(out)) {
                            throw new Error("El archivo comprimido no se generó");
                        }

                        const result = await fs.promises.readFile(out);
                        await fs.promises.unlink(out).catch(() => {});
                        resolve(result);
                    } catch (err) {
                        console.error("Error al leer comprimido:", err.message);
                        fs.promises.unlink(out).catch(() => {});
                        reject(err);
                    }
                })
                .addOutputOptions([
                    `-vcodec`, `libwebp`,
                    `-vf`, `scale='min(224,iw)':min'(224,ih)':force_original_aspect_ratio=decrease,fps=10,pad=224:224:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse`,
                    `-loop`, `0`,
                    `-preset`, `default`,
                    `-an`,
                    `-vsync`, `0`,
                    `-quality`, `50`
                ])
                .toFormat("webp")
                .save(out);
        } catch (err) {
            console.error("Error general en compress:", err.message);
            reject(err);
        }
    });
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
        console.log('Creando sticker con FFmpeg...');
        
        // Crear el sticker base
        let stickerBuffer = await createStickerWithFFmpeg(img, url);

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
    ffmpeg: true,
    ffprobe: true,
    ffmpegWebp: true,
    convert: false,
    magick: false,
    gm: false,
    find: false,
};

export { 
    sticker, 
    createStickerWithFFmpeg as sticker6,
    addExif, 
    support 
};