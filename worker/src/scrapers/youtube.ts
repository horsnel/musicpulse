/**
 * YouTube Data API Scraper
 *
 * Fetches trending music videos using the YouTube Data API v3.
 * Requires YOUTUBE_API_KEY — uses Apple Music data as fallback if not set.
 *
 * Free tier: 10,000 quota units/day
 * Chart fetch = ~1-3 units, playlist fetch = ~1-3 units
 *
 * Now fetches both:
 *  1. Trending music videos (chart=mostPopular, videoCategoryId=10)
 *  2. YouTube Music top hits playlist for additional coverage
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
    // ── Fetch 1: Trending Music Videos ──────────────────────
    const trendingUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&chart=mostPopular&videoCategoryId=10&maxResults=50&key=${env.YOUTUBE_API_KEY}`

    const trendingRes = await fetch(trendingUrl)
    if (!trendingRes.ok) {
      console.warn(`[youtube] Trending HTTP ${trendingRes.status}`)
      // Fall back to Apple Music data
      await generateFromAppleMusic(env)
      return
    }

    const trendingData = await trendingRes.json() as YouTubeResponse
    const trendingItems = trendingData.items ?? []

    // ── Fetch 2: YouTube Music Top Hits Playlist ────────────
    // PL4fGSI1pDJn6O1LS0XSdF3RyOxRUKtq2S = YouTube Music Top 100
    let playlistItems: YouTubePlaylistItem[] = []
    try {
      const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=PL4fGSI1pDJn6O1LS0XSdF3RyOxRUKtq2S&maxResults=50&key=${env.YOUTUBE_API_KEY}`
      const playlistRes = await fetch(playlistUrl)
      if (playlistRes.ok) {
        const playlistData = await playlistRes.json() as YouTubePlaylistResponse
        playlistItems = playlistData.items ?? []
        console.log(`[youtube] ${playlistItems.length} playlist items fetched`)
      }
    } catch (err) {
      console.warn('[youtube] Playlist fetch failed, using trending only:', err)
    }

    // ── Merge and deduplicate ───────────────────────────────
    const seenIds = new Set<string>()
    const allItems: YouTubeVideoItem[] = []

    // Add trending items first (higher priority)
    for (const item of trendingItems) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id)
        allItems.push({
          id: item.id,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          thumbnails: item.snippet.thumbnails,
          viewCount: item.statistics?.viewCount || '0',
          likeCount: item.statistics?.likeCount || '0',
          commentCount: item.statistics?.commentCount || '0',
          duration: item.contentDetails?.duration || '',
        })
      }
    }

    // Fetch video details for playlist items
    if (playlistItems.length > 0) {
      const playlistVideoIds = playlistItems
        .map(pi => pi.contentDetails?.videoId)
        .filter((id): id is string => !!id && !seenIds.has(id))
        .slice(0, 50) // Max 50 per details request

      if (playlistVideoIds.length > 0) {
        try {
          const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${playlistVideoIds.join(',')}&key=${env.YOUTUBE_API_KEY}`
          const detailsRes = await fetch(detailsUrl)
          if (detailsRes.ok) {
            const detailsData = await detailsRes.json() as YouTubeResponse
            for (const item of detailsData.items ?? []) {
              if (!seenIds.has(item.id)) {
                seenIds.add(item.id)
                allItems.push({
                  id: item.id,
                  title: item.snippet.title,
                  channelTitle: item.snippet.channelTitle,
                  publishedAt: item.snippet.publishedAt,
                  thumbnails: item.snippet.thumbnails,
                  viewCount: item.statistics?.viewCount || '0',
                  likeCount: item.statistics?.likeCount || '0',
                  commentCount: item.statistics?.commentCount || '0',
                  duration: item.contentDetails?.duration || '',
                })
              }
            }
          }
        } catch (err) {
          console.warn('[youtube] Playlist video details fetch failed:', err)
        }
      }
    }

    console.log(`[youtube] ${allItems.length} total unique videos (trending: ${trendingItems.length}, playlist: ${seenIds.size - trendingItems.length})`)

    // ── Generate chart entries ──────────────────────────────
    const chartEntries = allItems.map((item, i) => ({
      id: `youtube-chart-global-${i}`,
      songId: item.id,
      song: {
        id: item.id,
        slug: slugify(item.title + '-' + item.channelTitle),
        title: cleanYouTubeTitle(item.title),
        artistId: slugify(item.channelTitle),
        artistName: item.channelTitle,
        artistSlug: slugify(item.channelTitle),
        albumCoverUrl: item.thumbnails?.high?.url || item.thumbnails?.medium?.url,
        durationMs: parseDuration(item.duration),
        releaseDate: item.publishedAt?.split('T')[0] || '',
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
      streams: parseInt(item.viewCount || '0'),
      peakPosition: i + 1,
      weeksOnChart: 1,
      chartDate: new Date().toISOString().split('T')[0],
      sparklineData: generateSparkline(i + 1),
    }))

    await writeKV(env, 'charts:youtube:global', chartEntries)

    // ── Generate trending items (top 10) ────────────────────
    const trendingOutput = allItems.slice(0, 10).map((item, i) => ({
      id: `youtube-trend-${i}`,
      rank: i + 1,
      rankChange: 0,
      isNew: i === 0,
      platform: 'youtube' as const,
      songId: item.id,
      songTitle: cleanYouTubeTitle(item.title),
      artistName: item.channelTitle,
      artEmoji: getArtEmoji(),
      artGradient: getArtGradient(i),
      albumCoverUrl: item.thumbnails?.high?.url || item.thumbnails?.medium?.url,
      metric: parseInt(item.viewCount || '0'),
      metricUnit: 'views',
      badge: (i === 0 ? 'hot' : i < 3 ? 'rising' : i < 5 ? 'new' : null) as any,
      surgePercent: Math.max(10, 100 - i * 9),
      updatedAt: new Date().toISOString(),
    }))

    await writeKV(env, 'trending:youtube', trendingOutput)
    console.log(`[youtube] ${chartEntries.length} chart entries + ${trendingOutput.length} trending items written (real API data)`)

  } catch (err) {
    console.error('[youtube] API error:', err)
    // Fallback to Apple Music data on error
    await generateFromAppleMusic(env)
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
    .replace(/\(Lyrics?\)/gi, '')
    .replace(/\[Official\s*(Music\s*)?Video\]/gi, '')
    .replace(/\[MV\]/gi, '')
    .replace(/\[Lyrics?\]/gi, '')
    .replace(/\s*\|\s*YouTube$/i, '')
    .replace(/\s*feat\.\s*/gi, ' ft. ')
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

interface YouTubeVideoItem {
  id: string
  title: string
  channelTitle: string
  publishedAt: string
  thumbnails?: {
    medium?: { url: string }
    high?: { url: string }
    default?: { url: string }
  }
  viewCount: string
  likeCount: string
  commentCount: string
  duration: string
}

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

interface YouTubePlaylistItem {
  contentDetails?: {
    videoId: string
  }
  snippet?: {
    title: string
  }
}

interface YouTubePlaylistResponse {
  items: YouTubePlaylistItem[]
}
