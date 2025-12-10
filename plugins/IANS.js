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
    let menuImage = 'https://files.catbox.moe/psc6dd.jpg'
    
    let txt = `╔═══════════════════
⚠️  ALERTA DE HERRAMIENTA  ⚠️
╠═══════════════════


🕵️‍♂️  IANS — Navaja Suiza de Hacking

• ¿Qué es?
➜ Proyecto escrito en Golang que reúne varias utilidades orientadas al reconocimiento y pruebas sobre redes.

• Características (resumen)
➜ Escaneo de puertos
➜ Sniffer / captura de tráfico
➜ Fuerza bruta SSH
➜ Funciones de reconocimiento de usuarios y mapeo de sitios
➜ Chat privado y otras utilidades mencionadas en el repositorio
• Riesgos / Advertencia
➜ Herramientas de este tipo pueden ser usadas para actividades maliciosas si se emplean sin autorización.
➜ Su uso indebido puede ser ilegal y causar daños a terceros.
• Recomendación
➜ Si encuentras este software en tu red: notifica al equipo de seguridad y evita ejecutar el programa en sistemas de producción.
➜ Para investigación: usa entornos aislados (laboratorios) y respeta la ley y la ética.


🔗 Información pública:
https://github.com/giovanni-iannaccone/ians

*Prerequisites*
> golang: install go
> python: install python

*🪄 Installation Steps*

* Clone the repository:*

> git clone https://github.com/giovanni-iannaccone/ians 

> cd ians

*Run installation script:*

> chmod +x install.sh
./install.sh

*Execute ians:*

> go run ians.go

*or build it:*

> go build ians.go

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

handler.help = ['IANS', 'ians']
handler.tags = ['seguridad']
handler.command = ['IANS', 'ians']
handler.register = false

export default handler

function clockString(ms) {
    let seconds = Math.floor((ms / 1000) % 60)
    let minutes = Math.floor((ms / (1000 * 60)) % 60)
    let hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
    return `${hours}h ${minutes}m ${seconds}s`
}
