/**
 * API Router
 *
 * Serves JSON data from KV for the MusicPulse frontend.
 * All responses include updatedAt timestamp and cache headers.
 */

import { Env } from './index'
import { slugify } from './scrapers/helpers'

const CACHE_TTL = 300 // 5 min browser cache

export async function handleApi(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url)
  const path = url.pathname.replace('/api/', '')

  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': `public, max-age=${CACHE_TTL}, s-maxage=${CACHE_TTL}`,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  try {
    const data = await routeRequest(path, url, env)
    if (data === null) {
      return Response.json({ error: 'Not found' }, { status: 404, headers })
    }
    return Response.json({ data: data.payload, updatedAt: data.updatedAt }, { headers })
  } catch (err: any) {
    console.error(`[api] ${path} error:`, err)
    return Response.json({ error: err.message || 'Internal server error' }, { status: 500, headers })
  }
}

async function routeRequest(path: string, url: URL, env: Env): Promise<{ payload: any; updatedAt: string } | null> {
  // ── Genre detail route (dynamic slug) ─────────────────────
  if (path.startsWith('genres/')) {
    const slug = path.replace('genres/', '')
    if (slug) {
      const limit = parseInt(url.searchParams.get('limit') ?? '50')
      return readKV(env, `charts:genre:${slug}`, limit)
    }
  }

  // ── Song detail route (dynamic slug) ──────────────────────
  if (path.startsWith('songs/')) {
    const slug = path.replace('songs/', '')
    if (slug) {
      return lookupSong(env, slug)
    }
  }

  // ── Artist detail route (dynamic slug) ────────────────────
  if (path.startsWith('artists/')) {
    const slug = path.replace('artists/', '')
    if (slug && slug !== 'tours') {
      return lookupArtist(env, slug)
    }
  }

  switch (path) {
    // ── Trending ─────────────────────────────────────────────
    case 'trending': {
      const platform = url.searchParams.get('platform')
      const limit = parseInt(url.searchParams.get('limit') ?? '50')
      if (platform) {
        return readKV(env, `trending:${platform}`, limit)
      }
      // Return all trending platforms
      const platforms = ['tiktok', 'twitter', 'youtube', 'spotify', 'apple', 'deezer', 'soundcloud', 'billboard', 'bandcamp', 'audiomack', 'genius', 'musixmatch', 'iheart', 'melon', 'oricon']
      const results: Record<string, any[]> = {}
      let updatedAt = ''
      for (const p of platforms) {
        const data = await readKV(env, `trending:${p}`, limit)
        if (data) {
          results[p] = data.payload
          updatedAt = data.updatedAt
        }
      }
      return { payload: results, updatedAt }
    }

    // ── Charts ───────────────────────────────────────────────
    case 'charts': {
      const platform = url.searchParams.get('platform') ?? 'spotify'
      const region = url.searchParams.get('region') ?? 'global'
      const limit = parseInt(url.searchParams.get('limit') ?? '50')
      return readKV(env, `charts:${platform}:${region}`, limit)
    }

    // ── Cross Platform ───────────────────────────────────────
    case 'trending/cross-platform': {
      const limit = parseInt(url.searchParams.get('limit') ?? '10')
      return readKV(env, 'cross-platform', limit)
    }

    // ── Velocity ─────────────────────────────────────────────
    case 'trending/velocity': {
      const limit = parseInt(url.searchParams.get('limit') ?? '10')
      return readKV(env, 'velocity', limit)
    }

    // ── Heatmap ──────────────────────────────────────────────
    case 'trending/heatmap': {
      return readKV(env, 'heatmap')
    }

    // ── Artists ──────────────────────────────────────────────
    case 'artists': {
      const limit = parseInt(url.searchParams.get('limit') ?? '6')
      return readKV(env, 'artists:top', limit)
    }

    // ── Albums / New Releases ────────────────────────────────
    case 'albums/new': {
      const limit = parseInt(url.searchParams.get('limit') ?? '10')
      return readKV(env, 'albums:new', limit)
    }

    // ── Tours (Setlist.fm) ───────────────────────────────
    case 'artists/tours': {
      return readKV(env, 'artists:tours')
    }

    // ── Countries ────────────────────────────────────────────
    case 'charts/countries': {
      return readKV(env, 'countries')
    }

    // ── Scrape Status ────────────────────────────────────────
    case 'scrape/status': {
      return readKV(env, 'scrape:meta')
    }

    // ── Genius Enrichment ────────────────────────────────────
    case 'enrichment/genius': {
      return readKV(env, 'enrichment:genius')
    }

    // ── Genres ──────────────────────────────────────────────
    case 'genres': {
      return readKV(env, 'genres:index')
    }

    default:
      return null
  }
}

