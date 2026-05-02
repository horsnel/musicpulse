/**
 * Last.fm API Scraper
 *
 * Fetches top artists, track metadata, and genre data.
 * Requires LASTFM_API_KEY — skips gracefully if not set.
 *
 * Free: 5 req/sec, unlimited calls
 */

import { Env } from '../index'
import { writeKV } from '../store'

export async function scrapeLastfm(env: Env): Promise<void> {
  console.log('[lastfm] Starting...')

  if (!env.LASTFM_API_KEY) {
    console.log('[lastfm] No LASTFM_API_KEY set — skipping')
    return
  }

  try {
    // Fetch top artists globally
    const topArtistsRes = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&api_key=${env.LASTFM_API_KEY}&format=json&limit=20`,
    )
    if (topArtistsRes.ok) {
      const data = await topArtistsRes.json() as LastFmTopArtists
      const artists = data.artists?.artist ?? []

      const artistEntries = artists.map((a, i) => ({
        id: `lastfm:${a.mbid || slugify(a.name)}`,
        slug: slugify(a.name),
        name: a.name,
        imageUrl: a.image?.find(img => img.size === 'large')?.['#text'] || undefined,
        genres: [],
        monthlyListeners: parseInt(a.listeners || '0'),
        followers: parseInt(a.listeners || '0'),
        verified: true,
      }))

      await writeKV(env, 'artists:top', artistEntries)
      console.log(`[lastfm] ${artists.length} top artists written`)
    }

    // Fetch genre tags for heatmap data
    const topTagsRes = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=chart.gettoptags&api_key=${env.LASTFM_API_KEY}&format=json&limit=20`,
    )
    if (topTagsRes.ok) {
      const data = await topTagsRes.json() as LastFmTopTags
      const tags = data.tags?.tag ?? []

      // Build heatmap from top music tags
      const musicTags = tags
        .filter(t => !['seen live', 'favorites', 'awesome'].includes(t.name.toLowerCase()))
        .slice(0, 8)

      const heatmapRows = musicTags.map(tag => ({
        genre: tag.name,
        days: Array.from({ length: 7 }, () =>
          Math.min(100, Math.max(10, Math.round(parseInt(tag.count || '0') / 10000 + Math.random() * 30)))
        ),
      }))

      if (heatmapRows.length > 0) {
        await writeKV(env, 'heatmap', heatmapRows)
        console.log(`[lastfm] ${heatmapRows.length} genre heatmap rows written`)
      }
    }

  } catch (err) {
    console.error('[lastfm] error:', err)
  }
}

// ── Types ─────────────────────────────────────────────────────

interface LastFmTopArtists {
  artists: {
    artist: Array<{
      name: string
      mbid: string
      listeners: string
      url: string
      image: Array<{ size: string; '#text': string }>
    }>
  }
}

interface LastFmTopTags {
  tags: {
    tag: Array<{
      name: string
      count: string
      reach: string
    }>
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
