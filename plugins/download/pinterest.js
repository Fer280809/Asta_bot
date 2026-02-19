import axios from 'axios'
import cheerio from 'cheerio'

async function pinterestSearch(query) {
try {

const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`

const { data } = await axios.get(url, {
headers: {
'User-Agent':
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}
})

const $ = cheerio.load(data)

let results = []

$('img').each((_, el) => {

let img = $(el).attr('src')

if (!img) return

if (
img.includes('236x') ||
img.includes('474x') ||
img.includes('originals')
) {

results.push({
url: img.replace(/236x|474x/, 'originals'),
isVideo: false
})

}

})

return [...new Map(results.map(v => [v.url, v])).values()].slice(0,10)

}catch{
return []
}
}

let handler = async (m,{ conn,text,usedPrefix,command })=>{

if(!text){
return m.reply(`❀ Escribe qué buscar en Pinterest

Ejemplo:
${usedPrefix+command} paisajes`)
}

try{

await m.react('🕒')

const results = await pinterestSearch(text)

if(!results.length){
await m.react('❌')
return m.reply('❌ No se encontraron resultados.')
}

conn.pinterestResults ??= {}

conn.pinterestResults[m.sender] = results

let sections=[{
title:'📌 Resultados de Pinterest',
rows:results.map((item,i)=>({
title:`Resultado ${i+1}`,
description:'🖼 Imagen',
rowId:`${usedPrefix}pinselect ${i}`
}))
}]

await conn.sendMessage(m.chat,{
text:`🔎 Resultados para:

✧ ${text}

Selecciona uno:`,
footer:'Pinterest Downloader',
title:'📌 Pinterest',
buttonText:'Ver resultados',
sections
},{ quoted:m })

await m.react('✅')

}catch{

await m.react('❌')

m.reply('⚠️ Error al buscar en Pinterest.')

}

}

handler.help=['pinterest <texto>']
handler.tags=['download']
handler.command=['pinterest','pin']
handler.group=true

export default handler

let handlerSelect = async (m,{ conn,args })=>{

let data=conn.pinterestResults?.[m.sender]

if(!data) return m.reply('❌ No hay resultados activos.')

let index=Number(args[0])

if(isNaN(index)||!data[index]){
return m.reply('❌ Opción inválida.')
}

let item=data[index]

await conn.sendMessage(m.chat,{
image:{ url:item.url },
caption:'📌 Pinterest Imagen'
},{ quoted:m })

}

handlerSelect.command=['pinselect']

export { handlerSelect }
