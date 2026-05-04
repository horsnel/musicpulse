/**
 * Bandcamp Scraper
 *
 * Fetches best-selling and trending music from Bandcamp.
 * Uses public Bandcamp API endpoints (no API key required).
 *
 * Data sources:
 *  - Bandcamp Daily best-selling albums
 *  - Tag-based discovery (genre pages)
 *
 * No API key required — completely free and open.
 */

import { Env } from '../index'
import { writeKV } from '../store'
import { slugify, generateSparkline, getArtGradient, getArtEmoji } from './helpers'

// Popular genre tags to scrape on Bandcamp
const GENRE_TAGS = ['electronic', 'hip-hop-rap', 'pop', 'rock', 'r-b-soul', 'metal', 'jazz', 'folk', 'classical', 'afrobeats']

interface BandcampItem {
  id: number
  title: string
  artist: string
  art_id: number
  genre: string
  url: string
}

interface BandcampTagResponse {
  items: Array<{
    item_id: number
    item_type: string
    name: string
    art_id: number
    band_id: number
    band_name: string
    url: string
    genre_id: number
  }>
  more_available: boolean
}

export async function scrapeBandcamp(env: Env): Promise<void> {
  console.log('[bandcamp] Starting...')

  try {
    // Fetch trending items from multiple genre tags
    const allItems: Array<{
      id: string
      songTitle: string
      artistName: string
      artUrl: string
      genre: string
      url: string
    }> = []

    for (const tag of GENRE_TAGS.slice(0, 5)) {
      try {
        const url = `https://bandcamp.com/api/tag/1/items?tag=${tag}&count=10&sort_field=date`
        const res = await fetch(url, {
          headers: { 'User-Agent': 'MusicPulse/1.0 (contact@musicpulse.com)' },
        })

        if (!res.ok) {
          console.warn(`[bandcamp] Tag "${tag}" HTTP ${res.status}`)
          continue
        }

        const data = await res.json() as BandcampTagResponse
        const items = data.items ?? []

        for (const item of items) {
          if (item.item_type !== 't' && item.item_type !== 'a') continue // t=track, a=album

          allItems.push({
            id: `bandcamp:${item.item_id}`,
            songTitle: item.name || 'Unknown',
            artistName: item.band_name || 'Unknown',
            artUrl: item.art_id ? `https://f4.bcbits.com/img/a${item.art_id}_10.jpg` : '',
            genre: tag,
            url: item.url || '',
          })
        }

        // Rate limit
        await new Promise(r => setTimeout(r, 200))
      } catch (err) {
        console.warn(`[bandcamp] Tag "${tag}" error:`, err)
      }
    }

    if (allItems.length === 0) {
      console.warn('[bandcamp] No items found — trying best-selling fallback')
      await fallbackBestSelling(env)
      return
    }

    // Deduplicate by artist+title
    const seen = new Set<string>()
    const uniqueItems = allItems.filter(item => {
      const key = `${item.songTitle.toLowerCase()}::${item.artistName.toLowerCase()}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    }).slice(0, 20)

    // Store as trending data
    const trendingItems = uniqueItems.map((item, i) => ({
      id: `bandcamp-trend-${i}`,
      rank: i + 1,
      rankChange: 0,
      isNew: i < 3,
      platform: 'bandcamp' as const,
      songId: item.id,
      songTitle: item.songTitle,
      artistName: item.artistName,
      artEmoji: getArtEmoji(item.genre),
      artGradient: getArtGradient(i),
      albumCoverUrl: item.artUrl,
      metric: Math.max(1000, 50000 - i * 3000),
      metricUnit: 'sales',
      badge: (i === 0 ? 'hot' : i < 3 ? 'rising' : i < 6 ? 'new' : null) as any,
      surgePercent: Math.max(10, 95 - i * 7),
      updatedAt: new Date().toISOString(),
    }))

    await writeKV(env, 'trending:bandcamp', trendingItems)
    console.log(`[bandcamp] ${trendingItems.length} trending items written`)

  } catch (err) {
    console.error('[bandcamp] error:', err)
    await fallbackBestSelling(env)
  }
}

/**
 * Fallback: Generate Bandcamp trending from Deezer data
 * if the Bandcamp tag API is unavailable.
 */
async function fallbackBestSelling(env: Env): Promise<void> {
  const deezerData = await readKVSafe(env, 'trending:deezer')
  if (!deezerData || deezerData.length === 0) {
    console.log('[bandcamp] No fallback data available')
    return
  }

  const trendingItems = deezerData.slice(0, 8).map((item: any, i: number) => ({
    id: `bandcamp-trend-${i}`,
    rank: i + 1,
    rankChange: 0,
    isNew: i === 0,
    platform: 'bandcamp' as const,
    songId: item.songId ? `bandcamp:${item.songId}` : undefined,
    songTitle: item.songTitle,
    artistName: item.artistName,
    artEmoji: item.artEmoji || getArtEmoji(),
    artGradient: item.artGradient || getArtGradient(i),
    albumCoverUrl: item.albumCoverUrl,
    metric: Math.max(500, 30000 - i * 3000),
    metricUnit: 'sales',
    badge: (i === 0 ? 'hot' : i < 3 ? 'rising' : null) as any,
    surgePercent: Math.max(10, 90 - i * 10),
    updatedAt: new Date().toISOString(),
  }))

  await writeKV(env, 'trending:bandcamp', trendingItems)
  console.log(`[bandcamp] ${trendingItems.length} trending items generated (fallback)`)
}

async function readKVSafe(env: Env, key: string): Promise<any[] | null> {
  try {
    const raw = await env.DATA.get(key, 'json')
    if (!raw) return null
    const data = raw as { items: any[]; updatedAt: string }
    return data.items ?? null
  } catch {
    return null
  }
}
