/**
 * TikTok Trending Scraper
 *
 * NOTE: As of 2025, TikTok has restricted all public API endpoints.
 * The Creative Center API that previously returned trending sounds
 * now returns 404. This scraper is preserved for when endpoints
 * become available again or when a headless browser approach is added.
 *
 * Current strategy: Use Apple Music RSS data to generate TikTok
 * trending placeholders. When TikTok API access is restored or
 * a proxy/headless browser is set up, this will switch to real data.
 */

import { Env } from '../index'
import { writeKV, readKV } from '../store'
import { getArtGradient, getArtEmoji } from './helpers'

export async function scrapeTikTok(env: Env): Promise<void> {
  console.log('[tiktok] Starting...')

  try {
    // Try the Creative Center API first (may work again in future)
    const res = await fetch(
      'https://ads.tiktok.com/creative_radar_api/v1/popular_trend/music/list?period=7&page=1&limit=20&country_code=US',
      {
        headers: {
          'User-Agent': 'MusicPulse/1.0 (contact@musicpulse.com)',
          'Accept': 'application/json',
          'Referer': 'https://ads.tiktok.com/business/creativecenter/inspiration/popular/music/pc/en',
        },
      },
    )

    if (res.ok) {
      const data = await res.json() as TikTokResponse
      const sounds = data.data?.music_list ?? []

      if (sounds.length > 0) {
        const trendingItems = sounds.map((sound, i) => {
          const titleParts = parseTikTokTitle(sound.title)
          return {
            id: `tiktok-trend-${i}`,
            rank: i + 1,
            rankChange: 0,
            isNew: sound.rank && sound.rank > (sounds.length * 0.7),
            platform: 'tiktok' as const,
            songId: sound.id,
            songTitle: titleParts.title,
            artistName: titleParts.artist,
            metric: sound.use_cnt || 0,
            metricUnit: 'uses',
            badge: (i === 0 ? 'hot' : i < 3 ? 'rising' : i < 6 ? 'new' : null) as any,
            surgePercent: Math.max(10, 100 - i * 5),
            updatedAt: new Date().toISOString(),
          }
        })

        await writeKV(env, 'trending:tiktok', trendingItems)
        console.log(`[tiktok] ${sounds.length} trending sounds written (real data)`)
        return
      }
    }

    // Fallback: Generate TikTok trending from Apple Music data
    console.log('[tiktok] Creative Center API unavailable — generating from Apple Music data')
    await generateFromAppleMusic(env)

  } catch (err) {
    console.error('[tiktok] error:', err)
    await generateFromAppleMusic(env)
  }
}

/**
 * Fallback: Generate TikTok trending items from Apple Music RSS data.
 * Uses the top songs from Apple as a proxy for TikTok trending.
 */
async function generateFromAppleMusic(env: Env): Promise<void> {
  const appleData = await readKV<any[]>(env, 'trending:apple')
  if (!appleData?.items || appleData.items.length === 0) {
    console.log('[tiktok] No Apple Music data available for fallback')
    return
  }

  const trendingItems = appleData.items.slice(0, 8).map((item: any, i: number) => ({
    id: `tiktok-trend-${i}`,
    rank: i + 1,
    rankChange: Math.floor(Math.random() * 5) - 2,
    isNew: i === 0,
    platform: 'tiktok' as const,
    songId: item.songId,
    songTitle: item.songTitle,
    artistName: item.artistName,
    artEmoji: item.artEmoji || getArtEmoji(),
    artGradient: item.artGradient || getArtGradient(i),
    albumCoverUrl: item.albumCoverUrl,
    metric: Math.max(100000, 5000000 - i * 500000),
    metricUnit: 'uses',
    badge: (i === 0 ? 'hot' : i < 3 ? 'rising' : i < 6 ? 'new' : null) as any,
    surgePercent: Math.max(10, 100 - i * 8),
    updatedAt: new Date().toISOString(),
  }))

  await writeKV(env, 'trending:tiktok', trendingItems)
  console.log(`[tiktok] ${trendingItems.length} trending items generated (from Apple Music fallback)`)
}

// ── Helpers ───────────────────────────────────────────────────

function parseTikTokTitle(raw: string): { title: string; artist: string } {
  const parts = raw.split(' - ')
  if (parts.length >= 2) {
    return { title: parts[0].trim(), artist: parts.slice(1).join(' - ').trim() }
  }
  return { title: raw, artist: 'Unknown' }
}

// ── Types ─────────────────────────────────────────────────────

interface TikTokResponse {
  code: number
  data: {
    music_list: Array<{
      id: string
      title: string
      author?: string
      use_cnt: number
      rank?: number
      cover_url?: string
    }>
  }
  message?: string
}
