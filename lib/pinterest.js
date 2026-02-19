// lib/pinterest.js
import fetch from 'node-fetch'

const sleep = ms => new Promise(r => setTimeout(r, ms))

const APIS = [
  {
    name: 'vreden',
    url: q => `https://api.vreden.web.id/api/pinterest?query=${encodeURIComponent(q)}`,
    parse: r => r?.data?.map(v => v.image)
  },
  {
    name: 'siputzx',
    url: q => `https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(q)}&type=image`,
    parse: r => r?.data?.map(v => v.image_url)
  },
  {
    name: 'delirius',
    url: q => `https://delirius-api.vercel.app/search/pinterest?text=${encodeURIComponent(q)}`,
    parse: r => r?.results
  }
]

export async function pinterestSearch(query, limit = 5) {
  for (const api of APIS) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10_000)

      const res = await fetch(api.url(query), {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })

      clearTimeout(timeout)

      if (!res.ok) continue

      const json = await res.json()
      const images = api.parse(json)?.filter(Boolean)

      if (images?.length) {
        return images.slice(0, limit)
      }
    } catch {
      await sleep(500)
    }
  }
  return []
}
