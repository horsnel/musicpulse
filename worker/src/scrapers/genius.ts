/**
 * Genius API Scraper
 *
 * Fetches song metadata, album art, and chart data.
 * Requires GENIUS_API_KEY — skips gracefully if not set.
 *
 * Free tier, no hard rate limit.
 */

import { Env } from '../index'
import { writeKV } from '../store'

export async function scrapeGenius(env: Env): Promise<void> {
  console.log('[genius] Starting...')

  if (!env.GENIUS_API_KEY) {
    console.log('[genius] No GENIUS_API_KEY set — skipping')
    return
  }

  try {
    // Fetch current chart / top songs
    const res = await fetch(
      'https://api.genius.com/chart?time_period=day',
      {
        headers: {
          'Authorization': `Bearer ${env.GENIUS_API_KEY}`,
          'User-Agent': 'MusicPulse/1.0 (contact@musicpulse.com)',
        },
      },
    )

    if (!res.ok) {
      console.warn(`[genius] HTTP ${res.status}`)
      return
    }

    const data = await res.json() as GeniusChartResponse
    const songs = data.response?.chart?.items ?? []

    // Use Genius data to enrich existing chart entries with cover art
    // Store as a supplementary data source
    const enrichedSongs = songs.map((item, i) => ({
      id: `genius:${item.song.id}`,
      slug: slugify(item.song.title + '-' + item.song.primary_artist.name),
      title: item.song.title,
      artistId: `genius:${item.song.primary_artist.id}`,
      artistName: item.song.primary_artist.name,
      artistSlug: slugify(item.song.primary_artist.name),
      albumCoverUrl: item.song.song_art_image_url,
      durationMs: 0,
      releaseDate: '',
      genres: [],
      popularityScore: Math.max(0, 100 - i),
    }))

    // Store as a metadata enrichment source (not a primary chart)
    await writeKV(env, 'enrichment:genius', enrichedSongs)
    console.log(`[genius] ${songs.length} songs enriched`)

  } catch (err) {
    console.error('[genius] error:', err)
  }
}

// ── Types ─────────────────────────────────────────────────────

interface GeniusChartResponse {
  response: {
    chart: {
      items: Array<{
        song: {
          id: number
          title: string
          song_art_image_url: string
          primary_artist: {
            id: number
            name: string
            image_url: string
          }
          stats: {
            pageviews: number
          }
          release_date_for_display?: string
        }
      }>
    }
  }
}

// ── Helpers ───────────────────────────────────────────────────

function slugify(str: string): string {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
