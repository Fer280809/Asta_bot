import fetch from 'node-fetch';

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args.length) {
        return conn.reply(m.chat, `🔍 *Por favor escribe un mod a buscar.*\nEjemplo: ${usedPrefix}${command} armas`, m, rcanal);
    }

    const query = args.join(' '); 
    await m.react('🕓');
    
    try {
        const response = await fetch(`https://api.dorratz.com/v2/mc-java?q=${query}`);
        const data = await response.json();
        
        if (!data || !data.addons || data.addons.length === 0) {
            return conn.reply(m.chat, `🚫 No se encontraron mods para "${query}".`, m);
        }

        let txt = '🛠️  R E S U L T A D O S  -  M O D S\n\n';
        
        data.addons.forEach(addon => {
            txt += `✨ *Título*: ${addon.title}\n`;
            txt += `📜 *Descripción*: ${addon.description}\n`;
            txt += `🔗 *Enlace*: ${addon.link}\n`;
            txt += `🖼️ *Imagen*: ${addon.image}\n\n`;
        });

        await conn.reply(m.chat, txt.trim(), m);
        await m.react('✅');
    } catch (error) {
        console.error(error);
        await m.react('✖️');
        conn.reply(m.chat, '❌ Hubo un error al procesar la solicitud.', m);
    }
};

handler.help = ['mods *<query>*'];
handler.tags = ['info'];
handler.command = ['mods', 'mcmods'];
handler.register = true;

export default handler;
