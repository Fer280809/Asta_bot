import moment from 'moment-timezone'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, args }) => {
  // Evitar duplicados
  if (m.id.startsWith('NJX-') || (m.id.startsWith('BAE5') && m.id.length === 16)) {
    return
  }

  if (!m.isOwner && !global.fernando?.includes(m.sender.split('@')[0])) {
    return global.dfail('owner', m, conn)
  }

  const usedPrefix = args?.[0] || global.prefix || '#'
  const _uptime = process.uptime() * 1000
  const uptime = clockString(_uptime)
  const totalreg = Object.keys(global.db?.data?.users || {}).length
  const totalCommands = Object.values(global.plugins || {}).filter((v) => v.help && v.tags).length

  // ========== OBTENER IMAGEN ==========
  let imageBuffer = null
  let imageUrl = null

  // Owner siempre usa el icono global o el del bot principal
  if (global.icono) imageUrl = global.icono
  if (!imageUrl) imageUrl = 'https://raw.githubusercontent.com/Fer280809/Asta_bot/main/lib/catalogo.jpg'

  let txt = `👑 *MENÚ OWNER - ASTA BOT*

⏰ *Uptime:* ${uptime}
👥 *Usuarios:* ${totalreg}
⚙️ *Comandos:* ${totalCommands}
📅 *Fecha:* ${moment().tz('America/Mexico_City').format('DD/MM/YYYY')}
🕐 *Hora:* ${moment().tz('America/Mexico_City').format('HH:mm:ss')}

┏━━━━━━━━━━━━━━┓
*👑 GESTIÓN DE OWNERS*
┗━━━━━━━━━━━━━━┛
╰┈➤ *#addowner* → Añadir owner
╰┈➤ *#delowner* → Eliminar owner
╰┈➤ *#codigo* → Crear códigos de recompensa

┏━━━━━━━━━━━━━━┓
*💰 ECONOMÍA ADMIN*
┗━━━━━━━━━━━━━━┛
╰┈➤ *#addcoins* + [@user] [cantidad]
╰┈➤ *#removecoin* + [@user] [cantidad]
╰┈➤ *#addexp* + [@user] [cantidad]
╰┈➤ *#removexp* + [@user] [cantidad]
╰┈➤ *#userpremium / #addprem* + [@user]
╰┈➤ *#delprem* + [@user]
╰┈➤ *#chetar* + [@user] → Recursos máximos
╰┈➤ *#deschetar* + [@user] → Resetear
╰┈➤ *#resetuser* + [@user]

┏━━━━━━━━━━━━━━┓
*🚫 SISTEMA DE BANEOS*
┗━━━━━━━━━━━━━━┛
╰┈➤ *#banned* + [@user] [razón] → Banear
╰┈➤ *#unban* + [@user] → Desbanear
╰┈➤ *#banlist* → Lista de baneados
╰┈➤ *#block* + [@user] → Bloquear WA
╰┈➤ *#unblock* + [@user] → Desbloquear

┏━━━━━━━━━━━━━━┓
*👥 GESTIÓN DE GRUPOS*
┗━━━━━━━━━━━━━━┛
╰┈➤ *#creargc / #newgc* → Crear grupo
╰┈➤ *#grouplist* → Listar grupos
╰┈➤ *#leave / #salir* → Salir del grupo
╰┈➤ *#deleteuser* + [@user]

┏━━━━━━━━━━━━━━┓
*⚙️ CONFIGURACIÓN*
┗━━━━━━━━━━━━━━┛
╰┈➤ *#prefix* + [nuevo prefijo]
╰┈➤ *#resetprefix* → Restablecer
╰┈➤ *#restart / #reiniciar*
╰┈➤ *#setpfpbot* + {imagen}
╰┈➤ *#setstatus2* + [texto]
╰┈➤ *#update / #actualizar*

┏━━━━━━━━━━━━━━┓
*💾 SISTEMA Y BACKUP*
┗━━━━━━━━━━━━━━┛
╰┈➤ *#backup / #copia*
╰┈➤ *#cleanfiles / #cleartmp*
╰┈➤ *#delai / #dsowner*

┏━━━━━━━━━━━━━━┓
*📢 BROADCAST*
┗━━━━━━━━━━━━━━┛
╰┈➤ *#aviso / #broadcast / #bc* + [texto]
╰┈➤ *#reunion / #meeting*

┏━━━━━━━━━━━━━━┓
*🔧 HERRAMIENTAS*
┗━━━━━━━━━━━━━━┛
╰┈➤ *#autoadmin* → Autopromoverse
╰┈➤ *#get / #fetch* + [URL]
╰┈➤ *#inspect* + [link grupo/canal]
╰┈➤ *#setcmd* → Añadir cmd a sticker
╰┈➤ *#restrict* → Restringir funciones`

  const buttons = [
    { 
      buttonId: `${usedPrefix}menu`, 
      buttonText: { displayText: '⬅️ Menú Principal' }, 
      type: 1 
    },
    { 
      buttonId: `${usedPrefix}restart`, 
      buttonText: { displayText: '🔄 Reiniciar Bot' }, 
      type: 1 
    },
    { 
      buttonId: `${usedPrefix}backup`, 
      buttonText: { displayText: '💾 Backup' }, 
      type: 1 
    }
  ]

  const messageOptions = {
    caption: txt,
    footer: '👑 Solo para Owners 👑',
    buttons: buttons,
    headerType: 4,
    mentions: [m.sender]
  }

  if (imageBuffer) messageOptions.image = imageBuffer
  else messageOptions.image = { url: imageUrl }

  try {
    await conn.sendMessage(m.chat, messageOptions, { quoted: m })
  } catch (error) {
    console.error('Error:', error)
    await conn.reply(m.chat, txt, m)
  }
}

handler.help = ['menuowner', 'owner', 'dev2', 'fer']
handler.tags = ['owner']
handler.command = ['menuowner', 'dev2', 'fer', 'menud', 'owner']
handler.rowner = true

export default handler

function clockString(ms) {
  let seconds = Math.floor((ms / 1000) % 60)
  let minutes = Math.floor((ms / (1000 * 60)) % 60)
  let hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
  return `${hours}h ${minutes}m ${seconds}s`
}
