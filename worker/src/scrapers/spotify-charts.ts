/**
 * Spotify Charts Scraper
 *
 * Two strategies:
 *  1. If SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET are set:
 *     Use Spotify Web API to fetch Top 50 Global / Viral 50 playlists
 *     (Returns: track name, artist, album art, popularity, Spotify URL)
 *  2. If no keys: Skip — Deezer provides equivalent chart data without keys
 *
 * Known Spotify playlist IDs:
 *  - Top 50 Global:     37i9dQZEVXbMDoHDwVN2tF
 *  - Viral 50 Global:   37i9dQZEVXbLiRSasKsNU9
 *  - Top 50 US:         37i9dQZEVXbLRQDuF5jeBp
 *  - Top 50 Nigeria:    37i9dQZEVXbLwmG8IO00pS
 *  - Top 50 UK:         37i9dQZEVXbMnZEZsC0s9Z
 *  - Top 50 South Korea:37i9dQZEVXbNxXF4SkHj9F
 *  - Top 50 Brazil:     37i9dQZEVXbJk0yVmaxlEl
 *  - Top 50 Germany:    37i9dQZEVXbMhFUf5mRJgL
 *  - Top 50 South Africa:37i9dQZEVXbK9Bz7G5K8Oi
 */

import { Env } from '../index'
import { writeKV } from '../store'

const PLAYLISTS = [
  { id: 'global', name: 'Global', playlistId: '37i9dQZEVXbMDoHDwVN2tF' },
  { id: 'us', name: 'United States', playlistId: '37i9dQZEVXbLRQDuF5jeBp' },
  { id: 'nigeria', name: 'Nigeria', playlistId: '37i9dQZEVXbLwmG8IO00pS' },
  { id: 'uk', name: 'United Kingdom', playlistId: '37i9dQZEVXbMnZEZsC0s9Z' },
  { id: 'korea', name: 'South Korea', playlistId: '37i9dQZEVXbNxXF4SkHj9F' },
  { id: 'brazil', name: 'Brazil', playlistId: '37i9dQZEVXbJk0yVmaxlEl' },
  { id: 'germany', name: 'Germany', playlistId: '37i9dQZEVXbMhFUf5mRJgL' },
  { id: 'south-africa', name: 'South Africa', playlistId: '37i9dQZEVXbK9Bz7G5K8Oi' },
]

// Cache the access token
let tokenCache: { token: string; expiresAt: number } | null = null

export async function scrapeSpotifyCharts(env: Env): Promise<void> {
  console.log('[spotify-charts] Starting...')

  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET) {
    console.log('[spotify-charts] No Spotify credentials set — skipping (Deezer provides chart data without keys)')
    return
  }

  try {
    // Get access token via client_credentials flow
    const token = await getAccessToken(env)
    if (!token) {
      console.warn('[spotify-charts] Failed to get access token')
      return
    }

    for (const playlist of PLAYLISTS) {
      try {
        const url = `https://api.spotify.com/v1/playlists/${playlist.playlistId}?fields=tracks.items(track(id,name,artists(name,id),album(name,images),duration_ms,popularity,external_urls,preview_url))&limit=100`
        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'MusicPulse/1.0 (contact@musicpulse.com)',
          },
        })

        if (!res.ok) {
          console.warn(`[spotify-charts] ${playlist.id} HTTP ${res.status}`)
          continue
        }

        const data = await res.json() as SpotifyPlaylistResponse
        const tracks = data.tracks?.items ?? []

        const chartEntries = tracks
          .filter(item => item.track)
          .map((item, i) => {
            const track = item.track!
            const artist = track.artists?.[0]
            const albumImage = track.album?.images?.[0]

            return {
              id: `spotify-chart-${playlist.id}-${i}`,
              songId: track.id,
              song: {
                id: track.id,
                slug: slugify(track.name + '-' + (artist?.name || '')),
                title: track.name,
                artistId: artist?.id || slugify(artist?.name || ''),
                artistName: track.artists?.map(a => a.name).join(', ') || '',
                artistSlug: slugify(artist?.name || ''),
                albumTitle: track.album?.name,
                albumCoverUrl: albumImage?.url,
                durationMs: track.duration_ms || 0,
                releaseDate: '',
                genres: [],
                popularityScore: track.popularity || 0,
                spotifyUrl: track.external_urls?.spotify,
              },
              platform: 'spotify' as const,
              region: playlist.id as any,
              position: i + 1,
              positionChange: 0,
              isNewEntry: false,
              isReEntry: false,
              streams: undefined, // Spotify API doesn't provide stream counts in playlist endpoint
              peakPosition: i + 1,
              weeksOnChart: 1,
              chartDate: new Date().toISOString().split('T')[0],
              sparklineData: generateSparkline(i + 1),
            }
          })

        await writeKV(env, `charts:spotify:${playlist.id}`, chartEntries)

        // Store top 8 as trending items (global only)
        if (playlist.id === 'global') {
          const trendingItems = tracks
            .filter(item => item.track)
            .slice(0, 8)
            .map((item, i) => {
              const track = item.track!
              const albumImage = track.album?.images?.[0]
              return {
                id: `spotify-trend-${i}`,
                rank: i + 1,
                rankChange: 0,
                isNew: i === 0,
                platform: 'spotify' as const,
                songId: track.id,
                songTitle: track.name,
                artistName: track.artists?.map(a => a.name).join(', ') || '',
                metric: (track.popularity || 50) * 100000, // Estimated from popularity
                metricUnit: 'streams',
                badge: (i === 0 ? 'hot' : i < 3 ? 'rising' : null) as any,
                surgePercent: Math.max(10, 100 - i * 10),
                updatedAt: new Date().toISOString(),
              }
            })

          await writeKV(env, 'trending:spotify', trendingItems)
        }

        console.log(`[spotify-charts] ${playlist.id} — ${tracks.length} entries written`)

        // Rate limit: respect Spotify's rate limits
        await new Promise(r => setTimeout(r, 500))

      } catch (err) {
        console.error(`[spotify-charts] ${playlist.id} error:`, err)
      }
    }

  } catch (err) {
    console.error('[spotify-charts] error:', err)
  }
}

// ── Access Token ──────────────────────────────────────────────

async function getAccessToken(env: Env): Promise<string | null> {
  // Return cached token if still valid
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token
  }

  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`),
      },
      body: 'grant_type=client_credentials',
    })

    if (!res.ok) return null

    const data = await res.json() as { access_token: string; expires_in: number }
    tokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 60) * 1000, // Refresh 1 min early
    }
    return data.access_token
  } catch {
    return null
  }
}

// ── Helpers ───────────────────────────────────────────────────

function slugify(str: string): string {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function generateSparkline(rank: number): number[] {
  const base = Math.max(1, 101 - rank)
  return Array.from({ length: 7 }, (_, i) =>
    Math.max(1, base - Math.floor(Math.random() * 20) + i * 2)
  )
}

// ── Types ─────────────────────────────────────────────────────

interface SpotifyPlaylistResponse {
  tracks: {
    items: Array<{
      track: {
        id: string
        name: string
        artists: Array<{ id: string; name: string }>
        album: {
          name: string
          images: Array<{ url: string; width: number; height: number }>
        }
        duration_ms: number
        popularity: number
        external_urls: { spotify: string }
        preview_url: string | null
      } | null
    }>
  }
}
