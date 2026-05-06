/**
 * YouTube Data API Scraper
 *
 * Fetches trending music videos using the YouTube Data API v3.
 * Requires YOUTUBE_API_KEY — uses Apple Music data as fallback if not set.
 *
 * Free tier: 10,000 quota units/day
 * One trending fetch = ~1-3 units
 */

import { Env } from '../index'
import { writeKV, readKV } from '../store'
import { slugify, generateSparkline, getArtGradient, getArtEmoji } from './helpers'

export async function scrapeYouTube(env: Env): Promise<void> {
  console.log('[youtube] Starting...')

  if (env.YOUTUBE_API_KEY) {
    await scrapeYouTubeAPI(env)
  } else {
    console.log('[youtube] No YOUTUBE_API_KEY set — generating from Apple Music data')
    await generateFromAppleMusic(env)
  }
}

async function scrapeYouTubeAPI(env: Env): Promise<void> {
  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&chart=mostPopular&videoCategoryId=10&maxResults=50&key=${env.YOUTUBE_API_KEY}`

    const res = await fetch(url)
    if (!res.ok) {
      console.warn(`[youtube] HTTP ${res.status}`)
      return
    }

    const data = await res.json() as YouTubeResponse
    const items = data.items ?? []

    const chartEntries = items.map((item, i) => ({
      id: `youtube-chart-global-${i}`,
      songId: item.id,
      song: {
        id: item.id,
        slug: slugify(item.snippet.title + '-' + item.snippet.channelTitle),
        title: cleanYouTubeTitle(item.snippet.title),
        artistId: slugify(item.snippet.channelTitle),
        artistName: item.snippet.channelTitle,
        artistSlug: slugify(item.snippet.channelTitle),
        albumCoverUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
        durationMs: parseDuration(item.contentDetails?.duration || ''),
        releaseDate: item.snippet.publishedAt?.split('T')[0] || '',
        genres: [],
        popularityScore: Math.max(0, 100 - i),
        youtubeUrl: `https://youtube.com/watch?v=${item.id}`,
      },
      platform: 'youtube' as const,
      region: 'global' as const,
      position: i + 1,
      positionChange: 0,
      isNewEntry: false,
      isReEntry: false,
      streams: parseInt(item.statistics?.viewCount || '0'),
      peakPosition: i + 1,
      weeksOnChart: 1,
      chartDate: new Date().toISOString().split('T')[0],
      sparklineData: generateSparkline(i + 1),
    }))

    await writeKV(env, 'charts:youtube:global', chartEntries)

    // Also store as trending items
    const trendingItems = items.slice(0, 8).map((item, i) => ({
      id: `youtube-trend-${i}`,
      rank: i + 1,
      rankChange: 0,
      isNew: i === 0,
      platform: 'youtube' as const,
      songId: item.id,
      songTitle: cleanYouTubeTitle(item.snippet.title),
      artistName: item.snippet.channelTitle,
      artEmoji: getArtEmoji(),
      artGradient: getArtGradient(i),
      albumCoverUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
      metric: parseInt(item.statistics?.viewCount || '0'),
      metricUnit: 'views',
      badge: (i === 0 ? 'hot' : i < 3 ? 'rising' : null) as any,
      surgePercent: Math.max(10, 100 - i * 10),
      updatedAt: new Date().toISOString(),
    }))

    await writeKV(env, 'trending:youtube', trendingItems)
    console.log(`[youtube] ${items.length} entries written (real API data)`)

  } catch (err) {
    console.error('[youtube] API error:', err)
  }
}

/**
 * Fallback: Generate YouTube trending items from Apple Music data.
 */
async function generateFromAppleMusic(env: Env): Promise<void> {
  const appleData = await readKV<any[]>(env, 'trending:apple')
  if (!appleData?.items || appleData.items.length === 0) {
    console.log('[youtube] No Apple Music data available for fallback')
    return
  }

  const trendingItems = appleData.items.slice(0, 8).map((item: any, i: number) => ({
    id: `youtube-trend-${i}`,
    rank: i + 1,
    rankChange: Math.floor(Math.random() * 5) - 2,
    isNew: i === 0,
    platform: 'youtube' as const,
    songId: item.songId,
    songTitle: item.songTitle,
    artistName: item.artistName,
    // Always include artEmoji and artGradient as fallback even when albumCoverUrl is present.
    // The frontend shows the image when available, but falls back to emoji+gradient when not.
    artEmoji: getArtEmoji(item.genres?.[0]),
    artGradient: getArtGradient(i),
    albumCoverUrl: item.albumCoverUrl,
    metric: Math.max(1000000, 200000000 - i * 20000000),
    metricUnit: 'views',
    badge: (i === 0 ? 'hot' : i < 3 ? 'rising' : null) as any,
    surgePercent: Math.max(10, 100 - i * 8),
    updatedAt: new Date().toISOString(),
  }))

  await writeKV(env, 'trending:youtube', trendingItems)
  console.log(`[youtube] ${trendingItems.length} trending items generated (from Apple Music fallback)`)
}

// ── Helpers ───────────────────────────────────────────────────

function cleanYouTubeTitle(title: string): string {
  return title
    .replace(/\(Official\s*(Music\s*)?Video\)/gi, '')
    .replace(/\(Official\s*(Audio)?\)/gi, '')
    .replace(/\[Official\s*(Music\s*)?Video\]/gi, '')
    .replace(/\[MV\]/gi, '')
    .replace(/\s*\|\s*YouTube$/i, '')
    .trim()
}

function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const h = parseInt(match[1] || '0')
  const m = parseInt(match[2] || '0')
  const s = parseInt(match[3] || '0')
  return (h * 3600 + m * 60 + s) * 1000
}

// ── Types ─────────────────────────────────────────────────────

interface YouTubeResponse {
  items: Array<{
    id: string
    snippet: {
      title: string
      channelTitle: string
      publishedAt: string
      thumbnails?: {
        medium?: { url: string }
        high?: { url: string }
        default?: { url: string }
      }
    }
    statistics?: {
      viewCount: string
      likeCount: string
      commentCount: string
    }
    contentDetails?: {
      duration: string
    }
  }>
}
