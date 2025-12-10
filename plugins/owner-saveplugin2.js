import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, args, text, isOwner }) => {
    try {
        // Solo owners
        if (!isOwner) return m.reply('💠 Acceso denegado: Solo los *creadores* pueden usar este comando.');

        if (!args[0]) return m.reply('💡 Debes indicar el nombre del plugin.');

        // Nombre del plugin
        let nombre = args[0];
        if (!nombre.endsWith('.js')) nombre += '.js';

        // Número de carpeta
        let numeroCarpeta = args[1] ? args[1] : '1'; // por defecto 1 = plugins
        const carpetas = {
            '1': 'plugins',
            '2': 'plugins2',
            '3': 'plugins3',
            '4': 'plugins4',
            '5': 'plugins5'
        };
        let carpeta = carpetas[numeroCarpeta];
        if (!carpeta) return m.reply(`💡 Carpeta inválida. Elige un número del 1 al 5.`);

        let ruta = path.join('./', carpeta, nombre);

        let buffer;

        // 1️⃣ Si es respuesta a un archivo
        if (m.quoted && m.quoted.download) {
            buffer = await m.quoted.download();

        // 2️⃣ Si el usuario pone código directo
        } else if (text && text.trim() !== '') {
            // Excluir el primer argumento (nombre) y segundo (número de carpeta)
            let codigo = args.slice(2).join(' ');
            if (!codigo) return m.reply('💡 No se detectó código para guardar.');
            buffer = Buffer.from(codigo, 'utf-8');

        } else {
            return m.reply('💡 Debes responder a un archivo o escribir el código después del comando.');
        }

        // Guardar el archivo
        fs.writeFileSync(ruta, buffer);

        m.reply(`✅ Plugin subido correctamente a la carpeta *${carpeta}* con el nombre *${nombre}*`);
    } catch (err) {
        console.error(err);
        m.reply(`❌ Ocurrió un error al subir el plugin: ${err.message}`);
    }
};

handler.help = ['subirplugin <nombre> <numero de carpeta>'];
handler.tags = ['owner'];
handler.command = ['subirplugin','uploadplugin', 'saveplugin', 'svp'];
handler.rowner = true; // solo owners

export default handler;
