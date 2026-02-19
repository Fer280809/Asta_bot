import { pinterestSearch } from '../lib/pinterest.js'

let handler = async (m,{ conn,text,usedPrefix,command })=>{

if(!text){
return m.reply(`❀ Escribe qué buscar en Pinterest

Ejemplo:
${usedPrefix+command} paisajes`)
}

try{

await m.react('🕒')

const results = await pinterestSearch(text,10)

if(!results.length){

await m.react('❌')

return m.reply('❌ No se encontraron resultados.')

}

const url = results[Math.floor(Math.random()*results.length)]

await conn.sendMessage(m.chat,{

image:{ url },

caption:
'꒰ ❀ ꒱ ── Pinterest ── ꒰ ❀ ꒱\n'+
`      Búsqueda › ${text}\n\n`+
'╭─ Enlace\n'+
`╰› ${url}`

},{ quoted:m })

await m.react('✅')

}catch(e){

console.log(e)

await m.react('❌')

m.reply('⚠️ Error al buscar en Pinterest.')

}

}

handler.help=['pinterest <texto>']
handler.tags=['download']
handler.command=['pinterest','pin']
handler.group=true

export default handler
