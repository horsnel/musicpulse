/**
 * MusicBrainz API Scraper
 *
 * Fetches ISRC codes and artist metadata for cross-platform matching.
 * No API key required — rate limited to 1 req/sec.
 *
 * Use cases:
 *  - Map ISRCs between Spotify, Apple Music, Deezer
 *  - Enrich artist data with MusicBrainz IDs
 *  - Get release group info for album data
 */

import { Env } from '../index'
import { writeKV, readKV } from '../store'
import { slugify } from './helpers'

const BASE_URL = 'https://musicbrainz.org/ws/2'

export async function scrapeMusicBrainz(env: Env): Promise<void> {
  console.log('[musicbrainz] Starting...')

  try {
    // Get top artists from KV to enrich with MBIDs
    const topArtistsData = await readKV<{
      name: string
      slug: string
      id: string
    }>(env, 'artists:top')

    const artistNames = topArtistsData?.items?.map((a: { name: string }) => a.name) ?? [
      'Kendrick Lamar', 'Billie Eilish', 'Taylor Swift',
      'Drake', 'Bad Bunny', 'The Weeknd', 'Burna Boy',
    ]

    const enrichedArtists = []
    const seenSlugs = new Set<string>()

    // Get existing artist data
    const existingArtists = topArtistsData?.items ?? []

    for (const name of artistNames.slice(0, 10)) {
      try {
        // Search for artist in MusicBrainz
        const searchUrl = `${BASE_URL}/artist/?query=artist:${encodeURIComponent(name)}&fmt=json&limit=1`
        const res = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'MusicPulse/1.0 (contact@musicpulse.com)',
            'Accept': 'application/json',
          },
        })

        if (!res.ok) {
          console.warn(`[musicbrainz] Artist search "${name}" HTTP ${res.status}`)
          continue
        }

        const data = await res.json() as { artists: MusicBrainzArtist[] }
        const mbArtist = data.artists?.[0]
        if (!mbArtist) continue

        // Merge MB data with existing artist data
        const existing = existingArtists.find((a: any) => a.name === name) as any || {}
        const slug = slugify(name)

        if (seenSlugs.has(slug)) continue
        seenSlugs.add(slug)

        enrichedArtists.push({
          ...existing,
          id: existing.id || `mb:${mbArtist.id}`,
          slug,
          name,
          mbid: mbArtist.id,
          genres: mbArtist.tags?.slice(0, 5).map((t: any) => t.name) || existing.genres || [],
          origin: mbArtist.country || existing.origin,
          activeSince: mbArtist['life-span']?.begin ? parseInt(mbArtist['life-span'].begin.substring(0, 4)) : existing.activeSince,
          verified: true,
        })

        // Rate limit: 1 req/sec for MusicBrainz
        await new Promise(r => setTimeout(r, 1100))
      } catch (err) {
        console.error(`[musicbrainz] ${name} error:`, err)
      }
    }

    if (enrichedArtists.length > 0) {
      await writeKV(env, 'artists:top', enrichedArtists)
      console.log(`[musicbrainz] ${enrichedArtists.length} artists enriched`)
    }

    // Also fetch countries data for the charts/countries endpoint
    const countries = [
      { region: 'us', flag: '\u{1F1FA}\u{1F1F8}', name: 'United States', code: 'US' },
      { region: 'uk', flag: '\u{1F1EC}\u{1F1E7}', name: 'United Kingdom', code: 'GB' },
      { region: 'nigeria', flag: '\u{1F1F3}\u{1F1EC}', name: 'Nigeria', code: 'NG' },
      { region: 'korea', flag: '\u{1F1F0}\u{1F1F7}', name: 'South Korea', code: 'KR' },
      { region: 'brazil', flag: '\u{1F1E7}\u{1F1F7}', name: 'Brazil', code: 'BR' },
      { region: 'germany', flag: '\u{1F1E9}\u{1F1EA}', name: 'Germany', code: 'DE' },
      { region: 'south-africa', flag: '\u{1F1FF}\u{1F1E6}', name: 'South Africa', code: 'ZA' },
    ]

    // Try to get top song for each country from KV
    const countryCharts = []
    for (const c of countries) {
      const chartData = await readKV<any>(env, `charts:spotify:${c.region}`)
      const topEntry = chartData?.items?.[0]

      countryCharts.push({
        region: c.region,
        flag: c.flag,
        name: c.name,
        topSong: topEntry?.song?.title || topEntry?.songTitle || '—',
        topArtist: topEntry?.song?.artistName || topEntry?.artistName || '—',
      })
    }

    await writeKV(env, 'countries', countryCharts)

  } catch (err) {
    console.error('[musicbrainz] error:', err)
  }
}

// ── Types ─────────────────────────────────────────────────────

interface MusicBrainzArtist {
  id: string
  name: string
  sortName: string
  country: string
  'life-span': {
    begin: string
    end: string | null
  }
  tags?: Array<{
    name: string
    count: number
  }>
}
