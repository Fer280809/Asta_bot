import fetch from 'node-fetch'
import cheerio from 'cheerio'

export async function pinterestSearch(query, limit = 10) {

try {

const res = await fetch(
`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`,
{
headers: {
'User-Agent': 'Mozilla/5.0'
}
})

const html = await res.text()

const $ = cheerio.load(html)

let results = []

$('img').each((i, el) => {

let src = $(el).attr('src')

if (src && src.includes('pinimg')) {
results.push(src)
}

})

return [...new Set(results)].slice(0, limit)

} catch (e) {

console.log('Pinterest Scraper Error:', e)

return []

}

}