// ── Song / Artist Lookup ─────────────────────────────────────────

/**
 * Search across all trending AND chart data in KV for a matching song.
 * Uses fuzzy matching: exact slug, partial slug, or song title keywords.
 */
async function lookupSong(env: Env, slug: string): Promise<{ payload: any; updatedAt: string } | null> {
  const platforms = ['apple', 'spotify', 'deezer', 'youtube', 'tiktok', 'twitter', 'soundcloud', 'billboard', 'bandcamp', 'audiomack', 'genius', 'musixmatch', 'iheart', 'melon', 'oricon']

  // Normalize the incoming slug for matching
  const slugNorm = slug.toLowerCase().replace(/[^a-z0-9]/g, '')

  // 1. Try exact match on trending data
  for (const platform of platforms) {
    const data = await readKV(env, `trending:${platform}`)
    if (!data) continue

    const match = (data.payload as any[]).find((item: any) => {
      const itemSlug = slugify(item.songTitle + '-' + item.artistName)
      const itemSlugNorm = itemSlug.replace(/[^a-z0-9]/g, '')
      return itemSlugNorm === slugNorm || itemSlug === slug
    })

    if (match) {
      return { payload: { ...match, platform }, updatedAt: data.updatedAt }
    }
  }

  // 2. Try chart data (has richer song objects)
  for (const platform of ['apple', 'spotify', 'deezer', 'youtube']) {
    for (const region of ['global', 'us', 'nigeria', 'uk', 'korea', 'brazil', 'germany', 'south-africa']) {
      const data = await readKV(env, `charts:${platform}:${region}`)
      if (!data) continue

      const match = (data.payload as any[]).find((item: any) => {
        const songSlug = item.song?.slug || slugify(item.song?.title + '-' + item.song?.artistName)
        const songSlugNorm = songSlug.replace(/[^a-z0-9]/g, '')
        return songSlugNorm === slugNorm || songSlug === slug
      })

      if (match) {
        // Convert ChartEntry to a TrendingItem-like object for the frontend
        return {
          payload: {
            id: match.id,
            rank: match.position,
            rankChange: match.positionChange || 0,
            isNew: match.isNewEntry || false,
            platform: match.platform || platform,
            songId: match.songId,
            songTitle: match.song?.title || '',
            artistName: match.song?.artistName || '',
            albumCoverUrl: match.song?.albumCoverUrl || '',
            artEmoji: match.song?.artEmoji || '\u{1F3B5}',
            artGradient: match.song?.artGradient || '',
            metric: match.streams || 0,
            metricUnit: 'streams',
            badge: match.isNewEntry ? 'new' : match.position === 1 ? 'peak' : null,
            surgePercent: null,
            updatedAt: data.updatedAt,
            // Extra chart info
            chartRegion: region,
            peakPosition: match.peakPosition || match.position,
            weeksOnChart: match.weeksOnChart || 1,
          },
          updatedAt: data.updatedAt,
        }
      }
    }
  }

  // 3. Fuzzy match: split slug into keywords and find partial match
  const keywords = slug.split('-').filter(k => k.length > 2)
  if (keywords.length > 0) {
    for (const platform of platforms) {
      const data = await readKV(env, `trending:${platform}`)
      if (!data) continue

      const match = (data.payload as any[]).find((item: any) => {
        const titleNorm = (item.songTitle || '').toLowerCase()
        const artistNorm = (item.artistName || '').toLowerCase()
        return keywords.every(kw => titleNorm.includes(kw) || artistNorm.includes(kw))
      })

      if (match) {
        return { payload: { ...match, platform }, updatedAt: data.updatedAt }
      }
    }
  }

  return null
}

