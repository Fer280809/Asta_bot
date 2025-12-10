import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  try {
    if (!isOwner) return m.reply('💠 Solo los creadores pueden usar este comando.')
    
    if (!args[0]) {
      // Mostrar lista completa de TODOS los plugins
      let msg = `📋 *TODOS LOS PLUGINS DISPONIBLES:*\n\n`
      let totalPlugins = 0
      
      for (let carpeta of carpetas) {
        const rutaCarpeta = path.join('./', carpeta)
        if (fs.existsSync(rutaCarpeta)) {
          const archivos = fs.readdirSync(rutaCarpeta)
            .filter(file => file.endsWith('.js'))
            .sort()
          
          if (archivos.length > 0) {
            totalPlugins += archivos.length
            msg += `📁 *${carpeta.toUpperCase()}* (${archivos.length}):\n`
            archivos.forEach(file => {
              const size = fs.statSync(path.join(rutaCarpeta, file)).size
              const sizeKB = (size / 1024).toFixed(2)
              msg += `  • ${file} - ${sizeKB} KB\n`
            })
            msg += `\n`
          }
        }
      }
      
      msg += `━━━━━━━━━━━━━━━━\n`
      msg += `📊 Total: ${totalPlugins} plugins\n\n`
      msg += `💡 Para descargar:\n${usedPrefix}${command} <nombre>`
      
      return m.reply(msg)
    }
    
    const carpetas = ['plugins', 'plugins2', 'plugins3', 'plugins4', 'plugins5']
    
    let nombre = args[0]
    if (!nombre.endsWith('.js')) nombre += '.js'

    // Buscar en todas las carpetas
    let encontrado = null
    
    for (let carpeta of carpetas) {
      const ruta = path.join('./', carpeta, nombre)
      if (fs.existsSync(ruta)) {
        encontrado = { ruta, carpeta }
        break
      }
    }

    // Si no encontró, buscar similares
    if (!encontrado) {
      const nombreBuscar = nombre.replace('.js', '').toLowerCase()
      let similares = []
      
      for (let carpeta of carpetas) {
        const rutaCarpeta = path.join('./', carpeta)
        if (fs.existsSync(rutaCarpeta)) {
          const archivos = fs.readdirSync(rutaCarpeta)
            .filter(f => f.endsWith('.js') && f.toLowerCase().includes(nombreBuscar))
          
          archivos.forEach(f => similares.push({ archivo: f, carpeta }))
        }
      }

      if (similares.length > 0) {
        let msg = `❌ No encontré *${nombre}*\n\n🔍 *¿Quisiste decir?*\n\n`
        similares.slice(0, 5).forEach((s, i) => {
          msg += `${i + 1}. ${s.archivo} (${s.carpeta})\n`
        })
        return m.reply(msg)
      }
      
      return m.reply(`❌ No existe el plugin *${nombre}* en ninguna carpeta.`)
    }

    // Enviar plugin
    const buffer = fs.readFileSync(encontrado.ruta)
    const size = (fs.statSync(encontrado.ruta).size / 1024).toFixed(2)
    const lines = buffer.toString().split('\n').length
    
    await conn.sendMessage(m.chat, {
      document: buffer,
      fileName: nombre,
      mimetype: 'application/javascript',
      caption: `📄 ${nombre}\n📁 ${encontrado.carpeta}\n📊 ${size} KB • ${lines} líneas\n✅ Descargado`
    }, { quoted: m })
    
  } catch (err) {
    console.error(err)
    m.reply(`❌ Error: ${err.message}`)
  }
}

handler.help = ['getplugin <nombre>']
handler.tags = ['owner']
handler.command = ['getplugin', 'plugin', 'pluging', 'dsp']
handler.rowner = true

export default handler