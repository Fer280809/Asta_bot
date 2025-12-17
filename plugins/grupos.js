let handler = async (m, { conn }) => {
    // Lista de links: hasta 10
    const grupos = [
        { link: "https://chat.whatsapp.com/JOqvrvQNrIY7yrDTVN1J4j" },
        { link: "https://chat.whatsapp.com/GR99nLM3meCIhw9UY7EUMm" },
        { link: "https://chat.whatsapp.com/FW4JA6D0NQU79KVPpTrW19" },
        { link: "https://chat.whatsapp.com/BE381ctvpcbLs5vQhehR5v" },
        { link: "https://chat.whatsapp.com/KKwDZn5vDAE6MhZFAcVQeO" },
        { link: "https://chat.whatsapp.com/Gc5e3kDQA1iD1nGeMe1JcC" },
        { link: "https://chat.whatsapp.com/FhumMhhjTcuHNRZAAlntus" },
        { link: "https://chat.whatsapp.com/BVqd5Fz3H5q85QuLUiBpEs" },
        { link: "https://chat.whatsapp.com/FDEc5AtSe0G3SC6fsJmd5m" },
        { link: "https://chat.whatsapp.com/BfCKeP10yZZ9ancsGy1Eh9" }
    ];

    let mensaje = `╔══❄️ VILLAS DE ${conn.user.name.toUpperCase()} ❄️══╗\n\n`;
    
    for (let i = 0; i < grupos.length; i++) {
        const g = grupos[i];
        if (!g.link) continue; 
        
        try {
            const code = g.link.split('/').pop();
            const info = await conn.groupGetInviteInfo(code);
            
            const nombre = info.subject || 'Sin nombre';
            const participantes = info.size || 0;
            const descripcion = info.desc || '';
            
            mensaje += `│ 🏰 *${i + 1}. ${nombre.toUpperCase()}*\n`;
            mensaje += `│ 🔗 *Pase:* ${g.link}\n`;
            mensaje += `│ 👥 *Habitantes:* ${participantes}\n`;
            if (descripcion) mensaje += `│ 📝 *Nota:* ${descripcion.substring(0, 50)}${descripcion.length > 50 ? '...' : ''}\n`;
            mensaje += `────────────────────────\n`;
            
        } catch (e) {
            mensaje += `│ ❄️ ${i + 1}. Entrada Restringida\n`;
            mensaje += `│ 🔗 ${g.link}\n`;
            mensaje += `────────────────────────\n`;
        }
    }
    
    mensaje += `╚════════════════════════════════╝\n🎁 ¡Únete y vive la magia con nosotros!`;
    
    await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m });
}

handler.tags = ['info'];
handler.help = ['grupos'];
handler.command = ['grupos', 'links', 'comunidades'];
handler.group = false;

export default handler;
