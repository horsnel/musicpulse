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
 * Search across all trending data in KV for a matching song.
 * Looks through each platform's trending data and returns the first match
 * where the songId or slugified songTitle matches the given slug.
 */
async function lookupSong(env: Env, slug: string): Promise<{ payload: any; updatedAt: string } | null> {
  const platforms = ['tiktok', 'twitter', 'youtube', 'spotify', 'apple', 'deezer', 'soundcloud', 'billboard', 'bandcamp', 'audiomack', 'genius', 'musixmatch', 'iheart', 'melon', 'oricon']

  for (const platform of platforms) {
    const data = await readKV(env, `trending:${platform}`)
    if (!data) continue

    const match = (data.payload as any[]).find((item: any) => {
      const itemSlug = slugify(item.songTitle + '-' + item.artistName)
      return itemSlug === slug || item.songId === slug
    })

    if (match) {
      return {
        payload: { ...match, platform },
        updatedAt: data.updatedAt,
      }
    }
  }

  return null
}

/**
 * Search across all trending data for matching artistName (slugified).
 * Compiles all songs by that artist across platforms.
 */
async function lookupArtist(env: Env, slug: string): Promise<{ payload: any; updatedAt: string } | null> {
  const platforms = ['tiktok', 'twitter', 'youtube', 'spotify', 'apple', 'deezer', 'soundcloud', 'billboard', 'bandcamp', 'audiomack', 'genius', 'musixmatch', 'iheart', 'melon', 'oricon']

  const songs: any[] = []
  let artistName = ''
  let updatedAt = ''
  const seenSongIds = new Set<string>()

  for (const platform of platforms) {
    const data = await readKV(env, `trending:${platform}`)
    if (!data) continue

    for (const item of data.payload as any[]) {
      if (slugify(item.artistName) === slug) {
        if (!artistName) artistName = item.artistName
        if (!updatedAt) updatedAt = data.updatedAt
        // Deduplicate by songId
        const dedupeKey = item.songId || slugify(item.songTitle + '-' + item.artistName)
        if (!seenSongIds.has(dedupeKey)) {
          seenSongIds.add(dedupeKey)
          songs.push({ ...item, platform })
        }
      }
    }
  }

  if (songs.length === 0) return null

  return {
    payload: {
      slug,
      name: artistName || slug,
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
