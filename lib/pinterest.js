import fetch from 'node-fetch'

export async function pinterestSearch(query, limit = 10){

try{

const url =
`https://delirius-apiofc.vercel.app/search/pinterest?query=${encodeURIComponent(query)}`

const res = await fetch(url,{
headers:{
'User-Agent':'Mozilla/5.0'
}
})

if(!res.ok) return []

const json = await res.json()

let results =
json?.data ||
json?.result ||
json?.results ||
[]

if(!Array.isArray(results)) return []

return results
.map(v => typeof v === 'string'
? v
: v.image || v.url
)
.filter(Boolean)
.slice(0,limit)

}catch(e){

console.log('Pinterest API Error:',e)

return []

}

}
