import fs from 'fs';
import path from 'path';

const handler = async (m, { text, usedPrefix, command, conn }) => {
    try {
        // Obtener imágenes de mensajes citados/etiquetados
        let quotedImages = [];
        
        if (m.quoted) {
            try {
                const quotedMsg = m.quoted;
                if (quotedMsg.mtype === 'imageMessage') {
                    const media = await quotedMsg.download();
                    const uploadedImg = await conn.uploadFile(media);
                    quotedImages.push(uploadedImg.url);
                }
            } catch (e) {
                console.log('Error al obtener imagen citada:', e);
            }
        }

        const args = text.split(',').map(arg => arg.trim());

        if (args.length < 4) {
            return m.reply(`❀ *Uso del comando:*\n\n✧ *Opción 1:* Etiqueta 1-3 imágenes y escribe:\n${usedPrefix}${command} Nombre, Género, Valor, Origen\n\n✧ *Opción 2:* Sin etiquetar imágenes:\n${usedPrefix}${command} Nombre, Género, Valor, Origen, URL1, URL2, URL3\n\n✧ *Ejemplo:*\n${usedPrefix}${command} Goku, Hombre, 24820, Dragon Ball`);
        }

        let name, gender, value, source, img1, img2, img3;
        
        // Si hay imágenes etiquetadas, usarlas
        if (quotedImages.length > 0) {
            [name, gender, value, source] = args;
            img1 = quotedImages[0];
            img2 = quotedImages[1] || quotedImages[0];
            img3 = quotedImages[2] || quotedImages[0];
        } else {
            // Modo tradicional con URLs
            if (args.length < 7) {
                return m.reply(`❀ Por favor proporciona las 3 URLs de imágenes o etiqueta imágenes.\n\n✧ *Formato completo:*\n${usedPrefix}${command} Nombre, Género, Valor, Origen, URL1, URL2, URL3`);
            }
            [name, gender, value, source, img1, img2, img3] = args;
            
            if (!img1 || !img2 || !img3) {
                return m.reply('✧ Por favor, proporciona las 3 URLs de imágenes.');
            }
            
            if (!img1.startsWith('http') || !img2.startsWith('http') || !img3.startsWith('http')) {
                return m.reply('✧ Las URLs deben comenzar con http:// o https://');
            }
        }

        // Validar datos
        if (!name || !gender || !value || !source) {
            return m.reply('✧ Faltan datos. Asegúrate de incluir: Nombre, Género, Valor y Origen.');
        }

        const dbPath = path.join(process.cwd(), 'lib', 'characters.json');

        // Crear directorio si no existe
        const libDir = path.join(process.cwd(), 'lib');
        if (!fs.existsSync(libDir)) {
            fs.mkdirSync(libDir, { recursive: true });
        }

        let characters = [];
        if (fs.existsSync(dbPath)) {
            try {
                const fileContent = fs.readFileSync(dbPath, 'utf-8');
                characters = JSON.parse(fileContent);
                if (!Array.isArray(characters)) {
                    characters = [];
                }
            } catch (e) {
                console.log('Error leyendo characters.json:', e);
                characters = [];
            }
        }

        // Generar ID único
        const newId = characters.length > 0 
            ? (Math.max(...characters.map(c => parseInt(c.id) || 0)) + 1).toString()
            : "1";

        const characterData = {
            id: newId,
            name: name,
            gender: gender,
            value: parseInt(value) || 0,
            source: source,
            img: [img1, img2, img3],
            vid: [],
            user: m.sender.replace(/[^0-9]/g, ''),
            status: "Reclamado",
            votes: 0
        };

        characters.push(characterData);
        fs.writeFileSync(dbPath, JSON.stringify(characters, null, 2), 'utf-8');

        // Enviar confirmación al usuario con las 3 fotos
        const confirmMsg = `╭━━━━━━━━━⬣
┃ ❀ *Waifu Añadido* ❀
┃
┃ ✧ *ID:* ${newId}
┃ ✧ *Nombre:* ${name}
┃ ✧ *Género:* ${gender}
┃ ✧ *Valor:* ${value}
┃ ✧ *Origen:* ${source}
┃ ✧ *Estado:* Reclamado
┃
┃ ✅ *Guardado en /lib/characters.json*
╰━━━━━━━━━⬣`;

        await m.reply(confirmMsg);
        
        // Enviar las 3 fotos al usuario como confirmación
        for (let i = 0; i < 3; i++) {
            await conn.sendMessage(m.chat, { 
                image: { url: characterData.img[i] },
                caption: `📸 Imagen ${i + 1} de *${name}*`
            });
        }

        // Notificación al staff
        try {
            const tagNumber = '5214181450063@s.whatsapp.net';
            const notificationText = `╭━━━━━━━━━⬣
┃ ❀ *Nuevo Waifu Añadido* ❀
┃
┃ ✧ *ID:* ${newId}
┃ ✧ *Nombre:* ${name}
┃ ✧ *Género:* ${gender}
┃ ✧ *Valor:* ${value}
┃ ✧ *Origen:* ${source}
┃ ✧ *Estado:* Reclamado
┃
┃ 📤 *Enviado por:*
┃ wa.me/${m.sender.replace(/[^0-9]/g, '')}
╰━━━━━━━━━⬣`;

            await conn.sendMessage(tagNumber, { text: notificationText });
            
            // Enviar las 3 imágenes
            for (let i = 0; i < 3; i++) {
                await conn.sendMessage(tagNumber, { 
                    image: { url: characterData.img[i] },
                    caption: `📸 Imagen ${i + 1} de *${name}*`
                });
            }
        } catch (e) {
            console.log('Error enviando notificación al staff:', e);
        }

    } catch (error) {
        console.error('Error en addcharacter:', error);
        m.reply(`❌ Ocurrió un error al agregar el personaje:\n${error.message}`);
    }
};

handler.help = ['addcharacter', 'addrw'];
handler.tags = ['owner'];
handler.command = ['addcharacter', 'addrw'];
handler.prems = true;

export default handler;