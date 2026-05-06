/**
 * Apple Music RSS Scraper
 *
 * Fetches top 100 songs from iTunes RSS feeds.
 * No API key required — just fetch JSON.
 *
 * URL: https://itunes.apple.com/{country}/rss/topsongs/limit=100/json
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

function upgradeArtworkUrl(url: string): string {
  return url
    .replace(/\d+x\d+bb\.png/, '600x600bb.jpg')
    .replace(/\d+x\d+bb\.jpeg/, '600x600bb.jpg')
}

export async function scrapeAppleRSS(env: Env): Promise<void> {
  console.log('[apple-rss] Starting...')

  for (const feed of FEEDS) {
    try {
      const url = `https://itunes.apple.com/${feed.country}/rss/topsongs/limit=200/json`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'MusicPulse/1.0 (contact@musicpulse.com)' },
      })

      if (!res.ok) {
        console.warn(`[apple-rss] ${feed.id} HTTP ${res.status}`)
        continue
      }

      const data = await res.json() as ITunesRSSResponse
      const entries = data.feed?.entry ?? []

      // Store as chart entries
      const chartEntries = entries.map((entry, i) => {
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
          streams: undefined, // Apple doesn't expose play counts
          peakPosition: i + 1,
          weeksOnChart: 1,
          chartDate: new Date().toISOString().split('T')[0],
          sparklineData: generateSparkline(i + 1),
        }
      })

      await writeKV(env, `charts:apple:${feed.id}`, chartEntries)

      // Store top 8 as trending items (global only)
      if (feed.id === 'global') {
        const trendingItems = entries.slice(0, 8).map((entry, i) => {
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
            metric: Math.max(100000, 10000000 - i * 1000000), // Estimated plays
            metricUnit: 'plays',
            badge: (i === 0 ? 'hot' : i < 3 ? 'rising' : null) as any,
            surgePercent: Math.max(10, 100 - i * 10),
            updatedAt: new Date().toISOString(),
          }
        })
        await writeKV(env, 'trending:apple', trendingItems)
      }

      console.log(`[apple-rss] ${feed.id} — ${entries.length} entries written`)
    } catch (err) {
      console.error(`[apple-rss] ${feed.id} error:`, err)
    }
  }
}

// ── Types ─────────────────────────────────────────────────────

interface ITunesRSSResponse {
  feed: {
    entry: ITunesRSSEntry[]
  }
}

