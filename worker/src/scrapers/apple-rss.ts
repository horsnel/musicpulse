/**
 * Apple Music RSS Scraper
 *
 * Two strategies (tried in order — first one that returns data wins):
 *
 *   1. Modern Apple Marketing Tools feed (active, recommended)
 *      https://rss.applemarketingtools.com/api/v2/{country}/music/most-played/{limit}/songs.json
 *      No API key required. Returns up to 200 songs.
 *
 *   2. Legacy iTunes RSS feed (deprecated but still works for some countries)
 *      https://itunes.apple.com/{country}/rss/topsongs/limit={limit}/json
 *      No API key required. Max 100 songs.
 *
 * The legacy endpoint has been silently returning errors / empty data for
 * some countries since ~2024, which caused `trending:apple` to freeze at
 * whatever the last successful fetch was. The new endpoint is the fix.
 */

import { Env } from '../index'
import { writeKV } from '../store'
import { slugify, generateSparkline, getArtGradient, getArtEmoji } from './helpers'

const FEEDS = [
  { id: 'global', country: 'us' },
  { id: 'nigeria', country: 'ng' },
  { id: 'uk', country: 'gb' },
  { id: 'korea', country: 'kr' },
  { id: 'brazil', country: 'br' },
  { id: 'germany', country: 'de' },
  { id: 'south-africa', country: 'za' },
]

interface ITunesRSSEntry {
  'im:name': { label: string }
  'im:artist': { label: string }
  'im:image': Array<{ label: string; attributes: { height: string } }>
  category: { attributes: { label: string } }
  link: { attributes: { href: string } }
  id: { label: string }
  'im:contentAdvisoryRating'?: { label: string }
}

interface AppleMarketingToolsResponse {
  feed: {
    title: string
    id: string
    results: Array<{
      artistName: string
      id: string
      name: string
      releaseDate: string
      kind: string
      artworkUrl100: string
      genres: Array<{ genreId: string; name: string; url: string }>
      url: string
    }>
  }
}

function upgradeArtworkUrl(url: string): string {
  if (!url) return ''
  return url
    .replace(/\d+x\d+bb\.png/, '600x600bb.jpg')
    .replace(/\d+x\d+bb\.jpeg/, '600x600bb.jpg')
    // Apple Marketing Tools API returns 100x100bb.jpg — bump to 600x600
    .replace(/100x100bb\.jpg/, '600x600bb.jpg')
}

/**
 * Fetch and normalize data from the modern Apple Marketing Tools feed.
 * Returns null if the feed is unavailable or returns no results.
 */
async function fetchModernFeed(country: string): Promise<AppleMarketingToolsResponse['feed']['results'] | null> {
  try {
    const url = `https://rss.applemarketingtools.com/api/v2/${country}/music/most-played/200/songs.json`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MusicPulse/1.0 (contact@musicpulse.com)' },
      // Cloudflare Workers don't support a default timeout; rely on cf-connecting.
    })
    if (!res.ok) {
      console.warn(`[apple-rss] modern feed ${country} HTTP ${res.status}`)
      return null
    }
    const data = await res.json() as AppleMarketingToolsResponse
    if (!data.feed?.results || data.feed.results.length === 0) {
      console.warn(`[apple-rss] modern feed ${country} returned no results`)
      return null
    }
    return data.feed.results
  } catch (err) {
    console.warn(`[apple-rss] modern feed ${country} error:`, err)
    return null
  }
}

/**
 * Fallback: fetch from the legacy iTunes RSS feed.
 */
async function fetchLegacyFeed(country: string): Promise<ITunesRSSEntry[] | null> {
  try {
    // Note: limit=100 is the max for the legacy feed.
    const url = `https://itunes.apple.com/${country}/rss/topsongs/limit=100/json`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MusicPulse/1.0 (contact@musicpulse.com)' },
    })
    if (!res.ok) {
      console.warn(`[apple-rss] legacy feed ${country} HTTP ${res.status}`)
      return null
    }
    const data = await res.json() as { feed?: { entry?: ITunesRSSEntry[] } }
    const entries = data.feed?.entry ?? []
    if (entries.length === 0) {
      console.warn(`[apple-rss] legacy feed ${country} returned no entries`)
      return null
    }
    return entries
  } catch (err) {
    console.warn(`[apple-rss] legacy feed ${country} error:`, err)
    return null
  }
}

