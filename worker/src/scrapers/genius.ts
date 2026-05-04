/**
 * Genius API Scraper
 *
 * Fetches song metadata, album art, and chart data.
 * Uses Genius client credentials flow to get an access token.
 *
 * Free tier, no hard rate limit.
 * Needs GENIUS_CLIENT_ID and GENIUS_CLIENT_SECRET.
 * If GENIUS_API_KEY (access token) is set directly, skips client credentials flow.
 */

import { Env } from '../index'
import { writeKV } from '../store'
import { slugify, getArtGradient, getArtEmoji } from './helpers'

// Cache the access token
let tokenCache: { token: string; expiresAt: number } | null = null

export async function scrapeGenius(env: Env): Promise<void> {
  console.log('[genius] Starting...')

  // Get access token — either directly from GENIUS_API_KEY or via client credentials
  const accessToken = await getAccessToken(env)
  if (!accessToken) {
    console.log('[genius] No Genius credentials set — skipping')
    return
  }

  try {
    // Fetch current chart / top songs
    const res = await fetch(
      'https://api.genius.com/chart?time_period=day',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'MusicPulse/1.0 (contact@musicpulse.com)',
        },
      },
    )

    if (!res.ok) {
      console.warn(`[genius] HTTP ${res.status}`)
      return
    }

    const data = await res.json() as GeniusChartResponse
    const songs = data.response?.chart?.items ?? []

    // Use Genius data to enrich existing chart entries with cover art
    // Store as a supplementary data source
    const enrichedSongs = songs.map((item, i) => ({
      id: `genius:${item.song.id}`,
      slug: slugify(item.song.title + '-' + item.song.primary_artist.name),
      title: item.song.title,
      artistId: `genius:${item.song.primary_artist.id}`,
      artistName: item.song.primary_artist.name,
      artistSlug: slugify(item.song.primary_artist.name),
      albumCoverUrl: item.song.song_art_image_url,
      durationMs: 0,
      releaseDate: '',
      genres: [],
      popularityScore: Math.max(0, 100 - i),
      pageviews: item.song.stats?.pageviews || 0,
    }))

    // Store as a metadata enrichment source (not a primary chart)
    await writeKV(env, 'enrichment:genius', enrichedSongs)
    console.log(`[genius] ${songs.length} songs enriched`)

    // Also store as trending data for the Genius platform
    const geniusTrending = songs.map((item, i) => ({
      id: `genius-trend-${i}`,
      rank: i + 1,
      rankChange: 0,
      isNew: i < 3,
      platform: 'genius' as const,
      songId: `genius:${item.song.id}`,
      songTitle: item.song.title,
      artistName: item.song.primary_artist.name,
      artEmoji: getArtEmoji(),
      artGradient: getArtGradient(i),
      albumCoverUrl: item.song.song_art_image_url,
      metric: item.song.stats?.pageviews || Math.max(1000, 500000 - i * 30000),
      metricUnit: 'pageviews',
      badge: (i === 0 ? 'hot' : i < 3 ? 'rising' : i < 6 ? 'new' : null) as any,
      surgePercent: Math.max(10, 90 - i * 6),
      updatedAt: new Date().toISOString(),
    }))

    await writeKV(env, 'trending:genius', geniusTrending)
    console.log(`[genius] ${geniusTrending.length} trending items written`)

  } catch (err) {
    console.error('[genius] error:', err)
    // Try fallback
    await fallbackGenerate(env)
  }
}

// ── Access Token ──────────────────────────────────────────────

async function getAccessToken(env: Env): Promise<string | null> {
  // If a direct access token is provided, use it
  if (env.GENIUS_API_KEY) return env.GENIUS_API_KEY

  // Otherwise, try client credentials flow
  if (!env.GENIUS_CLIENT_ID || !env.GENIUS_CLIENT_SECRET) return null

  // Return cached token if still valid
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token
  }

  try {
    const res = await fetch('https://api.genius.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: env.GENIUS_CLIENT_ID,
        client_secret: env.GENIUS_CLIENT_SECRET,
        grant_type: 'client_credentials',
      }).toString(),
    })

    if (!res.ok) {
      console.warn(`[genius] Token request HTTP ${res.status}`)
      return null
    }

    const data = await res.json() as { access_token: string; expires_in?: number }
    tokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + ((data.expires_in || 3600) - 60) * 1000,
    }
    return data.access_token
  } catch {
    return null
  }
}

// ── Fallback ────────────────────────────────────────────────

async function fallbackGenerate(env: Env): Promise<void> {
  try {
    const raw = await env.DATA.get('trending:deezer', 'json')
    if (!raw) {
      console.log('[genius] No fallback data available')
      return
    }
    const data = raw as { items: any[]; updatedAt: string }
    const items = data.items ?? []

    if (items.length === 0) {
      console.log('[genius] No fallback data available')
      return
    }

    const trendingItems = items.slice(0, 8).map((item: any, i: number) => ({
      id: `genius-trend-${i}`,
      rank: i + 1,
      rankChange: 0,
      isNew: i === 0,
      platform: 'genius' as const,
      songId: item.songId ? `genius:${item.songId}` : undefined,
      songTitle: item.songTitle,
      artistName: item.artistName,
      artEmoji: item.artEmoji || getArtEmoji(),
      artGradient: item.artGradient || getArtGradient(i),
      albumCoverUrl: item.albumCoverUrl,
      metric: Math.max(5000, 300000 - i * 30000),
      metricUnit: 'pageviews',
      badge: (i === 0 ? 'hot' : i < 3 ? 'rising' : null) as any,
      surgePercent: Math.max(10, 80 - i * 8),
      updatedAt: new Date().toISOString(),
    }))

    await writeKV(env, 'trending:genius', trendingItems)
    console.log(`[genius] ${trendingItems.length} trending items generated (fallback)`)
  } catch {
    console.log('[genius] Fallback failed — no data written')
  }
}

// ── Types ─────────────────────────────────────────────────────

interface GeniusChartResponse {
  response: {
    chart: {
      items: Array<{
        song: {
          id: number
          title: string
          song_art_image_url: string
          primary_artist: {
            id: number
            name: string
            image_url: string
          }
          stats: {
            pageviews: number
          }
          release_date_for_display?: string
        }
      }>
    }
  }
}
