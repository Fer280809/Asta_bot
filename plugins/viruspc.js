import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        // Ruta del archivo
        const fileName = 'viruz_pc.txt.plain' // nombre del archivo en tu carpeta archivos
        const filePath = path.join('./archivos', fileName)

        // Verificar que el archivo exista
        if (!fs.existsSync(filePath)) {
            return conn.reply(m.chat, `❌ El archivo "${fileName}" no se encuentra en la carpeta "archivos".`, m)
        }

        // Descripción del "virus"
        const descripcion = '⚠️ Virus PC simulado.\nEste archivo es solo para demostración, no daña tu computadora.'

        // Enviar el archivo junto con la descripción
        await conn.sendMessage(m.chat, {
            document: { url: filePath },
            mimetype: 'text/plain',
            fileName: fileName,
            caption: descripcion
        }, { quoted: m })

    } catch (err) {
        console.error(err)
        conn.reply(m.chat, `❌ Ocurrió un error al enviar el archivo.`, m)
    }
}

handler.help = ['virus']
handler.tags = ['fun']
handler.command = ['viruspc', 'virusfake']

export default handler
