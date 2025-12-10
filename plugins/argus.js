import moment from 'moment-timezone'

let handler = async (m, { conn, args }) => {
    let userId = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
    let user = global.db.data.users[userId]
    let name = conn.getName(userId)
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)
    let totalreg = Object.keys(global.db.data.users).length
    let totalCommands = Object.values(global.plugins).filter((v) => v.help && v.tags).length
    
    // URL de la imagen del menú
    let menuImage = 'https://files.catbox.moe/fgxda8.jpg'
    
    let txt = `╔══════════════════
⚠️  ALERTA DE HERRAMIENTA  ⚠️
╠═══════════════════


🕵️‍♂️  Argus — El Kit Definitivo de Reconocimiento
• ¿Qué es?
➜ Herramienta todo en uno para recolección de información, diseñada para profesionales de ciberseguridad y hackers éticos.
➜ Integra análisis de redes, exploración web y detección de amenazas en una interfaz limpia e intuitiva.
• Características (resumen)
➜ Recolección y correlación de datos de red
➜ Exploración y mapeo de sitios web
➜ Detección de posibles vectores y anomalías
➜ Herramientas de apoyo para reconocimiento de objetivos
• Riesgos / Advertencia
➜ Aunque útil para pruebas legítimas, herramientas de reconocimiento pueden emplearse para actividades maliciosas si se usan sin autorización.
➜ Su uso indebido puede ser ilegal y causar daños a terceros.
• Recomendación
➜ Si lo detectas en tu red: informa al equipo de seguridad, aísla el equipo afectado y reúne evidencias (logs).
➜ Para investigación: usa ambientes aislados y sigue políticas éticas y legales.

🔗 Información pública:
https://github.com/jasonxtn/Argus

⚙️ Instalación 

> git clone https://github.com/jasonxtn/argus.git
> cd argus
> python -m argus

*Option 2: Using pip*

> pip install argus-recon
> argus

*Option 3: Full Installation*

> git clone https://github.com/jasonxtn/argus.git
> cd argus
> chmod +x install.sh && ./install.sh
> python -m argus

*Option 4: Docker*

> git clone https://github.com/jasonxtn/argus.git
> cd argus
> docker build -t argus-recon:latest .
> docker run -it --rm -v $(pwd)/results:/app/results argus-recon:latest


⚠️ *RECUERDA HASLO BAJO TU SEGURIDAD EL BOT NI EL SUPBOT SE ASE CARGO DE CUALQUIER DAÑO O MAL USO SE PUEDA ASER* ⚠️
════════════════════
`

    try {
        await conn.sendMessage(m.chat, {
            image: { url: menuImage },
            caption: txt,
            mentions: [userId]
        })
    } catch (error) {
        console.error('Error al enviar la imagen:', error)
        await conn.sendMessage(m.chat, { 
            text: txt,
            mentions: [userId]
        })
    }
}

handler.help = ['argus', 'ARGUS']
handler.tags = ['seguridad']
handler.command = ['argus', 'ARGUS']
handler.register = false

export default handler

function clockString(ms) {
    let seconds = Math.floor((ms / 1000) % 60)
    let minutes = Math.floor((ms / (1000 * 60)) % 60)
    let hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
    return `${hours}h ${minutes}m ${seconds}s`
}
