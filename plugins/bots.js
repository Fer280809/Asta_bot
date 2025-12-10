import ws from "ws";

const handler = async (m, { conn }) => {
    try {
        // Todos los bots conectados
        const bots = [
            global.conn,
            ...global.conns.filter(
                (c) => c.user && c.ws.socket && c.ws.socket.readyState !== ws.CLOSED
            )
        ];

        // Función para convertir ms a formato legible
        const convertirMs = (ms) => {
            const seg = Math.floor(ms / 1000);
            const min = Math.floor(seg / 60);
            const hrs = Math.floor(min / 60);
            const dias = Math.floor(hrs / 24);
            const segR = seg % 60;
            const minR = min % 60;
            const hrsR = hrs % 24;
            let res = "";
            if (dias) res += `${dias} días, `;
            if (hrsR) res += `${hrsR} horas, `;
            if (minR) res += `${minR} minutos, `;
            if (segR) res += `${segR} segundos`;
            return res.trim();
        };

        // Construir mensaje
        let mensaje = "╔══❖ BOTS CONECTADOS ❖══╗\n";

        bots.forEach((b, i) => {
            const isMain = b === global.conn;
            const uptime = b.uptime ? convertirMs(Date.now() - b.uptime) : "Activo desde ahora";
            const num = b.user?.id.split("@")[0] || "Desconocido";
            const nombre = b.user?.name || "Bot";
            const tipo = isMain ? "Principal" : "Sub-Bot";

            mensaje += `│ ${i + 1}. ${nombre}\n`;
            mensaje += `│ Número: ${num}\n`;
            mensaje += `│ Tipo: ${tipo}\n`;
            mensaje += `│ Tiempo activo: ${uptime}\n`;
            mensaje += `────────────────────────\n`;
        });

        mensaje += "╚══════════════════════╝";

        await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m });
    } catch (e) {
        m.reply(`⚠️ Error al listar los bots:\n${e.message}`);
    }
};

handler.tags = ["serbot"];
handler.help = ["allbots"];
handler.command = ["allbots", "botslist", "conectados"];
handler.group = false;

export default handler;
