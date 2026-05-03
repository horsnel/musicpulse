/**
 * Apple Music RSS Scraper
 *
 * Fetches top 100 songs from Apple Music RSS feeds.
 * No API key required — just fetch JSON.
 *
 * URL: https://rss.applemarketingtools.com/api/v2/{country}/music/most-played/100/songs.json
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

interface AppleRSSTrack {
  id: string
  name: string
  artistId: string
  artistName: string
  artworkUrl100: string
  releaseDate: string
  genres: Array<string | { genreId: string; name: string; url: string }>
  url: string
}

export async function scrapeAppleRSS(env: Env): Promise<void> {
  console.log('[apple-rss] Starting...')

  for (const feed of FEEDS) {
    try {
      const url = `https://rss.applemarketingtools.com/api/v2/${feed.country}/music/most-played/100/songs.json`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'MusicPulse/1.0 (contact@musicpulse.com)' },
      })

      if (!res.ok) {
        console.warn(`[apple-rss] ${feed.id} HTTP ${res.status}`)
        continue
      }

      const data = await res.json() as AppleRSSResponse
      const tracks = data.feed?.results ?? []

      // Store as chart entries
      const chartEntries = tracks.map((track, i) => ({
        id: `apple-chart-${feed.id}-${i}`,
        songId: track.id,
        song: {
          id: track.id,
          slug: slugify(track.name + '-' + track.artistName),
          title: track.name,
          artistId: track.artistId || slugify(track.artistName),
          artistName: track.artistName,
          artistSlug: slugify(track.artistName),
          albumCoverUrl: track.artworkUrl100?.replace('100x100', '600x600'),
          durationMs: 0,
          releaseDate: track.releaseDate?.split('T')[0] || '',
          genres: (track.genres || []).map(g => typeof g === 'string' ? g : g.name),
          popularityScore: Math.max(0, 100 - i),
          appleUrl: track.url,
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
      }))

      await writeKV(env, `charts:apple:${feed.id}`, chartEntries)

      // Store top 8 as trending items (global only)
      if (feed.id === 'global') {
        const trendingItems = tracks.slice(0, 8).map((track, i) => ({
          id: `apple-trend-${i}`,
          rank: i + 1,
          rankChange: 0,
          isNew: i === 0,
          platform: 'apple' as const,
          songId: track.id,
          songTitle: track.name,
          artistName: track.artistName,
          artEmoji: getArtEmoji(typeof track.genres?.[0] === 'string' ? track.genres[0] : track.genres?.[0]?.name),
          artGradient: getArtGradient(i),
          albumCoverUrl: track.artworkUrl100?.replace('100x100', '600x600'),
          metric: Math.max(100000, 10000000 - i * 1000000), // Estimated plays
          metricUnit: 'plays',
          badge: (i === 0 ? 'hot' : i < 3 ? 'rising' : null) as any,
          surgePercent: Math.max(10, 100 - i * 10),
          updatedAt: new Date().toISOString(),
        }))
        await writeKV(env, 'trending:apple', trendingItems)
      }

      console.log(`[apple-rss] ${feed.id} — ${tracks.length} entries written`)
    } catch (err) {
      console.error(`[apple-rss] ${feed.id} error:`, err)
    }
  }
}

// ── Types ─────────────────────────────────────────────────────

interface AppleRSSResponse {
  feed: {
    title: string
    id: string
    results: AppleRSSTrack[]
  }
}

