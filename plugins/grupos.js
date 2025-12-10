let handler = async (m, { conn }) => {
    // Lista de links: hasta 10
    const grupos = [
        { link: "https://chat.whatsapp.com/JOqvrvQNrIY7yrDTVN1J4j" }, // Grupo 1
        { link: "https://chat.whatsapp.com/GR99nLM3meCIhw9UY7EUMm" }, // Grupo 2
        { link: "https://chat.whatsapp.com/FW4JA6D0NQU79KVPpTrW19" }, // Grupo 3
        { link: "https://chat.whatsapp.com/BE381ctvpcbLs5vQhehR5v" }, // Grupo 4
        { link: "https://chat.whatsapp.com/KKwDZn5vDAE6MhZFAcVQeO" }, // Grupo 5
        { link: "https://chat.whatsapp.com/Gc5e3kDQA1iD1nGeMe1JcC" }, // Grupo 6
        { link: "https://chat.whatsapp.com/FhumMhhjTcuHNRZAAlntus" }, // Grupo 7
        { link: "https://chat.whatsapp.com/BVqd5Fz3H5q85QuLUiBpEs" }, // Grupo 8
        { link: "https://chat.whatsapp.com/FDEc5AtSe0G3SC6fsJmd5m" }, // Grupo 9
        { link: "https://chat.whatsapp.com/BfCKeP10yZZ9ancsGy1Eh9" }  // Grupo 10
    ];

    let mensaje = `╔══❖ COMUNIDADES DE ${conn.user.name.toUpperCase()} ❖══╗\n`;
    
    // Iteramos los links y sacamos info
    for (let i = 0; i < grupos.length; i++) {
        const g = grupos[i];
        if (!g.link) continue; // Ignorar si no hay link
        
        try {
            // Extraer el código del link
            const code = g.link.split('/').pop();
            
            // Obtener metadata del grupo
            const info = await conn.groupGetInviteInfo(code);
            
            const nombre = info.subject || 'Sin nombre';
            const participantes = info.size || 0;
            const descripcion = info.desc || '';
            
            mensaje += `│ ${i + 1}. ${nombre}\n`;
            mensaje += `│ 🔗 ${g.link}\n`;
            mensaje += `│ 👥 ${participantes} miembros\n`;
            if (descripcion) mensaje += `│ 📝 ${descripcion.substring(0, 50)}${descripcion.length > 50 ? '...' : ''}\n`;
            mensaje += `────────────────────────\n`;
            
        } catch (e) {
            console.log(`❌ Error con link: ${g.link}`, e.message);
            mensaje += `│ ${i + 1}. Link inválido o privado\n`;
            mensaje += `│ 🔗 ${g.link}\n`;
            mensaje += `────────────────────────\n`;
        }
    }
    
    mensaje += `╚════════════════════════════════╝\n📌 ¡Únete a nuestras comunidades!`;
    
    await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m });
}

handler.tags = ['info'];
handler.help = ['grupos'];
handler.command = ['grupos', 'links', 'comunidades'];
handler.group = false;

export default handler;