import speed from 'performance-now'
import { spawn, exec, execSync } from 'child_process'

let handler = async (m, { conn }) => {
    let timestamp = speed()
    let sentMsg = await conn.reply(m.chat, '🎄 Calculando ping navideño... 🎅', m)
    let latency = speed() - timestamp
    
    exec(`neofetch --stdout`, (error, stdout, stderr) => {
        let child = stdout.toString("utf-8")
        let ssd = child.replace(/Memory:/, "Ram:")
        
        let result = `🎁 *¡Pong Navideño!* 🎄
> 🎅 Tiempo de respuesta: ${latency.toFixed(4).split(".")[0]}ms
> 🛷 Velocidad del trineo: Excelente
${ssd}
🎄 ¡Feliz Navidad! El bot está activo y listo para la magia. 🎅`
        
        // Editar el mensaje original correctamente para Baileys
        conn.sendMessage(m.chat, { 
            text: result,
            edit: sentMsg.key
        }, { quoted: m })
    })
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = ['ping', 'p']

export default handler
