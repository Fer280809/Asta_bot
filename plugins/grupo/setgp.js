import { makeWASocket } from '@whiskeysockets/baileys'

const handler = async (m, { conn, args, text, command, usedPrefix }) => {
try {
switch (command) {
case 'gpbanner': case 'groupimg': {
const q = m.quoted || m
const mime = (q.msg || q).mimetype || ''
if (!/image\/(png|jpe?g)/.test(mime)) return m.reply('❀ Te faltó la imagen para cambiar el perfil del grupo.')
const img = await q.download()
if (!img) return m.reply('❀ Te faltó la imagen para el perfil del grupo.')
await m.react('🕒')
await conn.updateProfilePicture(m.chat, img)
await m.react('✔️')
m.reply('❀ Se cambió la imagen del grupo correctamente.')
break
}
case 'gpdesc': case 'groupdesc': {
if (!args.length) return m.reply('❀ Por favor, ingresé la nueva descripción qué desea ponerle al grupo.')
await m.react('🕒')
await conn.groupUpdateDescription(m.chat, args.join(' '))
await m.react('✔️')
m.reply('❀ Se cambió la descripción del grupo correctamente.')
break
}
case 'gpname': case 'groupname': {
if (!text) return m.reply('❀ Por favor, ingresé el nuevo nombre qué desea ponerle al grupo.')
await m.react('🕒')
await conn.groupUpdateSubject(m.chat, text)
await m.react('✔️')
m.reply('❀ Se cambió el nombre del grupo correctamente.')
break
}}} catch (e) {
await m.react('✖️')
m.reply(`⚠︎ Se ha producido un problema.\n> El detalle del error se mostrará a continuación. Usa ${usedPrefix}report para informarlo.\n\n${e.message}`)
}}

handler.help = ['gpbanner', 'groupimg', 'gpdesc', 'groupdesc', 'gpname', 'groupname']
handler.tags = ['grupo']
handler.command = ['gpbanner', 'groupimg', 'gpdesc', 'groupdesc', 'gpname', 'groupname']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.reg = true

export default handler