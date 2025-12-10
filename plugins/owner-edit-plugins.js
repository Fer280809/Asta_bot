import fs from 'fs'
import path from 'path'

let handler = async (m, { args, text, isOwner, usedPrefix, command }) => {
  try {
    if (!isOwner) return m.reply('💠 Acceso denegado: Solo los *creadores* pueden usar este comando.')
    
    const carpetas = {
      '1': 'plugins',
      '2': 'plugins2',
      '3': 'plugins3',
      '4': 'plugins4',
      '5': 'plugins5'
    }

    // Si no hay argumentos, mostrar ayuda
    if (!args[0]) {
      return m.reply(`💡 *Uso del comando:*\n\n` +
        `• ${usedPrefix}${command} <nombre> <carpeta>\n\n` +
        `*Ejemplo:*\n` +
        `${usedPrefix}${command} info 1\n\n` +
        `*Carpetas disponibles:*\n` +
        `1 = plugins\n2 = plugins2\n3 = plugins3\n4 = plugins4\n5 = plugins5\n\n` +
        `Para ver plugins disponibles usa:\n` +
        `${usedPrefix}${command} list <número_carpeta>`)
    }

    // Comando para listar plugins
    if (args[0].toLowerCase() === 'list') {
      let numeroCarpeta = args[1] || '1'
      let carpeta = carpetas[numeroCarpeta]
      
      if (!carpeta) return m.reply('💡 Carpeta inválida. Elige un número del 1 al 5.')
      
      const rutaCarpeta = path.join('./', carpeta)
      if (!fs.existsSync(rutaCarpeta)) {
        return m.reply(`❌ La carpeta *${carpeta}* no existe.`)
      }

      const archivos = fs.readdirSync(rutaCarpeta)
        .filter(file => file.endsWith('.js'))
        .sort()

      if (archivos.length === 0) {
        return m.reply(`📁 No hay plugins en *${carpeta}*.`)
      }

      let lista = `📁 *PLUGINS EN ${carpeta.toUpperCase()}*\n\n`
      lista += `Total: ${archivos.length} archivos\n\n`
      
      archivos.forEach((file, index) => {
        lista += `${index + 1}. ${file}\n`
      })
      
      lista += `\n💡 Para editar usa:\n${usedPrefix}${command} <nombre> ${numeroCarpeta}`
      
      return m.reply(lista)
    }

    let nombre = args[0]
    if (!nombre.endsWith('.js')) nombre += '.js'

    let numeroCarpeta = args[1] ? args[1] : '1'
    let carpeta = carpetas[numeroCarpeta]
    
    if (!carpeta) return m.reply('💡 Carpeta inválida. Elige un número del 1 al 5.')

    const ruta = path.join('./', carpeta, nombre)
    
    // Si el plugin no existe, buscar en todas las carpetas
    if (!fs.existsSync(ruta)) {
      let encontrados = []
      
      for (let [num, carp] of Object.entries(carpetas)) {
        const rutaBusqueda = path.join('./', carp, nombre)
        if (fs.existsSync(rutaBusqueda)) {
          encontrados.push({ carpeta: carp, numero: num })
        }
      }

      if (encontrados.length > 0) {
        let msg = `⚠️ El plugin *${nombre}* no existe en *${carpeta}*.\n\n`
        msg += `✅ Pero lo encontré en:\n\n`
        encontrados.forEach(e => {
          msg += `• ${e.carpeta} (carpeta ${e.numero})\n`
        })
        msg += `\n💡 Usa: ${usedPrefix}${command} ${nombre.replace('.js', '')} ${encontrados[0].numero}`
        return m.reply(msg)
      }

      // Si no se encuentra en ninguna carpeta, mostrar plugins similares
      let pluginsSimilares = []
      const nombreBuscar = nombre.replace('.js', '').toLowerCase()
      
      for (let [num, carp] of Object.entries(carpetas)) {
        const rutaCarpeta = path.join('./', carp)
        if (fs.existsSync(rutaCarpeta)) {
          const archivos = fs.readdirSync(rutaCarpeta)
            .filter(file => file.endsWith('.js') && file.toLowerCase().includes(nombreBuscar))
          
          archivos.forEach(file => {
            pluginsSimilares.push({ archivo: file, carpeta: carp, numero: num })
          })
        }
      }

      if (pluginsSimilares.length > 0) {
        let msg = `❌ No existe el plugin *${nombre}* en *${carpeta}*.\n\n`
        msg += `🔍 *Plugins similares encontrados:*\n\n`
        
        pluginsSimilares.forEach((p, i) => {
          msg += `${i + 1}. ${p.archivo}\n   📁 ${p.carpeta} (carpeta ${p.numero})\n\n`
        })
        
        msg += `💡 Para editar usa:\n${usedPrefix}${command} <nombre> <carpeta>`
        return m.reply(msg)
      }

      // Si no hay similares, mostrar todos los plugins
      let msg = `❌ No existe el plugin *${nombre}* en ninguna carpeta.\n\n`
      msg += `📋 *TODOS LOS PLUGINS DISPONIBLES:*\n\n`
      
      for (let [num, carp] of Object.entries(carpetas)) {
        const rutaCarpeta = path.join('./', carp)
        if (fs.existsSync(rutaCarpeta)) {
          const archivos = fs.readdirSync(rutaCarpeta)
            .filter(file => file.endsWith('.js'))
            .sort()
          
          if (archivos.length > 0) {
            msg += `📁 *${carp.toUpperCase()}* (${archivos.length} plugins):\n`
            archivos.slice(0, 10).forEach(file => {
              msg += `  • ${file}\n`
            })
            if (archivos.length > 10) {
              msg += `  ... y ${archivos.length - 10} más\n`
            }
            msg += `\n`
          }
        }
      }
      
      msg += `💡 Para ver la lista completa de una carpeta:\n${usedPrefix}${command} list <número>`
      return m.reply(msg)
    }

    let buffer = null

    // Si se menciona o responde un archivo .js
    if (m.quoted && m.quoted.mimetype && m.quoted.mimetype.includes('application/javascript')) {
      buffer = await m.quoted.download()
    } else if (m.quoted && m.quoted.download) {
      buffer = await m.quoted.download()
    } else if (text && args.length > 2) {
      const nuevoCodigo = args.slice(2).join(' ')
      buffer = Buffer.from(nuevoCodigo, 'utf-8')
    } else {
      return m.reply('💡 Debes responder a un archivo .js o escribir el nuevo código después del comando.')
    }

    fs.writeFileSync(ruta, buffer)
    m.reply(`✅ El plugin *${nombre}* fue editado correctamente en *${carpeta}*.`)
    
  } catch (err) {
    console.error(err)
    m.reply(`❌ Error al editar el plugin: ${err.message}`)
  }
}

handler.help = ['editarplugin <nombre> <carpeta>', 'editarplugin list <carpeta>']
handler.tags = ['owner']
handler.command = ['editarplugin', 'editplugin', 'modplugin', 'edtp']
handler.fernando = true

export default handler