export async function scrapeAppleRSS(env: Env): Promise<void> {
  console.log('[apple-rss] Starting...')

  for (const feed of FEEDS) {
    try {
      // Try modern feed first
      const modernResults = await fetchModernFeed(feed.country)
      if (modernResults && modernResults.length > 0) {
        const chartEntries = modernResults.map((r, i) => {
          const title = r.name || 'Unknown'
          const artist = r.artistName || 'Unknown'
          const artworkUrl = upgradeArtworkUrl(r.artworkUrl100 || '')
          const genre = r.genres?.[0]?.name || ''
          const songId = r.id || slugify(title + '-' + artist)
          const appleUrl = r.url || ''

          return {
            id: `apple-chart-${feed.id}-${i}`,
            songId,
            song: {
              id: songId,
              slug: slugify(title + '-' + artist),
              title,
              artistId: slugify(artist),
              artistName: artist,
              artistSlug: slugify(artist),
              albumCoverUrl: artworkUrl,
              durationMs: 0,
              releaseDate: r.releaseDate || '',
              genres: genre ? [genre] : [],
              popularityScore: Math.max(0, 100 - i),
              appleUrl,
            },
            platform: 'apple' as const,
            region: feed.id as any,
            position: i + 1,
            positionChange: 0,
            isNewEntry: false,
            isReEntry: false,
            streams: undefined,
            peakPosition: i + 1,
            weeksOnChart: 1,
            chartDate: new Date().toISOString().split('T')[0],
            sparklineData: generateSparkline(i + 1),
          }
        })

        await writeKV(env, `charts:apple:${feed.id}`, chartEntries)

        // Store top 8 as trending items (global only)
        if (feed.id === 'global') {
          const trendingItems = modernResults.slice(0, 8).map((r, i) => {
            const title = r.name || 'Unknown'
            const artist = r.artistName || 'Unknown'
            const artworkUrl = upgradeArtworkUrl(r.artworkUrl100 || '')
            const genre = r.genres?.[0]?.name || ''
            const songId = r.id || slugify(title + '-' + artist)

            return {
              id: `apple-trend-${i}`,
              rank: i + 1,
              rankChange: 0,
              isNew: i === 0,
              platform: 'apple' as const,
              songId,
              songTitle: title,
              artistName: artist,
              artEmoji: getArtEmoji(genre),
              artGradient: getArtGradient(i),
              albumCoverUrl: artworkUrl,
              metric: Math.max(100000, 10000000 - i * 1000000),
              metricUnit: 'plays',
              badge: (i === 0 ? 'hot' : i < 3 ? 'rising' : null) as any,
              surgePercent: Math.max(10, 100 - i * 10),
              updatedAt: new Date().toISOString(),
            }
          })
          await writeKV(env, 'trending:apple', trendingItems)
        }

        console.log(`[apple-rss] ${feed.id} (modern) — ${modernResults.length} entries written`)
        continue  // Skip the legacy fallback for this feed
      }

      // Fallback: legacy iTunes RSS feed
      const legacyEntries = await fetchLegacyFeed(feed.country)
      if (!legacyEntries || legacyEntries.length === 0) {
        console.warn(`[apple-rss] ${feed.id} — both modern and legacy feeds failed`)
        continue
      }

      const chartEntries = legacyEntries.map((entry, i) => {
        const title = entry['im:name']?.label || 'Unknown'
        const artist = entry['im:artist']?.label || 'Unknown'
        const images = entry['im:image'] || []
        const rawArtwork = images.length > 0 ? images[images.length - 1].label : ''
        const artworkUrl = upgradeArtworkUrl(rawArtwork)
        const genre = entry.category?.attributes?.label || ''
        const songId = entry.id?.label || slugify(title + '-' + artist)
        const appleUrl = entry.link?.attributes?.href || ''

        return {
          id: `apple-chart-${feed.id}-${i}`,
          songId,
          song: {
            id: songId,
            slug: slugify(title + '-' + artist),
            title,
            artistId: slugify(artist),
            artistName: artist,
            artistSlug: slugify(artist),
            albumCoverUrl: artworkUrl,
            durationMs: 0,
            releaseDate: '',
            genres: genre ? [genre] : [],
            popularityScore: Math.max(0, 100 - i),
            appleUrl,
          },
          platform: 'apple' as const,
          region: feed.id as any,
          position: i + 1,
          positionChange: 0,
          isNewEntry: false,
          isReEntry: false,
          streams: undefined,
          peakPosition: i + 1,
          weeksOnChart: 1,
          chartDate: new Date().toISOString().split('T')[0],
          sparklineData: generateSparkline(i + 1),
        }
      })

      await writeKV(env, `charts:apple:${feed.id}`, chartEntries)

      if (feed.id === 'global') {
        const trendingItems = legacyEntries.slice(0, 8).map((entry, i) => {
          const title = entry['im:name']?.label || 'Unknown'
          const artist = entry['im:artist']?.label || 'Unknown'
          const images = entry['im:image'] || []
          const rawArtwork = images.length > 0 ? images[images.length - 1].label : ''
          const artworkUrl = upgradeArtworkUrl(rawArtwork)
          const genre = entry.category?.attributes?.label || ''
          const songId = entry.id?.label || slugify(title + '-' + artist)

          return {
            id: `apple-trend-${i}`,
            rank: i + 1,
            rankChange: 0,
            isNew: i === 0,
            platform: 'apple' as const,
            songId,
            songTitle: title,
            artistName: artist,
            artEmoji: getArtEmoji(genre),
            artGradient: getArtGradient(i),
            albumCoverUrl: artworkUrl,
            metric: Math.max(100000, 10000000 - i * 1000000),
            metricUnit: 'plays',
            badge: (i === 0 ? 'hot' : i < 3 ? 'rising' : null) as any,
            surgePercent: Math.max(10, 100 - i * 10),
            updatedAt: new Date().toISOString(),
          }
        })
        await writeKV(env, 'trending:apple', trendingItems)
      }

      console.log(`[apple-rss] ${feed.id} (legacy) — ${legacyEntries.length} entries written`)
    } catch (err) {
      console.error(`[apple-rss] ${feed.id} error:`, err)
    }
  }
}
