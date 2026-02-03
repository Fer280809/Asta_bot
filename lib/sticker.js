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

function sticker6(img, url) {
    return new Promise(async (resolve, reject) => {
        try {
            // Asegurar que tmp existe
            const tmpPath = path.join(__dirname, "../tmp");
            if (!fs.existsSync(tmpPath)) {
                fs.mkdirSync(tmpPath, { recursive: true });
            }
            
            if (url) {
                const res = await fetch(url);
                if (res.status !== 200) throw await res.text();
                img = await res.buffer();
            }
            
            if (!Buffer.isBuffer(img)) {
                return reject(new Error("El input debe ser un Buffer"));
            }
            
            const type = (await fileTypeFromBuffer(img)) || {
                mime: "application/octet-stream",
                ext: "bin",
            };
            
            if (type.ext == "bin") return reject(new Error("Formato no soportado"));
            
            const tmp = path.join(tmpPath, `${+new Date()}.${type.ext}`);
            const out = tmp + ".webp";
            
            await fs.promises.writeFile(tmp, img);
            
            const Fffmpeg = /video/i.test(type.mime)
                ? fluent_ffmpeg(tmp).inputFormat(type.ext)
                : fluent_ffmpeg(tmp).input(tmp);
                
            Fffmpeg.on("error", function (err) {
                console.error("FFmpeg error:", err);
                fs.promises.unlink(tmp).catch(() => {});
                fs.promises.unlink(out).catch(() => {});
                reject(err);
            })
            .on("end", async function () {
                try {
                    await fs.promises.unlink(tmp);
                    
                    if (!fs.existsSync(out)) {
                        throw new Error("El archivo de salida no se generó");
                    }
                    
                    let resultSticker = await fs.promises.readFile(out);
                    await fs.promises.unlink(out);
                    
                    if (resultSticker.length > 1000000) {
                        console.log("Sticker muy grande, comprimiendo...");
                        resultSticker = await sticker6_compress(img, null);
                    }
                    
                    resolve(resultSticker);
                } catch (err) {
                    console.error("Error al leer resultado:", err);
                    fs.promises.unlink(out).catch(() => {});
                    reject(err);
                }
            })
            .addOutputOptions([
                `-vcodec`,
                `libwebp`,
                `-vf`,
                `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`,
            ])
            .toFormat("webp")
            .save(out);
        } catch (err) {
            console.error("Error general en sticker6:", err);
            reject(err);
        }
    });
}

function sticker6_compress(img, url) {
    return new Promise(async (resolve, reject) => {
        try {
            // Asegurar que tmp existe
            const tmpPath = path.join(__dirname, "../tmp");
            if (!fs.existsSync(tmpPath)) {
                fs.mkdirSync(tmpPath, { recursive: true });
            }
            
            if (url) {
                const res = await fetch(url);
                if (res.status !== 200) throw await res.text();
                img = await res.buffer();
            }
            
            if (!Buffer.isBuffer(img)) {
                return reject(new Error("El input debe ser un Buffer"));
            }
            
            const type = (await fileTypeFromBuffer(img)) || {
                mime: "application/octet-stream",
                ext: "bin",
            };
            
            if (type.ext == "bin") return reject(new Error("Formato no soportado"));
            
            const tmp = path.join(tmpPath, `${+new Date()}.${type.ext}`);
            const out = tmp + ".webp";
            
            await fs.promises.writeFile(tmp, img);
            
            const Fffmpeg = /video/i.test(type.mime)
                ? fluent_ffmpeg(tmp).inputFormat(type.ext)
                : fluent_ffmpeg(tmp).input(tmp);
                
            Fffmpeg.on("error", function (err) {
                console.error("FFmpeg compress error:", err);
                fs.promises.unlink(tmp).catch(() => {});
                fs.promises.unlink(out).catch(() => {});
                reject(err);
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
                    console.error("Error al leer comprimido:", err);
                    fs.promises.unlink(out).catch(() => {});
                    reject(err);
                }
            })
            .addOutputOptions([
                `-vcodec`,
                `libwebp`,
                `-vf`,
                `scale='min(224,iw)':min'(224,ih)':force_original_aspect_ratio=decrease,fps=15, pad=224:224:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`,
            ])
            .toFormat("webp")
            .save(out);
        } catch (err) {
            console.error("Error general en compress:", err);
            reject(err);
        }
    });
}

async function sticker5(img, url, packname, author, categories = [""], extra = {}) {
    try {
        // Asegurar que tmp existe
        const tmpPath = path.join(__dirname, "../tmp");
        if (!fs.existsSync(tmpPath)) {
            fs.mkdirSync(tmpPath, { recursive: true });
        }
        
        const { Sticker } = await import("wa-sticker-formatter");
        
        const buffer = await new Sticker(img ? img : url, {
            pack: packname,
            author: author,
            type: 'default',
            quality: 50
        }).toBuffer();
        
        return buffer;
    } catch (err) {
        console.error("Error en sticker5:", err);
        throw err;
    }
}

async function addExif(webpSticker, packname, author, categories = [""], extra = {}) {
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
}

async function sticker(img, url, ...args) {
    let lastError;
    let stiker;
    
    for (const func of [
        global.support?.ffmpeg && sticker6,
        sticker5
    ].filter((f) => f)) {
        try {
            console.log(`Método en ejecución: ${func.name}`);
            stiker = await func(img, url, ...args);
            
            if (!stiker || stiker.length === 0) {
                throw new Error("Sticker vacío");
            }
            
            if (Buffer.isBuffer(stiker)) {
                const bufferStr = stiker.toString('utf8', 0, Math.min(100, stiker.length));
                if (bufferStr.includes("html")) continue;
            }
            
            if (Buffer.isBuffer(stiker) && stiker.toString('hex', 0, 4) === '52494646') {
                try {
                    return await addExif(stiker, ...args);
                } catch (e) {
                    console.error("Error añadiendo EXIF:", e);
                    return stiker;
                }
            }
            
            return stiker;
        } catch (err) {
            lastError = err;
            console.error(`Error en ${func.name}:`, err.message);
            continue;
        }
    }
    
    console.error("Error final:", lastError);
    throw lastError || new Error("No se pudo crear el sticker");
}

const support = {
    ffmpeg: true,
    ffprobe: true,
    ffmpegWebp: true,
    convert: true,
    magick: false,
    gm: false,
    find: false,
};

export { sticker, sticker6, sticker5, addExif, support };
