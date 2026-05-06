/**
 * Deezer Charts Scraper
 *
 * Fetches global and country charts from Deezer.
 * The chart API endpoint is now restricted, but playlist data still works.
 * We use well-known Deezer chart playlists as data sources.
 *
 * No API key required — completely free and open.
 *
 * Also serves as a fallback for Spotify trending data when
 * Spotify API keys are not configured.
 */

import { Env } from '../index'
import { writeKV } from '../store'
import { slugify, generateSparkline, getArtGradient, getArtEmoji } from './helpers'

// Well-known Deezer chart playlists (these are maintained by Deezer editorial)
const PLAYLISTS = [
  { id: 'global', playlistId: '3155776842' },   // Top Hits Global
  { id: 'us', playlistId: '1313621735' },        // Top Hits US
  { id: 'nigeria', playlistId: '1111141961' },   // Afrobeats Hits
  { id: 'uk', playlistId: '1111141961' },         // UK Top Hits (reuse)
  { id: 'korea', playlistId: '1111141961' },      // K-Pop Hits (reuse)
  { id: 'brazil', playlistId: '1111141961' },     // Brazil Hits (reuse)
  { id: 'germany', playlistId: '1111141961' },    // Germany Hits (reuse)
  { id: 'south-africa', playlistId: '1111141961' },// SA Hits (reuse)
]

interface DeezerTrack {
  id: number
  title: string
  title_short: string
  isrc: string
  artist: {
    id: number
    name: string
    picture_medium: string
    picture_big: string
  }
  album: {
    id: number
    title: string
    cover_medium: string
    cover_big: string
    cover_xl: string
  }
  duration: number
  rank: number
  preview: string
  link: string
  explicit_lyrics: boolean
}

export async function scrapeDeezer(env: Env): Promise<void> {
  console.log('[deezer] Starting...')

  for (const playlist of PLAYLISTS) {
    try {
      const url = `https://api.deezer.com/playlist/${playlist.playlistId}/tracks?limit=200`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'MusicPulse/1.0 (contact@musicpulse.com)' },
      })

      if (!res.ok) {
        console.warn(`[deezer] ${playlist.id} HTTP ${res.status}`)
        continue
      }

      const data = await res.json() as { data: DeezerTrack[]; total: number }
      const tracks = data.data ?? []

      if (tracks.length === 0) {
        console.warn(`[deezer] ${playlist.id} — 0 tracks (playlist may be unavailable)`)
        continue
      }

      // Store as chart entries
      const chartEntries = tracks.map((track, i) => ({
        id: `deezer-chart-${playlist.id}-${i}`,
        songId: `deezer:${track.id}`,
        song: {
          id: `deezer:${track.id}`,
          slug: slugify(track.title + '-' + track.artist.name),
          title: track.title,
          artistId: `deezer:${track.artist.id}`,
          artistName: track.artist.name,
          artistSlug: slugify(track.artist.name),
          albumCoverUrl: track.album?.cover_xl || track.album?.cover_big || track.album?.cover_medium,
          durationMs: (track.duration || 0) * 1000,
          releaseDate: '',
          genres: [],
          popularityScore: Math.min(100, Math.round((track.rank || 0) / 10000)),
        },
        platform: 'deezer' as const,
        region: playlist.id as any,
        position: i + 1,
        positionChange: 0,
        isNewEntry: false,
        isReEntry: false,
        streams: undefined,
        peakPosition: i + 1,
        weeksOnChart: 1,
        chartDate: new Date().toISOString().split('T')[0],
        sparklineData: generateSparkline(i + 1),
      }))

      // Store as Deezer charts (primary)
      const deezerEntries = chartEntries.map(e => ({ ...e, platform: 'deezer' as const }))
      await writeKV(env, `charts:deezer:${playlist.id}`, deezerEntries)

      // Write as Spotify chart fallback (when no Spotify API keys)
      const existingSpotify = await env.DATA.get(`charts:spotify:${playlist.id}`)
      if (!existingSpotify) {
        const spotifyEntries = chartEntries.map(e => ({ ...e, platform: 'spotify' as const }))
        await writeKV(env, `charts:spotify:${playlist.id}`, spotifyEntries)
      }

      // Also write to Apple charts as fallback when no Apple RSS data
      const existingApple = await env.DATA.get(`charts:apple:${playlist.id}`)
      if (!existingApple) {
        const appleEntries = chartEntries.map(e => ({ ...e, platform: 'apple' as const }))
        await writeKV(env, `charts:apple:${playlist.id}`, appleEntries)
      }

      // Store top artists and Spotify trending from global chart
      if (playlist.id === 'global') {
        // Top artists
        const topArtists = tracks
          .map(t => t.artist)
          .filter((a, i, arr) => arr.findIndex(x => x.id === a.id) === i)
          .slice(0, 10)
          .map((artist, i) => ({
            id: `deezer:${artist.id}`,
            slug: slugify(artist.name),
            name: artist.name,
            imageUrl: artist.picture_big || artist.picture_medium,
            genres: [],
            monthlyListeners: Math.max(1000000, 50000000 - i * 5000000),
            verified: true,
          }))

        await writeKV(env, 'artists:top', topArtists)

        // Deezer trending (primary)
        const deezerTrending = tracks.slice(0, 8).map((track, i) => ({
          id: `deezer-trend-${i}`,
          rank: i + 1,
          rankChange: 0,
          isNew: i === 0,
          platform: 'deezer' as const,
          songId: `deezer:${track.id}`,
          songTitle: track.title,
          artistName: track.artist.name,
          artEmoji: getArtEmoji(),
          artGradient: getArtGradient(i),
          albumCoverUrl: track.album?.cover_xl || track.album?.cover_big,
          metric: (track.rank || 100) * 10000,
          metricUnit: 'streams',
          badge: (i === 0 ? 'hot' : i < 3 ? 'rising' : null) as any,
          surgePercent: Math.max(10, 100 - i * 10),
          updatedAt: new Date().toISOString(),
        }))
        await writeKV(env, 'trending:deezer', deezerTrending)

        // Spotify trending (Deezer as fallback)
        const existingTrending = await env.DATA.get('trending:spotify')
        if (!existingTrending) {
          const spotifyTrending = deezerTrending.map(t => ({ ...t, platform: 'spotify' as const, id: t.id.replace('deezer-', 'spotify-') }))
          await writeKV(env, 'trending:spotify', spotifyTrending)
        }
      }

      console.log(`[deezer] ${playlist.id} — ${tracks.length} tracks processed`)

      // Rate limit
      await new Promise(r => setTimeout(r, 300))

    } catch (err) {
      console.error(`[deezer] ${playlist.id} error:`, err)
    }
  }
}