/**
 * Search across all trending and chart data for matching artistName.
 * Uses fuzzy matching for slug comparison.
 */
async function lookupArtist(env: Env, slug: string): Promise<{ payload: any; updatedAt: string } | null> {
  const platforms = ['apple', 'spotify', 'deezer', 'youtube', 'tiktok', 'twitter', 'soundcloud', 'billboard', 'bandcamp', 'audiomack', 'genius', 'musixmatch', 'iheart', 'melon', 'oricon']

  const slugNorm = slug.toLowerCase().replace(/[^a-z0-9]/g, '')
  const songs: any[] = []
  let artistName = ''
  let updatedAt = ''
  const seenSongIds = new Set<string>()
  let bestCoverUrl = ''

  for (const platform of platforms) {
    const data = await readKV(env, `trending:${platform}`)
    if (!data) continue

    for (const item of data.payload as any[]) {
      const artistSlug = slugify(item.artistName)
      const artistSlugNorm = artistSlug.replace(/[^a-z0-9]/g, '')
      const match = artistSlugNorm === slugNorm || artistSlug === slug
      // Also try partial match on artist name keywords
      const partialMatch = !match && slug.split('-').every(kw => item.artistName.toLowerCase().includes(kw))

      if (match || partialMatch) {
        if (!artistName) artistName = item.artistName
        if (!updatedAt) updatedAt = data.updatedAt
        if (!bestCoverUrl && item.albumCoverUrl) bestCoverUrl = item.albumCoverUrl
        // Deduplicate by songId
        const dedupeKey = item.songId || slugify(item.songTitle + '-' + item.artistName)
        if (!seenSongIds.has(dedupeKey)) {
          seenSongIds.add(dedupeKey)
          songs.push({ ...item, platform })
        }
      }
    }
  }

  // Also search chart data for this artist
  for (const platform of ['apple', 'spotify', 'deezer', 'youtube']) {
    for (const region of ['global', 'us']) {
      const data = await readKV(env, `charts:${platform}:${region}`)
      if (!data) continue

      for (const item of data.payload as any[]) {
        if (!item.song) continue
        const artistSlug = slugify(item.song.artistName || '')
        const artistSlugNorm = artistSlug.replace(/[^a-z0-9]/g, '')
        if (artistSlugNorm === slugNorm || artistSlug === slug) {
          if (!artistName) artistName = item.song.artistName
          if (!updatedAt) updatedAt = data.updatedAt
          if (!bestCoverUrl && item.song.albumCoverUrl) bestCoverUrl = item.song.albumCoverUrl
          const dedupeKey = item.songId || slugify(item.song.title + '-' + item.song.artistName)
          if (!seenSongIds.has(dedupeKey)) {
            seenSongIds.add(dedupeKey)
            songs.push({
              id: item.id,
              songTitle: item.song.title,
              artistName: item.song.artistName,
              albumCoverUrl: item.song.albumCoverUrl || '',
              artEmoji: item.song.artEmoji || '\u{1F3B5}',
              artGradient: item.song.artGradient || '',
              platform: item.platform || platform,
              rank: item.position,
              metric: item.streams || 0,
              metricUnit: 'streams',
              badge: item.isNewEntry ? 'new' : item.position === 1 ? 'peak' : null,
            })
          }
        }
      }
    }
  }

  if (songs.length === 0) return null

  return {
    payload: {
      slug,
      name: artistName || slug.replace(/-/g, ' '),
      imageUrl: bestCoverUrl || '',
      songs,
      totalSongs: songs.length,
    },
    updatedAt,
  }
}

// ── KV Helpers ─────────────────────────────────────────────────

async function readKV(
  env: Env,
  key: string,
  limit?: number,
): Promise<{ payload: any; updatedAt: string } | null> {
  const raw = await env.DATA.get(key, 'json')
  if (!raw) return null

  const data = raw as { items: any[]; updatedAt: string }
  return {
    payload: limit ? data.items.slice(0, limit) : data.items,
    updatedAt: data.updatedAt,
  }
}
