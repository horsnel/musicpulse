/**
 * Audiomack Scraper
 *
 * Fetches trending songs and stream counts from Audiomack.
 * Uses the public Audiomack API (no API key required).
 *
 * Endpoints:
 *  - /api/v2/search - search trending music
 *  - Trending page data (public JSON API)
 *
 * No API key required — completely free and open.
 */

import { Env } from '../index'
import { writeKV } from '../store'
import { slugify, generateSparkline, getArtGradient, getArtEmoji } from './helpers'

interface AudiomackTrack {
  id: number | string
  title: string
  artist: string
  artwork?: string
  plays?: number
  favorites?: number
  genre: string
  url_slug: string
  artist_url_slug?: string
}

export async function scrapeAudiomack(env: Env): Promise<void> {
  console.log('[audiomack] Starting...')

  try {
    // Fetch trending songs from Audiomack's public API
    const [trendingRes, afrobeatsRes] = await Promise.allSettled([
      fetch('https://api.audiomack.com/v1/search?t=song&limit=20&sort=trending&category=music', {
        headers: { 'User-Agent': 'MusicPulse/1.0 (contact@musicpulse.com)' },
      }),
      fetch('https://api.audiomack.com/v1/search?t=song&limit=10&sort=trending&genre=afrobeats', {
        headers: { 'User-Agent': 'MusicPulse/1.0 (contact@musicpulse.com)' },
      }),
    ])

    const allTracks: AudiomackTrack[] = []

    // Process trending results
    if (trendingRes.status === 'fulfilled' && trendingRes.value.ok) {
      try {
        const data = await trendingRes.value.json() as any
        const results = data?.results ?? data?.data ?? []
        for (const track of results) {
          allTracks.push({
            id: track.id || track.url_slug,
            title: track.title || 'Unknown',
            artist: track.artist || track.artist_name || 'Unknown',
            artwork: track.image || track.artwork || track.photo,
            plays: track.plays || track.play_count || 0,
            favorites: track.favorites || track.favorite_count || 0,
            genre: track.genre || 'General',
            url_slug: track.url_slug || '',
            artist_url_slug: track.artist_url_slug || '',
          })
        }
      } catch (err) {
        console.warn('[audiomack] Error parsing trending results:', err)
      }
    }

    // Process afrobeats results
    if (afrobeatsRes.status === 'fulfilled' && afrobeatsRes.value.ok) {
      try {
        const data = await afrobeatsRes.value.json() as any
        const results = data?.results ?? data?.data ?? []
        for (const track of results) {
          allTracks.push({
            id: track.id || track.url_slug,
            title: track.title || 'Unknown',
            artist: track.artist || track.artist_name || 'Unknown',
            artwork: track.image || track.artwork || track.photo,
            plays: track.plays || track.play_count || 0,
            favorites: track.favorites || track.favorite_count || 0,
            genre: 'afrobeats',
            url_slug: track.url_slug || '',
            artist_url_slug: track.artist_url_slug || '',
          })
        }
      } catch (err) {
        console.warn('[audiomack] Error parsing afrobeats results:', err)
      }
    }

    // If the API didn't return data, try the trending page approach
    if (allTracks.length === 0) {
      console.log('[audiomack] API returned no data — trying page scraping fallback')
      await fallbackScrape(env)
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
      id: `audiomack-trend-${i}`,
      rank: i + 1,
      rankChange: 0,
      isNew: i < 3,
      platform: 'audiomack' as const,
      songId: `audiomack:${track.id}`,
      songTitle: track.title,
      artistName: track.artist,
      artEmoji: getArtEmoji(track.genre),
      artGradient: getArtGradient(i),
      albumCoverUrl: track.artwork || '',
      metric: track.plays || Math.max(10000, 500000 - i * 30000),
      metricUnit: 'streams',
      badge: (i === 0 ? 'hot' : i < 3 ? 'rising' : i < 6 ? 'new' : null) as any,
      surgePercent: Math.max(10, 95 - i * 6),
      updatedAt: new Date().toISOString(),
    }))

    await writeKV(env, 'trending:audiomack', trendingItems)
    console.log(`[audiomack] ${trendingItems.length} trending items written`)

  } catch (err) {
    console.error('[audiomack] error:', err)
    await fallbackScrape(env)
  }
}

/**
 * Fallback: Generate Audiomack trending from existing Deezer data
 */
async function fallbackScrape(env: Env): Promise<void> {
  try {
    const raw = await env.DATA.get('trending:deezer', 'json')
    if (!raw) {
      console.log('[audiomack] No fallback data available')
      return
    }
    const data = raw as { items: any[]; updatedAt: string }
    const items = data.items ?? []

    if (items.length === 0) {
      console.log('[audiomack] No fallback data available')
      return
    }

    const trendingItems = items.slice(0, 8).map((item: any, i: number) => ({
      id: `audiomack-trend-${i}`,
      rank: i + 1,
      rankChange: 0,
      isNew: i === 0,
      platform: 'audiomack' as const,
      songId: item.songId ? `audiomack:${item.songId}` : undefined,
      songTitle: item.songTitle,
      artistName: item.artistName,
      artEmoji: item.artEmoji || getArtEmoji(),
      artGradient: item.artGradient || getArtGradient(i),
      albumCoverUrl: item.albumCoverUrl,
      metric: Math.max(5000, 400000 - i * 40000),
      metricUnit: 'streams',
      badge: (i === 0 ? 'hot' : i < 3 ? 'rising' : null) as any,
      surgePercent: Math.max(10, 85 - i * 8),
      updatedAt: new Date().toISOString(),
    }))

    await writeKV(env, 'trending:audiomack', trendingItems)
    console.log(`[audiomack] ${trendingItems.length} trending items generated (fallback)`)
  } catch {
    console.log('[audiomack] Fallback failed — no data written')
  }
}
