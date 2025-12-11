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

// Función principal sticker6 - usa FFmpeg para convertir a WebP
function sticker6(img, url) {
    return new Promise(async (resolve, reject) => {
        try {
            // Asegurar que tmp existe
            const tmpPath = path.join(__dirname, "../tmp");
            if (!fs.existsSync(tmpPath)) {
                fs.mkdirSync(tmpPath, { recursive: true });
            }

            let buffer = img;
            
            // Si se proporciona URL, descargar la imagen
            if (url && !img) {
                try {
                    const res = await fetch(url);
                    if (res.status !== 200) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
                    buffer = await res.buffer();
                } catch (err) {
                    return reject(new Error(`Error descargando imagen: ${err.message}`));
                }
            }

            if (!buffer || !Buffer.isBuffer(buffer)) {
                return reject(new Error("El input debe ser un Buffer válido"));
            }

            const type = (await fileTypeFromBuffer(buffer)) || {
                mime: "application/octet-stream",
                ext: "bin",
            };

            if (type.ext === "bin") return reject(new Error("Formato de archivo no soportado"));

            const tmp = path.join(tmpPath, `${Date.now()}.${type.ext}`);
            const out = tmp + ".webp";

            await fs.promises.writeFile(tmp, buffer);

            const Fffmpeg = /video/i.test(type.mime)
                ? fluent_ffmpeg(tmp).inputFormat(type.ext)
                : fluent_ffmpeg(tmp).input(tmp);

            Fffmpeg.on("error", function (err) {
                console.error("FFmpeg error:", err.message);
                fs.promises.unlink(tmp).catch(() => {});
                fs.promises.unlink(out).catch(() => {});
                reject(new Error(`Error FFmpeg: ${err.message}`));
            })
            .on("end", async function () {
                try {
                    await fs.promises.unlink(tmp);

                    if (!fs.existsSync(out)) {
                        throw new Error("El archivo de salida no se generó");
                    }

                    let resultSticker = await fs.promises.readFile(out);
                    await fs.promises.unlink(out);

                    // Si el sticker es muy grande (>1MB), comprimirlo
                    if (resultSticker.length > 1000000) {
                        console.log("Sticker muy grande, comprimiendo...");
                        resultSticker = await sticker6_compress(buffer, null);
                    }

                    resolve(resultSticker);
                } catch (err) {
                    console.error("Error al leer resultado:", err.message);
                    fs.promises.unlink(out).catch(() => {});
                    reject(err);
                }
            })
            .addOutputOptions([
                `-vcodec`, `libwebp`,
                `-vf`, `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`
            ])
            .toFormat("webp")
            .save(out);
        } catch (err) {
            console.error("Error general en sticker6:", err.message);
            reject(err);
        }
    });
}

// Función para comprimir stickers grandes
function sticker6_compress(img, url) {
    return new Promise(async (resolve, reject) => {
        try {
            const tmpPath = path.join(__dirname, "../tmp");
            if (!fs.existsSync(tmpPath)) {
                fs.mkdirSync(tmpPath, { recursive: true });
            }

            let buffer = img;
            
            if (url && !img) {
                try {
                    const res = await fetch(url);
                    if (res.status !== 200) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
                    buffer = await res.buffer();
                } catch (err) {
                    return reject(new Error(`Error descargando imagen: ${err.message}`));
                }
            }

            if (!buffer || !Buffer.isBuffer(buffer)) {
                return reject(new Error("El input debe ser un Buffer válido"));
            }

            const type = (await fileTypeFromBuffer(buffer)) || {
                mime: "application/octet-stream",
                ext: "bin",
            };

            if (type.ext === "bin") return reject(new Error("Formato de archivo no soportado"));

            const tmp = path.join(tmpPath, `${Date.now()}.${type.ext}`);
            const out = tmp + ".webp";

            await fs.promises.writeFile(tmp, buffer);

            const Fffmpeg = /video/i.test(type.mime)
                ? fluent_ffmpeg(tmp).inputFormat(type.ext)
                : fluent_ffmpeg(tmp).input(tmp);

            Fffmpeg.on("error", function (err) {
                console.error("FFmpeg compress error:", err.message);
                fs.promises.unlink(tmp).catch(() => {});
                fs.promises.unlink(out).catch(() => {});
                reject(new Error(`Error FFmpeg: ${err.message}`));
            })
            .on("end", async function () {
                try {
                    await fs.promises.unlink(tmp);

                    if (!fs.existsSync(out)) {
                        throw new Error("El archivo comprimido no se generó");
                    }

                    const result = await fs.promises.readFile(out);
                    await fs.promises.unlink(out);
                    resolve(result);
                } catch (err) {
                    console.error("Error al leer comprimido:", err.message);
                    fs.promises.unlink(out).catch(() => {});
                    reject(err);
                }
            })
            .addOutputOptions([
                `-vcodec`, `libwebp`,
                `-vf`, `scale='min(224,iw)':min'(224,ih)':force_original_aspect_ratio=decrease,fps=15, pad=224:224:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`
            ])
            .toFormat("webp")
            .save(out);
        } catch (err) {
            console.error("Error general en compress:", err.message);
            reject(err);
        }
    });
}

