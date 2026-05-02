/**
 * Setlist.fm API Scraper
 *
 * Fetches recent concert/tour data for trending artists.
 * Requires SETLISTFM_API_KEY — skips gracefully if not set.
 *
 * API docs: https://api.setlist.fm/docs/1.0/ui/index.html
 * Rate limit: 2 req/sec
 *
 * Use cases:
 *  - Show upcoming/recent concerts for trending artists
 *  - Boost trending score for artists on tour
 *  - Provide "live event" context (e.g., "On tour — 12 upcoming shows")
 */

import { Env } from '../index'
import { writeKV, readKV } from '../store'

const BASE_URL = 'https://api.setlist.fm/rest/1.0'

interface SetlistFmArtist {
  mbid: string
  name: string
  sortName: string
  disambiguation?: string
  url: string
}

interface SetlistFmSetlist {
  id: string
  eventDate: string        // DD-MM-YYYY
  artist: SetlistFmArtist
  venue: {
    name: string
    city: {
      name: string
      country: { code: string; name: string }
    }
  }
  tour?: {
    name: string
  }
  sets: {
    set: Array<{
      song: Array<{
        name: string
        with?: { name: string }
        cover?: { name: string }
      }>
    }>
  }
  url: string
}

export async function scrapeSetlistFm(env: Env): Promise<void> {
  console.log('[setlistfm] Starting...')

  if (!env.SETLISTFM_API_KEY) {
    console.log('[setlistfm] No SETLISTFM_API_KEY set — skipping')
    return
  }

  try {
    // Get top artists from KV (enriched by Deezer/Last.fm)
    const topArtistsData = await readKV<Array<{
      name: string
      slug: string
      id: string
    }>>(env, 'artists:top')

    const artistNames = topArtistsData?.items?.map(a => a.name) ?? [
      'Kendrick Lamar', 'Billie Eilish', 'Taylor Swift',
      'Drake', 'Bad Bunny', 'The Weeknd', 'Burna Boy', 'Davido',
    ]

    const tourData: TourInfo[] = []

    for (const name of artistNames.slice(0, 10)) {
      try {
        // Search for the artist to get their MBID
        const searchRes = await fetch(
          `${BASE_URL}/search/artists?artistName=${encodeURIComponent(name)}&p=1&sort=relevance`,
          {
            headers: {
              'x-api-key': env.SETLISTFM_API_KEY,
              'Accept': 'application/json',
              'User-Agent': 'MusicPulse/1.0 (contact@musicpulse.com)',
            },
          },
        )

        if (!searchRes.ok) {
          console.warn(`[setlistfm] Artist search "${name}" HTTP ${searchRes.status}`)
          continue
        }

        const searchData = await searchRes.json() as { artist: SetlistFmArtist[]; total: number }
        const artist = searchData.artist?.[0]
        if (!artist?.mbid) {
          console.warn(`[setlistfm] No MBID found for "${name}"`)
          continue
        }

        // Fetch recent setlists for this artist
        const setlistRes = await fetch(
          `${BASE_URL}/artist/${artist.mbid}/setlists?p=1`,
          {
            headers: {
              'x-api-key': env.SETLISTFM_API_KEY,
              'Accept': 'application/json',
              'User-Agent': 'MusicPulse/1.0 (contact@musicpulse.com)',
            },
          },
        )

        if (!setlistRes.ok) {
          console.warn(`[setlistfm] Setlists for "${name}" HTTP ${setlistRes.status}`)
          continue
        }

        const setlistData = await setlistRes.json() as { setlist: SetlistFmSetlist[]; total: number }
        const setlists = setlistData.setlist ?? []

        if (setlists.length > 0) {
          // Get the most recent setlist's songs as "currently performing"
          const latestSetlist = setlists[0]
          const recentSongs = latestSetlist.sets?.set?.flatMap(s => s.song?.map(song => song.name) ?? []) ?? []

          // Count upcoming shows (approximate from total recent setlists)
          const totalShows = setlistData.total || setlists.length

          tourData.push({
            artistName: name,
            artistMbid: artist.mbid,
            tourName: latestSetlist.tour?.name || 'Current Tour',
            recentDate: parseSetlistDate(latestSetlist.eventDate),
            recentVenue: `${latestSetlist.venue.name}, ${latestSetlist.venue.city.name}`,
            recentCity: latestSetlist.venue.city.name,
            recentCountry: latestSetlist.venue.city.country.name,
            recentSongs: recentSongs.slice(0, 5),
            totalRecentShows: totalShows,
            setlistfmUrl: latestSetlist.url,
          })
        }

        // Rate limit: 2 req/sec
        await new Promise(r => setTimeout(r, 550))

      } catch (err) {
        console.error(`[setlistfm] ${name} error:`, err)
      }
    }

    if (tourData.length > 0) {
      await writeKV(env, 'artists:tours', tourData)
      console.log(`[setlistfm] ${tourData.length} artists with tour data written`)
    }

  } catch (err) {
    console.error('[setlistfm] error:', err)
  }
}

// ── Types ─────────────────────────────────────────────────────

export interface TourInfo {
  artistName: string
  artistMbid: string
  tourName: string
  recentDate: string        // ISO date
  recentVenue: string
  recentCity: string
  recentCountry: string
  recentSongs: string[]     // Last performed songs (up to 5)
  totalRecentShows: number
  setlistfmUrl: string
}

// ── Helpers ───────────────────────────────────────────────────

function parseSetlistDate(dateStr: string): string {
  // Setlist.fm format: DD-MM-YYYY → ISO YYYY-MM-DD
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const [day, month, year] = parts
  return `${year}-${month}-${day}`
}
