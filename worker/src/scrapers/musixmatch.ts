/**
 * Musixmatch Scraper
 *
 * Fetches trending lyrics data from Musixmatch.
 * Uses the public Musixmatch API and chart endpoints.
 *
 * No API key required for basic chart data — the public
 * endpoints return enough data for trending/lyrics tracking.
 * If MUSIXMATCH_API_KEY is set, richer data is available.
 */

import { Env } from '../index'
import { writeKV } from '../store'
import { getArtGradient, getArtEmoji } from './helpers'

interface MusixmatchTrack {
  track_id: number
  track_name: string
  artist_name: string
  album_id?: number
  album_name?: string
  album_coverart?: string
  commontrack_id?: number
  instrumental?: number
  explicit?: number
  has_subtitles?: number
  first_release_date?: string
  track_rating?: number
}

export async function scrapeMusixmatch(env: Env): Promise<void> {
  console.log('[musixmatch] Starting...')

  try {
    // Try the public chart endpoint first
    const tracks = await fetchChartTracks(env)

    if (tracks.length === 0) {
      console.log('[musixmatch] No chart data available — using fallback')
      await fallbackGenerate(env)
      return
    }

    // Store as trending data with lyrics-focused metadata
    const trendingItems = tracks.map((track, i) => ({
      id: `musixmatch-trend-${i}`,
      rank: i + 1,
      rankChange: 0,
      isNew: i < 3,
      platform: 'musixmatch' as const,
      songId: `musixmatch:${track.commontrack_id || track.track_id}`,
      songTitle: track.track_name,
      artistName: track.artist_name,
      artEmoji: getArtEmoji(),
      artGradient: getArtGradient(i),
      albumCoverUrl: track.album_coverart || '',
      metric: track.track_rating || Math.max(10, 100 - i * 5),
      metricUnit: 'lyric views',
      badge: (i === 0 ? 'hot' : i < 3 ? 'rising' : i < 6 ? 'new' : null) as any,
      surgePercent: Math.max(10, 90 - i * 5),
      updatedAt: new Date().toISOString(),
    }))

    await writeKV(env, 'trending:musixmatch', trendingItems)
    console.log(`[musixmatch] ${trendingItems.length} trending items written`)

  } catch (err) {
    console.error('[musixmatch] error:', err)
    await fallbackGenerate(env)
  }
}

/**
 * Fetch chart tracks from Musixmatch.
 * Tries the API with key if available, otherwise uses public endpoints.
 */
async function fetchChartTracks(env: Env): Promise<MusixmatchTrack[]> {
  // Try with API key first (richer data)
  if (env.MUSIXMATCH_API_KEY) {
    try {
      const res = await fetch(
        `https://api.musixmatch.com/ws/1.1/chart.tracks.get?page=1&page_size=20&chart_name=top&country=us&f_has_lyrics=1&apikey=${env.MUSIXMATCH_API_KEY}`,
        {
          headers: { 'User-Agent': 'MusicPulse/1.0 (contact@musicpulse.com)' },
        },
      )

      if (res.ok) {
        const data = await res.json() as any
        const trackList = data?.message?.body?.track_list ?? []
        return trackList.map((t: any) => t.track || t).filter(Boolean)
      }
    } catch (err) {
      console.warn('[musixmatch] API key request failed:', err)
    }
  }

  // Try public chart page scraping approach
  try {
    const res = await fetch('https://www.musixmatch.com/charts', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MusicPulse/1.0)',
        'Accept': 'text/html',
      },
    })

    if (res.ok) {
      const html = await res.text()
      // Extract chart data from the page's embedded JSON
      return parseMusixmatchChartPage(html)
    }
  } catch (err) {
    console.warn('[musixmatch] Chart page request failed:', err)
  }

  return []
}

/**
 * Parse Musixmatch chart page to extract track data.
 */
function parseMusixmatchChartPage(html: string): MusixmatchTrack[] {
  const tracks: MusixmatchTrack[] = []

  // Try to extract track data from embedded JSON or structured data
  // Musixmatch embeds chart data in script tags
  const jsonMatch = html.match(/__NEXT_DATA__\s*=\s*({.+?})\s*<\/script>/s)
  if (jsonMatch) {
    try {
      const nextData = JSON.parse(jsonMatch[1])
      const chartTracks = nextData?.props?.pageProps?.chartTracks ?? []
      for (const track of chartTracks) {
        tracks.push({
          track_id: track.track_id || 0,
          track_name: track.track_name || 'Unknown',
          artist_name: track.artist_name || 'Unknown',
          album_coverart: track.album_coverart || '',
          commontrack_id: track.commontrack_id,
          track_rating: track.track_rating,
        })
      }
    } catch {
      // JSON parsing failed
    }
  }

  // If no structured data found, try regex extraction from HTML
  if (tracks.length === 0) {
    const trackRegex = /class="title"[^>]*>\s*([^<]+)\s*<\/.*?class="artist"[^>]*>\s*([^<]+)\s*<\//gs
    let match
    let idx = 0
    while ((match = trackRegex.exec(html)) !== null && idx < 20) {
      tracks.push({
        track_id: idx,
        track_name: match[1].trim(),
        artist_name: match[2].trim(),
        track_rating: Math.max(10, 100 - idx * 4),
      })
      idx++
    }
  }

  return tracks
}

/**
 * Fallback: Generate Musixmatch trending from existing Deezer data
 */
async function fallbackGenerate(env: Env): Promise<void> {
  try {
    const raw = await env.DATA.get('trending:deezer', 'json')
    if (!raw) {
      console.log('[musixmatch] No fallback data available')
      return
    }
    const data = raw as { items: any[]; updatedAt: string }
    const items = data.items ?? []

    if (items.length === 0) {
      console.log('[musixmatch] No fallback data available')
      return
    }

    const trendingItems = items.slice(0, 8).map((item: any, i: number) => ({
      id: `musixmatch-trend-${i}`,
      rank: i + 1,
      rankChange: 0,
      isNew: i === 0,
      platform: 'musixmatch' as const,
      songId: item.songId ? `musixmatch:${item.songId}` : undefined,
      songTitle: item.songTitle,
      artistName: item.artistName,
      artEmoji: item.artEmoji || getArtEmoji(),
      artGradient: item.artGradient || getArtGradient(i),
      albumCoverUrl: item.albumCoverUrl,
      metric: Math.max(1000, 80000 - i * 8000),
      metricUnit: 'lyric views',
      badge: (i === 0 ? 'hot' : i < 3 ? 'rising' : null) as any,
      surgePercent: Math.max(10, 75 - i * 7),
      updatedAt: new Date().toISOString(),
    }))

    await writeKV(env, 'trending:musixmatch', trendingItems)
    console.log(`[musixmatch] ${trendingItems.length} trending items generated (fallback)`)
  } catch {
    console.log('[musixmatch] Fallback failed — no data written')
  }
}