// Función sticker5 alternativa sin wa-sticker-formatter
async function sticker5(img, url, packname, author, categories = [""], extra = {}) {
    try {
        let buffer = img;
        
        // Si tenemos URL, descargarla
        if (url && !img) {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            buffer = await response.buffer();
        }

        if (!buffer || !Buffer.isBuffer(buffer)) {
            throw new Error("No se pudo obtener el buffer de la imagen");
        }

        // Usar sticker6 para convertir a webp
        const webpBuffer = await sticker6(buffer, null);
        
        // Añadir metadata EXIF
        return await addExif(webpBuffer, packname, author, categories, extra);
    } catch (err) {
        console.error("Error en sticker5:", err.message);
        throw err;
    }
}

// Función para añadir metadata EXIF a stickers
async function addExif(webpSticker, packname, author, categories = [""], extra = {}) {
    try {
        const img = new webp.Image();
        const stickerPackId = crypto.randomBytes(32).toString("hex");
        const json = {
            "sticker-pack-id": stickerPackId,
            "sticker-pack-name": packname || "Sticker Pack",
            "sticker-pack-publisher": author || "Autor",
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
        console.error("Error en addExif:", err.message);
        // Si falla, devolver el sticker sin EXIF
        return webpSticker;
    }
}

// Función principal sticker que intenta múltiples métodos
async function sticker(img, url, ...args) {
    let lastError;
    
    // Métodos disponibles, en orden de preferencia
    const methods = [
        { name: 'sticker6', func: sticker6, requiresFfmpeg: true },
        { name: 'sticker5', func: sticker5 }
    ];
    
    for (const method of methods) {
        try {
            console.log(`Intentando método: ${method.name}`);
            
            let result;
            
            if (method.name === 'sticker6') {
                // Para sticker6, podemos pasar img o url
                result = await method.func(img, url);
                // Si tenemos args (packname, author), añadir EXIF
                if (args.length >= 2 && result) {
                    result = await addExif(result, args[0], args[1], args[2] || [""], args[3] || {});
                }
            } else if (method.name === 'sticker5') {
                // sticker5 ya maneja todo
                result = await method.func(img, url, ...args);
            }
            
            if (result && result.length > 0) {
                console.log(`Método ${method.name} exitoso, tamaño: ${result.length} bytes`);
                return result;
            }
            
            throw new Error("Resultado vacío");
            
        } catch (err) {
            lastError = err;
            console.error(`Error en método ${method.name}:`, err.message);
            continue;
        }
    }
    
    throw lastError || new Error("No se pudo crear el sticker con ningún método");
}

// Configuración de soporte
const support = {
    ffmpeg: true,
    ffprobe: true,
    ffmpegWebp: true,
    convert: true,
    magick: false,
    gm: false,
    find: false,
};

// Exportar todas las funciones
export { sticker, sticker6, sticker6_compress as sticker6_compress, sticker5, addExif, support };