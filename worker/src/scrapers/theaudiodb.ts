/**
 * TheAudioDB API Scraper
 *
 * Fetches artist profiles, bios, social links, and images.
 * Requires THEAUDIODB_API_KEY — skips gracefully if not set.
 *
 * Free key at theaudiodb.com
 */

import { Env } from '../index'
import { writeKV } from '../store'
import { slugify } from './helpers'

export async function scrapeTheAudioDB(env: Env): Promise<void> {
  console.log('[theaudiodb] Starting...')

  if (!env.THEAUDIODB_API_KEY) {
    console.log('[theaudiodb] No THEAUDIODB_API_KEY set — skipping')
    return
  }

  try {
    // Fetch trending artists (use Last.fm top artists if available, then enrich)
    const existingArtists = await env.DATA.get('artists:top', 'json') as any
    const artistSlugs = existingArtists?.items?.map((a: any) => a.name) ?? [
      'Kendrick Lamar', 'Billie Eilish', 'Taylor Swift',
      'Drake', 'Bad Bunny', 'The Weeknd',
    ]

    const enrichedArtists = []

    for (const name of artistSlugs.slice(0, 10)) {
      try {
        const res = await fetch(
          `https://www.theaudiodb.com/api/v1/json/${env.THEAUDIODB_API_KEY}/search.php?s=${encodeURIComponent(name)}`,
        )
        if (!res.ok) continue

        const data = await res.json() as AudioDBResponse
        const artist = data.artists?.[0]
        if (!artist) continue

        enrichedArtists.push({
          id: `audiodb:${artist.idArtist}`,
          slug: slugify(artist.strArtist),
          name: artist.strArtist,
          aka: artist.strArtistAlternate || undefined,
          bio: artist.strBiographyEN?.substring(0, 500) || undefined,
          imageUrl: artist.strArtistThumb || artist.strArtistFanart,
          genres: (artist.strGenre || '').split(',').filter(Boolean),
          origin: artist.strCountry || undefined,
          monthlyListeners: parseInt(artist.intListeners || '0') || undefined,
          label: artist.strLabel || undefined,
          activeSince: parseInt(artist.intFormedYear || '0') || undefined,
          verified: true,
          socialLinks: {
            spotify: artist.strSpotify ? `https://open.spotify.com/artist/${artist.strSpotify}` : undefined,
            youtube: artist.strYoutube ? `https://youtube.com/channel/${artist.strYoutube}` : undefined,
            twitter: artist.strTwitter ? `https://twitter.com/${artist.strTwitter}` : undefined,
          },
        })

        // Rate limit: 1 req/sec
        await new Promise(r => setTimeout(r, 1100))
      } catch (err) {
        console.error(`[theaudiodb] ${name} error:`, err)
      }
    }

    if (enrichedArtists.length > 0) {
      await writeKV(env, 'artists:top', enrichedArtists)
      console.log(`[theaudiodb] ${enrichedArtists.length} artists enriched`)
    }

  } catch (err) {
    console.error('[theaudiodb] error:', err)
  }
}

// ── Types ─────────────────────────────────────────────────────

interface AudioDBResponse {
  artists?: Array<{
    idArtist: string
    strArtist: string
    strArtistAlternate: string
    strBiographyEN: string
    strArtistThumb: string
    strArtistFanart: string
    strGenre: string
    strCountry: string
    intListeners: string
    strLabel: string
    intFormedYear: string
    strSpotify: string
    strYoutube: string
    strTwitter: string
  }>
}

