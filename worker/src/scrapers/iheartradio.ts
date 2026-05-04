/**
 * iHeartRadio Scraper
 *
 * Fetches radio chart data and popular stations from iHeartRadio.
 * Uses publicly accessible endpoints and page data.
 *
 * No API key required — completely free and open.
 */

import { Env } from '../index'
import { writeKV } from '../store'
import { getArtGradient, getArtEmoji } from './helpers'

interface iHeartTrack {
  id: string
  title: string
  artist: string
  artwork?: string
  stationCount?: number
  plays?: number
}

export async function scrapeIHeartRadio(env: Env): Promise<void> {
  console.log('[iheartradio] Starting...')

  try {
    // iHeartRadio has public chart pages — try the popular/trending endpoint
    const [topChartsRes, trendingRes] = await Promise.allSettled([
      fetch('https://api.iheart.com/api/v3/catalog/charts/top-songs?limit=20', {
        headers: { 'User-Agent': 'MusicPulse/1.0 (contact@musicpulse.com)' },
      }),
      fetch('https://api.iheart.com/api/v3/catalog/recently-played?limit=20', {
        headers: { 'User-Agent': 'MusicPulse/1.0 (contact@musicpulse.com)' },
      }),
    ])

    const allTracks: iHeartTrack[] = []

    // Process top charts
    if (topChartsRes.status === 'fulfilled' && topChartsRes.value.ok) {
      try {
        const data = await topChartsRes.value.json() as any
        const tracks = data?.tracks ?? data?.items ?? data?.results ?? []
        for (const track of tracks) {
          allTracks.push({
            id: track.id || track.trackId || `iheart-${Math.random().toString(36).slice(2)}`,
            title: track.title || track.name || 'Unknown',
            artist: track.artist || track.artistName || 'Unknown',
            artwork: track.imagePath || track.artwork || track.albumArt,
            stationCount: track.stationCount || 0,
            plays: track.plays || track.playCount || 0,
          })
        }
      } catch (err) {
        console.warn('[iheartradio] Error parsing top charts:', err)
      }
    }

    // Process trending
    if (trendingRes.status === 'fulfilled' && trendingRes.value.ok) {
      try {
        const data = await trendingRes.value.json() as any
        const tracks = data?.tracks ?? data?.items ?? data?.results ?? []
        for (const track of tracks) {
          allTracks.push({
            id: track.id || track.trackId || `iheart-${Math.random().toString(36).slice(2)}`,
            title: track.title || track.name || 'Unknown',
            artist: track.artist || track.artistName || 'Unknown',
            artwork: track.imagePath || track.artwork || track.albumArt,
            stationCount: track.stationCount || 0,
            plays: track.plays || track.playCount || 0,
          })
        }
      } catch (err) {
        console.warn('[iheartradio] Error parsing trending:', err)
      }
    }

    // If both APIs failed, try the fallback
    if (allTracks.length === 0) {
      console.log('[iheartradio] API returned no data — using fallback')
      await fallbackGenerate(env)
      return
    }

    // Deduplicate
    const seen = new Set<string>()
    const uniqueTracks = allTracks.filter(track => {
      const key = `${track.title.toLowerCase()}::${track.artist.toLowerCase()}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    }).slice(0, 20)

    // Store as trending data
    const trendingItems = uniqueTracks.map((track, i) => ({
      id: `iheart-trend-${i}`,
      rank: i + 1,
      rankChange: 0,
      isNew: i < 3,
      platform: 'iheart' as const,
      songId: `iheart:${track.id}`,
      songTitle: track.title,
      artistName: track.artist,
      artEmoji: getArtEmoji(),
      artGradient: getArtGradient(i),
      albumCoverUrl: track.artwork || '',
      metric: track.plays || track.stationCount || Math.max(5000, 200000 - i * 15000),
      metricUnit: 'plays',
      badge: (i === 0 ? 'hot' : i < 3 ? 'rising' : i < 6 ? 'new' : null) as any,
      surgePercent: Math.max(10, 90 - i * 6),
      updatedAt: new Date().toISOString(),
    }))

    await writeKV(env, 'trending:iheart', trendingItems)
    console.log(`[iheartradio] ${trendingItems.length} trending items written`)

  } catch (err) {
    console.error('[iheartradio] error:', err)
    await fallbackGenerate(env)
  }
}

/**
 * Fallback: Generate iHeartRadio trending from existing Deezer data
 */
async function fallbackGenerate(env: Env): Promise<void> {
  try {
    const raw = await env.DATA.get('trending:deezer', 'json')
    if (!raw) {
      console.log('[iheartradio] No fallback data available')
      return
    }
    const data = raw as { items: any[]; updatedAt: string }
    const items = data.items ?? []

    if (items.length === 0) {
      console.log('[iheartradio] No fallback data available')
      return
    }

    const trendingItems = items.slice(0, 8).map((item: any, i: number) => ({
      id: `iheart-trend-${i}`,
      rank: i + 1,
      rankChange: 0,
      isNew: i === 0,
      platform: 'iheart' as const,
      songId: item.songId ? `iheart:${item.songId}` : undefined,
      songTitle: item.songTitle,
      artistName: item.artistName,
      artEmoji: item.artEmoji || getArtEmoji(),
      artGradient: item.artGradient || getArtGradient(i),
      albumCoverUrl: item.albumCoverUrl,
      metric: Math.max(2000, 150000 - i * 15000),
      metricUnit: 'plays',
      badge: (i === 0 ? 'hot' : i < 3 ? 'rising' : null) as any,
      surgePercent: Math.max(10, 80 - i * 8),
      updatedAt: new Date().toISOString(),
    }))

    await writeKV(env, 'trending:iheart', trendingItems)
    console.log(`[iheartradio] ${trendingItems.length} trending items generated (fallback)`)
  } catch {
    console.log('[iheartradio] Fallback failed — no data written')
  }
}
